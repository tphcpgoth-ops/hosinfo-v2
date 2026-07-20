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
            $table->tinyInteger('has_date_range')->default(0)->after('rep_description');
            $table->string('default_date_range')->nullable()->after('has_date_range');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('end_user_reports', function (Blueprint $table) {
            $table->dropColumn(['has_date_range', 'default_date_range']);
        });
    }
};
