<?php

namespace App\Modules\Inventori;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Models\ItemLokasi;
use App\Models\Lokasi;
use App\Models\Material;
use App\Models\MixPreparation;
use Carbon\Carbon;

class MixPreparationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MixPreparation::with(['lokasi', 'outputMaterial', 'user'])
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

        $data = $query->get();
        return response()->json([ 'data' => $data ]);
    }

    public function show(int $id): JsonResponse
    { 
        $mp = MixPreparation::with(['lokasi', 'outputMaterial', 'user'])->findOrFail($id);
        $items = ItemLokasi::with(['material', 'user'])
            ->where('reference_type', MixPreparation::class)
            ->where('reference_id', $mp->id)
            ->orderBy('tanggal', 'asc')
            ->get();
        return response()->json(['data' => [ 'header' => $mp, 'items' => $items ]]);
    }

    public function create(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'lokasi_id' => 'required|exists:lokasi,id',
            'output_material_id' => 'required|exists:material,id',
            'output_quantity' => 'required|integer|min:1',
            'inputs' => 'required|array|min:1',
            'inputs.*.material_id' => 'required|exists:material,id',
            'inputs.*.quantity' => 'required|integer|min:1',
            'keterangan' => 'nullable|string'
        ]);

        $lokasi = Lokasi::findOrFail($validated['lokasi_id']);
        if ($lokasi->tipe !== 'toko') {
            return response()->json([
                'message' => 'Mix Preparation hanya untuk lokasi non gudang'
            ], 422);
        }

        $userId = $request->user()?->id;

        try {
            return DB::transaction(function () use ($validated, $userId) {
                foreach ($validated['inputs'] as $input) {
                    $currentStock = ItemLokasi::getCurrentStock($validated['lokasi_id'], $input['material_id']);
                    if ($currentStock < $input['quantity']) {
                        throw new \RuntimeException('Stok tidak mencukupi untuk material input');
                    }
                }

                $header = MixPreparation::create([
                    'lokasi_id' => $validated['lokasi_id'],
                    'output_material_id' => $validated['output_material_id'],
                    'output_quantity' => $validated['output_quantity'],
                    'keterangan' => $validated['keterangan'] ?? null,
                    'created_by' => $userId,
                    'tanggal' => now(),
                ]);

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
                    'keterangan' => $validated['keterangan'] ?? ('Mix Preparation keluar: ' . ($material?->name ?? '')),
                    'user_id' => $userId,
                    'tanggal' => now(),
                ]);
            }

            $outputMaterial = Material::find($validated['output_material_id']);
            $currentOut = ItemLokasi::getCurrentStock($validated['lokasi_id'], $validated['output_material_id']);
            $afterOut = $currentOut + $validated['output_quantity'];
            $created[] = ItemLokasi::create([
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
                'keterangan' => $validated['keterangan'] ?? ('Mix Preparation masuk: ' . ($outputMaterial?->name ?? '')),
                'user_id' => $userId,
                'tanggal' => now(),
            ]);

                return response()->json([
                    'data' => [ 'header' => $header, 'items' => $created ]
                ]);
            });
        } catch (\Throwable $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }
}