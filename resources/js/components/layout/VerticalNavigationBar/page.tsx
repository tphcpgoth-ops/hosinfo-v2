import FallbackLoading from '@/components/FallbackLoading';
import LogoBox from '@/components/LogoBox';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import SimpleBar from 'simplebar-react';
import { getMenuItems } from '@/helpers/menu';

import { useLayoutContext } from '@/context/useLayoutContext';
import hosinfoLogo from '@/images/HOS-info-logo.png';
import { lazy, Suspense, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import HoverMenuToggle from './components/HoverMenuToggle';
import { usePage } from '@inertiajs/react';

const AppMenu = lazy(() => import('./components/AppMenu'));

const VerticalNavigationBar = () => {
    const { toggleBackdrop } = useLayoutContext();
    const { wards } = usePage<any>().props;
    
    const menuItems = useMemo(() => {
        const baseMenu = JSON.parse(JSON.stringify(getMenuItems()));
        const statsMenu = baseMenu.find((m: any) => m.key === 'stats');
        
        if (statsMenu && wards && wards.length > 0) {
            const ipdIndex = statsMenu.children.findIndex((c: any) => c.key === 'stats_ipd');
            if (ipdIndex !== -1) {
                const wardMenu = {
                    key: 'stats_ipd_wards',
                    label: 'ตึกผู้ป่วยใน',
                    parentKey: 'stats',
                    roles: ['admin', 'head', 'user'],
                    children: wards.map((w: any) => ({
                        key: `ward_${w.ward}`,
                        label: w.name,
                        url: `/hosinfo/ipd?ward=${w.ward}`,
                        parentKey: 'stats_ipd_wards',
                        roles: ['admin', 'head', 'user']
                    }))
                };
                statsMenu.children.splice(ipdIndex + 1, 0, wardMenu);
            }
        }
        return baseMenu;
    }, [wards]);

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
                        <img src={hosinfoLogo} height={90} alt="HOS-info Logo" style={{ objectFit: 'contain', maxWidth: '80%' }} />
                        <h5 className="mt-3 fw-semibold fs-16">HOS-info : Hospital Information</h5>
                        <p className="mb-3 text-muted">Version 2.0</p>
                    </div>
                    <div className="clearfix" />
                </Suspense>
            </SimpleBar>
        </div>
    );
};

export default VerticalNavigationBar;
