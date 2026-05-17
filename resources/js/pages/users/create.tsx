import PageTitle from '@/components/PageTitle';
import MainLayout from '@/layouts/MainLayout';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Form, ButtonGroup, ToggleButton } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import Select from 'react-select';

const CreateUserPage = () => {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'user',
        department_id: '',
        is_active: true,
    });

    const { departments } = usePage().props as any;
    const deptOptions = departments.map((dept: any) => ({
        value: dept.id,
        label: dept.dp_name,
    }));

    const roleOptions = [
        { value: 'admin', label: 'Admin' },
        { value: 'head', label: 'Head' },
        { value: 'user', label: 'User' },
        { value: 'guest', label: 'Guest' }
    ];

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('users.store'));
    };

    return (
        <MainLayout>
            <PageTitle title="เพิ่มผู้ใช้งาน" subTitle="ระบบจัดการ" />
            <Row className="justify-content-center">
                <Col lg={8}>
                    <Card>
                        <CardHeader className="border-bottom border-dashed">
                            <CardTitle as="h4" className="mb-0">ข้อมูลผู้ใช้งานใหม่</CardTitle>
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
                                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="example@mail.com"
                                        />
                                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                    </Col>

                                    <Col md={6}>
                                        <label className="form-label">หน่วยงาน/แผนก</label>
                                        <Select
                                            classNamePrefix="react-select"
                                            options={deptOptions}
                                            onChange={(opt: any) => setData('department_id', opt ? opt.value : '')}
                                            placeholder="ค้นหาหรือเลือกหน่วยงาน..."
                                            isClearable
                                        />
                                        {errors.department_id && <div className="text-danger fs-13 mt-1">{errors.department_id}</div>}
                                    </Col>

                                    <Col md={6}>
                                        <label className="form-label">บทบาท (Role)</label>
                                        <Select
                                            classNamePrefix="react-select"
                                            options={roleOptions}
                                            value={roleOptions.find(opt => opt.value === data.role)}
                                            onChange={(opt: any) => setData('role', opt ? opt.value : 'user')}
                                            placeholder="เลือกบทบาท..."
                                        />
                                        {errors.role && <div className="text-danger fs-13 mt-1">{errors.role}</div>}
                                    </Col>

                                    <Col md={6}>
                                        <label className="form-label">สถานะการใช้งาน</label>
                                        <div>
                                            <ButtonGroup>
                                                <ToggleButton
                                                    id="status-active"
                                                    type="radio"
                                                    variant={data.is_active === true ? 'success' : 'outline-success'}
                                                    name="is_active"
                                                    value="true"
                                                    checked={data.is_active === true}
                                                    onChange={() => setData('is_active', true)}
                                                >
                                                    เปิดใช้งาน
                                                </ToggleButton>
                                                <ToggleButton
                                                    id="status-inactive"
                                                    type="radio"
                                                    variant={data.is_active === false ? 'danger' : 'outline-danger'}
                                                    name="is_active"
                                                    value="false"
                                                    checked={data.is_active === false}
                                                    onChange={() => setData('is_active', false)}
                                                >
                                                    ปิดใช้งาน
                                                </ToggleButton>
                                            </ButtonGroup>
                                        </div>
                                        {errors.is_active && <div className="text-danger fs-13 mt-1">{errors.is_active}</div>}
                                    </Col>

                                    <Col md={6}>
                                        <label className="form-label">รหัสผ่าน</label>
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
                                        <label className="form-label">ยืนยันรหัสผ่าน</label>
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
                                            บันทึกข้อมูล
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

export default CreateUserPage;
