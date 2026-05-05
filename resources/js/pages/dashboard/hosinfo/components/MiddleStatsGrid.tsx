import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { Card, Col, Row } from 'react-bootstrap';

const SmallStatCard = ({ title, today, month, icon, bgClass }: { title: string, today: string, month: string, icon: string, bgClass: string }) => {
    return (
        <Card className="border-0 shadow-sm mb-3 overflow-hidden" style={{ borderRadius: '0' }}>
            <div className="d-flex h-100">
                <div className={`${bgClass} d-flex align-items-center justify-content-center px-4`} style={{ width: '80px' }}>
                    <IconifyIcon icon={icon} className="text-white fs-3" />
                </div>
                <div className="p-2 px-3 d-flex flex-column justify-content-center bg-white flex-grow-1">
                    <div className="d-flex align-items-center mb-1">
                        <span className="fw-bold fs-16 me-2 text-dark">วันนี้ {today}</span>
                        <span className="text-muted fs-12">{title}</span>
                    </div>
                    <div className="text-muted fs-12">{month}</div>
                </div>
            </div>
        </Card>
    );
};

const MiddleStatsGrid = () => {
    return (
        <Row className="g-3">
            <Col xl={3} md={6}>
                <SmallStatCard 
                    title="X-RAY" 
                    today="0" 
                    month="เดือนนี้ 489 คน / 806 ครั้ง" 
                    icon="tabler:x" 
                    bgClass="bg-info" 
                />
            </Col>
            <Col xl={3} md={6}>
                <SmallStatCard 
                    title="อุบัติเหตุ" 
                    today="1" 
                    month="เดือนนี้ 423 คน / 427 ครั้ง" 
                    icon="tabler:ambulance" 
                    bgClass="bg-danger" 
                />
            </Col>
            <Col xl={3} md={6}>
                <SmallStatCard 
                    title="กายภาพบำบัด" 
                    today="0" 
                    month="เดือนนี้ 206 คน / 401 ครั้ง" 
                    icon="tabler:wheelchair" 
                    bgClass="bg-success" 
                />
            </Col>
            <Col xl={3} md={6}>
                <SmallStatCard 
                    title="ผู้ป่วยผ่าตัด" 
                    today="3" 
                    month="เดือนนี้ 155 คน / 161 ครั้ง (OPD 24 / IP...)" 
                    icon="tabler:heartbeat" 
                    bgClass="bg-warning" 
                />
            </Col>
            
            <Col xl={3} md={6}>
                <SmallStatCard 
                    title="ผู้รับบริการ PCC" 
                    today="0" 
                    month="เดือนนี้ 194 คน / 303 ครั้ง" 
                    icon="tabler:stethoscope" 
                    bgClass="bg-primary" 
                />
            </Col>
            <Col xl={3} md={6}>
                <SmallStatCard 
                    title="ยาเสพติด" 
                    today="" 
                    month="เดือนนี้ คน / ครั้ง" 
                    icon="tabler:leaf" 
                    bgClass="bg-secondary" 
                />
            </Col>
            <Col xl={3} md={6}>
                <SmallStatCard 
                    title="จิตเวช" 
                    today="" 
                    month="เดือนนี้ คน / ครั้ง" 
                    icon="tabler:heart" 
                    bgClass="bg-primary" 
                />
            </Col>
        </Row>
    );
};

export default MiddleStatsGrid;
