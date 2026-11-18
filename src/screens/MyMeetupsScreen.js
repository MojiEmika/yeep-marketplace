// นัดรับของฉัน (แทน O01 การซื้อของฉัน และ S08 ออเดอร์ของผู้ขาย)
import React, { useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { ListingRow } from '../components/ListingCard';
import { Card, Chip, EmptyState, Icon, StatusBadge } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors, font, spacing } from '../theme';
import { formatDate } from '../utils/format';

export default function MyMeetupsScreen({ navigation, route }) {
  const { me, myMeetups, getListing, getUser, getSpot } = useApp();
  const [tab, setTab] = useState(route.params?.tab || 'buying');

  const items = myMeetups.filter((m) => (tab === 'buying' ? m.buyerId === me?.id : m.sellerId === me?.id));
  const count = (t) => myMeetups.filter((m) => (t === 'buying' ? m.buyerId === me?.id : m.sellerId === me?.id)).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <View style={{ flexDirection: 'row', paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
        <Chip label={`ที่ฉันซื้อ (${count('buying')})`} selected={tab === 'buying'} onPress={() => setTab('buying')} />
        <Chip label={`ที่ฉันขาย (${count('selling')})`} selected={tab === 'selling'} onPress={() => setTab('selling')} />
      </View>
      <FlatList
        data={items}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: spacing.lg, flexGrow: 1 }}
        renderItem={({ item }) => {
          const listing = getListing(item.listingId);
          const other = getUser(tab === 'buying' ? item.sellerId : item.buyerId);
          return (
            <Card style={{ marginBottom: spacing.md }} onPress={() => navigation.navigate('MeetupDetail', { meetupId: item.id })}>
              <ListingRow listing={listing} right={<StatusBadge status={item.status} type="meetup" />} />
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.md }}>
                <Icon name="calendar-outline" size={14} color={colors.blue600} />
                <Text style={[font.small, { color: colors.text, marginLeft: 4 }]}>
                  {formatDate(item.date)} {item.time} น.
                </Text>
                <Icon name="location-outline" size={14} color={colors.blue600} style={{ marginLeft: spacing.md }} />
                <Text style={[font.small, { color: colors.text, marginLeft: 4, flex: 1 }]} numberOfLines={1}>
                  {getSpot(item.spotId)?.name}
                </Text>
              </View>
              <Text style={font.tiny}>
                {tab === 'buying' ? 'ผู้ขาย' : 'ผู้ซื้อ'}: {other?.name}
              </Text>
            </Card>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title="ยังไม่มีนัดรับ"
            subtitle={tab === 'buying' ? 'กด "ขอนัดรับ" ที่หน้าสินค้าเพื่อเริ่มซื้อ' : 'เมื่อมีคนขอนัดรับสินค้าของคุณ จะแสดงที่นี่'}
          />
        }
      />
    </View>
  );
}
