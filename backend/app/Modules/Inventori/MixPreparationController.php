<?php

namespace App\Modules\Inventori;

use App\Http\Controllers\Controller;
use App\Models\ItemLokasi;
use App\Models\Lokasi;
use App\Models\Material; 
use App\Models\MixPreparation;
use App\Models\Produk;
use App\Support\ProdukStockMovement;
use App\Support\StockDivision;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class MixPreparationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MixPreparation::with(['lokasi', 'outputMaterial', 'outputProduk', 'user'])
            ->orderBy('tanggal', 'desc')
            ->orderBy('id', 'desc');

        if ($request->has('lokasi_id') && $request->lokasi_id) {
            $query->where('lokasi_id', $request->lokasi_id);
        }

        if ($request->has('date_from') && $request->date_from) {
            $from = Carbon::parse($request->date_from)->startOfDay();
            $query->where('tanggal', '>=', $from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $to = Carbon::parse($request->date_to)->endOfDay();
            $query->where('tanggal', '<=', $to);
        }

        if ($request->filled('stock_division') && StockDivision::isValidDivision($request->stock_division)) {
            if ($request->stock_division === StockDivision::PASTRY) {
                $query->where('output_type', 'produk');
            } else {
                $query->where('output_type', 'material');
            }
        }

        $data = $query->get();

        return response()->json(['data' => $data]);
    }

    public function show(int $id): JsonResponse
    {
        $mp = MixPreparation::with(['lokasi', 'outputMaterial', 'outputProduk', 'user'])->findOrFail($id);
        $items = ItemLokasi::with(['material', 'user'])
            ->where('reference_type', MixPreparation::class)
            ->where('reference_id', $mp->id)
            ->orderBy('tanggal', 'asc')
            ->get();

        return response()->json(['data' => ['header' => $mp, 'items' => $items]]);
    }

    public function create(Request $request): JsonResponse
    {
        $isPastry = $request->filled('output_produk_id');

        $validated = $request->validate([
            'lokasi_id' => 'required|exists:lokasi,id',
            'output_material_id' => [
                Rule::requiredIf(!$isPastry),
                'nullable',
                'exists:material,id',
            ],
            'output_produk_id' => [
                Rule::requiredIf($isPastry),
                'nullable',
                'exists:produk,id',
            ],
            'output_quantity' => 'required|integer|min:1',
            'inputs' => 'required|array|min:1',
            'inputs.*.material_id' => 'required|exists:material,id',
            'inputs.*.quantity' => 'required|integer|min:1',
            'keterangan' => 'nullable|string',
        ]);

        if ($isPastry && !empty($validated['output_material_id'])) {
            return response()->json(['message' => 'Mix pastry tidak boleh memakai output material'], 422);
        }

        if (!$isPastry && !empty($validated['output_produk_id'])) {
            return response()->json(['message' => 'Mix minuman tidak boleh memakai output produk'], 422);
        }

        $lokasi = Lokasi::findOrFail($validated['lokasi_id']);
        if ($lokasi->tipe !== 'toko') {
            return response()->json([
                'message' => 'Mix Preparation hanya untuk lokasi non gudang',
            ], 422);
        }

        $expectedDivision = $isPastry ? StockDivision::PASTRY : StockDivision::MINUMAN;

        if (!$isPastry && !Material::belongsToStockDivision($validated['output_material_id'], $expectedDivision)) {
            return response()->json(['message' => 'Material hasil harus sesuai divisi minuman'], 422);
        }

        if ($isPastry) {
            $produk = Produk::findOrFail($validated['output_produk_id']);
            if (!Produk::belongsToStockDivision($validated['output_produk_id'], StockDivision::PASTRY)) {
                return response()->json(['message' => 'Produk hasil harus kategori Pastry atau Cake'], 422);
            }
        }
 
        $userId = $request->user()?->id;
 
        try {
            return DB::transaction(function () use ($validated, $userId, $isPastry) {
                $header = MixPreparation::create([
                    'lokasi_id' => $validated['lokasi_id'],
                    'output_material_id' => $isPastry ? null : $validated['output_material_id'],
                    'output_produk_id' => $isPastry ? $validated['output_produk_id'] : null,
                    'output_type' => $isPastry ? 'produk' : 'material',
                    'output_quantity' => $validated['output_quantity'],
                    'keterangan' => $validated['keterangan'] ?? null,
                    'created_by' => $userId,
                    'tanggal' => now(),
                ]);

                $created = $this->createInputMovements($validated, $header, $userId);
 
                if ($isPastry) {
                    ProdukStockMovement::recordMixPreparationOutput(
                        $validated['lokasi_id'],
                        $validated['output_produk_id'],
                        $validated['output_quantity'],
                        $header,
                        $userId,
                        $validated['keterangan'] ?? null,
                    );
                } else {
                    $created[] = $this->createMaterialOutputMovement($validated, $header, $userId);
                }

                return response()->json([
                    'data' => ['header' => $header->fresh(['outputMaterial', 'outputProduk']), 'items' => $created],
                ]);
            });
        } catch (\Throwable $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    private function createInputMovements(array $validated, MixPreparation $header, ?int $userId): array
    {
        $created = [];

        foreach ($validated['inputs'] as $input) {
            $material = Material::find($input['material_id']);
            $currentStock = ItemLokasi::getCurrentStock($validated['lokasi_id'], $input['material_id']);
            $after = $currentStock - $input['quantity'];
            $created[] = ItemLokasi::create([
                'lokasi_id' => $validated['lokasi_id'],
                'material_id' => $input['material_id'],
                'tipe' => 'mix_preparation',
                'quantity' => -$input['quantity'],
                'quantity_before' => $currentStock,
                'quantity_after' => $after,
                'quantity_gudang' => null,
                'quantity_gudang_before' => null,
                'quantity_gudang_after' => null,
                'reference_type' => MixPreparation::class,
                'reference_id' => $header->id,
                'keterangan' => $this->buildMovementKeterangan(
                    $header,
                    'Mix Preparation keluar: ' . ($material?->name ?? ''),
                    $validated['keterangan'] ?? null,
                ),
                'user_id' => $userId,
                'tanggal' => now(),
            ]);
        }

        return $created;
    }

    private function createMaterialOutputMovement(array $validated, MixPreparation $header, ?int $userId): ItemLokasi
    {
        $outputMaterial = Material::find($validated['output_material_id']);
        $currentOut = ItemLokasi::getCurrentStock($validated['lokasi_id'], $validated['output_material_id']);
        $afterOut = $currentOut + $validated['output_quantity'];

        return ItemLokasi::create([
            'lokasi_id' => $validated['lokasi_id'],
            'material_id' => $validated['output_material_id'],
            'tipe' => 'mix_preparation',
            'quantity' => $validated['output_quantity'],
            'quantity_before' => $currentOut,
            'quantity_after' => $afterOut,
            'quantity_gudang' => null, 
            'quantity_gudang_before' => null,
            'quantity_gudang_after' => null, 
            'reference_type' => MixPreparation::class,
            'reference_id' => $header->id, 
            'keterangan' => $this->buildMovementKeterangan(
                $header,
                'Mix Preparation masuk: ' . ($outputMaterial?->name ?? ''),
                $validated['keterangan'] ?? null,
            ),
            'user_id' => $userId,
            'tanggal' => now(),
        ]);
    }

    private function buildMovementKeterangan(MixPreparation $header, string $defaultText, ?string $userKeterangan): string
    {
        $suffix = ' (Mix Preparation #' . $header->no_mix_preparation . ')';

        if (!empty($userKeterangan)) {
            return $userKeterangan . $suffix;
        }

        return $defaultText . $suffix;
    }
}
