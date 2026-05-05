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
        Schema::create('kpis', function (Blueprint $table) {
            $table->id();
            $table->string('kpi_code')->unique();
            $table->string('department')->nullable();
            $table->string('kpi_name_th');
            $table->string('kpi_name_en')->nullable();
            $table->text('description')->nullable();
            $table->text('objective')->nullable();
            $table->text('formula_a')->nullable();
            $table->text('formula_b')->nullable();
            $table->string('formula_c')->nullable();
            $table->string('source')->nullable();
            $table->string('unit')->nullable();
            $table->string('interpretation')->nullable();
            $table->string('kpi_type')->nullable();
            $table->string('data_acquisition')->nullable();
            $table->string('reporting_period')->nullable();
            $table->decimal('baseline_year_1', 10, 2)->nullable();
            $table->decimal('baseline_year_2', 10, 2)->nullable();
            $table->decimal('baseline_year_3', 10, 2)->nullable();
            $table->decimal('target_low', 10, 2)->nullable();
            $table->decimal('target_high', 10, 2)->nullable();
            $table->decimal('weight', 10, 2)->nullable();
            $table->string('responsible_person')->nullable();
            $table->integer('kpi_year')->default(2569);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kpis');
    }
};
