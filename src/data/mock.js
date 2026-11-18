// ข้อมูลจำลอง (mock) สำหรับรอบแรก — ยังไม่ได้ต่อ Supabase
// เมื่อต่อ backend จริง ข้อมูลชุดนี้จะถูกแทนด้วยตารางในฐานข้อมูล
import { dateKey, isoAgo } from '../utils/format';

// TODO: ตรวจสอบโดเมนอีเมลนักศึกษา มทส. ที่ใช้จริงอีกครั้งก่อนเปิดใช้งาน
export const ALLOWED_EMAIL_DOMAIN = 'g.sut.ac.th';

// รหัสยืนยันจำลอง ใช้เฉพาะตอนพัฒนา
export const MOCK_OTP = '123456';

export const CURRENT_USER_ID = 'u1';

export const categories = [
  { id: 'clothing', name: 'เสื้อผ้า', icon: 'shirt-outline' },
  { id: 'books', name: 'หนังสือ/ชีท', icon: 'book-outline' },
  { id: 'electronics', name: 'อิเล็กทรอนิกส์', icon: 'laptop-outline' },
  { id: 'dorm', name: 'ของใช้ในหอ', icon: 'bed-outline' },
  { id: 'sports', name: 'กีฬา', icon: 'football-outline' },
  { id: 'beauty', name: 'ความงาม', icon: 'sparkles-outline' },
  { id: 'others', name: 'อื่นๆ', icon: 'cube-outline' },
];

// คอลเลกชันแนะนำบนหน้าแรก — กดแล้วไปหน้าค้นหาพร้อมตัวกรอง
export const collections = [
  { id: 'under300', title: 'ต่ำกว่า ฿300', subtitle: 'ของดีราคาเบา', icon: 'pricetag-outline', bg: '#FFE3E8', params: { maxPrice: '300' } },
  { id: 'dorm', title: 'ย้ายหอ', subtitle: 'ของใช้ครบจบ', icon: 'bed-outline', bg: '#CFE0FF', params: { categoryId: 'dorm' } },
  { id: 'exam', title: 'ชีทสอบ', subtitle: 'ส่งต่อรุ่นน้อง', icon: 'book-outline', bg: '#F3EBDD', params: { categoryId: 'books' } },
];

export const conditions = [
  { id: 'like_new', name: 'เหมือนใหม่' },
  { id: 'good', name: 'สภาพดี' },
  { id: 'fair', name: 'มีตำหนิเล็กน้อย' },
  { id: 'used', name: 'ผ่านการใช้งานมาก' },
];

// จุดนัดรับตัวอย่างในมหาวิทยาลัย — ปรับชื่อให้ตรงกับสถานที่จริงได้
export const meetupSpots = [
  { id: 's1', name: 'หน้าอาคารเรียนรวม 1', zone: 'โซนอาคารเรียน' },
  { id: 's2', name: 'หน้าอาคารเรียนรวม 2', zone: 'โซนอาคารเรียน' },
  { id: 's3', name: 'หน้าศูนย์บรรณสารฯ (ห้องสมุด)', zone: 'โซนอาคารเรียน' },
  { id: 's4', name: 'โรงอาหารกลาง', zone: 'โซนโรงอาหาร' },
  { id: 's5', name: 'หน้าหอพักสุรนิเวศ', zone: 'โซนหอพัก' },
  { id: 's6', name: 'อาคารกิจการนักศึกษา', zone: 'โซนกิจกรรม' },
];

export const timeSlots = [
  '08:00', '10:00', '12:00', '13:00', '15:00', '16:30', '17:30', '19:00',
];

