// S06 ประกาศของฉัน
import React, { useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { ListingRow } from '../components/ListingCard';
import { Button, Card, Chip, EmptyState } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors, spacing } from '../theme';

const TABS = [
  { id: 'available', name: 'ขายอยู่' },
  { id: 'reserved', name: 'จองแล้ว' },
  { id: 'sold', name: 'ขายแล้ว' },
  { id: 'paused', name: 'ปิดไว้' },
];

export default function MyListingsScreen({ navigation }) {
  const { me, listings, myMeetups, setListingStatus } = useApp();
  const [tab, setTab] = useState('available');

  const mine = listings.filter((l) => l.sellerId === me?.id);
  const items = mine.filter((l) => l.status === tab);
  const count = (status) => mine.filter((l) => l.status === status).length;

  const pendingRequests = (listingId) =>
    myMeetups.filter((m) => m.listingId === listingId && m.status === 'requested').length;

  const confirmPause = (listing) => {
    if (pendingRequests(listing.id)) {
      Alert.alert('ยังมีคำขอนัดรับค้างอยู่', 'กรุณาตอบรับหรือปฏิเสธคำขอก่อนปิดประกาศ');
      return;
    }
    setListingStatus(listing.id, 'paused');
  };

  const renderItem = ({ item }) => {
    const requests = pendingRequests(item.id);
    const activeMeetup = myMeetups.find((m) => m.listingId === item.id && m.status === 'accepted');
    return (
      <Card style={{ marginBottom: spacing.md }}>
        <ListingRow listing={item} onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })} />
        <View style={styles.actions}>
          {item.status === 'available' ? (
            <>
              <Button size="sm" variant="secondary" title="แก้ไข" onPress={() => navigation.navigate('EditListing', { listingId: item.id })} style={styles.action} />
              <Button size="sm" variant="secondary" title="ปิดการขาย" onPress={() => confirmPause(item)} style={styles.action} />
              {requests ? (
                <Button size="sm" title={`คำขอนัด (${requests})`} onPress={() => navigation.navigate('MyMeetups', { tab: 'selling' })} style={styles.action} />
              ) : null}
            </>
          ) : null}
          {item.status === 'reserved' && activeMeetup ? (
            <Button size="sm" title="ดูนัดรับ" onPress={() => navigation.navigate('MeetupDetail', { meetupId: activeMeetup.id })} style={styles.action} />
          ) : null}
          {item.status === 'paused' ? (
            <>
              <Button size="sm" title="เปิดขายอีกครั้ง" onPress={() => setListingStatus(item.id, 'available')} style={styles.action} />
              <Button size="sm" variant="secondary" title="แก้ไข" onPress={() => navigation.navigate('EditListing', { listingId: item.id })} style={styles.action} />
            </>
          ) : null}
        </View>
      </Card>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {TABS.map((t) => (
            <Chip key={t.id} label={`${t.name} (${count(t.id)})`} selected={tab === t.id} onPress={() => setTab(t.id)} />
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: spacing.lg, flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyState
            icon="pricetag-outline"
            title="ยังไม่มีประกาศในสถานะนี้"
            actionLabel="ลงขายสินค้า"
            onAction={() => navigation.navigate('Tabs', { screen: 'Sell' })}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.md },
  action: { marginRight: spacing.sm, marginBottom: spacing.xs },
});
