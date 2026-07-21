import React, { useEffect, useState, Fragment } from 'react';
import PageTitle from '@/components/PageTitle';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardBody, Col, Row, Spinner, Table, Tab, Nav, Form, Pagination } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import axios from 'axios';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { usePage } from '@inertiajs/react';
import WardDetailPage from './WardDetailPage';

const IpdStatsPage = ({ api_token, external_api_url }: { api_token: string, external_api_url: string }) => {
    // Read the ward query parameter from the URL
    const [wardId, setWardId] = useState<string | null>(null);
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        setWardId(queryParams.get('ward'));
    }, []);

    const { auth, wards } = usePage<any>().props;

    const currentBE = new Date().getFullYear() + (new Date().getMonth() > 8 ? 1 : 0) + 543;
    const [fiscalYear, setFiscalYear] = useState(currentBE);
    const [loading, setLoading] = useState(true);
    const [summaryData, setSummaryData] = useState<any[]>([]);
    const [occupancyData, setOccupancyData] = useState<any[]>([]);
    const [genderData, setGenderData] = useState<any[]>([]);
    const [topDiseases, setTopDiseases] = useState<any[]>([]);
    const [wardMonthlyData, setWardMonthlyData] = useState<any[]>([]);
    const [wardOccupancyData, setWardOccupancyData] = useState<any[]>([]);
    const [todaySummary, setTodaySummary] = useState<any>(null);
    const [incomeSummary, setIncomeSummary] = useState<any>(null);
    const [admitList, setAdmitList] = useState<any[]>([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState('vstdate');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const [error, setError] = useState<string | null>(null);

    const fetchData = async (year: number) => {
        try {
            setLoading(true);
            const apiUrl = external_api_url || 'http://127.0.0.1:8800';
            const headers = { Authorization: `Bearer ${api_token}` };

            const [summaryRes, occupancyRes, genderRes, icd10Res, wardMonthlyRes, wardOccupancyRes, todayRes, incomeRes, admitRes] = await Promise.all([
                axios.get(`${apiUrl}/api/v1/ipd/stats-summary?fiscal_year=${year}`, { headers }),
                axios.get(`${apiUrl}/api/v1/ipd/stats-occupancy?fiscal_year=${year}`, { headers }),
                axios.get(`${apiUrl}/api/v1/ipd/stats-gender?fiscal_year=${year}`, { headers }),
                axios.get(`${apiUrl}/api/v1/ipd/stats-icd10?fiscal_year=${year}`, { headers }),
                axios.get(`${apiUrl}/api/v1/ipd/stats-ward-monthly?fiscal_year=${year}`, { headers }),
                axios.get(`${apiUrl}/api/v1/ipd/stats-ward-occupancy?fiscal_year=${year}`, { headers }),
                axios.get(`${apiUrl}/api/v1/ipd/summary-today`, { headers }),
                axios.get(`${apiUrl}/api/v1/ipd/income-summary`, { headers }),
                auth?.user ? axios.get(`${apiUrl}/api/v1/ipd/admit-list`, { headers }) : Promise.resolve({ data: { data: [] } }),
            ]);

            setSummaryData(summaryRes.data.data || []);
            setOccupancyData(occupancyRes.data.data || []);
            setGenderData(genderRes.data.data || []);
            setTopDiseases(icd10Res.data.data || []);
            setWardMonthlyData(wardMonthlyRes.data.data || []);
            setWardOccupancyData(wardOccupancyRes.data.data || []);
            setTodaySummary(todayRes.data || null);
            setIncomeSummary(incomeRes.data || null);
            setAdmitList(admitRes?.data?.data || []);
            setError(null);
        } catch (err: any) {
            console.error('API Error:', err);
            const msg = err.response?.data?.detail || err.message || 'ไม่สามารถเชื่อมต่อกับ API ได้';
            setError(`API Error: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(fiscalYear);
    }, [fiscalYear]);

    const monthNames = ['ต.ค.', 'พ.ย.', 'ธ.ค.', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.'];
    
    const getMonthName = (monthStr: string) => {
        const m = parseInt(monthStr, 10);
        const monthNamesMap: { [key: number]: string } = {
            10: 'ตุลาคม (ต.ค.)',
            11: 'พฤศจิกายน (พ.ย.)',
            12: 'ธันวาคม (ธ.ค.)',
            1: 'มกราคม (ม.ค.)',
            2: 'กุมภาพันธ์ (ก.พ.)',
            3: 'มีนาคม (มี.ค.)',
            4: 'เมษายน (เม.ย.)',
            5: 'พฤษภาคม (พ.ค.)',
            6: 'มิถุนายน (มิ.ย.)',
            7: 'กรกฎาคม (ก.ค.)',
            8: 'สิงหาคม (ส.ค.)',
            9: 'กันยายน (ก.ย.)'
        };
        return monthNamesMap[m] || monthStr;
    };

    const sortDataByFiscalMonth = (data: any[]) => {
        if (!Array.isArray(data)) return [];
        const order = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        return [...data].sort((a, b) => {
            const m1 = parseInt(a?.AM || '0');
            const m2 = parseInt(b?.AM || '0');
            return order.indexOf(m1) - order.indexOf(m2);
        });
    };

    const sortedSummary = sortDataByFiscalMonth(summaryData);
    const sortedOccupancy = sortDataByFiscalMonth(occupancyData);

    const totalIpdPatients = sortedSummary.reduce((acc, curr) => acc + (curr.count || 0), 0);
    const avgOccupancyRate = sortedOccupancy.length > 0
        ? sortedOccupancy.reduce((acc, curr) => acc + (typeof curr.admsum === 'number' ? curr.admsum : parseFloat(curr.admsum || 0)), 0) / sortedOccupancy.length
        : 0;

    const visitChartOptions: ApexOptions = {
        chart: { type: 'bar', toolbar: { show: true } },
        plotOptions: { bar: { horizontal: false, columnWidth: '55%', borderRadius: 4 } },
        xaxis: { categories: monthNames },
        colors: ['#00d1b2'],
        dataLabels: { enabled: true },
        title: { text: `จำนวนผู้ป่วยในรายเดือน ปีงบประมาณ ${fiscalYear}`, align: 'center' }
    };

    const occupancyChartOptions: ApexOptions = {
        chart: { type: 'line', toolbar: { show: true } },
        stroke: { width: [0, 4], curve: 'smooth' },
        plotOptions: { bar: { columnWidth: '50%' } },
        xaxis: { categories: monthNames },
        yaxis: [
            { title: { text: 'อัตราครองเตียง (%)' }, labels: { formatter: (val) => typeof val === 'number' && !isNaN(val) ? `${val.toFixed(1)}%` : '0.0%' } }
        ],
        colors: ['#3e60d5', '#f15776'],
        title: { text: `อัตราการครองเตียง ปีงบประมาณ ${fiscalYear}`, align: 'center' }
    };

    return (
        <MainLayout>
            {wardId ? (
                <>
                    <PageTitle title="ข้อมูลผู้ป่วยใน" subTitle="Ward Detail" />
                    <WardDetailPage 
                        wardId={wardId} 
                        api_token={api_token} 
                        external_api_url={external_api_url} 
                        wards={wards || []} 
                    />
                </>
            ) : (
                <>
                    <PageTitle title="สถิติผู้ป่วยใน (IPD)" subTitle="Stats" />

                    <Row className="mb-2 align-items-center">
                <Col md={3}>
                    <div className="d-flex align-items-center">
                        <label className="me-2 fw-bold text-nowrap">ปีงบประมาณ:</label>
                        <select 
                            className="form-select w-auto shadow-sm" 
                            value={fiscalYear} 
                            onChange={(e) => setFiscalYear(parseInt(e.target.value))}
                        >
                            {[...Array(5)].map((_, i) => (
                                <option key={i} value={currentBE - i}>{currentBE - i}</option>
                            ))}
                        </select>
                        {loading && <Spinner animation="border" size="sm" className="ms-3 text-primary" />}
                    </div>
                </Col>
                <Col md={9} className="text-md-end mt-3 mt-md-0">
                    <button className="btn btn-soft-primary rounded-pill px-4 shadow-sm" onClick={() => fetchData(fiscalYear)}>
                        <IconifyIcon icon="solar:refresh-bold" className="me-1" /> รีเฟรชข้อมูล
                    </button>
                </Col>
            </Row>

            {error && (
                <div className="alert alert-danger border-0 shadow-sm d-flex align-items-center mb-4">
                    <IconifyIcon icon="solar:danger-bold" className="me-2 fs-20" />
                    {error}
                </div>
            )}

            <Card className="shadow-sm border-0">
                <CardBody className="p-4">
                    <h5 className="mb-1 fw-bold">สถิติผู้ป่วยใน (IPD)</h5>
                    <p className="text-muted mb-4">สรุปสถิติจำนวนผู้ป่วยใน อัตราครองเตียง และโรคที่พบบ่อย แยกตามปีงบประมาณ</p>

                    <Tab.Container defaultActiveKey="charts">
                        <Nav role="tablist" className="nav-tabs nav-bordered nav-bordered-danger mb-3">
                            <Nav.Item>
                                <Nav.Link eventKey="charts" className="py-2">
                                    <IconifyIcon icon="solar:chart-bold-duotone" className="me-2 fs-18 align-middle" />
                                    แผนภูมิสถิติ
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="summary" className="py-2">
                                    <IconifyIcon icon="solar:pie-chart-3-bold-duotone" className="me-2 fs-18 align-middle" />
                                    สรุปผู้ป่วยใน
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="gender" className="py-2">
                                    <IconifyIcon icon="solar:users-group-two-rounded-bold-duotone" className="me-2 fs-18 align-middle" />
                                    ตารางข้อมูล
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="disease" className="py-2">
                                    <IconifyIcon icon="solar:sort-from-bottom-to-top-line-duotone" className="me-2 fs-18 align-middle" />
                                    20 อันดับโรค
                                </Nav.Link>
                            </Nav.Item>
                            {auth?.user && (
                                <Nav.Item>
                                    <Nav.Link eventKey="admit-list" className="py-2">
                                        <IconifyIcon icon="solar:users-group-two-rounded-bold-duotone" className="me-2 fs-18 align-middle" />
                                        รายชื่อผู้ป่วย Admit
                                    </Nav.Link>
                                </Nav.Item>
                            )}
                        </Nav>

                        <Tab.Content>
                            <Tab.Pane eventKey="summary">
                                <Row className="g-4">
                                    {/* Left Side: สรุปข้อมูลผู้ป่วยใน วันนี้ */}
                                    <Col lg={4}>
                                        <div className="border rounded bg-white overflow-hidden shadow-sm">
                                            {/* Red Header Card */}
                                            <div style={{ backgroundColor: '#d9534f' }} className="p-4 text-center text-white">
                                                <h4 className="fw-bold mb-1 text-white">สรุปข้อมูลผู้ป่วยใน วันนี้</h4>
                                                <p className="mb-0 fs-13 text-white-50">
                                                    จำนวนเตียงทั้งหมด <span className="fw-bold text-white fs-15">{todaySummary?.total_beds || 0}</span> เตียง
                                                </p>
                                            </div>
                                            {/* List Items */}
                                            <div className="p-3">
                                                <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
                                                    <span className="fw-medium text-dark fs-14">รับใหม่วันนี้</span>
                                                    <span className="badge rounded-pill px-3 py-1 fs-12 text-white" style={{ backgroundColor: '#d9534f' }}>
                                                        {todaySummary?.new_admit_today || 0} เตียง
                                                    </span>
                                                </div>
                                                <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
                                                    <span className="fw-medium text-dark fs-14">จำหน่ายวันนี้</span>
                                                    <span className="badge rounded-pill px-3 py-1 fs-12 text-white" style={{ backgroundColor: '#f0ad4e' }}>
                                                        {todaySummary?.discharge_today || 0} เตียง
                                                    </span>
                                                </div>
                                                <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
                                                    <span className="fw-medium text-dark fs-14">Admit อยู่</span>
                                                    <span className="badge rounded-pill px-3 py-1 fs-12 text-white" style={{ backgroundColor: '#0275d8' }}>
                                                        {todaySummary?.current_admit || 0} เตียง
                                                    </span>
                                                </div>
                                                <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
                                                    <span className="fw-medium text-dark fs-14">เตียงว่าง</span>
                                                    <span className="badge rounded-pill px-3 py-1 fs-12 text-white" style={{ backgroundColor: '#5cb85c' }}>
                                                        {todaySummary?.available_beds || 0} เตียง
                                                    </span>
                                                </div>
                                                <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
                                                    <span className="fw-medium text-dark fs-14">ย้ายเตียงวันนี้</span>
                                                    <span className="badge rounded-pill px-3 py-1 fs-12 text-white" style={{ backgroundColor: '#f0ad4e' }}>
                                                        {todaySummary?.transfer_today || 0} ราย
                                                    </span>
                                                </div>
                                                <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
                                                    <span className="fw-medium text-dark fs-14">อัตราการครองเตียง</span>
                                                    <span className="badge rounded-pill px-3 py-1 fs-12 text-white" style={{ backgroundColor: '#d9534f' }}>
                                                        {todaySummary?.occupancy_rate || 0} %
                                                    </span>
                                                </div>
                                                <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
                                                    <span className="fw-medium text-dark fs-14">สิทธิ์ชำระเงินและเบิกได้</span>
                                                    <span className="badge rounded-pill px-3 py-1 fs-12 text-white" style={{ backgroundColor: '#6c757d' }}>
                                                        {todaySummary?.pttype_pay || 0} เตียง
                                                    </span>
                                                </div>
                                                <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
                                                    <span className="fw-medium text-dark fs-14">สิทธิ์ UC</span>
                                                    <span className="badge rounded-pill px-3 py-1 fs-12 text-white" style={{ backgroundColor: '#6c757d' }}>
                                                        {todaySummary?.pttype_uc || 0} เตียง
                                                    </span>
                                                </div>
                                                <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
                                                    <span className="fw-medium text-dark fs-14">สิทธิ์อื่นๆ</span>
                                                    <span className="badge rounded-pill px-3 py-1 fs-12 text-white" style={{ backgroundColor: '#6c757d' }}>
                                                        {todaySummary?.pttype_other || 0} เตียง
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>

                                    {/* Right Side: ค่าใช้จ่ายผู้ป่วยในรวม */}
                                    <Col lg={8}>
                                        <div className="border rounded bg-white p-4 shadow-sm">
                                            <div className="text-center mb-4 pb-2 border-bottom">
                                                <h4 className="fw-bold text-dark mb-1 d-flex align-items-center justify-content-center flex-wrap">
                                                    ค่าใช้จ่ายผู้ป่วยในรวม
                                                    <span className="text-danger fs-28 fw-bold mx-2">
                                                        {incomeSummary?.total_income != null ? incomeSummary.total_income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                                                    </span>
                                                    บาท
                                                </h4>
                                            </div>

                                            <div className="table-responsive">
                                                <Table hover bordered size="sm" className="align-middle fs-13 mb-0">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th className="text-center" style={{ width: '90px' }}>รหัสหมวด</th>
                                                            <th>หมวดค่าใช้จ่าย (Income)</th>
                                                            <th className="text-end" style={{ width: '160px' }}>มูลค่า</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {loading ? (
                                                            <tr><td colSpan={3} className="text-center py-4"><Spinner animation="border" size="sm" /></td></tr>
                                                        ) : (incomeSummary?.items || []).map((item: any, idx: number) => (
                                                            <tr key={idx}>
                                                                <td className="text-center text-primary font-monospace">{item.code}</td>
                                                                <td className="fw-medium">{item.name}</td>
                                                                <td className="text-end font-monospace fw-bold text-dark">
                                                                    {Number(item.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </Tab.Pane>
                            <Tab.Pane eventKey="charts">
                                <Row className="g-4">
                                    <Col lg={12}>
                                        <div className="border rounded p-4 bg-white shadow-sm">
                                            {loading ? (
                                                <div className="text-center py-5"><Spinner animation="grow" variant="primary" /></div>
                                            ) : (
                                                <ReactApexChart 
                                                    options={visitChartOptions} 
                                                    series={[{ name: 'ผู้ป่วยใน (ราย)', data: sortedSummary.map(d => d.count) }]} 
                                                    type="bar" 
                                                    height={420} 
                                                />
                                            )}
                                        </div>
                                    </Col>
                                    <Col lg={12}>
                                        <div className="border rounded p-4 bg-white shadow-sm">
                                            {loading ? (
                                                <div className="text-center py-5"><Spinner animation="grow" variant="primary" /></div>
                                            ) : (
                                                <ReactApexChart 
                                                    options={occupancyChartOptions} 
                                                    series={[
                                                        { name: 'อัตราครองเตียง (%)', type: 'column', data: sortedOccupancy.map(d => d.admsum) },
                                                        { name: 'แนวโน้ม', type: 'line', data: sortedOccupancy.map(d => d.admsum) }
                                                    ]} 
                                                    type="line" 
                                                    height={420} 
                                                />
                                            )}
                                        </div>
                                    </Col>
                                </Row>
                            </Tab.Pane>

                            <Tab.Pane eventKey="gender">
                                {(() => {
                                    const monthlySumKeys = ['m10', 'm11', 'm12', 'm01', 'm02', 'm03', 'm04', 'm05', 'm06', 'm07', 'm08', 'm09'];
                                    const monthTotals: any = {};
                                    monthlySumKeys.forEach(k => {
                                        monthTotals[k] = wardMonthlyData.reduce((sum, row) => sum + (parseInt(row[k], 10) || 0), 0);
                                    });
                                    const grandMonthlyTotal = wardMonthlyData.reduce((sum, row) => sum + (parseInt(row.total, 10) || 0), 0);

                                    const totalPatientsCount = wardOccupancyData.reduce((sum, row) => sum + (parseInt(row.patient_count, 10) || 0), 0);
                                    const totalAdmDays = wardOccupancyData.reduce((sum, row) => sum + (parseFloat(row.total_admdate) || 0), 0);
                                    const overallAvgStay = totalPatientsCount > 0 ? (totalAdmDays / totalPatientsCount) : 0;
                                    const totalBedCount = wardOccupancyData.reduce((sum, row) => sum + (parseInt(row.bedcount, 10) || 0), 0);
                                    const overallOccupancyRate = totalBedCount > 0 ? ((totalAdmDays * 100) / (totalBedCount * 365)) : 0;

                                    return (
                                        <div className="space-y-4">
                                            {/* Table 1: จำนวนผู้ป่วยใน ปีงบประมาณ */}
                                            <div className="mb-4">
                                                <h6 className="fw-bold mb-2 text-dark">
                                                    จำนวนผู้ป่วยใน ปีงบประมาณ {fiscalYear} ({fiscalYear - 1 - 543 < 0 ? '' : `1 ต.ค.${fiscalYear - 1} - 30 ก.ย.${fiscalYear}`})
                                                </h6>
                                                <div className="table-responsive">
                                                    <Table bordered hover size="sm" className="align-middle fs-13 mb-0">
                                                        <thead style={{ backgroundColor: '#d9edf7' }} className="text-center align-middle">
                                                            <tr>
                                                                <th style={{ backgroundColor: '#d9edf7', minWidth: '120px' }}>ตึก</th>
                                                                <th style={{ backgroundColor: '#d9edf7' }}>ต.ค.</th>
                                                                <th style={{ backgroundColor: '#d9edf7' }}>พ.ย.</th>
                                                                <th style={{ backgroundColor: '#d9edf7' }}>ธ.ค.</th>
                                                                <th style={{ backgroundColor: '#d9edf7' }}>ม.ค.</th>
                                                                <th style={{ backgroundColor: '#d9edf7' }}>ก.พ.</th>
                                                                <th style={{ backgroundColor: '#d9edf7' }}>มี.ค.</th>
                                                                <th style={{ backgroundColor: '#d9edf7' }}>เม.ย.</th>
                                                                <th style={{ backgroundColor: '#d9edf7' }}>พ.ค.</th>
                                                                <th style={{ backgroundColor: '#d9edf7' }}>มิ.ย.</th>
                                                                <th style={{ backgroundColor: '#d9edf7' }}>ก.ค.</th>
                                                                <th style={{ backgroundColor: '#d9edf7' }}>ส.ค.</th>
                                                                <th style={{ backgroundColor: '#d9edf7' }}>ก.ย.</th>
                                                                <th style={{ backgroundColor: '#d9edf7', minWidth: '70px' }}>รวม</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {loading ? (
                                                                <tr><td colSpan={14} className="text-center py-4"><Spinner animation="border" size="sm" /></td></tr>
                                                            ) : wardMonthlyData.map((row, idx) => {
                                                                const rowSum = (parseInt(row.m10, 10) || 0) + (parseInt(row.m11, 10) || 0) + (parseInt(row.m12, 10) || 0) +
                                                                               (parseInt(row.m01, 10) || 0) + (parseInt(row.m02, 10) || 0) + (parseInt(row.m03, 10) || 0) +
                                                                               (parseInt(row.m04, 10) || 0) + (parseInt(row.m05, 10) || 0) + (parseInt(row.m06, 10) || 0) +
                                                                               (parseInt(row.m07, 10) || 0) + (parseInt(row.m08, 10) || 0) + (parseInt(row.m09, 10) || 0);
                                                                return (
                                                                    <tr key={idx}>
                                                                        <td className="fw-bold">{row.ward_name}</td>
                                                                        <td className="text-center">{row.m10 ? Number(row.m10).toLocaleString() : 0}</td>
                                                                        <td className="text-center">{row.m11 ? Number(row.m11).toLocaleString() : 0}</td>
                                                                        <td className="text-center">{row.m12 ? Number(row.m12).toLocaleString() : 0}</td>
                                                                        <td className="text-center">{row.m01 ? Number(row.m01).toLocaleString() : 0}</td>
                                                                        <td className="text-center">{row.m02 ? Number(row.m02).toLocaleString() : 0}</td>
                                                                        <td className="text-center">{row.m03 ? Number(row.m03).toLocaleString() : 0}</td>
                                                                        <td className="text-center">{row.m04 ? Number(row.m04).toLocaleString() : 0}</td>
                                                                        <td className="text-center">{row.m05 ? Number(row.m05).toLocaleString() : 0}</td>
                                                                        <td className="text-center">{row.m06 ? Number(row.m06).toLocaleString() : 0}</td>
                                                                        <td className="text-center">{row.m07 ? Number(row.m07).toLocaleString() : 0}</td>
                                                                        <td className="text-center">{row.m08 ? Number(row.m08).toLocaleString() : 0}</td>
                                                                        <td className="text-center">{row.m09 ? Number(row.m09).toLocaleString() : 0}</td>
                                                                        <td className="text-center fw-bold">{rowSum.toLocaleString()}</td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                        {!loading && wardMonthlyData.length > 0 && (
                                                            <tfoot style={{ backgroundColor: '#fcf8e3' }}>
                                                                <tr className="fw-bold text-center">
                                                                    <td style={{ backgroundColor: '#fcf8e3' }} className="fw-bold">รวม</td>
                                                                    <td style={{ backgroundColor: '#fcf8e3' }} className="text-primary">{monthTotals.m10?.toLocaleString()}</td>
                                                                    <td style={{ backgroundColor: '#fcf8e3' }} className="text-primary">{monthTotals.m11?.toLocaleString()}</td>
                                                                    <td style={{ backgroundColor: '#fcf8e3' }} className="text-primary">{monthTotals.m12?.toLocaleString()}</td>
                                                                    <td style={{ backgroundColor: '#fcf8e3' }} className="text-primary">{monthTotals.m01?.toLocaleString()}</td>
                                                                    <td style={{ backgroundColor: '#fcf8e3' }} className="text-primary">{monthTotals.m02?.toLocaleString()}</td>
                                                                    <td style={{ backgroundColor: '#fcf8e3' }} className="text-primary">{monthTotals.m03?.toLocaleString()}</td>
                                                                    <td style={{ backgroundColor: '#fcf8e3' }} className="text-primary">{monthTotals.m04?.toLocaleString()}</td>
                                                                    <td style={{ backgroundColor: '#fcf8e3' }} className="text-primary">{monthTotals.m05?.toLocaleString()}</td>
                                                                    <td style={{ backgroundColor: '#fcf8e3' }} className="text-primary">{monthTotals.m06?.toLocaleString()}</td>
                                                                    <td style={{ backgroundColor: '#fcf8e3' }} className="text-primary">{monthTotals.m07?.toLocaleString()}</td>
                                                                    <td style={{ backgroundColor: '#fcf8e3' }} className="text-primary">{monthTotals.m08?.toLocaleString()}</td>
                                                                    <td style={{ backgroundColor: '#fcf8e3' }} className="text-primary">{monthTotals.m09?.toLocaleString()}</td>
                                                                    <td style={{ backgroundColor: '#fcf8e3' }} className="text-dark fs-14 fw-bold">{grandMonthlyTotal.toLocaleString()}</td>
                                                                </tr>
                                                            </tfoot>
                                                        )}
                                                    </Table>
                                                </div>
                                            </div>

                                            {/* Table 2: อัตราการครองเตียง (แยกหอผู้ป่วย) */}
                                            <div className="mt-4 pt-2">
                                                <h6 className="fw-bold mb-2 text-dark">
                                                    อัตราการครองเตียง (แยกหอผู้ป่วย) ปีงบประมาณ {fiscalYear} ({fiscalYear - 1 - 543 < 0 ? '' : `1 ต.ค.${fiscalYear - 1} - 30 ก.ย.${fiscalYear}`})
                                                </h6>
                                                <div className="table-responsive">
                                                    <Table bordered hover size="sm" className="align-middle fs-13 mb-0">
                                                        <thead style={{ backgroundColor: '#dff0d8' }} className="text-center align-middle">
                                                            <tr>
                                                                <th style={{ backgroundColor: '#dff0d8', minWidth: '150px' }}>ตึก</th>
                                                                <th style={{ backgroundColor: '#dff0d8' }}>จำนวนผู้ป่วย</th>
                                                                <th style={{ backgroundColor: '#dff0d8' }}>จำนวนวันนอน</th>
                                                                <th style={{ backgroundColor: '#dff0d8' }}>เฉลี่ยวันนอนต่อคน</th>
                                                                <th style={{ backgroundColor: '#dff0d8' }}>อัตราการครองเตียง</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {loading ? (
                                                                <tr><td colSpan={5} className="text-center py-4"><Spinner animation="border" size="sm" /></td></tr>
                                                            ) : wardOccupancyData.map((row, idx) => {
                                                                const pCount = parseInt(row.patient_count, 10) || 0;
                                                                const admDays = parseFloat(row.total_admdate) || 0;
                                                                const avgDays = pCount > 0 ? (admDays / pCount) : 0;
                                                                const occRate = parseFloat(row.occupancy_rate) || 0;
                                                                return (
                                                                    <tr key={idx}>
                                                                        <td className="fw-bold">{row.ward_name}</td>
                                                                        <td className="text-center">{pCount.toLocaleString()}</td>
                                                                        <td className="text-center">{admDays.toLocaleString()}</td>
                                                                        <td className="text-center font-monospace">{avgDays.toFixed(2)}</td>
                                                                        <td className="text-center font-monospace fw-medium">{occRate.toFixed(2)}</td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                        {!loading && wardOccupancyData.length > 0 && (
                                                            <tfoot style={{ backgroundColor: '#fcf8e3' }}>
                                                                <tr className="fw-bold text-center">
                                                                    <td style={{ backgroundColor: '#fcf8e3' }} className="fw-bold">รวม</td>
                                                                    <td style={{ backgroundColor: '#fcf8e3' }}>{totalPatientsCount.toLocaleString()}</td>
                                                                    <td style={{ backgroundColor: '#fcf8e3' }}>{Math.round(totalAdmDays).toLocaleString()}</td>
                                                                    <td style={{ backgroundColor: '#fcf8e3' }} className="font-monospace">{overallAvgStay.toFixed(2)}</td>
                                                                    <td style={{ backgroundColor: '#fcf8e3' }} className="text-danger fw-bold font-monospace">
                                                                        {overallOccupancyRate.toFixed(2)}
                                                                        {totalBedCount > 0 && <span className="d-block fs-11 text-danger font-sans-serif fw-normal">(คิดจาก {totalBedCount} เตียง)</span>}
                                                                    </td>
                                                                </tr>
                                                            </tfoot>
                                                        )}
                                                    </Table>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </Tab.Pane>

                            <Tab.Pane eventKey="disease">
                                <h5 className="mb-4 fw-bold text-center">20 อันดับโรคผู้ป่วยใน (ICD-10)</h5>
                                <div className="table-responsive">
                                    <Table hover className="align-middle table-sm border">
                                        <thead className="bg-light-subtle">
                                            <tr>
                                                <th className="text-center">ลำดับ</th>
                                                <th className="text-center">ICD10</th>
                                                <th>ชื่อโรค (อังกฤษ)</th>
                                                <th>ชื่อโรค (ไทย)</th>
                                                <th className="text-center">ชาย</th>
                                                <th className="text-center">หญิง</th>
                                                <th className="text-center bg-info-subtle">รวม (ราย)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr><td colSpan={7} className="text-center py-5"><Spinner animation="border" /></td></tr>
                                            ) : topDiseases.map((row, idx) => (
                                                <tr key={idx}>
                                                    <td className="text-center">{idx + 1}</td>
                                                    <td className="text-center fw-bold text-primary">{row.pdx}</td>
                                                    <td className="small">{row.diag}</td>
                                                    <td className="small">{row.tname || '-'}</td>
                                                    <td className="text-center">{row.male.toLocaleString()}</td>
                                                    <td className="text-center">{row.female.toLocaleString()}</td>
                                                    <td className="text-center fw-bold text-success">{row.count.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </Tab.Pane>

                            {auth?.user && (
                                <Tab.Pane eventKey="admit-list">
                                    {(() => {
                                        // Search filtering
                                    const filteredList = (admitList || []).filter(item => {
                                        if (!item) return false;
                                        if (!searchTerm) return true;
                                        const term = searchTerm.toLowerCase();
                                        return (
                                            (item.vstdate || '').toLowerCase().includes(term) ||
                                            (item.hn || '').toLowerCase().includes(term) ||
                                            (item.an || '').toLowerCase().includes(term) ||
                                            (item.pt_name || '').toLowerCase().includes(term) ||
                                            (item.address || '').toLowerCase().includes(term) ||
                                            (item.pttype_name || '').toLowerCase().includes(term) ||
                                            (item.ward_name || '').toLowerCase().includes(term)
                                        );
                                    });

                                    // Sorting
                                    const sortedList = [...filteredList].sort((a, b) => {
                                        let valA = a[sortField] ?? '';
                                        let valB = b[sortField] ?? '';
                                        if (typeof valA === 'number' && typeof valB === 'number') {
                                            return sortDirection === 'asc' ? valA - valB : valB - valA;
                                        }
                                        valA = String(valA).toLowerCase();
                                        valB = String(valB).toLowerCase();
                                        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
                                        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
                                        return 0;
                                    });

                                    // Pagination
                                    const totalItems = sortedList.length;
                                    const totalPages = Math.ceil(totalItems / perPage) || 1;
                                    const activePage = Math.min(currentPage, totalPages);
                                    const startIndex = (activePage - 1) * perPage;
                                    const paginatedList = sortedList.slice(startIndex, startIndex + perPage);

                                    const handleSort = (field: string) => {
                                        if (sortField === field) {
                                            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                                        } else {
                                            setSortField(field);
                                            setSortDirection('asc');
                                        }
                                    };

                                    return (
                                        <div className="space-y-3">
                                            {/* Header Title matching reference image */}
                                            <h5 className="fw-bold mb-3 text-dark">
                                                รายชื่อผู้ป่วยใน Admit ขณะนี้ <span className="text-dark fw-bold">{admitList.length}</span> เตียง
                                            </h5>

                                            {/* Filter & Search Bar */}
                                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                                                <div className="d-flex align-items-center gap-2">
                                                    <span className="fs-13 text-muted">แสดง</span>
                                                    <Form.Select 
                                                        size="sm" 
                                                        style={{ width: '80px' }} 
                                                        value={perPage} 
                                                        onChange={e => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                                    >
                                                        <option value={10}>10</option>
                                                        <option value={25}>25</option>
                                                        <option value={50}>50</option>
                                                        <option value={100}>100</option>
                                                    </Form.Select>
                                                    <span className="fs-13 text-muted">รายการต่อหน้า</span>
                                                </div>

                                                <div className="d-flex align-items-center gap-2">
                                                    <span className="fs-13 text-muted">ค้นหา :</span>
                                                    <Form.Control 
                                                        type="text" 
                                                        size="sm" 
                                                        style={{ width: '220px' }} 
                                                        placeholder="ค้นหาชื่อ, HN, AN..." 
                                                        value={searchTerm} 
                                                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Data Table */}
                                            <div className="table-responsive">
                                                <Table bordered hover size="sm" className="align-middle fs-13 mb-0">
                                                    <thead style={{ backgroundColor: '#dff0d8' }} className="text-center align-middle">
                                                        <tr>
                                                            <th style={{ backgroundColor: '#dff0d8', cursor: 'pointer' }} onClick={() => handleSort('vstdate')}>
                                                                วัน admit {sortField === 'vstdate' ? (sortDirection === 'asc' ? '↑' : '↓') : '↑↓'}
                                                            </th>
                                                            <th style={{ backgroundColor: '#dff0d8', cursor: 'pointer' }} onClick={() => handleSort('hn')}>
                                                                HN / AN {sortField === 'hn' ? (sortDirection === 'asc' ? '↑' : '↓') : '↑↓'}
                                                            </th>
                                                            <th style={{ backgroundColor: '#dff0d8', cursor: 'pointer' }} onClick={() => handleSort('pt_name')}>
                                                                ชื่อ-นามสกุล {sortField === 'pt_name' ? (sortDirection === 'asc' ? '↑' : '↓') : '↑↓'}
                                                            </th>
                                                            <th style={{ backgroundColor: '#dff0d8', cursor: 'pointer' }} onClick={() => handleSort('age')}>
                                                                อายุ {sortField === 'age' ? (sortDirection === 'asc' ? '↑' : '↓') : '↑↓'}
                                                            </th>
                                                            <th style={{ backgroundColor: '#dff0d8', cursor: 'pointer', minWidth: '220px' }} onClick={() => handleSort('address')}>
                                                                ที่อยู่ {sortField === 'address' ? (sortDirection === 'asc' ? '↑' : '↓') : '↑↓'}
                                                            </th>
                                                            <th style={{ backgroundColor: '#dff0d8', cursor: 'pointer' }} onClick={() => handleSort('pttype_name')}>
                                                                สิทธิรักษาพยาบาล {sortField === 'pttype_name' ? (sortDirection === 'asc' ? '↑' : '↓') : '↑↓'}
                                                            </th>
                                                            <th style={{ backgroundColor: '#dff0d8', cursor: 'pointer' }} onClick={() => handleSort('ward_name')}>
                                                                ตึก {sortField === 'ward_name' ? (sortDirection === 'asc' ? '↑' : '↓') : '↑↓'}
                                                            </th>
                                                            <th style={{ backgroundColor: '#dff0d8', cursor: 'pointer' }} onClick={() => handleSort('adm_days')}>
                                                                จำนวนวันนอน {sortField === 'adm_days' ? (sortDirection === 'asc' ? '↑' : '↓') : '↑↓'}
                                                            </th>
                                                            <th style={{ backgroundColor: '#dff0d8', cursor: 'pointer', minWidth: '110px' }} onClick={() => handleSort('total_expense')}>
                                                                ค่าใช้จ่าย {sortField === 'total_expense' ? (sortDirection === 'asc' ? '↑' : '↓') : '↑↓'}
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {loading ? (
                                                            <tr><td colSpan={9} className="text-center py-4"><Spinner animation="border" size="sm" /></td></tr>
                                                        ) : paginatedList.length === 0 ? (
                                                            <tr><td colSpan={9} className="text-center py-4 text-muted">ไม่พบรายการข้อมูลผู้ป่วย Admit</td></tr>
                                                        ) : (
                                                            paginatedList.map((row, idx) => (
                                                                <tr key={idx}>
                                                                    <td className="text-center font-monospace">{row.vstdate || '-'}</td>
                                                                    <td className="text-center font-monospace">
                                                                        {row.hn ? `${row.hn} / ${row.an}` : `/ ${row.an}`}
                                                                    </td>
                                                                    <td className="fw-bold text-dark">{row.pt_name || '-'}</td>
                                                                    <td className="text-center">{row.age ?? '-'}</td>
                                                                    <td className="fs-12 text-secondary">{row.address || '-'}</td>
                                                                    <td className="fs-12">{row.pttype_name || '-'}</td>
                                                                    <td className="text-center fw-medium">{row.ward_name || '-'}</td>
                                                                    <td className="text-center font-monospace">{row.adm_days ?? 0}</td>
                                                                    <td className="text-end font-monospace text-dark">
                                                                        {Number(row.total_expense || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </Table>
                                            </div>

                                            {/* Footer Pagination */}
                                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pt-2">
                                                <div className="fs-13 text-muted">
                                                    แสดง {totalItems === 0 ? 0 : startIndex + 1} ถึง {Math.min(startIndex + perPage, totalItems)} จาก {totalItems} รายการ
                                                </div>

                                                <Pagination className="pagination-sm mb-0">
                                                    <Pagination.Prev 
                                                        disabled={activePage <= 1} 
                                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                    >
                                                        ก่อนหน้า
                                                    </Pagination.Prev>
                                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                                        .filter(p => p === 1 || p === totalPages || Math.abs(p - activePage) <= 2)
                                                        .map((p, i, arr) => (
                                                            <React.Fragment key={p}>
                                                                {i > 0 && arr[i - 1] !== p - 1 && <Pagination.Ellipsis disabled />}
                                                                <Pagination.Item 
                                                                    active={p === activePage} 
                                                                    onClick={() => setCurrentPage(p)}
                                                                >
                                                                    {p}
                                                                </Pagination.Item>
                                                            </React.Fragment>
                                                        ))
                                                    }
                                                    <Pagination.Next 
                                                        disabled={activePage >= totalPages} 
                                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                    >
                                                        ถัดไป
                                                    </Pagination.Next>
                                                </Pagination>
                                            </div>
                                        </div>
                                    );
                                })()}
                                </Tab.Pane>
                            )}
                        </Tab.Content>
                    </Tab.Container>
                </CardBody>
            </Card>
            </>
            )}
        </MainLayout>
    );
};

export default IpdStatsPage;
