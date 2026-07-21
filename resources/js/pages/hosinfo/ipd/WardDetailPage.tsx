import { useEffect, useState } from 'react';
import { Card, CardBody, Col, Row, Spinner, Badge } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import axios from 'axios';

type WardDetailPageProps = {
    wardId: string;
    api_token: string;
    external_api_url: string;
    wards: any[];
};

const WardDetailPage = ({ wardId, api_token, external_api_url, wards }: WardDetailPageProps) => {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<any>(null);
    const [patients, setPatients] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const wardName = (wards || []).find((w: any) => w.ward === wardId)?.name || `ตึก ${wardId}`;

    const fetchData = async () => {
        try {
            setLoading(true);
            const apiUrl = external_api_url || 'http://127.0.0.1:8800';
            const headers = { Authorization: `Bearer ${api_token}` };

            const [summaryRes, patientsRes] = await Promise.all([
                axios.get(`${apiUrl}/api/v1/ward/${wardId}/summary`, { headers }),
                axios.get(`${apiUrl}/api/v1/ward/${wardId}/patients`, { headers })
            ]);

            setSummary(summaryRes.data.data);
            setPatients(patientsRes.data.data);
            setError(null);
        } catch (err: any) {
            console.error('API Error:', err);
            const msg = err.response?.data?.detail || err.message || 'ไม่สามารถเชื่อมต่อกับ API ได้';
            setError(`API Error: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (wardId) {
            fetchData();
        }
    }, [wardId]);

    const getIncomeColor = (income: number) => {
        if (income < 10000) return 'success';
        if (income <= 20000) return 'info';
        if (income <= 30000) return 'warning';
        return 'danger';
    };

    const getIncomeColorClass = (income: number) => {
        const color = getIncomeColor(income);
        if (color === 'info') return 'primary'; // Using primary for info to match legacy 'blue'
        return color;
    };

    const DateThaiShort = (dateStr: string) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`;
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    return (
        <div className="ward-detail-container">
            {/* Top Summary Section */}
            <Row className="mb-2">
                <Col md={6}>
                    <Card className="h-70 border-0 shadow-sm">
                        <CardBody className="d-flex flex-column justify-content-center align-items-center text-center p-4">
                            <div className="mb-4">
                                <span className="fs-18 fw-semibold text-dark">ค่าใช้จ่ายรวมทั้งตึก </span>
                                <span className="fs-24 fw-bold text-danger mx-2">
                                    {(summary?.sumincome || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                                <span className="fs-18 fw-semibold text-dark">บาท</span>
                            </div>
                            
                            <Row className="w-100 mt-2 text-start">
                                <Col sm={8} className="mx-auto">
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 py-2">
                                            ค่าใช้จ่าย {'>'} 30,000
                                            <Badge bg="danger" className="rounded-pill px-2 py-1">สีแดง</Badge>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 py-2">
                                            ค่าใช้จ่าย 20,000 - 30,000
                                            <Badge bg="warning" className="rounded-pill px-2 py-1">สีเหลือง</Badge>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 py-2">
                                            ค่าใช้จ่าย 10,000 - 20,000
                                            <Badge bg="primary" className="rounded-pill px-2 py-1">สีฟ้า</Badge>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 py-2">
                                            ค่าใช้จ่าย {'<'} 10,000
                                            <Badge bg="success" className="rounded-pill px-2 py-1">สีเขียว</Badge>
                                        </li>
                                    </ul>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card className="h-70 border-0 shadow-sm overflow-hidden">
                        <div className="bg-danger text-white p-4 d-flex align-items-center">
                            <div className="bg-white bg-opacity-25 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '70px', height: '70px' }}>
                                <IconifyIcon icon="tabler:bed" width="50" height="50" />
                            </div>
                            <div>
                                <h3 className="mb-1 fw-bold text-white">สรุปข้อมูล{wardName} วันนี้</h3>
                                <p className="mb-0 fs-15 text-white opacity-75">จำนวนเตียงทั้งหมด {summary?.bedcount || 0} เตียง</p>
                            </div>
                        </div>
                        <CardBody className="p-0">
                            <Row className="g-0">
                                <Col sm={6} className="border-end border-bottom">
                                    <div className="d-flex justify-content-between align-items-center p-2">
                                        <span className="fw-semibold text-dark">รับใหม่วันนี้</span>
                                        <Badge bg="danger" className="rounded-pill px-2 py-1 fs-12">{(summary?.admittoday || 0).toLocaleString()} เตียง</Badge>
                                    </div>
                                </Col>
                                <Col sm={6} className="border-bottom">
                                    <div className="d-flex justify-content-between align-items-center p-2">
                                        <span className="fw-semibold text-dark">ย้ายออก/รับย้ายวันนี้</span>
                                        <Badge bg="secondary" className="rounded-pill px-2 py-1 fs-12 text-white">{(summary?.movetoday || 0).toLocaleString()} ราย</Badge>
                                    </div>
                                </Col>
                                <Col sm={6} className="border-end border-bottom">
                                    <div className="d-flex justify-content-between align-items-center p-2">
                                        <span className="fw-semibold text-dark">จำหน่ายวันนี้</span>
                                        <Badge bg="warning" className="rounded-pill px-2 py-1 fs-12 text-dark">{(summary?.dchtoday || 0).toLocaleString()} เตียง</Badge>
                                    </div>
                                </Col>
                                <Col sm={6} className="border-bottom">
                                    <div className="d-flex justify-content-between align-items-center p-2">
                                        <span className="fw-semibold text-dark">ค่ายา+เวชภัณฑ์</span>
                                        <Badge bg="warning" className="rounded-pill px-2 py-1 fs-12 text-dark">{(summary?.inc05 || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} บาท</Badge>
                                    </div>
                                </Col>
                                <Col sm={6} className="border-end border-bottom">
                                    <div className="d-flex justify-content-between align-items-center p-2">
                                        <span className="fw-semibold text-dark">Admit อยู่</span>
                                        <Badge bg="primary" className="rounded-pill px-2 py-1 fs-12">{(summary?.wardn || 0).toLocaleString()} เตียง</Badge>
                                    </div>
                                </Col>
                                <Col sm={6} className="border-bottom">
                                    <div className="d-flex justify-content-between align-items-center p-2">
                                        <span className="fw-semibold text-dark">ค่าบริการทางการพยาบาล</span>
                                        <Badge bg="warning" className="rounded-pill px-2 py-1 fs-12 text-dark">{((summary?.inc09 || 0) + (summary?.inc12 || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })} บาท</Badge>
                                    </div>
                                </Col>
                                <Col sm={6} className="border-end">
                                    <div className="d-flex justify-content-between align-items-center p-2">
                                        <span className="fw-semibold text-dark">เตียงว่าง</span>
                                        <Badge bg="success" className="rounded-pill px-2 py-1 fs-12">{(summary?.wardnb || 0).toLocaleString()} เตียง</Badge>
                                    </div>
                                </Col>
                                <Col sm={6}>
                                    <div className="d-flex justify-content-between align-items-center p-2">
                                        <span className="fw-semibold text-dark">ค่าใช้จ่ายรวม</span>
                                        <Badge bg="danger" className="rounded-pill px-2 py-1 fs-12">{(summary?.sumincome || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} บาท</Badge>
                                    </div>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* Patient Cards Grid */}
            <Row>
                {patients.map((pt: any, index: number) => {
                    const topColorClass = getIncomeColorClass(pt.income || 0);
                    const isMale = pt.sex === '1';
                    const isChild = pt.age_y <= 15;
                    const genderIcon = isMale ? "tabler:gender-male" : "tabler:gender-female";
                    const genderColor = isMale ? "text-primary" : "text-danger";
                    
                    return (
                        <Col xl={3} md={4} sm={6} xs={12} key={index} className="mb-1">
                            <Card className={`h-80 shadow-sm border-0 border-top border-3 border-${topColorClass}`}>
                                <CardBody className="p-3">
                                    <div className="d-flex align-items-start mb-3">
                                        <div className="me-3">
                                            {pt.image ? (
                                                <img 
                                                    src={`data:image/jpeg;base64,${pt.image}`} 
                                                    className="rounded-circle" 
                                                    width="48" 
                                                    height="48" 
                                                    alt="Patient" 
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div className={`bg-light rounded-circle d-flex align-items-center justify-content-center ${genderColor}`} style={{ width: '48px', height: '48px' }}>
                                                    <IconifyIcon icon={isChild ? "tabler:mood-kid" : "tabler:user-filled"} className="fs-24" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-grow-1 overflow-hidden">
                                            <h5 className="mb-1 text-truncate fs-15 fw-bold text-dark">
                                                <IconifyIcon icon={genderIcon} className={`me-1 ${genderColor}`} />
                                                <a href="#!" className="text-dark">{pt.pname}{pt.fname} {pt.lname}</a>
                                            </h5>
                                            <p className="mb-0 fs-12 text-muted">Admit {DateThaiShort(pt.regdate)}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <div className="fs-13">
                                            <span className="text-muted">วันนอน </span>
                                            <span className={`badge ${pt.admdate > 30 ? 'bg-danger' : 'bg-secondary bg-opacity-25 text-dark'} rounded-pill px-2`}>{pt.admdate || 0}</span>
                                            <span className="text-muted ms-1">วัน</span>
                                        </div>
                                        <div>
                                            <span className="fs-13 fw-semibold text-primary">AN {pt.an}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <div className="fs-13">
                                            <span className="text-muted">ค่าใช้จ่าย </span>
                                            <Badge bg={topColorClass} className="rounded-pill px-2 mx-1">
                                                {(pt.income || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </Badge>
                                            <span className="text-muted">บาท</span>
                                        </div>
                                        <Badge bg="info" className="rounded-pill">เตียง {pt.bedno}</Badge>
                                    </div>
                                    
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <div className="fs-13 text-truncate w-75">
                                            <span className="text-muted">แพ้ยา : </span>
                                            {pt.drugallergy ? (
                                                <Badge bg="danger">{pt.drugallergy}</Badge>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </div>
                                        <div className="fs-13 text-primary text-end">
                                            อายุ {pt.age_y || 0} ปี
                                        </div>
                                    </div>
                                    
                                    <div className="fs-13 mt-2 text-truncate">
                                        <span className="text-muted">แพทย์ : </span>
                                        <a href="#!" className="fw-semibold text-primary">{pt.doctorname || '-'}</a>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    );
                })}
            </Row>
        </div>
    );
};

export default WardDetailPage;