export const users = {
  u1: {
    id: 'u1',
    name: 'มินท์',
    faculty: 'สำนักวิชาศาสตร์และศิลป์ดิจิทัล',
    bio: 'ขายของที่ไม่ได้ใช้แล้ว นัดรับแถวอาคารเรียนรวมได้ค่ะ',
    joinedAt: isoAgo(60 * 24 * 120),
    rating: 4.9,
    reviewCount: 12,
    avatarColor: '#F2A541',
  },
  u2: {
    id: 'u2',
    name: 'ต้นกล้า',
    faculty: 'สำนักวิชาวิศวกรรมศาสตร์',
    bio: 'ปี 4 ย้ายหอ ขายของถูกๆ',
    joinedAt: isoAgo(60 * 24 * 300),
    rating: 4.7,
    reviewCount: 23,
    avatarColor: '#6C8EBF',
  },
  u3: {
    id: 'u3',
    name: 'ปลายฟ้า',
    faculty: 'สำนักวิชาเทคโนโลยีการเกษตร',
    bio: 'ชอบเสื้อผ้าวินเทจ',
    joinedAt: isoAgo(60 * 24 * 45),
    rating: 5.0,
    reviewCount: 4,
    avatarColor: '#C97B84',
  },
  u4: {
    id: 'u4',
    name: 'บอส',
    faculty: 'สำนักวิชาวิทยาศาสตร์',
    bio: '',
    joinedAt: isoAgo(60 * 24 * 20),
    rating: 0,
    reviewCount: 0,
    avatarColor: '#5B9A8B',
  },
};

// images: [] = ยังไม่มีรูป แอปจะแสดงภาพแทนตามหมวด
export const listings = [
  {
    id: 'l1',
    title: 'เสื้อช็อปวิศวะ ไซซ์ L ใส่ไม่กี่ครั้ง',
    price: 250,
    categoryId: 'clothing',
    condition: 'like_new',
    size: 'L',
    brand: '',
    description: 'ซื้อมาผิดไซซ์ ใส่ไป 2 ครั้ง ซักแล้ว ไม่มีกลิ่น',
    defects: '',
    images: [],
    tint: '#D6E0F0',
    sellerId: 'u2',
    meetupSpotIds: ['s1', 's4'],
    status: 'available',
    createdAt: isoAgo(35),
    likes: 6,
  },
  {
    id: 'l2',
    title: 'Calculus เล่ม 1 + ชีทสรุป',
    price: 180,
    categoryId: 'books',
    condition: 'good',
    description: 'มีไฮไลต์บางหน้า ชีทสรุปครบทุกบท ใช้สอบผ่านมาแล้ว',
    defects: 'มีรอยไฮไลต์บางหน้า',
    images: [],
    tint: '#F3E3C3',
    sellerId: 'u3',
    meetupSpotIds: ['s3'],
    status: 'available',
    createdAt: isoAgo(60 * 5),
    likes: 11,
  },
  {
    id: 'l3',
    title: 'พัดลมตั้งโต๊ะ 12 นิ้ว',
    price: 300,
    categoryId: 'dorm',
    condition: 'good',
    description: 'ใช้งานปกติ ปรับได้ 3 ระดับ ส่ายได้',
    defects: '',
    images: [],
    tint: '#DDEEE6',
    sellerId: 'u2',
    meetupSpotIds: ['s5'],
    status: 'reserved',
    createdAt: isoAgo(60 * 26),
    likes: 3,
  },
  {
    id: 'l4',
    title: 'หูฟังไร้สาย ยังใช้ได้ดี',
    price: 650,
    categoryId: 'electronics',
    condition: 'fair',
    description: 'แบตยังอยู่ได้ประมาณ 4 ชม. มีกล่องและสายชาร์จ',
    defects: 'เคสมีรอยขีดข่วน',
    images: [],
    tint: '#E4E1F2',
    sellerId: 'u4',
    meetupSpotIds: ['s2', 's6'],
    status: 'available',
    createdAt: isoAgo(60 * 30),
    likes: 9,
  },
  {
    id: 'l5',
    title: 'เดรสลายดอก วินเทจ Freesize',
    price: 190,
    categoryId: 'clothing',
    condition: 'like_new',
    size: 'Freesize',
    brand: '',
    description: 'ผ้าเบาใส่สบาย อก 36 ยาว 40 นิ้ว',
    defects: '',
    images: [],
    tint: '#F6DCE0',
    sellerId: 'u3',
    meetupSpotIds: ['s4', 's5'],
    status: 'available',
    createdAt: isoAgo(60 * 48),
    likes: 14,
  },
  {
    id: 'l6',
    title: 'ลูกบอลฟุตซอล',
    price: 220,
    categoryId: 'sports',
    condition: 'used',
    description: 'ใช้เตะกับเพื่อน ยังอัดลมได้ปกติ',
    defects: 'ผิวลอกบางจุด',
    images: [],
    tint: '#E2EEDC',
    sellerId: 'u4',
    meetupSpotIds: ['s6'],
    status: 'available',
    createdAt: isoAgo(60 * 72),
    likes: 1,
  },
  {
    id: 'l7',
    title: 'โคมไฟอ่านหนังสือ LED',
    price: 150,
    categoryId: 'dorm',
    condition: 'good',
    description: 'ปรับแสงได้ 3 สี ใช้สาย USB',
    defects: '',
    images: [],
    tint: '#FBF0D2',
    sellerId: 'u1',
    meetupSpotIds: ['s1', 's3'],
    status: 'available',
    createdAt: isoAgo(60 * 20),
    likes: 4,
  },
  {
    id: 'l8',
    title: 'เสื้อฮู้ดสีครีม ไซซ์ M',
    price: 280,
    categoryId: 'clothing',
    condition: 'good',
    size: 'M',
    brand: 'Uniqlo',
    description: 'ใส่หน้าหนาวไม่กี่ครั้ง',
    defects: '',
    images: [],
    tint: '#EFE6D4',
    sellerId: 'u1',
    meetupSpotIds: ['s4'],
    status: 'sold',
    createdAt: isoAgo(60 * 24 * 9),
    likes: 7,
  },
  {
    id: 'l9',
    title: 'Mouse ไร้สาย',
    price: 120,
    categoryId: 'electronics',
    condition: 'good',
    description: 'ใช้ถ่าน AA 1 ก้อน',
    defects: '',
    images: [],
    tint: '#DCE6EF',
    sellerId: 'u3',
    meetupSpotIds: ['s2'],
    status: 'sold',
    createdAt: isoAgo(60 * 24 * 12),
    likes: 2,
  },
];

