// N01 การแจ้งเตือน
import React, { useLayoutEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors, font, spacing } from '../theme';
import { timeAgo } from '../utils/format';

export default function NotificationsScreen({ navigation }) {
  const { notifications, markNotificationRead, markAllNotificationsRead, unreadNotifications } = useApp();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        unreadNotifications ? (
          <Text onPress={markAllNotificationsRead} style={{ color: colors.navySoft, fontWeight: '600' }}>
            อ่านทั้งหมด
          </Text>
        ) : null,
    });
  }, [navigation, unreadNotifications, markAllNotificationsRead]);

  const open = (n) => {
    markNotificationRead(n.id);
    navigation.navigate(n.target.screen, n.target.params);
  };

  return (
    <FlatList
      style={{ backgroundColor: colors.white }}
      data={notifications}
      keyExtractor={(n) => n.id}
      contentContainerStyle={{ flexGrow: 1 }}
      renderItem={({ item }) => (
        <Pressable style={[styles.row, !item.read && { backgroundColor: colors.infoBg }]} onPress={() => open(item)}>
          <View style={[styles.dot, item.read && { backgroundColor: 'transparent' }]} />
          <View style={{ flex: 1 }}>
            <Text style={[font.body, { fontWeight: item.read ? '400' : '700' }]}>{item.title}</Text>
            <Text style={font.small}>{item.body}</Text>
            <Text style={font.tiny}>{timeAgo(item.createdAt)}</Text>
          </View>
        </Pressable>
      )}
      ListEmptyComponent={<EmptyState icon="notifications-off-outline" title="ยังไม่มีการแจ้งเตือน" />}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger, marginTop: 7, marginRight: spacing.md },
});
