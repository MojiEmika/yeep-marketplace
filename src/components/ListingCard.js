import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors, font, radius, shadow, spacing } from '../theme';
import { formatPrice } from '../utils/format';
import { Avatar, Icon, StatusBadge } from './ui';

// รูปสินค้า: ถ้ายังไม่มีรูป แสดงไอคอนหมวดบนพื้นสีพาสเทลแทน
export function ListingImage({ listing, uri, style, iconSize = 44 }) {
  const { getCategory } = useApp();
  const src = uri || listing.images?.[0];
  if (src) {
    return <Image source={{ uri: src }} style={[{ backgroundColor: colors.creamDark }, style]} resizeMode="cover" />;
  }
  return (
    <View style={[{ backgroundColor: listing.tint || colors.creamDark, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Icon name={getCategory(listing.categoryId)?.icon || 'cube-outline'} size={iconSize} color="rgba(7,25,67,0.45)" />
    </View>
  );
}

export function FavoriteButton({ liked, onPress, size = 32 }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={liked ? 'เอาออกจากรายการที่ถูกใจ' : 'ถูกใจ'}
      style={[styles.heart, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Icon name={liked ? 'heart' : 'heart-outline'} size={size * 0.55} color={liked ? colors.danger : colors.navy} />
    </Pressable>
  );
}

export default function ListingCard({ listing, width, onPress, onToggleFavorite, showSeller = true }) {
  const { favorites, getUser } = useApp();
  const liked = favorites.includes(listing.id);
  const seller = getUser(listing.sellerId);
  const dimmed = listing.status === 'sold';

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, { width }, pressed && { opacity: 0.85 }]}>
      <View>
        <ListingImage listing={listing} style={[{ width, height: width * 1.05 }, dimmed && { opacity: 0.5 }]} />
        {listing.status !== 'available' ? <StatusBadge status={listing.status} style={styles.statusBadge} /> : null}
        {onToggleFavorite ? (
          <View style={styles.heartPos}>
            <FavoriteButton liked={liked} onPress={onToggleFavorite} />
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {listing.title}
        </Text>
        <Text style={styles.price}>{formatPrice(listing.price)}</Text>
        {showSeller && seller ? (
          <View style={styles.seller}>
            <Avatar user={seller} size={18} />
            <Text style={[font.tiny, { marginLeft: 6, flex: 1 }]} numberOfLines={1}>
              {seller.name}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

// แถวสินค้าแบบย่อ ใช้ในแชต นัดรับ และรายการของฉัน
export function ListingRow({ listing, onPress, right }) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <ListingImage listing={listing} style={styles.rowImage} iconSize={22} />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Text style={[font.body, { fontWeight: '600' }]} numberOfLines={1}>
          {listing.title}
        </Text>
        <Text style={[font.body, { fontWeight: '800' }]}>{formatPrice(listing.price)}</Text>
      </View>
      {right !== undefined ? right : <StatusBadge status={listing.status} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadow,
  },
  statusBadge: { position: 'absolute', left: spacing.sm, top: spacing.sm },
  heartPos: { position: 'absolute', right: spacing.sm, top: spacing.sm },
  heart: {
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  body: { paddingHorizontal: spacing.sm + 2, paddingTop: spacing.sm, paddingBottom: spacing.md },
  title: { fontSize: 14, color: colors.text, fontWeight: '600' },
  price: { fontSize: 16, fontWeight: '800', color: colors.navy, marginTop: 2 },
  seller: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowImage: { width: 56, height: 56, borderRadius: radius.md },
});
