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
            $table->dropColumn(['target_low', 'target_high']);
            $table->decimal('target_value', 10, 2)->nullable();
            $table->string('target_direction')->default('up')->comment('up = สูงดี, down = ต่ำดี');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kpis', function (Blueprint $table) {
            $table->decimal('target_low', 10, 2)->nullable();
            $table->decimal('target_high', 10, 2)->nullable();
            $table->dropColumn(['target_value', 'target_direction']);
        });
    }
};
