import { useEffect, useState, useRef } from 'react';
import PageTitle from '@/components/PageTitle';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardBody, Col, Row, Spinner, Table, Tab, Nav, Button } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import axios from 'axios';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { usePage } from '@inertiajs/react';
import { Grid, _ } from 'gridjs-react';
import { html } from 'gridjs';

const DentalStatsPage = ({ api_token, external_api_url }: { api_token: string, external_api_url: string }) => {
    const { auth } = usePage().props as any;
    const currentBE = new Date().getFullYear() + (new Date().getMonth() > 8 ? 1 : 0) + 543;
    const [fiscalYear, setFiscalYear] = useState(currentBE);
    const [loading, setLoading] = useState(true);
    const [summaryData, setSummaryData] = useState<any[]>([]);
    const [insclData, setInsclData] = useState<any[]>([]);
    const [insclBreakdown, setInsclBreakdown] = useState<{ patients: any[], visits: any[] }>({ patients: [], visits: [] });
    const [treatmentsData, setTreatmentsData] = useState<any[]>([]);
    const [groupsData, setGroupsData] = useState<any[]>([]);
    const [groupPieData, setGroupPieData] = useState<any[]>([]);
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

            const [summaryRes, insclRes, breakdownRes, treatmentsRes, groupsRes, groupPieRes] = await Promise.all([
                axios.get(`${apiUrl}/api/v1/dent/stats-summary?fiscal_year=${year}`, { headers }),
                axios.get(`${apiUrl}/api/v1/dent/stats-inscl?fiscal_year=${year}`, { headers }),
                axios.get(`${apiUrl}/api/v1/dent/stats-inscl-breakdown?fiscal_year=${year}`, { headers }),
                axios.get(`${apiUrl}/api/v1/dent/stats-treatments?fiscal_year=${year}`, { headers }),
                axios.get(`${apiUrl}/api/v1/dent/stats-groups?fiscal_year=${year}`, { headers }),
                axios.get(`${apiUrl}/api/v1/dent/stats-group-pie?fiscal_year=${year}`, { headers })
            ]);

            setSummaryData(summaryRes.data.data);
            setInsclData(insclRes.data.data);
            setInsclBreakdown(breakdownRes.data);
            setTreatmentsData(treatmentsRes.data.data);
            setGroupsData(groupsRes.data.data);
            setGroupPieData(groupPieRes.data.data);
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

            const res = await axios.get(`${apiUrl}/api/v1/dent/patients?ym=${ym}`, { headers });
            setPatientsData(res.data.data);
            
            // Switch to Patient List tab and scroll to element
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

    // Month lists
    const monthNames = ['ต.ค.', 'พ.ย.', 'ธ.ค.', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.'];
    const monthKeys = ['m10', 'm11', 'm12', 'm01', 'm02', 'm03', 'm04', 'm05', 'm06', 'm07', 'm08', 'm09'];

    // Sort summary data by month order (Oct=10 to Sep=09)
    const sortedSummary = [...summaryData].sort((a, b) => {
        const m1 = parseInt(a.AM);
        const m2 = parseInt(b.AM);
        const order = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        return order.indexOf(m1) - order.indexOf(m2);
    });

    // Chart Options for Dental Monthly Summary
    const chartOptions: ApexOptions = {
        chart: { type: 'bar', toolbar: { show: true } },
        plotOptions: { bar: { horizontal: false, columnWidth: '45%', borderRadius: 4 } },
        xaxis: { categories: monthNames },
        colors: ['#0acf97', '#727cf5'],
        legend: { position: 'top' },
        fill: { opacity: 1 },
        title: { text: `แนวโน้มผู้รับบริการทันตกรรมแยกตามเดือน ปีงบประมาณ ${fiscalYear}`, align: 'center', style: { fontSize: '15px', fontWeight: 'bold' } }
    };

    const chartSeries = [
        { name: 'จำนวนผู้ป่วย (คน/HN)', data: sortedSummary.map(d => d.hn_count) },
        { name: 'จำนวนผู้รับบริการ (ครั้ง/VN)', data: sortedSummary.map(d => d.vn_count) }
    ];

    // Pie Chart Options for Insurance
    const getPieOptions = (title: string, labels: string[]): ApexOptions => ({
        chart: { type: 'pie' },
        labels: labels,
        legend: { position: 'bottom' },
        title: { text: title, align: 'center', style: { fontSize: '14px', fontWeight: 'bold' } },
        responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: 'bottom' } } }]
    });

    return (
        <MainLayout>
            <PageTitle title="สถิติทันตกรรม (Dental Statistics)" subTitle="Stats" />

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
                            <h5 className="mb-1 fw-bold">รายงานสถิติงานทันตกรรม</h5>
                            <p className="text-muted mb-0 small">สรุปสถิติจำนวนผู้มารับบริการ สิทธิการรักษา ประเภทการรักษา และรายชื่อผู้มารับบริการแยกตามเดือน</p>
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
                            <Nav.Item>
                                <Nav.Link eventKey="treatments" className="py-2">
                                    <IconifyIcon icon="solar:bill-list-bold-duotone" className="me-2 fs-18 align-middle" />
                                    รายการรักษาทันตกรรม
                                </Nav.Link>
                            </Nav.Item>
                            {auth?.user && (
<Nav.Item>
                                <Nav.Link eventKey="patients" className="py-2">
                                    <IconifyIcon icon="solar:users-group-two-rounded-bold-duotone" className="me-2 fs-18 align-middle" />
                                    รายชื่อผู้รับบริการ {selectedMonth && `(${selectedMonth})`}
                                </Nav.Link>
                            </Nav.Item>
)}
                        </Nav>
                        
                        <Tab.Content>
                            {/* Tab 1: Charts */}
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
                                                    options={getPieOptions('สัดส่วนผู้ป่วยแยกตามสิทธิการรักษา (ครั้ง)', insclData.map(i => i.inscl_name || 'ไม่ระบุ'))} 
                                                    series={insclData.map(i => i.count)} 
                                                    type="pie" 
                                                    height={340} 
                                                />
                                            )}
                                        </div>
                                    </Col>

                                    <Col lg={6}>
                                        <div className="border rounded p-3 bg-white shadow-sm h-100">
                                            {loading ? (
                                                <div className="text-center py-5"><Spinner animation="grow" variant="success" /></div>
                                            ) : (
                                                <ReactApexChart 
                                                    options={getPieOptions('สัดส่วนสถิติการรักษาแยกตามกลุ่มงานทันตกรรม', groupPieData.map(i => i.group_name || 'ไม่ระบุ'))} 
                                                    series={groupPieData.map(i => i.vn_count)} 
                                                    type="pie" 
                                                    height={340} 
                                                />
                                            )}
                                        </div>
                                    </Col>
                                </Row>
                            </Tab.Pane>

                            {/* Tab 2: Tables (pttype breakdown) */}
                            <Tab.Pane eventKey="tables">
                                <h5 className="mb-3 fw-bold text-success d-flex align-items-center">
                                    <IconifyIcon icon="solar:user-bold" className="me-2" />
                                    1. ตารางสถิติทันตกรรม รายคน (HN) แยกตามสิทธิรายเดือน
                                </h5>
                                <div className="table-responsive mb-5 border rounded shadow-sm">
                                    <Table hover bordered striped className="align-middle table-sm mb-0">
                                        <thead className="bg-success text-white">
                                            <tr>
                                                <th>รหัส</th>
                                                <th>สิทธิการรักษา (Pttype)</th>
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
                                                    <td className="text-center fw-bold bg-light">{row.hn_count.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-light fw-bold border-top-2">
                                            <tr>
                                                <td colSpan={2} className="text-end text-uppercase">รวมผู้ป่วยทั้งหมด (คน)</td>
                                                {monthKeys.map((mk, i) => {
                                                    const total = insclBreakdown.patients.reduce((sum, r) => sum + (r[mk] || 0), 0);
                                                    const mNum = parseInt(mk.replace('m', ''));
                                                    const y = mNum >= 10 ? fiscalYear - 544 : fiscalYear - 543;
                                                    const ym = `${y}-${mNum.toString().padStart(2, '0')}`;
                                                    return (
                                                        <td key={i} className="text-center">
                                                            {total > 0 ? (
                                                                <button className="btn btn-link btn-sm p-0 fw-bold text-success" onClick={() => fetchPatients(ym)}>
                                                                    {total.toLocaleString()}
                                                                </button>
                                                            ) : '0'}
                                                        </td>
                                                    );
                                                })}
                                                <td className="text-center bg-dark text-white fw-bold">
                                                    {insclBreakdown.patients.reduce((sum, r) => sum + (r.hn_count || 0), 0).toLocaleString()}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </Table>
                                </div>

                                <h5 className="mb-3 fw-bold text-info d-flex align-items-center">
                                    <IconifyIcon icon="solar:calendar-bold" className="me-2" />
                                    2. ตารางสถิติทันตกรรม รายครั้ง (VN) แยกตามสิทธิรายเดือน
                                </h5>
                                <div className="table-responsive border rounded shadow-sm">
                                    <Table hover bordered striped className="align-middle table-sm mb-0">
                                        <thead className="bg-info text-white">
                                            <tr>
                                                <th>รหัส</th>
                                                <th>สิทธิการรักษา (Pttype)</th>
                                                {monthNames.map((m, i) => <th key={i} className="text-center">{m}</th>)}
                                                <th className="text-center bg-dark text-white">รวม</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr><td colSpan={15} className="text-center py-5"><Spinner animation="border" variant="info" /></td></tr>
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
                                                                    <button className="btn btn-link btn-sm p-0 fw-bold text-info" onClick={() => fetchPatients(ym)}>
                                                                        {row[mk].toLocaleString()}
                                                                    </button>
                                                                ) : '0'}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="text-center fw-bold bg-light">{row.vn_count.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-light fw-bold border-top-2">
                                            <tr>
                                                <td colSpan={2} className="text-end text-uppercase">รวมการรับบริการทั้งหมด (ครั้ง)</td>
                                                {monthKeys.map((mk, i) => {
                                                    const total = insclBreakdown.visits.reduce((sum, r) => sum + (r[mk] || 0), 0);
                                                    const mNum = parseInt(mk.replace('m', ''));
                                                    const y = mNum >= 10 ? fiscalYear - 544 : fiscalYear - 543;
                                                    const ym = `${y}-${mNum.toString().padStart(2, '0')}`;
                                                    return (
                                                        <td key={i} className="text-center">
                                                            {total > 0 ? (
                                                                <button className="btn btn-link btn-sm p-0 fw-bold text-info" onClick={() => fetchPatients(ym)}>
                                                                    {total.toLocaleString()}
                                                                </button>
                                                            ) : '0'}
                                                        </td>
                                                    );
                                                })}
                                                <td className="text-center bg-dark text-white fw-bold">
                                                    {insclBreakdown.visits.reduce((sum, r) => sum + (r.vn_count || 0), 0).toLocaleString()}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </Table>
                                </div>
                            </Tab.Pane>

                            {/* Tab 3: Specific Treatments */}
                            <Tab.Pane eventKey="treatments">
                                <Row className="g-4">
                                    <Col lg={6}>
                                        <div className="border rounded p-3 bg-white shadow-sm">
                                            <h5 className="mb-3 fw-bold text-success d-flex align-items-center">
                                                <IconifyIcon icon="solar:document-bold" className="me-2" />
                                                แยกตามกิจกรรมการรักษา
                                            </h5>
                                            <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                                <Table hover striped bordered className="align-middle table-sm mb-0">
                                                    <thead className="sticky-top bg-success text-white">
                                                        <tr>
                                                            <th className="text-center">รหัส</th>
                                                            <th>กิจกรรมรักษาพยาบาล</th>
                                                            <th className="text-center">จำนวน (ครั้ง)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {loading ? (
                                                            <tr><td colSpan={3} className="text-center py-5"><Spinner animation="border" variant="success" /></td></tr>
                                                        ) : treatmentsData.map((row, idx) => (
                                                            <tr key={idx}>
                                                                <td className="text-center"><code>{row.dtcode}</code></td>
                                                                <td className="small fw-semibold">{row.name}</td>
                                                                <td className="text-center fw-bold text-success">{row.vn_count.toLocaleString()}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        </div>
                                    </Col>

                                    <Col lg={6}>
                                        <div className="border rounded p-3 bg-white shadow-sm">
                                            <h5 className="mb-3 fw-bold text-info d-flex align-items-center">
                                                <IconifyIcon icon="solar:folder-bold" className="me-2" />
                                                แยกตามกลุ่มกิจกรรมหลัก
                                            </h5>
                                            <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                                <Table hover striped bordered className="align-middle table-sm mb-0">
                                                    <thead className="sticky-top bg-info text-white">
                                                        <tr>
                                                            <th>กลุ่มกิจกรรมทันตกรรม</th>
                                                            <th>รายการย่อย</th>
                                                            <th className="text-center">จำนวน (ครั้ง)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {loading ? (
                                                            <tr><td colSpan={3} className="text-center py-5"><Spinner animation="border" variant="info" /></td></tr>
                                                        ) : groupsData.map((row, idx) => (
                                                            <tr key={idx}>
                                                                <td className="small fw-bold text-primary">{row.group_name}</td>
                                                                <td className="small">{row.name}</td>
                                                                <td className="text-center fw-bold text-info">{row.vn_count.toLocaleString()}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </Tab.Pane>

                            {/* Tab 4: Patient List */}
                            {auth?.user && (
<Tab.Pane eventKey="patients">
                                <div ref={patientsRef}>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="fw-bold text-success d-flex align-items-center mb-0">
                                            <IconifyIcon icon="solar:users-group-two-rounded-bold" className="me-2" />
                                            รายชื่อผู้รับบริการทันตกรรม ประจำเดือน {selectedMonth || '—'}
                                        </h5>
                                        {selectedMonth && (
                                            <span className="badge bg-soft-success text-success fs-13 px-3 py-2 rounded-pill">
                                                จำนวนทั้งหมด {patientsData.length.toLocaleString()} ราย
                                            </span>
                                        )}
                                    </div>

                                    {!selectedMonth ? (
                                        <div className="alert alert-info border-0 shadow-sm text-center py-4">
                                            <IconifyIcon icon="solar:info-circle-bold" className="fs-32 mb-2 d-block mx-auto text-info" />
                                            โปรดคลิกที่ตัวเลขสถิติรายเดือนใน <strong>"ตารางสรุปสิทธิ์"</strong> เพื่อเปิดดูรายชื่อผู้รับบริการ
                                        </div>
                                    ) : patientsLoading ? (
                                        <div className="text-center py-5"><Spinner animation="border" variant="success" className="me-2" /> กำลังดึงข้อมูล...</div>
                                    ) : (
                                        <Grid
                                                data={patientsData.map((row, idx) => [
                                                    idx + 1,
                                                    row.vstdate,
                                                    row.hn,
                                                    `${row.pname}${row.fname} ${row.lname}`,
                                                    row.age_y || '-',
                                                    `${row.addrpart || ''} หมู่ ${row.moopart || ''} ${row.road ? 'ถ.' + row.road : ''} ${row.full_name || ''}`,
                                                    row.pttypename,
                                                    `${row.pdx ? `${row.pdx} : ${row.dxname || ''}` : '-'}`,
                                                    (row.dent_fee || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
                                                    (row.income || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })
                                                ])}
                                                columns={["ลำดับ", "วันที่รับบริการ", "HN", "ชื่อ-นามสกุล", "อายุ (ปี)", "ที่อยู่", "สิทธิการรักษา", "การวินิจฉัยหลัก (PDx)", "ค่าใช้จ่ายทันตกรรม", "ค่าใช้จ่ายรวม"]}
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
                                                    th: 'bg-primary text-white fw-semibold',
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

export default DentalStatsPage;
