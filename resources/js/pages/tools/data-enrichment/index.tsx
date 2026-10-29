import React, { useState, useRef, useMemo } from 'react';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import MainLayout from '@/layouts/MainLayout';
import { Button, Card, CardBody, CardHeader, Col, Row, Form, Badge, ProgressBar, Alert, Table } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import axios from 'axios';

interface FieldOption {
    id: string;
    label: string;
    category: 'patient' | 'visit' | 'vitals' | 'diagnosis' | 'finance';
    defaultSelected: boolean;
    getValue: (res: any) => string | number;
}

const FIELD_DEFINITIONS: FieldOption[] = [
    // 1. ข้อมูลผู้ป่วย (Patient)
    { id: 'hn', label: 'HN', category: 'patient', defaultSelected: true, getValue: (r) => r.patient?.hn || r.query_hn || '' },
    { id: 'cid', label: 'เลขบัตรประชาชน (CID)', category: 'patient', defaultSelected: true, getValue: (r) => r.patient?.cid || '' },
    { id: 'fullname', label: 'ชื่อ-นามสกุล', category: 'patient', defaultSelected: true, getValue: (r) => r.patient?.fullname || '' },
    { id: 'sex', label: 'เพศ', category: 'patient', defaultSelected: true, getValue: (r) => r.patient?.sex || '' },
    { id: 'birthday', label: 'วันเกิด', category: 'patient', defaultSelected: false, getValue: (r) => r.patient?.birthday || '' },
    { id: 'age_now', label: 'อายุปัจจุบัน (ปี)', category: 'patient', defaultSelected: true, getValue: (r) => r.patient?.age_now ?? '' },
    { id: 'hometel', label: 'เบอร์โทรศัพท์', category: 'patient', defaultSelected: true, getValue: (r) => r.patient?.hometel || '' },
    { id: 'bloodgrp', label: 'หมู่เลือด', category: 'patient', defaultSelected: false, getValue: (r) => r.patient?.bloodgrp || '' },
    { id: 'drugallergy', label: 'ประวัติแพ้ยา', category: 'patient', defaultSelected: false, getValue: (r) => r.patient?.drugallergy || '' },
    { id: 'address', label: 'ที่อยู่ตามทะเบียน', category: 'patient', defaultSelected: false, getValue: (r) => r.patient?.address || '' },

    // 2. ข้อมูลการรับบริการ (Visit)
    { id: 'vn', label: 'เลขที่รับบริการ (VN)', category: 'visit', defaultSelected: false, getValue: (r) => r.visit?.vn || '' },
    { id: 'an', label: 'เลขที่ผู้ป่วยใน (AN)', category: 'visit', defaultSelected: false, getValue: (r) => r.visit?.an || '' },
    { id: 'vstdate', label: 'วันที่รับบริการ (HOSxP)', category: 'visit', defaultSelected: true, getValue: (r) => r.visit?.vstdate || '' },
    { id: 'vsttime', label: 'เวลารับบริการ', category: 'visit', defaultSelected: false, getValue: (r) => r.visit?.vsttime || '' },
    { id: 'age_at_visit', label: 'อายุ ณ วันรับบริการ', category: 'visit', defaultSelected: true, getValue: (r) => r.visit?.age_at_visit ?? '' },
    { id: 'department_name', label: 'แผนก/ห้องตรวจ', category: 'visit', defaultSelected: true, getValue: (r) => r.visit?.department_name || '' },
    { id: 'doctor_name', label: 'แพทย์ผู้ตรวจ', category: 'visit', defaultSelected: false, getValue: (r) => r.visit?.doctor_name || '' },
    { id: 'pttype_name', label: 'สิทธิการรักษา', category: 'visit', defaultSelected: true, getValue: (r) => r.visit?.pttype_name || '' },

    // 3. สัญญาณชีพ & อาการ (Vitals)
    { id: 'cc', label: 'อาการสำคัญ (CC)', category: 'vitals', defaultSelected: true, getValue: (r) => r.visit?.cc || '' },
    { id: 'bp', label: 'ความดันโลหิต (BP)', category: 'vitals', defaultSelected: true, getValue: (r) => r.visit?.bp || '' },
    { id: 'pulse', label: 'ชีพจร (Pulse)', category: 'vitals', defaultSelected: false, getValue: (r) => r.visit?.pulse ?? '' },
    { id: 'temperature', label: 'อุณหภูมิ (°C)', category: 'vitals', defaultSelected: false, getValue: (r) => r.visit?.temperature ?? '' },
    { id: 'rr', label: 'อัตราหายใจ (RR)', category: 'vitals', defaultSelected: false, getValue: (r) => r.visit?.rr ?? '' },
    { id: 'bw', label: 'น้ำหนัก (กก.)', category: 'vitals', defaultSelected: false, getValue: (r) => r.visit?.bw ?? '' },
    { id: 'height', label: 'ส่วนสูง (ซม.)', category: 'vitals', defaultSelected: false, getValue: (r) => r.visit?.height ?? '' },
    { id: 'bmi', label: 'ดัชนีมวลกาย (BMI)', category: 'vitals', defaultSelected: false, getValue: (r) => r.visit?.bmi ?? '' },

    // 4. การวินิจฉัย (Diagnosis)
    { id: 'pdx', label: 'รหัสโรคหลัก (PDX)', category: 'diagnosis', defaultSelected: true, getValue: (r) => r.visit?.pdx || '' },
    { id: 'pdx_name', label: 'ชื่อโรคหลัก', category: 'diagnosis', defaultSelected: true, getValue: (r) => r.visit?.pdx_name || '' },
    { id: 'dx0', label: 'โรคร่วม 1 (DX0)', category: 'diagnosis', defaultSelected: false, getValue: (r) => r.visit?.dx0 || '' },
    { id: 'dx1', label: 'โรคร่วม 2 (DX1)', category: 'diagnosis', defaultSelected: false, getValue: (r) => r.visit?.dx1 || '' },
    { id: 'dx2', label: 'โรคร่วม 3 (DX2)', category: 'diagnosis', defaultSelected: false, getValue: (r) => r.visit?.dx2 || '' },

    // 5. การเงิน (Finance)
    { id: 'income', label: 'ค่ารักษาพยาบาลรวม', category: 'finance', defaultSelected: false, getValue: (r) => r.visit?.income ?? '' },
    { id: 'paid_money', label: 'ชำระเงินเอง', category: 'finance', defaultSelected: false, getValue: (r) => r.visit?.paid_money ?? '' },
];

