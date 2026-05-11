import small1Img from '@/images/small/small-1.jpg';
import small2Img from '@/images/small/small-2.jpg';
import small3Img from '@/images/small/small-3.jpg';
import MainLayout from '@/layouts/MainLayout';
import { Head, usePage } from '@inertiajs/react';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { Carousel, CarouselItem, Col, Row, Button, Card, CardBody, CardFooter, CardHeader, CardTitle } from 'react-bootstrap';

const InfoCard = () => {
    return (
        <Card>
            <CardBody>
                <Row className="align-items-start justify-content-between">
                    <Col lg={5}>
                        <p className="text-dark fw-medium fs-15 d-flex align-items-center gap-1 mb-2">
                            <IconifyIcon icon="solar:box-bold-duotone" className="text-danger" />
                            Order
                            <IconifyIcon icon="tabler:arrow-right" />
                            <span className="badge bg-light-subtle rounded-pill text-dark border fs-12 py-1 px-2">#OC3142-EN</span>
                        </p>
                        <h3 className="mb-1 text-dark fw-semibold">
                            Order ID : #OC3142-EN{' '}
                            <span className="badge bg-warning-subtle rounded-pill text-warning border border-warning fs-11 py-1 px-2 my-2">
                                Shipping
                            </span>{' '}
                            <span className="badge bg-success-subtle rounded-pill text-success border border-success fs-11 py-1 px-2  my-2">
                                {' '}
                                No Action Needed
                            </span>
                        </h3>
                        <div className="d-flex flex-wrap align-items-center gap-2">
                            <p className="mb-0 fs-15">Order Date : 2 July 2024</p>
                            <div>|</div>
                            <div>
                                <p className="mb-0 fs-15 text-success fw-medium  d-flex align-items-center gap-1">
                                    <IconifyIcon icon="tabler:plane-tilt" />
                                    Estimated delivery: July 9, 2024
                                </p>
                            </div>
                        </div>
                    </Col>
                    <Col lg={4} className="text-end">
                        <div className="d-flex gap-2 flex-wrap justify-content-end my-2">
                            <Button variant="soft-primary">Invoice</Button>
                            <Button variant="primary">Edit Details</Button>
                        </div>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

const PromoteCard = () => {
    return (
        <Card className="overflow-hidden">
            <CardBody className="p-0">
                <Carousel indicators={true} id="promoteCarousel" className="slide carousel-fade" data-bs-ride="carousel">
                    <CarouselItem className="active">
                        <img className="d-block w-100" src={small1Img} alt="First slide" />
                    </CarouselItem>
                    <CarouselItem>
                        <img className="d-block w-100" src={small2Img} alt="Second slide" />
                    </CarouselItem>
                    <CarouselItem>
                        <img className="d-block w-100" src={small3Img} alt="Third slide" />
                    </CarouselItem>
                </Carousel>
            </CardBody>
        </Card>
    );
};

const NewsCard = () => {
    return (
        <Card className="border-primary border border-dashed">
            <CardBody>
                <CardTitle as={'h5'} className="text-primary">
                    Special title treatment
                </CardTitle>
                <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>
                <Button variant="primary" size="sm">
                    Button
                </Button>
            </CardBody>
        </Card>
    );
};

const HosinfoDashboardPage = () => {
    const { hospital } = usePage().props as any;

    return (
        <MainLayout>
            <Head title={hospital?.name || 'Dashboard'} />

            <Row className="mt-3 mb-3">
                <Col xs={12}>
                    <div className="page-title-box d-flex align-items-center">
                        <h4 className="page-title mb-0 me-2 text-dark fw-bold fs-24">{hospital?.name || 'โรงพยาบาล'}</h4>
                    </div>
                </Col>
            </Row>

            <Row>
                <Col lg={12}>
                    <InfoCard />
                </Col>
            </Row>
            
            <Row className="d-flex align-items-stretch g-3">
                <Col lg={6}>
                    <PromoteCard />
                </Col>
                <Col lg={6}>
                    <NewsCard />
                </Col>
            </Row>


        </MainLayout>
    );
};

export default HosinfoDashboardPage;
