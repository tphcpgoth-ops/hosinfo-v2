import small1Img from '@/images/small/small-22.jpg';
import small4Img from '@/images/small/small-21.jpg';
import MainLayout from '@/layouts/MainLayout';
import { Head, usePage } from '@inertiajs/react';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { Col, Row, Card, CardBody, CardTitle } from 'react-bootstrap';

const HorizontalCard = () => {
    return (
        <>
            <Col lg={6}>
                <Card>
                    <Row className="g-0 align-items-center">
                        <Col md={4}>
                            <img src={small4Img} className="img-fluid rounded-start" alt="..." />
                        </Col>
                        <Col md={8}>
                            <CardBody>
                                <CardTitle as={'h5'}>ข้อมูลและสถิติ</CardTitle>
                                <p className="card-text">
                                    แสดงข้อมูลและสถิติต่างๆ ของโรงพยาบาล
                                </p>
                                <p className="card-text">
                                    <small className="text-muted">Realtime Data</small>
                                </p>
                            </CardBody>
                        </Col>
                    </Row>
                </Card>
            </Col>
            <Col lg={6}>
                <Card>
                    <Row className="g-0 align-items-center">
                        <Col md={8}>
                            <CardBody>
                                <CardTitle as={'h5'}>ระบบบริหารจัดการตัวชี้วัด KPI</CardTitle>
                                <p className="card-text">
                                    บริหารจัดการ ติดตาม ประเมินผลตัวชี้วัด KPI ของโรงพยาบาล
                                </p>
                                <p className="card-text">
                                    <small className="text-muted">Cockpit Data</small>
                                </p>
                            </CardBody>
                        </Col>
                        <Col md={4}>
                            <img src={small1Img} className="img-fluid rounded-end" alt="..." />
                        </Col>
                    </Row>
                </Card>
            </Col>
        </>
    );
};

const HosinfoDashboardPage = () => {
    const { hospital } = usePage().props as any;

    return (
        <MainLayout>
            <Head title={'หน้าหลัก'} />

            <Row className="mt-3 mb-3">
                <Col xs={12}>
                    <div className="page-title-box d-flex align-items-center">
                        <h4 className="page-title mb-0 me-2 text-dark fw-bold fs-24">{hospital?.name || 'โรงพยาบาล'}</h4>
                        <p className="text-dark fw-medium fs-15 d-flex align-items-center gap-1 mb-2">
                            <IconifyIcon icon="tabler:building-hospital" className="text-muted" />
                            <span className="badge bg-light-subtle rounded-pill text-dark border fs-12 py-1 px-2">{hospital?.code || 'รหัสโรงพยาบาล'}</span>
                        </p>
                    </div>
                </Col>
            </Row>

            <Row>
                <HorizontalCard />
            </Row>

        </MainLayout>
    );
};

export default HosinfoDashboardPage;
