<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\JwtService;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboard/hosinfo/index');
    }

    public function clinic()
    {
        return Inertia::render('dashboard/clinic/index');
    }

    public function wallet()
    {
        return Inertia::render('dashboard/wallet/index');
    }

    public function sales()
    {
        return Inertia::render('dashboard/sales/index');
    }
}
