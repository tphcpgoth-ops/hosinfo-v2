import PageTitle from '@/components/PageTitle';
import MainLayout from '@/layouts/MainLayout';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Form } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import Select from 'react-select';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    department_id: number | null;
    is_active: boolean;
}

interface Props {
    user: User;
    departments: any[];
}

const EditUserPage = ({ user, departments }: Props) => {
    const { auth } = usePage().props as any;
    const isSelf = auth.user?.id === user.id;

    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        role: user.role,
        department_id: user.department_id || '',
        password: '',
        password_confirmation: '',
        is_active: !!user.is_active,
    });

    const deptOptions = departments.map((dept: any) => ({
        value: dept.id,
        label: dept.dp_name,
    }));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('users.update', user.id));
    };

    return (
        <MainLayout>
            <PageTitle title={isSelf ? "ข้อมูลส่วนตัว" : "แก้ไขผู้ใช้งาน"} subTitle="ระบบจัดการ" />
            <Row className="justify-content-center">
                <Col lg={8}>
                    <Card>
                        <CardHeader className="border-bottom border-dashed">
                            <CardTitle as="h4" className="mb-0">
                                {isSelf ? "ข้อมูลส่วนตัวของฉัน" : `แก้ไขข้อมูลผู้ใช้งาน: ${user.name}`}
                            </CardTitle>
                        </CardHeader>
                        <CardBody>
                            <form onSubmit={submit}>
                                <Row className="g-3">
                                    <Col md={12}>
                                        <label className="form-label">ชื่อ-นามสกุล</label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="กรอกชื่อ-นามสกุล"
                                        />
                                        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                    </Col>

                                    <Col md={6}>
                                        <label className="form-label">อีเมล</label>
                                        <input
                                            type="email"
                                            className={`form-control ${errors.email ? 'is-invalid' : ''} ${isSelf && auth.user?.role !== 'admin' ? 'bg-light' : ''}`}
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="example@mail.com"
                                            readOnly={isSelf && auth.user?.role !== 'admin'}
                                        />
                                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                    </Col>

                                    <Col md={6}>
                                        <label className="form-label">หน่วยงาน/แผนก</label>
                                        <Select
                                            classNamePrefix="react-select"
                                            options={deptOptions}
                                            defaultValue={deptOptions.find(opt => opt.value === user.department_id)}
                                            onChange={(opt: any) => setData('department_id', opt ? opt.value : '')}
                                            placeholder="ค้นหาหรือเลือกหน่วยงาน..."
                                            isClearable={!(isSelf && auth.user?.role !== 'admin')}
                                            isDisabled={isSelf && auth.user?.role !== 'admin'}
                                        />
                                        {errors.department_id && <div className="text-danger fs-13 mt-1">{errors.department_id}</div>}
                                    </Col>

                                    <Col md={6}>
                                        <label className="form-label">บทบาท (Role)</label>
                                        <select
                                            className={`form-select ${errors.role ? 'is-invalid' : ''} ${isSelf && auth.user?.role !== 'admin' ? 'bg-light' : ''}`}
                                            value={data.role}
                                            onChange={(e) => setData('role', e.target.value)}
                                            disabled={isSelf && auth.user?.role !== 'admin'}
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="head">Head</option>
                                            <option value="user">User</option>
                                            <option value="guest">Guest</option>
                                        </select>
                                        {errors.role && <div className="invalid-feedback">{errors.role}</div>}
                                    </Col>

                                    <Col md={6}>
                                        <label className="form-label">สถานะการใช้งาน</label>
                                        <div>
                                            <Form.Check
                                                inline
                                                type="radio"
                                                id="status-active"
                                                label="เปิดใช้งาน"
                                                name="is_active"
                                                checked={data.is_active === true}
                                                onChange={() => setData('is_active', true)}
                                                disabled={auth.user?.role !== 'admin'}
                                            />
                                            <Form.Check
                                                inline
                                                type="radio"
                                                id="status-inactive"
                                                label="ปิดใช้งาน"
                                                name="is_active"
                                                checked={data.is_active === false}
                                                onChange={() => setData('is_active', false)}
                                                disabled={auth.user?.role !== 'admin'}
                                            />
                                        </div>
                                        {errors.is_active && <div className="text-danger fs-13 mt-1">{errors.is_active}</div>}
                                    </Col>

                                    <Col md={12}>
                                        <div className="alert alert-info py-2">
                                            <IconifyIcon icon="tabler:info-circle" className="me-1" />
                                            เว้นว่างรหัสผ่านไว้หากไม่ต้องการเปลี่ยน
                                        </div>
                                    </Col>

                                    <Col md={6}>
                                        <label className="form-label">รหัสผ่านใหม่ (ถ้ามี)</label>
                                        <input
                                            type="password"
                                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="อย่างน้อย 8 ตัวอักษร"
                                        />
                                        {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                                    </Col>

                                    <Col md={6}>
                                        <label className="form-label">ยืนยันรหัสผ่านใหม่</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            placeholder="กรอกรหัสผ่านอีกครั้ง"
                                        />
                                    </Col>

                                    <Col md={12} className="text-end mt-4">
                                        <Link href={route('users.index')} className="btn btn-light me-2">
                                            ยกเลิก
                                        </Link>
                                        <Button type="submit" variant="primary" disabled={processing}>
                                            <IconifyIcon icon="tabler:device-floppy" className="me-1" />
                                            อัปเดตข้อมูล
                                        </Button>
                                    </Col>
                                </Row>
                            </form>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </MainLayout>
    );
};

export default EditUserPage;
