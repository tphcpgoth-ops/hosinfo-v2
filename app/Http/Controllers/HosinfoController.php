<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class HosinfoController extends Controller
{
    public function index()
    {
        return Inertia::render('hosinfo/index');
    }
}
