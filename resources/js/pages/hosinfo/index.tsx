import { useState, useEffect } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Col, Row, Spinner } from 'react-bootstrap';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import TopStatsRow from './components/TopStatsRow';
import MiddleStatsGrid from './components/MiddleStatsGrid';
import IpdStatsSection from './components/IpdStatsSection';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const HosinfoPage = ({ api_token, external_api_url }: { api_token: string, external_api_url: string }) => {
    console.log('DEBUG: API Token from props:', api_token);
    const [data, setData] = useState<{ stats: any, wards: any[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const apiUrl = external_api_url || 'http://127.0.0.1:8800';
            const response = await axios.get(`${apiUrl}/api/v1/dashboard/summary`);
            setData(response.data);
            setError(null);
        } catch (err: any) {
            console.error('Dashboard API Error:', err);
            const msg = err.response?.data?.detail || err.message || 'ไม่สามารถเชื่อมต่อกับ API ได้';
            setError(`API Error: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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
                        <button className="btn btn-sm btn-soft-primary rounded-pill px-3" onClick={fetchData}>
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

            <TopStatsRow stats={data?.stats || {}} loading={loading} />
            <MiddleStatsGrid stats={data?.stats || {}} loading={loading} />
            
            <Row className="mt-4 mb-2">
                <Col>
                    <h4 className="text-dark fw-bold border-start border-4 border-danger ps-2">สถิติผู้ป่วยในและตึกผู้ป่วย</h4>
                </Col>
            </Row>
            
            <IpdStatsSection stats={data?.stats || {}} wards={data?.wards || []} loading={loading} />


            <Row className="mt-2 mb-2">
                <Col md={6}>
                </Col>
            </Row>
                
        </MainLayout>
    );
};

export default HosinfoPage;
