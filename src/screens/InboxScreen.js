// M01 กล่องข้อความ
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ListingImage } from '../components/ListingCard';
import { Avatar, EmptyState } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors, font, spacing } from '../theme';
import { timeAgo } from '../utils/format';

export default function InboxScreen({ navigation }) {
  const { isLoggedIn, me, myThreads, getUser, getListing, isThreadUnread } = useApp();

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.center}>
        <EmptyState
          icon="chatbubbles-outline"
          title="เข้าสู่ระบบเพื่อดูข้อความ"
          subtitle="คุยกับผู้ซื้อและผู้ขายได้ในแอป"
          actionLabel="เข้าสู่ระบบ"
          onAction={() => navigation.navigate('Login')}
        />
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }) => {
    const otherId = item.buyerId === me.id ? item.sellerId : item.buyerId;
    const other = getUser(otherId);
    const listing = getListing(item.listingId);
    const last = item.messages[item.messages.length - 1];
    const unread = isThreadUnread(item);
    const role = item.buyerId === me.id ? 'คุณเป็นผู้ซื้อ' : 'คุณเป็นผู้ขาย';

    return (
      <Pressable
        style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.cream }]}
        onPress={() => navigation.navigate('Chat', { threadId: item.id })}
      >
        <Avatar user={other} size={48} />
        <View style={{ flex: 1, marginHorizontal: spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[font.body, { fontWeight: '700' }]}>{other?.name}</Text>
            {last ? <Text style={font.tiny}>{timeAgo(last.createdAt)}</Text> : null}
          </View>
          <Text style={font.tiny} numberOfLines={1}>
            {listing?.title} · {role}
          </Text>
          <Text style={[font.small, unread && { color: colors.text, fontWeight: '700' }]} numberOfLines={1}>
            {last ? (last.senderId === me.id ? 'คุณ: ' : '') + last.text : 'เริ่มแชตได้เลย'}
          </Text>
        </View>
        {listing ? <ListingImage listing={listing} style={styles.thumb} iconSize={20} /> : null}
        {unread ? <View style={styles.dot} /> : null}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={['top']}>
      <Text style={[font.h1, { padding: spacing.lg }]}>ข้อความ</Text>
      <FlatList
        data={myThreads}
        keyExtractor={(t) => t.id}
        renderItem={renderItem}
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyState
            icon="mail-open-outline"
            title="ยังไม่มีข้อความ"
            subtitle="กด 'แชต' ที่หน้าสินค้าเพื่อเริ่มคุยกับผู้ขาย"
            actionLabel="ไปเลือกดูสินค้า"
            onAction={() => navigation.navigate('Search', { categoryId: null })}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', backgroundColor: colors.cream },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  thumb: { width: 44, height: 44, borderRadius: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.danger, marginLeft: spacing.sm },
});
