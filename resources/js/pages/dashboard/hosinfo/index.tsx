import MainLayout from '@/layouts/MainLayout';
import { Col, Row } from 'react-bootstrap';
import { Head } from '@inertiajs/react';
import TopStatsRow from './components/TopStatsRow';
import MiddleStatsGrid from './components/MiddleStatsGrid';
import DiseaseSection from './components/DiseaseSection';
import DiseaseTrendsRow from './components/DiseaseTrendsRow';
import BedOccupancySection from './components/BedOccupancySection';
import BottomSection from './components/BottomSection';

const HosinfoDashboardPage = () => {
    return (
        <MainLayout>
            <Head title="MIS 4.0 Dashboard" />
            
            <Row className="mb-3">
                <Col xs={12}>
                    <div className="page-title-box d-flex align-items-center">
                        <h4 className="page-title mb-0 me-2 text-dark fw-bold fs-24">MIS 4.0 Dashboard</h4>
                        <span className="text-muted fs-14 mt-1">โรงพยาบาลสมเด็จพระยุพราชตะพานหิน</span>
                    </div>
                </Col>
            </Row>

            <TopStatsRow />
            <MiddleStatsGrid />
            <DiseaseSection />
            <DiseaseTrendsRow />
            <BedOccupancySection />
            <BottomSection />

        </MainLayout>
    );
};

export default HosinfoDashboardPage;
