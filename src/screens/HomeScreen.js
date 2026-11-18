// H01 หน้าหลัก
import React, { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ListingCard from '../components/ListingCard';
import { Avatar, Button, CategoryButton, Icon, IconButton, Logo, Rating, SectionTitle } from '../components/ui';
import { useApp, useRequireAuth } from '../context/AppContext';
import { colors, font, radius, shadow, spacing } from '../theme';

export default function HomeScreen({ navigation }) {
  const { me, users, listings, categories, collections, toggleFavorite, unreadNotifications } = useApp();
  const requireAuth = useRequireAuth(navigation);
  const { width } = useWindowDimensions();
  const gridWidth = (width - spacing.lg * 2 - spacing.md) / 2;
  const smallWidth = Math.min(150, (width - spacing.lg * 2 - spacing.sm * 2) / 2.6);

  const active = useMemo(
    () =>
      listings
        .filter((l) => l.status === 'available' || l.status === 'reserved')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [listings],
  );
  // "ของน่าโดนวันนี้" = ของที่ยังว่างและมีคนกดถูกใจเยอะ
  const trending = useMemo(
    () => [...active].filter((l) => l.status === 'available').sort((a, b) => b.likes - a.likes).slice(0, 6),
    [active],
  );
  const sellers = useMemo(
    () => Object.values(users).filter((u) => u.id !== me?.id && u.reviewCount > 0).sort((a, b) => b.rating - a.rating),
    [users, me],
  );

  const openListing = (id) => navigation.navigate('ListingDetail', { listingId: id });
  const goSearch = (params) => navigation.navigate('Search', { categoryId: null, maxPrice: '', ...params });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }} showsVerticalScrollIndicator={false}>
        <View style={styles.pad}>
          {/* Header */}
          <View style={styles.topBar}>
            <Logo height={30} />
            <View style={{ flexDirection: 'row' }}>
              <IconButton icon="heart-outline" label="รายการที่ถูกใจ" onPress={() => requireAuth(() => navigation.navigate('Wishlist'))} />
              <IconButton
                icon="notifications-outline"
                label="การแจ้งเตือน"
                badge={unreadNotifications}
                onPress={() => requireAuth(() => navigation.navigate('Notifications'))}
              />
            </View>
          </View>

          {/* Search */}
          <Pressable style={styles.searchBox} onPress={() => navigation.navigate('Search', { focus: Date.now() })}>
            <Icon name="search-outline" size={20} color={colors.muted} />
            <Text style={[font.body, { color: colors.muted, marginLeft: spacing.sm, flex: 1 }]} numberOfLines={1}>
              ค้นหาเสื้อผ้า หนังสือ ของใช้ในหอ...
            </Text>
            <Icon name="options-outline" size={20} color={colors.navy} />
          </Pressable>
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
          {categories.map((c) => (
            <CategoryButton key={c.id} icon={c.icon} label={c.name} onPress={() => goSearch({ categoryId: c.id })} />
          ))}
        </ScrollView>

        {/* Hero banner */}
        <View style={styles.pad}>
          <View style={styles.hero}>
            <Image source={require('../../assets/brand/ee-navy.png')} style={styles.heroMark} resizeMode="contain" />
            <View style={[styles.heroBubble, { top: 18, right: 28, backgroundColor: colors.white }]}>
              <Icon name="camera-outline" size={22} />
            </View>
            <View style={[styles.heroBubble, { top: 74, right: 76, backgroundColor: colors.blue100 }]}>
              <Icon name="shirt-outline" size={20} />
            </View>
            <View style={[styles.heroBubble, { top: 60, right: 14, backgroundColor: colors.pink }]}>
              <Icon name="heart" size={18} color={colors.white} />
            </View>
            <Text style={styles.heroTitle}>
              ของที่ไม่ได้ใช้{'\n'}อาจเป็นของที่ใคร{'\n'}กำลังหา ♡
            </Text>
            <View style={{ flexDirection: 'row', marginTop: spacing.lg }}>
              <Button title="เริ่มลงขาย" iconRight="arrow-forward" size="sm" onPress={() => navigation.navigate('Sell')} style={{ marginRight: spacing.sm }} />
              <Button title="เลือกซื้อของ" variant="light" size="sm" onPress={() => goSearch({})} />
            </View>
          </View>
        </View>

        {/* Trending */}
        <View style={[styles.pad, { marginTop: spacing.xl }]}>
          <SectionTitle title="ของน่าโดนวันนี้" actionLabel="ดูทั้งหมด" onAction={() => goSearch({})} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg }}>
          {trending.map((l) => (
            <View key={l.id} style={{ marginRight: spacing.sm }}>
              <ListingCard
                listing={l}
                width={smallWidth}
                onPress={() => openListing(l.id)}
                onToggleFavorite={() => requireAuth(() => toggleFavorite(l.id))}
              />
            </View>
          ))}
        </ScrollView>

        <View style={styles.pad}>
          {/* Sell promo */}
          <Pressable style={styles.promo} onPress={() => navigation.navigate('Sell')}>
            <View style={{ flex: 1 }}>
              <Text style={font.h3}>ขายได้แม้มีแค่ 1–2 ชิ้น</Text>
              <Text style={[font.small, { marginTop: 2 }]}>ถ่ายรูป ลงขาย จบในไม่กี่นาที</Text>
            </View>
            <View style={styles.promoArrow}>
              <Icon name="arrow-forward" size={20} color={colors.white} />
            </View>
          </Pressable>

          {/* Collections */}
          <SectionTitle title="คอลเลกชันแนะนำ" style={{ marginTop: spacing.xl }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {collections.map((c) => (
              <Pressable key={c.id} style={[styles.collection, { backgroundColor: c.bg }]} onPress={() => goSearch(c.params)}>
                <View style={styles.collectionIcon}>
                  <Icon name={c.icon} size={22} />
                </View>
                <Text style={[font.body, { fontWeight: '800', marginTop: spacing.sm }]} numberOfLines={1}>
                  {c.title}
                </Text>
                <Text style={font.tiny} numberOfLines={1}>
                  {c.subtitle}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Brand banner */}
          <View style={styles.brandBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.brandTitle}>Good Things{'\n'}Find New People</Text>
              <Text style={[font.small, { color: colors.blue100, marginTop: spacing.sm }]}>
                ทุกการส่งต่อมีความหมาย ทั้งต่อเพื่อนใน มทส. และโลกใบนี้
              </Text>
            </View>
            <Icon name="earth" size={56} color={colors.blue} />
          </View>

          {/* Sellers */}
          {sellers.length ? (
            <>
              <SectionTitle title="ผู้ขายแนะนำ" style={{ marginTop: spacing.xl }} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -spacing.lg }} contentContainerStyle={{ paddingHorizontal: spacing.lg }}>
                {sellers.map((u) => (
                  <Pressable key={u.id} style={styles.seller} onPress={() => navigation.navigate('UserProfile', { userId: u.id })}>
                    <Avatar user={u} size={58} />
                    <Text style={[font.small, { color: colors.text, fontWeight: '700', marginTop: 6 }]} numberOfLines={1}>
                      {u.name}
                    </Text>
                    <Rating value={u.rating} count={u.reviewCount} />
                  </Pressable>
                ))}
              </ScrollView>
            </>
          ) : null}

          {/* Newest */}
          <SectionTitle title="มาใหม่ล่าสุด" actionLabel="ดูทั้งหมด" onAction={() => goSearch({})} style={{ marginTop: spacing.xl }} />
          <View style={styles.grid}>
            {active.map((l) => (
              <ListingCard
                key={l.id}
                listing={l}
                width={gridWidth}
                onPress={() => openListing(l.id)}
                onToggleFavorite={() => requireAuth(() => toggleFavorite(l.id))}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  pad: { paddingHorizontal: spacing.lg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm, marginBottom: spacing.md },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 13,
    ...shadow,
  },
  categories: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  hero: {
    marginTop: spacing.lg,
    backgroundColor: colors.pink100,
    borderRadius: radius.xl,
    padding: spacing.xl,
    overflow: 'hidden',
  },
  heroMark: { position: 'absolute', right: -36, bottom: -18, width: 190, height: 100, opacity: 0.08 },
  heroBubble: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  heroTitle: { fontSize: 22, lineHeight: 32, fontWeight: '800', color: colors.navy, fontStyle: 'italic' },
  promo: {
    marginTop: spacing.xl,
    backgroundColor: colors.blue50,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.blue100,
  },
  promoArrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collection: { width: '31.5%', borderRadius: radius.lg, padding: spacing.md },
  collectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBanner: {
    marginTop: spacing.xl,
    backgroundColor: colors.navy,
    borderRadius: radius.xl,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: { fontSize: 22, lineHeight: 28, fontWeight: '800', color: colors.cream, fontStyle: 'italic' },
  seller: { width: 84, alignItems: 'center', marginRight: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});
