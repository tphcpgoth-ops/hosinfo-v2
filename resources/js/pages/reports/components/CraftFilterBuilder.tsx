import React from 'react';
import { Card, CardBody, CardHeader, Button, Badge, Row, Col, Form } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import Swal from 'sweetalert2';
import { CraftFilter, CraftOption } from './CraftFilterTypes';

interface CraftFilterBuilderProps {
    filters: CraftFilter[];
    onChange: (filters: CraftFilter[]) => void;
    onInsertTag?: (varName: string) => void;
}

export const CraftFilterBuilder: React.FC<CraftFilterBuilderProps> = ({
    filters,
    onChange,
    onInsertTag,
}) => {
    // เพิ่มตัวกรองว่างใหม่
    const handleAddFilter = () => {
        const newId = 'filter_' + Date.now();
        const newFilter: CraftFilter = {
            id: newId,
            name: `custom_option_${filters.length + 1}`,
            label: `ตัวเลือกเพิ่มเติม ${filters.length + 1}`,
            type: 'radio',
            default_value: '0',
            options: [
                { label: 'ตัวเลือก 1', value: '1', sql: '/* เงื่อนไข SQL สำหรับตัวเลือก 1 */' },
                { label: 'ตัวเลือก 2', value: '2', sql: '/* เงื่อนไข SQL สำหรับตัวเลือก 2 */' },
                { label: 'ทั้งหมด', value: '0', sql: '', is_default: true },
            ],
        };
        onChange([...filters, newFilter]);
    };

    // ลบตัวกรอง
    const handleRemoveFilter = (filterId: string) => {
        Swal.fire({
            title: 'ยืนยันการลบ?',
            text: 'คุณต้องการลบตัวเลือก Craft Filter นี้หรือไม่?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ใช่, ลบออก',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#d33',
        }).then((res) => {
            if (res.isConfirmed) {
                onChange(filters.filter((f) => f.id !== filterId));
            }
        });
    };

    // อัปเดตข้อมูล Filter ระดับบน
    const handleUpdateFilter = (filterId: string, field: keyof CraftFilter, value: any) => {
        onChange(
            filters.map((f) => {
                if (f.id === filterId) {
                    let sanitizedValue = value;
                    if (field === 'name') {
                        // อนุญาตเฉพาะตัวอักษรภาษาอังกฤษ ตัวเลข และ _
                        sanitizedValue = String(value).replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
                    }
                    return { ...f, [field]: sanitizedValue };
                }
                return f;
            })
        );
    };

    // เพิ่ม Option ย่อยใน Filter
    const handleAddOption = (filterId: string) => {
        onChange(
            filters.map((f) => {
                if (f.id === filterId) {
                    const newOptions: CraftOption[] = [
                        ...f.options,
                        {
                            label: `ตัวเลือก ${f.options.length + 1}`,
                            value: String(f.options.length + 1),
                            sql: '',
                        },
                    ];
                    return { ...f, options: newOptions };
                }
                return f;
            })
        );
    };

    // อัปเดต Option ย่อย
    const handleUpdateOption = (
        filterId: string,
        optionIndex: number,
        field: keyof CraftOption,
        value: any
    ) => {
        onChange(
            filters.map((f) => {
                if (f.id === filterId) {
                    const updatedOptions = [...f.options];
                    if (field === 'is_default') {
                        // กำหนดตัวนี้เป็น default ตัวเดียว
                        updatedOptions.forEach((opt, idx) => {
                            opt.is_default = idx === optionIndex;
                        });
                        return {
                            ...f,
                            default_value: updatedOptions[optionIndex].value,
                            options: updatedOptions,
                        };
                    } else {
                        updatedOptions[optionIndex] = {
                            ...updatedOptions[optionIndex],
                            [field]: value,
                        };
                        // ถ้าเปลี่ยนค่า value และตัวนี้เป็น default ให้อัปเดต default_value ของ filter ด้วย
                        if (field === 'value' && updatedOptions[optionIndex].is_default) {
                            return {
                                ...f,
                                default_value: value,
                                options: updatedOptions,
                            };
                        }
                        return { ...f, options: updatedOptions };
                    }
                }
                return f;
            })
        );
    };

    // ลบ Option ย่อย
    const handleRemoveOption = (filterId: string, optionIndex: number) => {
        onChange(
            filters.map((f) => {
                if (f.id === filterId) {
                    if (f.options.length <= 1) {
                        Swal.fire('แจ้งเตือน', 'ตัวกรองต้องมีอย่างน้อย 1 ตัวเลือก', 'warning');
                        return f;
                    }
                    const updatedOptions = f.options.filter((_, idx) => idx !== optionIndex);
                    // ถ้าตัวที่ถูกลบเป็น default ให้ตั้งตัวแรกเป็น default แทน
                    if (!updatedOptions.some((o) => o.is_default)) {
                        updatedOptions[0].is_default = true;
                        return {
                            ...f,
                            default_value: updatedOptions[0].value,
                            options: updatedOptions,
                        };
                    }
                    return { ...f, options: updatedOptions };
                }
                return f;
            })
        );
    };

    // เพิ่ม Template สำเร็จรูป: OPD / IPD
    const handleApplyOpdIpdPreset = () => {
        if (filters.some((f) => f.name === 'opdipd')) {
            Swal.fire('แจ้งเตือน', 'มีตัวกรองประเภทผู้ป่วย (opdipd) อยู่แล้ว', 'info');
            return;
        }
        const preset: CraftFilter = {
            id: 'filter_opdipd_' + Date.now(),
            name: 'opdipd',
            label: 'ประเภทผู้ป่วย (OPD / IPD)',
            type: 'radio',
            default_value: '0',
            options: [
                { label: 'ผู้ป่วยนอก (OPD)', value: '1', sql: "AND (an IS NULL OR an = '')" },
                { label: 'ผู้ป่วยใน (IPD)', value: '2', sql: "AND (an IS NOT NULL OR an <> '')" },
                { label: 'ทั้งหมด', value: '0', sql: '', is_default: true },
            ],
        };
        onChange([...filters, preset]);
        Swal.fire('เพิ่มสำเร็จ', 'เพิ่มแม่แบบประเภทผู้ป่วย (OPD / IPD) เรียบร้อยแล้ว', 'success');
    };

    // เพิ่ม Template สำเร็จรูป: ยา / เวชภัณฑ์มิใช่ยา
    const handleApplyDtypePreset = () => {
        if (filters.some((f) => f.name === 'dtype_subquery')) {
            Swal.fire('แจ้งเตือน', 'มีตัวกรองประเภทยา/เวชภัณฑ์ (dtype_subquery) อยู่แล้ว', 'info');
            return;
        }
        const preset: CraftFilter = {
            id: 'filter_dtype_' + Date.now(),
            name: 'dtype_subquery',
            label: 'ประเภทเวชภัณฑ์ (ยา / เวชภัณฑ์มิใช่ยา)',
            type: 'select',
            default_value: 'drug',
            options: [
                {
                    label: 'ยา (drugitems)',
                    value: 'drug',
                    sql: 'SELECT d.icode, d.name, d.generic_name, d.dosageform, d.strength, d.units, IF(d.unitcost IS NOT NULL, d.unitcost, 0) AS unitcost, d.unitprice FROM drugitems d WHERE istatus = \'Y\'',
                    is_default: true,
                },
                {
                    label: 'เวชภัณฑ์มิใช่ยา (nondrugitems)',
                    value: 'nondrug',
                    sql: 'SELECT d.icode, d.name, \'\' AS generic_name, \'\' AS dosageform, \'\' AS strength, d.unit AS units, IF(d.unitcost IS NOT NULL, d.unitcost, 0) AS unitcost, d.price AS unitprice FROM nondrugitems d WHERE istatus = \'Y\' AND income = \'04\'',
                },
            ],
        };
        onChange([...filters, preset]);
        Swal.fire('เพิ่มสำเร็จ', 'เพิ่มแม่แบบประเภทยา/เวชภัณฑ์มิใช่ยา เรียบร้อยแล้ว', 'success');
    };

    return (
        <div className="craft-filter-builder">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                <div className="d-flex align-items-center gap-1">
                    <IconifyIcon icon="tabler:adjustments-horizontal" className="fs-18 text-primary" />
                    <span className="fw-bold fs-14 text-dark">ตัวกรองปรับแต่ง SQL (Craft Query Filters)</span>
                    <Badge bg="primary-subtle" className="text-primary ms-1">
                        {filters.length} รายการ
                    </Badge>
                </div>
                <div className="d-flex flex-wrap gap-1">
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={handleApplyOpdIpdPreset}
                        className="d-inline-flex align-items-center gap-1 fs-12 shadow-sm"
                    >
                        <IconifyIcon icon="tabler:users" className="fs-14" /> + แม่แบบ OPD/IPD
                    </Button>
                    <Button
                        variant="outline-info"
                        size="sm"
                        onClick={handleApplyDtypePreset}
                        className="d-inline-flex align-items-center gap-1 fs-12 shadow-sm"
                    >
                        <IconifyIcon icon="tabler:pill" className="fs-14" /> + แม่แบบ ยา/เวชภัณฑ์
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleAddFilter}
                        className="d-inline-flex align-items-center gap-1 fs-12 shadow-sm"
                    >
                        <IconifyIcon icon="tabler:plus" className="fs-14" /> + สร้างตัวเลือกใหม่
                    </Button>
                </div>
            </div>

            {filters.length === 0 ? (
                <div className="border border-dashed rounded p-3 text-center bg-light-subtle text-muted fs-13 mb-3">
                    <IconifyIcon icon="tabler:code-dots" className="fs-28 d-block mx-auto mb-1 text-secondary opacity-50" />
                    ยังไม่ได้เพิ่มตัวเลือกปรับแต่ง SQL (Craft Query)
                    <div className="text-secondary small mt-1">
                        กดปุ่ม <strong>"+ สร้างตัวเลือกใหม่"</strong> หรือเลือกจากแม่แบบด้านบน เพื่อสร้าง Dropdown หรือ Radio Button ที่สลับคำสั่ง SQL อัตโนมัติ
                    </div>
                </div>
            ) : (
                <div className="d-flex flex-column gap-3 mb-3">
                    {filters.map((filter, fIndex) => (
                        <Card key={filter.id} className="border shadow-none mb-0 bg-white">
                            <CardHeader className="py-2 px-3 bg-light d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="badge bg-secondary-subtle text-secondary fs-11">#{fIndex + 1}</span>
                                    <strong className="fs-13 text-dark">{filter.label || 'ไม่ได้ระบุชื่อ'}</strong>
                                    <Badge bg="dark" className="font-monospace fs-11 text-warning">
                                        {`{{${filter.name || 'variable'}}}`}
                                    </Badge>
                                </div>
                                <div className="d-flex align-items-center gap-1">
                                    {onInsertTag && (
                                        <Button
                                            variant="light"
                                            size="sm"
                                            className="btn-xs border text-primary d-inline-flex align-items-center gap-1 py-1 px-2 fs-11"
                                            title={`แทรกแท็ก {{${filter.name}}} ลงในคำสั่ง SQL`}
                                            onClick={() => onInsertTag(filter.name)}
                                        >
                                            <IconifyIcon icon="tabler:code-plus" className="fs-13" />
                                            แทรกแท็กใน SQL
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        className="btn-xs py-1 px-2 fs-11"
                                        title="ลบตัวกรองนี้"
                                        onClick={() => handleRemoveFilter(filter.id)}
                                    >
                                        <IconifyIcon icon="tabler:trash" className="fs-13" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardBody className="p-3">
                                <Row className="g-2 mb-3">
                                    <Col md={5}>
                                        <label className="form-label fs-12 mb-1">
                                            ชื่อตัวแปร (Variable Token) <span className="text-danger">*</span>
                                        </label>
                                        <div className="input-group input-group-sm">
                                            <span className="input-group-text font-monospace fs-12 bg-light">{`{{`}</span>
                                            <input
                                                type="text"
                                                className="form-control font-monospace fs-12"
                                                value={filter.name}
                                                onChange={(e) => handleUpdateFilter(filter.id, 'name', e.target.value)}
                                                placeholder="เช่น opdipd"
                                                required
                                            />
                                            <span className="input-group-text font-monospace fs-12 bg-light">{`}}`}</span>
                                        </div>
                                    </Col>
                                    <Col md={4}>
                                        <label className="form-label fs-12 mb-1">
                                            ป้ายชื่อแสดงผล (Display Label) <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm fs-12"
                                            value={filter.label}
                                            onChange={(e) => handleUpdateFilter(filter.id, 'label', e.target.value)}
                                            placeholder="เช่น ประเภทผู้ป่วย"
                                            required
                                        />
                                    </Col>
                                    <Col md={3}>
                                        <label className="form-label fs-12 mb-1">รูปแบบการแสดงผล</label>
                                        <select
                                            className="form-select form-select-sm fs-12"
                                            value={filter.type}
                                            onChange={(e) => handleUpdateFilter(filter.id, 'type', e.target.value)}
                                        >
                                            <option value="radio">Radio Buttons</option>
                                            <option value="select">Dropdown Select</option>
                                        </select>
                                    </Col>
                                </Row>

                                {/* ตาราง Option ย่อย */}
                                <div className="border rounded p-2 bg-light-subtle">
                                    <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                                        <span className="fs-12 fw-bold text-dark">
                                            <IconifyIcon icon="tabler:list-details" className="me-1 text-primary" />
                                            รายการตัวเลือกและคำสั่ง SQL Snippet ที่จะถูกนำไปแทนที่:
                                        </span>
                                        <Button
                                            variant="success"
                                            size="sm"
                                            className="btn-xs py-0 px-2 fs-11 d-inline-flex align-items-center gap-1"
                                            onClick={() => handleAddOption(filter.id)}
                                        >
                                            <IconifyIcon icon="tabler:plus" className="fs-12" /> เพิ่ม Option
                                        </Button>
                                    </div>

                                    <div className="d-flex flex-column gap-2">
                                        {filter.options.map((option, optIdx) => (
                                            <div
                                                key={optIdx}
                                                className="border rounded p-2 bg-white shadow-none position-relative"
                                            >
                                                <Row className="g-2 align-items-center">
                                                    <Col xs={12} sm={4}>
                                                        <div className="d-flex align-items-center gap-1">
                                                            <div className="form-check mb-0 me-1" title="กำหนดเป็นค่าเริ่มต้น">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="radio"
                                                                    name={`default_${filter.id}`}
                                                                    id={`default_${filter.id}_${optIdx}`}
                                                                    checked={option.is_default || filter.default_value === option.value}
                                                                    onChange={() => handleUpdateOption(filter.id, optIdx, 'is_default', true)}
                                                                />
                                                            </div>
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm fs-12"
                                                                value={option.label}
                                                                onChange={(e) => handleUpdateOption(filter.id, optIdx, 'label', e.target.value)}
                                                                placeholder="ชื่อตัวเลือก เช่น ผู้ป่วยนอก"
                                                                required
                                                            />
                                                        </div>
                                                    </Col>
                                                    <Col xs={12} sm={3}>
                                                        <div className="input-group input-group-sm">
                                                            <span className="input-group-text fs-11 bg-light text-muted">Value:</span>
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm font-monospace fs-12"
                                                                value={option.value}
                                                                onChange={(e) => handleUpdateOption(filter.id, optIdx, 'value', e.target.value)}
                                                                placeholder="เช่น 1, drug"
                                                                required
                                                            />
                                                        </div>
                                                    </Col>
                                                    <Col xs={10} sm={4}>
                                                        <span className="badge bg-light text-muted border fs-10 mb-1 d-block text-truncate">
                                                            แทนที่ใน <code className="text-primary">{`{{${filter.name}}}`}</code>:
                                                        </span>
                                                        <textarea
                                                            rows={2}
                                                            className="form-control font-monospace fs-11"
                                                            style={{ backgroundColor: '#212529', color: '#88c0d0' }}
                                                            value={option.sql}
                                                            onChange={(e) => handleUpdateOption(filter.id, optIdx, 'sql', e.target.value)}
                                                            placeholder="SQL Snippet (ปล่อยว่างได้ถ้าไม่ต้องเพิ่มเงื่อนไขใดๆ เช่น ทั้งหมด)"
                                                        />
                                                    </Col>
                                                    <Col xs={2} sm={1} className="text-end">
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            className="text-danger p-0 fs-16"
                                                            title="ลบตัวเลือกนี้"
                                                            onClick={() => handleRemoveOption(filter.id, optIdx)}
                                                        >
                                                            <IconifyIcon icon="tabler:circle-x" />
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CraftFilterBuilder;
