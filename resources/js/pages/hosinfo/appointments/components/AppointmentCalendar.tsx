import { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { type DateClickArg } from '@fullcalendar/interaction';
import bootstrapPlugin from '@fullcalendar/bootstrap';
import listPlugin from '@fullcalendar/list';
import type { EventClickArg, DatesSetArg } from '@fullcalendar/core/index.js';
import { Card, CardBody, Row, Col, Spinner, Badge } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import axios from 'axios';

interface CalendarDayItem {
    date: string;
    total_appointments: number;
    total_patients: number;
}

interface AppointmentCalendarProps {
    externalApiUrl: string;
    onSelectDate: (dateStr: string) => void;
}

const AppointmentCalendar = ({ externalApiUrl, onSelectDate }: AppointmentCalendarProps) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [calendarData, setCalendarData] = useState<CalendarDayItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchCalendarData = async (start: string, end: string) => {
        setLoading(true);
        setError(null);
        try {
            const apiUrl = externalApiUrl || 'http://127.0.0.1:8800';
            const res = await axios.get(`${apiUrl}/api/v1/appointments/calendar?start_date=${start}&end_date=${end}`);
            setCalendarData(res.data?.data || []);
        } catch (err: any) {
            console.error('Failed to fetch appointment calendar:', err);
            setError('ไม่สามารถดึงข้อมูลปฏิทินนัดหมายได้');
        } finally {
            setLoading(false);
        }
    };

    const handleDatesSet = (arg: DatesSetArg) => {
        const startStr = arg.startStr.slice(0, 10);
        const endStr = arg.endStr.slice(0, 10);
        fetchCalendarData(startStr, endStr);
    };

    const handleDateClick = (arg: DateClickArg) => {
        onSelectDate(arg.dateStr);
    };

    const handleEventClick = (arg: EventClickArg) => {
        const dateStr = arg.event.startStr.slice(0, 10);
        onSelectDate(dateStr);
    };

    // Calculate quick stats for displayed data
    const totalApp = calendarData.reduce((acc, curr) => acc + curr.total_appointments, 0);
    const totalPat = calendarData.reduce((acc, curr) => acc + curr.total_patients, 0);
    const activeDays = calendarData.filter((d) => d.total_appointments > 0).length;
    const maxDay = calendarData.reduce((max, curr) => curr.total_appointments > max ? curr.total_appointments : max, 0);

    const events = calendarData.map((item) => ({
        id: item.date,
        title: `นัด ${item.total_appointments.toLocaleString()} ราย`,
        start: item.date,
        allDay: true,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        extendedProps: {
            total_appointments: item.total_appointments,
            total_patients: item.total_patients,
        },
    }));

    const renderEventContent = (eventInfo: any) => {
        const { total_appointments, total_patients } = eventInfo.event.extendedProps;
        return (
            <div
                className="w-100 p-1 my-1 rounded bg-white border border-light-subtle text-dark d-flex align-items-center justify-content-between px-2 shadow-sm"
                style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
                title={`คลิกเพื่อดูรายละเอียด: นัด ${total_appointments.toLocaleString()} ราย (${total_patients.toLocaleString()} คน)`}
            >
                <div className="d-flex align-items-center gap-1 text-truncate">
                    <IconifyIcon icon="tabler:calendar-check" className="fs-14 text-success flex-shrink-0" />
                    <span className="fw-bold fs-12 text-truncate">นัด {total_appointments.toLocaleString()}</span>
                </div>
                <span className="badge bg-light text-dark border rounded-pill fs-10 ms-1 flex-shrink-0">
                    {total_patients.toLocaleString()} คน
                </span>
            </div>
        );
    };

    return (
        <div>
            {/* Summary KPI Cards for Current Month View */}
            <Row className="g-3 mb-4">
                <Col sm={6} lg={3}>
                    <Card className="border-0 shadow-sm h-100">
                        <CardBody className="p-3 d-flex align-items-center justify-content-between">
                            <div>
                                <span className="text-muted fs-12 fw-semibold">รวมนัดหมายช่วงที่แสดง</span>
                                <h3 className="mb-0 fw-bold text-primary mt-1">
                                    {totalApp.toLocaleString()} <span className="fs-14 fw-normal text-muted">รายการ</span>
                                </h3>
                            </div>
                            <div className="avatar-md bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center">
                                <IconifyIcon icon="tabler:calendar-stats" className="fs-24" />
                            </div>
                        </CardBody>
                    </Card>
                </Col>
                <Col sm={6} lg={3}>
                    <Card className="border-0 shadow-sm h-100">
                        <CardBody className="p-3 d-flex align-items-center justify-content-between">
                            <div>
                                <span className="text-muted fs-12 fw-semibold">จำนวนคนไข้นัด (HN ไม่ซ้ำ)</span>
                                <h3 className="mb-0 fw-bold text-success mt-1">
                                    {totalPat.toLocaleString()} <span className="fs-14 fw-normal text-muted">คน</span>
                                </h3>
                            </div>
                            <div className="avatar-md bg-success-subtle text-success rounded-circle d-flex align-items-center justify-content-center">
                                <IconifyIcon icon="tabler:users" className="fs-24" />
                            </div>
                        </CardBody>
                    </Card>
                </Col>
                <Col sm={6} lg={3}>
                    <Card className="border-0 shadow-sm h-100">
                        <CardBody className="p-3 d-flex align-items-center justify-content-between">
                            <div>
                                <span className="text-muted fs-12 fw-semibold">จำนวนวันที่มีนัดหมาย</span>
                                <h3 className="mb-0 fw-bold text-info mt-1">
                                    {activeDays} <span className="fs-14 fw-normal text-muted">วัน</span>
                                </h3>
                            </div>
                            <div className="avatar-md bg-info-subtle text-info rounded-circle d-flex align-items-center justify-content-center">
                                <IconifyIcon icon="tabler:calendar" className="fs-24" />
                            </div>
                        </CardBody>
                    </Card>
                </Col>
                <Col sm={6} lg={3}>
                    <Card className="border-0 shadow-sm h-100">
                        <CardBody className="p-3 d-flex align-items-center justify-content-between">
                            <div>
                                <span className="text-muted fs-12 fw-semibold">นัดสูงสุดใน 1 วัน</span>
                                <h3 className="mb-0 fw-bold text-warning mt-1">
                                    {maxDay.toLocaleString()} <span className="fs-14 fw-normal text-muted">รายการ</span>
                                </h3>
                            </div>
                            <div className="avatar-md bg-warning-subtle text-warning rounded-circle d-flex align-items-center justify-content-center">
                                <IconifyIcon icon="tabler:trending-up" className="fs-24" />
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {error && (
                <div className="alert alert-danger d-flex align-items-center mb-3">
                    <IconifyIcon icon="solar:danger-triangle-bold" className="fs-20 me-2" />
                    <span>{error}</span>
                </div>
            )}

            {/* Calendar Card */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <Card.Header className="bg-light d-flex justify-content-between align-items-center py-3">
                    <div className="d-flex align-items-center gap-2">
                        <IconifyIcon icon="tabler:calendar-month" className="fs-20 text-primary" />
                        <h5 className="card-title mb-0 fw-bold text-primary">ปฏิทินนัดหมายผู้ป่วยประจำวัน</h5>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        {loading && (
                            <div className="d-flex align-items-center gap-2 text-muted fs-13">
                                <Spinner animation="border" size="sm" variant="primary" />
                                <span>กำลังโหลด...</span>
                            </div>
                        )}
                        <Badge bg="primary-subtle" className="text-primary px-3 py-2 rounded-pill fs-12">
                            <IconifyIcon icon="tabler:click" className="me-1" />
                            คลิกที่วันเพื่อดูนัดหมายแยกแผนก
                        </Badge>
                    </div>
                </Card.Header>
                <CardBody className="p-4">
                    <div className="calendar-container">
                        <style>{`
                            .calendar-container .fc-event,
                            .calendar-container .fc-daygrid-event,
                            .calendar-container .fc-h-event {
                                background-color: transparent !important;
                                border: none !important;
                                box-shadow: none !important;
                            }
                            .calendar-container .fc-day-today {
                                background-color: rgba(0, 0, 0, 0.015) !important;
                            }
                        `}</style>
                        <FullCalendar
                            initialView="dayGridMonth"
                            plugins={[dayGridPlugin, interactionPlugin, listPlugin, bootstrapPlugin]}
                            themeSystem="bootstrap"
                            bootstrapFontAwesome={false}
                            handleWindowResize={true}
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,listMonth',
                            }}
                            buttonText={{
                                today: 'วันนี้',
                                month: 'มุมมองเดือน',
                                list: 'รายการนัดหมาย',
                            }}
                            locale="th"
                            events={events}
                            datesSet={handleDatesSet}
                            dateClick={handleDateClick}
                            eventClick={handleEventClick}
                            eventContent={renderEventContent}
                            dayMaxEventRows={3}
                            height="auto"
                        />
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default AppointmentCalendar;
