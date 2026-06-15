<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint; 
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    { 
        Schema::table('item_pesanan', function (Blueprint $table) {
            $table->string('coffee_strength', 20)->nullable()->after('hpp');
        });
    }
 
    public function down(): void
    {
        Schema::table('item_pesanan', function (Blueprint $table) {
            $table->dropColumn('coffee_strength');
        });
    }
};
