import { useEffect, useState, useRef } from 'react';
import PageTitle from '@/components/PageTitle';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardBody, Col, Row, Spinner, Table, Tab, Nav } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import axios from 'axios';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { usePage } from '@inertiajs/react';
import { Grid, _ } from 'gridjs-react';
import { html } from 'gridjs';

const PCCStatsPage = ({ api_token, external_api_url }: { api_token: string, external_api_url: string }) => {
    const { auth } = usePage().props as any;
    const currentBE = new Date().getFullYear() + (new Date().getMonth() > 8 ? 1 : 0) + 543;
    const [fiscalYear, setFiscalYear] = useState(currentBE);
    const [loading, setLoading] = useState(true);
    const [summaryData, setSummaryData] = useState<any[]>([]);
    const [insclData, setInsclData] = useState<any[]>([]);
    const [diseasesData, setDiseasesData] = useState<any[]>([]);
    const [insclBreakdown, setInsclBreakdown] = useState<{ patients: any[], visits: any[] }>({ patients: [], visits: [] });
    const [patientsData, setPatientsData] = useState<any[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [patientsLoading, setPatientsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('charts');
    const [error, setError] = useState<string | null>(null);

    const patientsRef = useRef<HTMLDivElement>(null);

    const fetchData = async (year: number) => {
        try {
            setLoading(true);
            const apiUrl = external_api_url || 'http://127.0.0.1:8800';
            const headers = { Authorization: `Bearer ${api_token}` };

            const [summaryRes, insclRes, diseasesRes, breakdownRes] = await Promise.all([
                axios.get(`${apiUrl}/api/v1/pcc/stats-summary?fiscal_year=${year}`, { headers }),
                axios.get(`${apiUrl}/api/v1/pcc/stats-inscl?fiscal_year=${year}`, { headers }),
                axios.get(`${apiUrl}/api/v1/pcc/stats-diseases?fiscal_year=${year}`, { headers }),
                axios.get(`${apiUrl}/api/v1/pcc/stats-inscl-breakdown?fiscal_year=${year}`, { headers })
            ]);

            setSummaryData(summaryRes.data.data);
            setInsclData(insclRes.data.data);
            setDiseasesData(diseasesRes.data.data);
            setInsclBreakdown(breakdownRes.data);
            setError(null);
        } catch (err: any) {
            console.error('API Error:', err);
            const msg = err.response?.data?.detail || err.message || 'ไม่สามารถเชื่อมต่อกับ API ได้';
            setError(`API Error: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchPatients = async (ym: string) => {
        try {
            setPatientsLoading(true);
            setSelectedMonth(ym);
            const apiUrl = external_api_url || 'http://127.0.0.1:8800';
            const headers = { Authorization: `Bearer ${api_token}` };

            const res = await axios.get(`${apiUrl}/api/v1/pcc/patients?ym=${ym}`, { headers });
            setPatientsData(res.data.data);
            
            setActiveTab('patients');
            setTimeout(() => {
                patientsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        } catch (err: any) {
            console.error('API Error:', err);
            const msg = err.response?.data?.detail || err.message || 'ไม่สามารถดึงข้อมูลรายชื่อผู้รับบริการได้';
            setError(`API Error: ${msg}`);
        } finally {
            setPatientsLoading(false);
        }
    };

    useEffect(() => {
        fetchData(fiscalYear);
    }, [fiscalYear]);

    const monthNames = ['ต.ค.', 'พ.ย.', 'ธ.ค.', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.'];
    const monthKeys = ['m10', 'm11', 'm12', 'm01', 'm02', 'm03', 'm04', 'm05', 'm06', 'm07', 'm08', 'm09'];

    const sortedSummary = [...summaryData].sort((a, b) => {
        const m1 = parseInt(a.AM);
        const m2 = parseInt(b.AM);
        const order = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        return order.indexOf(m1) - order.indexOf(m2);
    });

    const chartOptions: ApexOptions = {
        chart: { type: 'bar', toolbar: { show: true } },
        plotOptions: { bar: { horizontal: false, columnWidth: '45%', borderRadius: 4 } },
        xaxis: { categories: monthNames },
        colors: ['#10b981', '#06b6d4'],
        legend: { position: 'top' },
        fill: { opacity: 1 },
        title: { text: `แนวโน้มผู้รับบริการ PCC ตะพานหินแยกตามเดือน ปีงบประมาณ ${fiscalYear}`, align: 'center', style: { fontSize: '15px', fontWeight: 'bold' } }
    };

    const chartSeries = [
        { name: 'จำนวนผู้ป่วย (คน/HN)', data: sortedSummary.map(d => d.hn_count) },
        { name: 'จำนวนครั้งที่รับบริการ (ครั้ง/VN)', data: sortedSummary.map(d => d.total) }
    ];

    const getPieOptions = (title: string, labels: string[]): ApexOptions => ({
        chart: { type: 'pie' },
        labels: labels,
        legend: { position: 'bottom' },
        title: { text: title, align: 'center', style: { fontSize: '14px', fontWeight: 'bold' } },
        responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: 'bottom' } } }]
    });

    return (
        <MainLayout>
            <PageTitle title="ศูนย์สุขภาพชุมชน PCC ตะพานหิน" subTitle="Stats" />

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
                        {loading && <Spinner animation="border" size="sm" className="ms-3 text-success" />}
                    </div>
                </Col>
                <Col md={9} className="text-md-end mt-3 mt-md-0">
                    <button className="btn btn-soft-success rounded-pill px-4 shadow-sm" onClick={() => fetchData(fiscalYear)}>
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

            <Card className="shadow-sm border-0 mb-4">
                <CardBody className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <h5 className="mb-1 fw-bold">รายงานข้อมูลการจัดบริการสุขภาพปฐมภูมิ (Primary Care Cluster)</h5>
                            <p className="text-muted mb-0 small">สรุปสถิติจำนวนผู้มารับบริการ สิทธิการรักษา และโรคพบบ่อยศูนย์ปฐมภูมิ PCC ตะพานหิน</p>
                        </div>
                    </div>

                    <Tab.Container activeKey={activeTab} onSelect={(k) => k && setActiveTab(k)}>
                        <Nav role="tablist" className="nav-tabs nav-bordered nav-bordered-success mb-3">
                            <Nav.Item>
                                <Nav.Link eventKey="charts" className="py-2">
                                    <IconifyIcon icon="solar:chart-bold-duotone" className="me-2 fs-18 align-middle" />
                                    แผนภูมิสถิติ
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="tables" className="py-2">
                                    <IconifyIcon icon="solar:table-list-bold-duotone" className="me-2 fs-18 align-middle" />
                                    ตารางสรุปสิทธิ์
                                </Nav.Link>
                            </Nav.Item>
                            {auth?.user && ['admin', 'head', 'user'].includes(auth.user.role) && (
<Nav.Item>
                                <Nav.Link eventKey="patients" className="py-2">
                                    <IconifyIcon icon="solar:users-group-two-rounded-bold-duotone" className="me-2 fs-18 align-middle" />
                                    รายชื่อผู้รับบริการ {selectedMonth && `(${selectedMonth})`}
                                </Nav.Link>
                            </Nav.Item>
)}
                        </Nav>
                        
                        <Tab.Content>
                            <Tab.Pane eventKey="charts">
                                <Row className="g-4">
                                    <Col lg={12}>
                                        <div className="border rounded p-3 bg-white shadow-sm">
                                            {loading ? (
                                                <div className="text-center py-5"><Spinner animation="grow" variant="success" /></div>
                                            ) : (
                                                <ReactApexChart options={chartOptions} series={chartSeries} type="bar" height={380} />
                                            )}
                                        </div>
                                    </Col>

                                    <Col lg={6}>
                                        <div className="border rounded p-3 bg-white shadow-sm h-100">
                                            {loading ? (
                                                <div className="text-center py-5"><Spinner animation="grow" variant="success" /></div>
                                            ) : (
                                                <ReactApexChart 
                                                    options={getPieOptions('สัดส่วนผู้รับบริการแยกตามสิทธิการรักษา (ครั้ง)', insclData.map(i => i.inscl_name || 'ไม่ระบุ'))} 
                                                    series={insclData.map(i => i.count)} 
                                                    type="pie" 
                                                    height={340} 
                                                />
                                            )}
                                        </div>
                                    </Col>

                                    <Col lg={6}>
                                        <div className="border rounded p-3 bg-white shadow-sm h-100">
                                            <h5 className="mb-3 fw-bold text-center small" style={{ fontSize: '14px' }}>
                                                โรคยอดนิยม 10 อันดับแรกที่เข้าตรวจที่ PCC
                                            </h5>
                                            {loading ? (
                                                <div className="text-center py-5"><Spinner animation="grow" variant="success" /></div>
                                            ) : (
                                                <div className="table-responsive" style={{ maxHeight: '310px' }}>
                                                    <Table hover striped bordered className="align-middle mb-0 table-sm">
                                                        <thead className="bg-success text-white">
                                                            <tr>
                                                                <th>ICD-10</th>
                                                                <th>ชื่อการวินิจฉัยโรค</th>
                                                                <th className="text-end">จำนวน (ราย)</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {diseasesData.slice(0, 10).map((d, idx) => (
                                                                <tr key={idx}>
                                                                    <td><code>{d.code}</code></td>
                                                                    <td className="small fw-semibold">{d.name}</td>
                                                                    <td className="text-end fw-bold text-success">{d.total.toLocaleString()}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </Table>
                                                </div>
                                            )}
                                        </div>
                                    </Col>
                                </Row>
                            </Tab.Pane>

                            <Tab.Pane eventKey="tables">
                                <h5 className="mb-3 fw-bold text-success d-flex align-items-center">
                                    <IconifyIcon icon="solar:user-bold" className="me-2" />
                                    1. ตารางสรุปสถิติผู้มารับบริการ PCC ตะพานหิน รายคน (HN) แยกตามสิทธิ์หลัก
                                </h5>
                                <div className="table-responsive mb-5 border rounded shadow-sm">
                                    <Table hover bordered striped className="align-middle table-sm mb-0">
                                        <thead className="bg-success text-white">
                                            <tr>
                                                <th>รหัส</th>
                                                <th>สิทธิ์การรักษา (Pttype)</th>
                                                {monthNames.map((m, i) => <th key={i} className="text-center">{m}</th>)}
                                                <th className="text-center bg-dark text-white">รวม</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr><td colSpan={15} className="text-center py-5"><Spinner animation="border" variant="success" /></td></tr>
                                            ) : insclBreakdown.patients.map((row, idx) => (
                                                <tr key={idx}>
                                                    <td><code>{row.pttype}</code></td>
                                                    <td className="small fw-semibold">{row.pttypename || 'ไม่ระบุ'}</td>
                                                    {monthKeys.map((mk, i) => {
                                                        const mNum = parseInt(mk.replace('m', ''));
                                                        const y = mNum >= 10 ? fiscalYear - 544 : fiscalYear - 543;
                                                        const ym = `${y}-${mNum.toString().padStart(2, '0')}`;
                                                        return (
                                                            <td key={i} className="text-center">
                                                                 {row[mk] > 0 ? (
                                                                     <button className="btn btn-link btn-sm p-0 fw-bold text-success" onClick={() => fetchPatients(ym)}>
                                                                         {row[mk].toLocaleString()}
                                                                     </button>
                                                                 ) : '0'}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="text-center fw-bold bg-light">{row.total.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>

                                <h5 className="mb-3 fw-bold text-success d-flex align-items-center">
                                    <IconifyIcon icon="solar:bill-list-bold" className="me-2" />
                                    2. ตารางสรุปสถิติการใช้บริการ PCC ตะพานหิน รายครั้ง (Visits) แยกตามสิทธิ์หลัก
                                </h5>
                                <div className="table-responsive border rounded shadow-sm">
                                    <Table hover bordered striped className="align-middle table-sm mb-0">
                                        <thead className="bg-success text-white">
                                            <tr>
                                                <th>รหัส</th>
                                                <th>สิทธิ์การรักษา (Pttype)</th>
                                                {monthNames.map((m, i) => <th key={i} className="text-center">{m}</th>)}
                                                <th className="text-center bg-dark text-white">รวม</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr><td colSpan={15} className="text-center py-5"><Spinner animation="border" variant="success" /></td></tr>
                                            ) : insclBreakdown.visits.map((row, idx) => (
                                                <tr key={idx}>
                                                    <td><code>{row.pttype}</code></td>
                                                    <td className="small fw-semibold">{row.pttypename || 'ไม่ระบุ'}</td>
                                                    {monthKeys.map((mk, i) => {
                                                        const mNum = parseInt(mk.replace('m', ''));
                                                        const y = mNum >= 10 ? fiscalYear - 544 : fiscalYear - 543;
                                                        const ym = `${y}-${mNum.toString().padStart(2, '0')}`;
                                                        return (
                                                            <td key={i} className="text-center">
                                                                 {row[mk] > 0 ? (
                                                                     <button className="btn btn-link btn-sm p-0 fw-bold text-success" onClick={() => fetchPatients(ym)}>
                                                                         {row[mk].toLocaleString()}
                                                                     </button>
                                                                 ) : '0'}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="text-center fw-bold bg-light">{row.total.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </Tab.Pane>

                            {auth?.user && ['admin', 'head', 'user'].includes(auth.user.role) && (
<Tab.Pane eventKey="patients">
                                <div ref={patientsRef}>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="mb-0 fw-bold text-success">
                                            รายชื่อผู้มารับบริการปฐมภูมิ PCC ประจำเดือน {selectedMonth || 'กรุณาเลือกในตาราง'}
                                        </h5>
                                        <span className="badge bg-soft-success text-success px-3 py-2 rounded-pill fw-bold">
                                            ทั้งหมด {patientsData.length} ราย
                                        </span>
                                    </div>

                                    {patientsLoading ? (
                                        <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
                                    ) : patientsData.length === 0 ? (
                                        <div className="text-center py-5 text-muted">
                                            <IconifyIcon icon="solar:users-group-two-rounded-broken" className="fs-48 mb-2 text-success opacity-50" />
                                            <p className="mb-0">ไม่พบข้อมูลผู้รับบริการ หรือคลิกเลือกตัวเลขในตารางเพื่อดูรายชื่อ</p>
                                        </div>
                                    ) : (
                                        <Grid
                                                data={patientsData.map((pt, idx) => [
                                                    `${new Date(pt.vstdate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}`,
                                                    html(`<code>${pt.hn}</code>`),
                                                    pt.ptname,
                                                    pt.age,
                                                    pt.pttypename,
                                                    html(`<span class="badge bg-soft-success text-success">${pt.dxname}</span>`),
                                                    (pt.income || 0).toLocaleString(),
                                                    pt.address
                                                ])}
                                                columns={["วันที่รับบริการ", "HN", "ชื่อ-นามสกุล", "อายุ", "สิทธิ์การรักษา", "การวินิจฉัยโรคหลัก", "รายได้เรียกเก็บ", "ที่อยู่"]}
                                                search={true}
                                                pagination={{ limit: 10 }}
                                                sort={true}
                                                language={{
                                                    'search': { 'placeholder': 'ค้นหา...' },
                                                    'pagination': { 'previous': 'ก่อนหน้า', 'next': 'ถัดไป', 'showing': 'แสดง', 'results': () => 'รายการ' },
                                                    'noRecordsFound': 'ไม่พบรายชื่อผู้รับบริการ'
                                                }}
                                                className={{
                                                    table: 'table table-hover align-middle mb-0 table-sm',
                                                    th: 'bg-success text-white fw-semibold',
                                                    pagination: 'mt-0 mb-0 p-1',
                                                    container: 'mt-0 mb-0 p-0'
                                                }}
                                            />
                                    )}
                                </div>
                            </Tab.Pane>
)}
                        </Tab.Content>
                    </Tab.Container>
                </CardBody>
            </Card>
        </MainLayout>
    );
};

export default PCCStatsPage;
