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
        Schema::table('kpis', function (Blueprint $table) {
            // สถานะการประเมินผล: pass = ผ่านเกณฑ์, fail = ไม่ผ่าน, null = ยังไม่ประเมิน
            $table->enum('kpi_status', ['pass', 'fail'])->nullable()->after('annual_result');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kpis', function (Blueprint $table) {
            $table->dropColumn('kpi_status');
        });
    }
};
