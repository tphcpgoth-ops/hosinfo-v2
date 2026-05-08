<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('departments')->updateOrInsert(
            ['id' => 1],
            [
                'dp_name' => 'Admin',
                'dp_status' => 0, // ตามที่คุณระบุใน SQL (ปกติ 0 อาจหมายถึง Active หรือ Inactive ขึ้นอยู่กับ logic ของคุณ)
                'created_at' => '2026-05-08 04:44:58',
                'updated_at' => '2026-05-08 04:44:58',
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('departments')->where('id', 1)->delete();
    }
};
