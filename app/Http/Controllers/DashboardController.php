<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\JwtService;
use App\Models\WebboardPost;

class DashboardController extends Controller
{
    public function index()
    {
        $month = (int)date('n');
        $currentFiscalYear = (int)date('Y') + ($month >= 10 ? 544 : 543);
        $year = session('kpi_selected_year', $currentFiscalYear);

        $query = \App\Models\Kpi::select('kpis.*', 'departments.dp_type')
            ->join('departments', 'kpis.department', '=', 'departments.id')
            ->where('kpis.kpi_year', $year)
            ->where('kpis.is_active', 'active');

        $stats = null;
        $statsTitle = null;

        if (auth()->check()) {
            $user = auth()->user();
            if ($user->role !== 'admin' && $user->department_id) {
                $query->where('kpis.department', $user->department_id);
                $deptName = \App\Models\Department::find($user->department_id)?->dp_name ?? '';
                $statsTitle = 'ภาพรวมตัวชี้วัดของ "' . $deptName . '"';
            } else {
                $statsTitle = "สรุปภาพรวมตัวชี้วัดทั้งหมด";
            }

            $allKpis = $query->get();

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
        } else {
            $allKpis = $query->get();
        }

        $webboardPosts = WebboardPost::with(['user:id,name,avatar,role', 'responder:id,name,avatar,role'])->latest()->get();

        return Inertia::render('dashboard/hosinfo/index', [
            'stats' => $stats,
            'statsTitle' => $statsTitle,
            'kpis' => $allKpis,
            'currentYear' => (int)$year,
            'webboardPosts' => $webboardPosts
        ]);
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
