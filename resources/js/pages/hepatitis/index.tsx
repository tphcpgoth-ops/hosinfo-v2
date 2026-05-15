import React, { useState, useEffect } from 'react';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import MainLayout from '@/layouts/MainLayout';
import { Link, router, usePage, useForm } from '@inertiajs/react';
import { Button, Card, Col, Row, Modal, Form, ButtonGroup, ToggleButton, ListGroup, InputGroup } from 'react-bootstrap';
import Swal from 'sweetalert2';
import CustomFlatpickr from '@/components/CustomFlatpickr';

const HepatitisIndexPage = ({ screenings }: { screenings: any[] }) => {
    const { props } = usePage();
    const [showImport, setShowImport] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Form Mode State
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // Import Form
    const importForm = useForm({
        file: null as File | null,
    });

    // Data Form
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        full_name: '',
        age: '',
        cid: '',
        address: '',
        phone: '',
        hospital_name: '',
        hbv_positive: '',
        hcv_positive: '',
        hospital_entry_status: '',
        hbv_treatment_status: '',
        hbv_medication: '',
        hbv_follow_up: '',
        hcv_medication: '',
        hcv_follow_up: '',
        ultrasound: '',
        referral: '',
        diagnosis: '',
        remarks: ''
    });

    // Filtered Screenings
    const filteredScreenings = screenings.filter(s => 
        (s.full_name && s.full_name.includes(searchTerm)) || 
        (s.cid && s.cid.includes(searchTerm))
    );

    const handleSelectPatient = (patient: any) => {
        setFormMode('edit');
        setSelectedId(patient.id);
        clearErrors();
        
        setData({
            full_name: patient.full_name || '',
            age: patient.age || '',
            cid: patient.cid || '',
            address: patient.address || '',
            phone: patient.phone || '',
            hospital_name: patient.hospital_name || '',
            hbv_positive: patient.hbv_positive || '',
            hcv_positive: patient.hcv_positive || '',
            hospital_entry_status: patient.hospital_entry_status || '',
            hbv_treatment_status: patient.hbv_treatment_status || '',
            hbv_medication: patient.hbv_medication || '',
            hbv_follow_up: patient.hbv_follow_up || '',
            hcv_medication: patient.hcv_medication || '',
            hcv_follow_up: patient.hcv_follow_up || '',
            ultrasound: patient.ultrasound || '',
            referral: patient.referral || '',
            diagnosis: patient.diagnosis || '',
            remarks: patient.remarks || ''
        });
    };

    const handleCreateNew = () => {
        setFormMode('create');
        setSelectedId(null);
        clearErrors();
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formMode === 'create') {
            post(route('hepatitis.store'), {
                onSuccess: () => {
                    Swal.fire('สำเร็จ', 'บันทึกข้อมูลเรียบร้อยแล้ว', 'success');
                    handleCreateNew(); // clear form
                }
            });
        } else {
            put(route('hepatitis.update', selectedId), {
                onSuccess: () => {
                    Swal.fire('สำเร็จ', 'แก้ไขข้อมูลเรียบร้อยแล้ว', 'success');
                }
            });
        }
    };

    const handleDelete = (id: number, name: string) => {
        Swal.fire({
            title: 'คุณแน่ใจหรือไม่?',
            text: `ต้องการลบข้อมูลของ ${name} ใช่หรือไม่?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ใช่, ลบเลย!',
            cancelButtonText: 'ยกเลิก',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('hepatitis.destroy', id), {
                    onSuccess: () => {
                        Swal.fire('ลบสำเร็จ!', 'ข้อมูลถูกลบเรียบร้อยแล้ว.', 'success');
                        if (selectedId === id) handleCreateNew();
                    },
                });
            }
        });
    };

    const handleImport = (e: React.FormEvent) => {
        e.preventDefault();
        importForm.post(route('hepatitis.import'), {
            onSuccess: () => {
                setShowImport(false);
                importForm.reset();
                Swal.fire('สำเร็จ', 'นำเข้าข้อมูลเรียบร้อยแล้ว', 'success');
            },
        });
    };

    return (
        <MainLayout>
            <PageTitle title="ข้อมูลการตรวจคัดกรองไวรัสตับอักเสบ บี และ ซี" subTitle="ระบบจัดการ" />
            <Row>
                {/* Left Column: List */}
                <Col md={4} lg={3} className="mb-3">
                    <Card className="h-100">
                        <Card.Header className="bg-light border-bottom border-light pb-2">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h5 className="header-title mb-0">รายชื่อผู้ป่วย</h5>
                                <div className="d-flex gap-1">
                                    <Button variant="primary" size="sm" onClick={() => setShowImport(true)} title="นำเข้า Excel">
                                        <IconifyIcon icon="tabler:file-upload" />
                                    </Button>
                                    <Button variant="success" size="sm" onClick={handleCreateNew} title="เพิ่มข้อมูลใหม่">
                                        <IconifyIcon icon="tabler:plus" />
                                    </Button>
                                </div>
                            </div>
                            <InputGroup size="sm">
                                <InputGroup.Text><IconifyIcon icon="tabler:search" /></InputGroup.Text>
                                <Form.Control 
                                    placeholder="ค้นหาชื่อ, เลขบัตร..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Card.Header>
                        <Card.Body className="p-0" style={{ height: '700px', overflowY: 'auto' }}>
                            <ListGroup variant="flush">
                                {filteredScreenings.length > 0 ? filteredScreenings.map(s => (
                                    <ListGroup.Item 
                                        key={s.id} 
                                        action 
                                        active={selectedId === s.id} 
                                        onClick={() => handleSelectPatient(s)}
                                        className="d-flex justify-content-between align-items-center py-2"
                                    >
                                        <div>
                                            <div className="fw-semibold text-truncate" style={{ maxWidth: '200px' }}>{s.full_name}</div>
                                            <small className={selectedId === s.id ? 'text-white-50' : 'text-muted'}>{s.cid || 'ไม่มีเลขบัตร'}</small>
                                        </div>
                                        <Button 
                                            variant="link" 
                                            className={`p-0 text-${selectedId === s.id ? 'white' : 'danger'}`} 
                                            onClick={(e) => { e.stopPropagation(); handleDelete(s.id, s.full_name); }}
                                        >
                                            <IconifyIcon icon="tabler:trash" />
                                        </Button>
                                    </ListGroup.Item>
                                )) : (
                                    <div className="text-center p-3 text-muted">ไม่พบข้อมูล</div>
                                )}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Right Column: Form */}
                <Col md={8} lg={9}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h4 className="header-title">
                                {formMode === 'create' ? 'เพิ่มข้อมูลใหม่' : 'แก้ไขข้อมูล'}
                            </h4>
                            {formMode === 'edit' && (
                                <Button variant="secondary" size="sm" onClick={handleCreateNew}>
                                    ยกเลิกการแก้ไข (เพิ่มใหม่)
                                </Button>
                            )}
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Label>ชื่อ-สกุล <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="text" value={data.full_name} onChange={e => setData('full_name', e.target.value)} isInvalid={!!errors.full_name} />
                                            <Form.Control.Feedback type="invalid">{errors.full_name}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Group>
                                            <Form.Label>อายุ</Form.Label>
                                            <Form.Control type="number" value={data.age} onChange={e => setData('age', e.target.value)} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>เลขบัตรประชาชน</Form.Label>
                                            <Form.Control type="text" maxLength={13} value={data.cid} onChange={e => setData('cid', e.target.value)} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>รพ.สต</Form.Label>
                                            <Form.Control type="text" value={data.hospital_name} onChange={e => setData('hospital_name', e.target.value)} />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={8}>
                                        <Form.Group>
                                            <Form.Label>ที่อยู่</Form.Label>
                                            <Form.Control type="text" value={data.address} onChange={e => setData('address', e.target.value)} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Label>เบอร์โทร</Form.Label>
                                            <Form.Control type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <hr/>

                                <h5 className="mb-3">ผลการตรวจและติดตาม</h5>
                                <Row className="mb-3">
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>ผลตรวจ HBV</Form.Label>
                                            <div>
                                                <ButtonGroup>
                                                    <ToggleButton
                                                        id="hbv-pos-c"
                                                        type="radio"
                                                        variant={data.hbv_positive === 'Positive' ? 'danger' : 'outline-danger'}
                                                        name="hbv_positive"
                                                        value="Positive"
                                                        checked={data.hbv_positive === 'Positive'}
                                                        onChange={(e) => setData('hbv_positive', e.currentTarget.value)}
                                                    >
                                                        Positive
                                                    </ToggleButton>
                                                    <ToggleButton
                                                        id="hbv-neg-c"
                                                        type="radio"
                                                        variant={data.hbv_positive === 'Negative' ? 'success' : 'outline-success'}
                                                        name="hbv_positive"
                                                        value="Negative"
                                                        checked={data.hbv_positive === 'Negative'}
                                                        onChange={(e) => setData('hbv_positive', e.currentTarget.value)}
                                                    >
                                                        Negative
                                                    </ToggleButton>
                                                </ButtonGroup>
                                            </div>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>ผลตรวจ HCV</Form.Label>
                                            <div>
                                                <ButtonGroup>
                                                    <ToggleButton
                                                        id="hcv-pos-c"
                                                        type="radio"
                                                        variant={data.hcv_positive === 'Positive' ? 'danger' : 'outline-danger'}
                                                        name="hcv_positive"
                                                        value="Positive"
                                                        checked={data.hcv_positive === 'Positive'}
                                                        onChange={(e) => setData('hcv_positive', e.currentTarget.value)}
                                                    >
                                                        Positive
                                                    </ToggleButton>
                                                    <ToggleButton
                                                        id="hcv-neg-c"
                                                        type="radio"
                                                        variant={data.hcv_positive === 'Negative' ? 'success' : 'outline-success'}
                                                        name="hcv_positive"
                                                        value="Negative"
                                                        checked={data.hcv_positive === 'Negative'}
                                                        onChange={(e) => setData('hcv_positive', e.currentTarget.value)}
                                                    >
                                                        Negative
                                                    </ToggleButton>
                                                </ButtonGroup>
                                            </div>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>เข้าสู่ระบบ รพ.</Form.Label>
                                            <div>
                                                <ButtonGroup>
                                                    <ToggleButton
                                                        id="entry-status-1-c"
                                                        type="radio"
                                                        variant={data.hospital_entry_status === 'มา' ? 'primary' : 'outline-primary'}
                                                        name="hospital_entry_status"
                                                        value="มา"
                                                        checked={data.hospital_entry_status === 'มา'}
                                                        onChange={(e) => setData('hospital_entry_status', e.currentTarget.value)}
                                                    >
                                                        มา
                                                    </ToggleButton>
                                                    <ToggleButton
                                                        id="entry-status-2-c"
                                                        type="radio"
                                                        variant={data.hospital_entry_status === 'ไม่มา' ? 'danger' : 'outline-danger'}
                                                        name="hospital_entry_status"
                                                        value="ไม่มา"
                                                        checked={data.hospital_entry_status === 'ไม่มา'}
                                                        onChange={(e) => setData('hospital_entry_status', e.currentTarget.value)}
                                                    >
                                                        ไม่มา
                                                    </ToggleButton>
                                                    <ToggleButton
                                                        id="entry-status-3-c"
                                                        type="radio"
                                                        variant={data.hospital_entry_status === 'รักษาที่อื่น' ? 'info' : 'outline-info'}
                                                        name="hospital_entry_status"
                                                        value="รักษาที่อื่น"
                                                        checked={data.hospital_entry_status === 'รักษาที่อื่น'}
                                                        onChange={(e) => setData('hospital_entry_status', e.currentTarget.value)}
                                                    >
                                                        รักษาที่อื่น
                                                    </ToggleButton>
                                                    <ToggleButton
                                                        id="entry-status-4-c"
                                                        type="radio"
                                                        variant={data.hospital_entry_status === 'ติดต่อไม่ได้' ? 'secondary' : 'outline-secondary'}
                                                        name="hospital_entry_status"
                                                        value="ติดต่อไม่ได้"
                                                        checked={data.hospital_entry_status === 'ติดต่อไม่ได้'}
                                                        onChange={(e) => setData('hospital_entry_status', e.currentTarget.value)}
                                                    >
                                                        ติดต่อไม่ได้
                                                    </ToggleButton>
                                                </ButtonGroup>
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <hr/>

                                <Row className="mb-3">
                                    <Col md={6}>
                                        <h6>เข้าสู่การรักษา HBV</h6>
                                        <Row>
                                            <Col md={12}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label>สถานะการรักษา (HBV)</Form.Label>
                                                    <div>
                                                        <ButtonGroup>
                                                            <ToggleButton
                                                                id="hbv-status-vl-c"
                                                                type="radio"
                                                                variant={data.hbv_treatment_status === 'VL' ? 'primary' : 'outline-primary'}
                                                                name="hbv_treatment_status"
                                                                value="VL"
                                                                checked={data.hbv_treatment_status === 'VL'}
                                                                onChange={(e) => setData('hbv_treatment_status', e.currentTarget.value)}
                                                            >
                                                                VL
                                                            </ToggleButton>
                                                            <ToggleButton
                                                                id="hbv-status-nonvl-c"
                                                                type="radio"
                                                                variant={data.hbv_treatment_status === 'NonVL' ? 'secondary' : 'outline-secondary'}
                                                                name="hbv_treatment_status"
                                                                value="NonVL"
                                                                checked={data.hbv_treatment_status === 'NonVL'}
                                                                onChange={(e) => setData('hbv_treatment_status', e.currentTarget.value)}
                                                            >
                                                                NonVL
                                                            </ToggleButton>
                                                        </ButtonGroup>
                                                    </div>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>ได้รับยา (HBV)</Form.Label>
                                                    <CustomFlatpickr className="form-control" value={data.hbv_medication} options={{ enableTime: false, dateFormat: "Y-m-d" }} onChange={(date: any, dateStr: string) => setData('hbv_medication', dateStr)} placeholder="เลือกวันที่..." />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>ติดตามอาการ (HBV)</Form.Label>
                                                    <CustomFlatpickr className="form-control" value={data.hbv_follow_up} options={{ enableTime: false, dateFormat: "Y-m-d" }} onChange={(date: any, dateStr: string) => setData('hbv_follow_up', dateStr)} placeholder="เลือกวันที่..." />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col md={6}>
                                        <h6>เข้าสู่การรักษา HCV</h6>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label>ได้รับยา (HCV)</Form.Label>
                                                    <CustomFlatpickr className="form-control" value={data.hcv_medication} options={{ enableTime: false, dateFormat: "Y-m-d" }} onChange={(date: any, dateStr: string) => setData('hcv_medication', dateStr)} placeholder="เลือกวันที่..." />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label>ติดตามอาการ (HCV)</Form.Label>
                                                    <CustomFlatpickr className="form-control" value={data.hcv_follow_up} options={{ enableTime: false, dateFormat: "Y-m-d" }} onChange={(date: any, dateStr: string) => setData('hcv_follow_up', dateStr)} placeholder="เลือกวันที่..." />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>

                                <hr/>

                                <Row className="mb-3">
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>U/S</Form.Label>
                                            <CustomFlatpickr className="form-control" value={data.ultrasound} options={{ enableTime: false, dateFormat: "Y-m-d" }} onChange={(date: any, dateStr: string) => setData('ultrasound', dateStr)} placeholder="เลือกวันที่..." />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>Refer</Form.Label>
                                            <CustomFlatpickr className="form-control" value={data.referral} options={{ enableTime: false, dateFormat: "Y-m-d" }} onChange={(date: any, dateStr: string) => setData('referral', dateStr)} placeholder="เลือกวันที่..." />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Diagnosis</Form.Label>
                                            <Form.Control type="text" value={data.diagnosis} onChange={e => setData('diagnosis', e.target.value)} />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row className="mb-4">
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label>หมายเหตุ</Form.Label>
                                            <Form.Control as="textarea" rows={2} value={data.remarks} onChange={e => setData('remarks', e.target.value)} />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Button variant="primary" type="submit" disabled={processing}>
                                    <IconifyIcon icon="tabler:device-floppy" className="me-1"/> บันทึกข้อมูล
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Import Modal */}
            <Modal show={showImport} onHide={() => setShowImport(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>นำเข้าข้อมูลจาก Excel</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleImport}>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label>เลือกไฟล์ Excel (.xlsx, .csv)</Form.Label>
                            <Form.Control 
                                type="file" 
                                accept=".xlsx,.csv" 
                                onChange={(e: any) => importForm.setData('file', e.target.files[0])}
                                isInvalid={!!importForm.errors.file}
                            />
                            <Form.Control.Feedback type="invalid">{importForm.errors.file}</Form.Control.Feedback>
                            <Form.Text className="text-muted">
                                ข้อมูลในไฟล์ Excel ควรมีรูปแบบเดียวกับแบบฟอร์มมาตรฐาน
                            </Form.Text>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowImport(false)}>
                            ยกเลิก
                        </Button>
                        <Button variant="primary" type="submit" disabled={importForm.processing || !importForm.data.file}>
                            {importForm.processing ? 'กำลังนำเข้า...' : 'อัปโหลด'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

        </MainLayout>
    );
};

export default HepatitisIndexPage;
