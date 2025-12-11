<?php

namespace App\Modules\Hpp;

use App\Http\Controllers\Controller;
use App\Http\Resources\HppPenjualanResource;
use App\Models\ItemPesanan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HppPenjualanController extends Controller
{
    /**
     * Laporan HPP Penjualan berbasis item terjual.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ItemPesanan::query()
            ->join('produk', 'produk.id', '=', 'item_pesanan.produk_id')
            ->join('pesanan', 'pesanan.id', '=', 'item_pesanan.pesanan_id')
            ->select(
                'item_pesanan.produk_id',
                'produk.nama as produk_nama',
                'produk.kode as produk_kode',
                DB::raw('SUM(item_pesanan.quantity) as total_qty'),
                DB::raw('SUM(item_pesanan.quantity * item_pesanan.harga) as total_penjualan'),
                DB::raw('SUM(item_pesanan.quantity * item_pesanan.hpp) as total_hpp'),
                DB::raw('AVG(item_pesanan.harga) as avg_harga'),
                DB::raw('AVG(item_pesanan.hpp) as avg_hpp')
            )
            ->groupBy('item_pesanan.produk_id', 'produk.nama', 'produk.kode');

        if ($request->filled('date_from')) {
            $query->whereDate('pesanan.tanggal_penjualan', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('pesanan.tanggal_penjualan', '<=', $request->date_to);
        }

        if ($request->filled('produk_id')) {
            $query->where('item_pesanan.produk_id', $request->produk_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('produk.nama', 'like', "%{$search}%");
        }

        $query->orderByDesc('item_pesanan.created_at');

        $perPage = (int) $request->get('per_page', 25);
        $summaryQuery = clone $query;
        $paginator = $query->paginate($perPage);

        // Summary totals using aggregated results
        $summaryRows = $summaryQuery->get();
        $totalPenjualan = (float) $summaryRows->sum('total_penjualan');
        $totalHpp = (float) $summaryRows->sum('total_hpp');
        $totalMargin = $totalPenjualan - $totalHpp;

        return response()->json([
            'data' => HppPenjualanResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ],
            'summary' => [
                'total_penjualan' => round($totalPenjualan, 2),
                'total_hpp' => round($totalHpp, 2),
                'total_margin' => round($totalMargin, 2),
            ],
        ]);
    }
}

