import { useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import PageTitle from '@/components/PageTitle';
import { Row, Col } from 'react-bootstrap';
import AppointmentCalendar from './components/AppointmentCalendar';
import DepartmentBreakdownModal from './components/DepartmentBreakdownModal';

interface AppointmentPageProps {
    api_token?: string;
    external_api_url?: string;
}

const AppointmentsPage = ({ api_token, external_api_url }: AppointmentPageProps) => {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);

    const handleSelectDate = (dateStr: string) => {
        setSelectedDate(dateStr);
        setShowModal(true);
    };

    const apiUrl = external_api_url || 'http://127.0.0.1:8800';

    return (
        <MainLayout>
            <PageTitle title="ปฏิทินคนไข้นัด" subTitle="ข้อมูลและสถิติ" />

            <div className="mt-3">
                <Row>
                    <Col xs={12}>
                        <AppointmentCalendar
                            externalApiUrl={apiUrl}
                            onSelectDate={handleSelectDate}
                        />
                    </Col>
                </Row>
            </div>

            <DepartmentBreakdownModal
                show={showModal}
                onHide={() => setShowModal(false)}
                selectedDate={selectedDate}
                externalApiUrl={apiUrl}
            />
        </MainLayout>
    );
};

export default AppointmentsPage;
