<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Change menu and submenu from JSON to TEXT
            $table->text('menu')->nullable()->change();
            $table->text('submenu')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Revert back to JSON
            $table->json('menu')->nullable()->change();
            $table->json('submenu')->nullable()->change();
        });
    }
};

