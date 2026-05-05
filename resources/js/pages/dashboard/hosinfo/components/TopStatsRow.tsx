import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { Card, Col, Row } from 'react-bootstrap';
import { Link } from '@inertiajs/react';

const StatCard = ({ title, count, subtitle, icon, bgClass }: { title: string, count: string | number, subtitle: string, icon: string, bgClass: string }) => {
    return (
        <Card className={`text-white overflow-hidden ${bgClass} border-0 shadow-sm`} style={{ borderRadius: '0' }}>
            <div className="p-3 position-relative">
                <h3 className="text-white fw-bold mb-1 fs-32">{count}</h3>
                <h5 className="text-white mb-1 fs-16">{title}</h5>
                <p className="text-white-50 mb-0 fs-13">{subtitle}</p>
                <div className="position-absolute opacity-25" style={{ top: '15px', right: '15px' }}>
                    <IconifyIcon icon={icon} width="60" height="60" />
                </div>
            </div>
            <Link href="#" className="text-white-50 text-center py-1 d-block" style={{ backgroundColor: 'rgba(0,0,0,0.1)', fontSize: '12px', textDecoration: 'none' }}>
                รายละเอียด <IconifyIcon icon="tabler:arrow-right-circle" className="align-middle" />
            </Link>
        </Card>
    );
};

const TopStatsRow = () => {
    return (
        <Row className="g-3 mb-3">
            <Col xl={3} md={6}>
                <StatCard 
                    title="ผู้รับบริการวันนี้" 
                    count="128" 
                    subtitle="(เดือนนี้ 9,120 คน / 13,915 ครั้ง)" 
                    icon="tabler:stethoscope" 
                    bgClass="bg-info" 
                />
            </Col>
            <Col xl={3} md={6}>
                <StatCard 
                    title="Admit วันนี้" 
                    count="1" 
                    subtitle="(เดือนนี้ 486 คน / 512 ครั้ง)" 
                    icon="tabler:bed" 
                    bgClass="bg-danger" 
                />
            </Col>
            <Col xl={3} md={6}>
                <StatCard 
                    title="แพทย์แผนไทย วันนี้" 
                    count="0" 
                    subtitle="(เดือนนี้ 358 คน / 368 ครั้ง)" 
                    icon="tabler:hand-stop" 
                    bgClass="bg-success" 
                />
            </Col>
            <Col xl={3} md={6}>
                <StatCard 
                    title="ทันตกรรม วันนี้" 
                    count="0" 
                    subtitle="(เดือนนี้ 957 คน / 1,276 ครั้ง)" 
                    icon="tabler:dental" 
                    bgClass="bg-warning" 
                />
            </Col>
        </Row>
    );
};

export default TopStatsRow;
