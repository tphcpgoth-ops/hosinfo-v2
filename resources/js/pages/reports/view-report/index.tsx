import React, { useState, useEffect } from 'react';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import MainLayout from '@/layouts/MainLayout';
import { Link } from '@inertiajs/react';
import { Button, Card, CardBody, CardHeader, Col, Row, Alert, Badge } from 'react-bootstrap';
import { Grid } from 'gridjs-react';
import { html } from 'gridjs';
import Swal from 'sweetalert2';
import axios from 'axios';
import { CraftFilter } from '../components/CraftFilterTypes';

interface Department {
    id: number;
    dp_name: string;
}

interface Report {
    id: number;
    rep_code: string;
    rep_name: string;
    department_id: number | null;
    rep_sql_query: string;
    rep_description: string | null;
    is_active: number;
    has_date_range?: number;
    default_date_range?: string | null;
    has_department?: number;
    has_spclty?: number;
    craft_filters?: CraftFilter[] | null;
    updated_at: string;
    department?: Department;
}

interface ViewReportProps {
    report: Report;
}

const ViewReportPage = ({ report }: ViewReportProps) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState<string>(todayStr);
    const [endDate, setEndDate] = useState<string>(todayStr);
    const [selectedDepcode, setSelectedDepcode] = useState<string>('');
    const [selectedSpclty, setSelectedSpclty] = useState<string>('');

    const craftFilters: CraftFilter[] =
        report.craft_filters && Array.isArray(report.craft_filters) ? report.craft_filters : [];

    const [craftParams, setCraftParams] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        craftFilters.forEach((filter) => {
            initial[filter.name] = filter.default_value || (filter.options[0]?.value ?? '');
        });
        return initial;
    });

    const [kskDepartments, setKskDepartments] = useState<Array<{ depcode: string; department: string }>>([]);
    const [spclties, setSpclties] = useState<Array<{ spclty: string; name: string }>>([]);
    const [loadingFilters, setLoadingFilters] = useState<boolean>(false);

    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<any[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [executionTime, setExecutionTime] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [perPage, setPerPage] = useState<number>(25);

    const hasDateRange = report.has_date_range === 1 || report.rep_sql_query.includes(':start_date') || report.rep_sql_query.includes(':end_date');
    const hasDepartment = report.has_department === 1 || report.rep_sql_query.includes(':department');
    const hasSpclty = report.has_spclty === 1 || report.rep_sql_query.includes(':spclty');
    const hasCraftFilters = craftFilters.length > 0;
    const hasAnyFilter = hasDateRange || hasDepartment || hasSpclty || hasCraftFilters;

    useEffect(() => {
        const loadMasterFilters = async () => {
            try {
                setLoadingFilters(true);
                const res = await axios.get('/end-user-reports/master-filters');
                if (res.data.success) {
                    setKskDepartments(res.data.kskdepartment || []);
                    setSpclties(res.data.spclty || []);
                }
            } catch (err) {
                console.error('Failed to load master filter options', err);
            } finally {
                setLoadingFilters(false);
            }
        };
        if (hasDepartment || hasSpclty) {
            loadMasterFilters();
        }
    }, [hasDepartment, hasSpclty]);

    const fetchReportData = async () => {
        setLoading(true);
        setErrorMessage(null);
        setExecutionTime(null);
        try {
            const payload: any = {};
            if (hasDateRange) {
                payload.start_date = startDate;
                payload.end_date = endDate;
            }
            if (hasDepartment) {
                payload.department = selectedDepcode;
            }
            if (hasSpclty) {
                payload.spclty = selectedSpclty;
            }
            if (hasCraftFilters) {
                payload.craft_params = craftParams;
            }
            const res = await axios.post(`/end-user-reports/${report.id}/execute`, payload);
            if (res.data.success) {
                setColumns(res.data.columns || []);
                setResults(res.data.results || []);
                setExecutionTime(res.data.execution_time ?? null);
            } else {
                setErrorMessage(res.data.message || 'ไม่สามารถดึงข้อมูลรายงานได้');
            }
        } catch (error: any) {
            let msg = error.response?.data?.message || error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ HOSxP';
            if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
                msg = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ (Network Error / Connection Refused) กรุณาตรวจสอบว่าเซิร์ฟเวอร์ Backend (hosxp-api-py314) เปิดทำงานอยู่ และลองใหม่อีกครั้ง';
            }
            setErrorMessage(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, [report.id]);

    const handleExportExcel = () => {
        if (!results || results.length === 0) {
            Swal.fire('แจ้งเตือน', 'ไม่พบข้อมูลสำหรับส่งออกไฟล์ Excel', 'warning');
            return;
        }

        try {
            const headerRow = columns
                .map((c) => `<th style="background-color:#f0f2f5; font-weight:bold; border:1px solid #ddd; padding:8px;">${c}</th>`)
                .join('');
            const bodyRows = results
                .map((row) => {
                    const cells = columns
                        .map((col) => {
                            const val = row[col] !== null && row[col] !== undefined ? String(row[col]) : '';
                            return `<td style="border:1px solid #ddd; padding:6px;">${val.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`;
                        })
                        .join('');
                    return `<tr>${cells}</tr>`;
                })
                .join('');

            const excelTemplate = `
                <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
                <head>
                    <!--[if gte mso 9]>
                    <xml>
                        <x:ExcelWorkbook>
                            <x:ExcelWorksheets>
                                <x:ExcelWorksheet>
                                    <x:Name>ReportData</x:Name>
                                    <x:WorksheetOptions>
                                        <x:DisplayGridlines/>
                                    </x:WorksheetOptions>
                                </x:ExcelWorksheet>
                            </x:ExcelWorksheets>
                        </x:ExcelWorkbook>
                    </xml>
                    <![endif]-->
                    <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
                </head>
                <body>
                    <table>
                        <thead><tr>${headerRow}</tr></thead>
                        <tbody>${bodyRows}</tbody>
                    </table>
                </body>
                </html>
            `;

            const blob = new Blob(['\uFEFF' + excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const fileName = `${report.rep_code ? report.rep_code + '_' : ''}${report.rep_name.replace(/[/\\?%*:|"<>]/g, '_')}_${new Date().toISOString().slice(0, 10)}.xls`;

            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            Swal.fire({
                title: 'ส่งออกสำเร็จ!',
                text: `ดาวน์โหลดไฟล์ "${fileName}" เรียบร้อยแล้ว`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error: any) {
            Swal.fire('เกิดข้อผิดพลาด!', 'ไม่สามารถสร้างไฟล์ Excel ได้: ' + error.message, 'error');
        }
    };

    const handleExportCSV = () => {
        if (!results || results.length === 0) {
            Swal.fire('แจ้งเตือน', 'ไม่พบข้อมูลสำหรับส่งออกไฟล์ CSV', 'warning');
            return;
        }

        try {
            const header = columns.map((c) => `"${c.replace(/"/g, '""')}"`).join(',');
            const rows = results.map((row) =>
                columns
                    .map((col) => {
                        const val = row[col] !== null && row[col] !== undefined ? String(row[col]) : '';
                        return `"${val.replace(/"/g, '""')}"`;
                    })
                    .join(',')
            );
            const csvData = [header, ...rows].join('\r\n');
            const blob = new Blob(['\uFEFF' + csvData], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const fileName = `${report.rep_code ? report.rep_code + '_' : ''}${report.rep_name.replace(/[/\\?%*:|"<>]/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;

            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            Swal.fire({
                title: 'ส่งออกสำเร็จ!',
                text: `ดาวน์โหลดไฟล์ "${fileName}" เรียบร้อยแล้ว`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error: any) {
            Swal.fire('เกิดข้อผิดพลาด!', 'ไม่สามารถสร้างไฟล์ CSV ได้: ' + error.message, 'error');
        }
    };

    return (
        <MainLayout>
            <PageTitle
                title={report.rep_name}
                subTitle="รายงาน End Users / ประมวลผลข้อมูล"
                rightContent={
                    <div className="d-flex align-items-center gap-2">
                        <Link href="/end-user-reports" className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1 shadow-sm">
                            <IconifyIcon icon="tabler:arrow-left" className="fs-16" /> ย้อนกลับ
                        </Link>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={fetchReportData}
                            disabled={loading}
                            className="d-inline-flex align-items-center gap-1 shadow-sm"
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                    กำลังดึงข้อมูล...
                                </>
                            ) : (
                                <>
                                    <IconifyIcon icon="tabler:refresh" className="fs-16" />
                                    ดึงข้อมูลล่าสุด (Refresh)
                                </>
                            )}
                        </Button>
                        <Button
                            variant="success"
                            size="sm"
                            onClick={handleExportExcel}
                            disabled={loading || !results || results.length === 0}
                            className="d-inline-flex align-items-center gap-1 shadow-sm"
                        >
                            <IconifyIcon icon="tabler:file-spreadsheet" className="fs-16" />
                            ส่งออก Excel (.xls)
                        </Button>
                        <Button
                            variant="outline-success"
                            size="sm"
                            onClick={handleExportCSV}
                            disabled={loading || !results || results.length === 0}
                            className="d-inline-flex align-items-center gap-1 shadow-sm"
                        >
                            <IconifyIcon icon="tabler:file-type-csv" className="fs-16" />
                            ส่งออก CSV
                        </Button>
                    </div>
                }
            />

            {hasAnyFilter && (
                <Card className="shadow-sm border-0 mb-3 bg-white border-start border-primary border-4">
                    <CardBody className="py-3">
                        <Row className="align-items-center g-3">
                            <Col xs={12} md="auto" className="d-flex align-items-center gap-2">
                                <IconifyIcon icon="tabler:filter" className="text-primary fs-24" />
                                <span className="fw-bold fs-15 text-dark">เงื่อนไขและตัวกรองรายงาน:</span>
                            </Col>

                            {/* Standard Filters: ช่วงวันที่ */}
                            {hasDateRange && (
                                <>
                                    <Col xs={12} sm={6} md={3}>
                                        <div className="input-group input-group-sm shadow-sm">
                                            <span className="input-group-text bg-light fw-medium">ตั้งแต่วันที่</span>
                                            <input
                                                type="date"
                                                className="form-control font-monospace"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                            />
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={6} md={3}>
                                        <div className="input-group input-group-sm shadow-sm">
                                            <span className="input-group-text bg-light fw-medium">ถึงวันที่</span>
                                            <input
                                                type="date"
                                                className="form-control font-monospace"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                            />
                                        </div>
                                    </Col>
                                </>
                            )}

                            {/* Standard Filters: ห้องตรวจ */}
                            {hasDepartment && (
                                <Col xs={12} sm={6} md={3}>
                                    <div className="input-group input-group-sm shadow-sm">
                                        <span className="input-group-text bg-light fw-medium">ห้องตรวจ</span>
                                        <select
                                            className="form-select fs-13"
                                            value={selectedDepcode}
                                            onChange={(e) => setSelectedDepcode(e.target.value)}
                                        >
                                            <option value="">-- ทั้งหมด (ทุกห้องตรวจ) --</option>
                                            {kskDepartments.map((dept) => (
                                                <option key={dept.depcode} value={dept.depcode}>
                                                    [{dept.depcode}] {dept.department}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </Col>
                            )}

                            {/* Standard Filters: แผนก/สาขา */}
                            {hasSpclty && (
                                <Col xs={12} sm={6} md={3}>
                                    <div className="input-group input-group-sm shadow-sm">
                                        <span className="input-group-text bg-light fw-medium">แผนก/สาขา</span>
                                        <select
                                            className="form-select fs-13"
                                            value={selectedSpclty}
                                            onChange={(e) => setSelectedSpclty(e.target.value)}
                                        >
                                            <option value="">-- ทั้งหมด (ทุกแผนก) --</option>
                                            {spclties.map((sp) => (
                                                <option key={sp.spclty} value={sp.spclty}>
                                                    [{sp.spclty}] {sp.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </Col>
                            )}

                            {/* Craft Query Filters: ตัวกรองแบบไดนามิก (Radio / Select) */}
                            {craftFilters.map((filter) => (
                                <React.Fragment key={filter.id}>
                                    {filter.type === 'radio' ? (
                                        <Col xs={12} sm={6} md="auto">
                                            <div className="d-flex align-items-center gap-1 border rounded p-1 px-2 bg-light shadow-sm">
                                                <span className="fs-12 fw-semibold text-secondary me-1 text-nowrap">
                                                    {filter.label}:
                                                </span>
                                                <div className="btn-group btn-group-sm" role="group">
                                                    {filter.options.map((opt, oIdx) => {
                                                        const isSelected =
                                                            (craftParams[filter.name] ?? filter.default_value) === opt.value;
                                                        return (
                                                            <button
                                                                key={oIdx}
                                                                type="button"
                                                                className={`btn btn-sm py-1 px-2 fs-12 ${
                                                                    isSelected
                                                                        ? 'btn-primary text-white fw-bold shadow-sm'
                                                                        : 'btn-outline-secondary bg-white'
                                                                }`}
                                                                onClick={() =>
                                                                    setCraftParams((prev) => ({
                                                                        ...prev,
                                                                        [filter.name]: opt.value,
                                                                    }))
                                                                }
                                                            >
                                                                {opt.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </Col>
                                    ) : (
                                        <Col xs={12} sm={6} md={3}>
                                            <div className="input-group input-group-sm shadow-sm">
                                                <span className="input-group-text bg-light fw-medium text-nowrap">
                                                    {filter.label}
                                                </span>
                                                <select
                                                    className="form-select fs-13"
                                                    value={craftParams[filter.name] ?? filter.default_value}
                                                    onChange={(e) =>
                                                        setCraftParams((prev) => ({
                                                            ...prev,
                                                            [filter.name]: e.target.value,
                                                        }))
                                                    }
                                                >
                                                    {filter.options.map((opt, oIdx) => (
                                                        <option key={oIdx} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </Col>
                                    )}
                                </React.Fragment>
                            ))}

                            <Col xs={12} md="auto" className="ms-auto">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={fetchReportData}
                                    disabled={loading || loadingFilters}
                                    className="d-inline-flex align-items-center gap-1 shadow-sm px-3"
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                            กำลังประมวลผล...
                                        </>
                                    ) : (
                                        <>
                                            <IconifyIcon icon="tabler:filter" className="fs-16" />
                                            ประมวลผลตามตัวกรอง
                                        </>
                                    )}
                                </Button>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            )}

            <Row className="g-3">
                <Col md={12}>
                    <Card className="shadow-sm border-0 mb-3 bg-light-subtle">
                        <CardBody className="py-3">
                            <Row className="align-items-center">
                                <Col lg={8}>
                                    <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                                        {report.rep_code && <span className="badge bg-primary fs-12 px-2 py-1">{report.rep_code}</span>}
                                        <span className="badge bg-info-subtle text-info fs-12 px-2 py-1 border border-info-subtle">
                                            หน่วยงานที่ขอ: {report.department?.dp_name || 'ทั่วไป / ทุกหน่วยงาน'}
                                        </span>
                                        <span className="text-muted fs-13">
                                            <IconifyIcon icon="tabler:clock" className="me-1" />
                                            ปรับปรุงเมื่อ {new Date(report.updated_at).toLocaleDateString('th-TH')}
                                        </span>
                                    </div>
                                    {report.rep_description ? (
                                        <p className="mb-0 text-muted fs-14 mt-2">
                                            <strong>เงื่อนไข / นิยามรายงาน:</strong> {report.rep_description}
                                        </p>
                                    ) : (
                                        <p className="mb-0 text-muted fs-13 italic mt-1">-- ไม่ระบุเงื่อนไขเพิ่มเติม --</p>
                                    )}
                                    {/* ป้ายแสดงเงื่อนไขการประมวลผลปัจจุบัน */}
                                    <div className="d-flex flex-wrap align-items-center gap-1 mt-2">
                                        <span className="fs-11 text-muted">เงื่อนไขที่ประมวลผล:</span>
                                        {hasDateRange && (
                                            <Badge bg="light" className="text-dark border font-monospace fs-11">
                                                วันที่: {startDate} ถึง {endDate}
                                            </Badge>
                                        )}
                                        {craftFilters.map((filter) => {
                                            const currentVal = craftParams[filter.name] ?? filter.default_value;
                                            const currentOpt = filter.options.find((o) => o.value === currentVal);
                                            return (
                                                <Badge key={filter.id} bg="primary-subtle" className="text-primary border border-primary-subtle fs-11">
                                                    {filter.label}: {currentOpt ? currentOpt.label : currentVal}
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                </Col>
                                <Col lg={4} className="text-lg-end mt-2 mt-lg-0">
                                    <div className="d-flex flex-column align-items-lg-end">
                                        <span className="text-muted fs-13">จำนวนรายการที่พบทั้งหมด</span>
                                        {loading ? (
                                            <span className="spinner-border spinner-border-sm text-primary mt-1" role="status" />
                                        ) : (
                                            <h3 className="mb-0 fw-bold text-primary">{results ? results.length.toLocaleString() : 0} รายการ</h3>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Col>

                <Col md={12}>
                    <Card className="shadow-sm border-0">
                        <CardHeader className="bg-white py-3 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
                            <h5 className="card-title mb-0 d-flex align-items-center">
                                <IconifyIcon icon="tabler:table" className="me-2 text-primary fs-20" />
                                ตารางผลลัพธ์ข้อมูลรายงาน {!loading && columns.length > 0 ? `(${columns.length} คอลัมน์)` : ''}
                            </h5>
                            {!loading && !errorMessage && results && results.length > 0 && (
                                <div className="d-flex align-items-center gap-3">
                                    {executionTime !== null && (
                                        <span className="badge bg-success-subtle text-success fs-12 border border-success-subtle px-2 py-1 d-flex align-items-center gap-1">
                                            <IconifyIcon icon="tabler:bolt" className="fs-14" />
                                            ใช้เวลาประมวลผล {executionTime} วินาที
                                        </span>
                                    )}
                                    <div className="d-flex align-items-center gap-1">
                                        <label className="fs-13 text-muted mb-0 text-nowrap">แสดงหน้าละ:</label>
                                        <select
                                            className="form-select form-select-sm"
                                            style={{ width: '80px' }}
                                            value={perPage}
                                            onChange={(e) => setPerPage(Number(e.target.value))}
                                        >
                                            <option value={20}>20</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                            <option value={500}>500</option>
                                        </select>
                                        <span className="fs-13 text-muted text-nowrap">รายการ</span>
                                    </div>
                                </div>
                            )}
                        </CardHeader>
                        <CardBody>
                            {loading ? (
                                <div className="text-center py-5 my-4">
                                    <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <h5 className="fw-semibold text-dark mb-1">กำลังประมวลผลคำสั่ง SQL จาก HOSxP...</h5>
                                    <p className="text-muted small mb-0">ระบบกำลังดึงและจัดรูปแบบข้อมูล อาจใช้เวลาไม่กี่วินาทีขึ้นอยู่กับปริมาณข้อมูล</p>
                                </div>
                            ) : errorMessage ? (
                                <Alert variant="danger" className="my-3">
                                    <div className="d-flex align-items-start gap-2">
                                        <IconifyIcon icon="tabler:alert-circle" className="fs-24 mt-1" />
                                        <div>
                                            <h6 className="fw-bold mb-1">ไม่สามารถประมวลผลรายงานจากฐานข้อมูล HOSxP ได้</h6>
                                            <p className="mb-0 font-monospace fs-13">{errorMessage}</p>
                                        </div>
                                    </div>
                                </Alert>
                            ) : !results || results.length === 0 ? (
                                <div className="text-center py-5">
                                    <IconifyIcon icon="tabler:database-off" className="fs-48 text-muted mb-2" />
                                    <h5 className="text-muted fw-normal">ไม่พบรายการข้อมูลในเงื่อนไขที่กำหนด</h5>
                                    <p className="text-muted small mb-0">ระบบประมวลผลคำสั่ง SQL เรียบร้อยแล้ว แต่ไม่มีข้อมูลในตาราง</p>
                                </div>
                            ) : (
                                <div className="report-table-container">
                                    <Grid
                                        key={perPage}
                                        data={results.map((row) =>
                                            columns.map((col) => {
                                                const val = row[col];
                                                return val !== null && val !== undefined ? String(val) : '';
                                            })
                                        )}
                                        columns={columns.map((colName) => ({
                                            name: colName,
                                            formatter: (cellVal) => {
                                                if (cellVal === '' || cellVal === null || cellVal === undefined) {
                                                    return html(`<span class="text-muted italic">-</span>`);
                                                }
                                                return cellVal;
                                            },
                                        }))}
                                        search={true}
                                        pagination={{
                                            limit: perPage,
                                        }}
                                        sort={true}
                                        language={{
                                            search: {
                                                placeholder: 'ค้นหาในตารางผลลัพธ์...',
                                            },
                                            pagination: {
                                                previous: 'ก่อนหน้า',
                                                next: 'ถัดไป',
                                                showing: 'แสดง',
                                                results: () => 'รายการ',
                                            },
                                        }}
                                        className={{
                                            table: 'table table-hover align-middle mb-0 table-sm fs-13 text-nowrap',
                                            thead: 'bg-light text-muted fw-semibold',
                                            pagination: 'mt-3',
                                        }}
                                    />
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </MainLayout>
    );
};

export default ViewReportPage;
