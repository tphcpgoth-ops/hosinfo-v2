import { useEffect, useState } from 'react';
import PageTitle from '@/components/PageTitle';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardBody, Col, Row, Spinner, Table, Tab, Nav } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import axios from 'axios';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const OpdStatsPage = ({ api_token }: { api_token: string }) => {
    const currentBE = new Date().getFullYear() + (new Date().getMonth() > 8 ? 1 : 0) + 543;
    const [fiscalYear, setFiscalYear] = useState(currentBE);
    const [loading, setLoading] = useState(true);
    const [summaryData, setSummaryData] = useState<any[]>([]);
    const [specialtyData, setSpecialtyData] = useState<any[]>([]);
    const [insclData, setInsclData] = useState<{ opd: any[], ipd: any[] }>({ opd: [], ipd: [] });
    const [topDiseases, setTopDiseases] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async (year: number) => {
        try {
            setLoading(true);
            const apiUrl = import.meta.env.VITE_EXTERNAL_API_URL || 'http://127.0.0.1:8800';
            const headers = { Authorization: `Bearer ${api_token}` };

            const [summaryRes, specialtyRes, insclRes, icd10Res] = await Promise.all([
                axios.get(`${apiUrl}/api/v1/opd/stats-summary?fiscal_year=${year}`, { headers }),
                axios.get(`${apiUrl}/api/v1/opd/stats-specialty?fiscal_year=${year}`, { headers }),
                axios.get(`${apiUrl}/api/v1/opd/stats-inscl?fiscal_year=${year}`, { headers }),
                axios.get(`${apiUrl}/api/v1/opd/stats-icd10?fiscal_year=${year}`, { headers })
            ]);

            setSummaryData(summaryRes.data.data);
            setSpecialtyData(specialtyRes.data.data);
            setInsclData(insclRes.data);
            setTopDiseases(icd10Res.data.data);
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

    // Chart Options for Monthly Summary
    const monthNames = ['ต.ค.', 'พ.ย.', 'ธ.ค.', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.'];
    
    // Sort summary data by month order (Oct=10 to Sep=09)
    const sortedSummary = [...summaryData].sort((a, b) => {
        const m1 = parseInt(a.AM);
        const m2 = parseInt(b.AM);
        const order = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        return order.indexOf(m1) - order.indexOf(m2);
    });

    const chartOptions: ApexOptions = {
        chart: { type: 'bar', stacked: true, toolbar: { show: true } },
        plotOptions: { bar: { horizontal: false, columnWidth: '55%' } },
        xaxis: { categories: monthNames },
        colors: ['#3e60d5', '#f15776'],
        legend: { position: 'top' },
        fill: { opacity: 1 },
        title: { text: `จำนวนผู้รับบริการแยกตามเดือน ปีงบประมาณ ${fiscalYear}`, align: 'center' }
    };

    const chartSeries = [
        { name: 'ผู้ป่วยนอก (ครั้ง)', data: sortedSummary.map(d => d.opd_vn) },
        { name: 'ผู้ป่วยใน (ครั้ง)', data: sortedSummary.map(d => d.ipd_an) }
    ];

    // Pie Chart Options for Insurance
    const getPieOptions = (title: string): ApexOptions => ({
        chart: { type: 'pie' },
        labels: [],
        legend: { position: 'bottom' },
        title: { text: title, align: 'center' },
        responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: 'bottom' } } }]
    });

    return (
        <MainLayout>
            <PageTitle title="สถิติผู้รับบริการ (OPD/IPD)" subTitle="HOSinfo Stats" />

            <Row className="mb-4 align-items-center">
                <Col md={6}>
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
                <Col md={6} className="text-md-end mt-3 mt-md-0">
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
                    <h5 className="mb-1 fw-bold">สถิติผู้รับบริการ (OPD/IPD)</h5>
                    <p className="text-muted mb-4">สรุปสถิติจำนวนผู้รับบริการ แผนกการรักษา และโรคที่พบบ่อย แยกตามปีงบประมาณ</p>

                    <Tab.Container defaultActiveKey="charts">
                        <Nav role="tablist" className="nav-tabs nav-justified nav-bordered nav-bordered-danger mb-3">
                            <Nav.Item>
                                <Nav.Link eventKey="charts" className="py-2">
                                    <IconifyIcon icon="solar:chart-bold-duotone" className="me-2 fs-18 align-middle" />
                                    แผนภูมิสถิติ
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="table" className="py-2">
                                    <IconifyIcon icon="solar:file-text-bold-duotone" className="me-2 fs-18 align-middle" />
                                    ตารางสรุป
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="disease" className="py-2">
                                    <IconifyIcon icon="solar:sort-from-bottom-to-top-line-duotone" className="me-2 fs-18 align-middle" />
                                    50 อันดับโรค
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                        <Tab.Content>
                            <Tab.Pane eventKey="charts">
                                <Row className="g-4">
                                    <Col lg={12}>
                                        <div className="border rounded p-3 bg-white">
                                            {loading ? (
                                                <div className="text-center py-5"><Spinner animation="grow" variant="primary" /></div>
                                            ) : (
                                                <ReactApexChart options={chartOptions} series={chartSeries} type="bar" height={400} />
                                            )}
                                        </div>
                                    </Col>

                                    <Col lg={6}>
                                        <div className="border rounded p-3 bg-white h-100">
                                            <h6 className="mb-4 fw-bold text-center">สัดส่วนสิทธิผู้ป่วยนอก (OPD)</h6>
                                            {loading ? (
                                                <div className="text-center py-5"><Spinner animation="grow" variant="primary" /></div>
                                            ) : (
                                                <ReactApexChart 
                                                    options={{...getPieOptions(''), labels: insclData.opd.map(i => i.inscl_name || 'ไม่ระบุ')}} 
                                                    series={insclData.opd.map(i => i.count)} 
                                                    type="pie" 
                                                    height={350} 
                                                />
                                            )}
                                        </div>
                                    </Col>

                                    <Col lg={6}>
                                        <div className="border rounded p-3 bg-white h-100">
                                            <h6 className="mb-4 fw-bold text-center">สัดส่วนสิทธิผู้ป่วยใน (IPD)</h6>
                                            {loading ? (
                                                <div className="text-center py-5"><Spinner animation="grow" variant="primary" /></div>
                                            ) : (
                                                <ReactApexChart 
                                                    options={{...getPieOptions(''), labels: insclData.ipd.map(i => i.inscl_name || 'ไม่ระบุ')}} 
                                                    series={insclData.ipd.map(i => i.count)} 
                                                    type="pie" 
                                                    height={350} 
                                                />
                                            )}
                                        </div>
                                    </Col>
                                </Row>
                            </Tab.Pane>

                            <Tab.Pane eventKey="table">
                                <h5 className="mb-4 fw-bold">ตารางสรุปจำนวนผู้รับบริการแยกตามแผนก</h5>
                                <div className="table-responsive">
                                    <Table hover className="align-middle table-sm border">
                                        <thead className="bg-light-subtle">
                                            <tr>
                                                <th rowSpan={2} className="text-center align-middle">แผนก</th>
                                                <th colSpan={2} className="text-center bg-primary-subtle">ผู้ป่วยนอก (OPD)</th>
                                                <th colSpan={2} className="text-center bg-success-subtle">ผู้ป่วยใน (IPD)</th>
                                                <th colSpan={2} className="text-center bg-warning-subtle">รวม</th>
                                            </tr>
                                            <tr>
                                                <th className="text-center">คน</th>
                                                <th className="text-center">ครั้ง</th>
                                                <th className="text-center">คน</th>
                                                <th className="text-center">ครั้ง</th>
                                                <th className="text-center">คน</th>
                                                <th className="text-center">ครั้ง</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr><td colSpan={7} className="text-center py-5"><Spinner animation="border" /></td></tr>
                                            ) : specialtyData.map((row, idx) => (
                                                <tr key={idx}>
                                                    <td>{row.spclty}: {row.name}</td>
                                                    <td className="text-center">{row.opd_hn.toLocaleString()}</td>
                                                    <td className="text-center">{row.opd_vn.toLocaleString()}</td>
                                                    <td className="text-center">{row.ipd_hn.toLocaleString()}</td>
                                                    <td className="text-center">{row.ipd_an.toLocaleString()}</td>
                                                    <td className="text-center">{(row.opd_hn + row.ipd_hn).toLocaleString()}</td>
                                                    <td className="text-center">{(row.opd_vn + row.ipd_an).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-light fw-bold border-top-2">
                                            <tr>
                                                <td className="text-center">รวมทั้งหมด</td>
                                                <td className="text-center">{specialtyData.reduce((s, r) => s + r.opd_hn, 0).toLocaleString()}</td>
                                                <td className="text-center">{specialtyData.reduce((s, r) => s + r.opd_vn, 0).toLocaleString()}</td>
                                                <td className="text-center">{specialtyData.reduce((s, r) => s + r.ipd_hn, 0).toLocaleString()}</td>
                                                <td className="text-center">{specialtyData.reduce((s, r) => s + r.ipd_an, 0).toLocaleString()}</td>
                                                <td className="text-center">{specialtyData.reduce((s, r) => s + (r.opd_hn + r.ipd_hn), 0).toLocaleString()}</td>
                                                <td className="text-center">{specialtyData.reduce((s, r) => s + (r.opd_vn + r.ipd_an), 0).toLocaleString()}</td>
                                            </tr>
                                        </tfoot>
                                    </Table>
                                </div>
                            </Tab.Pane>

                            <Tab.Pane eventKey="disease">
                                <h5 className="mb-4 fw-bold">50 อันดับโรคผู้ป่วยนอก (ICD-10)</h5>
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
                                                <th className="text-center bg-info-subtle">รวม (ครั้ง)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr><td colSpan={7} className="text-center py-5"><Spinner animation="border" /></td></tr>
                                            ) : topDiseases.map((row, idx) => (
                                                <tr key={idx}>
                                                    <td className="text-center">{idx + 1}</td>
                                                    <td className="text-center fw-bold text-primary">{row.pdx}</td>
                                                    <td className="small">{row.diag_name}</td>
                                                    <td className="small">{row.diag_tname || '-'}</td>
                                                    <td className="text-center">{row.male.toLocaleString()}</td>
                                                    <td className="text-center">{row.female.toLocaleString()}</td>
                                                    <td className="text-center fw-bold">{row.count.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </Tab.Pane>
                        </Tab.Content>
                    </Tab.Container>
                </CardBody>
            </Card>
        </MainLayout>
    );
};

export default OpdStatsPage;
