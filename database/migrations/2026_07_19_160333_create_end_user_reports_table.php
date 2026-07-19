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
        Schema::create('end_user_reports', function (Blueprint $table) {
            $table->id();
            $table->string('rep_code')->nullable();
            $table->string('rep_name');
            $table->unsignedBigInteger('department_id')->nullable();
            $table->longText('rep_sql_query');
            $table->text('rep_description')->nullable();
            $table->tinyInteger('is_active')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('end_user_reports');
    }
};
