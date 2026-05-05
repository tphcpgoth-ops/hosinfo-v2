import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { Card, Col, Row } from 'react-bootstrap';

const SmallStatCard = ({ title, today, month, icon, bgClass }: { title: string, today: string | number, month: string, icon: string, bgClass: string }) => {
    return (
        <Card className="border-0 shadow-sm mb-0 overflow-hidden" style={{ borderRadius: '0' }}>
            <div className="d-flex h-100">
                <div className={`${bgClass} d-flex align-items-center justify-content-center`} style={{ width: '80px' }}>
                    <IconifyIcon icon={icon} className="text-white" width="48" height="48" />
                </div>
                <div className="p-2 px-3 d-flex flex-column justify-content-center bg-white flex-grow-1">
                    <div className="d-flex align-items-center mb-2">
                        <span className="fw-bold fs-16 me-2 text-dark">วันนี้ {today}</span>
                        <span className="text-muted fs-12">{title}</span>
                    </div>
                    <div className="text-muted fs-12">{month}</div>
                </div>
            </div>
        </Card>
    );
};

const MiddleStatsGrid = ({ stats }: { stats: any }) => {
    const format = (val: any) => new Intl.NumberFormat().format(val || 0);

    return (
        <Row className="g-3">
            <Col xl={3} md={6}>
                <SmallStatCard 
                    title="X-RAY" 
                    today={format(stats.xray.pt_xray_today)} 
                    month={`เดือนนี้ ${format(stats.xray.ptm_xray_hn)} คน / ${format(stats.xray.ptm_xray_vn)} ครั้ง`} 
                    icon="tabler:x" 
                    bgClass="bg-info" 
                />
            </Col>
            <Col xl={3} md={6}>
                <SmallStatCard 
                    title="อุบัติเหตุ" 
                    today={format(stats.er.pt_er_today)} 
                    month={`เดือนนี้ ${format(stats.er.ptm_er_hn)} คน / ${format(stats.er.ptm_er_vn)} ครั้ง`} 
                    icon="tabler:ambulance" 
                    bgClass="bg-danger" 
                />
            </Col>
            <Col xl={3} md={6}>
                <SmallStatCard 
                    title="กายภาพบำบัด" 
                    today={format(stats.phy.pt_phy_today)} 
                    month={`เดือนนี้ ${format(stats.phy.ptm_phy_hn)} คน / ${format(stats.phy.ptm_phy_vn)} ครั้ง`} 
                    icon="tabler:wheelchair" 
                    bgClass="bg-success" 
                />
            </Col>
            <Col xl={3} md={6}>
                <SmallStatCard 
                    title="ผู้ป่วยผ่าตัด" 
                    today={format(stats.or.pt_or_today)} 
                    month={`เดือนนี้ ${format(stats.or.ptm_or_hn)} คน / ${format(stats.or.ptm_or_vn)} ครั้ง (OPD ${format(stats.or.ptm_or_opd)} / IPD ${format(stats.or.ptm_or_ipd)})`} 
                    icon="tabler:heartbeat" 
                    bgClass="bg-warning" 
                />
            </Col>
            
            <Col xl={3} md={6}>
                <SmallStatCard 
                    title="ผู้รับบริการ PCC" 
                    today={format(stats.opd.ptm_pcc_today)} 
                    month={`เดือนนี้ ${format(stats.opd.ptm_pcc_hn)} คน / ${format(stats.opd.ptm_pcc_vn)} ครั้ง`} 
                    icon="tabler:stethoscope" 
                    bgClass="bg-primary" 
                />
            </Col>
            <Col xl={3} md={6}>
                <SmallStatCard 
                    title="ยาเสพติด" 
                    today="-" 
                    month="เดือนนี้ - คน / - ครั้ง" 
                    icon="tabler:leaf" 
                    bgClass="bg-secondary" 
                />
            </Col>
            <Col xl={3} md={6}>
                <SmallStatCard 
                    title="จิตเวช" 
                    today="-" 
                    month="เดือนนี้ - คน / - ครั้ง" 
                    icon="tabler:heart" 
                    bgClass="bg-primary" 
                />
            </Col>
        </Row>
    );
};

export default MiddleStatsGrid;
