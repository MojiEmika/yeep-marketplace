// เก็บสถานะทั้งแอปไว้ในหน่วยความจำ (รอบแรกใช้ข้อมูลจำลอง)
// ภายหลังจะเปลี่ยนฟังก์ชันในไฟล์นี้ให้เรียก Supabase แทน หน้าจอไม่ต้องแก้มาก
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import * as mock from '../data/mock';
import { makeId } from '../utils/format';

const AppContext = createContext(null);

const ACTIVE_MEETUP = ['requested', 'accepted'];

const AUTO_REPLIES = [
  'ได้เลยค่ะ 😊',
  'โอเคครับ',
  'สะดวกช่วงเย็นนะคะ',
  'ยังอยู่ครับ ทักมาได้เลย',
];

export function AppProvider({ children }) {
  const [userId, setUserId] = useState(null); // null = ยังไม่เข้าสู่ระบบ (Guest)
  const [userEmail, setUserEmail] = useState('');
  const [users, setUsers] = useState(mock.users);
  const [listings, setListings] = useState(mock.listings);
  const [meetups, setMeetups] = useState(mock.meetups);
  const [threads, setThreads] = useState(mock.threads);
  const [reviews, setReviews] = useState(mock.reviews);
  const [notifications, setNotifications] = useState(mock.notifications);
  const [favorites, setFavorites] = useState(['l2', 'l5']);
  const [reports, setReports] = useState([]);
  const replyTimer = useRef(null);

  const now = () => new Date().toISOString();

  // ---------- ตัวช่วยดึงข้อมูล ----------
  const getUser = useCallback((id) => users[id], [users]);
  const getListing = useCallback((id) => listings.find((l) => l.id === id), [listings]);
  const getMeetup = useCallback((id) => meetups.find((m) => m.id === id), [meetups]);
  const getThread = useCallback((id) => threads.find((t) => t.id === id), [threads]);
  const getSpot = useCallback((id) => mock.meetupSpots.find((s) => s.id === id), []);
  const getCategory = useCallback((id) => mock.categories.find((c) => c.id === id), []);
  const getCondition = useCallback((id) => mock.conditions.find((c) => c.id === id), []);

  const me = userId ? { ...users[userId], email: userEmail } : null;

  // ---------- บัญชี ----------
  const login = (email) => {
    setUserEmail(email.trim().toLowerCase());
    setUserId(mock.CURRENT_USER_ID);
  };
  const logout = () => {
    setUserId(null);
    setUserEmail('');
  };

  const updateProfile = (patch) => {
    setUsers((prev) => ({ ...prev, [userId]: { ...prev[userId], ...patch } }));
  };

  // ---------- ถูกใจ ----------
  const toggleFavorite = (listingId) => {
    setFavorites((prev) =>
      prev.includes(listingId) ? prev.filter((id) => id !== listingId) : [listingId, ...prev],
    );
  };

  // ---------- ประกาศขาย ----------
  const createListing = (data) => {
    const listing = {
      ...data,
      id: makeId('l'),
      sellerId: userId,
      status: 'available',
      createdAt: now(),
      likes: 0,
      tint: '#EFE6D4',
    };
    setListings((prev) => [listing, ...prev]);
    return listing.id;
  };

  const updateListing = (id, data) => {
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, ...data } : l)));
  };

  const setListingStatus = (id, status) => updateListing(id, { status });

  // ---------- แชต ----------
  const addMessage = (threadId, message) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId ? { ...t, messages: [...t.messages, { id: makeId('msg'), createdAt: now(), ...message }] } : t,
      ),
    );
  };

  // หาห้องแชตเดิมของสินค้านี้ ถ้าไม่มีให้สร้างใหม่ (ผู้ใช้ปัจจุบันเป็นผู้ซื้อ)
  const openThreadForListing = (listingId) => {
    const listing = getListing(listingId);
    const existing = threads.find((t) => t.listingId === listingId && t.buyerId === userId);
    if (existing) return existing.id;
    const thread = {
      id: makeId('t'),
      listingId,
      buyerId: userId,
      sellerId: listing.sellerId,
      lastReadAt: { [userId]: now() },
      messages: [],
    };
    setThreads((prev) => [thread, ...prev]);
    return thread.id;
  };

  const findThreadForMeetup = (meetup) =>
    threads.find((t) => t.listingId === meetup.listingId && t.buyerId === meetup.buyerId);

  const sendMessage = (threadId, text) => {
    const thread = getThread(threadId);
    if (!thread || !text.trim()) return;
    addMessage(threadId, { senderId: userId, text: text.trim() });
    markThreadRead(threadId);

    // จำลองว่าอีกฝ่ายตอบกลับ (ใช้เพื่อเดโมเท่านั้น)
    const otherId = thread.buyerId === userId ? thread.sellerId : thread.buyerId;
    clearTimeout(replyTimer.current);
    replyTimer.current = setTimeout(() => {
      const text2 = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      addMessage(threadId, { senderId: otherId, text: text2 });
    }, 1500);
  };

  const markThreadRead = (threadId) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, lastReadAt: { ...t.lastReadAt, [userId]: now() } } : t)),
    );
  };

  const isThreadUnread = (thread) => {
    if (!userId) return false;
    const last = thread.messages[thread.messages.length - 1];
    if (!last || last.senderId === userId) return false;
    const readAt = thread.lastReadAt?.[userId];
    return !readAt || new Date(last.createdAt) > new Date(readAt);
  };

  const myThreads = useMemo(
    () =>
      threads
        .filter((t) => t.buyerId === userId || t.sellerId === userId)
        .sort((a, b) => lastTime(b) - lastTime(a)),
    [threads, userId],
  );

  // ---------- นัดรับ ----------
  const myActiveMeetupFor = (listingId) =>
    meetups.find((m) => m.listingId === listingId && m.buyerId === userId && ACTIVE_MEETUP.includes(m.status));

  const requestMeetup = ({ listingId, spotId, date, time, note }) => {
    const listing = getListing(listingId);
    if (!listing || listing.status !== 'available') {
      return { ok: false, message: 'สินค้านี้ไม่พร้อมให้นัดรับแล้ว' };
    }
    if (myActiveMeetupFor(listingId)) {
      return { ok: false, message: 'คุณมีคำขอนัดรับสินค้านี้อยู่แล้ว' };
    }
    const meetup = {
      id: makeId('m'),
      listingId,
      buyerId: userId,
      sellerId: listing.sellerId,
      spotId,
      date,
      time,
      note,
      status: 'requested',
      confirmedBy: [],
      createdAt: now(),
    };
    setMeetups((prev) => [meetup, ...prev]);
    const threadId = openThreadForListing(listingId);
    // รอให้ state ห้องแชตอัปเดตก่อนค่อยเพิ่มข้อความระบบ
    setTimeout(() => addMessage(threadId, { senderId: 'system', text: 'ส่งคำขอนัดรับแล้ว', meetupId: meetup.id }), 0);
    return { ok: true, meetupId: meetup.id };
  };

  const updateMeetup = (id, patch) => {
    setMeetups((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const pushSystemMessage = (meetup, text) => {
    const thread = findThreadForMeetup(meetup);
    if (thread) addMessage(thread.id, { senderId: 'system', text, meetupId: meetup.id });
  };

  // ผู้ขายตอบรับ: สินค้าเปลี่ยนเป็น "จองแล้ว" และคำขออื่นของสินค้านี้ถูกปฏิเสธอัตโนมัติ
  const acceptMeetup = (id) => {
    const meetup = getMeetup(id);
    const listing = getListing(meetup.listingId);
    if (listing.status !== 'available') {
      return { ok: false, message: 'สินค้านี้ถูกจองหรือขายไปแล้ว' };
    }
    setMeetups((prev) =>
      prev.map((m) => {
        if (m.id === id) return { ...m, status: 'accepted' };
        if (m.listingId === meetup.listingId && m.status === 'requested') {
          return { ...m, status: 'declined', cancelReason: 'ผู้ขายตอบรับคำขอของคนอื่นแล้ว' };
        }
        return m;
      }),
    );
    setListingStatus(meetup.listingId, 'reserved');
    pushSystemMessage(meetup, 'ผู้ขายตอบรับนัดแล้ว');
    return { ok: true };
  };

  const declineMeetup = (id, reason = 'ผู้ขายปฏิเสธคำขอ') => {
    const meetup = getMeetup(id);
    updateMeetup(id, { status: 'declined', cancelReason: reason });
    pushSystemMessage(meetup, 'ผู้ขายปฏิเสธคำขอนัดรับ');
  };

  const cancelMeetup = (id, reason, byUserId = userId) => {
    const meetup = getMeetup(id);
    updateMeetup(id, { status: 'cancelled', cancelReason: reason, cancelledBy: byUserId });
    if (meetup.status === 'accepted') setListingStatus(meetup.listingId, 'available');
    pushSystemMessage(meetup, `ยกเลิกนัดแล้ว: ${reason}`);
  };

  // ทั้งสองฝ่ายต้องกดยืนยันว่าส่งมอบ/ได้รับของแล้ว นัดจึงจะเสร็จสมบูรณ์
  const confirmMeetup = (id, byUserId = userId) => {
    const meetup = getMeetup(id);
    if (meetup.status !== 'accepted' || meetup.confirmedBy.includes(byUserId)) return;
    const confirmedBy = [...meetup.confirmedBy, byUserId];
    const done = confirmedBy.includes(meetup.buyerId) && confirmedBy.includes(meetup.sellerId);
    updateMeetup(id, { confirmedBy, status: done ? 'completed' : 'accepted' });
    if (done) {
      setListingStatus(meetup.listingId, 'sold');
      pushSystemMessage(meetup, 'ซื้อขายสำเร็จ 🎉 อย่าลืมรีวิวกันนะ');
    }
  };

  const myMeetups = useMemo(
    () =>
      meetups
        .filter((m) => m.buyerId === userId || m.sellerId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [meetups, userId],
  );

  // ---------- รีวิว / รายงาน ----------
  const hasReviewed = (meetupId) => reviews.some((r) => r.meetupId === meetupId && r.fromId === userId);

  const submitReview = ({ meetupId, rating, text }) => {
    const meetup = getMeetup(meetupId);
    const toId = meetup.buyerId === userId ? meetup.sellerId : meetup.buyerId;
    setReviews((prev) => [{ id: makeId('r'), meetupId, fromId: userId, toId, rating, text, createdAt: now() }, ...prev]);
  };

  const reviewsFor = (uid) => reviews.filter((r) => r.toId === uid);

  const submitReport = (report) => {
    const ref = 'YP' + Date.now().toString().slice(-6);
    setReports((prev) => [{ ...report, id: makeId('rp'), reference: ref, createdAt: now() }, ...prev]);
    return ref;
  };

  // ---------- แจ้งเตือน ----------
  const markNotificationRead = (id) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAllNotificationsRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const unreadNotifications = userId ? notifications.filter((n) => !n.read).length : 0;
  const unreadChats = myThreads.filter(isThreadUnread).length;

  const value = {
    // ข้อมูล
    me,
    isLoggedIn: !!userId,
    users,
    listings,
    favorites,
    notifications,
    reports,
    myThreads,
    myMeetups,
    unreadNotifications,
    unreadChats,
    categories: mock.categories,
    collections: mock.collections,
    conditions: mock.conditions,
    meetupSpots: mock.meetupSpots,
    // ตัวช่วย
    getUser,
    getListing,
    getMeetup,
    getThread,
    getSpot,
    getCategory,
    getCondition,
    isThreadUnread,
    myActiveMeetupFor,
    hasReviewed,
    reviewsFor,
    // คำสั่ง
    login,
    logout,
    updateProfile,
    toggleFavorite,
    createListing,
    updateListing,
    setListingStatus,
    openThreadForListing,
    sendMessage,
    markThreadRead,
    requestMeetup,
    acceptMeetup,
    declineMeetup,
    cancelMeetup,
    confirmMeetup,
    submitReview,
    submitReport,
    markNotificationRead,
    markAllNotificationsRead,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function lastTime(thread) {
  const last = thread.messages[thread.messages.length - 1];
  return last ? new Date(last.createdAt).getTime() : 0;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp ต้องใช้ภายใน AppProvider');
  return ctx;
}

// ใช้ครอบการกระทำที่ต้องเข้าสู่ระบบก่อน เช่น ถูกใจ แชต ลงขาย นัดรับ
export function useRequireAuth(navigation) {
  const { isLoggedIn } = useApp();
  return (action) => {
    if (isLoggedIn) action();
    else navigation.navigate('Login');
  };
}
