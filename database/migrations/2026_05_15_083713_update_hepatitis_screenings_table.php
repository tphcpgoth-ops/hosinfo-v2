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
            $table->dropColumn([
                'treated_elsewhere', 
                'cannot_contact', 
                'hbv_treatment_vl', 
                'hbv_treatment_non_vl'
            ]);
            $table->string('hbv_treatment_status')->nullable()->after('hospital_entry_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hepatitis_screenings', function (Blueprint $table) {
            $table->boolean('treated_elsewhere')->default(false);
            $table->boolean('cannot_contact')->default(false);
            $table->string('hbv_treatment_vl')->nullable();
            $table->string('hbv_treatment_non_vl')->nullable();
            $table->dropColumn('hbv_treatment_status');
        });
    }
};
