<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function clinic()
    {
        $user = auth()->user();
        $userRole = $user->role ?? 'guest';
        $userDeptId = $user->department_id;

        $query = \App\Models\Kpi::orderBy('kpi_code', 'asc');

        if ($userRole !== 'admin' && $userDeptId) {
            $query->where('department', $userDeptId);
        }

        $kpis = $query->limit(10)->get();

        return Inertia::render('dashboard/clinic/index', [
            'kpis' => $kpis
        ]);
    }

    public function hosinfo()
    {
        return Inertia::render('dashboard/hosinfo/index');
    }

    public function dashboard2()
    {
        $hos = \Illuminate\Support\Facades\DB::connection('hos');

        // 1. OPD Stats
        $opd_stats = $hos->selectOne("SELECT 
            COUNT(DISTINCT IF(main_dep = '085',vn,NULL)) AS ptm_pcc_vn,
            COUNT(DISTINCT IF(main_dep = '085',hn,NULL)) AS ptm_pcc_hn,
            COUNT(DISTINCT IF(main_dep = '085' AND vstdate = DATE_FORMAT(NOW(),'%Y-%m-%d'),vn,NULL)) AS ptm_pcc_today,
            COUNT(DISTINCT hn) AS ptm_opd_hn,
            COUNT(DISTINCT vn) AS ptm_opd_vn,
            COUNT(DISTINCT IF(vstdate = DATE_FORMAT(NOW(),'%Y-%m-%d'),vn,NULL)) AS pt_opd_today
            FROM ovst
            WHERE vstdate BETWEEN DATE_FORMAT(NOW(),'%Y-%m-01') AND DATE_FORMAT(NOW(),'%Y-%m-%d')");

        // 2. Physical Therapy
        $phy_stats = $hos->selectOne("SELECT COUNT(DISTINCT hn) AS ptm_phy_hn,COUNT(DISTINCT vn) AS ptm_phy_vn,
            COUNT(DISTINCT IF(vstdate = DATE_FORMAT(NOW(),'%Y-%m-%d'),vn,NULL)) AS pt_phy_today
            FROM physic_main
            WHERE vstdate BETWEEN DATE_FORMAT(NOW(),'%Y-%m-01') AND DATE_FORMAT(NOW(),'%Y-%m-%d')");

        // 3. IPD Stats
        $ipd_stats = $hos->selectOne("SELECT COUNT(DISTINCT hn) AS ptm_ipd_hn,COUNT(DISTINCT an) AS ptm_ipd_an,
            COUNT(DISTINCT IF(regdate = DATE_FORMAT(NOW(),'%Y-%m-%d'),an,NULL)) AS pt_ipd_today
            FROM ipt
            WHERE regdate BETWEEN DATE_FORMAT(NOW(),'%Y-%m-01') AND DATE_FORMAT(NOW(),'%Y-%m-%d')");

        // 4. Dental
        $dent_stats = $hos->selectOne("SELECT COUNT(DISTINCT hn) AS ptm_dent_hn,COUNT(DISTINCT vn) AS ptm_dent_vn,
            COUNT(DISTINCT IF(vstdate = DATE_FORMAT(NOW(),'%Y-%m-%d'),vn,NULL)) AS pt_dent_today
            FROM dtmain
            WHERE vstdate BETWEEN DATE_FORMAT(NOW(),'%Y-%m-01') AND DATE_FORMAT(NOW(),'%Y-%m-%d')");

        // 5. Thai Medicine
        $ttm_stats = $hos->selectOne("SELECT COUNT(DISTINCT hn) AS ptm_ttm_hn,COUNT(*) AS ptm_ttm_vn,
            COUNT(DISTINCT IF(service_date = DATE_FORMAT(NOW(),'%Y-%m-%d'),vn,NULL)) AS pt_ttm_today
            FROM health_med_service
            WHERE service_date BETWEEN DATE_FORMAT(NOW(),'%Y-%m-01') AND DATE_FORMAT(NOW(),'%Y-%m-%d')");

        // 6. ER (Accident)
        $er_stats = $hos->selectOne("SELECT COUNT(DISTINCT o.hn) AS ptm_er_hn,COUNT(DISTINCT o.vn) AS ptm_er_vn,
            COUNT(DISTINCT IF(er.vstdate = DATE_FORMAT(NOW(),'%Y-%m-%d'),o.vn,NULL)) AS pt_er_today
            FROM er_regist er 
            LEFT OUTER JOIN ovst o ON o.vn = er.vn
            WHERE er.vstdate BETWEEN DATE_FORMAT(NOW(),'%Y-%m-01') AND DATE_FORMAT(NOW(),'%Y-%m-%d')
            AND er.er_pt_type IN (SELECT er_pt_type FROM er_pt_type WHERE accident_code = 'Y')");

        // 7. OR (Surgery)
        $or_stats = $hos->selectOne("SELECT COUNT(DISTINCT hn) AS ptm_or_hn, COUNT(hn) AS ptm_or_vn,
            COUNT(IF(patient_department = 'OPD',vn,NULL)) AS ptm_or_opd,
            COUNT(IF(patient_department = 'IPD',an,NULL)) AS ptm_or_ipd,
            COUNT(IF(operation_date = DATE_FORMAT(NOW(),'%Y-%m-%d'),hn,NULL)) AS pt_or_today
            FROM operation_list
            WHERE operation_date BETWEEN DATE_FORMAT(NOW(),'%Y-%m-01') AND DATE_FORMAT(NOW(),'%Y-%m-%d')");

        // 8. X-Ray
        $xray_stats = $hos->selectOne("SELECT COUNT(DISTINCT hn) AS ptm_xray_hn,COUNT(vn) AS ptm_xray_vn,
            COUNT(IF(examined_date = DATE_FORMAT(NOW(),'%Y-%m-%d'),vn,NULL)) AS pt_xray_today
            FROM xray_report
            WHERE examined_date BETWEEN DATE_FORMAT(NOW(),'%Y-%m-01') AND DATE_FORMAT(NOW(),'%Y-%m-%d')");

        // 9. IPD Ward Summary
        $ward_summary = $hos->selectOne("SELECT COUNT(*) AS wtotal,
            (SELECT SUM(bedcount) FROM ward WHERE ward_active = 'Y')-COUNT(*) AS wblank,
            (SELECT SUM(bedcount) FROM ward WHERE ward_active = 'Y') AS bedcount
            FROM ipt WHERE dchdate IS NULL");

        $ipd_today_details = $hos->selectOne("SELECT 
            COUNT(IF(regdate = DATE_FORMAT(NOW(),'%Y-%m-%d'),an,NULL)) AS admittoday,
            (SELECT COUNT(*) FROM ipt WHERE dchdate = DATE_FORMAT(NOW(),'%Y-%m-%d')) AS dchtoday
            FROM ipt");

        // Ward List
        $wards = $hos->select("SELECT w.ward,w.name,w.bedcount,COUNT(i.an) AS admitnow
            FROM ward w
            LEFT OUTER JOIN ipt i ON i.ward = w.ward AND i.dchdate IS NULL
            WHERE w.ward_active = 'Y'
            GROUP BY w.ward, w.name, w.bedcount
            ORDER BY w.ward ASC");

        return Inertia::render('dashboard/dashboard2/index', [
            'stats' => [
                'opd' => $opd_stats,
                'phy' => $phy_stats,
                'ipd' => $ipd_stats,
                'dent' => $dent_stats,
                'ttm' => $ttm_stats,
                'er' => $er_stats,
                'or' => $or_stats,
                'xray' => $xray_stats,
                'ward_summary' => $ward_summary,
                'ipd_today' => $ipd_today_details,
            ],
            'wards' => $wards
        ]);
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
