import { MenuItemType } from '@/types/menu';

export const MENU_ITEMS: MenuItemType[] = [
    {
        key: 'dash',
        label: 'Dash',
        isTitle: true,
    },
    {
        key: 'clinic',
        label: 'หน้าหลัก',
        icon: 'tabler:building-hospital',
        url: '/',
        roles: ['admin', 'head', 'user', 'guest'],
    },
    {
        key: 'kpi',
        label: 'ตัวชี้วัด',
        icon: 'tabler:file-invoice',
        roles: ['admin', 'head', 'user'],
        children: [
            {
                key: 'kpis_summary',
                label: 'สรุปตัวชี้วัด',
                url: '/kpis/summary',
                parentKey: 'kpi',
            },
            {
                key: 'kpis',
                label: 'รายการตัวชี้วัด',
                url: '/kpis',
                parentKey: 'kpi',
            },
        ],
    },
    // {
    //     key: 'reports',
    //     label: 'รายงาน End User',
    //     icon: 'tabler:report',
    //     url: '/end-user-reports',
    //     roles: ['admin', 'head', 'user'],
    // },
    // {
    //     key: 'stats',
    //     label: 'ข้อมูลและสถิติ',
    //     icon: 'tabler:chart-bar',
    //     roles: ['admin', 'head', 'user'],
    //     children: [
    //         {
    //             key: 'stats_opd',
    //             label: 'ผู้รับบริการ',
    //             url: '/stats/opd',
    //             parentKey: 'stats',
    //         },
    //     ],
    // },
    {
        key: 'management',
        label: 'การจัดการ',
        isTitle: true,
        roles: ['admin'],
    },
    {
        key: 'users',
        label: 'จัดการผู้ใช้งาน',
        icon: 'tabler:users',
        url: '/users',
        roles: ['admin'],
    },
    {
        key: 'departments',
        label: 'จัดการหน่วยงาน/แผนก',
        icon: 'tabler:building-hospital',
        url: '/departments',
        roles: ['admin'],
    },
];

export const HORIZONTAL_MENU_ITEM: MenuItemType[] = [
    {
        key: 'dashboards',
        label: 'Dashboards',
        icon: 'tabler:dashboard',
        children: [
            {
                key: 'clinic',
                label: 'หน้าหลัก',
                url: '/',
                parentKey: 'dashboards',
            },
            {
                key: 'kpi',
                label: 'ตัวชี้วัด',
                parentKey: 'dashboards',
                roles: ['admin', 'head', 'user'],
                children: [
                    // {
                    //     key: 'kpis_summary',
                    //     label: 'สรุปตัวชี้วัด',
                    //     url: '/kpis/summary',
                    //     parentKey: 'kpi',
                    // },
                    {
                        key: 'kpis',
                        label: 'รายการตัวชี้วัด',
                        url: '/kpis',
                        parentKey: 'kpi',
                    },
                ],
            },
            // {
            //     key: 'reports',
            //     label: 'รายงาน End User',
            //     url: '/end-user-reports',
            //     parentKey: 'dashboards',
            //     roles: ['admin', 'head', 'user'],
            // },
        ],
    },
];
