import { useState } from 'react';
import PageTitle from '@/components/PageTitle';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardBody, Col, Row, Form, Button } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface UpdateItem {
    id: number;
    sysupdate: string;
    updatetext: string;
    position: string;
    sysuser: string;
    fullname: string;
    user_picture: string | null;
}

const LastUpdatePage = ({ updates }: { updates: UpdateItem[] }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUpdates = updates.filter(update =>
        update.updatetext.toLowerCase().includes(searchTerm.toLowerCase()) ||
        update.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        update.sysuser.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDateThai = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }) + ' น.';
        } catch (e) {
            return dateString;
        }
    };

    return (
        <MainLayout>
            <PageTitle title="ประวัติการปรับปรุงระบบ (Last Updates & Changelog)" subTitle="HOSinfo Updates" />

            <Row className="mb-4">
                <Col md={4} className="mb-3 mb-md-0">
                    <Card className="shadow-sm border-0 bg-primary text-white h-100">
                        <CardBody className="d-flex align-items-center">
                            <div className="avatar-md bg-soft-light rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '48px', height: '48px' }}>
                                <IconifyIcon icon="solar:bullhorn-bold-duotone" className="fs-24 text-white" />
                            </div>
                            <div>
                                <h6 className="text-white-50 mb-1 fw-medium text-uppercase">ประกาศและอัปเดตทั้งหมด</h6>
                                <h3 className="mb-0 text-white fw-bold">{updates.length} ข้อความ</h3>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                <Col md={8}>
                    <Card className="shadow-sm border-0 h-100">
                        <CardBody className="d-flex flex-column justify-content-center">
                            <Form.Group className="position-relative">
                                <Form.Control
                                    type="text"
                                    placeholder="ค้นหาข้อความประกาศ หรือผู้บันทึก..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="ps-4 shadow-sm border-2 rounded-pill py-2"
                                />
                                <div className="position-absolute top-50 start-0 translate-middle-y ps-3">
                                    <IconifyIcon icon="solar:magnifer-linear" className="text-muted fs-18" />
                                </div>
                            </Form.Group>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            <Card className="shadow-sm border-0">
                <CardBody className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                        <div>
                            <h5 className="mb-1 fw-bold text-primary">ไทม์ไลน์การพัฒนาปรับปรุง (Development Timeline)</h5>
                            <p className="text-muted mb-0 small">ติดตามความคืบหน้าและการปรับปรุงฟังก์ชันการใช้งานระบบ HOSinfo</p>
                        </div>
                    </div>

                    {filteredUpdates.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <IconifyIcon icon="solar:clipboard-remove-broken" className="fs-48 mb-2 text-primary opacity-50" />
                            <p className="mb-0">ไม่พบประวัติการปรับปรุงที่ค้นหา</p>
                        </div>
                    ) : (
                        <div className="timeline-section position-relative ps-4 ms-2 border-start border-2 border-light">
                            {filteredUpdates.map((update, index) => {
                                const isRight = update.position === 'r';
                                const avatarUrl = update.user_picture
                                    ? `/images/users/${update.user_picture}`
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(update.fullname)}&background=random&color=fff&size=100`;

                                return (
                                    <div key={update.id} className="timeline-item mb-4 position-relative">
                                        {/* Dot Indicator */}
                                        <div 
                                            className={`position-absolute rounded-circle shadow-sm border border-2 border-white d-flex align-items-center justify-content-center`}
                                            style={{
                                                width: '16px',
                                                height: '16px',
                                                left: '-33px',
                                                top: '4px',
                                                backgroundColor: isRight ? '#6f42c1' : '#0d6efd'
                                            }}
                                        />

                                        <Card className="shadow-sm border-0 border-start border-3 border-primary mb-0 bg-light-subtle">
                                            <CardBody className="p-3">
                                                <div className="d-flex align-items-start">
                                                    <img
                                                        src={avatarUrl}
                                                        alt={update.fullname}
                                                        className="rounded-circle me-3 shadow-sm border border-2 border-white"
                                                        style={{ width: '42px', height: '42px', objectFit: 'cover' }}
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(update.fullname)}&background=6f42c1&color=fff&size=100`;
                                                        }}
                                                    />
                                                    <div className="flex-grow-1">
                                                        <div className="d-flex flex-wrap justify-content-between align-items-center mb-2">
                                                            <div className="d-flex align-items-center">
                                                                <h6 className="mb-0 fw-bold text-dark me-2">{update.fullname}</h6>
                                                                <span className="badge bg-soft-primary text-primary px-2 rounded-pill small fw-semibold">
                                                                    @{update.sysuser}
                                                                </span>
                                                            </div>
                                                            <small className="text-muted d-flex align-items-center mt-1 mt-sm-0">
                                                                <IconifyIcon icon="solar:clock-circle-linear" className="me-1 fs-14" />
                                                                {formatDateThai(update.sysupdate)}
                                                            </small>
                                                        </div>
                                                        <div className="p-3 bg-white rounded border border-light text-dark shadow-sm-inset" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                                            {update.updatetext}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardBody>
            </Card>
        </MainLayout>
    );
};

export default LastUpdatePage;
