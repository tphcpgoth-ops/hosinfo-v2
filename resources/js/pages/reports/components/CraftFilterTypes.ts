export interface CraftOption {
    label: string;
    value: string;
    sql: string;
    is_default?: boolean;
}

export interface CraftFilter {
    id: string;
    name: string; // ชื่อตัวแปร เช่น opdipd (อ้างอิงเป็น {{opdipd}} ใน SQL)
    label: string; // ป้ายชื่อแสดงให้ผู้ใช้เห็น เช่น ประเภทผู้ป่วย (OPD / IPD)
    type: 'radio' | 'select'; // รูปแบบปุ่มตัวเลือก
    default_value: string; // ค่าเริ่มต้น
    options: CraftOption[]; // รายการตัวเลือกและ SQL Snippet
}
