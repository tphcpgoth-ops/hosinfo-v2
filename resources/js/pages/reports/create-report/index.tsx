import React, { useState, useRef, useEffect } from 'react';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import MainLayout from '@/layouts/MainLayout';
import { Link, useForm } from '@inertiajs/react';
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Table, Alert, Spinner, Badge } from 'react-bootstrap';
import Swal from 'sweetalert2';
import axios from 'axios';
import Select from 'react-select';
import { CraftFilter } from '../components/CraftFilterTypes';
import CraftFilterBuilder from '../components/CraftFilterBuilder';

interface Department {
    id: number;
    dp_name: string;
}

interface CreateReportProps {
    departments: Department[];
}

const CreateReportPage = ({ departments = [] }: CreateReportProps) => {
    const deptOptions = [
        { value: '', label: '-- ไม่ระบุ (รายงานทั่วไป / ทุกหน่วยงาน) --' },
        ...departments.map((dept) => ({
            value: String(dept.id),
            label: dept.dp_name,
        })),
    ];

    const { data, setData, post, processing, errors } = useForm({
        rep_code: '',
        rep_name: '',
        department_id: '',
        rep_sql_query: '',
        rep_description: '',
        is_active: 1,
        has_date_range: 0,
        default_date_range: 'today',
        has_department: 0,
        has_spclty: 0,
        craft_filters: [] as CraftFilter[],
    });

    const sqlTextareaRef = useRef<HTMLTextAreaElement>(null);
    const [testCraftParams, setTestCraftParams] = useState<Record<string, string>>({});
    const [testing, setTesting] = useState(false);
    const [previewData, setPreviewData] = useState<{
        columns: string[];
        rows: any[];
        total: number;
    } | null>(null);
    const [testError, setTestError] = useState<string | null>(null);

    // ซิงค์ค่า default ของ craft_filters ไปยัง testCraftParams
    useEffect(() => {
        setTestCraftParams((prev) => {
            const next = { ...prev };
            data.craft_filters.forEach((filter) => {
                if (next[filter.name] === undefined) {
                    next[filter.name] = filter.default_value || (filter.options[0]?.value ?? '');
                }
            });
            return next;
        });
    }, [data.craft_filters]);

    // ฟังก์ชันแทรกแท็กตัวแปรลงในตำแหน่งเคอร์เซอร์ของ SQL textarea
    const insertTag = (tagName: string) => {
        const tag = tagName.startsWith(':') ? tagName : `{{${tagName}}}`;
        if (!sqlTextareaRef.current) {
            setData('rep_sql_query', (data.rep_sql_query ? data.rep_sql_query + ' ' : '') + tag);
            return;
        }
        const textarea = sqlTextareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentVal = data.rep_sql_query;
        const newVal = currentVal.substring(0, start) + tag + currentVal.substring(end);
        setData('rep_sql_query', newVal);
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + tag.length, start + tag.length);
        }, 0);
    };

    const handleTestQuery = async () => {
        if (!data.rep_sql_query.trim()) {
            Swal.fire('แจ้งเตือน', 'กรุณากรอกคำสั่ง SQL Query ก่อนทำการทดสอบ', 'warning');
            return;
        }

        setTesting(true);
        setTestError(null);
        setPreviewData(null);

        try {
            const todayStr = new Date().toISOString().split('T')[0];
            const response = await axios.post('/end-user-reports/test-query', {
                query: data.rep_sql_query,
                craft_filters: data.craft_filters,
                craft_params: testCraftParams,
                params: {
                    start_date: todayStr,
                    end_date: todayStr,
                    department: '',
                    spclty: '',
                },
            });

            if (response.data.success) {
                setPreviewData({
                    columns: response.data.columns || [],
                    rows: response.data.preview_rows || [],
                    total: response.data.total_rows || 0,
                });
                Swal.fire({
                    title: 'ทดสอบสำเร็จ!',
                    text: `พบข้อมูลทั้งหมด ${response.data.total_rows} แถว (แสดงตัวอย่างสูงสุด 10 แถว)`,
                    icon: 'success',
                    timer: 2000,
                });
            }
        } catch (error: any) {
            let errorMsg = error.response?.data?.message || error.message || 'เกิดข้อผิดพลาดในการรัน Query';
            if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
                errorMsg = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ (Network Error / Connection Refused) กรุณาตรวจสอบว่าเซิร์ฟเวอร์ Backend (hosxp-api-py314) เปิดทำงานอยู่';
            }
            setTestError(errorMsg);
            Swal.fire('ทดสอบไม่ผ่าน!', errorMsg, 'error');
        } finally {
            setTesting(false);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/end-user-reports', {
            onSuccess: () => {
                Swal.fire({
                    title: 'สำเร็จ!',
                    text: 'บันทึกรายงาน End User ใหม่เรียบร้อยแล้ว',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                });
            },
        });
    };

    return (
        <MainLayout>
            <PageTitle title="เพิ่มรายงาน End User ใหม่" subTitle="ระบบจัดการรายงาน" />

            <Row className="justify-content-center">
                <Col lg={12}>
                    <form onSubmit={submit}>
                        <Row className="g-3">
                            <Col lg={5} className="d-flex flex-column gap-3">
                                {/* การ์ดข้อมูลทั่วไป */}
                                <Card className="shadow-sm border-0">
                                    <CardHeader className="bg-light-subtle py-3 border-bottom border-dashed">
                                        <CardTitle as="h5" className="mb-0 d-flex align-items-center">
                                            <IconifyIcon icon="tabler:file-info" className="me-2 text-primary fs-18" />
                                            ข้อมูลทั่วไปของรายงาน
                                        </CardTitle>
                                    </CardHeader>
                                    <CardBody>
                                        <div className="mb-3">
                                            <label className="form-label">
                                                ชื่อรายงาน <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control ${errors.rep_name ? 'is-invalid' : ''}`}
                                                value={data.rep_name}
                                                onChange={(e) => setData('rep_name', e.target.value)}
                                                placeholder="ระบุชื่อรายงาน เช่น สถิติผู้ป่วยนอกแยกรหัสโรค..."
                                                required
                                            />
                                            {errors.rep_name && <div className="invalid-feedback">{errors.rep_name}</div>}
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">รหัสรายงาน (ถ้ามี / ปล่อยว่างเพื่อสร้างอัตโนมัติ)</label>
                                            <input
                                                type="text"
                                                className={`form-control ${errors.rep_code ? 'is-invalid' : ''}`}
                                                value={data.rep_code}
                                                onChange={(e) => setData('rep_code', e.target.value)}
                                                placeholder="เช่น REP-2026-001"
                                            />
                                            {errors.rep_code && <div className="invalid-feedback">{errors.rep_code}</div>}
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">เลือกหน่วยงานที่ขอรายงาน</label>
                                            <Select
                                                classNamePrefix="react-select"
                                                options={deptOptions}
                                                value={deptOptions.find(opt => opt.value === String(data.department_id)) || deptOptions[0]}
                                                onChange={(opt: any) => setData('department_id', opt ? opt.value : '')}
                                                placeholder="ค้นหาหรือเลือกหน่วยงาน..."
                                                isClearable
                                            />
                                            {errors.department_id && <div className="invalid-feedback d-block">{errors.department_id}</div>}
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">คำอธิบาย / นิยาม / เงื่อนไขรายงาน</label>
                                            <textarea
                                                className={`form-control ${errors.rep_description ? 'is-invalid' : ''}`}
                                                rows={3}
                                                value={data.rep_description}
                                                onChange={(e) => setData('rep_description', e.target.value)}
                                                placeholder="อธิบายเงื่อนไขการดึงข้อมูล หรือข้อแนะนำในการอ่านรายงาน..."
                                            />
                                            {errors.rep_description && <div className="invalid-feedback">{errors.rep_description}</div>}
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label d-block">สถานะการใช้งาน</label>
                                            <div className="form-check form-switch fs-15">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    role="switch"
                                                    id="is_active_switch"
                                                    checked={data.is_active === 1}
                                                    onChange={(e) => setData('is_active', e.target.checked ? 1 : 0)}
                                                />
                                                <label className="form-check-label" htmlFor="is_active_switch">
                                                    {data.is_active === 1 ? (
                                                        <span className="badge bg-success-subtle text-success">เปิดใช้งานทันที</span>
                                                    ) : (
                                                        <span className="badge bg-danger-subtle text-danger">ปิดใช้งานชั่วคราว</span>
                                                    )}
                                                </label>
                                            </div>
                                        </div>

                                        <div className="mb-2 pt-3 border-top border-dashed">
                                            <label className="form-label d-block text-primary fw-bold mb-2">
                                                <IconifyIcon icon="tabler:filter" className="me-1 fs-18" />
                                                ตั้งค่าตัวกรองข้อมูลมาตรฐาน (Standard Parameters)
                                            </label>

                                            {/* Date Range Switch */}
                                            <div className="form-check form-switch fs-14 mb-2">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    role="switch"
                                                    id="has_date_range_switch"
                                                    checked={data.has_date_range === 1}
                                                    onChange={(e) => setData('has_date_range', e.target.checked ? 1 : 0)}
                                                />
                                                <label className="form-check-label" htmlFor="has_date_range_switch">
                                                    เปิดใช้งานช่วงวันที่ (<code className="text-danger">:start_date</code> และ <code className="text-danger">:end_date</code>)
                                                </label>
                                            </div>

                                            {/* Department Switch */}
                                            <div className="form-check form-switch fs-14 mb-2">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    role="switch"
                                                    id="has_department_switch"
                                                    checked={data.has_department === 1}
                                                    onChange={(e) => setData('has_department', e.target.checked ? 1 : 0)}
                                                />
                                                <label className="form-check-label" htmlFor="has_department_switch">
                                                    เปิดใช้งานเลือกห้องตรวจ (<code className="text-danger">:department</code> จากตาราง kskdepartment)
                                                </label>
                                            </div>

                                            {/* Specialty Switch */}
                                            <div className="form-check form-switch fs-14 mb-2">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    role="switch"
                                                    id="has_spclty_switch"
                                                    checked={data.has_spclty === 1}
                                                    onChange={(e) => setData('has_spclty', e.target.checked ? 1 : 0)}
                                                />
                                                <label className="form-check-label" htmlFor="has_spclty_switch">
                                                    เปิดใช้งานเลือกแผนก/สาขาการรักษา (<code className="text-danger">:spclty</code> จากตาราง spclty)
                                                </label>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>

                                {/* การ์ดตัวกรองปรับแต่ง SQL (Craft Query Filters) */}
                                <Card className="shadow-sm border-0">
                                    <CardHeader className="bg-light-subtle py-3 border-bottom border-dashed">
                                        <CardTitle as="h5" className="mb-0 d-flex align-items-center">
                                            <IconifyIcon icon="tabler:adjustments-horizontal" className="me-2 text-primary fs-18" />
                                            ตัวกรองปรับแต่ง SQL (Craft Query Filters)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardBody>
                                        <CraftFilterBuilder
                                            filters={data.craft_filters}
                                            onChange={(updated) => setData('craft_filters', updated)}
                                            onInsertTag={insertTag}
                                        />
                                    </CardBody>
                                </Card>

                                {/* ปุ่มบันทึกและยกเลิก */}
                                <div className="d-flex justify-content-end gap-2 pt-2">
                                    <Link href="/end-user-reports" className="btn btn-light shadow-sm">
                                        ยกเลิก
                                    </Link>
                                    <Button type="submit" variant="primary" disabled={processing || testing} className="shadow-sm">
                                        <IconifyIcon icon="tabler:device-floppy" className="me-1" />
                                        บันทึกรายงานใหม่
                                    </Button>
                                </div>
                            </Col>

                            <Col lg={7}>
                                <Card className="shadow-sm border-0 h-100">
                                    <CardHeader className="bg-light-subtle py-3 border-bottom border-dashed d-flex justify-content-between align-items-center">
                                        <CardTitle as="h5" className="mb-0 d-flex align-items-center">
                                            <IconifyIcon icon="tabler:database-code" className="me-2 text-primary fs-18" />
                                            คำสั่ง SQL Query (ประมวลผลกับฐาน HOSxP)
                                        </CardTitle>
                                        <Button
                                            variant="info"
                                            size="sm"
                                            onClick={handleTestQuery}
                                            disabled={testing || !data.rep_sql_query.trim()}
                                            className="d-flex align-items-center gap-1 text-white shadow-sm"
                                        >
                                            {testing ? (
                                                <>
                                                    <Spinner size="sm" animation="border" /> กำลังทดสอบ...
                                                </>
                                            ) : (
                                                <>
                                                    <IconifyIcon icon="tabler:player-play" className="fs-16" /> ทดสอบ Query & Preview
                                                </>
                                            )}
                                        </Button>
                                    </CardHeader>
                                    <CardBody className="d-flex flex-column">
                                        {/* แถบแท็กตัวแปรสำหรับคลิกแทรกลงในคำสั่ง SQL ได้ทันที */}
                                        <div className="mb-2 p-2 bg-light-subtle border rounded d-flex flex-wrap align-items-center gap-1">
                                            <span className="fs-11 text-muted fw-bold me-1">
                                                <IconifyIcon icon="tabler:cursor-text" className="me-1" /> คลิกเพื่อแทรกแท็ก:
                                            </span>
                                            {data.has_date_range === 1 && (
                                                <>
                                                    <Button
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        className="btn-xs py-0 px-2 font-monospace fs-11"
                                                        onClick={() => insertTag(':start_date')}
                                                    >
                                                        + :start_date
                                                    </Button>
                                                    <Button
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        className="btn-xs py-0 px-2 font-monospace fs-11"
                                                        onClick={() => insertTag(':end_date')}
                                                    >
                                                        + :end_date
                                                    </Button>
                                                </>
                                            )}
                                            {data.has_department === 1 && (
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    className="btn-xs py-0 px-2 font-monospace fs-11"
                                                    onClick={() => insertTag(':department')}
                                                >
                                                    + :department
                                                </Button>
                                            )}
                                            {data.has_spclty === 1 && (
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    className="btn-xs py-0 px-2 font-monospace fs-11"
                                                    onClick={() => insertTag(':spclty')}
                                                >
                                                    + :spclty
                                                </Button>
                                            )}
                                            {data.craft_filters.map((filter) => (
                                                <Button
                                                    key={filter.id}
                                                    variant="outline-warning"
                                                    size="sm"
                                                    className="btn-xs py-0 px-2 font-monospace fs-11 text-dark bg-warning-subtle border-warning"
                                                    onClick={() => insertTag(filter.name)}
                                                    title={`คลิกเพื่อแทรก {{${filter.name}}}`}
                                                >
                                                    + {`{{${filter.name}}}`}
                                                </Button>
                                            ))}
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label d-flex justify-content-between">
                                                <span>
                                                    SQL Query (<code className="text-primary">SELECT ... ONLY</code>) <span className="text-danger">*</span>
                                                </span>
                                                <span className="text-muted small">ใช้แท็ก {`{{variable}}`} สำหรับแทนที่ชิ้นส่วนคำสั่ง</span>
                                            </label>
                                            <textarea
                                                ref={sqlTextareaRef}
                                                className={`form-control font-monospace fs-13 ${errors.rep_sql_query ? 'is-invalid' : ''}`}
                                                rows={12}
                                                style={{ backgroundColor: '#2b303b', color: '#c0c5ce' }}
                                                value={data.rep_sql_query}
                                                onChange={(e) => setData('rep_sql_query', e.target.value)}
                                                placeholder={`SELECT \n  vstdate,\n  hn,\n  vn\nFROM vn_stat\nWHERE vstdate BETWEEN :start_date AND :end_date\n  {{opdipd}}\nORDER BY vstdate DESC\nLIMIT 100`}
                                                required
                                            />
                                            {errors.rep_sql_query && <div className="invalid-feedback d-block mt-1">{errors.rep_sql_query}</div>}
                                            <div className="form-text mt-1 text-muted">
                                                <IconifyIcon icon="tabler:shield-check" className="text-success me-1" />
                                                ระบบป้องกันความปลอดภัยอนุญาตเฉพาะคำสั่ง <strong>SELECT</strong> เท่านั้น ไม่อนุญาตคำสั่ง INSERT, UPDATE, DELETE
                                            </div>
                                        </div>

                                        {/* แผงทดสอบจำลองค่าตัวแปร Craft Filters ก่อนรัน Preview */}
                                        {data.craft_filters.length > 0 && (
                                            <div className="p-3 bg-light rounded border mb-3">
                                                <div className="d-flex align-items-center gap-1 mb-2 text-dark fw-bold fs-13">
                                                    <IconifyIcon icon="tabler:player-play" className="text-info fs-16" />
                                                    จำลองตัวเลือกสำหรับทดสอบ Query (Craft Filters Preview):
                                                </div>
                                                <Row className="g-2">
                                                    {data.craft_filters.map((filter) => (
                                                        <Col key={filter.id} xs={12} md={6}>
                                                            <div className="border rounded p-2 bg-white">
                                                                <label className="form-label fs-12 fw-semibold text-secondary mb-1 d-flex justify-content-between">
                                                                    <span>{filter.label}</span>
                                                                    <Badge bg="dark" className="font-monospace fs-10">
                                                                        {`{{${filter.name}}}`}
                                                                    </Badge>
                                                                </label>
                                                                {filter.type === 'radio' ? (
                                                                    <div className="d-flex flex-wrap gap-2">
                                                                        {filter.options.map((opt, oIdx) => (
                                                                            <div key={oIdx} className="form-check form-check-inline fs-12 mb-0">
                                                                                <input
                                                                                    className="form-check-input"
                                                                                    type="radio"
                                                                                    name={`test_${filter.name}`}
                                                                                    id={`test_${filter.name}_${oIdx}`}
                                                                                    checked={(testCraftParams[filter.name] ?? filter.default_value) === opt.value}
                                                                                    onChange={() =>
                                                                                        setTestCraftParams((prev) => ({
                                                                                            ...prev,
                                                                                            [filter.name]: opt.value,
                                                                                        }))
                                                                                    }
                                                                                />
                                                                                <label className="form-check-label" htmlFor={`test_${filter.name}_${oIdx}`}>
                                                                                    {opt.label}
                                                                                </label>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <select
                                                                        className="form-select form-select-sm fs-12"
                                                                        value={testCraftParams[filter.name] ?? filter.default_value}
                                                                        onChange={(e) =>
                                                                            setTestCraftParams((prev) => ({
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
                                                                )}
                                                            </div>
                                                        </Col>
                                                    ))}
                                                </Row>
                                            </div>
                                        )}

                                        {testError && (
                                            <Alert variant="danger" className="mb-3">
                                                <div className="d-flex align-items-start gap-2">
                                                    <IconifyIcon icon="tabler:alert-triangle" className="fs-20 mt-1" />
                                                    <div>
                                                        <strong>ทดสอบ Query ไม่สำเร็จ:</strong>
                                                        <p className="mb-0 fs-13 mt-1 font-monospace">{testError}</p>
                                                    </div>
                                                </div>
                                            </Alert>
                                        )}

                                        {previewData && (
                                            <div className="mt-2 border rounded p-3 bg-light-subtle overflow-hidden">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <h6 className="mb-0 text-success d-flex align-items-center">
                                                        <IconifyIcon icon="tabler:circle-check-filled" className="me-1 fs-18" />
                                                        ตารางตัวอย่างผลลัพธ์ (Preview 10 แถวแรกจากทั้งหมด {previewData.total} แถว)
                                                    </h6>
                                                    <span className="badge bg-primary-subtle text-primary">{previewData.columns.length} คอลัมน์</span>
                                                </div>

                                                <div className="table-responsive" style={{ maxHeight: '320px' }}>
                                                    <Table size="sm" bordered hover className="mb-0 bg-white align-middle fs-12">
                                                        <thead className="table-light sticky-top">
                                                            <tr>
                                                                <th>#</th>
                                                                {previewData.columns.map((col, idx) => (
                                                                    <th key={idx} className="text-nowrap">
                                                                        {col}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {previewData.rows.length === 0 ? (
                                                                <tr>
                                                                    <td colSpan={previewData.columns.length + 1} className="text-center py-3 text-muted">
                                                                        พบโครงสร้างคอลัมน์แต่ไม่มีข้อมูล (0 rows)
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                previewData.rows.map((row, rIdx) => (
                                                                    <tr key={rIdx}>
                                                                        <td className="text-muted fw-bold">{rIdx + 1}</td>
                                                                        {previewData.columns.map((col, cIdx) => (
                                                                            <td key={cIdx} className="text-nowrap">
                                                                                {row[col] !== null && row[col] !== undefined ? String(row[col]) : <span className="text-muted italic">-</span>}
                                                                            </td>
                                                                        ))}
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </Table>
                                                </div>
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </form>
                </Col>
            </Row>
        </MainLayout>
    );
};

export default CreateReportPage;
