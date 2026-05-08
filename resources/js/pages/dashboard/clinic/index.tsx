import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardBody, Col, Row, Button } from 'react-bootstrap';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Grid } from 'gridjs-react';
import { html } from 'gridjs';
import { router } from '@inertiajs/react';

interface CategoryStats {
    total: number;
    passed: number;
    failed: number;
}

interface SummaryItem {
    id: number;
    name: string;
    total: number;
    passed: number;
    failed: number;
    performance: number;
}

interface ClinicPageProps {
    summary: SummaryItem[];
    stats: {
        total: CategoryStats;
        ap: CategoryStats;
        qmp: CategoryStats;
        qp: CategoryStats;
    };
    currentYear: number;
}

const ClinicPage = ({ summary = [], stats, currentYear }: ClinicPageProps) => {
    
    const getPassedPercentage = (s: CategoryStats) => {
        return s.total > 0 ? Math.round((s.passed / s.total) * 100) : 0;
    };

    const cockpitCategories = [
        { label: 'ภาพรวม', stats: stats.total, color: '#28a745' },
        { label: 'AP', stats: stats.ap, color: '#0dcaf0' },
        { label: 'QMP', stats: stats.qmp, color: '#ffc107' },
        { label: 'QP', stats: stats.qp, color: '#6610f2' }
    ];

    const getChartOptions = (color: string): ApexOptions => ({
        chart: {
            type: 'radialBar',
            offsetY: -20,
            sparkline: { enabled: true }
        },
        plotOptions: {
            radialBar: {
                startAngle: -110,
                endAngle: 110,
                track: {
                    background: "#e7e7e7",
                    strokeWidth: '97%',
                    margin: 2
                },
                dataLabels: {
                    name: { show: false },
                    value: {
                        offsetY: -2,
                        fontSize: '24px',
                        fontWeight: 'bold'
                    }
                }
            }
        },
        grid: { padding: { top: -10 } },
        fill: { colors: [color] },
        labels: ['ผ่าน'],
    });

    const changeYear = (year: number) => {
        router.get('/kpis/summary', { year });
    };

    const yearSelector = (
        <div className="d-flex align-items-center gap-2">
            <Button variant="outline-primary" size="sm" onClick={() => changeYear(currentYear - 1)}>
                <IconifyIcon icon="tabler:chevron-left" className="fs-16" /> ปี {currentYear - 1}
            </Button>
            <h5 className="mb-0 text-primary fw-bold mx-2">สรุปปีงบประมาณ {currentYear}</h5>
            <Button variant="outline-primary" size="sm" onClick={() => changeYear(currentYear + 1)}>
                ปี {currentYear + 1} <IconifyIcon icon="tabler:chevron-right" className="fs-16" />
            </Button>
        </div>
    );

    return (
        <MainLayout>
            <PageTitle title="สรุปตัวชี้วัด (KPI Summary)" subTitle="ภาพรวมผลงานรายหน่วยงาน" rightContent={yearSelector} />

            <Row className="row-cols-lg-4 row-cols-sm-2 row-cols-1 mb-4 g-3">
                {cockpitCategories.map((cat, idx) => (
                    <Col key={idx}>
                        <Card className="shadow-sm border-0 overflow-hidden">
                            <CardBody className="p-3 text-center">
                                <h5 className="text-muted fw-bold mb-1 text-uppercase">{cat.label}</h5>
                                <div className="position-relative" style={{ height: '110px' }}>
                                    <ReactApexChart 
                                        options={getChartOptions(cat.color)} 
                                        series={[getPassedPercentage(cat.stats)]} 
                                        type="radialBar" 
                                        height={200} 
                                    />
                                </div>
                                <div className="mt-1 d-flex justify-content-between px-2">
                                    <div className="text-start">
                                        <span className="d-block text-muted small">ผ่านเกณฑ์</span>
                                        <span className="fw-bold text-success fs-14">{cat.stats.passed}</span>
                                    </div>
                                    <div className="text-end">
                                        <span className="d-block text-muted small">ไม่ผ่าน</span>
                                        <span className="fw-bold text-danger fs-14">{cat.stats.failed}</span>
                                    </div>
                                </div>
                                <div className="progress mt-2" style={{ height: '4px' }}>
                                    <div 
                                        className="progress-bar" 
                                        style={{ 
                                            width: `${getPassedPercentage(cat.stats)}%`,
                                            backgroundColor: cat.color 
                                        }} 
                                    />
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row>
                <Col xs={12}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-light-subtle py-3">
                            <h4 className="card-title mb-0 text-primary">
                                <IconifyIcon icon="solar:chart-2-bold-duotone" className="me-1 fs-20" />
                                รายการตัวชี้วัดแยกตามหน่วยงาน (KPI Indicators by Department)
                            </h4>
                        </Card.Header>
                        <CardBody className="p-0">
                            <Grid
                                data={summary.map((item) => [
                                    item.id,
                                    item.name,
                                    item.total,
                                    item.passed,
                                    item.failed,
                                    item.performance,
                                ])}
                                columns={[
                                    { name: 'รหัส', width: '80px' },
                                    { name: 'ชื่อหน่วยงาน', width: '300px' },
                                    { name: 'จำนวนตัววัด', width: '120px', className: 'text-center' },
                                    { 
                                        name: 'ผ่าน', 
                                        width: '100px',
                                        formatter: (val) => html(`<span class="text-success fw-bold">${val}</span>`)
                                    },
                                    { 
                                        name: 'ไม่ผ่าน', 
                                        width: '100px',
                                        formatter: (val) => html(`<span class="text-danger fw-bold">${val}</span>`)
                                    },
                                    {
                                        name: 'ผลงาน',
                                        formatter: (val) => {
                                            const color = Number(val) >= 80 ? 'success' : Number(val) >= 50 ? 'warning' : 'danger';
                                            return html(`
                                                <div class="d-flex align-items-center gap-2">
                                                    <div class="progress flex-grow-1" style="height: 6px;">
                                                        <div class="progress-bar bg-${color}" style="width: ${val}%"></div>
                                                    </div>
                                                    <span class="fw-bold text-${color}">${val}%</span>
                                                </div>
                                            `);
                                        }
                                    }
                                ]}
                                search={true}
                                pagination={{ limit: 20 }}
                                sort={true}
                                className={{
                                    table: 'table table-hover align-middle mb-0',
                                    thead: 'bg-light-subtle text-muted fw-semibold',
                                    pagination: 'mt-3 mb-3 px-3'
                                }}
                                language={{
                                    'search': { 'placeholder': 'ค้นหาหน่วยงาน...' },
                                    'pagination': {
                                        'previous': 'ก่อนหน้า',
                                        'next': 'ถัดไป',
                                        'showing': 'แสดง',
                                        'results': () => 'รายการ'
                                    }
                                }}
                            />
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </MainLayout>
    );
};

export default ClinicPage;
