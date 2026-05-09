import { useState, useEffect } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Col, Row, Spinner } from 'react-bootstrap';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import TopStatsRow from './components/TopStatsRow';
import MiddleStatsGrid from './components/MiddleStatsGrid';
import IpdStatsSection from './components/IpdStatsSection';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const Dashboard2Page = ({ api_token }: { api_token: string }) => {
    console.log('DEBUG: API Token from props:', api_token);
    const [data, setData] = useState<{ stats: any, wards: any[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const apiUrl = import.meta.env.VITE_EXTERNAL_API_URL || 'http://127.0.0.1:8800';
                const response = await axios.get(`${apiUrl}/api/v1/dashboard/summary`, {
                    headers: { Authorization: `Bearer ${api_token}` }
                });
                setData(response.data);
                setError(null);
            } catch (err: any) {
                console.error('Dashboard API Error:', err);
                const msg = err.response?.data?.detail || err.message || 'ไม่สามารถเชื่อมต่อกับ API ได้';
                const apiUrl = import.meta.env.VITE_EXTERNAL_API_URL || 'http://127.0.0.1:8800';
                setError(`API Error: ${msg} (${apiUrl})`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <MainLayout>
            <Head title="Dashboard" />

            <Row className="mt-3 mb-3">
                <Col xs={12}>
                    <div className="page-title-box d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                            <h4 className="page-title mb-0 me-2 text-dark fw-bold fs-24">HOS-info Dashboard</h4>
                            <span className="text-muted fs-14 mt-1">สถิติผู้รับบริการ Hospital Information</span>
                        </div>
                        <button className="btn btn-sm btn-soft-primary rounded-pill px-3" onClick={() => window.location.reload()}>
                            <IconifyIcon icon="solar:refresh-bold" className="me-1" /> รีเฟรชข้อมูล
                        </button>
                    </div>
                </Col>
            </Row>

            {error && (
                <div className="alert alert-danger border-0 shadow-sm d-flex align-items-center mb-4">
                    <IconifyIcon icon="solar:danger-bold" className="me-2 fs-20" />
                    {error}
                </div>
            )}

            {loading ? (
                <div className="d-flex flex-column align-items-center justify-content-center py-5">
                    <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                    <p className="mt-3 text-muted fw-medium">กำลังโหลดข้อมูลสถิติเรียลไทม์...</p>
                </div>
            ) : data ? (
                <>
                    <TopStatsRow stats={data.stats} />
                    <MiddleStatsGrid stats={data.stats} />
                    
                    <Row className="mt-4 mb-2">
                        <Col>
                            <h4 className="text-dark fw-bold border-start border-4 border-danger ps-2">สถิติผู้ป่วยในและตึกผู้ป่วย</h4>
                        </Col>
                    </Row>
                    
                    <IpdStatsSection stats={data.stats} wards={data.wards} />
                </>
            ) : (
                <div className="text-center py-5 text-muted">
                    <IconifyIcon icon="solar:database-bold-duotone" className="fs-64 mb-3 opacity-25" />
                    <h5>ไม่พบข้อมูลสรุป</h5>
                </div>
            )}

            <Row className="mt-2 mb-2">
                <Col md={6}>
                </Col>
            </Row>
                
        </MainLayout>
    );
};

export default Dashboard2Page;
