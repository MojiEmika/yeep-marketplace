// ขอนัดรับสินค้า: เลือกจุดนัด วัน และเวลา
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ListingRow } from '../components/ListingCard';
import { Button, Card, Chip, EmptyState, Field, Notice } from '../components/ui';
import { useApp } from '../context/AppContext';
import { timeSlots } from '../data/mock';
import { colors, font, spacing } from '../theme';
import { dateKey, formatDate } from '../utils/format';

const DAYS = [0, 1, 2, 3, 4, 5, 6].map((n) => dateKey(n));

export default function MeetupRequestScreen({ navigation, route }) {
  const { listingId } = route.params;
  const { getListing, getSpot, getUser, requestMeetup } = useApp();
  const listing = getListing(listingId);

  const [spotId, setSpotId] = useState(listing?.meetupSpotIds.length === 1 ? listing.meetupSpotIds[0] : null);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [note, setNote] = useState('');

  if (!listing || listing.status !== 'available') {
    return (
      <EmptyState
        icon="close-circle-outline"
        title="สินค้านี้ไม่พร้อมให้นัดรับแล้ว"
        subtitle="อาจมีคนจองหรือผู้ขายปิดประกาศไปแล้ว"
        actionLabel="กลับ"
        onAction={() => navigation.goBack()}
      />
    );
  }

  const seller = getUser(listing.sellerId);
  // ถ้าเลือกวันนี้ ให้เลือกได้เฉพาะเวลาที่ยังไม่ผ่านไป
  const nowHM = new Date().getHours() * 60 + new Date().getMinutes();
  const isPast = (t) => {
    if (date !== DAYS[0]) return false;
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m <= nowHM + 30;
  };
  const ready = spotId && date && time && !isPast(time);

  const submit = () => {
    const result = requestMeetup({ listingId, spotId, date, time, note: note.trim() });
    if (!result.ok) {
      Alert.alert('ส่งคำขอไม่สำเร็จ', result.message);
      return;
    }
    navigation.replace('MeetupDetail', { meetupId: result.meetupId });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }} keyboardShouldPersistTaps="handled">
        <Card>
          <ListingRow listing={listing} right={null} />
          <Text style={[font.small, { marginTop: spacing.sm }]}>ผู้ขาย: {seller.name}</Text>
        </Card>

        <Text style={styles.label}>1. เลือกจุดนัดรับ</Text>
        <View style={styles.wrap}>
          {listing.meetupSpotIds.map((id) => (
            <Chip key={id} icon="location-outline" label={getSpot(id)?.name} selected={spotId === id} onPress={() => setSpotId(id)} />
          ))}
        </View>

        <Text style={styles.label}>2. เลือกวัน</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {DAYS.map((d, i) => (
            <Chip
              key={d}
              label={i === 0 ? 'วันนี้' : i === 1 ? 'พรุ่งนี้' : formatDate(d)}
              selected={date === d}
              onPress={() => {
                setDate(d);
                setTime(null);
              }}
            />
          ))}
        </ScrollView>

        <Text style={styles.label}>3. เลือกเวลา</Text>
        <View style={styles.wrap}>
          {timeSlots.map((t) => (
            <Chip
              key={t}
              label={t}
              selected={time === t}
              onPress={() => !isPast(t) && setTime(t)}
              style={isPast(t) ? { opacity: 0.35 } : null}
            />
          ))}
        </View>
        {!date ? <Text style={font.tiny}>เลือกวันก่อน แล้วค่อยเลือกเวลา</Text> : null}

        <Field
          label="ข้อความถึงผู้ขาย (ไม่บังคับ)"
          placeholder="เช่น ใส่เสื้อสีขาว / ขอดูของก่อนจ่ายนะคะ"
          value={note}
          onChangeText={setNote}
          maxLength={200}
          style={{ marginTop: spacing.lg }}
        />

        <Notice
          icon="shield-checkmark-outline"
          text="นัดในที่สาธารณะที่มีคนพลุกพล่าน ตรวจสภาพของก่อนจ่ายเงิน และอย่าโอนเงินล่วงหน้า"
          style={{ marginBottom: spacing.lg }}
        />
        <Notice
          icon="information-circle-outline"
          text="สินค้าจะยังไม่ถูกจองจนกว่าผู้ขายจะตอบรับคำขอ"
          style={{ marginBottom: spacing.lg }}
        />

        <Button title="ส่งคำขอนัดรับ" disabled={!ready} onPress={submit} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: '700', color: colors.text, fontSize: 15, marginTop: spacing.xl, marginBottom: spacing.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
});
