<?php

namespace App\Modules\Pengguna;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use App\Http\Resources\ApiResource;

class PenggunaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $penggunas = User::all();
        return response()->json(ApiResource::collection($penggunas));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'nullable|string|in:admin,kasir,gudang',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'menu' => 'nullable|string|max:255',
            'submenu' => 'nullable|string',
        ]);

        // Ensure menu and submenu are strings
        $menu = $request->menu;
        if (is_array($menu)) {
            $menu = implode(',', array_filter(array_map('trim', $menu)));
        }
        $menu = $menu ? (string) $menu : null;
        
        $submenu = $request->submenu;
        if (is_array($submenu)) {
            $submenu = implode(',', array_filter(array_map('trim', $submenu)));
        }
        $submenu = $submenu ? (string) $submenu : null;

        $pengguna = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role ?? 'kasir',
            'phone' => $request->phone,
            'address' => $request->address,
            'menu' => $menu,
            'submenu' => $submenu,
        ]);

        return response()->json(new ApiResource($pengguna), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $pengguna = User::findOrFail($id);
        return response()->json(new ApiResource($pengguna));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|max:255|unique:users,email,' . $id,
            'password' => 'sometimes|required|string|min:8',
            'role' => 'nullable|string|in:admin,kasir,gudang',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'menu' => 'nullable|string',
            'submenu' => 'nullable|string',
        ]);

        $pengguna = User::findOrFail($id);
        
        $data = $request->only(['name', 'email', 'role', 'phone', 'address', 'menu', 'submenu']);
        
        // Ensure menu and submenu are strings, not arrays
        if (isset($data['menu'])) {
            if (is_array($data['menu'])) {
                $data['menu'] = implode(',', array_filter(array_map('trim', $data['menu'])));
            } else {
                $data['menu'] = (string) $data['menu'];
            }
            // Convert empty string to null
            if ($data['menu'] === '') {
                $data['menu'] = null;
            }
        }
        if (isset($data['submenu'])) {
            if (is_array($data['submenu'])) {
                $data['submenu'] = implode(',', array_filter(array_map('trim', $data['submenu'])));
            } else {
                $data['submenu'] = (string) $data['submenu'];
            }
            // Convert empty string to null
            if ($data['submenu'] === '') {
                $data['submenu'] = null;
            }
        }
        
        if ($request->has('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $pengguna->update($data);

        return response()->json(new ApiResource($pengguna));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $pengguna = User::findOrFail($id);
        $pengguna->delete();
        return response()->json(null, 204);
    }
}
