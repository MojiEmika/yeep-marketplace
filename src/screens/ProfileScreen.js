// U02 โปรไฟล์ของฉัน
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ListingImage } from '../components/ListingCard';
import { Avatar, Button, EmptyState, Icon, IconButton, Stars } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors, font, radius, shadow, spacing } from '../theme';
import { formatPrice, timeAgo } from '../utils/format';

const TABS = [
  { id: 'selling', label: 'สินค้าที่ลงขาย' },
  { id: 'liked', label: 'ถูกใจ' },
  { id: 'reviews', label: 'รีวิว' },
];

export default function ProfileScreen({ navigation }) {
  const { isLoggedIn, me, listings, myMeetups, favorites, getListing, getUser, reviewsFor, unreadNotifications, logout } = useApp();
  const { width } = useWindowDimensions();
  const [tab, setTab] = useState('selling');
  const tile = (width - spacing.lg * 2 - spacing.sm * 2) / 3;

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.cream }}>
        <EmptyState
          icon="hand-left-outline"
          title="ยินดีต้อนรับสู่ yeep"
          subtitle="เข้าสู่ระบบด้วยอีเมลนักศึกษาเพื่อซื้อ ขาย และนัดรับ"
          actionLabel="เข้าสู่ระบบ"
          onAction={() => navigation.navigate('Login')}
        />
      </SafeAreaView>
    );
  }

  const mine = listings.filter((l) => l.sellerId === me.id);
  const selling = mine.filter((l) => l.status === 'available' || l.status === 'reserved');
  const liked = favorites.map(getListing).filter(Boolean);
  const reviews = reviewsFor(me.id);
  const pendingRequests = myMeetups.filter((m) => m.sellerId === me.id && m.status === 'requested').length;
  const upcoming = myMeetups.filter((m) => m.status === 'accepted').length;

  const stats = [
    { label: 'รายการ', value: selling.length },
    { label: 'ขายแล้ว', value: mine.filter((l) => l.status === 'sold').length },
    { label: 'รีวิว', value: me.reviewCount },
  ];

  const quick = [
    { icon: 'calendar-outline', label: 'นัดรับ', badge: pendingRequests, onPress: () => navigation.navigate('MyMeetups'), sub: upcoming ? `${upcoming} นัดที่รออยู่` : 'ดูทั้งหมด' },
    { icon: 'pricetags-outline', label: 'ประกาศ', onPress: () => navigation.navigate('MyListings'), sub: 'จัดการ' },
    { icon: 'notifications-outline', label: 'แจ้งเตือน', badge: unreadNotifications, onPress: () => navigation.navigate('Notifications'), sub: unreadNotifications ? `${unreadNotifications} ใหม่` : 'อ่านแล้ว' },
  ];

  const renderGrid = (items) =>
    items.length ? (
      <View style={styles.grid}>
        {items.map((l, i) => (
          <Pressable key={l.id} style={{ width: tile, marginBottom: spacing.md, marginRight: i % 3 === 2 ? 0 : spacing.sm }} onPress={() => navigation.navigate('ListingDetail', { listingId: l.id })}>
            <ListingImage listing={l} style={{ width: tile, height: tile, borderRadius: radius.md }} iconSize={28} />
            <Text style={[font.small, { color: colors.text, fontWeight: '800', marginTop: 4 }]}>{formatPrice(l.price)}</Text>
          </Pressable>
        ))}
      </View>
    ) : null;

  const confirmLogout = () =>
    Alert.alert('ออกจากระบบ?', undefined, [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ออกจากระบบ', style: 'destructive', onPress: logout },
    ]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <View style={styles.topBar}>
          <Text style={font.h2}>โปรไฟล์</Text>
          <IconButton icon="settings-outline" label="ตั้งค่า" onPress={() => navigation.navigate('Settings')} />
        </View>

        <View style={{ alignItems: 'center', paddingHorizontal: spacing.lg }}>
          <Avatar user={me} size={92} />
          <Text style={[font.h1, { marginTop: spacing.sm }]}>{me.name}</Text>
          <View style={styles.verified}>
            <Icon name="shield-checkmark" size={14} color={colors.blue600} />
            <Text style={styles.verifiedText}>ยืนยันอีเมลนักศึกษาแล้ว</Text>
          </View>
          <Text style={[font.tiny, { marginTop: spacing.xs }]}>{me.faculty}</Text>
          {me.bio ? <Text style={[font.small, { textAlign: 'center', marginTop: spacing.sm, color: colors.text }]}>{me.bio}</Text> : null}

          <View style={styles.stats}>
            {stats.map((s) => (
              <View key={s.label} style={{ alignItems: 'center', flex: 1 }}>
                <Text style={[font.h2, { color: colors.navy }]}>{s.value}</Text>
                <Text style={font.tiny}>{s.label}</Text>
              </View>
            ))}
          </View>

          <View style={{ flexDirection: 'row', alignSelf: 'stretch' }}>
            <Button title="แก้ไขโปรไฟล์" variant="secondary" onPress={() => navigation.navigate('EditProfile')} style={{ flex: 1 }} />
            <Pressable style={styles.gear} onPress={() => navigation.navigate('UserProfile', { userId: me.id })} accessibilityLabel="ดูโปรไฟล์สาธารณะ">
              <Icon name="eye-outline" size={22} />
            </Pressable>
          </View>
        </View>

        {/* ทางลัด */}
        <View style={styles.quickRow}>
          {quick.map((q) => (
            <Pressable key={q.label} style={styles.quick} onPress={q.onPress}>
              <View style={styles.quickIcon}>
                <Icon name={q.icon} size={22} color={colors.blue600} />
                {q.badge ? (
                  <View style={styles.quickBadge}>
                    <Text style={{ color: colors.white, fontSize: 10, fontWeight: '800' }}>{q.badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[font.small, { color: colors.text, fontWeight: '700', marginTop: 6 }]}>{q.label}</Text>
              <Text style={font.tiny} numberOfLines={1}>
                {q.sub}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* แท็บ */}
        <View style={styles.tabs}>
          {TABS.map((t) => (
            <Pressable key={t.id} style={styles.tab} onPress={() => setTab(t.id)}>
              <Text style={[styles.tabText, tab === t.id && styles.tabTextOn]}>{t.label}</Text>
              {tab === t.id ? <View style={styles.tabLine} /> : null}
            </Pressable>
          ))}
        </View>

        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
          {tab === 'selling'
            ? renderGrid(selling) || (
                <EmptyState icon="pricetag-outline" title="ยังไม่มีสินค้าที่ลงขาย" actionLabel="ลงขายเลย" onAction={() => navigation.navigate('Sell')} />
              )
            : null}
          {tab === 'liked' ? renderGrid(liked) || <EmptyState icon="heart-outline" title="ยังไม่มีรายการที่ถูกใจ" /> : null}
          {tab === 'reviews'
            ? reviews.length
              ? reviews.map((r) => {
                  const from = getUser(r.fromId);
                  return (
                    <View key={r.id} style={styles.review}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Avatar user={from} size={30} />
                        <Text style={[font.body, { flex: 1, marginLeft: spacing.sm, fontWeight: '700' }]}>{from?.name}</Text>
                        <Text style={font.tiny}>{timeAgo(r.createdAt)}</Text>
                      </View>
                      <View style={{ marginTop: spacing.sm }}>
                        <Stars value={r.rating} />
                      </View>
                      {r.text ? <Text style={[font.body, { marginTop: 4 }]}>{r.text}</Text> : null}
                    </View>
                  );
                })
              : <EmptyState icon="star-outline" title="ยังไม่มีรีวิว" />
            : null}
        </View>

        <Pressable style={styles.logout} onPress={confirmLogout}>
          <Icon name="log-out-outline" size={18} color={colors.danger} />
          <Text style={{ color: colors.danger, fontWeight: '700', marginLeft: 6 }}>ออกจากระบบ</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blue50,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    marginTop: spacing.xs,
  },
  verifiedText: { fontSize: 12, fontWeight: '700', color: colors.blue600, marginLeft: 4 },
  stats: { flexDirection: 'row', alignSelf: 'stretch', marginVertical: spacing.lg },
  gear: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: colors.gray,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  quick: { width: '31.5%', backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, ...shadow },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.blue50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
  tabText: { fontSize: 14, color: colors.muted, fontWeight: '600' },
  tabTextOn: { color: colors.navy, fontWeight: '800' },
  tabLine: { position: 'absolute', bottom: -1, height: 3, width: 40, borderRadius: 2, backgroundColor: colors.navy },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  review: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadow },
  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl, padding: spacing.md },
});
