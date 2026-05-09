import { useEffect, useState } from 'react';
import PageTitle from '@/components/PageTitle';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardBody, Col, Row, Spinner, Table } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import axios from 'axios';

const HosinfoPage = () => {
    const [stats, setStats] = useState({
        today_opd: 0,
        today_ipd: 0,
        today_er: 0,
    });
    const [visits, setVisits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                // ใช้ข้อมูลวันที่จากปัจจุบัน
                const today = new Date().toISOString().split('T')[0];
                const response = await axios.get(`http://127.0.0.1:8800/api/v1/opd/visits?visit_date=${today}&page=1&page_size=10`);
                
                // สมมติโครงสร้างข้อมูลจาก API: { data: [...], total: 123 }
                const data = response.data;
                setStats(prev => ({
                    ...prev,
                    today_opd: data.total || data.data?.length || 0
                }));
                setVisits(data.data || []);
                setError(null);
            } catch (err) {
                console.error('API Error:', err);
                setError('ไม่สามารถเชื่อมต่อกับ API ภายนอกได้ (http://127.0.0.1:8800)');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        { label: 'ผู้รับบริการ OPD วันนี้', value: stats.today_opd, icon: 'solar:user-speak-bold-duotone', color: 'primary' },
        { label: 'ผู้รับบริการ IPD วันนี้', value: stats.today_ipd, icon: 'solar:bed-bold-duotone', color: 'success' },
        { label: 'อุบัติเหตุ-ฉุกเฉิน (ER)', value: stats.today_er, icon: 'solar:danger-bold-duotone', color: 'danger' },
        { label: 'รอรับบริการสะสม', value: 0, icon: 'solar:users-group-two-rounded-bold-duotone', color: 'warning' },
    ];

    return (
        <MainLayout>
            <PageTitle title="HOSinfo Dashboard" subTitle="ระบบสถิติและข้อมูลโรงพยาบาล (External API Mode)" />

            <div className="mt-0">
                {error && (
                    <div className="alert alert-danger border-0 shadow-sm d-flex align-items-center mb-4">
                        <IconifyIcon icon="solar:danger-bold" className="me-2 fs-20" />
                        {error}
                    </div>
                )}

                <Row className="g-3 mb-4">
                    {statCards.map((item, idx) => (
                        <Col lg={3} md={6} key={idx}>
                            <Card className="shadow-sm border-0 h-100 overflow-hidden position-relative">
                                <CardBody className="p-4">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className={`bg-${item.color}-subtle text-${item.color} rounded-circle p-2 me-3 d-flex align-items-center justify-content-center`} style={{ width: '48px', height: '48px' }}>
                                            <IconifyIcon icon={item.icon} className="fs-24" />
                                        </div>
                                        <h6 className="text-muted fw-bold mb-0 text-uppercase ls-1 small">{item.label}</h6>
                                    </div>
                                    <div className="d-flex align-items-baseline">
                                        {loading ? (
                                            <Spinner animation="border" size="sm" variant={item.color} className="me-2" />
                                        ) : (
                                            <h2 className="fw-bold mb-0 me-2">{item.value.toLocaleString()}</h2>
                                        )}
                                        <span className="text-muted small">ราย</span>
                                    </div>
                                </CardBody>
                                <div className={`bg-${item.color}`} style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '4px', opacity: 0.6 }} />
                            </Card>
                        </Col>
                    ))}
                </Row>

                <Row className="g-3">
                    <Col lg={12}>
                        <Card className="shadow-sm border-0 h-100">
                            <CardBody className="p-4">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="fw-bold mb-0">
                                        <IconifyIcon icon="solar:list-bold-duotone" className="me-2 text-primary" />
                                        รายการผู้รับบริการล่าสุด (จาก API ภายนอก)
                                    </h5>
                                    <button className="btn btn-sm btn-soft-primary rounded-pill px-3" onClick={() => window.location.reload()}>
                                        <IconifyIcon icon="solar:refresh-bold" className="me-1" /> รีเฟรช
                                    </button>
                                </div>
                                
                                <div className="table-responsive">
                                    <Table hover className="align-middle mb-0">
                                        <thead className="bg-light-subtle">
                                            <tr>
                                                <th className="border-0">HN</th>
                                                <th className="border-0">ชื่อ-นามสกุล</th>
                                                <th className="border-0">เวลาตรวจ</th>
                                                <th className="border-0">สิทธิการรักษา</th>
                                                <th className="border-0">แผนก</th>
                                                <th className="border-0 text-center">สถานะ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={6} className="text-center py-5">
                                                        <Spinner animation="grow" variant="primary" />
                                                        <p className="mt-2 text-muted">กำลังดึงข้อมูลจาก API...</p>
                                                    </td>
                                                </tr>
                                            ) : visits.length > 0 ? (
                                                visits.map((v: any, i: number) => (
                                                    <tr key={i}>
                                                        <td>{v.hn || '-'}</td>
                                                        <td className="fw-medium">{v.fullname || v.patient_name || '-'}</td>
                                                        <td>{v.vsttime || '-'} น.</td>
                                                        <td><span className="badge bg-info-subtle text-info">{v.pttype_name || '-'}</span></td>
                                                        <td>{v.main_dep_name || '-'}</td>
                                                        <td className="text-center">
                                                            <span className="badge bg-success-subtle text-success rounded-pill">รับบริการแล้ว</span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="text-center py-5 text-muted">
                                                        <IconifyIcon icon="solar:document-text-bold-duotone" className="fs-48 mb-2 opacity-25" />
                                                        <p>ไม่พบข้อมูลผู้รับบริการในวันนี้</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        </MainLayout>
    );
};

export default HosinfoPage;
