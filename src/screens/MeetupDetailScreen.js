// รายละเอียดนัดรับ: ตอบรับ / ยกเลิก / ยืนยันส่งมอบ / รีวิว
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ListingRow } from '../components/ListingCard';
import { Avatar, Button, Card, Chip, EmptyState, Icon, Notice, StatusBadge } from '../components/ui';
import { useApp } from '../context/AppContext';
import { cancelReasons } from '../data/mock';
import { colors, font, spacing } from '../theme';
import { formatDate, timeAgo } from '../utils/format';

const STEPS = [
  { id: 'requested', label: 'ผู้ซื้อส่งคำขอนัด' },
  { id: 'accepted', label: 'ผู้ขายตอบรับ สินค้าถูกจอง' },
  { id: 'met', label: 'พบกันและยืนยันการส่งมอบ' },
  { id: 'completed', label: 'ซื้อขายสำเร็จ' },
];

export default function MeetupDetailScreen({ navigation, route }) {
  const { meetupId } = route.params;
  const app = useApp();
  const { me, getMeetup, getListing, getUser, getSpot } = app;
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState(null);

  const meetup = getMeetup(meetupId);
  if (!meetup || !me || (meetup.buyerId !== me.id && meetup.sellerId !== me.id)) {
    return <EmptyState icon="help-circle-outline" title="ไม่พบนัดรับนี้" actionLabel="กลับ" onAction={() => navigation.goBack()} />;
  }

  const listing = getListing(meetup.listingId);
  const isBuyer = meetup.buyerId === me.id;
  const otherId = isBuyer ? meetup.sellerId : meetup.buyerId;
  const other = getUser(otherId);
  const spot = getSpot(meetup.spotId);
  const iConfirmed = meetup.confirmedBy.includes(me.id);
  const otherConfirmed = meetup.confirmedBy.includes(otherId);
  const closed = meetup.status === 'cancelled' || meetup.status === 'declined';

  const stepIndex =
    meetup.status === 'completed' ? 3 : meetup.status === 'accepted' ? (meetup.confirmedBy.length ? 2 : 1) : 0;

  const accept = () => {
    const r = app.acceptMeetup(meetupId);
    if (!r.ok) Alert.alert('ตอบรับไม่ได้', r.message);
  };

  const decline = () =>
    Alert.alert('ปฏิเสธคำขอนัดรับ?', 'ผู้ซื้อจะได้รับแจ้งว่าคำขอถูกปฏิเสธ', [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ปฏิเสธ', style: 'destructive', onPress: () => app.declineMeetup(meetupId) },
    ]);

  const confirmHandover = () =>
    Alert.alert(
      isBuyer ? 'ยืนยันว่าได้รับสินค้าแล้ว?' : 'ยืนยันว่าส่งมอบสินค้าแล้ว?',
      'กดยืนยันหลังเจอกันและตรวจของเรียบร้อยแล้วเท่านั้น',
      [
        { text: 'ยังไม่ใช่', style: 'cancel' },
        { text: 'ยืนยัน', onPress: () => app.confirmMeetup(meetupId) },
      ],
    );

  const submitCancel = () => {
    app.cancelMeetup(meetupId, reason);
    setCancelling(false);
  };

  const openChat = () => {
    const thread = app.myThreads.find((t) => t.listingId === meetup.listingId && t.buyerId === meetup.buyerId);
    if (thread) navigation.navigate('Chat', { threadId: thread.id });
    else if (isBuyer) navigation.navigate('Chat', { threadId: app.openThreadForListing(meetup.listingId) });
    else Alert.alert('ยังไม่มีห้องแชต', 'ห้องแชตของนัดนี้ยังไม่ถูกสร้าง');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.cream }} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 48 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={font.h2}>{isBuyer ? 'คุณเป็นผู้ซื้อ' : 'คุณเป็นผู้ขาย'}</Text>
        <StatusBadge status={meetup.status} type="meetup" />
      </View>
      <Text style={[font.tiny, { marginTop: 2 }]}>สร้างเมื่อ {timeAgo(meetup.createdAt)}</Text>

      <Card style={{ marginTop: spacing.lg }}>
        <ListingRow listing={listing} onPress={() => navigation.navigate('ListingDetail', { listingId: listing.id })} right={null} />
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Icon name="calendar-outline" size={18} color={colors.blue600} />
          </View>
          <Text style={font.h3}>
            {formatDate(meetup.date)} · {meetup.time} น.
          </Text>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Icon name="location-outline" size={18} color={colors.blue600} />
          </View>
          <View>
            <Text style={font.body}>{spot?.name}</Text>
            <Text style={font.tiny}>{spot?.zone}</Text>
          </View>
        </View>
        {meetup.note ? (
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Icon name="chatbubble-outline" size={18} color={colors.blue600} />
            </View>
            <Text style={[font.small, { flex: 1, color: colors.text }]}>“{meetup.note}”</Text>
          </View>
        ) : null}
        <View style={styles.party}>
          <Avatar user={other} size={36} />
          <Text style={[font.body, { flex: 1, marginLeft: spacing.sm }]}>
            {isBuyer ? 'ผู้ขาย' : 'ผู้ซื้อ'}: {other.name}
          </Text>
          <Button size="sm" variant="secondary" title="แชต" onPress={openChat} />
        </View>
      </Card>

      {!closed ? (
        <Card style={{ marginTop: spacing.md }}>
          {STEPS.map((s, i) => (
            <View key={s.id} style={styles.step}>
              <View style={[styles.stepDot, i <= stepIndex && styles.stepDotDone]}>
                {i <= stepIndex ? (
                  <Icon name="checkmark" size={14} color={colors.white} />
                ) : (
                  <Text style={{ color: colors.white, fontSize: 11, fontWeight: '700' }}>{i + 1}</Text>
                )}
              </View>
              <Text style={[font.body, i > stepIndex && { color: colors.muted }]}>{s.label}</Text>
            </View>
          ))}
          {meetup.status === 'accepted' ? (
            <Text style={[font.small, { marginTop: spacing.sm }]}>
              คุณ{iConfirmed ? 'ยืนยันแล้ว ✓' : 'ยังไม่ยืนยัน'} · {other.name}{otherConfirmed ? 'ยืนยันแล้ว ✓' : 'ยังไม่ยืนยัน'}
            </Text>
          ) : null}
        </Card>
      ) : (
        <Notice
          tone="danger"
          icon="close-circle-outline"
          text={`${meetup.status === 'declined' ? 'คำขอถูกปฏิเสธ' : 'นัดถูกยกเลิก'}${meetup.cancelReason ? `: ${meetup.cancelReason}` : ''}`}
          style={{ marginTop: spacing.md }}
        />
      )}

      {/* ปุ่มตามบทบาทและสถานะ */}
      <View style={{ marginTop: spacing.lg }}>
        {meetup.status === 'requested' && !isBuyer ? (
          <>
            <Button title="ตอบรับนัด" onPress={accept} />
            <Button title="ปฏิเสธ" variant="danger" onPress={decline} style={{ marginTop: spacing.sm }} />
          </>
        ) : null}

        {meetup.status === 'requested' && isBuyer ? (
          <>
            <Notice icon="hourglass-outline" text="รอผู้ขายตอบรับ สินค้ายังไม่ถูกจองจนกว่าผู้ขายจะตอบรับ" />
            <Button title="ยกเลิกคำขอ" variant="danger" onPress={() => setCancelling(true)} style={{ marginTop: spacing.md }} />
          </>
        ) : null}

        {meetup.status === 'accepted' ? (
          <>
            <Button
              title={iConfirmed ? 'คุณยืนยันแล้ว รออีกฝ่าย' : isBuyer ? 'ได้รับสินค้าแล้ว' : 'ส่งมอบสินค้าแล้ว'}
              disabled={iConfirmed}
              onPress={confirmHandover}
            />
            {!iConfirmed ? (
              <Button title="ยกเลิกนัด" variant="danger" onPress={() => setCancelling(true)} style={{ marginTop: spacing.sm }} />
            ) : null}
          </>
        ) : null}

        {meetup.status === 'completed' ? (
          app.hasReviewed(meetupId) ? (
            <Notice icon="star-outline" text="คุณรีวิวการซื้อขายนี้แล้ว ขอบคุณที่ช่วยให้ชุมชนน่าเชื่อถือ" />
          ) : (
            <Button title={`⭐ รีวิว ${other.name}`} onPress={() => navigation.navigate('Review', { meetupId })} />
          )
        ) : null}

        {cancelling ? (
          <Card style={{ marginTop: spacing.md }}>
            <Text style={[font.h3, { marginBottom: spacing.sm }]}>เหตุผลที่ยกเลิก</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {cancelReasons.map((r) => (
                <Chip key={r} label={r} selected={reason === r} onPress={() => setReason(r)} />
              ))}
            </View>
            <View style={{ flexDirection: 'row', marginTop: spacing.sm }}>
              <Button title="ไม่ยกเลิก" variant="secondary" onPress={() => setCancelling(false)} style={{ flex: 1, marginRight: spacing.sm }} />
              <Button title="ยืนยันยกเลิก" disabled={!reason} onPress={submitCancel} style={{ flex: 1 }} />
            </View>
          </Card>
        ) : null}
      </View>

      {/* โหมดเดโม: จำลองการกระทำของอีกฝ่าย เพื่อทดสอบ flow ได้ครบด้วยเครื่องเดียว */}
      {meetup.status === 'requested' && isBuyer ? (
        <DemoBox>
          <Button size="sm" variant="secondary" title="ให้ผู้ขายตอบรับ" onPress={() => {
            const r = app.acceptMeetup(meetupId);
            if (!r.ok) Alert.alert('ตอบรับไม่ได้', r.message);
          }} />
        </DemoBox>
      ) : null}
      {meetup.status === 'accepted' && !otherConfirmed ? (
        <DemoBox>
          <Button size="sm" variant="secondary" title={`ให้${other.name}กดยืนยันส่งมอบ`} onPress={() => app.confirmMeetup(meetupId, otherId)} />
        </DemoBox>
      ) : null}

      {!closed ? (
        <Text
          style={[font.small, { color: colors.danger, marginTop: spacing.xl, textAlign: 'center' }]}
          onPress={() => navigation.navigate('Report', { targetType: 'user', targetId: otherId })}
        >
          มีปัญหากับ{other.name}? รายงานผู้ใช้
        </Text>
      ) : null}
    </ScrollView>
  );
}

function DemoBox({ children }) {
  return (
    <View style={styles.demo}>
      <Text style={[font.tiny, { marginBottom: spacing.sm }]}>โหมดเดโม (จำลองการกระทำของอีกฝ่าย)</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  party: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  step: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.blue50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  stepDotDone: { backgroundColor: colors.success },
  demo: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.muted,
  },
});
