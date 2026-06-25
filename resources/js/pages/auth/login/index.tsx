import IconifyIcon from '@/components/wrappers/IconifyIcon';
import logoDark from '@/images/logo-dark.png';
import logo from '@/images/logo.png';
import providerIdIcon from '@/images/providerid-icon.webp';
import bg1 from '@/images/small/small-1.jpg';
import bg2 from '@/images/small/small-2.jpg';
import bg3 from '@/images/small/small-3.jpg';
import BaseLayout from '@/layouts/BaseLayout';

import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
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

const bgImages = [bg1, bg2, bg3];

const LoginPage = ({ canResetPassword }: LoginProps) => {
    const { name } = usePage().props as { name?: string };
    const envAppName = import.meta.env.VITE_APP_NAME;
    const appName = (envAppName && envAppName !== 'undefined' && envAppName !== '${APP_NAME}') 
        ? envAppName 
        : (name || 'HOS-info');

    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: true,
    });

    const [bgIndex, setBgIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setBgIndex((prev) => (prev + 1) % bgImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <BaseLayout>
            <Head title="Login" />
            <div className="auth-bg min-vh-100 w-100 overflow-hidden position-relative">
                {/* Background Slider */}
                {bgImages.map((img, idx) => (
                    <div 
                        key={idx}
                        className="position-absolute top-0 start-0 w-100 h-100"
                        style={{
                            backgroundImage: `url(${img})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            opacity: bgIndex === idx ? 1 : 0,
                            transition: 'opacity 1.5s ease-in-out',
                            zIndex: 0
                        }}
                    />
                ))}
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-black opacity-25" style={{ zIndex: 0 }} />

                <Row className="g-0 min-vh-100 position-relative z-1">
                    {/* Left Column: Floating Login Card */}
                    <Col lg={5} md={8} sm={10} className="d-flex flex-column justify-content-center p-4 mx-auto ms-lg-5">
                        <Card className="w-100 border-0 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: '450px', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
                            <div className="p-4 p-xxl-5 d-flex flex-column justify-content-center">
                                <div className="text-center mb-4 mt-auto">
                                    <Link href="/" className="auth-brand">
                                        <img src={logoDark} style={{ width: '80%', height: 'auto', maxHeight: '60px', objectFit: 'contain' }} alt="dark logo" className="logo-dark" />
                                        <img src={logo} style={{ width: '80%', height: 'auto', maxHeight: '60px', objectFit: 'contain' }} alt="logo light" className="logo-light" />
                                    </Link>
                                </div>
                                <h3 className="fw-semibold mb-3 text-center">เข้าสู่ระบบ</h3>
                                
                                <div className="d-grid mb-3">
                                    <Button as="a" href={route('moph.redirect')} variant="outline-success" className="d-flex justify-content-center align-items-center gap-2 mt-2">
                                        <img src={providerIdIcon} width="70" height="30" alt="ProviderID" style={{ borderRadius: '4px' }} />
                                        เข้าสู่ระบบด้วย ProviderID
                                    </Button>
                                </div>

                                <div className="d-flex align-items-center my-3">
                                    <hr className="flex-grow-1 m-0" />
                                    <span className="mx-3 text-muted fs-13 fw-semibold">หรือเข้าสู่ระบบด้วยอีเมล</span>
                                    <hr className="flex-grow-1 m-0" />
                                </div>

                                <form onSubmit={submit} className="text-start mb-4">
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

                                    <div className="d-flex justify-content-between mb-4">
                                        <FormCheck checked={data.remember} onChange={() => setData('remember', !data.remember)} label="จำฉันไว้" />
                                    </div>
                                    
                                    <div className="d-grid">
                                        <Button variant="primary" type="submit" disabled={processing} className="py-2">
                                            Login เข้าใช้งาน
                                        </Button>
                                    </div>
                                </form>

                                <div className="mt-auto pt-4 text-center">
                                    <p className="mb-0 text-muted fs-13">
                                        {currentYear} © {appName} - By{' '}
                                        <span className="fw-bold text-decoration-underline text-reset">Dr.GHOST</span>
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        </BaseLayout>
    );
};

export default LoginPage;
