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
            // Monthly Results (m1 = Oct, m12 = Sep)
            for ($i = 1; $i <= 12; $i++) {
                $table->decimal("m$i", 10, 2)->nullable();
            }
            
            // Quarterly Results
            $table->decimal('q1', 10, 2)->nullable();
            $table->decimal('q2', 10, 2)->nullable();
            $table->decimal('q3', 10, 2)->nullable();
            $table->decimal('q4', 10, 2)->nullable();

            // Annual Result
            $table->decimal('annual_result', 10, 2)->nullable();

            // Status and Publishing
            $table->string('status')->default('active')->comment('active, inactive');
            $table->boolean('is_published')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kpis', function (Blueprint $table) {
            for ($i = 1; $i <= 12; $i++) {
                $table->dropColumn("m$i");
            }
            $table->dropColumn(['q1', 'q2', 'q3', 'q4', 'annual_result', 'status', 'is_published']);
        });
    }
};
