import { useEffect, useState, useMemo } from 'react';
import PageTitle from '@/components/PageTitle';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardBody, Col, Row, Spinner, Table, Tab, Nav, Button, Form, Badge } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import axios from 'axios';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface ReferSummary {
    total_refer: number;
    total_referout: number;
    total_referin: number;
    emergency_cases: number;
}

interface TrendItem {
    label: string;
    refer_out: number;
    refer_in: number;
}

interface HospitalItem {
    hospcode: string;
    name: string;
    count: number;
}

interface ICD10Item {
    pdx: string;
    diag: string;
    tname: string;
    count: number;
}

interface CauseItem {
    code: string;
    name: string;
    count: number;
}

interface TriageItem {
    type_id: number;
    type_name: string;
    count: number;
    color: string;
}

interface ReferCase {
    referout_id: number;
    refer_date: string;
    refer_time: string;
    hn: string;
    pt_name: string;
    dest_hospname: string;
    pdx: string;
    diag: string;
    cause_name: string;
    emergency_name: string;
}

const ReferStatsPage = ({ api_token, external_api_url }: { api_token: string; external_api_url: string }) => {
    const currentBE = new Date().getFullYear() + (new Date().getMonth() > 8 ? 1 : 0) + 543;
    const [fiscalYear, setFiscalYear] = useState<number>(currentBE);
    const [trendMode, setTrendMode] = useState<'monthly' | 'weekly' | 'hourly'>('monthly');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Data States
    const [summary, setSummary] = useState<ReferSummary>({ total_refer: 0, total_referout: 0, total_referin: 0, emergency_cases: 0 });
    const [trends, setTrends] = useState<TrendItem[]>([]);
    const [hospitalsOut, setHospitalsOut] = useState<HospitalItem[]>([]);
    const [hospitalsIn, setHospitalsIn] = useState<HospitalItem[]>([]);
    const [topICD10, setTopICD10] = useState<ICD10Item[]>([]);
    const [referCauses, setReferCauses] = useState<CauseItem[]>([]);
    const [triageLevels, setTriageLevels] = useState<TriageItem[]>([]);
    const [referCases, setReferCases] = useState<ReferCase[]>([]);

    // Search filter for case list
    const [searchTerm, setSearchTerm] = useState<string>('');

    const fetchData = async (year: number, mode: 'monthly' | 'weekly' | 'hourly') => {
        try {
            setLoading(true);
            const apiUrl = external_api_url || 'http://127.0.0.1:8800';
            const headers = { Authorization: `Bearer ${api_token}` };

            const [summaryRes, trendsRes, hospRes, causesRes, triageRes, casesRes] = await Promise.all([
                axios.get(`${apiUrl}/api/v1/refer/summary?fiscal_year=${year}`, { headers }),
                axios.get(`${apiUrl}/api/v1/refer/trends?fiscal_year=${year}&mode=${mode}`, { headers }),
                axios.get(`${apiUrl}/api/v1/refer/hospitals?fiscal_year=${year}`, { headers }),
                axios.get(`${apiUrl}/api/v1/refer/causes-icd10?fiscal_year=${year}`, { headers }),
                axios.get(`${apiUrl}/api/v1/refer/triage-levels?fiscal_year=${year}`, { headers }),
                axios.get(`${apiUrl}/api/v1/refer/referout-list?fiscal_year=${year}`, { headers }),
            ]);

            setSummary(summaryRes.data);
            setTrends(trendsRes.data.data || []);
            setHospitalsOut(hospRes.data.refer_out || []);
            setHospitalsIn(hospRes.data.refer_in || []);
            setTopICD10(causesRes.data.top_icd10 || []);
            setReferCauses(causesRes.data.refer_causes || []);
            setTriageLevels(triageRes.data.triage_levels || []);
            setReferCases(casesRes.data.data || []);
            setError(null);
        } catch (err: any) {
            console.error('Refer API Error:', err);
            const msg = err.response?.data?.detail || err.message || 'ไม่สามารถเชื่อมต่อกับ API ได้';
            setError(`เกิดข้อผิดพลาดในการโหลดข้อมูล: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(fiscalYear, trendMode);
    }, [fiscalYear, trendMode]);

    // Trend Chart Config
    const trendChartOptions: ApexOptions = useMemo(() => ({
        chart: {
            type: 'area',
            height: 340,
            toolbar: { show: true },
            fontFamily: 'Inter, sans-serif'
        },
        colors: ['#d9534f', '#0275d8'],
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2.5 },
        fill: {
            type: 'gradient',
            gradient: { opacityFrom: 0.45, opacityTo: 0.05 }
        },
        xaxis: {
            categories: trends.map(t => t.label),
            labels: { style: { colors: '#6c757d', fontSize: '12px' } }
        },
        yaxis: {
            title: { text: 'จำนวนเคส (ราย)' },
            labels: { formatter: (val) => `${Math.round(val)}` }
        },
        legend: { position: 'top', horizontalAlign: 'right' },
        tooltip: { shared: true, intersect: false }
    }), [trends]);

    const trendChartSeries = useMemo(() => [
        { name: 'ส่งตัวออก (Refer Out)', data: trends.map(t => t.refer_out) },
        { name: 'รับส่งต่อเข้า (Refer In)', data: trends.map(t => t.refer_in) }
    ], [trends]);

    // Hosp Out Donut Options
    const hospOutChartOptions: ApexOptions = useMemo(() => ({
        chart: { type: 'donut', height: 320 },
        labels: hospitalsOut.map(h => h.name),
        colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26a69a', '#D10CE8'],
        legend: { position: 'bottom', fontSize: '12px' },
        dataLabels: { enabled: true, formatter: (val) => `${Number(val).toFixed(1)}%` }
    }), [hospitalsOut]);

    const hospOutChartSeries = useMemo(() => hospitalsOut.map(h => h.count), [hospitalsOut]);

    // Hosp In Donut Options
    const hospInChartOptions: ApexOptions = useMemo(() => ({
        chart: { type: 'donut', height: 320 },
        labels: hospitalsIn.map(h => h.name),
        colors: ['#2E93fA', '#66DA26', '#546E7A', '#E91E63', '#FF9800', '#9C27B0', '#00BCD4', '#8BC34A'],
        legend: { position: 'bottom', fontSize: '12px' },
        dataLabels: { enabled: true, formatter: (val) => `${Number(val).toFixed(1)}%` }
    }), [hospitalsIn]);

    const hospInChartSeries = useMemo(() => hospitalsIn.map(h => h.count), [hospitalsIn]);

    // Referral Causes Bar Options
    const causeChartOptions: ApexOptions = useMemo(() => ({
        chart: { type: 'bar', height: 320, toolbar: { show: false } },
        plotOptions: { bar: { borderRadius: 4, horizontal: true } },
        colors: ['#3B82F6'],
        dataLabels: { enabled: true },
        xaxis: { categories: referCauses.map(c => c.name.length > 25 ? c.name.substring(0, 25) + '...' : c.name) }
    }), [referCauses]);

    const causeChartSeries = useMemo(() => [{
        name: 'จำนวนเคส',
        data: referCauses.map(c => c.count)
    }], [referCauses]);

    // Triage Level Donut Options
    const triageChartOptions: ApexOptions = useMemo(() => ({
        chart: { type: 'donut', height: 300 },
        labels: triageLevels.map(t => t.type_name),
        colors: triageLevels.map(t => t.color),
        legend: { position: 'bottom' },
        dataLabels: { enabled: true, formatter: (val) => `${Number(val).toFixed(1)}%` }
    }), [triageLevels]);

    const triageChartSeries = useMemo(() => triageLevels.map(t => t.count), [triageLevels]);

    // Filtered Case List
    const filteredCases = useMemo(() => {
        if (!searchTerm) return referCases;
        const lower = searchTerm.toLowerCase();
        return referCases.filter(c => 
            (c.hn && c.hn.toLowerCase().includes(lower)) ||
            (c.pt_name && c.pt_name.toLowerCase().includes(lower)) ||
            (c.dest_hospname && c.dest_hospname.toLowerCase().includes(lower)) ||
            (c.pdx && c.pdx.toLowerCase().includes(lower)) ||
            (c.diag && c.diag.toLowerCase().includes(lower))
        );
    }, [referCases, searchTerm]);

    return (
        <MainLayout>
            <PageTitle title="รับ-ส่งต่อ (Referral)" subTitle="Dashboard สถิติการรับส่งต่อผู้ป่วย" />

            {/* Top Control Bar */}
            <Row className="mb-4 align-items-center">
                <Col md={6}>
                    <h4 className="fw-bold mb-1 d-flex align-items-center text-dark">
                        <IconifyIcon icon="solar:transfer-horizontal-bold-duotone" className="me-2 text-danger fs-28" />
                        ระบบสถิติการรับ-ส่งต่อผู้ป่วย (Referral Dashboard)
                    </h4>
                    <p className="text-muted mb-0 fs-13">วิเคราะห์ข้อมูลการ Refer In / Refer Out, โรงพยาบาลต้นทาง-ปลายทาง และระดับความวิกฤต</p>
                </Col>
                <Col md={6} className="d-flex justify-content-md-end justify-content-start mt-3 mt-md-0 gap-2 flex-wrap">
                    {/* Fiscal Year Filter */}
                    <div className="d-flex align-items-center bg-white border rounded px-3 py-1 shadow-sm">
                        <IconifyIcon icon="solar:calendar-bold-duotone" className="text-danger me-2 fs-18" />
                        <span className="fs-13 fw-semibold text-dark me-2">ปีงบประมาณ:</span>
                        <Form.Select 
                            size="sm" 
                            className="border-0 bg-transparent fw-bold text-danger fs-14 shadow-none"
                            value={fiscalYear}
                            onChange={(e) => setFiscalYear(Number(e.target.value))}
                            style={{ cursor: 'pointer', width: 'auto' }}
                        >
                            {[2569, 2568, 2567, 2566, 2565].map(year => (
                                <option key={year} value={year}>ปีงบประมาณ {year}</option>
                            ))}
                        </Form.Select>
                    </div>

                    <Button 
                        variant="light" 
                        size="sm" 
                        className="border shadow-sm d-flex align-items-center px-3"
                        onClick={() => fetchData(fiscalYear, trendMode)}
                    >
                        <IconifyIcon icon="solar:restart-bold-duotone" className="me-1 fs-16" />
                        รีเฟรช
                    </Button>
                </Col>
            </Row>

            {error && (
                <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                    <IconifyIcon icon="solar:danger-triangle-bold-duotone" className="fs-20 me-2" />
                    <div>{error}</div>
                </div>
            )}

            {/* Summary Cards */}
            <Row className="g-3 mb-4">
                <Col xl={3} md={6}>
                    <Card className="border-0 shadow-sm overflow-hidden h-100">
                        <CardBody className="p-3">
                            <div className="d-flex align-items-center">
                                <div className="avatar-md rounded bg-danger-subtle text-danger d-flex align-items-center justify-content-center me-3 fs-24">
                                    <IconifyIcon icon="solar:transfer-horizontal-bold" />
                                </div>
                                <div>
                                    <p className="text-muted mb-0 fs-13 fw-medium">เคสรับ-ส่งต่อรวม</p>
                                    <h3 className="fw-bold mb-0 text-dark">
                                        {loading ? <Spinner animation="border" size="sm" /> : summary.total_refer.toLocaleString()}
                                        <span className="fs-13 fw-normal text-muted ms-1">ราย</span>
                                    </h3>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
                <Col xl={3} md={6}>
                    <Card className="border-0 shadow-sm overflow-hidden h-100">
                        <CardBody className="p-3">
                            <div className="d-flex align-items-center">
                                <div className="avatar-md rounded bg-warning-subtle text-warning d-flex align-items-center justify-content-center me-3 fs-24">
                                    <IconifyIcon icon="solar:export-bold" />
                                </div>
                                <div>
                                    <p className="text-muted mb-0 fs-13 fw-medium">ส่งตัวออก (Refer Out)</p>
                                    <h3 className="fw-bold mb-0 text-dark">
                                        {loading ? <Spinner animation="border" size="sm" /> : summary.total_referout.toLocaleString()}
                                        <span className="fs-13 fw-normal text-muted ms-1">ราย</span>
                                    </h3>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
                <Col xl={3} md={6}>
                    <Card className="border-0 shadow-sm overflow-hidden h-100">
                        <CardBody className="p-3">
                            <div className="d-flex align-items-center">
                                <div className="avatar-md rounded bg-primary-subtle text-primary d-flex align-items-center justify-content-center me-3 fs-24">
                                    <IconifyIcon icon="solar:import-bold" />
                                </div>
                                <div>
                                    <p className="text-muted mb-0 fs-13 fw-medium">รับส่งต่อเข้า (Refer In)</p>
                                    <h3 className="fw-bold mb-0 text-dark">
                                        {loading ? <Spinner animation="border" size="sm" /> : summary.total_referin.toLocaleString()}
                                        <span className="fs-13 fw-normal text-muted ms-1">ราย</span>
                                    </h3>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
                <Col xl={3} md={6}>
                    <Card className="border-0 shadow-sm overflow-hidden h-100">
                        <CardBody className="p-3">
                            <div className="d-flex align-items-center">
                                <div className="avatar-md rounded bg-danger text-white d-flex align-items-center justify-content-center me-3 fs-24 shadow-sm">
                                    <IconifyIcon icon="solar:siren-bold" />
                                </div>
                                <div>
                                    <p className="text-muted mb-0 fs-13 fw-medium">เคสวิกฤต/ฉุกเฉิน</p>
                                    <h3 className="fw-bold mb-0 text-danger">
                                        {loading ? <Spinner animation="border" size="sm" /> : summary.emergency_cases.toLocaleString()}
                                        <span className="fs-13 fw-normal text-muted ms-1">ราย</span>
                                    </h3>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* Main Tabs Container */}
            <Tab.Container defaultActiveKey="overview">
                <Card className="border-0 shadow-sm mb-4">
                    <CardBody className="p-2">
                        <Nav role="tablist" className="nav-tabs nav-bordered nav-bordered-danger">
                            <Nav.Item>
                                <Nav.Link eventKey="overview" className="py-2 fs-14">
                                    <IconifyIcon icon="solar:chart-bold-duotone" className="me-2 fs-18 align-middle" />
                                    ภาพรวมสถิติและแนวโน้ม
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="hospitals" className="py-2 fs-14">
                                    <IconifyIcon icon="solar:hospital-bold-duotone" className="me-2 fs-18 align-middle" />
                                    สัดส่วน รพ. ต้นทาง-ปลายทาง & สาเหตุ
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="icd10" className="py-2 fs-14">
                                    <IconifyIcon icon="solar:document-medicine-bold-duotone" className="me-2 fs-18 align-middle" />
                                    อันดับโรค ICD-10
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="triage" className="py-2 fs-14">
                                    <IconifyIcon icon="solar:shield-warning-bold-duotone" className="me-2 fs-18 align-middle" />
                                    ระดับความวิกฤต Triage
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="cases" className="py-2 fs-14">
                                    <IconifyIcon icon="solar:users-group-two-rounded-bold-duotone" className="me-2 fs-18 align-middle" />
                                    รายชื่อเคสส่งต่อ
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </CardBody>
                </Card>

                <Tab.Content>
                    {/* Tab 1: Overview & Trends */}
                    <Tab.Pane eventKey="overview">
                        <Card className="border-0 shadow-sm mb-4">
                            <CardBody className="p-4">
                                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 border-bottom pb-3">
                                    <div>
                                        <h5 className="fw-bold text-dark mb-1">แนวโน้มปริมาณการรับ-ส่งต่อผู้ป่วย</h5>
                                        <p className="text-muted mb-0 fs-13">เปรียบเทียบปริมาณ Refer Out และ Refer In เพื่อใช้วางแผนช่วงเวลาหนาแน่น</p>
                                    </div>
                                    <div className="btn-group btn-group-sm">
                                        <Button 
                                            variant={trendMode === 'monthly' ? 'danger' : 'outline-secondary'}
                                            onClick={() => setTrendMode('monthly')}
                                        >
                                            รายเดือน
                                        </Button>
                                        <Button 
                                            variant={trendMode === 'weekly' ? 'danger' : 'outline-secondary'}
                                            onClick={() => setTrendMode('weekly')}
                                        >
                                            รายสัปดาห์ (วัน)
                                        </Button>
                                        <Button 
                                            variant={trendMode === 'hourly' ? 'danger' : 'outline-secondary'}
                                            onClick={() => setTrendMode('hourly')}
                                        >
                                            ช่วงเวลา (24 ชม.)
                                        </Button>
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="text-center py-5">
                                        <Spinner animation="border" variant="danger" />
                                        <p className="mt-2 text-muted fs-13">กำลังโหลดข้อมูลกราฟแนวโน้ม...</p>
                                    </div>
                                ) : (
                                    <ReactApexChart options={trendChartOptions} series={trendChartSeries} type="area" height={340} />
                                )}
                            </CardBody>
                        </Card>
                    </Tab.Pane>

                    {/* Tab 2: Hospitals & Causes */}
                    <Tab.Pane eventKey="hospitals">
                        <Row className="g-4 mb-4">
                            {/* Top Destination Hospitals */}
                            <Col lg={6}>
                                <Card className="border-0 shadow-sm h-100">
                                    <CardBody className="p-4">
                                        <h5 className="fw-bold text-dark mb-1 d-flex align-items-center">
                                            <IconifyIcon icon="solar:export-bold" className="text-danger me-2 fs-20" />
                                            รพ. ปลายทางที่ส่งไปมากที่สุด (Refer Out)
                                        </h5>
                                        <p className="text-muted fs-13 mb-3">สัดส่วนโรงพยาบาลรับส่งต่อปลายทาง</p>

                                        {loading ? (
                                            <div className="text-center py-5"><Spinner animation="border" size="sm" /></div>
                                        ) : hospitalsOut.length > 0 ? (
                                            <ReactApexChart options={hospOutChartOptions} series={hospOutChartSeries} type="donut" height={320} />
                                        ) : (
                                            <p className="text-center text-muted py-5">ไม่มีข้อมูล</p>
                                        )}
                                    </CardBody>
                                </Card>
                            </Col>

                            {/* Top Origin Hospitals */}
                            <Col lg={6}>
                                <Card className="border-0 shadow-sm h-100">
                                    <CardBody className="p-4">
                                        <h5 className="fw-bold text-dark mb-1 d-flex align-items-center">
                                            <IconifyIcon icon="solar:import-bold" className="text-primary me-2 fs-20" />
                                            รพ. ต้นทางที่ส่งมามากที่สุด (Refer In)
                                        </h5>
                                        <p className="text-muted fs-13 mb-3">สัดส่วนโรงพยาบาลและ รพ.สต. ที่ส่งผู้ป่วยมา</p>

                                        {loading ? (
                                            <div className="text-center py-5"><Spinner animation="border" size="sm" /></div>
                                        ) : hospitalsIn.length > 0 ? (
                                            <ReactApexChart options={hospInChartOptions} series={hospInChartSeries} type="donut" height={320} />
                                        ) : (
                                            <p className="text-center text-muted py-5">ไม่มีข้อมูล</p>
                                        )}
                                    </CardBody>
                                </Card>
                            </Col>

                            {/* Referral Causes */}
                            <Col lg={12}>
                                <Card className="border-0 shadow-sm">
                                    <CardBody className="p-4">
                                        <h5 className="fw-bold text-dark mb-1">สาเหตุหลักในการส่งต่อผู้ป่วย (Referral Causes)</h5>
                                        <p className="text-muted fs-13 mb-3">วิเคราะห์สาเหตุการส่งต่อ เช่น ขีดความสามารถ บุคลากร เครื่องมือ หรือความประสงค์ของผู้ป่วย</p>

                                        {loading ? (
                                            <div className="text-center py-5"><Spinner animation="border" size="sm" /></div>
                                        ) : (
                                            <ReactApexChart options={causeChartOptions} series={causeChartSeries} type="bar" height={320} />
                                        )}
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </Tab.Pane>

                    {/* Tab 3: Top ICD-10 Diagnoses */}
                    <Tab.Pane eventKey="icd10">
                        <Card className="border-0 shadow-sm mb-4">
                            <CardBody className="p-4">
                                <h5 className="fw-bold text-dark mb-1">อันดับโรค 10 อันดับแรกที่ต้องส่งต่อ (Top 10 Refer ICD-10)</h5>
                                <p className="text-muted fs-13 mb-4">จัดอันดับรหัสโรค ICD-10 ที่มีจำนวนเคสส่งตัวไปรักษาต่อสูงที่สุด</p>

                                <div className="table-responsive">
                                    <Table hover bordered size="sm" className="align-middle fs-13 mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="text-center" style={{ width: '60px' }}>อันดับ</th>
                                                <th className="text-center" style={{ width: '100px' }}>ICD-10</th>
                                                <th>ชื่อโรค (English)</th>
                                                <th>ชื่อโรค (ภาษาไทย)</th>
                                                <th className="text-end" style={{ width: '130px' }}>จำนวน (เคส)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr><td colSpan={5} className="text-center py-5"><Spinner animation="border" size="sm" /></td></tr>
                                            ) : topICD10.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="text-center fw-bold text-muted">{idx + 1}</td>
                                                    <td className="text-center font-monospace fw-bold text-danger">{item.pdx}</td>
                                                    <td className="fw-medium text-dark">{item.diag}</td>
                                                    <td className="text-secondary">{item.tname || '-'}</td>
                                                    <td className="text-end font-monospace fw-bold text-dark">
                                                        {item.count.toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </CardBody>
                        </Card>
                    </Tab.Pane>

                    {/* Tab 4: Triage / Emergency Levels */}
                    <Tab.Pane eventKey="triage">
                        <Row className="g-4 mb-4">
                            <Col lg={5}>
                                <Card className="border-0 shadow-sm h-100">
                                    <CardBody className="p-4">
                                        <h5 className="fw-bold text-dark mb-1">สัดส่วนตามระดับความวิกฤต (Triage Level)</h5>
                                        <p className="text-muted fs-13 mb-3">ใช้วางแผนจัดสรรบุคลากรทางการแพทย์ รถรีเฟอร์ (Ambulance) และพยาบาลรีเฟอร์</p>

                                        {loading ? (
                                            <div className="text-center py-5"><Spinner animation="border" size="sm" /></div>
                                        ) : (
                                            <ReactApexChart options={triageChartOptions} series={triageChartSeries} type="donut" height={300} />
                                        )}
                                    </CardBody>
                                </Card>
                            </Col>

                            <Col lg={7}>
                                <Card className="border-0 shadow-sm h-100">
                                    <CardBody className="p-4">
                                        <h5 className="fw-bold text-dark mb-3">สรุปจำนวนเคสตามระดับความเร่งด่วน</h5>
                                        
                                        <div className="d-flex flex-column gap-3">
                                            {triageLevels.map((item, idx) => {
                                                const totalCount = summary.total_referout || 1;
                                                const pct = ((item.count / totalCount) * 100).toFixed(1);
                                                return (
                                                    <div key={idx} className="p-3 border rounded bg-light">
                                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                                            <span className="fw-bold fs-14" style={{ color: item.color }}>
                                                                ● {item.type_name}
                                                            </span>
                                                            <span className="badge rounded-pill px-3 py-1 fs-13 text-white" style={{ backgroundColor: item.color }}>
                                                                {item.count.toLocaleString()} ราย ({pct}%)
                                                            </span>
                                                        </div>
                                                        <div className="progress" style={{ height: '8px' }}>
                                                            <div 
                                                                className="progress-bar" 
                                                                role="progressbar" 
                                                                style={{ width: `${pct}%`, backgroundColor: item.color }} 
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </Tab.Pane>

                    {/* Tab 5: Cases List */}
                    <Tab.Pane eventKey="cases">
                        <Card className="border-0 shadow-sm mb-4">
                            <CardBody className="p-4">
                                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                                    <div>
                                        <h5 className="fw-bold text-dark mb-1">รายชื่อผู้ป่วยส่งต่อล่าสุด (Refer Out Cases)</h5>
                                        <p className="text-muted mb-0 fs-13">ค้นหาและดูข้อมูลการส่งตัวย้อนหลัง</p>
                                    </div>
                                    <div style={{ maxWidth: '300px', width: '100%' }}>
                                        <Form.Control 
                                            size="sm" 
                                            type="text" 
                                            placeholder="🔍 ค้นหา HN, ชื่อผู้ป่วย, รพ. หรือ โรค..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="table-responsive">
                                    <Table hover bordered size="sm" className="align-middle fs-13 mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="text-center" style={{ width: '110px' }}>วัน-เวลาส่งตัว</th>
                                                <th className="text-center" style={{ width: '90px' }}>HN</th>
                                                <th>ชื่อ-นามสกุล</th>
                                                <th>รพ. ปลายทาง</th>
                                                <th className="text-center" style={{ width: '80px' }}>ICD-10</th>
                                                <th>การวินิจฉัย</th>
                                                <th>สาเหตุที่ส่งต่อ</th>
                                                <th className="text-center" style={{ width: '110px' }}>ระดับความเร่งด่วน</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr><td colSpan={8} className="text-center py-5"><Spinner animation="border" size="sm" /></td></tr>
                                            ) : filteredCases.length > 0 ? (
                                                filteredCases.map((item) => (
                                                    <tr key={item.referout_id}>
                                                        <td className="text-center font-monospace fs-12">
                                                            {item.refer_date}<br />
                                                            <span className="text-muted fs-11">{item.refer_time}</span>
                                                        </td>
                                                        <td className="text-center font-monospace text-primary fw-bold">{item.hn}</td>
                                                        <td className="fw-medium text-dark">{item.pt_name}</td>
                                                        <td className="fw-semibold text-danger">{item.dest_hospname}</td>
                                                        <td className="text-center font-monospace fw-bold">{item.pdx}</td>
                                                        <td>{item.diag}</td>
                                                        <td className="text-secondary fs-12">{item.cause_name}</td>
                                                        <td className="text-center">
                                                            <Badge bg="secondary" className="px-2 py-1 fs-11">
                                                                {item.emergency_name}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan={8} className="text-center py-4 text-muted">ไม่พบข้อมูลตามคำค้นหา</td></tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            </CardBody>
                        </Card>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </MainLayout>
    );
};

export default ReferStatsPage;
