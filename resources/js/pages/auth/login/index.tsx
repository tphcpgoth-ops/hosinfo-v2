import IconifyIcon from '@/components/wrappers/IconifyIcon';
import logoDark from '@/images/logo-dark.png';
import logo from '@/images/logo.png';
import BaseLayout from '@/layouts/BaseLayout';

import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Button, Card, Col, FormCheck, FormControl, FormGroup, FormLabel, Row } from 'react-bootstrap';

import { currentYear, developedBy } from '@/context/constants';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

const LoginPage = ({ canResetPassword }: LoginProps) => {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <BaseLayout>
            <Head title="Login" />
            <div className="auth-bg d-flex min-vh-100 justify-content-center align-items-center">
                <Row className="g-0 justify-content-center w-100 m-xxl-5 px-xxl-4 m-3">
                    <Col xl={4} lg={5} md={6}>
                        <Card className="overflow-hidden text-center h-100 p-xxl-4 p-3 mb-0">
                            <Link href="/" className="auth-brand mb-3">
                                <img src={logoDark} alt="dark logo" height={24} className="logo-dark" />
                                <img src={logo} alt="logo light" height={24} className="logo-light" />
                            </Link>
                            <h3 className="fw-semibold mb-2">เข้าสู่ระบบ</h3>
                            <p className="text-muted mb-4">กรุณากรอกอีเมลและรหัสผ่านเพื่อเข้าสู่ระบบ</p>
                            <div className="d-grid mb-3">
                                <Button as="a" href={route('thaid.redirect')} variant="success" className="d-flex justify-content-center align-items-center gap-2">
                                    <IconifyIcon icon="tabler:fingerprint" width="20" height="20" />
                                    เข้าสู่ระบบด้วย ThaiD
                                </Button>
                                <Button as="a" href={route('moph.redirect')} variant="primary" className="d-flex justify-content-center align-items-center gap-2 mt-2">
                                    <IconifyIcon icon="tabler:id-badge-2" width="20" height="20" />
                                    เข้าสู่ระบบด้วย ProviderID
                                </Button>
                            </div>
                            <p className="fs-13 fw-semibold">หรือเข้าสู่ระบบด้วยอีเมล</p>

                            <form onSubmit={submit} className="text-start mb-3">
                                <FormGroup className="mb-3">
                                    <FormLabel>อีเมล</FormLabel>
                                    <FormControl
                                        type="email"
                                        placeholder="กรุณากรอกอีเมล"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    {errors.email && <p className="text-danger">{errors.email}</p>}
                                </FormGroup>

                                <FormGroup className="mb-3">
                                    <FormLabel>รหัสผ่าน</FormLabel>
                                    <FormControl
                                        type="password"
                                        placeholder="กรุณากรอกรหัสผ่าน"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    {errors.password && <p className="text-danger">{errors.password}</p>}
                                </FormGroup>

                                <div className="d-flex justify-content-between mb-3">
                                    <FormCheck checked={data.remember} onChange={() => setData('remember', !data.remember)} label="จำฉันไว้" />

                                    {/* {canResetPassword && (
                                        <Link href={route('password.request')} className="text-muted border-bottom border-dashed">
                                            Forgot Password?
                                        </Link>
                                    )} */}
                                </div>
                                <div className="d-grid">
                                    <Button variant="primary" type="submit" disabled={processing}>
                                        Login เข้าใช้งาน
                                    </Button>
                                </div>
                            </form>


                            <p className="mt-auto mb-0">
                                {currentYear} © {import.meta.env.VITE_APP_NAME} - By{' '}
                                <span className="fw-bold text-decoration-underline text-reset fs-12">Dr.GHOST</span>
                            </p>
                        </Card>
                    </Col>
                </Row>
            </div>
        </BaseLayout>
    );
};

export default LoginPage;
