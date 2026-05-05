import MainLayout from '@/layouts/MainLayout';
import { Col, Row } from 'react-bootstrap';
import { Head } from '@inertiajs/react';
import TopStatsRow from './components/TopStatsRow';
import MiddleStatsGrid from './components/MiddleStatsGrid';
import IpdStatsSection from './components/IpdStatsSection';

interface Dashboard2Props {
    stats: any;
    wards: any[];
}

const Dashboard2Page = ({ stats, wards }: Dashboard2Props) => {
    return (
        <MainLayout>
            <Head title="HOS-info Dashboard" />

            <Row className="mt-3 mb-3">
                <Col xs={12}>
                    <div className="page-title-box d-flex align-items-center">
                        <h4 className="page-title mb-0 me-2 text-dark fw-bold fs-24">HOS-info Dashboard</h4>
                        <span className="text-muted fs-14 mt-1">สถิติผู้รับบริการ Hospital Information</span>
                    </div>
                </Col>
            </Row>

            <TopStatsRow stats={stats} />
            <MiddleStatsGrid stats={stats} />
            
            <Row className="mt-4 mb-2">
                <Col>
                    <h4 className="text-dark fw-bold border-start border-4 border-danger ps-2">สถิติผู้ป่วยในและตึกผู้ป่วย</h4>
                </Col>
            </Row>
            
            <IpdStatsSection stats={stats} wards={wards} />

            <Row className="mt-2 mb-2">
                <Col md={6}>
                    
                </Col>
            </Row>
                
        </MainLayout>
    );
};

export default Dashboard2Page;
