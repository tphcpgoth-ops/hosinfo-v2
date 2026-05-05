import MainLayout from '@/layouts/MainLayout';
import { Col, Row } from 'react-bootstrap';
import AppointmentCard from './components/AppointmentCard';
import ClinicPageTitle from './components/ClinicPageTitle';
import Stat from './components/Stat';

const ClinicPage = ({ kpis = [] }: { kpis: any[] }) => {
    return (
        <MainLayout>
            <ClinicPageTitle />
            <Stat />
            <Row>
                <Col xs={12}>
                    <AppointmentCard kpis={kpis} />
                </Col>
            </Row>
        </MainLayout>
    );
};

export default ClinicPage;
