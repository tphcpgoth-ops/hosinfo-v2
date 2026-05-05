import logoDark from '@/images/logo-dark.png';
import logoSm from '@/images/logo-sm.png';
import logo from '@/images/logo.png';

import { Link } from '@inertiajs/react';

const LogoBox = () => {
    return (
        <Link href="/" className="logo">
            <span className="logo-light">
                <span className="logo-lg">
                    <img src={logo} height={60} style={{ width: 'auto' }} alt="logo" />
                </span>
                <span className="logo-sm">
                    <img src={logoSm} width={21} height={20} alt="small logo" />
                </span>
            </span>
            <span className="logo-dark">
                <span className="logo-lg">
                    <img src={logoDark} height={60} style={{ width: 'auto' }} alt="dark logo" />
                </span>
                <span className="logo-sm">
                    <img src={logoSm} width={21} height={20} alt="small logo" />
                </span>
            </span>
        </Link>
    );
};

export default LogoBox;
