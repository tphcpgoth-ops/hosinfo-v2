<?php

namespace App\Services;

use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Auth;

class JwtService
{
    /**
     * สร้าง JWT สำหรับผู้ใช้ที่ Login อยู่
     */
    public static function generateToken()
    {
        $user = Auth::user();
        if (!$user) {
            return null;
        }

        $secret = env('JWT_SECRET');
        $algo = env('JWT_ALGORITHM', 'HS256');

        $payload = [
            'iss' => config('app.url'),
            'sub' => $user->id,
            'name' => $user->name,
            'role' => $user->role ?? 'user',
            'iat' => time(),
            'exp' => time() + (60 * 60 * 2), // หมดอายุใน 2 ชั่วโมง
        ];

        return JWT::encode($payload, $secret, $algo);
    }
}
