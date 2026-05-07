import PageTitle from '@/components/PageTitle';
import MainLayout from '@/layouts/MainLayout';
import { Link, useForm } from '@inertiajs/react';
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Form } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const CreateDepartmentPage = () => {
    const { data, setData, post, processing, errors } = useForm({
        dp_name: '',
        dp_status: 1, // 1 for active, 0 for inactive
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('departments.store'));
    };

    return (
        <MainLayout>
            <PageTitle title="เพิ่มหน่วยงาน/แผนก" subTitle="ระบบจัดการ" />
            <Row className="justify-content-center">
                <Col lg={8}>
                    <Card>
                        <CardHeader className="border-bottom border-dashed">
                            <CardTitle as="h4" className="mb-0">ข้อมูลหน่วยงานใหม่</CardTitle>
                        </CardHeader>
                        <CardBody>
                            <form onSubmit={submit}>
                                <Row className="g-3">
                                    <Col md={12}>
                                        <label className="form-label">ชื่อหน่วยงาน/แผนก <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.dp_name ? 'is-invalid' : ''}`}
                                            value={data.dp_name}
                                            onChange={(e) => setData('dp_name', e.target.value)}
                                            placeholder="กรอกชื่อหน่วยงานหรือแผนก"
                                            required
                                        />
                                        {errors.dp_name && <div className="invalid-feedback">{errors.dp_name}</div>}
                                    </Col>

                                    <Col md={12}>
                                        <label className="form-label">สถานะ</label>
                                        <div>
                                            <Form.Check
                                                inline
                                                type="radio"
                                                id="status-active"
                                                label="เปิดใช้งาน"
                                                name="dp_status"
                                                checked={data.dp_status === 1}
                                                onChange={() => setData('dp_status', 1)}
                                            />
                                            <Form.Check
                                                inline
                                                type="radio"
                                                id="status-inactive"
                                                label="ปิดใช้งาน"
                                                name="dp_status"
                                                checked={data.dp_status === 0}
                                                onChange={() => setData('dp_status', 0)}
                                            />
                                        </div>
                                        {errors.dp_status && <div className="text-danger fs-13 mt-1">{errors.dp_status}</div>}
                                    </Col>

                                    <Col md={12} className="text-end mt-4">
                                        <Link href={route('departments.index')} className="btn btn-light me-2">
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

export default CreateDepartmentPage;
