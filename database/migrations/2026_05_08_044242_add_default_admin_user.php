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
        DB::table('users')->updateOrInsert(
            ['email' => 'admin@local.com'],
            [
                'id' => 5,
                'name' => 'Admin',
                'role' => 'admin',
                'is_active' => 1,
                'department_id' => 1,
                'password' => '$2y$12$yafgCkp0Td1/5Jvlj/Cqk.IlZBvR8saa181MXu.2lU2Imm2jQAOfu',
                'created_at' => '2026-05-08 04:36:04',
                'updated_at' => '2026-05-08 04:36:04',
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('users')->where('email', 'admin@local.com')->delete();
    }
};
