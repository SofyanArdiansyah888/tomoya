<?php

use Illuminate\Database\Migrations\Migration; 
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mix_preparation', function (Blueprint $table) {
            $table->string('no_mix_preparation', 50)->nullable()->unique()->after('id');
        });

        $rows = DB::table('mix_preparation')
            ->orderBy('tanggal')
            ->orderBy('id')
            ->get();

        $dailySequence = [];

        foreach ($rows as $row) {
            $date = \Carbon\Carbon::parse($row->tanggal)->format('Ymd');
            $dailySequence[$date] = ($dailySequence[$date] ?? 0) + 1;
            $no = 'MIX-' . $date . '-' . str_pad((string) $dailySequence[$date], 4, '0', STR_PAD_LEFT);

            DB::table('mix_preparation')
                ->where('id', $row->id)
                ->update(['no_mix_preparation' => $no]);
        }

        Schema::table('mix_preparation', function (Blueprint $table) {
            $table->string('no_mix_preparation', 50)->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('mix_preparation', function (Blueprint $table) {
            $table->dropUnique(['no_mix_preparation']);
            $table->dropColumn('no_mix_preparation');
        });
    }
};
