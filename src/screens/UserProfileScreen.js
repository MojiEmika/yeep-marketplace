// U01 โปรไฟล์สาธารณะ
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import ListingCard from '../components/ListingCard';
import { Avatar, Card, Chip, EmptyState, Stars } from '../components/ui';
import { useApp, useRequireAuth } from '../context/AppContext';
import { colors, font, spacing } from '../theme';
import { formatMonthYear, timeAgo } from '../utils/format';

export default function UserProfileScreen({ navigation, route }) {
  const { userId } = route.params;
  const { me, getUser, listings, reviewsFor, toggleFavorite } = useApp();
  const requireAuth = useRequireAuth(navigation);
  const { width } = useWindowDimensions();
  const cardWidth = (width - spacing.lg * 2 - spacing.md) / 2;
  const [tab, setTab] = useState('listings');

  const user = getUser(userId);
  if (!user) return <EmptyState icon="help-circle-outline" title="ไม่พบผู้ใช้นี้" />;

  const items = listings.filter((l) => l.sellerId === userId && (l.status === 'available' || l.status === 'reserved'));
  const reviews = reviewsFor(userId);

  return (
    <ScrollView style={{ backgroundColor: colors.cream }} contentContainerStyle={{ padding: spacing.lg }}>
      <View style={{ alignItems: 'center' }}>
        <Avatar user={user} size={80} />
        <Text style={[font.h2, { marginTop: spacing.sm }]}>{user.name}</Text>
        <Text style={font.small}>{user.faculty}</Text>
        <Text style={font.tiny}>เป็นสมาชิกตั้งแต่ {formatMonthYear(user.joinedAt)}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs }}>
          {user.reviewCount ? (
            <>
              <Stars value={user.rating} />
              <Text style={[font.small, { marginLeft: 4 }]}>
                {user.rating.toFixed(1)} ({user.reviewCount} รีวิว)
              </Text>
            </>
          ) : (
            <Text style={font.small}>ยังไม่มีรีวิว</Text>
          )}
        </View>
        {user.bio ? <Text style={[font.body, { marginTop: spacing.md, textAlign: 'center' }]}>{user.bio}</Text> : null}
      </View>

      <View style={{ flexDirection: 'row', marginTop: spacing.xl }}>
        <Chip label={`ประกาศ (${items.length})`} selected={tab === 'listings'} onPress={() => setTab('listings')} />
        <Chip label={`รีวิว (${reviews.length})`} selected={tab === 'reviews'} onPress={() => setTab('reviews')} />
      </View>

      {tab === 'listings' ? (
        items.length ? (
          <View style={styles.grid}>
            {items.map((l) => (
              <ListingCard
                key={l.id}
                listing={l}
                width={cardWidth}
                onPress={() => navigation.push('ListingDetail', { listingId: l.id })}
                onToggleFavorite={() => requireAuth(() => toggleFavorite(l.id))}
              />
            ))}
          </View>
        ) : (
          <EmptyState icon="pricetag-outline" title="ยังไม่มีประกาศที่เปิดขาย" />
        )
      ) : reviews.length ? (
        reviews.map((r) => {
          const from = getUser(r.fromId);
          return (
            <Card key={r.id} style={{ marginBottom: spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Avatar user={from} size={32} />
                <Text style={[font.body, { flex: 1, marginLeft: spacing.sm, fontWeight: '600' }]}>{from?.name}</Text>
                <Text style={font.tiny}>{timeAgo(r.createdAt)}</Text>
              </View>
              <View style={{ marginTop: spacing.sm }}>
                <Stars value={r.rating} />
              </View>
              {r.text ? <Text style={[font.body, { marginTop: 4 }]}>{r.text}</Text> : null}
            </Card>
          );
        })
      ) : (
        <EmptyState icon="star-outline" title="ยังไม่มีรีวิว" />
      )}

      {me && me.id !== userId ? (
        <Text
          style={[font.small, { color: colors.danger, textAlign: 'center', marginTop: spacing.xl }]}
          onPress={() => navigation.navigate('Report', { targetType: 'user', targetId: userId })}
        >
          รายงานผู้ใช้นี้
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: spacing.sm },
});
