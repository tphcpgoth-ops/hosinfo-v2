import FallbackLoading from '@/components/FallbackLoading';
import LogoBox from '@/components/LogoBox';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import SimpleBar from 'simplebar-react';
import { getMenuItems } from '@/helpers/menu';

import { useLayoutContext } from '@/context/useLayoutContext';
import coffeeImg from '@/images/coffee-cup.svg';
import { lazy, Suspense } from 'react';
import { Button } from 'react-bootstrap';
import HoverMenuToggle from './components/HoverMenuToggle';

const AppMenu = lazy(() => import('./components/AppMenu'));

const VerticalNavigationBar = () => {
    const { toggleBackdrop } = useLayoutContext();
    const menuItems = getMenuItems();
    return (
        <div className="sidenav-menu" id="leftside-menu-container">
            <LogoBox />
            <HoverMenuToggle />
            <button onClick={toggleBackdrop} className="button-close-fullsidebar">
                <span>
                    <IconifyIcon icon="tabler:x" className="align-middle" />
                </span>
            </button>
            <SimpleBar>
                <Suspense fallback={<FallbackLoading />}>
                    <AppMenu menuItems={menuItems} />

                    <div className="help-box text-center">
                        <img src={coffeeImg} height={90} alt="App Logo" />
                        <h5 className="mt-3 fw-semibold fs-16">HOS-info : Hospital Information</h5>
                        <p className="mb-3 text-muted">Version 2.0.0</p>
                    </div>
                    <div className="clearfix" />
                </Suspense>
            </SimpleBar>
        </div>
    );
};

export default VerticalNavigationBar;
