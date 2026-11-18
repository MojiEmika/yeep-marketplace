// W01 รายการที่ถูกใจ
import React from 'react';
import { FlatList, useWindowDimensions } from 'react-native';
import ListingCard from '../components/ListingCard';
import { EmptyState } from '../components/ui';
import { useApp } from '../context/AppContext';
import { spacing } from '../theme';

export default function WishlistScreen({ navigation }) {
  const { favorites, getListing, toggleFavorite } = useApp();
  const { width } = useWindowDimensions();
  const cardWidth = (width - spacing.lg * 2 - spacing.md) / 2;
  const items = favorites.map(getListing).filter(Boolean);

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={{ justifyContent: 'space-between' }}
      contentContainerStyle={{ padding: spacing.lg, flexGrow: 1 }}
      renderItem={({ item }) => (
        <ListingCard
          listing={item}
          width={cardWidth}
          onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
          onToggleFavorite={() => toggleFavorite(item.id)}
        />
      )}
      ListEmptyComponent={
        <EmptyState
          icon="heart-outline"
          title="ยังไม่มีรายการที่ถูกใจ"
          subtitle="กดหัวใจที่สินค้าเพื่อเก็บไว้ดูทีหลัง"
          actionLabel="ไปเลือกดูสินค้า"
          onAction={() => navigation.navigate('Tabs', { screen: 'Search', params: { categoryId: null } })}
        />
      }
    />
  );
}
