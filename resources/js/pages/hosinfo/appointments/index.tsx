import { useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import PageTitle from '@/components/PageTitle';
import { Row, Col } from 'react-bootstrap';
import AppointmentCalendar from './components/AppointmentCalendar';
import DepartmentBreakdownModal from './components/DepartmentBreakdownModal';
import Stat from './components/Stat';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

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
            <PageTitle 
                title="ปฏิทินคนไข้นัด" 
                subTitle="ข้อมูลและสถิติ" 
                rightContent={
                    <div className="d-flex align-items-center text-muted fw-medium fs-14 bg-white px-3 py-1 rounded-pill shadow-sm border">
                        <IconifyIcon icon="solar:calendar-bold-duotone" className="me-2 text-primary fs-16" />
                        <span>
                            {new Date().toLocaleDateString('th-TH', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                weekday: 'long'
                            })}
                        </span>
                    </div>
                }
            />

            <div className="mt-0">
                <Stat externalApiUrl={apiUrl} />
                <Row className="mt-0">
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
