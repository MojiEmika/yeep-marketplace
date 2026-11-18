// O04 รีวิวหลังนัดรับสำเร็จ
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { ListingRow } from '../components/ListingCard';
import { Avatar, Button, Card, EmptyState, Field, Stars } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors, font, spacing } from '../theme';

const LABELS = ['', 'แย่มาก', 'ไม่ค่อยดี', 'พอใช้', 'ดี', 'ดีมาก'];

export default function ReviewScreen({ navigation, route }) {
  const { meetupId } = route.params;
  const { me, getMeetup, getListing, getUser, hasReviewed, submitReview } = useApp();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');

  const meetup = getMeetup(meetupId);
  if (!meetup || !me) return <EmptyState icon="help-circle-outline" title="ไม่พบนัดรับนี้" />;
  if (meetup.status !== 'completed') {
    return <EmptyState icon="hourglass-outline" title="รีวิวได้หลังซื้อขายสำเร็จ" actionLabel="กลับ" onAction={() => navigation.goBack()} />;
  }
  if (hasReviewed(meetupId)) {
    return <EmptyState icon="star-outline" title="คุณรีวิวไปแล้ว" actionLabel="กลับ" onAction={() => navigation.goBack()} />;
  }

  const isBuyer = meetup.buyerId === me.id;
  const other = getUser(isBuyer ? meetup.sellerId : meetup.buyerId);

  const submit = () => {
    submitReview({ meetupId, rating, text: text.trim() });
    navigation.goBack();
  };

  return (
    <ScrollView style={{ backgroundColor: colors.cream }} contentContainerStyle={{ padding: spacing.lg }} keyboardShouldPersistTaps="handled">
      <Card>
        <ListingRow listing={getListing(meetup.listingId)} right={null} />
      </Card>
      <View style={{ alignItems: 'center', marginVertical: spacing.xl }}>
        <Avatar user={other} size={64} />
        <Text style={[font.h3, { marginTop: spacing.sm }]}>
          การ{isBuyer ? 'ซื้อจาก' : 'ขายให้'} {other.name} เป็นอย่างไร?
        </Text>
        <View style={{ marginTop: spacing.md }}>
          <Stars value={rating} size={40} onChange={setRating} />
        </View>
        <Text style={[font.small, { marginTop: spacing.xs }]}>{LABELS[rating] || 'แตะดาวเพื่อให้คะแนน'}</Text>
      </View>
      <Field
        label="เล่าเพิ่มเติม (ไม่บังคับ)"
        placeholder="เช่น ของตรงปก มาตรงเวลา"
        multiline
        maxLength={300}
        value={text}
        onChangeText={setText}
      />
      <Button title="ส่งรีวิว" disabled={!rating} onPress={submit} />
    </ScrollView>
  );
}
