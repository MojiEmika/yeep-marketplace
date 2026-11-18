// P01 รายละเอียดสินค้า (รวม P02 ดูรูปแบบเลื่อนซ้าย-ขวา)
import React, { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ListingImage } from '../components/ListingCard';
import { Avatar, Button, EmptyState, Icon, IconButton, Notice, Rating, StatusBadge } from '../components/ui';
import { useApp, useRequireAuth } from '../context/AppContext';
import { colors, font, radius, shadow, spacing } from '../theme';
import { formatPrice, timeAgo } from '../utils/format';

export default function ListingDetailScreen({ navigation, route }) {
  const { listingId } = route.params;
  const app = useApp();
  const { me, favorites, getListing, getUser, getSpot, getCategory, getCondition, toggleFavorite } = app;
  const requireAuth = useRequireAuth(navigation);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);

  const listing = getListing(listingId);

  if (!listing) {
    // G01 สินค้าถูกลบหรือไม่มีอยู่
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.cream }}>
        <EmptyState
          icon="help-circle-outline"
          title="ไม่พบสินค้านี้"
          subtitle="ประกาศอาจถูกลบหรือปิดไปแล้ว"
          actionLabel="กลับหน้าหลัก"
          onAction={() => navigation.navigate('Tabs', { screen: 'Home' })}
        />
      </SafeAreaView>
    );
  }

  const liked = favorites.includes(listingId);
  const seller = getUser(listing.sellerId);
  const isOwner = me?.id === listing.sellerId;
  const myMeetup = app.myActiveMeetupFor(listingId);
  const photos = listing.images.length ? listing.images : [null];
  const category = getCategory(listing.categoryId);

  const openChat = () =>
    requireAuth(() => {
      const threadId = app.openThreadForListing(listingId);
      navigation.navigate('Chat', { threadId });
    });

  const share = () => Share.share({ message: `${listing.title} ${formatPrice(listing.price)} บน yeep` });

  const renderActions = () => {
    if (isOwner) {
      return (
        <>
          <Button title="จัดการประกาศ" variant="secondary" style={{ flex: 1, marginRight: spacing.sm }} onPress={() => navigation.navigate('MyListings')} />
          <Button title="แก้ไข" icon="create-outline" style={{ flex: 1 }} onPress={() => navigation.navigate('EditListing', { listingId })} />
        </>
      );
    }
    let primary;
    if (myMeetup) {
      primary = <Button title="ดูนัดรับของฉัน" icon="calendar-outline" style={{ flex: 1.6 }} onPress={() => navigation.navigate('MeetupDetail', { meetupId: myMeetup.id })} />;
    } else if (listing.status === 'available') {
      primary = (
        <Button
          title="ขอนัดรับ"
          icon="calendar-outline"
          style={{ flex: 1.6 }}
          onPress={() => requireAuth(() => navigation.navigate('MeetupRequest', { listingId }))}
        />
      );
    } else {
      primary = <Button title={listing.status === 'sold' ? 'ขายแล้ว' : 'มีคนจองแล้ว'} disabled style={{ flex: 1.6 }} />;
    }
    return (
      <>
        <Button title="แชท" icon="chatbubble-outline" variant="secondary" style={{ flex: 1, marginRight: spacing.sm }} onPress={openChat} />
        {primary}
      </>
    );
  };

  const attrs = [
    ['หมวดหมู่', category?.name],
    ['สภาพ', getCondition(listing.condition)?.name],
    listing.size ? ['ไซซ์', listing.size] : null,
    ['แบรนด์', listing.brand || 'ไม่มีแบรนด์'],
    ['ตำหนิ', listing.defects || 'ไม่มีตำหนิชัดเจน'],
  ].filter(Boolean);

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        <View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
          >
            {photos.map((uri, i) => (
              <ListingImage key={i} listing={listing} uri={uri} style={{ width, height: width * 1.05 }} iconSize={96} />
            ))}
          </ScrollView>
          <View style={styles.pageTag}>
            <Icon name="camera-outline" size={12} color={colors.white} />
            <Text style={styles.pageText}>
              {page + 1}/{photos.length}
            </Text>
          </View>
        </View>

        <View style={styles.sheet}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, paddingRight: spacing.md }}>
              <Text style={font.h2}>{listing.title}</Text>
              <Text style={styles.price}>{formatPrice(listing.price)}</Text>
            </View>
            {listing.status !== 'available' ? <StatusBadge status={listing.status} /> : null}
          </View>
          <Text style={font.tiny}>
            ลงขาย {timeAgo(listing.createdAt)} · ถูกใจ {listing.likes + (liked ? 1 : 0)} คน
          </Text>

          {/* ผู้ขาย */}
          <Pressable style={styles.sellerRow} onPress={() => navigation.navigate('UserProfile', { userId: seller.id })}>
            <Avatar user={seller} size={44} />
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={[font.body, { fontWeight: '700' }]}>{seller.name}</Text>
              <Rating value={seller.rating} count={seller.reviewCount} />
            </View>
            <View style={styles.profileBtn}>
              <Text style={{ color: colors.navy, fontWeight: '700', fontSize: 13 }}>ดูโปรไฟล์</Text>
            </View>
          </Pressable>

          {/* รายละเอียด */}
          <View style={styles.table}>
            {attrs.map(([k, v], i) => (
              <View key={k} style={[styles.attr, i === attrs.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={[font.small, { width: 92 }]}>{k}</Text>
                <Text style={[font.body, { flex: 1 }]}>{v}</Text>
              </View>
            ))}
          </View>

          {listing.description ? (
            <>
              <Text style={[font.h3, { marginTop: spacing.xl }]}>รายละเอียด</Text>
              <Text style={[font.body, { marginTop: spacing.sm, lineHeight: 23 }]}>{listing.description}</Text>
            </>
          ) : null}

          <Text style={[font.h3, { marginTop: spacing.xl, marginBottom: spacing.sm }]}>จุดนัดรับที่ผู้ขายสะดวก</Text>
          {listing.meetupSpotIds.map((id) => {
            const spot = getSpot(id);
            return (
              <View key={id} style={styles.spot}>
                <View style={styles.spotIcon}>
                  <Icon name="location-outline" size={18} color={colors.blue600} />
                </View>
                <View>
                  <Text style={font.body}>{spot?.name}</Text>
                  <Text style={font.tiny}>{spot?.zone}</Text>
                </View>
              </View>
            );
          })}

          <Notice
            icon="shield-checkmark-outline"
            text="นัดรับในที่สาธารณะ ตรวจสภาพของก่อนจ่ายเงิน และคุยผ่านแชตในแอปเท่านั้น"
            style={{ marginTop: spacing.xl }}
          />
          <View style={styles.links}>
            <Pressable onPress={() => navigation.navigate('Safety')} style={styles.linkRow}>
              <Icon name="book-outline" size={16} color={colors.blue600} />
              <Text style={styles.link}>คำแนะนำการนัดรับ</Text>
            </Pressable>
            {!isOwner ? (
              <Pressable
                onPress={() => requireAuth(() => navigation.navigate('Report', { targetType: 'listing', targetId: listingId }))}
                style={styles.linkRow}
              >
                <Icon name="flag-outline" size={16} color={colors.danger} />
                <Text style={[styles.link, { color: colors.danger }]}>รายงานประกาศ</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </ScrollView>

      {/* ปุ่มลอยบนรูป */}
      <View style={[styles.topButtons, { top: insets.top + spacing.sm }]}>
        <IconButton variant="circle" icon="chevron-back" label="ย้อนกลับ" onPress={() => navigation.goBack()} />
        <View style={{ flexDirection: 'row' }}>
          <IconButton variant="circle" icon="share-outline" label="แชร์" onPress={share} />
          <View style={{ width: spacing.sm }} />
          <IconButton
            variant="circle"
            icon={liked ? 'heart' : 'heart-outline'}
            color={liked ? colors.danger : colors.navy}
            label={liked ? 'เอาออกจากรายการที่ถูกใจ' : 'ถูกใจ'}
            onPress={() => requireAuth(() => toggleFavorite(listingId))}
          />
        </View>
      </View>

      <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
        <View style={{ flexDirection: 'row', padding: spacing.md }}>{renderActions()}</View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageTag: {
    position: 'absolute',
    bottom: 34,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(7,25,67,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  pageText: { color: colors.white, fontSize: 12, fontWeight: '700', marginLeft: 4 },
  sheet: {
    marginTop: -20,
    backgroundColor: colors.cream,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
  },
  price: { fontSize: 26, fontWeight: '900', color: colors.navy, marginTop: spacing.xs, marginBottom: 2 },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    ...shadow,
  },
  profileBtn: {
    borderWidth: 1.5,
    borderColor: colors.navy,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  table: {
    marginTop: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    ...shadow,
  },
  attr: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  spot: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  spotIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.blue50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  links: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg },
  linkRow: { flexDirection: 'row', alignItems: 'center' },
  link: { color: colors.blue600, fontWeight: '600', marginLeft: 4 },
  topButtons: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    ...shadow,
    shadowOffset: { width: 0, height: -2 },
  },
});
