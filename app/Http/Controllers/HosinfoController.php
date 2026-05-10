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
            'api_token' => JwtService::generateToken()
        ]);
    }

    public function opd()
    {
        return Inertia::render('hosinfo/opd/index', [
            'api_token' => JwtService::generateToken()
        ]);
    }

    public function ipd()
    {
        return Inertia::render('hosinfo/ipd/index', [
            'api_token' => JwtService::generateToken()
        ]);
    }
}
