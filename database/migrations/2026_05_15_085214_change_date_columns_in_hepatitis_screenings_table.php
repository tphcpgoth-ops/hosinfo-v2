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
        Schema::table('hepatitis_screenings', function (Blueprint $table) {
            $table->date('hbv_medication')->nullable()->change();
            $table->date('hbv_follow_up')->nullable()->change();
            $table->date('hcv_medication')->nullable()->change();
            $table->date('hcv_follow_up')->nullable()->change();
            $table->date('ultrasound')->nullable()->change();
            $table->date('referral')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hepatitis_screenings', function (Blueprint $table) {
            $table->string('hbv_medication')->nullable()->change();
            $table->string('hbv_follow_up')->nullable()->change();
            $table->string('hcv_medication')->nullable()->change();
            $table->string('hcv_follow_up')->nullable()->change();
            $table->string('ultrasound')->nullable()->change();
            $table->string('referral')->nullable()->change();
        });
    }
};
