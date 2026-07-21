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
        Schema::table('end_user_reports', function (Blueprint $table) {
            if (!Schema::hasColumn('end_user_reports', 'has_department')) {
                $table->tinyInteger('has_department')->default(0)->after('default_date_range')->comment('0=ไม่อนุญาตเลือกห้องตรวจ, 1=อนุญาตเลือกห้องตรวจ (:department)');
            }
            if (!Schema::hasColumn('end_user_reports', 'has_spclty')) {
                $table->tinyInteger('has_spclty')->default(0)->after('has_department')->comment('0=ไม่อนุญาตเลือกแผนก, 1=อนุญาตเลือกแผนก (:spclty)');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('end_user_reports', function (Blueprint $table) {
            $table->dropColumn(['has_department', 'has_spclty']);
        });
    }
};
