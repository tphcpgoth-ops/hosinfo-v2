<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        // Fetch report categories
        $categories = DB::table('sys_rep_cat')->get();

        // Fetch reports based on selected category (if any)
        $query = DB::table('rep_reports as r')
            ->leftJoin('sys_rep_cat as c', 'c.id', '=', 'r.rep_cat')
            ->leftJoin('mis_user as u', 'u.m_login', '=', 'r.rep_user_reporter')
            ->where('r.rep_status', 1)
            ->select('r.*', 'c.rep_cat as catname', 'u.m_namefull as reporter');

        if ($request->has('repcat') && $request->repcat != '') {
            $query->where('r.rep_cat', $request->repcat);
        }

        $reports = $query->orderBy('r.rep_update', 'desc')->get();

        return Inertia::render('reports/index', [
            'categories' => $categories,
            'reports' => $reports,
            'currentCategory' => $request->repcat ?? '',
        ]);
    }
}
