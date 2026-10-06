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
            if (!Schema::hasColumn('end_user_reports', 'craft_filters')) {
                $table->json('craft_filters')->nullable()->after('has_spclty')
                      ->comment('โครงสร้างตัวกรองปรับแต่ง SQL เช่น radio, select และ sql snippets');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('end_user_reports', function (Blueprint $table) {
            if (Schema::hasColumn('end_user_reports', 'craft_filters')) {
                $table->dropColumn('craft_filters');
            }
        });
    }
};
