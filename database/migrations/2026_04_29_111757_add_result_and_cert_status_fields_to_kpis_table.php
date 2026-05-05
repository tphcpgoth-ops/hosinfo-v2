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
            $table->decimal('result', 10, 2)->nullable()->after('target_value');
            
            // Status fields for each month
            for ($i = 1; $i <= 12; $i++) {
                $table->string('m' . $i . '_status')->nullable();
            }
            
            // Status fields for each quarter
            for ($i = 1; $i <= 4; $i++) {
                $table->string('q' . $i . '_status')->nullable();
            }
            
            // Annual result status
            $table->string('annual_status')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kpis', function (Blueprint $table) {
            $columns = ['result', 'annual_status'];
            
            for ($i = 1; $i <= 12; $i++) {
                $columns[] = 'm' . $i . '_status';
            }
            for ($i = 1; $i <= 4; $i++) {
                $columns[] = 'q' . $i . '_status';
            }
            
            $table->dropColumn($columns);
        });
    }
};
