// M02 ห้องแชต (ผูกกับสินค้า 1 ชิ้น)
import { useHeaderHeight } from '@react-navigation/elements';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ListingRow } from '../components/ListingCard';
import { Button, Chip, EmptyState, Icon, IconButton } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors, font, radius, spacing } from '../theme';
import { formatClock } from '../utils/format';

const QUICK_REPLIES = ['ยังมีของอยู่ไหม', 'ขอดูรูปเพิ่มได้ไหม', 'ลดราคาได้อีกไหม', 'นัดรับวันไหนสะดวก'];

export default function ChatScreen({ navigation, route }) {
  const { threadId } = route.params;
  const { me, getThread, getUser, getListing, sendMessage, markThreadRead, myActiveMeetupFor } = useApp();
  const headerHeight = useHeaderHeight();
  const listRef = useRef(null);
  const [text, setText] = useState('');

  const thread = getThread(threadId);
  const messageCount = thread?.messages.length || 0;

  useEffect(() => {
    if (thread) markThreadRead(threadId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageCount]);

  const otherId = thread ? (thread.buyerId === me?.id ? thread.sellerId : thread.buyerId) : null;
  const other = otherId ? getUser(otherId) : null;

  useLayoutEffect(() => {
    if (!other) return;
    navigation.setOptions({
      title: other.name,
      headerRight: () => (
        <IconButton
          icon="ellipsis-horizontal"
          label="ตัวเลือกเพิ่มเติม"
          onPress={() =>
            Alert.alert(other.name, undefined, [
              { text: 'ดูโปรไฟล์', onPress: () => navigation.navigate('UserProfile', { userId: other.id }) },
              { text: 'รายงานผู้ใช้', onPress: () => navigation.navigate('Report', { targetType: 'user', targetId: other.id }) },
              { text: 'ปิด', style: 'cancel' },
            ])
          }
        />
      ),
    });
  }, [navigation, other]);

  if (!thread) {
    return <EmptyState icon="help-circle-outline" title="ไม่พบห้องแชตนี้" actionLabel="กลับ" onAction={() => navigation.goBack()} />;
  }

  const listing = getListing(thread.listingId);
  const isBuyer = thread.buyerId === me.id;
  const myMeetup = isBuyer ? myActiveMeetupFor(listing.id) : null;

  const send = (value) => {
    const v = (value ?? text).trim();
    if (!v) return;
    sendMessage(threadId, v);
    setText('');
  };

  const renderMessage = ({ item }) => {
    if (item.senderId === 'system') {
      return (
        <Pressable
          style={styles.system}
          disabled={!item.meetupId}
          onPress={() => navigation.navigate('MeetupDetail', { meetupId: item.meetupId })}
        >
          <Icon name="calendar-outline" size={14} color={colors.blue600} style={{ marginRight: 6 }} />
          <Text style={styles.systemText}>
            {item.text}
            {item.meetupId ? '  · ดูรายละเอียด ›' : ''}
          </Text>
        </Pressable>
      );
    }
    const mine = item.senderId === me.id;
    return (
      <View style={[styles.bubbleRow, mine ? { justifyContent: 'flex-end' } : null]}>
        <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
          <Text style={{ color: mine ? colors.white : colors.text, fontSize: 15 }}>{item.text}</Text>
          <Text style={[styles.time, mine && { color: colors.creamDark }]}>{formatClock(item.createdAt)}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.cream }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      <View style={styles.listingBar}>
        <ListingRow listing={listing} onPress={() => navigation.navigate('ListingDetail', { listingId: listing.id })} />
        {isBuyer ? (
          myMeetup ? (
            <Button size="sm" variant="secondary" title="ดูนัดรับ" style={{ marginTop: spacing.sm }} onPress={() => navigation.navigate('MeetupDetail', { meetupId: myMeetup.id })} />
          ) : listing.status === 'available' ? (
            <Button size="sm" title="ขอนัดรับ" icon="calendar-outline" style={{ marginTop: spacing.sm }} onPress={() => navigation.navigate('MeetupRequest', { listingId: listing.id })} />
          ) : null
        ) : null}
      </View>

      <FlatList
        ref={listRef}
        data={thread.messages}
        keyExtractor={(m) => m.id}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: spacing.lg, flexGrow: 1 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <Text style={[font.small, { textAlign: 'center', marginTop: spacing.xl }]}>
            เริ่มคุยกับ {other?.name} ได้เลย
          </Text>
        }
      />

      <SafeAreaView edges={['bottom']} style={styles.composer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={{ paddingHorizontal: spacing.md, paddingTop: spacing.sm }}>
          {QUICK_REPLIES.map((q) => (
            <Chip key={q} label={q} onPress={() => send(q)} />
          ))}
        </ScrollView>
        <View style={styles.inputRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="พิมพ์ข้อความ..."
            placeholderTextColor={colors.muted}
            style={styles.input}
            multiline
            maxLength={1000}
          />
          <Pressable
            onPress={() => send()}
            disabled={!text.trim()}
            style={[styles.sendBtn, !text.trim() && { opacity: 0.4 }]}
            accessibilityLabel="ส่งข้อความ"
          >
            <Text style={{ color: colors.white, fontWeight: '700' }}>ส่ง</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  listingBar: { backgroundColor: colors.white, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  bubbleRow: { flexDirection: 'row', marginBottom: spacing.sm },
  bubble: { maxWidth: '78%', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.lg },
  bubbleMine: { backgroundColor: colors.navy, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: colors.white, borderBottomLeftRadius: 4 },
  time: { fontSize: 10, color: colors.muted, alignSelf: 'flex-end', marginTop: 2 },
  system: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.infoBg,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginVertical: spacing.sm,
  },
  systemText: { fontSize: 12, color: colors.blue600, fontWeight: '600' },
  composer: { backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  input: {
    flex: 1,
    maxHeight: 110,
    backgroundColor: colors.cream,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  sendBtn: {
    marginLeft: spacing.sm,
    backgroundColor: colors.navy,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
  },
});
