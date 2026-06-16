<?php

namespace App\Modules\MasterKas;

use App\Models\MasterKas;
use App\Http\Resources\MasterKasResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller; 

class MasterKasController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MasterKas::with(['lokasi', 'user']);

        if ($request->has('status')) {
            $query->where('status', $request->boolean('status'));
        }

        if ($request->has('jenis') && $request->jenis) {
            $query->where('jenis', $request->jenis);
        }

        if ($request->has('kategori') && $request->kategori) {
            $query->where('kategori', $request->kategori);
        }

        if ($request->has('lokasi_id') && $request->lokasi_id) {
            $query->where('lokasi_id', $request->lokasi_id);
        }

        if ($request->has('toko_id') && $request->toko_id) {
            $query->where('lokasi_id', $request->toko_id);
        }

        if ($request->has('date_from') && $request->date_from && $request->has('date_to') && $request->date_to) {
            if ($request->date_from === $request->date_to) {
                $query->whereDate('tanggal', $request->date_from);
            } else {
                $query->whereBetween('tanggal', [$request->date_from, $request->date_to]);
            }
        } elseif ($request->has('date_from') && $request->date_from) {
            $query->where('tanggal', '>=', $request->date_from);
        } elseif ($request->has('date_to') && $request->date_to) {
            $query->where('tanggal', '<=', $request->date_to);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('deskripsi', 'like', "%{$search}%")
                  ->orWhere('kategori', 'like', "%{$search}%")
                  ->orWhere('sub_kategori', 'like', "%{$search}%");
            });
        }

        $allowedSortColumns = ['tanggal', 'created_at', 'jumlah', 'id'];
        $sortBy = $request->get('sort_by', 'created_at');
        if (!in_array($sortBy, $allowedSortColumns, true)) {
            $sortBy = 'created_at';
        }
        $sortOrder = strtolower($request->get('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $sortOrder);
        if ($sortBy !== 'id') {
            $query->orderBy('id', 'desc');
        }

        $perPage = $request->get('per_page', 15);
        $masterKas = $query->paginate($perPage);

        return response()->json([
            'data' => MasterKasResource::collection($masterKas->items()),
            'meta' => [
                'current_page' => $masterKas->currentPage(),
                'last_page' => $masterKas->lastPage(),
                'per_page' => $masterKas->perPage(),
                'total' => $masterKas->total(),
                'from' => $masterKas->firstItem(),
                'to' => $masterKas->lastItem(),
            ],
        ]);
    }

    public function stats(Request $request): JsonResponse
    {
        $query = MasterKas::query();

        if ($request->has('status')) {
            $query->where('status', $request->boolean('status'));
        }

        if ($request->has('date_from') && $request->date_from && $request->has('date_to') && $request->date_to) {
            if ($request->date_from === $request->date_to) {
                $query->whereDate('tanggal', $request->date_from);
            } else {
                $query->whereBetween('tanggal', [$request->date_from, $request->date_to]);
            }
        } elseif ($request->has('date_from') && $request->date_from) {
            $query->where('tanggal', '>=', $request->date_from);
        } elseif ($request->has('date_to') && $request->date_to) {
            $query->where('tanggal', '<=', $request->date_to);
        }

        if ($request->has('lokasi_id') && $request->lokasi_id) {
            $query->where('lokasi_id', $request->lokasi_id);
        }

        if ($request->has('toko_id') && $request->toko_id) {
            $query->where('lokasi_id', $request->toko_id);
        }

        $totalPemasukan = (clone $query)->where('jenis', 'pemasukan')->sum('jumlah');
        $totalPengeluaran = (clone $query)->where('jenis', 'pengeluaran')->sum('jumlah');
        $totalTransaksi = $query->count();
        $saldoBersih = $totalPemasukan - $totalPengeluaran;

        $breakdownPemasukan = (clone $query)
            ->where('jenis', 'pemasukan')
            ->select('kategori', DB::raw('SUM(jumlah) as total'))
            ->groupBy('kategori')
            ->get()
            ->pluck('total', 'kategori');

        $breakdownPengeluaran = (clone $query)
            ->where('jenis', 'pengeluaran')
            ->select('kategori', DB::raw('SUM(jumlah) as total'))
            ->groupBy('kategori')
            ->get()
            ->pluck('total', 'kategori');

        return response()->json([
            'data' => [
                'total_pemasukan' => $totalPemasukan,
                'total_pengeluaran' => $totalPengeluaran,
                'saldo_bersih' => $saldoBersih,
                'total_transaksi' => $totalTransaksi,
                'breakdown_pemasukan' => $breakdownPemasukan,
                'breakdown_pengeluaran' => $breakdownPengeluaran,
            ],
        ]);
    }

    public function filterOptions(Request $request): JsonResponse
    {
        $kategoris = MasterKas::select('kategori')
            ->distinct()
            ->pluck('kategori');

        $subKategoris = MasterKas::whereNotNull('sub_kategori')
            ->select('sub_kategori')
            ->distinct()
            ->pluck('sub_kategori');

        $lokasis = MasterKas::with('lokasi:id,nama')
            ->select('lokasi_id')
            ->distinct()
            ->get()
            ->pluck('lokasi')
            ->filter()
            ->values();

        return response()->json([
            'data' => [
                'kategoris' => $kategoris,
                'sub_kategoris' => $subKategoris,
                'lokasi' => $lokasis,
                'toko' => $lokasis,
                'jenis' => ['pemasukan', 'pengeluaran'],
                'metode_pembayaran' => ['cash', 'transfer', 'qris', 'kredit', 'debit'],
            ],
        ]);
    }
}
