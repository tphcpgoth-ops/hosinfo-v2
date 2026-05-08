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
        Schema::table('departments', function (Blueprint $blueprint) {
            $blueprint->integer('dp_type')->default(1)->after('dp_name')->comment('1: หน่วยงาน, 2: คล่อมสายงาน');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('departments', function (Blueprint $blueprint) {
            $blueprint->dropColumn('dp_type');
        });
    }
};
