import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { Link } from '@inertiajs/react';
import { Card, CardBody, CardHeader, Table } from 'react-bootstrap';

const AppointmentCard = ({ kpis = [] }: { kpis: any[] }) => {
    return (
        <Card className="shadow-sm border-0">
            <CardHeader className="bg-light-subtle d-flex justify-content-between align-items-center py-3">
                <h4 className="card-title mb-0 text-primary">
                    <IconifyIcon icon="solar:clipboard-list-bold-duotone" className="me-2 align-middle" />
                    รายการตัวชี้วัด (KPI Indicators)
                </h4>
            </CardHeader>
            <CardBody className="p-0">
                <div className="table-responsive">
                    <Table hover align="middle" className="mb-0">
                        <thead className="bg-light-subtle text-muted fw-semibold border-bottom">
                            <tr>
                                <th className="ps-3" style={{ width: '100px' }}>รหัส</th>
                                <th>ตัวชี้วัด</th>
                                <th style={{ width: '100px' }}>หน่วยวัด</th>
                                <th style={{ width: '150px' }}>เป้าหมาย</th>
                                <th className="text-center" style={{ width: '120px' }}>ผลงาน</th>
                                <th style={{ width: '150px' }}>ผู้รับผิดชอบ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {kpis.length > 0 ? (
                                kpis.map((kpi, idx) => (
                                    <tr key={idx}>
                                        <td className="ps-3 fw-medium text-muted">{kpi.kpi_code}</td>
                                        <td>
                                            <div className="text-wrap" style={{ minWidth: '250px' }}>
                                                <Link href={`/kpis/details?id=${kpi.id}`} className="text-dark fw-medium">
                                                    {kpi.kpi_name_th}
                                                </Link>
                                            </div>
                                        </td>
                                        <td>{kpi.unit || '-'}</td>
                                        <td>
                                            <span className="text-muted">
                                                {kpi.target_direction === 'up' ? '>= ' : '<= '} 
                                                {kpi.target_value || '0'} 
                                                <small className="ms-1">({kpi.target_direction === 'up' ? 'สูงดี' : 'ต่ำดี'})</small>
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <span className={`badge ${kpi.is_passed_mock ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'} fs-12 px-2 py-1 rounded-pill`}>
                                                <IconifyIcon 
                                                    icon={kpi.is_passed_mock ? 'solar:check-circle-bold' : 'solar:close-circle-bold'} 
                                                    className="me-1 align-middle" 
                                                />
                                                {kpi.actual_mock || '0.00'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="text-truncate" style={{ maxWidth: '150px' }} title={kpi.responsible_person}>
                                                {kpi.responsible_person || '-'}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-4 text-muted">ไม่พบข้อมูลตัวชี้วัด</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </CardBody>
        </Card>
    );
};

export default AppointmentCard;
