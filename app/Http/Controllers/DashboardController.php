<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\JwtService;

class DashboardController extends Controller
{
    public function clinic(Request $request)
    {
        $user = auth()->user();
        $userRole = $user->role ?? 'guest';
        $userDeptId = $user->department_id;

        // ปีงบประมาณไทย
        $month = (int)date('n');
        $currentFiscalYear = (int)date('Y') + ($month >= 10 ? 544 : 543);
        $year = $request->query('year', session('kpi_selected_year', $currentFiscalYear));
        if ($request->has('year')) {
            session(['kpi_selected_year' => $year]);
        }

        // 1. ดึงหน่วยงานที่ต้องการแสดง (แสดงทั้งหมดทุกหน่วยงาน)
        $departments = \App\Models\Department::active()->get();

        // 2. ดึง KPI ทั้งหมดในปีที่เลือก พร้อมข้อมูลประเภทหน่วยงาน
        $allKpis = \App\Models\Kpi::select('kpis.*', 'departments.dp_type')
            ->join('departments', 'kpis.department', '=', 'departments.id')
            ->where('kpis.kpi_year', $year)
            ->where('kpis.is_active', 'active')
            ->get();

        // 3. คำนวณ Cockpit Stats (ภาพรวม)
        $calcStats = function ($collection) {
            $total  = $collection->count();
            $passed = $collection->where('kpi_status', 'pass')->count();
            $failed = $collection->where('kpi_status', 'fail')->count();
            return ['total' => $total, 'passed' => $passed, 'failed' => $failed];
        };

        $stats = [
            'total' => $calcStats($allKpis),
            'ap'    => $calcStats($allKpis->where('kpi_type', 'AP')),
            'qmp'   => $calcStats($allKpis->where('kpi_type', 'QMP')),
            'qp'    => $calcStats($allKpis->where('kpi_type', 'QP')),
        ];

        // 4. สรุปรายหน่วยงาน
        $summaryData = $departments->map(function ($dept) use ($allKpis) {
            $deptKpis = $allKpis->where('department', $dept->id);
            $total = $deptKpis->count();
            $passed = $deptKpis->where('kpi_status', 'pass')->count();
            $failed = $deptKpis->where('kpi_status', 'fail')->count();
            $performance = $total > 0 ? round(($passed / $total) * 100, 2) : 0;

            return [
                'id' => $dept->id,
                'name' => $dept->dp_name,
                'type' => $dept->dp_type,
                'total' => $total,
                'passed' => $passed,
                'failed' => $failed,
                'performance' => $performance
            ];
        })->values();

        return Inertia::render('dashboard/clinic/index', [
            'summary' => $summaryData,
            'stats' => $stats,
            'kpis' => $allKpis, // ส่ง KPI ทั้งหมดไปให้ Frontend คำนวณ Cockpit ใหม่เมื่อกรอง
            'currentYear' => (int)$year
        ]);
    }



    public function dashboard2()
    {
        return Inertia::render('dashboard/dashboard2/index', [
            'api_token' => JwtService::generateToken()
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