// meetup.status: requested → accepted → completed (หรือ declined / cancelled)
export const meetups = [
  {
    id: 'm1',
    listingId: 'l3',
    buyerId: 'u1',
    sellerId: 'u2',
    spotId: 's5',
    date: dateKey(1),
    time: '17:30',
    note: 'ใส่เสื้อสีขาวนะคะ',
    status: 'accepted',
    confirmedBy: [],
    createdAt: isoAgo(60 * 3),
  },
  {
    id: 'm2',
    listingId: 'l7',
    buyerId: 'u4',
    sellerId: 'u1',
    spotId: 's1',
    date: dateKey(2),
    time: '12:00',
    note: 'ขอนัดหลังเลิกเรียนครับ',
    status: 'requested',
    confirmedBy: [],
    createdAt: isoAgo(40),
  },
  {
    id: 'm3',
    listingId: 'l9',
    buyerId: 'u1',
    sellerId: 'u3',
    spotId: 's2',
    date: dateKey(-5),
    time: '13:00',
    note: '',
    status: 'completed',
    confirmedBy: ['u1', 'u3'],
    createdAt: isoAgo(60 * 24 * 6),
  },
  {
    id: 'm4',
    listingId: 'l8',
    buyerId: 'u2',
    sellerId: 'u1',
    spotId: 's4',
    date: dateKey(-8),
    time: '12:00',
    note: '',
    status: 'completed',
    confirmedBy: ['u1', 'u2'],
    createdAt: isoAgo(60 * 24 * 9),
  },
];

