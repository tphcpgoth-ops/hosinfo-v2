import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import MainLayout from '@/layouts/MainLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { Button, Card, Col, Row } from 'react-bootstrap';
import Swal from 'sweetalert2';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Props {
    users: User[];
}

const UsersPage = ({ users }: Props) => {
    const { props } = usePage();
    const flash = props.flash as any;

    const handleDelete = (id: number, name: string) => {
        Swal.fire({
            title: 'คุณแน่ใจหรือไม่?',
            text: `ต้องการลบผู้ใช้ ${name} ใช่หรือไม่?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ใช่, ลบเลย!',
            cancelButtonText: 'ยกเลิก',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('users.destroy', id), {
                    onSuccess: () => {
                        Swal.fire('ลบสำเร็จ!', 'ผู้ใช้ถูกลบเรียบร้อยแล้ว.', 'success');
                    },
                });
            }
        });
    };

    return (
        <MainLayout>
            <PageTitle title="จัดการผู้ใช้งาน" subTitle="ระบบจัดการ" />
            <Row>
                <Col xs={12}>
                    <Card>
                        <div className="card-header d-flex align-items-center justify-content-between border-bottom border-light">
                            <h4 className="header-title">รายชื่อผู้ใช้งาน</h4>
                            <div>
                                <Link href={route('users.create')} className="btn btn-success bg-gradient">
                                    <IconifyIcon icon="tabler:plus" className="me-1" /> เพิ่มผู้ใช้งาน
                                </Link>
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="bg-light-subtle">
                                    <tr>
                                        <th style={{ width: 50 }}>#</th>
                                        <th>ชื่อ-นามสกุล</th>
                                        <th>อีเมล</th>
                                        <th>หน่วยงาน/แผนก</th>
                                        <th>บทบาท (Role)</th>
                                        <th className="text-center" style={{ width: 120 }}>
                                            จัดการ
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user, idx) => (
                                        <tr key={user.id}>
                                            <td>{idx + 1}</td>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>{(user as any).department?.dp_name || '-'}</td>
                                            <td>
                                                <span className={`badge bg-${
                                                    user.role === 'admin' ? 'danger' : 
                                                    user.role === 'head' ? 'primary' : 
                                                    user.role === 'user' ? 'success' : 'secondary'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="hstack gap-1 justify-content-center">
                                                    <Link href={route('users.edit', user.id)} className="btn btn-soft-success btn-sm btn-icon rounded-circle">
                                                        <IconifyIcon icon="tabler:edit" className="fs-16" />
                                                    </Link>
                                                    <Button 
                                                        variant="soft-danger" 
                                                        size="sm" 
                                                        className="btn-icon rounded-circle"
                                                        onClick={() => handleDelete(user.id, user.name)}
                                                    >
                                                        <IconifyIcon icon="tabler:trash" className="fs-16" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </Col>
            </Row>
        </MainLayout>
    );
};

export default UsersPage;
