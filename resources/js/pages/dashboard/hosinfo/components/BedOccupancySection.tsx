import { Card, CardBody, Col, Row, Badge } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const WardCard = ({ title, admit, total, empty, percent, bgClass }: { title: string, admit: number, total: number | null, empty: number, percent: string, bgClass: string }) => {
    const isFull = total && admit >= total;
    return (
        <Card className={`border-0 mb-3 overflow-hidden ${bgClass} text-white`} style={{ borderRadius: '0' }}>
            <div className="d-flex p-3 align-items-center">
                <div className="me-3">
                    <IconifyIcon icon="tabler:bed" className="fs-36" />
                </div>
                <div className="flex-grow-1">
                    <div className="fs-12 text-uppercase mb-1">{title}</div>
                    <div className="fw-bold fs-16 mb-1">
                        Admit {admit} / {total ? `${total} เตียง` : 'เตียง'} {isFull ? '(เต็ม)' : `(ว่าง ${empty})`}
                    </div>
                    <div className="w-100 bg-black bg-opacity-25 mt-2 mb-1" style={{ height: '3px' }}>
                        <div className="bg-white h-100" style={{ width: percent !== 'inf%' ? percent : '100%' }}></div>
                    </div>
                    <div className="fs-12">ครองเตียง {percent}</div>
                </div>
            </div>
        </Card>
    );
};

const BedOccupancySection = () => {
    return (
        <Row className="mb-4">
            <Col lg={4}>
                <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '0' }}>
                    <div className="bg-danger text-white p-3 d-flex align-items-center">
                        <div className="bg-white bg-opacity-25 rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                            <IconifyIcon icon="tabler:bed" className="fs-32" />
                        </div>
                        <div>
                            <h4 className="text-white fw-bold mb-1">สถิติผู้ป่วยในวันนี้</h4>
                            <div className="fs-13">จำนวนเตียงทั้งหมด 119 เตียง</div>
                        </div>
                    </div>
                    <CardBody className="p-0">
                        <Row className="g-0">
                            <Col xs={6} className="p-3 border-end border-bottom border-light">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="fs-13 text-dark">รับใหม่วันนี้</span>
                                    <Badge bg="danger" className="rounded-pill px-2">1 เตียง</Badge>
                                </div>
                            </Col>
                            <Col xs={6} className="p-3 border-bottom border-light">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="fs-13 text-dark">ชำระเงิน/เบิกได้</span>
                                    <Badge bg="secondary" className="rounded-pill px-2">11 เตียง</Badge>
                                </div>
                            </Col>
                            <Col xs={6} className="p-3 border-end border-bottom border-light">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="fs-13 text-dark">จำหน่ายวันนี้</span>
                                    <Badge bg="warning" className="rounded-pill px-2">0 เตียง</Badge>
                                </div>
                            </Col>
                            <Col xs={6} className="p-3 border-bottom border-light">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="fs-13 text-dark">สิทธิ์ UC</span>
                                    <Badge bg="secondary" className="rounded-pill px-2">66 เตียง</Badge>
                                </div>
                            </Col>
                            <Col xs={6} className="p-3 border-end border-bottom border-light">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="fs-13 text-dark">Admit อยู่</span>
                                    <Badge bg="primary" className="rounded-pill px-2">77 เตียง</Badge>
                                </div>
                            </Col>
                            <Col xs={6} className="p-3 border-bottom border-light">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="fs-13 text-dark">สิทธิ์อื่นๆ</span>
                                    <Badge bg="secondary" className="rounded-pill px-2">0 เตียง</Badge>
                                </div>
                            </Col>
                            <Col xs={6} className="p-3 border-end border-light">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="fs-13 text-dark">เตียงว่าง</span>
                                    <Badge bg="success" className="rounded-pill px-2">42 เตียง</Badge>
                                </div>
                            </Col>
                            <Col xs={6} className="p-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="fs-13 text-dark">อัตราการครองเตียง</span>
                                    <Badge bg="danger" className="rounded-pill px-2">77.32 %</Badge>
                                </div>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </Col>
            <Col lg={8}>
                <Row className="g-3">
                    <Col md={6}>
                        <WardCard title="ตึก1" admit={20} total={40} empty={20} percent="50.00%" bgClass="bg-info" />
                        <WardCard title="ตึก3" admit={16} total={16} empty={0} percent="100.00%" bgClass="bg-danger" />
                        <WardCard title="ตึกสูติกรรม" admit={1} total={10} empty={9} percent="10.00%" bgClass="bg-success" />
                        <WardCard title="HOME WARD" admit={4} total={null} empty={0} percent="inf%" bgClass="bg-danger" />
                    </Col>
                    <Col md={6}>
                        <WardCard title="ตึก2" admit={30} total={40} empty={10} percent="75.00%" bgClass="bg-warning" />
                        <WardCard title="ตึกผู้ป่วยหนัก" admit={5} total={5} empty={0} percent="100.00%" bgClass="bg-danger" />
                        <WardCard title="ตึก4" admit={1} total={8} empty={7} percent="12.50%" bgClass="bg-success" />
                    </Col>
                </Row>
            </Col>
        </Row>
    );
};

export default BedOccupancySection;