export const threads = [
  {
    id: 't1',
    listingId: 'l3',
    buyerId: 'u1',
    sellerId: 'u2',
    lastReadAt: { u1: isoAgo(5), u2: isoAgo(5) },
    messages: [
      { id: 'x1', senderId: 'u1', text: 'ยังมีของอยู่ไหมคะ', createdAt: isoAgo(60 * 4) },
      { id: 'x2', senderId: 'u2', text: 'ยังมีครับ ใช้งานได้ปกติ', createdAt: isoAgo(60 * 3.9) },
      { id: 'x3', senderId: 'system', text: 'ส่งคำขอนัดรับแล้ว', meetupId: 'm1', createdAt: isoAgo(60 * 3) },
      { id: 'x4', senderId: 'system', text: 'ผู้ขายตอบรับนัดแล้ว', meetupId: 'm1', createdAt: isoAgo(60 * 2) },
      { id: 'x5', senderId: 'u2', text: 'เจอกันหน้าหอนะครับ', createdAt: isoAgo(60 * 2) },
    ],
  },
  {
    id: 't2',
    listingId: 'l7',
    buyerId: 'u4',
    sellerId: 'u1',
    lastReadAt: { u1: isoAgo(120), u4: isoAgo(1) },
    messages: [
      { id: 'y1', senderId: 'u4', text: 'สนใจโคมไฟครับ ลดได้ไหม', createdAt: isoAgo(60) },
      { id: 'y2', senderId: 'system', text: 'ส่งคำขอนัดรับแล้ว', meetupId: 'm2', createdAt: isoAgo(40) },
    ],
  },
];

export const reviews = [
  { id: 'r1', meetupId: 'm4', fromId: 'u2', toId: 'u1', rating: 5, text: 'ของตรงปก นัดตรงเวลา', createdAt: isoAgo(60 * 24 * 7) },
  { id: 'r2', meetupId: 'mx', fromId: 'u3', toId: 'u2', rating: 5, text: 'ใจดีมาก', createdAt: isoAgo(60 * 24 * 20) },
  { id: 'r3', meetupId: 'my', fromId: 'u1', toId: 'u2', rating: 4, text: 'โอเคครับ มาช้านิดหน่อย', createdAt: isoAgo(60 * 24 * 40) },
];

export const notifications = [
  {
    id: 'n1',
    title: 'มีคำขอนัดรับใหม่',
    body: 'บอส ขอนัดรับ "โคมไฟอ่านหนังสือ LED"',
    target: { screen: 'MeetupDetail', params: { meetupId: 'm2' } },
    read: false,
    createdAt: isoAgo(40),
  },
  {
    id: 'n2',
    title: 'ผู้ขายตอบรับนัดแล้ว',
    body: 'นัดรับ "พัดลมตั้งโต๊ะ 12 นิ้ว" พรุ่งนี้ 17:30',
    target: { screen: 'MeetupDetail', params: { meetupId: 'm1' } },
    read: false,
    createdAt: isoAgo(120),
  },
  {
    id: 'n3',
    title: 'อย่าลืมรีวิว',
    body: 'ให้คะแนนการนัดรับ "Mouse ไร้สาย"',
    target: { screen: 'Review', params: { meetupId: 'm3' } },
    read: true,
    createdAt: isoAgo(60 * 24 * 5),
  },
];

export const reportReasons = {
  listing: ['สินค้าต้องห้าม', 'ของปลอม/ละเมิดลิขสิทธิ์', 'ข้อมูลหรือรูปไม่ตรงความจริง', 'สแปม/ลงซ้ำ', 'อื่นๆ'],
  user: ['ไม่มาตามนัด', 'พฤติกรรมไม่เหมาะสม', 'หลอกลวง', 'แอบอ้างเป็นคนอื่น', 'อื่นๆ'],
};

export const cancelReasons = ['ติดธุระ ไปไม่ได้', 'เปลี่ยนใจ', 'ตกลงราคากันไม่ได้', 'อีกฝ่ายไม่ตอบ', 'อื่นๆ'];
