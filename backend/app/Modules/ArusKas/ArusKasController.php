<?php

namespace App\Modules\ArusKas;

use App\Models\ArusKas;
use App\Http\Resources\ArusKasResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

class ArusKasController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        // Get user ID safely
        $user = $request->user();
        $userId = $user ? $user->id : 1; // Fallback untuk development
        
        $query = ArusKas::with(['lokasi'])
            ->where('user_id', $userId);

        if ($request->has('status')) {
            $query->where('status', $request->boolean('status'));
        }

        // Filter by jenis
        if ($request->has('jenis') && $request->jenis) {
            $query->where('jenis', $request->jenis);
        }

        // Filter by kategori
        if ($request->has('kategori') && $request->kategori) {
            $query->where('kategori', $request->kategori);
        }

        // Filter by lokasi
        if ($request->has('lokasi_id') && $request->lokasi_id) {
            $query->where('lokasi_id', $request->lokasi_id);
        }
        
        // Support legacy toko_id filter
        if ($request->has('toko_id') && $request->toko_id) {
            $query->where('lokasi_id', $request->toko_id);
        }

        // Filter by date range
        if ($request->has('date_from') && $request->date_from && $request->has('date_to') && $request->date_to) {
            // If date_from and date_to are the same, use whereDate for exact match
            if ($request->date_from === $request->date_to) {
                $query->whereDate('tanggal', $request->date_from);
            } else {
                // Use whereBetween for date range
                $query->whereBetween('tanggal', [$request->date_from, $request->date_to]);
            }
        } elseif ($request->has('date_from') && $request->date_from) {
            $query->where('tanggal', '>=', $request->date_from);
        } elseif ($request->has('date_to') && $request->date_to) {
            $query->where('tanggal', '<=', $request->date_to);
        }


        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('deskripsi', 'like', "%{$search}%")
                  ->orWhere('kategori', 'like', "%{$search}%")
                  ->orWhere('sub_kategori', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'tanggal');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $arusKas = $query->paginate($perPage);

        return response()->json([
            'data' => ArusKasResource::collection($arusKas->items()),
            'meta' => [
                'current_page' => $arusKas->currentPage(),
                'last_page' => $arusKas->lastPage(),
                'per_page' => $arusKas->perPage(),
                'total' => $arusKas->total(),
                'from' => $arusKas->firstItem(),
                'to' => $arusKas->lastItem(),
            ]
        ]);
    }

    /**
     * Get cash flow statistics
     */
    public function stats(Request $request): JsonResponse
    {
        // Get user ID safely
        $user = $request->user();
        $userId = $user ? $user->id : 1; // Fallback untuk development
        
        $query = ArusKas::where('user_id', $userId);
        if ($request->has('status')) {
            $query->where('status', $request->boolean('status'));
        }

        // Filter by date range
        if ($request->has('date_from') && $request->date_from && $request->has('date_to') && $request->date_to) {
            // If date_from and date_to are the same, use whereDate for exact match
            if ($request->date_from === $request->date_to) {
                $query->whereDate('tanggal', $request->date_from);
            } else {
                // Use whereBetween for date range
                $query->whereBetween('tanggal', [$request->date_from, $request->date_to]);
            }
        } elseif ($request->has('date_from') && $request->date_from) {
            $query->where('tanggal', '>=', $request->date_from);
        } elseif ($request->has('date_to') && $request->date_to) {
            $query->where('tanggal', '<=', $request->date_to);
        }

        // Filter by lokasi
        if ($request->has('lokasi_id') && $request->lokasi_id) {
            $query->where('lokasi_id', $request->lokasi_id);
        }
        
        // Support legacy toko_id filter
        if ($request->has('toko_id') && $request->toko_id) {
            $query->where('lokasi_id', $request->toko_id);
        }

        $totalPemasukan = (clone $query)->where('jenis', 'pemasukan')->sum('jumlah');
        $totalPengeluaran = (clone $query)->where('jenis', 'pengeluaran')->sum('jumlah');
        $totalTransaksi = $query->count();
        $saldoBersih = $totalPemasukan - $totalPengeluaran;

        // Breakdown by kategori
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
            ]
        ]);
    }

    /**
     * Get available filter options
     */
    public function filterOptions(Request $request): JsonResponse
    {
        // Get user ID safely
        $user = $request->user();
        $userId = $user ? $user->id : 1; // Fallback untuk development

        $kategoris = ArusKas::where('user_id', $userId)
            ->select('kategori')
            ->distinct()
            ->pluck('kategori');

        $subKategoris = ArusKas::where('user_id', $userId)
            ->whereNotNull('sub_kategori')
            ->select('sub_kategori')
            ->distinct()
            ->pluck('sub_kategori');

        $lokasis = ArusKas::where('user_id', $userId)
            ->with('lokasi:id,nama')
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
                'toko' => $lokasis, // Keep for backward compatibility
                'jenis' => ['pemasukan', 'pengeluaran'],
                'metode_pembayaran' => ['cash', 'card', 'qris', 'other']
            ]
        ]);
    }
}
