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

const NCDStatsPage = ({ api_token, external_api_url }: { api_token: string, external_api_url: string }) => {
    const { auth } = usePage().props as any;
    const [loading, setLoading] = useState(true);
    const [summaryData, setSummaryData] = useState<any[]>([]);
    const [ageData, setAgeData] = useState<any>({ dm: {}, ht: {} });
    const [patientsData, setPatientsData] = useState<any[]>([]);
    const [selectedClinic, setSelectedClinic] = useState<string>('dm');
    const [patientsLoading, setPatientsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('charts');
    const [error, setError] = useState<string | null>(null);

    const patientsRef = useRef<HTMLDivElement>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const apiUrl = external_api_url || 'http://127.0.0.1:8800';
            const headers = { Authorization: `Bearer ${api_token}` };

            const [summaryRes, ageRes] = await Promise.all([
                axios.get(`${apiUrl}/api/v1/ncd/stats-summary`, { headers }),
                axios.get(`${apiUrl}/api/v1/ncd/stats-age-breakdown`, { headers })
            ]);

            setSummaryData(summaryRes.data.data);
            setAgeData(ageRes.data);
            setError(null);
        } catch (err: any) {
            console.error('API Error:', err);
            const msg = err.response?.data?.detail || err.message || 'ไม่สามารถเชื่อมต่อกับ API ได้';
            setError(`API Error: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchPatients = async (clinic: string) => {
        try {
            setPatientsLoading(true);
            setSelectedClinic(clinic);
            const apiUrl = external_api_url || 'http://127.0.0.1:8800';
            const headers = { Authorization: `Bearer ${api_token}` };

            const res = await axios.get(`${apiUrl}/api/v1/ncd/patients?clinic=${clinic}`, { headers });
            setPatientsData(res.data.data);
            
            setActiveTab('patients');
            setTimeout(() => {
                patientsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        } catch (err: any) {
            console.error('API Error:', err);
            const msg = err.response?.data?.detail || err.message || 'ไม่สามารถดึงข้อมูลทะเบียนผู้ป่วยเรื้อรังได้';
            setError(`API Error: ${msg}`);
        } finally {
            setPatientsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const dmAgeValues = [
        ageData.dm?.age_0_19 || 0,
        ageData.dm?.age_20_34 || 0,
        ageData.dm?.age_35_59 || 0,
        ageData.dm?.age_60_69 || 0,
        ageData.dm?.age_70_79 || 0,
        ageData.dm?.age_80up || 0
    ];

    const htAgeValues = [
        ageData.ht?.age_0_19 || 0,
        ageData.ht?.age_20_34 || 0,
        ageData.ht?.age_35_59 || 0,
        ageData.ht?.age_60_69 || 0,
        ageData.ht?.age_70_79 || 0,
        ageData.ht?.age_80up || 0
    ];

    const barChartOptions: ApexOptions = {
        chart: { type: 'bar', toolbar: { show: true } },
        plotOptions: { bar: { horizontal: false, columnWidth: '55%', borderRadius: 4 } },
        xaxis: { categories: ['0-19 ปี', '20-34 ปี', '35-59 ปี', '60-69 ปี', '70-79 ปี', '80 ปีขึ้นไป'] },
        colors: ['#0acf97', '#727cf5'],
        legend: { position: 'top' },
        fill: { opacity: 1 },
        title: { text: 'โครงสร้างกลุ่มอายุผู้ป่วยลงทะเบียน DM & HT', align: 'center', style: { fontSize: '15px', fontWeight: 'bold' } }
    };

    const barChartSeries = [
        { name: 'ผู้ป่วยโรคเบาหวาน (DM)', data: dmAgeValues },
        { name: 'ผู้ป่วยโรคความดันโลหิตสูง (HT)', data: htAgeValues }
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
            <PageTitle title="โรคไม่ติดต่อ (NCD)" subTitle="Stats" />

            <Row className="mb-2 align-items-center">
                <Col md={6}>
                    <h5 className="mb-0 text-muted small">ทะเบียนผู้ป่วยเบาหวาน ความดัน และโรคไม่ติดต่อ</h5>
                </Col>
                <Col md={6} className="text-md-end mt-3 mt-md-0">
                    <button className="btn btn-soft-success rounded-pill px-4 shadow-sm" onClick={fetchData}>
                        <IconifyIcon icon="solar:refresh-bold" className="me-1" /> รีเฟรชทะเบียนโรค
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
                            <h5 className="mb-1 fw-bold">ระบบข้อมูลสุขภาพ NCD และทะเบียนกลุ่มเสี่ยง</h5>
                        </div>
                    </div>

                    <Tab.Container activeKey={activeTab} onSelect={(k) => k && setActiveTab(k)}>
                        <Nav role="tablist" className="nav-tabs nav-bordered nav-bordered-success mb-3">
                            <Nav.Item>
                                <Nav.Link eventKey="charts" className="py-2">
                                    <IconifyIcon icon="solar:chart-bold-duotone" className="me-2 fs-18 align-middle" />
                                    โครงสร้างผู้ป่วยโรคเรื้อรัง
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="tables" className="py-2">
                                    <IconifyIcon icon="solar:table-list-bold-duotone" className="me-2 fs-18 align-middle" />
                                    ตารางวิเคราะห์ประชากร
                                </Nav.Link>
                            </Nav.Item>
                            {auth?.user && (
<Nav.Item>
                                <Nav.Link eventKey="patients" className="py-2">
                                    <IconifyIcon icon="solar:users-group-two-rounded-bold-duotone" className="me-2 fs-18 align-middle" />
                                    รายชื่อผู้ป่วยในทะเบียนโรคเรื้อรัง
                                </Nav.Link>
                            </Nav.Item>
)}
                        </Nav>
                        
                        <Tab.Content>
                            <Tab.Pane eventKey="charts">
                                <Row className="g-4">
                                    <Col lg={7}>
                                        <div className="border rounded p-3 bg-white shadow-sm h-100">
                                            {loading ? (
                                                <div className="text-center py-5"><Spinner animation="grow" variant="success" /></div>
                                            ) : (
                                                <ReactApexChart options={barChartOptions} series={barChartSeries} type="bar" height={380} />
                                            )}
                                        </div>
                                    </Col>

                                    <Col lg={5}>
                                        <div className="border rounded p-3 bg-white shadow-sm h-100">
                                            {loading ? (
                                                <div className="text-center py-5"><Spinner animation="grow" variant="success" /></div>
                                            ) : (
                                                <ReactApexChart 
                                                    options={getPieOptions('สัดส่วนผู้ป่วยแยกตามโรคเรื้อรังที่ลงทะเบียนในเขต (ราย)', summaryData.map(i => i.ncdname || 'ไม่ระบุ'))} 
                                                    series={summaryData.map(i => i.ptotal)} 
                                                    type="pie" 
                                                    height={340} 
                                                />
                                            )}
                                        </div>
                                    </Col>
                                </Row>
                            </Tab.Pane>

                            <Tab.Pane eventKey="tables">
                                <h5 className="mb-3 fw-bold text-success d-flex align-items-center">
                                    <IconifyIcon icon="solar:user-bold" className="me-2" />
                                    ตารางวิเคราะห์สัดส่วนอายุแยกตามโรคเรื้อรังยอดฮิต (เบาหวาน & ความดันโลหิตสูง)
                                </h5>
                                <div className="table-responsive border rounded shadow-sm">
                                    <Table hover bordered striped className="align-middle mb-0">
                                        <thead className="bg-success text-white">
                                            <tr>
                                                <th>ประเภททะเบียนโรคเรื้อรัง</th>
                                                <th className="text-center">0-19 ปี</th>
                                                <th className="text-center">20-34 ปี</th>
                                                <th className="text-center">35-59 ปี</th>
                                                <th className="text-center">60-69 ปี</th>
                                                <th className="text-center">70-79 ปี</th>
                                                <th className="text-center">80 ปีขึ้นไป</th>
                                                <th className="text-center bg-dark text-white">รวมในทะเบียน (ราย)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr><td colSpan={8} className="text-center py-5"><Spinner animation="border" variant="success" /></td></tr>
                                            ) : (
                                                <>
                                                    <tr>
                                                        <td className="fw-bold">
                                                            <button className="btn btn-link p-0 fw-bold text-success text-start" onClick={() => fetchPatients('dm')}>
                                                                เบาหวาน (Diabetes Mellitus - DM)
                                                            </button>
                                                        </td>
                                                        <td className="text-center">{ageData.dm?.age_0_19?.toLocaleString() || 0}</td>
                                                        <td className="text-center">{ageData.dm?.age_20_34?.toLocaleString() || 0}</td>
                                                        <td className="text-center">{ageData.dm?.age_35_59?.toLocaleString() || 0}</td>
                                                        <td className="text-center">{ageData.dm?.age_60_69?.toLocaleString() || 0}</td>
                                                        <td className="text-center">{ageData.dm?.age_70_79?.toLocaleString() || 0}</td>
                                                        <td className="text-center">{ageData.dm?.age_80up?.toLocaleString() || 0}</td>
                                                        <td className="text-center fw-bold bg-light">{ageData.dm?.total?.toLocaleString() || 0}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="fw-bold">
                                                            <button className="btn btn-link p-0 fw-bold text-primary text-start" onClick={() => fetchPatients('ht')}>
                                                                ความดันโลหิตสูง (Hypertension - HT)
                                                            </button>
                                                        </td>
                                                        <td className="text-center">{ageData.ht?.age_0_19?.toLocaleString() || 0}</td>
                                                        <td className="text-center">{ageData.ht?.age_20_34?.toLocaleString() || 0}</td>
                                                        <td className="text-center">{ageData.ht?.age_35_59?.toLocaleString() || 0}</td>
                                                        <td className="text-center">{ageData.ht?.age_60_69?.toLocaleString() || 0}</td>
                                                        <td className="text-center">{ageData.ht?.age_70_79?.toLocaleString() || 0}</td>
                                                        <td className="text-center">{ageData.ht?.age_80up?.toLocaleString() || 0}</td>
                                                        <td className="text-center fw-bold bg-light">{ageData.ht?.total?.toLocaleString() || 0}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="fw-bold">
                                                            <button className="btn btn-link p-0 fw-bold text-info text-start" onClick={() => fetchPatients('copd')}>
                                                                ปอดอุดกั้นเรื้อรัง (COPD Clinic)
                                                            </button>
                                                        </td>
                                                        <td colSpan={6} className="text-center text-muted italic small">ไม่มีข้อมูลแยกกลุ่มอายุแบบละเอียด</td>
                                                        <td className="text-center fw-bold bg-light">
                                                            {summaryData.find(s => s.clinic === '043' || s.clinic === 'copd')?.ptotal?.toLocaleString() || '0'}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="fw-bold">
                                                            <button className="btn btn-link p-0 fw-bold text-danger text-start" onClick={() => fetchPatients('cancer')}>
                                                                โรคมะเร็ง (Cancer Register)
                                                            </button>
                                                        </td>
                                                        <td colSpan={6} className="text-center text-muted italic small">ไม่มีข้อมูลแยกกลุ่มอายุแบบละเอียด</td>
                                                        <td className="text-center fw-bold bg-light">
                                                            {summaryData.find(s => s.clinic === 'cancer')?.ptotal?.toLocaleString() || '0'}
                                                        </td>
                                                    </tr>
                                                </>
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            </Tab.Pane>

                            {auth?.user && (
<Tab.Pane eventKey="patients">
                                <div ref={patientsRef}>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="mb-0 fw-bold text-success">
                                            รายชื่อทะเบียนโรคระบาดวิทยา / โรคเรื้อรังกลุ่มเป้าหมาย (แสดงสูงสุด 500 รายแรก)
                                        </h5>
                                        <div className="d-flex gap-2">
                                            <button className={`btn btn-sm ${selectedClinic === 'dm' ? 'btn-success' : 'btn-soft-success'}`} onClick={() => fetchPatients('dm')}>DM</button>
                                            <button className={`btn btn-sm ${selectedClinic === 'ht' ? 'btn-primary' : 'btn-soft-primary'}`} onClick={() => fetchPatients('ht')}>HT</button>
                                            <button className={`btn btn-sm ${selectedClinic === 'copd' ? 'btn-info' : 'btn-soft-info'}`} onClick={() => fetchPatients('copd')}>COPD</button>
                                            <button className={`btn btn-sm ${selectedClinic === 'cancer' ? 'btn-danger' : 'btn-soft-danger'}`} onClick={() => fetchPatients('cancer')}>Cancer</button>
                                        </div>
                                    </div>

                                    {patientsLoading ? (
                                        <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
                                    ) : patientsData.length === 0 ? (
                                        <div className="text-center py-5 text-muted">
                                            <IconifyIcon icon="solar:users-group-two-rounded-broken" className="fs-48 mb-2 text-success opacity-50" />
                                            <p className="mb-0">ไม่พบข้อมูลรายชื่อในกลุ่มเป้าหมาย หรือกรุณาเลือกปุ่มด้านขวาบนเพื่อเรียกสถิติ</p>
                                        </div>
                                    ) : (
                                        <Grid
                                                data={patientsData.map((pt, idx) => [
                                                    idx + 1,
                                                    html(`<code>${pt.hn}</code>`),
                                                    pt.ptname,
                                                    pt.age,
                                                    html(`<span class="badge bg-soft-success text-success">${pt.disease}</span>`),
                                                    `${pt.vstdate ? new Date(pt.vstdate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}`,
                                                    pt.address
                                                ])}
                                                columns={["ลำดับ", "HN", "ชื่อ-นามสกุลผู้ลงทะเบียน", "อายุปัจจุบัน (ปี)", "ทะเบียนโรคหลัก", "วันที่ลงทะเบียนขึ้นทะเบียน", "ที่อยู่ตามทะเบียนราษฎร์"]}
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

export default NCDStatsPage;
