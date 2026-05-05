import { Card, CardBody, CardHeader, Col, Row, Button } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const AnnouncementItem = ({ title, date, user, isGray = false }: { title: string, date: string, user: string, isGray?: boolean }) => {
    return (
        <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
                <div className="text-muted fs-12">
                    <IconifyIcon icon="tabler:clock" className="me-1" /> {date}
                </div>
                {isGray && <div className="text-muted fs-12 fw-bold">{user}</div>}
            </div>
            <div className="d-flex gap-2">
                {!isGray && (
                    <div className="flex-shrink-0 mt-1">
                        <div className="bg-light rounded-circle" style={{ width: '32px', height: '32px', overflow: 'hidden' }}>
                            <img src="/images/users/avatar-1.jpg" alt={user} className="img-fluid" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + user + '&background=random'; }} />
                        </div>
                    </div>
                )}
                <div className={`p-2 rounded flex-grow-1 ${isGray ? 'bg-light text-dark' : 'bg-warning text-white'}`}>
                    {title}
                </div>
                {isGray && (
                    <div className="flex-shrink-0 mt-1">
                        <div className="bg-light rounded-circle" style={{ width: '32px', height: '32px', overflow: 'hidden' }}>
                            <img src="/images/users/avatar-1.jpg" alt={user} className="img-fluid" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + user + '&background=random'; }} />
                        </div>
                    </div>
                )}
                {!isGray && <div className="text-muted fs-12 fw-bold mt-1">{user}</div>}
            </div>
        </div>
    );
};

const ManualItem = ({ title, desc, type }: { title: string, desc: string, type: 'folder' | 'pdf' }) => {
    return (
        <div className="d-flex align-items-center mb-3 pb-3 border-bottom border-light">
            <div className="me-3">
                {type === 'folder' ? (
                    <IconifyIcon icon="tabler:folder-filled" className="fs-36 text-info" />
                ) : (
                    <IconifyIcon icon="tabler:file-type-pdf" className="fs-36 text-danger" />
                )}
            </div>
            <div className="flex-grow-1">
                <h6 className="fw-bold mb-1 text-primary">{title}</h6>
                <div className="fs-12 text-muted">{desc}</div>
            </div>
            <div>
                <Button size="sm" variant={type === 'pdf' ? 'warning' : 'info'} className="text-white fw-bold px-3 py-1 fs-12 rounded-1">
                    คลิกอ่าน
                </Button>
            </div>
        </div>
    );
};

const BottomSection = () => {
    return (
        <Row>
            <Col lg={6}>
                <Card className="border-0 shadow-sm border-top border-warning border-3 mb-4">
                    <CardHeader className="bg-white pb-0 pt-3 border-bottom-0 d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 fw-bold d-flex align-items-center">
                            <IconifyIcon icon="tabler:speakerphone" className="me-2 text-dark fs-20" /> ประกาศ
                        </h5>
                        <div className="d-flex gap-2">
                            <Badge bg="warning" className="rounded-pill">13</Badge>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <AnnouncementItem 
                            title="ปรับปรุงตัวชี้วัด ยกตัวชี้วัดของปี 2565 มาตั้งตอนให้เป็นปี 2566" 
                            date="10 พ.ย. 2565 16.44 น." 
                            user="ghost" 
                        />
                        <AnnouncementItem 
                            title="ปรับปรุงหน้า Dashboard ข้อมูลตัวชี้วัด KPI" 
                            date="31 ต.ค. 2562 15.55 น." 
                            user="ghost" 
                        />
                        <AnnouncementItem 
                            title="ปรับปรุงการจัดการตัวชี้วัด KPI" 
                            date="29 มิ.ย. 2562 15.36 น." 
                            user="ghost" 
                            isGray={true}
                        />
                    </CardBody>
                </Card>
            </Col>
            <Col lg={6}>
                <Card className="border-0 shadow-sm border-top border-info border-3 mb-4">
                    <CardHeader className="bg-white pb-0 pt-3 border-bottom-0 d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 fw-bold d-flex align-items-center">
                            <IconifyIcon icon="tabler:file-description" className="me-2 text-dark fs-20" /> คู่มือและข้อตกลงการใช้งาน
                        </h5>
                    </CardHeader>
                    <CardBody>
                        <ManualItem 
                            title="คู่มือ MIS (Web 4.0)" 
                            desc="คู่มือการใช้งานโปรแกรมระบบเว็บ MIS" 
                            type="folder" 
                        />
                        <ManualItem 
                            title="คู่มือการจัดทำรายงาน End User" 
                            desc="คู่มือสำหรับผู้ดูแล จัดทำรายงาน End User เพื่อประมวลผลข้อมูลจากฐานข้อมูล HOSxP" 
                            type="folder" 
                        />
                        <ManualItem 
                            title="รวม Template" 
                            desc="รวม Template และคำอธิบายทุกตัวชี้วัด" 
                            type="pdf" 
                        />
                    </CardBody>
                </Card>
            </Col>
        </Row>
    );
};

// Need to import Badge at the top, since I used it above.
import { Badge } from 'react-bootstrap';

export default BottomSection;
