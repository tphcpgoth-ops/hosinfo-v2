import { useEffect, useState } from 'react';
import PageTitle from '@/components/PageTitle';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardBody, Col, Row, Spinner, Table, Tab, Nav } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import axios from 'axios';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const IpdStatsPage = ({ api_token }: { api_token: string }) => {
    const currentBE = new Date().getFullYear() + (new Date().getMonth() > 8 ? 1 : 0) + 543;
    const [fiscalYear, setFiscalYear] = useState(currentBE);
    const [loading, setLoading] = useState(true);
    const [summaryData, setSummaryData] = useState<any[]>([]);
    const [occupancyData, setOccupancyData] = useState<any[]>([]);
    const [genderData, setGenderData] = useState<any[]>([]);
    const [topDiseases, setTopDiseases] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async (year: number) => {
        try {
            setLoading(true);
            const apiUrl = import.meta.env.VITE_EXTERNAL_API_URL || 'http://127.0.0.1:8800';
            const headers = { Authorization: `Bearer ${api_token}` };

            const [summaryRes, occupancyRes, genderRes, icd10Res] = await Promise.all([
                axios.get(`${apiUrl}/api/v1/ipd/stats-summary?fiscal_year=${year}`, { headers }),
                axios.get(`${apiUrl}/api/v1/ipd/stats-occupancy?fiscal_year=${year}`, { headers }),
                axios.get(`${apiUrl}/api/v1/ipd/stats-gender?fiscal_year=${year}`, { headers }),
                axios.get(`${apiUrl}/api/v1/ipd/stats-icd10?fiscal_year=${year}`, { headers })
            ]);

            setSummaryData(summaryRes.data.data);
            setOccupancyData(occupancyRes.data.data);
            setGenderData(genderRes.data.data);
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

    const monthNames = ['ต.ค.', 'พ.ย.', 'ธ.ค.', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.'];
    
    const sortDataByFiscalMonth = (data: any[]) => {
        const order = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        return [...data].sort((a, b) => {
            const m1 = parseInt(a.AM);
            const m2 = parseInt(b.AM);
            return order.indexOf(m1) - order.indexOf(m2);
        });
    };

    const sortedSummary = sortDataByFiscalMonth(summaryData);
    const sortedOccupancy = sortDataByFiscalMonth(occupancyData);

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
            { title: { text: 'อัตราครองเตียง (%)' }, labels: { formatter: (val) => `${val.toFixed(1)}%` } }
        ],
        colors: ['#3e60d5', '#f15776'],
        title: { text: `อัตราการครองเตียง ปีงบประมาณ ${fiscalYear}`, align: 'center' }
    };

    return (
        <MainLayout>
            <PageTitle title="สถิติผู้ป่วยใน (IPD)" subTitle="HOSinfo Stats" />

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
                    <h5 className="mb-1 fw-bold">สถิติผู้ป่วยใน (IPD)</h5>
                    <p className="text-muted mb-4">สรุปสถิติจำนวนผู้ป่วยใน อัตราครองเตียง และโรคที่พบบ่อย แยกตามปีงบประมาณ</p>

                    <Tab.Container defaultActiveKey="charts">
                        <Nav role="tablist" className="nav-tabs nav-justified nav-bordered nav-bordered-danger mb-3">
                            <Nav.Item>
                                <Nav.Link eventKey="charts" className="py-2">
                                    <IconifyIcon icon="solar:chart-bold-duotone" className="me-2 fs-18 align-middle" />
                                    แผนภูมิสถิติ
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="gender" className="py-2">
                                    <IconifyIcon icon="solar:users-group-two-rounded-bold-duotone" className="me-2 fs-18 align-middle" />
                                    สัดส่วนเพศ
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="disease" className="py-2">
                                    <IconifyIcon icon="solar:sort-from-bottom-to-top-line-duotone" className="me-2 fs-18 align-middle" />
                                    20 อันดับโรค
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>

                        <Tab.Content>
                            <Tab.Pane eventKey="charts">
                                <Row className="g-4">
                                    <Col lg={6}>
                                        <div className="border rounded p-3 bg-white h-100">
                                            {loading ? (
                                                <div className="text-center py-5"><Spinner animation="grow" variant="primary" /></div>
                                            ) : (
                                                <ReactApexChart 
                                                    options={visitChartOptions} 
                                                    series={[{ name: 'ผู้ป่วยใน (ราย)', data: sortedSummary.map(d => d.count) }]} 
                                                    type="bar" 
                                                    height={350} 
                                                />
                                            )}
                                        </div>
                                    </Col>
                                    <Col lg={6}>
                                        <div className="border rounded p-3 bg-white h-100">
                                            {loading ? (
                                                <div className="text-center py-5"><Spinner animation="grow" variant="primary" /></div>
                                            ) : (
                                                <ReactApexChart 
                                                    options={occupancyChartOptions} 
                                                    series={[
                                                        { name: 'อัตราครองเตียง', type: 'column', data: sortedOccupancy.map(d => d.admsum) },
                                                        { name: 'แนวโน้ม', type: 'line', data: sortedOccupancy.map(d => d.admsum) }
                                                    ]} 
                                                    type="line" 
                                                    height={350} 
                                                />
                                            )}
                                        </div>
                                    </Col>
                                </Row>
                            </Tab.Pane>

                            <Tab.Pane eventKey="gender">
                                <Row className="justify-content-center">
                                    <Col lg={6}>
                                        <div className="border rounded p-4 bg-white text-center">
                                            <h6 className="mb-4 fw-bold">สัดส่วนชาย-หญิง ที่นอนโรงพยาบาล</h6>
                                            {loading ? (
                                                <div className="text-center py-5"><Spinner animation="grow" variant="primary" /></div>
                                            ) : (
                                                <ReactApexChart 
                                                    options={{
                                                        chart: { type: 'pie' },
                                                        labels: genderData.map(d => d.name || 'ไม่ระบุ'),
                                                        legend: { position: 'bottom' },
                                                        colors: ['#3e60d5', '#f15776']
                                                    }} 
                                                    series={genderData.map(d => d.count)} 
                                                    type="pie" 
                                                    height={350} 
                                                />
                                            )}
                                        </div>
                                    </Col>
                                </Row>
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
                        </Tab.Content>
                    </Tab.Container>
                </CardBody>
            </Card>
        </MainLayout>
    );
};

export default IpdStatsPage;
