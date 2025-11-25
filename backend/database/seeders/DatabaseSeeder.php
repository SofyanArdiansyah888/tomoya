<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create default user if not exists
        if (!User::where('email', 'admin@tomoya.com')->exists()) {
            User::factory()->create([
                'name' => 'Admin',
                'email' => 'admin@tomoya.com',
                'password' => Hash::make('password')
            ]);
        }

        // Update all users password to "password"
        // User::query()->update([
        //     'password' => Hash::make('password')
        // ]);

        // Run seeders in order
        $this->call([
            LokasiSeeder::class,
            KategoriSeeder::class,
            SupplierSeeder::class,
            MaterialSeeder::class,
            ProdukSeeder::class
            
        ]);
    }
}
