<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

use App\Services\JwtService;

class HosinfoController extends Controller
{
    public function index()
    {
        return Inertia::render('hosinfo/index', [
            'api_token' => JwtService::generateToken(),
            'external_api_url' => env('VITE_EXTERNAL_API_URL', 'http://127.0.0.1:8800')
        ]);
    }

    public function opd()
    {
        return Inertia::render('hosinfo/opd/index', [
            'api_token' => JwtService::generateToken(),
            'external_api_url' => env('VITE_EXTERNAL_API_URL', 'http://127.0.0.1:8800')
        ]);
    }

    public function ipd()
    {
        return Inertia::render('hosinfo/ipd/index', [
            'api_token' => JwtService::generateToken(),
            'external_api_url' => env('VITE_EXTERNAL_API_URL', 'http://127.0.0.1:8800')
        ]);
    }

    public function dent()
    {
        return Inertia::render('hosinfo/dent/index', [
            'api_token' => JwtService::generateToken(),
            'external_api_url' => env('VITE_EXTERNAL_API_URL', 'http://127.0.0.1:8800')
        ]);
    }

    public function ppt()
    {
        return Inertia::render('hosinfo/ppt/index', [
            'api_token' => JwtService::generateToken(),
            'external_api_url' => env('VITE_EXTERNAL_API_URL', 'http://127.0.0.1:8800')
        ]);
    }

    public function er()
    {
        return Inertia::render('hosinfo/er/index', [
            'api_token' => JwtService::generateToken(),
            'external_api_url' => env('VITE_EXTERNAL_API_URL', 'http://127.0.0.1:8800')
        ]);
    }

    public function or()
    {
        return Inertia::render('hosinfo/or/index', [
            'api_token' => JwtService::generateToken(),
            'external_api_url' => env('VITE_EXTERNAL_API_URL', 'http://127.0.0.1:8800')
        ]);
    }

    public function cd()
    {
        return Inertia::render('hosinfo/cd/index', [
            'api_token' => JwtService::generateToken(),
            'external_api_url' => env('VITE_EXTERNAL_API_URL', 'http://127.0.0.1:8800')
        ]);
    }

    public function ncd()
    {
        return Inertia::render('hosinfo/ncd/index', [
            'api_token' => JwtService::generateToken(),
            'external_api_url' => env('VITE_EXTERNAL_API_URL', 'http://127.0.0.1:8800')
        ]);
    }

    public function pts()
    {
        return Inertia::render('hosinfo/pts/index', [
            'api_token' => JwtService::generateToken(),
            'external_api_url' => env('VITE_EXTERNAL_API_URL', 'http://127.0.0.1:8800')
        ]);
    }

    public function xray()
    {
        return Inertia::render('hosinfo/xray/index', [
            'api_token' => JwtService::generateToken(),
            'external_api_url' => env('VITE_EXTERNAL_API_URL', 'http://127.0.0.1:8800')
        ]);
    }

    public function lab()
    {
        return Inertia::render('hosinfo/lab/index', [
            'api_token' => JwtService::generateToken(),
            'external_api_url' => env('VITE_EXTERNAL_API_URL', 'http://127.0.0.1:8800')
        ]);
    }

    public function pcc()
    {
        return Inertia::render('hosinfo/pcc/index', [
            'api_token' => JwtService::generateToken(),
            'external_api_url' => env('VITE_EXTERNAL_API_URL', 'http://127.0.0.1:8800')
        ]);
    }

    public function lastUpdate()
    {
        $updates = DB::select("
            SELECT c.*, COALESCE(u.m_namefull, c.sysuser) AS fullname, u.user_picture 
            FROM mis40db.sys_update c 
            LEFT JOIN mis40db.mis_user u ON u.m_login = c.sysuser 
            ORDER BY c.id DESC
        ");

        return Inertia::render('hosinfo/last-update/index', [
            'updates' => $updates,
            'api_token' => JwtService::generateToken(),
            'external_api_url' => env('VITE_EXTERNAL_API_URL', 'http://127.0.0.1:8800')
        ]);
    }
}
