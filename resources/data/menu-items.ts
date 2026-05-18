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
    },
    {
        key: 'hosinfo',
        label: 'Dashboard',
        icon: 'tabler:dashboard',
        url: '/hosinfo',
        // roles: ['admin', 'head', 'user'],
    },
    {
        key: 'stats',
        label: 'ข้อมูลและสถิติ',
        icon: 'tabler:chart-bar',
        // roles: ['admin', 'head', 'user'],
        children: [
            {
                key: 'stats_opd',
                label: 'ผู้รับบริการ (OPD)',
                url: '/hosinfo/opd',
                parentKey: 'stats',
            },
            {
                key: 'stats_ipd',
                label: 'ผู้รับบริการ (IPD)',
                url: '/hosinfo/ipd',
                parentKey: 'stats',
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

        {
        key: 'kpi',
        label: 'ตัวชี้วัด',
        icon: 'tabler:file-invoice',
        roles: ['admin', 'head', 'user'],
        children: [
            {
                key: 'kpis',
                label: 'จัดการตัวชี้วัด',
                url: '/kpis',
                parentKey: 'kpi',
                roles: ['admin', 'head', 'user'],
            },
            {
                key: 'kpis_summary',
                label: 'สรุปตัวชี้วัด',
                url: '/kpis/summary',
                parentKey: 'kpi',
                roles: ['admin', 'head', 'user'],
            },
            {
                key: 'kpis_monitoring',
                label: 'รายงานการติดตาม',
                url: '/kpis/monitoring',
                parentKey: 'kpi',
                roles: ['admin', 'head', 'user'],
            },
        ],
    },
    {
        key: 'hepatitis',
        label: 'คัดกรองไวรัสตับอักเสบ',
        icon: 'tabler:virus-search',
        roles: ['admin', 'head', 'user','guest'],
        children: [
            {
                key: 'hepatitis_summary',
                label: 'สรุปผลการรักษา',
                url: '/hepatitis/summary',
                parentKey: 'hepatitis',
                roles: ['admin', 'head', 'user','guest'],
            },
            {
                key: 'hepatitis_list',
                label: 'ข้อมูลการตรวจ',
                url: '/hepatitis',
                parentKey: 'hepatitis',
                roles: ['admin', 'head', 'user'],
            },
        ],
    },
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
                icon: 'tabler:building-hospital',
                url: '/',
            },
            {
                key: 'stats',
                label: 'ข้อมูลและสถิติ',
                icon: 'tabler:chart-bar',
                parentKey: 'dashboards',
                // roles: ['admin', 'head', 'user'],
                children: [
                    {
                        key: 'stats_opd',
                        label: 'ผู้รับบริการ (OPD)',
                        url: '/hosinfo/opd',
                        parentKey: 'stats',
                        // roles: ['admin', 'head', 'user'],
                    },
                    {
                        key: 'stats_ipd',
                        label: 'ผู้รับบริการ (IPD)',
                        url: '/hosinfo/ipd',
                        parentKey: 'stats',
                        // roles: ['admin', 'head', 'user'],
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
            {
                key: 'kpi',
                label: 'ตัวชี้วัด',
                icon: 'tabler:file-invoice',
                parentKey: 'dashboards',
                roles: ['admin', 'head', 'user'],
                children: [
                    {
                        key: 'kpis_summary',
                        label: 'สรุปตัวชี้วัด',
                        url: '/kpis/summary',
                        parentKey: 'kpi',
                        roles: ['admin', 'head', 'user'],
                    },
                    {
                        key: 'kpis',
                        label: 'จัดการตัวชี้วัด',
                        url: '/kpis',
                        parentKey: 'kpi',
                        roles: ['admin', 'head', 'user'],
                    },
                    {
                        key: 'kpis_monitoring',
                        label: 'รายงานการติดตาม',
                        url: '/kpis/monitoring',
                        parentKey: 'kpi',
                        roles: ['admin', 'head', 'user'],
                    },
                ],
            },

        ],
    },
];
