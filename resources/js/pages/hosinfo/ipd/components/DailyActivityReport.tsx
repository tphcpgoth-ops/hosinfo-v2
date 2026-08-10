import { useState, useEffect } from 'react';
import { Card, CardBody, Row, Col, Form, Button, Table, Spinner, Badge } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import axios from 'axios';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface DailyReportProps {
    api_token: string;
    external_api_url: string;
    wards?: any[];
}

const DailyActivityReport = ({ api_token, external_api_url, wards = [] }: DailyReportProps) => {
    const today = new Date();
    const defaultYM = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    const [selectedWard, setSelectedWard] = useState<string>('01');
    const [selectedYM, setSelectedYM] = useState<string>(defaultYM);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [reportData, setReportData] = useState<any>(null);

    // Form inputs for print signature
    const [reporterName, setReporterName] = useState<string>('');
    const [reporterPos, setReporterPos] = useState<string>('');
    const [inspectorName, setInspectorName] = useState<string>('');

    const fetchReport = async (ward: string, ym: string) => {
        try {
            setLoading(true);
            const apiUrl = external_api_url || 'http://127.0.0.1:8800';
            const headers = api_token ? { Authorization: `Bearer ${api_token}` } : {};

            const res = await axios.get(`${apiUrl}/api/v1/ipd/daily-activity-report?ward=${ward}&ym=${ym}`, { headers });
            setReportData(res.data);
            setError(null);
        } catch (err: any) {
            console.error('API Error:', err);
            const msg = err.response?.data?.detail || err.message || 'ไม่สามารถเชื่อมต่อกับ API ได้';
            setError(`เกิดข้อผิดพลาดในการโหลดรายงาน: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport(selectedWard, selectedYM);
    }, [selectedWard, selectedYM]);

    const daysCount = reportData?.days_in_month || 31;
    const daysList = Array.from({ length: daysCount }, (_, i) => i + 1);

    // Format Year Month for Display (Thai)
    const formatThaiMonthYear = (ym: string) => {
        if (!ym) return '';
        const [yStr, mStr] = ym.split('-');
        const yInt = parseInt(yStr, 10) + 543;
        const mInt = parseInt(mStr, 10) - 1;
        const thaiMonths = [
            'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
            'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ];
        return { monthName: thaiMonths[mInt] || '', yearBE: yInt };
    };

    const thaiYM = formatThaiMonthYear(selectedYM);

    // Chart 1 Options: Inpatient Specialty Trends
    const activeChartOptions: ApexOptions = {
        chart: { type: 'line', toolbar: { show: true }, zoom: { enabled: false } },
        stroke: { width: 3, curve: 'smooth' },
        xaxis: { categories: daysList.map(d => `วันที่ ${d}`) },
        colors: ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#0dcaf0', '#6f42c1'],
        legend: { position: 'top' },
        title: { text: `แนวโน้มจำนวนผู้ป่วยในครองเตียงประจำวัน (${reportData?.ward?.name || ''})`, align: 'center', style: { fontSize: '15px', fontWeight: 'bold' } }
    };

    const activeChartSeries = reportData?.days ? [
        { name: 'สูตินรีเวช', data: reportData.days.map((d: any) => d.cat_2_1) },
        { name: 'ศัลยกรรม', data: reportData.days.map((d: any) => d.cat_2_3) },
        { name: 'ศัลยกรรมกระดูก', data: reportData.days.map((d: any) => d.cat_2_4) },
        { name: 'อายุรกรรม', data: reportData.days.map((d: any) => d.cat_2_5) },
        { name: 'เด็ก', data: reportData.days.map((d: any) => d.cat_2_6) },
        { name: 'สูติกรรม', data: reportData.days.map((d: any) => d.cat_2_10) }
    ] : [];

    // Chart 2 Options: Discharge & Occupancy Rate
    const dischargeChartOptions: ApexOptions = {
        chart: { type: 'line', toolbar: { show: true } },
        stroke: { width: [0, 3], curve: 'smooth' },
        xaxis: { categories: daysList.map(d => `วันที่ ${d}`) },
        yaxis: [
            { title: { text: 'จำนวนผู้ป่วยจำหน่าย (ราย)' } },
            { opposite: true, title: { text: 'อัตราการครองเตียง (%)' }, min: 0, max: 150 }
        ],
        colors: ['#0d6efd', '#dc3545'],
        legend: { position: 'top' },
        title: { text: `จำนวนผู้ป่วยจำหน่ายและอัตราครองเตียง (%)`, align: 'center', style: { fontSize: '15px', fontWeight: 'bold' } }
    };

    const dischargeChartSeries = reportData?.days ? [
        { name: 'ผู้ป่วยจำหน่าย (ราย)', type: 'column', data: reportData.days.map((d: any) => d.cat_5_total) },
        { name: 'อัตราครองเตียง (%)', type: 'line', data: reportData.days.map((d: any) => d.occupancy_rate) }
    ] : [];

    return (
        <div className="daily-activity-report-container">
            {/* Print CSS Rules */}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .daily-activity-report-print, .daily-activity-report-print * { visibility: visible; }
                    .daily-activity-report-print { position: absolute; left: 0; top: 0; width: 100%; font-size: 10px !important; }
                    .no-print { display: none !important; }
                    .table-bordered th, .table-bordered td { border: 1px solid #000 !important; padding: 2px 4px !important; }
                }
            `}</style>

            {/* Filter Bar (No Print) */}
            <Card className="border-0 shadow-sm mb-4 no-print">
                <CardBody className="p-3">
                    <Row className="g-3 align-items-center">
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label className="fw-bold mb-1 fs-13">ตึกผู้ป่วย (Ward):</Form.Label>
                                <Form.Select 
                                    size="sm" 
                                    value={selectedWard} 
                                    onChange={(e) => setSelectedWard(e.target.value)}
                                    className="fw-semibold shadow-sm"
                                >
                                    {wards && wards.length > 0 ? (
                                        wards.map((w: any) => (
                                            <option key={w.ward} value={w.ward}>{w.name} ({w.ward})</option>
                                        ))
                                    ) : (
                                        <>
                                            <option value="01">ตึก 1 (01)</option>
                                            <option value="02">ตึก 2 (02)</option>
                                            <option value="03">ตึก 3 (03)</option>
                                            <option value="04">ตึกผู้ป่วยหนัก (04)</option>
                                            <option value="05">ตึกสูติกรรม (05)</option>
                                            <option value="07">ตึก 4 (07)</option>
                                        </>
                                    )}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group>
                                <Form.Label className="fw-bold mb-1 fs-13">เลือกเดือน / ปี:</Form.Label>
                                <Form.Control 
                                    type="month" 
                                    size="sm" 
                                    value={selectedYM} 
                                    onChange={(e) => setSelectedYM(e.target.value)}
                                    className="fw-semibold shadow-sm"
                                />
                            </Form.Group>
                        </Col>

                        <Col md={2}>
                            <Form.Group>
                                <Form.Label className="fw-bold mb-1 fs-13">ผู้รายงาน:</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    size="sm" 
                                    placeholder="ชื่อผู้รายงาน" 
                                    value={reporterName} 
                                    onChange={(e) => setReporterName(e.target.value)}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={2}>
                            <Form.Group>
                                <Form.Label className="fw-bold mb-1 fs-13">ตำแหน่ง:</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    size="sm" 
                                    placeholder="ตำแหน่ง" 
                                    value={reporterPos} 
                                    onChange={(e) => setReporterPos(e.target.value)}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={2} className="text-end d-flex gap-2 align-items-end mt-4">
                            <Button 
                                variant="primary" 
                                size="sm" 
                                className="w-100 d-flex align-items-center justify-content-center shadow-sm"
                                onClick={() => fetchReport(selectedWard, selectedYM)}
                            >
                                <IconifyIcon icon="solar:restart-bold-duotone" className="me-1 fs-16" />
                                โหลด
                            </Button>

                            <Button 
                                variant="outline-dark" 
                                size="sm" 
                                className="w-100 d-flex align-items-center justify-content-center shadow-sm"
                                onClick={() => window.print()}
                            >
                                <IconifyIcon icon="solar:printer-bold-duotone" className="me-1 fs-16" />
                                พิมพ์
                            </Button>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {error && (
                <div className="alert alert-danger border-0 shadow-sm d-flex align-items-center mb-4 no-print">
                    <IconifyIcon icon="solar:danger-bold" className="me-2 fs-20" />
                    {error}
                </div>
            )}

            {/* Main Form Matrix Table (Printed Layout) */}
            <div className="daily-activity-report-print bg-white p-3 border rounded shadow-sm mb-4">
                {/* Header matching physical paper form */}
                <div className="text-center mb-3">
                    <h4 className="fw-bold text-dark mb-1">
                        บันทึกกิจกรรมประจำวันผู้ป่วยใน ( {reportData?.ward?.name || `ตึก ${selectedWard}`} )
                        <span className="float-end fs-13 text-muted fw-normal">หน้าที่ 1</span>
                    </h4>
                    <div className="d-flex justify-content-between align-items-center flex-wrap fs-13 mt-2 px-2 border-bottom pb-2">
                        <div>
                            <strong>เดือน:</strong> <span className="text-primary">{thaiYM.monthName}</span> &nbsp;&nbsp;
                            <strong>พ.ศ.:</strong> <span className="text-primary">{thaiYM.yearBE}</span> &nbsp;&nbsp;
                            <strong>จำนวนเตียง:</strong> <span className="text-danger fw-bold">{reportData?.bed_count || 0}</span> เตียง
                        </div>
                        <div>
                            <strong>ผู้รายงาน:</strong> {reporterName || '...........................................'} &nbsp;&nbsp;
                            <strong>ตำแหน่ง:</strong> {reporterPos || '...........................'} &nbsp;&nbsp; / &nbsp;&nbsp;
                            <strong>ตรวจสอบโดย:</strong> {inspectorName || '...........................................'}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>
                ) : reportData?.days ? (
                    <div className="table-responsive">
                        <Table bordered size="sm" className="align-middle fs-12 text-nowrap mb-0 border-dark">
                            <thead className="table-light text-center align-middle">
                                <tr>
                                    <th style={{ width: '45px' }}>ข้อ</th>
                                    <th style={{ minWidth: '180px' }} className="text-start">กิจกรรม</th>
                                    {daysList.map(d => (
                                        <th key={d} style={{ width: '28px', padding: '2px 0' }}>{d}</th>
                                    ))}
                                    <th style={{ width: '50px', backgroundColor: '#e9ecef' }}>รวม</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Section 2: Active Inpatients */}
                                <tr className="table-secondary fw-bold">
                                    <td className="text-center">2</td>
                                    <td colSpan={daysCount + 2} className="text-start">จำนวนผู้ป่วยใน (กราฟ)</td>
                                </tr>
                                <tr>
                                    <td className="text-center">2.1</td>
                                    <td>ผู้ป่วยสูตินรีเวชกรรม</td>
                                    {reportData.days.map((d: any) => (
                                        <td key={d.day} className="text-center">{d.cat_2_1 || 0}</td>
                                    ))}
                                    <td className="text-center fw-bold bg-light">{reportData.totals?.cat_2_1 || 0}</td>
                                </tr>
                                <tr>
                                    <td className="text-center">2.2</td>
                                    <td>ทารกแรกคลอด</td>
                                    {reportData.days.map((d: any) => (
                                        <td key={d.day} className="text-center">{d.cat_2_2 || 0}</td>
                                    ))}
                                    <td className="text-center fw-bold bg-light">{reportData.totals?.cat_2_2 || 0}</td>
                                </tr>
                                <tr>
                                    <td className="text-center">2.3</td>
                                    <td>ผู้ป่วยศัลยกรรม</td>
                                    {reportData.days.map((d: any) => (
                                        <td key={d.day} className="text-center">{d.cat_2_3 || 0}</td>
                                    ))}
                                    <td className="text-center fw-bold bg-light">{reportData.totals?.cat_2_3 || 0}</td>
                                </tr>
                                <tr>
                                    <td className="text-center">2.4</td>
                                    <td>ผู้ป่วยศัลยกรรมกระดูก</td>
                                    {reportData.days.map((d: any) => (
                                        <td key={d.day} className="text-center">{d.cat_2_4 || 0}</td>
                                    ))}
                                    <td className="text-center fw-bold bg-light">{reportData.totals?.cat_2_4 || 0}</td>
                                </tr>
                                <tr>
                                    <td className="text-center">2.5</td>
                                    <td>ผู้ป่วยอายุรกรรม</td>
                                    {reportData.days.map((d: any) => (
                                        <td key={d.day} className="text-center">{d.cat_2_5 || 0}</td>
                                    ))}
                                    <td className="text-center fw-bold bg-light">{reportData.totals?.cat_2_5 || 0}</td>
                                </tr>
                                <tr>
                                    <td className="text-center">2.6</td>
                                    <td>ผู้ป่วยเด็ก</td>
                                    {reportData.days.map((d: any) => (
                                        <td key={d.day} className="text-center">{d.cat_2_6 || 0}</td>
                                    ))}
                                    <td className="text-center fw-bold bg-light">{reportData.totals?.cat_2_6 || 0}</td>
                                </tr>
                                <tr>
                                    <td className="text-center">2.7</td>
                                    <td>ผู้ป่วยจิตเวช</td>
                                    {reportData.days.map((d: any) => (
                                        <td key={d.day} className="text-center">{d.cat_2_7 || 0}</td>
                                    ))}
                                    <td className="text-center fw-bold bg-light">{reportData.totals?.cat_2_7 || 0}</td>
                                </tr>
                                <tr>
                                    <td className="text-center">2.8</td>
                                    <td>ผู้ป่วย จักษุ</td>
                                    {reportData.days.map((d: any) => (
                                        <td key={d.day} className="text-center">{d.cat_2_8 || 0}</td>
                                    ))}
                                    <td className="text-center fw-bold bg-light">{reportData.totals?.cat_2_8 || 0}</td>
                                </tr>
                                <tr>
                                    <td className="text-center">2.9</td>
                                    <td>ผู้ป่วย หู คอ จมูก</td>
                                    {reportData.days.map((d: any) => (
                                        <td key={d.day} className="text-center">{d.cat_2_9 || 0}</td>
                                    ))}
                                    <td className="text-center fw-bold bg-light">{reportData.totals?.cat_2_9 || 0}</td>
                                </tr>
                                <tr>
                                    <td className="text-center">2.10</td>
                                    <td>ผู้ป่วยสูติกรรม</td>
                                    {reportData.days.map((d: any) => (
                                        <td key={d.day} className="text-center">{d.cat_2_10 || 0}</td>
                                    ))}
                                    <td className="text-center fw-bold bg-light">{reportData.totals?.cat_2_10 || 0}</td>
                                </tr>

                                {/* Section 4: Days of Stay */}
                                <tr className="fw-semibold bg-light-subtle">
                                    <td className="text-center fw-bold">4</td>
                                    <td className="fw-bold">วันจำหน่าย (วันนอนรวม)</td>
                                    {reportData.days.map((d: any) => (
                                        <td key={d.day} className="text-center">{d.cat_4_los || 0}</td>
                                    ))}
                                    <td className="text-center fw-bold bg-light text-primary">{reportData.totals?.cat_4_los || 0}</td>
                                </tr>

                                {/* Section 5: Discharges */}
                                <tr className="table-secondary fw-bold">
                                    <td className="text-center">5</td>
                                    <td colSpan={daysCount + 2} className="text-start">จำนวนผู้ป่วยจำหน่าย (รวม {reportData.totals?.cat_5_total || 0} ราย)</td>
                                </tr>
                                <tr>
                                    <td className="text-center">5.1</td>
                                    <td>กลับบ้าน</td>
                                    {reportData.days.map((d: any) => (
                                        <td key={d.day} className="text-center">{d.cat_5_1 || 0}</td>
                                    ))}
                                    <td className="text-center fw-bold bg-light">{reportData.totals?.cat_5_1 || 0}</td>
                                </tr>
                                <tr>
                                    <td className="text-center">5.2</td>
                                    <td>ไม่สมัครใจอยู่</td>
                                    {reportData.days.map((d: any) => (
                                        <td key={d.day} className="text-center">{d.cat_5_2 || 0}</td>
                                    ))}
                                    <td className="text-center fw-bold bg-light">{reportData.totals?.cat_5_2 || 0}</td>
                                </tr>
                                <tr>
                                    <td className="text-center">5.3</td>
                                    <td>Refer (ส่งต่อ)</td>
                                    {reportData.days.map((d: any) => (
                                        <td key={d.day} className="text-center">{d.cat_5_3 || 0}</td>
                                    ))}
                                    <td className="text-center fw-bold bg-light">{reportData.totals?.cat_5_3 || 0}</td>
                                </tr>
                                <tr>
                                    <td className="text-center">5.4</td>
                                    <td>เสียชีวิต</td>
                                    {reportData.days.map((d: any) => (
                                        <td key={d.day} className="text-center">{d.cat_5_4 || 0}</td>
                                    ))}
                                    <td className="text-center fw-bold bg-light text-danger">{reportData.totals?.cat_5_4 || 0}</td>
                                </tr>
                                <tr>
                                    <td className="text-center">5.5</td>
                                    <td>หนีกลับ</td>
                                    {reportData.days.map((d: any) => (
                                        <td key={d.day} className="text-center">{d.cat_5_5 || 0}</td>
                                    ))}
                                    <td className="text-center fw-bold bg-light">{reportData.totals?.cat_5_5 || 0}</td>
                                </tr>

                                {/* Occupancy Rate Row */}
                                <tr className="fw-bold table-warning">
                                    <td className="text-center">%</td>
                                    <td>อัตราครองเตียง (%)</td>
                                    {reportData.days.map((d: any) => (
                                        <td key={d.day} className="text-center font-monospace">{d.occupancy_rate}%</td>
                                    ))}
                                    <td className="text-center fw-bold bg-warning text-dark font-monospace">{reportData.totals?.occupancy_rate}%</td>
                                </tr>
                            </tbody>
                        </Table>
                    </div>
                ) : null}
            </div>

            {/* Interactive Trend Charts (No Print) */}
            {!loading && reportData?.days && (
                <Row className="g-4 no-print">
                    <Col lg={6}>
                        <Card className="border-0 shadow-sm h-100">
                            <CardBody className="p-3">
                                <ReactApexChart options={activeChartOptions} series={activeChartSeries} type="line" height={340} />
                            </CardBody>
                        </Card>
                    </Col>
                    <Col lg={6}>
                        <Card className="border-0 shadow-sm h-100">
                            <CardBody className="p-3">
                                <ReactApexChart options={dischargeChartOptions} series={dischargeChartSeries} type="line" height={340} />
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            )}
        </div>
    );
};

export default DailyActivityReport;
