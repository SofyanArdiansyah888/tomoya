<?php

namespace App\Modules\Autentikasi;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Modules\Autentikasi\LoginRequest;
use App\Modules\Autentikasi\RegisterRequest;

class AutentikasiController extends Controller
{
    /**
     * Register a new user
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role ?? 'kasir',
            'phone' => $request->phone,
            'address' => $request->address,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        // Ensure menu and submenu are included in response
        $userData = $user->toArray();
        $userData['menu'] = $user->menu ?? null;
        $userData['submenu'] = $user->submenu ?? null;

        return response()->json([
            'user' => $userData,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    /**
     * Login user
     */
    public function login(LoginRequest $request): JsonResponse
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['Kredensial yang diberikan tidak valid.'],
            ]);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        // Ensure menu and submenu are included in response
        $userData = $user->toArray();
        $userData['menu'] = $user->menu ?? null;
        $userData['submenu'] = $user->submenu ?? null;

        return response()->json([
            'user' => $userData,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // If user is authenticated, delete their current access token
        if ($user) {
            $user->currentAccessToken()?->delete();
        }

        return response()->json([
            'message' => 'Berhasil logout'
        ]);
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Ensure menu and submenu are included in response
        $userData = $user->toArray();
        $userData['menu'] = $user->menu ?? null;
        $userData['submenu'] = $user->submenu ?? null;
        
        return response()->json($userData);
    }
}
