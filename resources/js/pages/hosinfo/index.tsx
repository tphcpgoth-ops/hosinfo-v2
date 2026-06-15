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
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [forceRefreshCooldown, setForceRefreshCooldown] = useState(0);

    const fetchData = async (isBackground = false, force = false) => {
        try {
            if (!isBackground) {
                setLoading(true);
            } else {
                setIsRefreshing(true);
            }
            const apiUrl = external_api_url || 'http://127.0.0.1:8800';
            const url = force ? `${apiUrl}/api/v1/dashboard/summary?force_refresh=true` : `${apiUrl}/api/v1/dashboard/summary`;
            const response = await axios.get(url);
            setData(response.data);
            setError(null);
        } catch (err: any) {
            console.error('Dashboard API Error:', err);
            const msg = err.response?.data?.detail || err.message || 'ไม่สามารถเชื่อมต่อกับ API ได้';
            setError(`API Error: ${msg}`);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    // 1. Polling interval for silent background data refresh
    useEffect(() => {
        fetchData(false, false);

        const pollInterval = setInterval(() => {
            fetchData(true, false);
        }, 60000);

        return () => clearInterval(pollInterval);
    }, []);

    // 2. Button cooldown countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setForceRefreshCooldown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleForceRefresh = () => {
        if (forceRefreshCooldown > 0) return;
        setForceRefreshCooldown(10); // 10-second cache bypass cooldown
        fetchData(false, true);
    };

    return (
        <MainLayout>
            <Head title="Dashboard" />

            {/* Custom Premium Styles for Live Indicators and Animations */}
            <style>{`
                @keyframes live-pulse {
                    0% {
                        transform: scale(0.95);
                        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
                    }
                    70% {
                        transform: scale(1);
                        box-shadow: 0 0 0 6px rgba(239, 68, 68, 0);
                    }
                    100% {
                        transform: scale(0.95);
                        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
                    }
                }
                .badge-live {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background-color: rgba(239, 68, 68, 0.1) !important;
                    color: #ef4444 !important;
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    padding: 4px 10px;
                    font-weight: 700;
                    font-size: 11px;
                    border-radius: 50px;
                    letter-spacing: 0.5px;
                }
                .pulse-dot {
                    width: 7px;
                    height: 7px;
                    background-color: #ef4444;
                    border-radius: 50%;
                    animation: live-pulse 2s infinite;
                }
                .spin-animation {
                    animation: spin 1s infinite linear;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>

            <Row className="mt-3 mb-3">
                <Col xs={12}>
                    <div className="page-title-box d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 pb-3 border-bottom">
                        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-2">
                            <div className="d-flex align-items-center">
                                <h4 className="page-title mb-0 me-2 text-dark fw-bold fs-24">HOS-info Dashboard</h4>
                                <span className="text-muted fs-14 mt-1 d-none d-md-inline">| สถิติผู้รับบริการ Hospital Information</span>
                            </div>
                            <div className="d-flex align-items-center gap-2 ms-md-2 mt-1 mt-md-0">
                                <span className="badge-live">
                                    <span className="pulse-dot"></span>
                                    LIVE
                                </span>
                                {isRefreshing && (
                                    <span className="text-muted fs-12 d-flex align-items-center">
                                        <Spinner animation="border" size="sm" variant="primary" className="me-1" style={{ width: '12px', height: '12px' }} />
                                        กำลังอัปเดตข้อมูลเงียบๆ...
                                    </span>
                                )}
                            </div>
                        </div>
                        <button 
                            className="btn btn-sm btn-soft-primary rounded-pill px-3 d-flex align-items-center gap-1"
                            onClick={handleForceRefresh}
                            disabled={loading || isRefreshing || forceRefreshCooldown > 0}
                        >
                            <IconifyIcon 
                                icon="solar:refresh-bold" 
                                className={`me-1 ${loading || isRefreshing ? 'spin-animation' : ''}`} 
                            />
                            {forceRefreshCooldown > 0 ? `คูลดาวน์ (${forceRefreshCooldown}s)` : 'รีเฟรชข้อมูล'}
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
