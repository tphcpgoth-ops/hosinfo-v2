import { Card, Col, Row } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const TrendStat = ({ title, count, percentage, isUp }: { title: string, count: string, percentage: string, isUp: boolean }) => {
    const colorClass = isUp ? 'text-danger' : 'text-success';
    const icon = isUp ? 'tabler:triangle-filled' : 'tabler:triangle-inverted-filled';
    
    return (
        <div className="text-center py-3">
            <div className={`${colorClass} fs-13 fw-bold mb-1`}>
                <IconifyIcon icon={icon} className="me-1 fs-10" />
                {percentage}
            </div>
            <h4 className="fw-bold text-dark mb-1">{count}</h4>
            <div className="text-muted fs-12 text-uppercase">{title}</div>
        </div>
    );
};

const DiseaseTrendsRow = () => {
    return (
        <Card className="border-0 shadow-sm mb-4">
            <Row className="g-0">
                <Col xl={3} md={6} className="border-end border-light">
                    <TrendStat title="DENGUE FEVER (2026)" count="6" percentage="1.08%" isUp={true} />
                </Col>
                <Col xl={3} md={6} className="border-end border-light">
                    <TrendStat title="INFLUENZA,(FU)(2026)" count="129" percentage="23.20%" isUp={false} />
                </Col>
                <Col xl={3} md={6} className="border-end border-light">
                    <TrendStat title="FOOD POISONING(2026)" count="26" percentage="4.68%" isUp={false} />
                </Col>
                <Col xl={3} md={6}>
                    <TrendStat title="DIARRHEA(2026)" count="333" percentage="59.89%" isUp={false} />
                </Col>
            </Row>
        </Card>
    );
};

export default DiseaseTrendsRow;
