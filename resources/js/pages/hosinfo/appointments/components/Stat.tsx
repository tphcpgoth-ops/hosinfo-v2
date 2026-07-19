import { useState, useEffect } from 'react';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { usePage } from '@inertiajs/react';
import { Card, CardBody, Col, Row, Spinner } from 'react-bootstrap';
import axios from 'axios';

export interface StatDetailType {
    title: string;
    count: string | number;
}

export interface StatType {
    title: string;
    icon: string;
    count: string | number;
    isDot?: boolean;
    isLabel?: string;
    details?: StatDetailType[];
    loading?: boolean;
}

export const StatCard = ({ count, details = [], icon, title, isLabel, isDot = true, loading }: StatType) => {
    return (
        <Card className="shadow-sm border-0 h-100">
            <CardBody>
                <div className="text-muted float-end mt-n1 fs-18">
                    <IconifyIcon icon="tabler:external-link" />
                </div>
                <h5 className="text-muted fs-14 fw-semibold text-uppercase mb-3" title={title}>
                    {title}
                </h5>
                <div className="d-flex align-items-center gap-3 my-3">
                    <div className="avatar-md flex-shrink-0">
                        <span className="avatar-title bg-primary-subtle text-primary rounded fs-22 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                            <IconifyIcon icon={icon} />
                        </span>
                    </div>
                    <div>
                        <h3 className="mb-0 fw-bold d-flex align-items-center">
                            {loading ? (
                                <Spinner animation="border" size="sm" variant="primary" className="my-1" />
                            ) : (
                                count
                            )}
                            {isLabel && !loading && (
                                <span className="badge text-bg-success fw-medium ms-2 fs-12 px-2 py-1">
                                    {isLabel}
                                </span>
                            )}
                        </h3>
                    </div>
                </div>
                <div className="mt-3 pt-2 border-top">
                    {loading ? (
                        <div className="text-muted fs-13 py-1">
                            <Spinner animation="grow" size="sm" className="me-2" />
                            กำลังโหลดข้อมูล...
                        </div>
                    ) : (
                        details.map((data, idx) => (
                            <p className="mb-1 d-flex justify-content-between align-items-center fs-13" key={idx}>
                                <span className="text-muted d-flex align-items-center">
                                    <span className="text-primary me-2">
                                        {isDot ? <IconifyIcon icon="tabler:point-filled" className="fs-12" /> : <IconifyIcon icon="tabler:minus" />}
                                    </span>
                                    {data.title}
                                </span>
                                <span className="fw-bold text-dark">
                                    {data.count}
                                </span>
                            </p>
                        ))
                    )}
                </div>
            </CardBody>
        </Card>
    );
};

const Stat = ({ externalApiUrl }: { externalApiUrl?: string }) => {
    const { external_api_url } = usePage().props as any;
    const [stats, setStats] = useState<StatType[]>([
        {
            title: 'ผู้ป่วยนัดวันนี้',
            icon: 'tabler:calendar-week',
            count: '-',
            isDot: true,
            isLabel: 'วันนี้',
            details: [
                { title: 'มารับบริการแล้ว', count: '-' },
                { title: 'ยังไม่มารับบริการ', count: '-' }
            ],
            loading: true
        },
        {
            title: 'ผู้ป่วยรอรับบริการขณะนี้',
            icon: 'tabler:users',
            count: '-',
            isDot: true,
            isLabel: 'Realtime',
            details: [
                { title: 'ผู้ป่วยวันนี้ทั้งหมด', count: '-' },
                { title: 'รับบริการเสร็จสิ้น', count: '-' }
            ],
            loading: true
        },
        {
            title: 'ผู้ป่วยรอตรวจ',
            icon: 'tabler:stethoscope',
            count: '-',
            isDot: true,
            isLabel: 'รอตรวจแพทย์',
            details: [
                { title: 'ผู้ป่วยนอก (OPD)', count: '-' },
                { title: 'ผู้ป่วยฉุกเฉิน (ER)', count: '-' }
            ],
            loading: true
        }
    ]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchTopStats = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const apiUrl = externalApiUrl || external_api_url || import.meta.env.VITE_EXTERNAL_API_URL || 'http://127.0.0.1:8800';
            const res = await axios.get(`${apiUrl}/api/v1/dashboard/top-stats`);
            if (res.data && Array.isArray(res.data)) {
                setStats(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch dashboard top stats:', err);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchTopStats(false);
        const interval = setInterval(() => {
            fetchTopStats(true);
        }, 60000); // refresh every 60 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <Row className="row-cols-xl-3 row-cols-md-3 row-cols-1 align-items-center mt-0 mb-0 g-3">
            {stats.map((item, idx) => (
                <Col key={idx}>
                    <StatCard {...item} loading={loading && item.count === '-'} />
                </Col>
            ))}
        </Row>
    );
};

export default Stat;
