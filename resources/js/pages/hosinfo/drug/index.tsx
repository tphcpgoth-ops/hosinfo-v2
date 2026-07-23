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

const DrugStatsPage = ({ api_token, external_api_url }: { api_token: string, external_api_url: string }) => {
    const { auth } = usePage().props as any;
    const currentBE = new Date().getFullYear() + (new Date().getMonth() > 8 ? 1 : 0) + 543;
    const [fiscalYear, setFiscalYear] = useState(currentBE);
    const [loading, setLoading] = useState(true);
    const [summaryData, setSummaryData] = useState<any[]>([]);
    const [diseasesData, setDiseasesData] = useState<any[]>([]);
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

            const [summaryRes, diseasesRes] = await Promise.all([
                axios.get(`${apiUrl}/api/v1/drug/stats-summary?fiscal_year=${year}`, { headers }),
                axios.get(`${apiUrl}/api/v1/drug/stats-diseases?fiscal_year=${year}`, { headers })
            ]);

            setSummaryData(summaryRes.data?.data || []);
            setDiseasesData(diseasesRes.data?.data || []);
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

            const res = await axios.get(`${apiUrl}/api/v1/drug/patients?ym=${ym}`, { headers });
            setPatientsData(res.data?.data || []);
            
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
    const monthKeys = ['10', '11', '12', '01', '02', '03', '04', '05', '06', '07', '08', '09'];

    const sortedSummary = [...summaryData].sort((a, b) => {
        const m1 = parseInt(a.AM || '0');
        const m2 = parseInt(b.AM || '0');
        const order = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        return order.indexOf(m1) - order.indexOf(m2);
    });

    const chartOptions: ApexOptions = {
        chart: { type: 'bar', toolbar: { show: true } },
        plotOptions: { bar: { horizontal: false, columnWidth: '45%', borderRadius: 4 } },
        xaxis: { categories: monthNames },
        colors: ['#28a745', '#20c997'],
        legend: { position: 'top' },
        fill: { opacity: 1 },
        title: { text: `จำนวนผู้รับบริการคลินิกยาเสพติดแยกตามเดือน ปีงบประมาณ ${fiscalYear}`, align: 'center', style: { fontSize: '15px', fontWeight: 'bold' } }
    };

    const chartSeries = [
        { name: 'จำนวนผู้ป่วยสะสม (คน/HN)', data: monthKeys.map(k => {
            const found = summaryData.find(d => d.AM && parseInt(d.AM) === parseInt(k));
            return found ? (found.hn_count || 0) : 0;
        }) },
        { name: 'จำนวนครั้งที่รับบริการ (ครั้ง/VN)', data: monthKeys.map(k => {
            const found = summaryData.find(d => d.AM && parseInt(d.AM) === parseInt(k));
            return found ? (found.total || 0) : 0;
        }) }
    ];

    return (
        <MainLayout>
            <PageTitle title="สถิติผู้รับบริการคลินิกยาเสพติด (Substance Abuse & Narcotics Clinic)" subTitle="Stats" />

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
                            <h5 className="mb-1 fw-bold text-success"><IconifyIcon icon="tabler:leaf" className="me-2" />รายงานสถิติคลิกนิกยาเสพติด (คลินิก 130)</h5>
                            <p className="text-muted mb-0 small">สรุปสถิติจำนวนผู้รับบริการและกลุ่มโรคที่เกี่ยวข้องตามปีงบประมาณ</p>
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
                                    ตารางข้อมูล
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
                                </Row>
                            </Tab.Pane>

                            <Tab.Pane eventKey="tables">
                                <h5 className="mb-3 fw-bold text-success d-flex align-items-center">
                                    <IconifyIcon icon="solar:shield-check-bold" className="me-2" />
                                    ตารางแสดงจำนวนผู้รับบริการแยกตามการวินิจฉัยโรค (ICD-10) และรายเดือน
                                </h5>
                                <div className="table-responsive border rounded shadow-sm">
                                    <Table hover bordered striped className="align-middle table-sm mb-0">
                                        <thead className="bg-success text-white">
                                            <tr>
                                                <th>รหัสโรค (ICD-10)</th>
                                                <th>ชื่อโรค / คำอธิบาย</th>
                                                {monthNames.map((m, i) => <th key={i} className="text-center">{m}</th>)}
                                                <th className="text-center bg-dark text-white">รวม</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr><td colSpan={15} className="text-center py-5"><Spinner animation="border" variant="success" /></td></tr>
                                            ) : diseasesData.length === 0 ? (
                                                <tr><td colSpan={15} className="text-center py-4 text-muted">ไม่พบข้อมูลสถิติการวินิจฉัยโรคในปีนี้</td></tr>
                                            ) : diseasesData.map((row, idx) => (
                                                <tr key={idx}>
                                                    <td><code>{row.code}</code></td>
                                                    <td className="small fw-semibold">{row.name}</td>
                                                    {monthKeys.map((mk, i) => {
                                                        const mNum = parseInt(mk);
                                                        const y = mNum >= 10 ? fiscalYear - 544 : fiscalYear - 543;
                                                        const ym = `${y}-${mk}`;
                                                        const mData = row.months?.[mk] || 0;
                                                        return (
                                                            <td key={i} className="text-center">
                                                                {mData > 0 ? (
                                                                    <button className="btn btn-link btn-sm p-0 fw-bold text-success" onClick={() => fetchPatients(ym)}>
                                                                        {mData.toLocaleString()}
                                                                    </button>
                                                                ) : '0'}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="text-center fw-bold bg-light">{row.count.toLocaleString()}</td>
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
                                                รายชื่อผู้รับบริการ ประจำเดือน {selectedMonth || 'กรุณาเลือกในตาราง'}
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
                                                data={patientsData.map((pt) => [
                                                    `${new Date(pt.vstdate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}`,
                                                    html(`<code>${pt.hn}</code>`),
                                                    pt.ptname,
                                                    html(`<code>${pt.pdx}</code>`),
                                                    pt.dxname
                                                ])}
                                                columns={["วันที่รับบริการ", "HN", "ชื่อ-นามสกุล", "การวินิจฉัยหลัก (ICD-10)", "รายละเอียดโรค"]}
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

export default DrugStatsPage;
