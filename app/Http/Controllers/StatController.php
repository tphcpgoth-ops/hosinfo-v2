<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class StatController extends Controller
{
    public function opd(Request $request)
    {
        $hos = DB::connection('hos');
        
        $year = $request->get('year', date('Y') + 543);
        $myearb = $year - 544;
        $myeare = $year - 543;

        // 1. Monthly Visits (OPD vs IPD)
        $monthly_stats = $hos->select("SELECT t.AMONTH, SUM(t.visitopd) - SUM(t.visitipd) AS opd, SUM(t.visitipd) AS ipd, t.AY, t.AM 
            FROM (
                SELECT DATE_FORMAT(vstdate,'%Y-%m') AS AMONTH, COUNT(*) AS visitopd, 0 AS visitipd,
                DATE_FORMAT(vstdate,'%Y')+543 AS AY, DATE_FORMAT(vstdate,'%m') AS AM
                FROM vn_stat 
                WHERE vstdate BETWEEN '$myearb-10-01' AND '$myeare-09-30'
                GROUP BY DATE_FORMAT(vstdate,'%Y-%m')
                UNION ALL
                SELECT DATE_FORMAT(regdate,'%Y-%m') AS AMONTH, 0 AS visitopd, COUNT(*) AS visitipd,
                DATE_FORMAT(regdate,'%Y')+543 AS AY, DATE_FORMAT(regdate,'%m') AS AM
                FROM an_stat 
                WHERE regdate BETWEEN '$myearb-10-01' AND '$myeare-09-30'
                GROUP BY DATE_FORMAT(regdate,'%Y-%m')
            ) AS t
            GROUP BY t.AMONTH
            ORDER BY t.AMONTH ASC");

        // 2. Specialty Stats (OPD)
        $specialty_stats = $hos->select("SELECT s.name as spclty_name, COUNT(*) AS visit_count
            FROM vn_stat v
            LEFT OUTER JOIN spclty s ON s.spclty = v.spclty
            WHERE v.vstdate BETWEEN '$myearb-10-01' AND '$myeare-09-30'
            GROUP BY s.spclty, s.name
            ORDER BY visit_count DESC");

        // 3. Pttype Stats (Insurance)
        $pttype_stats = $hos->select("SELECT pt.name as pttype_name, COUNT(*) AS visit_count
            FROM vn_stat v
            LEFT OUTER JOIN pttype pt ON pt.pttype = v.pttype
            WHERE v.vstdate BETWEEN '$myearb-10-01' AND '$myeare-09-30'
            GROUP BY pt.pttype, pt.name
            ORDER BY visit_count DESC");

        return Inertia::render('stats/opd/index', [
            'monthlyStats' => $monthly_stats,
            'specialtyStats' => $specialty_stats,
            'pttypeStats' => $pttype_stats,
            'selectedYear' => $year
        ]);
    }
}
