// ฟังก์ชันจัดรูปแบบข้อความภาษาไทย (เขียนเองเพื่อไม่ต้องพึ่ง Intl)

const THAI_DAYS = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
const THAI_MONTHS = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

export function formatPrice(value) {
  const n = Number(value) || 0;
  return '฿' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'เมื่อสักครู่';
  if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)} วันที่แล้ว`;
  return formatDate(iso);
}

// รับ 'YYYY-MM-DD' หรือ ISO แล้วคืน 'พฤ. 20 พ.ย.'
export function formatDate(value) {
  const d = toDate(value);
  return `${THAI_DAYS[d.getDay()]} ${d.getDate()} ${THAI_MONTHS[d.getMonth()]}`;
}

export function formatMonthYear(iso) {
  const d = new Date(iso);
  return `${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`;
}

export function formatClock(iso) {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// คืนค่า 'YYYY-MM-DD' ของวันที่ห่างจากวันนี้ n วัน
export function dateKey(daysFromToday = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function isoAgo(minutes) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

function toDate(value) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(value);
}

function pad(n) {
  return n < 10 ? '0' + n : String(n);
}

let counter = 0;
export function makeId(prefix) {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}${counter}`;
}
