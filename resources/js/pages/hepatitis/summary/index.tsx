import React, { useState } from 'react';
import PageTitle from '@/components/PageTitle';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardBody, Col, Row, Table, Badge, Form, InputGroup, Button } from 'react-bootstrap';
import ReactApexChart from 'react-apexcharts';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const HepatitisSummaryPage = ({ stats, screenings = [] }: { stats: any, screenings: any[] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const totalScreened = screenings.length;
    const realHbvPositiveCount = screenings.filter(s => s.hbv_positive === 'Positive').length;
    const realHcvPositiveCount = screenings.filter(s => s.hcv_positive === 'Positive').length;
    const realEnteredTreatmentCount = screenings.filter(s => s.hospital_entry_status === 'มา').length;

    const hbvPercent = totalScreened ? Math.round((realHbvPositiveCount / totalScreened) * 100) : 0;
    const hcvPercent = totalScreened ? Math.round((realHcvPositiveCount / totalScreened) * 100) : 0;
    const treatmentPercent = totalScreened ? Math.round((realEnteredTreatmentCount / totalScreened) * 100) : 0;

    const getDynamicColor = (val: number, type: 'hbv' | 'hcv' | 'treatment') => {
        if (type === 'treatment') {
            return val >= 80 ? '#28a745' : val >= 50 ? '#ffc107' : '#dc3545';
        }
        // For HBV and HCV Positive cases
        return val >= 80 ? '#dc3545' : val >= 50 ? '#ffc107' : '#3085d6';
    };

    const getChartOptions = (color: string): any => ({
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
        labels: ['เปอร์เซ็นต์'],
    });

    const filteredScreenings = screenings.filter(s => 
        (s.full_name && s.full_name.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (s.cid && s.cid.includes(searchTerm)) ||
        (s.hospital_name && s.hospital_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredScreenings.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredScreenings.length / itemsPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const getHBVBadge = (val: string) => {
        if (!val || val === '-') return <Badge bg="light" text="dark">-</Badge>;
        if (val === 'Positive') return <Badge bg="danger">Positive</Badge>;
        return <Badge bg="success">Negative</Badge>;
    };

    const getHCVBadge = (val: string) => {
        if (!val || val === '-') return <Badge bg="light" text="dark">-</Badge>;
        if (val === 'Positive') return <Badge bg="danger">Positive</Badge>;
        return <Badge bg="success">Negative</Badge>;
    };

    const getEntryBadge = (val: string) => {
        switch (val) {
            case 'มา': return <Badge bg="success"><IconifyIcon icon="tabler:check" className="me-1" />มา</Badge>;
            case 'ไม่มา': return <Badge bg="danger"><IconifyIcon icon="tabler:x" className="me-1" />ไม่มา</Badge>;
            case 'รักษาที่อื่น': return <Badge bg="info"><IconifyIcon icon="tabler:external-link" className="me-1" />รักษาที่อื่น</Badge>;
            case 'ติดต่อไม่ได้': return <Badge bg="secondary"><IconifyIcon icon="tabler:phone-off" className="me-1" />ติดต่อไม่ได้</Badge>;
            default: return <Badge bg="light" text="dark">-</Badge>;
        }
    };

    const cockpitData = [
        { 
            label: 'พบเชื้อ HBV (+)', 
            value: realHbvPositiveCount, 
            total: totalScreened, 
            percent: hbvPercent, 
            color: getDynamicColor(hbvPercent, 'hbv'), 
            icon: 'tabler:virus',
            subValue: 'Positive'
        },
        { 
            label: 'พบเชื้อ HCV (+)', 
            value: realHcvPositiveCount, 
            total: totalScreened, 
            percent: hcvPercent, 
            color: getDynamicColor(hcvPercent, 'hcv'), 
            icon: 'tabler:virus-off',
            subValue: 'Positive'
        },
        { 
            label: 'เข้าสู่ระบบการรักษา', 
            value: realEnteredTreatmentCount, 
            total: totalScreened, 
            percent: treatmentPercent, 
            color: getDynamicColor(treatmentPercent, 'treatment'), 
            icon: 'tabler:heart-rate-monitor',
            subValue: 'รักษาแล้ว'
        }
    ];

    return (
        <MainLayout>
            <PageTitle title="สรุปผลการรักษา" subTitle="Performance Cockpit" />
            
            <Row className="mb-4 g-3">
                <Col md={3}>
                    <Card className="widget-icon shadow-sm border-0 h-100">
                        <Card.Body className="d-flex align-items-center">
                            <div className="bg-primary-subtle text-primary rounded-circle avatar-lg d-flex align-items-center justify-content-center me-3">
                                <IconifyIcon icon="tabler:users" className="fs-32" />
                            </div>
                            <div className="flex-grow-1">
                                <h5 className="text-uppercase fs-16 fw-bold mb-1">ผู้รับการตรวจทั้งหมด</h5>
                                <h1 className="mb-0 fw-bold display-5 text-primary">{totalScreened.toLocaleString()} <small className="fs-18 fw-normal text-muted">ราย</small></h1>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {cockpitData.map((cat, idx) => (
                    <Col md={3} key={idx}>
                        <Card className="shadow-sm h-100 border-0 overflow-hidden">
                            <CardBody className="p-3 text-center">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h5 className="text-muted fw-bold mb-0 text-uppercase fs-12">{cat.label}</h5>
                                    <IconifyIcon icon={cat.icon} className="fs-18 text-muted opacity-50" />
                                </div>
                                
                                <div className="position-relative" style={{ height: '120px' }}>
                                    <ReactApexChart 
                                        options={getChartOptions(cat.color)} 
                                        series={[cat.percent]} 
                                        type="radialBar" 
                                        height={200} 
                                    />
                                </div>

                                <div className="mt-1 d-flex justify-content-between px-1">
                                    <div className="text-start">
                                        <span className="d-block text-muted small">ทั้งหมด</span>
                                        <span className="fw-bold text-dark fs-14">{cat.total.toLocaleString()}</span>
                                    </div>
                                    <div className="text-end">
                                        <span className="d-block text-muted small">{cat.subValue}</span>
                                        <span className="fw-bold fs-14" style={{ color: cat.color }}>{cat.value.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="progress mt-2" style={{ height: '4px' }}>
                                    <div 
                                        className="progress-bar" 
                                        style={{ 
                                            width: `${cat.percent}%`,
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
                    <Card className="shadow-sm">
                        <Card.Header className="d-flex justify-content-between align-items-center bg-light border-bottom-0">
                            <h4 className="header-title mb-0">รายชื่อผู้รับการตรวจและสถานะการรักษา</h4>
                            <div style={{ width: '300px' }}>
                                <InputGroup size="sm">
                                    <InputGroup.Text><IconifyIcon icon="tabler:search" /></InputGroup.Text>
                                    <Form.Control 
                                        placeholder="ค้นหาชื่อ, เลขบัตร หรือหน่วยบริการ..." 
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    />
                                </InputGroup>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className="table-responsive">
                                <Table hover className="table-centered table-nowrap mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="ps-3" style={{ width: '50px' }}>ลำดับ</th>
                                            <th>ชื่อ-นามสกุล</th>
                                            <th>หน่วยบริการ</th>
                                            <th className="text-center">ผล HBV</th>
                                            <th className="text-center">ผล HCV</th>
                                            <th className="text-center">การเข้าโรงพยาบาล</th>
                                            <th className="text-center">สถานะการรักษา</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.length > 0 ? (
                                            currentItems.map((s, idx) => (
                                                <tr key={s.id}>
                                                    <td className="ps-3">{indexOfFirstItem + idx + 1}</td>
                                                    <td>
                                                        <span className="fw-medium text-primary">{s.full_name}</span>
                                                        <div className="text-muted small">อายุ: {s.age || '-'} ปี</div>
                                                    </td>
                                                    <td>{s.hospital_name || '-'}</td>
                                                    <td className="text-center">{getHBVBadge(s.hbv_positive)}</td>
                                                    <td className="text-center">{getHCVBadge(s.hcv_positive)}</td>
                                                    <td className="text-center">{getEntryBadge(s.hospital_entry_status)}</td>
                                                    <td className="text-center">
                                                        {s.hbv_treatment_status ? (
                                                            <Badge bg="info" className="px-2">{s.hbv_treatment_status}</Badge>
                                                        ) : (
                                                            <span className="text-muted">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="text-center py-5 text-muted">
                                                     ไม่พบข้อมูลที่ค้นหา
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                        {totalPages > 1 && (
                            <Card.Footer className="d-flex justify-content-between align-items-center bg-white py-2">
                                <div className="text-muted small">
                                    แสดง {indexOfFirstItem + 1} ถึง {Math.min(indexOfLastItem, filteredScreenings.length)} จาก {filteredScreenings.length} รายการ
                                </div>
                                <div className="d-flex gap-1">
                                    <Button 
                                        variant="outline-primary" 
                                        size="sm" 
                                        disabled={currentPage === 1}
                                        onClick={() => handlePageChange(currentPage - 1)}
                                    >
                                        ก่อนหน้า
                                    </Button>
                                    {[...Array(totalPages)].map((_, i) => {
                                        if (totalPages > 5) {
                                            if (i + 1 === 1 || i + 1 === totalPages || (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1)) {
                                                return (
                                                    <Button 
                                                        key={i} 
                                                        variant={currentPage === i + 1 ? 'primary' : 'outline-primary'} 
                                                        size="sm"
                                                        onClick={() => handlePageChange(i + 1)}
                                                    >
                                                        {i + 1}
                                                    </Button>
                                                );
                                            } else if (i + 1 === currentPage - 2 || i + 1 === currentPage + 2) {
                                                return <span key={i} className="px-1 text-muted">...</span>;
                                            }
                                            return null;
                                        }
                                        return (
                                            <Button 
                                                key={i} 
                                                variant={currentPage === i + 1 ? 'primary' : 'outline-primary'} 
                                                size="sm"
                                                onClick={() => handlePageChange(i + 1)}
                                            >
                                                {i + 1}
                                            </Button>
                                        );
                                    })}
                                    <Button 
                                        variant="outline-primary" 
                                        size="sm" 
                                        disabled={currentPage === totalPages}
                                        onClick={() => handlePageChange(currentPage + 1)}
                                    >
                                        ถัดไป
                                    </Button>
                                </div>
                            </Card.Footer>
                        )}
                    </Card>
                </Col>
            </Row>
        </MainLayout>
    );
};

export default HepatitisSummaryPage;
