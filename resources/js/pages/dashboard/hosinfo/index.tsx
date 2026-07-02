import small1Img from '@/images/small/small-22.jpg';
import small4Img from '@/images/small/small-21.jpg';
import MainLayout from '@/layouts/MainLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useState } from 'react';
import { Col, Row, Card, CardBody, CardTitle } from 'react-bootstrap';

const IconLink = ({ 
    icon, 
    title, 
    subtitle, 
    href, 
    color,
    hasExternalIcon
}: { 
    icon: string; 
    title: string; 
    subtitle: string; 
    href: string;
    color: string;
    hasExternalIcon?: boolean;
}) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <Link 
            href={href} 
            className="text-decoration-none d-flex align-items-center bg-white" 
            style={{ 
                padding: '14px 20px', 
                borderRadius: '16px', 
                width: '100%',
                maxWidth: '360px',
                transition: 'all 0.3s ease',
                border: isHovered ? `2px solid ${color}` : '2px solid transparent',
                boxShadow: isHovered ? `0 10px 25px -5px ${color}40` : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                transform: isHovered ? 'translateY(-3px)' : 'none',
                cursor: 'pointer'
            }} 
            onMouseEnter={() => setIsHovered(true)} 
            onMouseLeave={() => setIsHovered(false)}
        >
            <div 
                className="d-flex justify-content-center align-items-center text-white me-3" 
                style={{ 
                    width: '64px', 
                    height: '64px', 
                    borderRadius: '16px',
                    backgroundColor: color,
                    flexShrink: 0
                }}
            >
                <IconifyIcon icon={icon} width="32" height="32" />
            </div>
            <div className="flex-grow-1 text-start">
                <div className="fw-bold fs-18 mb-1" style={{ color: isHovered ? color : '#4b5563', transition: 'color 0.3s ease' }}>{title}</div>
                <div className="fs-14 text-muted">{subtitle}</div>
            </div>
            {hasExternalIcon && (
                <div className="ms-2 text-muted" style={{ opacity: 0.5 }}>
                    <IconifyIcon icon="ph:arrow-square-out" width="24" height="24" />
                </div>
            )}
        </Link>
    );
};
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
    const { hospital, stats, statsTitle } = usePage().props as any;

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

            <Row className="mb-3">
                <Col xs={12}>
                    <div className="d-flex flex-column flex-lg-row gap-3 justify-content-center align-items-center w-100">
                        <IconLink 
                            icon="ph:megaphone-fill" 
                            title="ประกาศ" 
                            subtitle="ข่าวสารและอัปเดต" 
                            href="/pages/about" 
                            color="#f59e0b" 
                        />
                        <IconLink 
                            icon="ph:users-fill" 
                            title="ผู้พัฒนา" 
                            subtitle="ติดต่อผู้พัฒนา HOS-info" 
                            href="/pages/contact-us" 
                            color="#6385e6" 
                        />
                        <IconLink 
                            icon="ph:book-open-fill" 
                            title="คู่มือ" 
                            subtitle="เอกสารแนะนำการใช้งาน" 
                            href="/pages/support" 
                            color="#5db486" 
                            hasExternalIcon
                        />
                    </div>
                </Col>
            </Row>
            
            <Row className="mt-0 mb-3">
                <HorizontalCard />
            </Row>


            {stats && (
                <>
                    <Row className="mb-2 px-1">
                        <Col xs={12}>
                            <h5 className="fw-bold text-dark fs-18 mb-0">{statsTitle}</h5>
                        </Col>
                    </Row>
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
                </>
            )}

        </MainLayout>
    );
};

export default HosinfoDashboardPage;
