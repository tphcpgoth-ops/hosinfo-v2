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
        Schema::create('hepatitis_screenings', function (Blueprint $table) {
            $table->id();
            $table->string('full_name')->nullable();
            $table->integer('age')->nullable();
            $table->string('cid', 13)->nullable();
            $table->text('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('hospital_name')->nullable();
            
            $table->string('hbv_positive')->nullable(); // หรือบวก/ลบ
            $table->string('hcv_positive')->nullable(); // หรือบวก/ลบ
            
            $table->string('hospital_entry_status')->nullable(); // มา/ไม่มา
            $table->boolean('treated_elsewhere')->default(false);
            $table->boolean('cannot_contact')->default(false);
            
            $table->string('hbv_treatment_vl')->nullable();
            $table->string('hbv_treatment_non_vl')->nullable();
            
            $table->string('hbv_medication')->nullable();
            $table->string('hbv_follow_up')->nullable();
            
            $table->string('hcv_medication')->nullable();
            $table->string('hcv_follow_up')->nullable();
            
            $table->string('ultrasound')->nullable();
            $table->string('referral')->nullable();
            $table->text('diagnosis')->nullable();
            $table->text('remarks')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hepatitis_screenings');
    }
};
