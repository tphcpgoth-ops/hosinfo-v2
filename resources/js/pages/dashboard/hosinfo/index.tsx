import small1Img from '@/images/small/small-22.jpg';
import small4Img from '@/images/small/small-21.jpg';
import MainLayout from '@/layouts/MainLayout';
import { Head, usePage } from '@inertiajs/react';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { Col, Row, Card, CardBody, CardTitle } from 'react-bootstrap';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const HorizontalCard = () => {
    return (
        <>
            <Col lg={6}>
                <Card>
                    <Row className="g-0 align-items-center">
                        <Col md={4}>
                            <img src={small4Img} className="img-fluid rounded-start" alt="..." />
                        </Col>
                        <Col md={8}>
                            <CardBody>
                                <CardTitle as={'h5'}>ข้อมูลและสถิติ</CardTitle>
                                <p className="card-text">
                                    แสดงข้อมูลและสถิติต่างๆ ของโรงพยาบาล
                                </p>
                                <p className="card-text">
                                    <small className="text-muted">Realtime Data</small>
                                </p>
                            </CardBody>
                        </Col>
                    </Row>
                </Card>
            </Col>
            <Col lg={6}>
                <Card>
                    <Row className="g-0 align-items-center">
                        <Col md={8}>
                            <CardBody>
                                <CardTitle as={'h5'}>ระบบบริหารจัดการตัวชี้วัด KPI</CardTitle>
                                <p className="card-text">
                                    บริหารจัดการ ติดตาม ประเมินผลตัวชี้วัด KPI ของโรงพยาบาล
                                </p>
                                <p className="card-text">
                                    <small className="text-muted">Cockpit Data</small>
                                </p>
                            </CardBody>
                        </Col>
                        <Col md={4}>
                            <img src={small1Img} className="img-fluid rounded-end" alt="..." />
                        </Col>
                    </Row>
                </Card>
            </Col>
        </>
    );
};

const HosinfoDashboardPage = () => {
    const { hospital, stats } = usePage().props as any;

    const getPassedPercentage = (s: any) => {
        return s && s.total > 0 ? Math.round((s.passed / s.total) * 100) : 0;
    };

    const getDynamicColor = (val: number) => {
        return val >= 80 ? '#28a745' : val >= 50 ? '#ffc107' : '#dc3545';
    };

    const cockpitCategories = stats ? [
        { label: 'ภาพรวม KPI', stats: stats.total },
        { label: 'AP', stats: stats.ap },
        { label: 'QMP', stats: stats.qmp },
        { label: 'QP', stats: stats.qp }
    ].map(cat => ({
        ...cat,
        color: getDynamicColor(getPassedPercentage(cat.stats))
    })) : [];

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

    return (
        <MainLayout>
            <Head title={'หน้าหลัก'} />

            <Row className="mt-3 mb-3">
                <Col xs={12}>
                    <div className="page-title-box d-flex align-items-center">
                        <h4 className="page-title mb-0 me-2 text-dark fw-bold fs-24">{hospital?.name || 'โรงพยาบาล'}</h4>
                        <p className="text-dark fw-medium fs-15 d-flex align-items-center gap-1 mb-2">
                            <IconifyIcon icon="tabler:building-hospital" className="text-muted" />
                            <span className="badge bg-light-subtle rounded-pill text-dark border fs-12 py-1 px-2">{hospital?.code || 'รหัสโรงพยาบาล'}</span>
                        </p>
                    </div>
                </Col>
            </Row>

            <Row className="mt-0 mb-0">
                <HorizontalCard />
            </Row>

            {stats && (
                <Row className="row-cols-lg-4 row-cols-sm-2 row-cols-1 mb-3 g-3 mt-0">
                    {cockpitCategories.map((cat, idx) => (
                        <Col key={idx}>
                            <Card className="shadow-sm border-0 overflow-hidden h-100">
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
                                            <span className="d-block text-muted small">ทั้งหมด</span>
                                            <span className="fw-bold text-primary fs-14">{cat.stats.total}</span>
                                        </div>
                                        <div className="text-end">
                                            <span className="d-block text-muted small">ผ่าน</span>
                                            <span className="fw-bold text-success fs-14">{cat.stats.passed}</span>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

        </MainLayout>
    );
};

export default HosinfoDashboardPage;