const CATEGORY_TITLES: Record<string, { title: string; icon: string; color: string }> = {
    patient: { title: '1. ข้อมูลผู้ป่วย (Patient Profile)', icon: 'tabler:user', color: 'primary' },
    visit: { title: '2. ข้อมูลการรับบริการ (Visit Details)', icon: 'tabler:stethoscope', color: 'info' },
    vitals: { title: '3. สัญญาณชีพ & การคัดกรอง (Vitals)', icon: 'tabler:heart-rate-monitor', color: 'danger' },
    diagnosis: { title: '4. การวินิจฉัยโรค (Diagnosis ICD-10)', icon: 'tabler:report-medical', color: 'success' },
    finance: { title: '5. ค่ารักษาพยาบาล (Finance)', icon: 'tabler:cash', color: 'warning' },
};

// Helper function to normalize dates from Excel (Serial Number, Date objects, Strings)
const normalizeExcelDate = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (val instanceof Date) {
        const y = val.getFullYear();
        const m = String(val.getMonth() + 1).padStart(2, '0');
        const d = String(val.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    const str = String(val).trim();
    if (!str) return '';

    // Check Excel serial number (เช่น 45580 หรือ 45580.0)
    const num = Number(str);
    if (!isNaN(num) && num >= 20000 && num <= 90000) {
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        const d = new Date(excelEpoch.getTime() + Math.floor(num) * 86400000);
        const y = d.getUTCFullYear();
        const m = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    return str;
};

// Auto-detect vstdate column safely without matching birthday columns
const detectDateColumn = (cols: string[]): string => {
    const validCols = cols.filter(c => !/(เกิด|birth|bday|dob)/i.test(c.trim()));
    const exactMatch = validCols.find(c => /^(vstdate|vst_date|visit_date|visitdate|service_date|วันที่รับบริการ|วันที่ตรวจ|วันที่มารับบริการ|วันรับบริการ|วันที่มา|วันที่|date)$/i.test(c.trim()));
    if (exactMatch) return exactMatch;
    const visitMatch = validCols.find(c => /(vst|visit|ตรวจ|รับบริการ|service)/i.test(c.trim()));
    if (visitMatch) return visitMatch;
    const dateMatch = validCols.find(c => /(date|วัน)/i.test(c.trim()));
    return dateMatch || '';
};

const DataEnrichmentPage: React.FC = () => {
    // ── Upload & File State ──────────────────────────────
    const [fileName, setFileName] = useState<string>('');
    const [fileColumns, setFileColumns] = useState<string[]>([]);
    const [parsedRows, setParsedRows] = useState<Record<string, any>[]>([]);
    const [selectedHnCol, setSelectedHnCol] = useState<string>('');
    const [selectedDateCol, setSelectedDateCol] = useState<string>('');
    const [autoPadHn, setAutoPadHn] = useState<boolean>(true);
    const [includeOriginalCols, setIncludeOriginalCols] = useState<boolean>(true);
    const [fallbackLatest, setFallbackLatest] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Field Selection State ───────────────────────────
    const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>(() => {
        const init: Record<string, boolean> = {};
        FIELD_DEFINITIONS.forEach(f => { init[f.id] = f.defaultSelected; });
        return init;
    });

    // ── Processing & Results State ──────────────────────
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [progressStatus, setProgressStatus] = useState<string>('');
    const [enrichedResults, setEnrichedResults] = useState<any[]>([]);
    const [stats, setStats] = useState<{
        total: number;
        matched: number;
        notFound: number;
        exactVisit: number;
        dateNotFound: number;
    } | null>(null);

    // ── Table Filter State ──────────────────────────────
    const [activeFilter, setActiveFilter] = useState<'all' | 'exact_visit' | 'date_not_found' | 'matched' | 'not_found'>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const pageSize = 20;

    // ── Handle File Parse ───────────────────────────────
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setEnrichedResults([]);
        setStats(null);
        setProgress(0);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = new Uint8Array(evt.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

                if (jsonRows.length === 0) {
                    Swal.fire({ icon: 'warning', title: 'ไฟล์ว่างเปล่า', text: 'ไม่พบข้อมูลแถวในชีตแรกของไฟล์' });
                    return;
                }

                const cols = Object.keys(jsonRows[0] || {});
                setFileColumns(cols);
                setParsedRows(jsonRows);

                // Auto-detect HN Column
                const hnFound = cols.find(c => /^(hn|h\.n\.|เลขhn|เลขประจำตัวผู้ป่วย|รหัสผู้ป่วย)$/i.test(c.trim()))
                    || cols.find(c => /hn/i.test(c))
                    || cols[0];
                setSelectedHnCol(hnFound || '');

                // Auto-detect Vstdate Column (without matching birthday)
                setSelectedDateCol(detectDateColumn(cols));

            } catch (err: any) {
                console.error('File parse error:', err);
                Swal.fire({ icon: 'error', title: 'ไม่สามารถอ่านไฟล์ได้', text: err.message || 'รูปแบบไฟล์ไม่ถูกต้อง' });
            }
        };
        reader.readAsArrayBuffer(file);
    };

    // ── Field Toggles ───────────────────────────────────
    const toggleField = (id: string) => {
        setSelectedFields(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleCategory = (cat: string, selectAll: boolean) => {
        setSelectedFields(prev => {
            const next = { ...prev };
            FIELD_DEFINITIONS.filter(f => f.category === cat).forEach(f => {
                next[f.id] = selectAll;
            });
            return next;
        });
    };

    const selectPreset = (type: 'default' | 'all' | 'none') => {
        const next: Record<string, boolean> = {};
        FIELD_DEFINITIONS.forEach(f => {
            if (type === 'default') next[f.id] = f.defaultSelected;
            else if (type === 'all') next[f.id] = true;
            else next[f.id] = false;
        });
        setSelectedFields(next);
    };

    // ── Execute Batch Lookup ────────────────────────────
    const handleStartLookup = async () => {
        if (!selectedHnCol) {
            Swal.fire({ icon: 'warning', title: 'กรุณาเลือกคอลัมน์ HN', text: 'โปรดระบุคอลัมน์ที่เก็บเลข HN ในไฟล์' });
            return;
        }

        const selectedCount = Object.values(selectedFields).filter(Boolean).length;
        if (selectedCount === 0) {
            Swal.fire({ icon: 'warning', title: 'กรุณาเลือกฟิลด์ข้อมูล', text: 'โปรดเลือกอย่างน้อย 1 ฟิลด์ที่ต้องการนำมาแสดงผล' });
            return;
        }

        setIsProcessing(true);
        setProgress(0);
        setProgressStatus('กำลังเตรียมข้อมูล...');

        const totalRows = parsedRows.length;
        const BATCH_SIZE = 200;
        const combinedResults: any[] = [];
        let matchedCount = 0;
        let exactVisitCount = 0;
        let dateNotFoundCount = 0;

        try {
            for (let i = 0; i < totalRows; i += BATCH_SIZE) {
                const chunk = parsedRows.slice(i, i + BATCH_SIZE).map((row, idx) => {
                    const rawDate = selectedDateCol ? row[selectedDateCol] : null;
                    const cleanDate = rawDate ? normalizeExcelDate(rawDate) : null;
                    return {
                        hn: String(row[selectedHnCol] ?? '').trim(),
                        vstdate: cleanDate,
                        row_id: i + idx,
                    };
                });

                setProgressStatus(`กำลังค้นหาแถวที่ ${i + 1} - ${Math.min(i + BATCH_SIZE, totalRows)} จาก ${totalRows.toLocaleString()} รายการ...`);

                const res = await axios.post('/tools/hosxp-data-enrichment/lookup', {
                    items: chunk,
                    auto_pad_hn: autoPadHn,
                    hn_length: 9,
                    fallback_to_latest_if_date_not_found: fallbackLatest,
                });

                const data = res.data;
                if (data && data.results) {
                    data.results.forEach((r: any, rIdx: number) => {
                        const originalRow = parsedRows[i + rIdx] || {};
                        combinedResults.push({
                            ...r,
                            originalRowData: originalRow,
                        });
                        if (r.matched) matchedCount++;
                        if (r.match_type === 'exact_visit') exactVisitCount++;
                        if (r.match_type === 'date_not_found') dateNotFoundCount++;
                    });
                }

                const currentDone = Math.min(i + BATCH_SIZE, totalRows);
                setProgress(Math.round((currentDone / totalRows) * 100));
            }

            setEnrichedResults(combinedResults);
            setStats({
                total: totalRows,
                matched: matchedCount,
                notFound: totalRows - matchedCount,
                exactVisit: exactVisitCount,
                dateNotFound: dateNotFoundCount,
            });

            Swal.fire({
                icon: 'success',
                title: 'ดึงข้อมูลสำเร็จ!',
                html: `ประมวลผลครบทั้งหมด <strong>${totalRows.toLocaleString()}</strong> รายการ<br/>
                       พบใน HOSxP: <strong class="text-success">${matchedCount.toLocaleString()}</strong> | 
                       ${selectedDateCol ? `ตรงวัน: <strong class="text-primary">${exactVisitCount.toLocaleString()}</strong> | ไม่พบตรวจตรงวัน: <strong class="text-warning">${dateNotFoundCount.toLocaleString()}</strong> | ` : ''}
                       ไม่พบ HN: <strong class="text-danger">${(totalRows - matchedCount).toLocaleString()}</strong>`,
                timer: 4000,
                timerProgressBar: true,
            });

        } catch (err: any) {
            console.error('Lookup error:', err);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
                text: err.response?.data?.error || err.message || 'โปรดตรวจสอบการเชื่อมต่อกับ HOSxP API',
            });
        } finally {
            setIsProcessing(false);
            setProgressStatus('');
        }
    };

    // ── Filtered & Paginated Results ────────────────────
    const filteredResults = useMemo(() => {
        let list = enrichedResults;
        if (activeFilter === 'exact_visit') {
            list = list.filter(r => r.match_type === 'exact_visit');
        } else if (activeFilter === 'date_not_found') {
            list = list.filter(r => r.match_type === 'date_not_found');
        } else if (activeFilter === 'matched') {
            list = list.filter(r => r.matched);
        } else if (activeFilter === 'not_found') {
            list = list.filter(r => !r.matched);
        }

        if (searchTerm.trim()) {
            const q = searchTerm.trim().toLowerCase();
            list = list.filter(r => {
                const hnMatch = (r.query_hn || '').toLowerCase().includes(q) || (r.original_hn || '').toLowerCase().includes(q);
                const nameMatch = (r.patient?.fullname || '').toLowerCase().includes(q);
                const cidMatch = (r.patient?.cid || '').includes(q);
                const pdxMatch = (r.visit?.pdx || '').toLowerCase().includes(q);
                return hnMatch || nameMatch || cidMatch || pdxMatch;
            });
        }

        return list;
    }, [enrichedResults, activeFilter, searchTerm]);

    const paginatedResults = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredResults.slice(start, start + pageSize);
    }, [filteredResults, currentPage]);

    const totalPages = Math.ceil(filteredResults.length / pageSize) || 1;

    // ── Export to Excel (.xlsx) & CSV ───────────────────
    const handleExport = (format: 'xlsx' | 'csv') => {
        if (enrichedResults.length === 0) {
            Swal.fire({ icon: 'warning', title: 'ไม่มีข้อมูลสำหรับส่งออก', text: 'โปรดทำการดึงข้อมูลก่อนส่งออก' });
            return;
        }

        // Active fields to export
        const exportFields = FIELD_DEFINITIONS.filter(f => selectedFields[f.id]);

        const exportData = filteredResults.map((r, index) => {
            const row: Record<string, any> = {};

            // 1. ลำดับ
            row['ลำดับ'] = index + 1;

            // 2. ข้อมูลเดิมจากไฟล์ (ถ้าเลือกไว้)
            if (includeOriginalCols && r.originalRowData) {
                fileColumns.forEach(c => {
                    row[`[ไฟล์เดิม] ${c}`] = r.originalRowData[c] ?? '';
                });
            }

            // 3. สถานะการค้นพบ
            let statusText = 'ไม่พบใน HOSxP';
            if (r.matched) {
                if (r.match_type === 'exact_visit') statusText = 'พบข้อมูลตรวจตรงวัน';
                else if (r.match_type === 'date_not_found') statusText = 'ไม่พบการตรวจในวันที่ระบุ';
                else if (r.match_type === 'fallback_latest_visit') statusText = 'พบข้อมูล (ใช้วันตรวจล่าสุดแทน)';
                else if (r.match_type === 'latest_visit') statusText = 'พบข้อมูล (ตรวจล่าสุด)';
                else statusText = 'พบเฉพาะประวัติผู้ป่วย';
            }
            row['สถานะ HOSxP'] = statusText;

            // 4. ฟิลด์ที่เลือกจาก HOSxP
            exportFields.forEach(f => {
                row[f.label] = f.getValue(r) ?? '';
            });

            return row;
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'HOSxP_Enriched');

        const dateStr = new Date().toISOString().slice(0, 10);
        const baseName = fileName ? fileName.replace(/\.[^/.]+$/, '') : 'hosxp_data';

        if (format === 'xlsx') {
            XLSX.writeFile(wb, `${baseName}_enriched_${dateStr}.xlsx`);
        } else {
            const csvOutput = XLSX.utils.sheet_to_csv(ws);
            // ใส่ UTF-8 BOM เพื่อให้อ่านภาษาไทยใน Excel ได้ทันที
            const blob = new Blob(['\uFEFF' + csvOutput], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${baseName}_enriched_${dateStr}.csv`;
            link.click();
        }

        Swal.fire({
            icon: 'success',
            title: 'ส่งออกไฟล์สำเร็จ',
            text: `ดาวน์โหลดไฟล์ .${format} จำนวน ${exportData.length.toLocaleString()} รายการเรียบร้อยแล้ว`,
            timer: 2000,
            showConfirmButton: false,
        });
    };

    return (
        <MainLayout>
            <PageTitle title="ดึงข้อมูล HOSxP จากไฟล์ Excel/CSV" subTitle="HOSxP Batch Data Enrichment" />

            {/* ─────────────────────────────────────────────────────────────
                STEP 1: UPLOAD & COLUMN MAPPING
            ───────────────────────────────────────────────────────────── */}
            <Card className="shadow-sm border-0 mb-4">
                <CardHeader className="bg-primary-subtle py-3 border-bottom d-flex align-items-center justify-content-between">
                    <h5 className="card-title mb-0 text-primary d-flex align-items-center gap-2">
                        <IconifyIcon icon="tabler:upload" className="fs-20" />
                        <span>ขั้นตอนที่ 1: อัปโหลดไฟล์ Excel / CSV และจับคู่คอลัมน์</span>
                    </h5>
                    {parsedRows.length > 0 && (
                        <Badge bg="success" className="fs-12 px-2 py-1">
                            <IconifyIcon icon="tabler:check" className="me-1" /> โหลดแล้ว {parsedRows.length.toLocaleString()} แถว
                        </Badge>
                    )}
                </CardHeader>
                <CardBody>
                    <Row className="g-3">
                        <Col lg={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold">
                                    เลือกไฟล์ข้อมูล (.xlsx, .xls, .csv) <span className="text-danger">*</span>
                                </Form.Label>
                                <div className="input-group">
                                    <Form.Control
                                        type="file"
                                        accept=".xlsx, .xls, .csv"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        disabled={isProcessing}
                                    />
                                    {fileName && (
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => {
                                                setFileName('');
                                                setParsedRows([]);
                                                setFileColumns([]);
                                                setEnrichedResults([]);
                                                setStats(null);
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}
                                        >
                                            <IconifyIcon icon="tabler:trash" />
                                        </Button>
                                    )}
                                </div>
                                <Form.Text className="text-muted">
                                    รองรับไฟล์ Excel และ CSV ขนาดใหญ่ มีคอลัมน์ HN และวันที่รับบริการ (vstdate)
                                </Form.Text>
                            </Form.Group>
                        </Col>

                        {fileColumns.length > 0 && (
                            <>
                                <Col sm={6} lg={3}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold text-primary">
                                            <IconifyIcon icon="tabler:id" className="me-1" />
                                            คอลัมน์ HN <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Select
                                            value={selectedHnCol}
                                            onChange={(e) => setSelectedHnCol(e.target.value)}
                                            disabled={isProcessing}
                                        >
                                            <option value="">-- เลือกคอลัมน์ HN --</option>
                                            {fileColumns.map(col => (
                                                <option key={col} value={col}>{col}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col sm={6} lg={3}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold text-info">
                                            <IconifyIcon icon="tabler:calendar" className="me-1" />
                                            คอลัมน์ วันที่รับบริการ (vstdate)
                                        </Form.Label>
                                        <Form.Select
                                            value={selectedDateCol}
                                            onChange={(e) => setSelectedDateCol(e.target.value)}
                                            disabled={isProcessing}
                                        >
                                            <option value="">-- ไม่ระบุ (ดึง visit ล่าสุด) --</option>
                                            {fileColumns.map(col => (
                                                <option key={col} value={col}>{col}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col xs={12}>
                                    <div className="p-3 bg-light rounded border d-flex flex-wrap gap-4 align-items-center">
                                        <Form.Check
                                            type="checkbox"
                                            id="auto-pad-hn"
                                            label={
                                                <span>
                                                    <strong>เติม 0 นำหน้า HN ให้อัตโนมัติ (Pad to 9 digits):</strong> เช่น <code>9622</code> ➔ <code>000009622</code>
                                                </span>
                                            }
                                            checked={autoPadHn}
                                            onChange={(e) => setAutoPadHn(e.target.checked)}
                                            disabled={isProcessing}
                                        />
                                        <Form.Check
                                            type="checkbox"
                                            id="include-orig-cols"
                                            label={
                                                <span>
                                                    <strong>รวมคอลัมน์เดิมจากไฟล์ในผลลัพธ์:</strong> คงข้อมูลอื่นๆ ในไฟล์ต้นฉบับไว้
                                                </span>
                                            }
                                            checked={includeOriginalCols}
                                            onChange={(e) => setIncludeOriginalCols(e.target.checked)}
                                            disabled={isProcessing}
                                        />
                                        {selectedDateCol && (
                                            <Form.Check
                                                type="checkbox"
                                                id="fallback-latest"
                                                label={
                                                    <span>
                                                        <strong>กรณีไม่พบประวัติตรวจในวันที่ระบุ:</strong> ให้นำข้อมูล Visit ล่าสุดมาแสดงแทน (หากไม่ติ๊ก จะแสดงเฉพาะประวัติผู้ป่วยและไม่นำผลตรวจวันอื่นมาปน)
                                                    </span>
                                                }
                                                checked={fallbackLatest}
                                                onChange={(e) => setFallbackLatest(e.target.checked)}
                                                disabled={isProcessing}
                                            />
                                        )}
                                    </div>
                                </Col>
                            </>
                        )}
                    </Row>
                </CardBody>
            </Card>

            {/* ─────────────────────────────────────────────────────────────
                STEP 2: SELECT FIELDS TO ENRICH
            ───────────────────────────────────────────────────────────── */}
            {parsedRows.length > 0 && (
                <Card className="shadow-sm border-0 mb-4">
                    <CardHeader className="bg-white py-3 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-2">
                        <div>
                            <h5 className="card-title mb-0 text-dark d-flex align-items-center gap-2">
                                <IconifyIcon icon="tabler:list-check" className="fs-20 text-primary" />
                                <span>ขั้นตอนที่ 2: เลือกฟิลด์ข้อมูลที่ต้องการดึงจากฐานข้อมูล HOSxP</span>
                            </h5>
                            <small className="text-muted">
                                เลือกฟิลด์ที่ต้องการนำมาแสดงผลและส่งออก (เลือกไว้ {Object.values(selectedFields).filter(Boolean).length} จาก {FIELD_DEFINITIONS.length} ฟิลด์)
                            </small>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <Button size="sm" variant="outline-primary" onClick={() => selectPreset('default')} disabled={isProcessing}>
                                แนะนำ (Default)
                            </Button>
                            <Button size="sm" variant="outline-success" onClick={() => selectPreset('all')} disabled={isProcessing}>
                                เลือกทั้งหมด
                            </Button>
                            <Button size="sm" variant="outline-secondary" onClick={() => selectPreset('none')} disabled={isProcessing}>
                                ล้างทั้งหมด
                            </Button>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <Row className="g-4">
                            {Object.entries(CATEGORY_TITLES).map(([catKey, catInfo]) => {
                                const catFields = FIELD_DEFINITIONS.filter(f => f.category === catKey);
                                const allCatSelected = catFields.every(f => selectedFields[f.id]);
                                return (
                                    <Col lg={4} md={6} key={catKey}>
                                        <div className="p-3 border rounded h-100 bg-light-subtle shadow-xs">
                                            <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2">
                                                <h6 className={`fw-bold mb-0 text-${catInfo.color} d-flex align-items-center gap-1`}>
                                                    <IconifyIcon icon={catInfo.icon} className="fs-18" />
                                                    <span>{catInfo.title}</span>
                                                </h6>
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="p-0 text-decoration-none fs-12"
                                                    onClick={() => toggleCategory(catKey, !allCatSelected)}
                                                    disabled={isProcessing}
                                                >
                                                    {allCatSelected ? 'ยกเลิกหมวดนี้' : 'เลือกทั้งหมวด'}
                                                </Button>
                                            </div>
                                            <div className="d-flex flex-column gap-2">
                                                {catFields.map(f => (
                                                    <Form.Check
                                                        key={f.id}
                                                        type="checkbox"
                                                        id={`field-${f.id}`}
                                                        label={f.label}
                                                        checked={!!selectedFields[f.id]}
                                                        onChange={() => toggleField(f.id)}
                                                        disabled={isProcessing}
                                                        className="fs-13"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </Col>
                                );
                            })}
                        </Row>

                        <div className="mt-4 pt-3 border-top d-flex justify-content-end align-items-center gap-3">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleStartLookup}
                                disabled={isProcessing}
                                className="d-inline-flex align-items-center gap-2 px-4 shadow-sm"
                            >
                                {isProcessing ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm" role="status" />
                                        <span>กำลังประมวลผล...</span>
                                    </>
                                ) : (
                                    <>
                                        <IconifyIcon icon="tabler:database-search" className="fs-20" />
                                        <span>เริ่มดึงข้อมูลจาก HOSxP ({parsedRows.length.toLocaleString()} รายการ)</span>
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Progress Bar */}
                        {isProcessing && (
                            <div className="mt-4 p-3 bg-light rounded border">
                                <div className="d-flex justify-content-between mb-1">
                                    <span className="fw-semibold text-primary">{progressStatus}</span>
                                    <span className="fw-bold">{progress}%</span>
                                </div>
                                <ProgressBar animated now={progress} variant="primary" style={{ height: '10px' }} />
                            </div>
                        )}
                    </CardBody>
                </Card>
            )}

            {/* ─────────────────────────────────────────────────────────────
                STEP 3: RESULTS & EXPORT
            ───────────────────────────────────────────────────────────── */}
            {enrichedResults.length > 0 && stats && (
                <Card className="shadow-sm border-0 mb-5">
                    <CardHeader className="bg-white py-3 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-3">
                        <div>
                            <h5 className="card-title mb-0 text-dark d-flex align-items-center gap-2">
                                <IconifyIcon icon="tabler:table-export" className="fs-22 text-success" />
                                <span>ขั้นตอนที่ 3: ตรวจสอบผลลัพธ์และส่งออกไฟล์ (Export)</span>
                            </h5>
                        </div>

                        {/* Export Buttons */}
                        <div className="d-flex align-items-center gap-2">
                            <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleExport('xlsx')}
                                className="d-inline-flex align-items-center gap-1 shadow-sm px-3"
                            >
                                <IconifyIcon icon="tabler:file-spreadsheet" className="fs-18" />
                                <span>ส่งออกเป็น Excel (.xlsx)</span>
                            </Button>
                            <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleExport('csv')}
                                className="d-inline-flex align-items-center gap-1 shadow-sm px-3"
                            >
                                <IconifyIcon icon="tabler:file-type-csv" className="fs-18" />
                                <span>ส่งออกเป็น CSV (.csv)</span>
                            </Button>
                        </div>
                    </CardHeader>

                    <CardBody>
                        {/* Summary Badges & Filter Tabs */}
                        <Row className="g-3 mb-3 align-items-center">
                            <Col md={7}>
                                <div className="d-flex flex-wrap gap-2">
                                    <Button
                                        variant={activeFilter === 'all' ? 'primary' : 'outline-secondary'}
                                        size="sm"
                                        onClick={() => { setActiveFilter('all'); setCurrentPage(1); }}
                                    >
                                        ทั้งหมด ({stats.total.toLocaleString()})
                                    </Button>

                                    {selectedDateCol && stats.exactVisit > 0 && (
                                        <Button
                                            variant={activeFilter === 'exact_visit' ? 'success' : 'outline-success'}
                                            size="sm"
                                            onClick={() => { setActiveFilter('exact_visit'); setCurrentPage(1); }}
                                        >
                                            <IconifyIcon icon="tabler:calendar-check" className="me-1" />
                                            ตรวจตรงวัน ({stats.exactVisit.toLocaleString()})
                                        </Button>
                                    )}

                                    {selectedDateCol && stats.dateNotFound > 0 && (
                                        <Button
                                            variant={activeFilter === 'date_not_found' ? 'warning' : 'outline-warning'}
                                            size="sm"
                                            onClick={() => { setActiveFilter('date_not_found'); setCurrentPage(1); }}
                                        >
                                            <IconifyIcon icon="tabler:calendar-x" className="me-1" />
                                            ไม่พบตรวจตรงวัน ({stats.dateNotFound.toLocaleString()})
                                        </Button>
                                    )}

                                    <Button
                                        variant={activeFilter === 'matched' ? 'info' : 'outline-info'}
                                        size="sm"
                                        onClick={() => { setActiveFilter('matched'); setCurrentPage(1); }}
                                    >
                                        <IconifyIcon icon="tabler:check" className="me-1" />
                                        พบใน HOSxP ({stats.matched.toLocaleString()})
                                    </Button>

                                    <Button
                                        variant={activeFilter === 'not_found' ? 'danger' : 'outline-danger'}
                                        size="sm"
                                        onClick={() => { setActiveFilter('not_found'); setCurrentPage(1); }}
                                    >
                                        <IconifyIcon icon="tabler:x" className="me-1" />
                                        ไม่พบ HN ({stats.notFound.toLocaleString()})
                                    </Button>
                                </div>
                            </Col>

                            <Col md={5}>
                                <div className="input-group input-group-sm">
                                    <span className="input-group-text bg-white">
                                        <IconifyIcon icon="tabler:search" />
                                    </span>
                                    <Form.Control
                                        type="text"
                                        placeholder="ค้นหา HN, ชื่อผู้ป่วย, เลขบัตรประชาชน, รหัสโรค..."
                                        value={searchTerm}
                                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    />
                                    {searchTerm && (
                                        <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
                                            ล้าง
                                        </Button>
                                    )}
                                </div>
                            </Col>
                        </Row>

                        {/* Interactive Data Table */}
                        <div className="table-responsive border rounded mb-3" style={{ maxHeight: '600px' }}>
                            <Table hover striped className="align-middle mb-0 text-nowrap fs-13">
                                <thead className="table-light sticky-top">
                                    <tr>
                                        <th style={{ width: '50px' }} className="text-center">#</th>
                                        <th>สถานะ HOSxP</th>
                                        {/* คอลัมน์เดิมจากไฟล์ (ถ้าเลือก) */}
                                        {includeOriginalCols && (
                                            <>
                                                <th>[ไฟล์] HN</th>
                                                {selectedDateCol && <th>[ไฟล์] วันที่</th>}
                                            </>
                                        )}
                                        {/* ฟิลด์ที่เลือกจาก HOSxP */}
                                        {FIELD_DEFINITIONS.filter(f => selectedFields[f.id]).map(f => (
                                            <th key={f.id}>{f.label}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedResults.length === 0 ? (
                                        <tr>
                                            <td colSpan={10} className="text-center py-5 text-muted">
                                                <IconifyIcon icon="tabler:search-off" className="fs-36 mb-2 d-block mx-auto" />
                                                ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedResults.map((r, rIdx) => {
                                            const globalIndex = (currentPage - 1) * pageSize + rIdx + 1;
                                            return (
                                                <tr key={r.row_id ?? rIdx}>
                                                    <td className="text-center text-muted">{globalIndex}</td>
                                                    <td>
                                                        {r.matched ? (
                                                            r.match_type === 'exact_visit' ? (
                                                                <Badge bg="success-subtle" className="text-success border border-success-subtle">
                                                                    <IconifyIcon icon="tabler:check" className="me-1" />
                                                                    พบข้อมูลตรวจตรงวัน
                                                                </Badge>
                                                            ) : r.match_type === 'date_not_found' ? (
                                                                <Badge bg="warning-subtle" className="text-warning border border-warning-subtle">
                                                                    <IconifyIcon icon="tabler:calendar-x" className="me-1" />
                                                                    ไม่พบตรวจในวันที่ระบุ
                                                                </Badge>
                                                            ) : r.match_type === 'fallback_latest_visit' ? (
                                                                <Badge bg="warning-subtle" className="text-dark border border-warning-subtle">
                                                                    <IconifyIcon icon="tabler:clock-share" className="me-1" />
                                                                    พบ (ใช้วันตรวจล่าสุดแทน)
                                                                </Badge>
                                                            ) : r.match_type === 'latest_visit' ? (
                                                                <Badge bg="info-subtle" className="text-info border border-info-subtle">
                                                                    <IconifyIcon icon="tabler:history" className="me-1" />
                                                                    พบ (ตรวจล่าสุด)
                                                                </Badge>
                                                            ) : (
                                                                <Badge bg="primary-subtle" className="text-primary border border-primary-subtle">
                                                                    <IconifyIcon icon="tabler:user-check" className="me-1" />
                                                                    พบเฉพาะประวัติ
                                                                </Badge>
                                                            )
                                                        ) : (
                                                            <Badge bg="danger-subtle" className="text-danger border border-danger-subtle">
                                                                <IconifyIcon icon="tabler:x" className="me-1" />
                                                                ไม่พบใน HOSxP
                                                            </Badge>
                                                        )}
                                                    </td>

                                                    {/* คอลัมน์เดิมจากไฟล์ */}
                                                    {includeOriginalCols && (
                                                        <>
                                                            <td className="font-monospace text-muted">{r.original_hn || '-'}</td>
                                                            {selectedDateCol && <td className="text-muted">{r.original_vstdate || '-'}</td>}
                                                        </>
                                                    )}

                                                    {/* ฟิลด์จาก HOSxP */}
                                                    {FIELD_DEFINITIONS.filter(f => selectedFields[f.id]).map(f => {
                                                        const val = f.getValue(r);
                                                        return (
                                                            <td key={f.id}>
                                                                {val !== '' && val !== null && val !== undefined ? (
                                                                    String(val)
                                                                ) : (
                                                                    <span className="text-muted">-</span>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </Table>
                        </div>

                        {/* Pagination Bar */}
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                            <span className="text-muted fs-13">
                                แสดงแถวที่ {Math.min((currentPage - 1) * pageSize + 1, filteredResults.length)} ถึง{' '}
                                {Math.min(currentPage * pageSize, filteredResults.length)} จากทั้งหมด{' '}
                                <strong>{filteredResults.length.toLocaleString()}</strong> รายการ
                            </span>
                            <div className="d-flex align-items-center gap-1">
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                >
                                    ก่อนหน้า
                                </Button>
                                <span className="px-2 fs-13 fw-semibold">
                                    หน้า {currentPage} / {totalPages}
                                </span>
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                >
                                    ถัดไป
                                </Button>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}
        </MainLayout>
    );
};

export default DataEnrichmentPage;
