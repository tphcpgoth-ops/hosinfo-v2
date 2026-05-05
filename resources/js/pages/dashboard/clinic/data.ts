export type StatType = {
    title: string;
    icon: string;
    count: string;
    isLabel?: string;
    isDot?: boolean;
    details: {
        title: string;
        count: string;
    }[];
};

export const statData: StatType[] = [
    {
        title: 'ผู้ป่วยนอก',
        icon: 'tabler:stethoscope',
        count: '185',
        isDot: true,
        isLabel: 'Today',
        details: [
            {
                title: 'New Appointments',
                count: '125',
            },
            {
                title: 'Total Appointments',
                count: '89.5k',
            },
        ],
    },
    {
        title: 'ผู้ป่วยใน',
        icon: 'tabler:bed',
        count: '75.6K',
        details: [
            {
                title: 'New Patients',
                count: '61',
            },
            {
                title: 'Old Patients',
                count: '75.5K',
            },
        ],
    },
    {
        title: 'อุบัติเหตุและฉุกเฉิน',
        icon: 'tabler:car-crash',
        count: '195',
        isDot: true,
        isLabel: '14 Rooms available',
        details: [
            {
                title: 'General Rooms',
                count: '136',
            },
            {
                title: 'Private Rooms',
                count: '59',
            },
        ],
    },
    {
        title: 'รับ-ส่งต่อผู้ป่วย',
        icon: 'tabler:ambulance',
        count: '87',
        details: [
            {
                title: 'Refer In',
                count: '42',
            },
            {
                title: 'Refer Out',
                count: '45',
            },
        ],
    },
];
