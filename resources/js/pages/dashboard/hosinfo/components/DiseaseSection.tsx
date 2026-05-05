import { Card, CardBody, CardHeader, Col, Row, Table, Badge } from 'react-bootstrap';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const DiseaseSection = () => {
    const chartOptions: ApexOptions = {
        chart: {
            type: 'line',
            toolbar: { show: false },
        },
        stroke: {
            curve: 'smooth',
            width: 2,
        },
        colors: ['#f9b934', '#3e8ef7', '#11c26d', '#ff5b5b'],
        xaxis: {
            categories: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'],
        },
        legend: {
            position: 'bottom',
        },
    };

    const chartSeries = [
        { name: 'ปี 2564', data: [10, 20, 15, 30, 25, 40, 35, 50, 45, 20, 15, 10] },
        { name: 'ปี 2565', data: [15, 25, 20, 35, 30, 45, 40, 55, 50, 25, 20, 15] },
        { name: 'ปี 2566', data: [5, 15, 10, 25, 20, 35, 30, 45, 40, 15, 10, 5] },
        { name: 'ปี 2567', data: [0, 5, 2, 8, 5, 12, 10, 15, 12, 5, 2, 0] },
    ];

    return (
        <Card className="border-0 shadow-sm mb-4">
            <CardHeader className="bg-white border-bottom-0 pt-3 pb-0">
                <h5 className="mb-0 fw-bold d-flex align-items-center">
                    <span className="me-2 text-dark fs-20">⚕</span> โรคติดต่อที่สำคัญ
                </h5>
                <hr className="mb-0 mt-2 border-danger border-2 opacity-50" />
            </CardHeader>
            <CardBody>
                <Row>
                    <Col lg={8} className="border-end border-light">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="fw-bold mb-0">สถานการณ์โรคที่ต้องเฝ้าระวัง</h6>
                            <div>
                                <span className="me-3 text-muted" style={{ cursor: 'pointer' }}>โรคอื่นๆ</span>
                                <span className="me-3 text-muted" style={{ cursor: 'pointer' }}>อุจจาระร่วง</span>
                                <span className="fw-bold text-dark" style={{ cursor: 'pointer' }}>ไข้เลือดออก</span>
                            </div>
                        </div>
                        <div className="text-center text-muted fs-12 mb-2">จำนวนผู้ป่วยไข้เลือดออกของประชากร อ.ตะพานหิน จ.พิจิตร</div>
                        <ReactApexChart options={chartOptions} series={chartSeries} type="line" height={300} />
                    </Col>
                    <Col lg={4}>
                        <h6 className="fw-bold text-center mb-3">อันดับโรคติดต่อที่ต้องรายงานเดือนนี้</h6>
                        <Table borderless size="sm" className="fs-13">
                            <thead>
                                <tr className="border-bottom">
                                    <th>รหัส506</th>
                                    <th>ชื่อโรค</th>
                                    <th className="text-end">จำนวน(ราย)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="text-center">2</td>
                                    <td>โรคอุจจาระร่วงเฉียบพลัน [02] Acute diarrhea, Diarrhea,Infantile diarrhea, Gastroenteritis,Enteritis,Summer diarrhea</td>
                                    <td className="text-end"><Badge bg="danger" className="rounded-1">62</Badge></td>
                                </tr>
                                <tr>
                                    <td className="text-center">3</td>
                                    <td>อาหารเป็นพิษ [03] Food Poisoning,Foodborne disease,Foodborne intoxication,Acute foodborne</td>
                                    <td className="text-end"><Badge bg="danger" className="rounded-1">6</Badge></td>
                                </tr>
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default DiseaseSection;
