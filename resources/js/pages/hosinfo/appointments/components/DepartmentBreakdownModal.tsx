import { useState, useEffect } from 'react';
import { Modal, Card, CardBody, Row, Col, Table, Spinner, Form, InputGroup } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import axios from 'axios';

interface DepartmentData {
    department_name: string;
    department_code: string;
    total_appointments: number;
    total_patients: number;
}

interface BreakdownResponse {
    date: string;
    total_appointments: number;
    total_patients: number;
    total_departments: number;
    departments: DepartmentData[];
}

interface DepartmentBreakdownModalProps {
    show: boolean;
    onHide: () => void;
    selectedDate: string | null;
    externalApiUrl: string;
}

const formatThaiDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const months = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const yearBE = parseInt(parts[0], 10) + 543;
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return `${day} ${months[monthIdx] || ''} พ.ศ. ${yearBE}`;
};

const DepartmentBreakdownModal = ({
    show,
    onHide,
    selectedDate,
    externalApiUrl,
}: DepartmentBreakdownModalProps) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<BreakdownResponse | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (show && selectedDate) {
            fetchBreakdown(selectedDate);
            setSearchTerm('');
        }
    }, [show, selectedDate]);

    const fetchBreakdown = async (date: string) => {
        setLoading(true);
        setError(null);
        try {
            const apiUrl = externalApiUrl || 'http://127.0.0.1:8800';
            const res = await axios.get(`${apiUrl}/api/v1/appointments/by-department?date=${date}`);
            setData(res.data);
        } catch (err: any) {
            console.error('Failed to fetch department breakdown:', err);
            setError('ไม่สามารถดึงข้อมูลนัดหมายแยกแผนกได้');
        } finally {
            setLoading(false);
        }
    };

    const filteredDepartments = data?.departments.filter((d) =>
        d.department_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.department_code.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const totalApp = data?.total_appointments || 1;

    return (
        <Modal show={show} onHide={onHide} size="lg" centered scrollable>
            <Modal.Header closeButton className="bg-light border-bottom">
                <Modal.Title className="d-flex align-items-center gap-2 fs-18 fw-bold text-primary">
                    <IconifyIcon icon="tabler:calendar-event" className="fs-22" />
                    <span>ข้อมูลนัดหมายประจำวันที่ {formatThaiDate(selectedDate)}</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3 text-muted fw-semibold">กำลังโหลดข้อมูลนัดหมายแยกแผนก...</p>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger text-center my-3">
                        <IconifyIcon icon="solar:danger-triangle-bold" className="fs-24 me-2" />
                        {error}
                    </div>
                ) : data ? (
                    <>
                        {/* Summary Cards */}
                        <Row className="g-3 mb-4">
                            <Col md={4}>
                                <Card className="border-0 shadow-sm bg-primary-subtle h-100">
                                    <CardBody className="p-3 d-flex align-items-center gap-3">
                                        <div className="avatar-md bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
                                            <IconifyIcon icon="tabler:users" className="fs-24" />
                                        </div>
                                        <div>
                                            <div className="text-muted fs-12 fw-semibold">จำนวนนัดทั้งหมด</div>
                                            <h4 className="mb-0 fw-bold text-primary">
                                                {data.total_appointments.toLocaleString()} <span className="fs-13 fw-normal">รายการ</span>
                                            </h4>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                            <Col md={4}>
                                <Card className="border-0 shadow-sm bg-success-subtle h-100">
                                    <CardBody className="p-3 d-flex align-items-center gap-3">
                                        <div className="avatar-md bg-success text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
                                            <IconifyIcon icon="tabler:user-check" className="fs-24" />
                                        </div>
                                        <div>
                                            <div className="text-muted fs-12 fw-semibold">จำนวนผู้ป่วย (HN)</div>
                                            <h4 className="mb-0 fw-bold text-success">
                                                {data.total_patients.toLocaleString()} <span className="fs-13 fw-normal">คน</span>
                                            </h4>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                            <Col md={4}>
                                <Card className="border-0 shadow-sm bg-info-subtle h-100">
                                    <CardBody className="p-3 d-flex align-items-center gap-3">
                                        <div className="avatar-md bg-info text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
                                            <IconifyIcon icon="tabler:building-hospital" className="fs-24" />
                                        </div>
                                        <div>
                                            <div className="text-muted fs-12 fw-semibold">จำนวนแผนก/คลินิก</div>
                                            <h4 className="mb-0 fw-bold text-info">
                                                {data.total_departments.toLocaleString()} <span className="fs-13 fw-normal">แผนก</span>
                                            </h4>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>

                        {/* Search Bar */}
                        <div className="mb-3">
                            <InputGroup>
                                <InputGroup.Text className="bg-light border-end-0">
                                    <IconifyIcon icon="tabler:search" className="text-muted" />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="ค้นหาชื่อแผนกหรือคลินิก..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border-start-0"
                                />
                            </InputGroup>
                        </div>

                        {/* Table */}
                        <div className="table-responsive">
                            <Table hover className="align-middle mb-0">
                                <thead className="bg-light text-muted fw-semibold">
                                    <tr>
                                        <th style={{ width: '60px' }} className="text-center">#</th>
                                        <th>แผนก / คลินิก</th>
                                        <th className="text-end">จำนวนนัดหมาย</th>
                                        <th className="text-end">คนไข้ (HN)</th>
                                        <th style={{ width: '150px' }}>สัดส่วน (%)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDepartments.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-4 text-muted">
                                                ไม่พบข้อมูลแผนกที่ค้นหา
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredDepartments.map((dept, index) => {
                                            const pct = Math.round((dept.total_appointments / totalApp) * 100);
                                            return (
                                                <tr key={`${dept.department_code}-${index}`}>
                                                    <td className="text-center text-muted fw-medium">{index + 1}</td>
                                                    <td>
                                                        <div className="fw-semibold text-dark">
                                                            {dept.department_name}
                                                        </div>
                                                        {dept.department_code && dept.department_code !== '-' && (
                                                            <small className="text-muted">รหัส: {dept.department_code}</small>
                                                        )}
                                                    </td>
                                                    <td className="text-end fw-bold text-primary">
                                                        {dept.total_appointments.toLocaleString()}
                                                    </td>
                                                    <td className="text-end fw-semibold text-muted">
                                                        {dept.total_patients.toLocaleString()}
                                                    </td>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div className="progress flex-grow-1" style={{ height: '6px' }}>
                                                                <div
                                                                    className="progress-bar bg-primary"
                                                                    role="progressbar"
                                                                    style={{ width: `${pct}%` }}
                                                                />
                                                            </div>
                                                            <span className="fs-12 fw-semibold text-muted" style={{ width: '38px' }}>
                                                                {pct}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </>
                ) : null}
            </Modal.Body>
            <Modal.Footer className="bg-light">
                <button type="button" className="btn btn-soft-secondary" onClick={onHide}>
                    ปิดหน้าต่าง
                </button>
            </Modal.Footer>
        </Modal>
    );
};

export default DepartmentBreakdownModal;
