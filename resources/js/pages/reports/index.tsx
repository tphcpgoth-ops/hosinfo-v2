import React from 'react';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardBody, Col, Row, Dropdown } from 'react-bootstrap';
import { router, Link } from '@inertiajs/react';
import { Grid } from 'gridjs-react';
import { html } from 'gridjs';

interface Category {
    id: number;
    rep_cat: string;
}

interface Report {
    repid: number;
    rep_name: string;
    catname: string;
    rep_update: string;
    rep_column: string;
}

interface ReportsPageProps {
    categories: Category[];
    reports: Report[];
    currentCategory: string;
}

const ReportsPage = ({ categories = [], reports = [], currentCategory = '' }: ReportsPageProps) => {
    
    const handleCategoryChange = (catId: string) => {
        router.get('/end-user-reports', { repcat: catId });
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <MainLayout>
            <PageTitle 
                title="รายงาน End User" 
                subTitle="HOSxP Data Processing" 
                rightContent={
                    <div className="d-flex align-items-center gap-2">
                        <span className="text-muted small">เลือกกลุ่มรายงาน:</span>
                        <Dropdown onSelect={(key) => handleCategoryChange(key || '')}>
                            <Dropdown.Toggle variant="outline-primary" size="sm" id="dropdown-reports-cat">
                                {categories.find(c => String(c.id) === currentCategory)?.rep_cat || 'ทั้งหมด'}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item eventKey="">ทั้งหมด</Dropdown.Item>
                                <Dropdown.Divider />
                                {categories.map((cat) => (
                                    <Dropdown.Item key={cat.id} eventKey={String(cat.id)}>
                                        {cat.rep_cat}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                } 
            />

            <Row>
                <Col md={12}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-light-subtle py-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <h4 className="card-title mb-0">
                                    <IconifyIcon icon="tabler:list" className="me-1" />
                                    รายการรายงานทั้งหมด ({reports.length})
                                </h4>
                            </div>
                        </Card.Header>
                        <CardBody>
                            <Grid
                                data={reports.map((report) => [
                                    report.rep_name,
                                    report.catname || 'ทั่วไป',
                                    formatDate(report.rep_update),
                                    report.repid,
                                ])}
                                columns={[
                                    {
                                        name: 'ชื่อรายงาน',
                                        width: '50%',
                                        formatter: (name) => html(`<span class="fw-medium text-dark">${name}</span>`)
                                    },
                                    {
                                        name: 'กลุ่มรายงาน',
                                        width: '20%',
                                    },
                                    {
                                        name: 'ปรับปรุงล่าสุด',
                                        width: '15%',
                                    },
                                    {
                                        name: 'ประมวลผล',
                                        width: '15%',
                                        formatter: (repid) => html(
                                            `<div class="text-center">
                                                <button 
                                                    class="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
                                                    onclick="window.__inertiaRouter.visit('/end-user-reports/details?id=${repid}')"
                                                >
                                                    <iconify-icon icon="tabler:player-play-filled" class="fs-14"></iconify-icon>
                                                    ทำรายงาน
                                                </button>
                                            </div>`
                                        )
                                    },
                                ]}
                                search={true}
                                pagination={{
                                    limit: 15,
                                }}
                                sort={true}
                                language={{
                                    'search': {
                                        'placeholder': 'ค้นหาชื่อรายงาน...'
                                    },
                                    'pagination': {
                                        'previous': 'ก่อนหน้า',
                                        'next': 'ถัดไป',
                                        'showing': 'แสดง',
                                        'results': () => 'รายการ'
                                    }
                                }}
                                className={{
                                    table: 'table table-hover align-middle mb-0',
                                    thead: 'bg-light text-muted fw-semibold',
                                    pagination: 'mt-3'
                                }}
                            />
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </MainLayout>
    );
};

export default ReportsPage;
