// U05–U07 ตั้งค่า (รอบนี้เก็บค่าไว้ในหน้าจอเท่านั้น)
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { MenuRow } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors, font, radius, spacing } from '../theme';

const PREFS = [
  { id: 'chat', label: 'ข้อความใหม่' },
  { id: 'meetup', label: 'คำขอและการตอบรับนัดรับ' },
  { id: 'reminder', label: 'เตือนก่อนถึงเวลานัด' },
  { id: 'favorite', label: 'สินค้าที่ถูกใจลดราคาหรือถูกจอง' },
];

export default function SettingsScreen({ navigation }) {
  const { me, logout } = useApp();
  const [prefs, setPrefs] = useState({ chat: true, meetup: true, reminder: true, favorite: false });

  return (
    <ScrollView style={{ backgroundColor: colors.cream }} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={styles.group}>บัญชี</Text>
      <View style={styles.box}>
        <Row label="อีเมล" value={me?.email} />
        <Row label="สถานะ" value="ยืนยันอีเมลนักศึกษาแล้ว" />
      </View>

      <Text style={styles.group}>การแจ้งเตือน</Text>
      <View style={styles.box}>
        {PREFS.map((p) => (
          <View key={p.id} style={styles.row}>
            <Text style={[font.body, { flex: 1 }]}>{p.label}</Text>
            <Switch
              value={prefs[p.id]}
              onValueChange={(v) => setPrefs((s) => ({ ...s, [p.id]: v }))}
              trackColor={{ true: colors.navy }}
            />
          </View>
        ))}
      </View>

      <Text style={styles.group}>อื่นๆ</Text>
      <View style={[styles.box, { paddingHorizontal: 0, overflow: 'hidden' }]}>
        <MenuRow icon="shield-checkmark-outline" label="นัดรับอย่างปลอดภัย" onPress={() => navigation.navigate('Safety')} />
        <MenuRow icon="document-text-outline" label="ข้อตกลงการใช้งาน" onPress={() => Alert.alert('ข้อตกลงการใช้งาน', 'อยู่ระหว่างจัดทำ')} />
        <MenuRow icon="lock-closed-outline" label="นโยบายความเป็นส่วนตัว" onPress={() => Alert.alert('นโยบายความเป็นส่วนตัว', 'อยู่ระหว่างจัดทำ')} />
        <MenuRow
          icon="log-out-outline"
          label="ออกจากระบบ"
          danger
          onPress={() => {
            logout();
            navigation.navigate('Tabs', { screen: 'Home' });
          }}
        />
      </View>
    </ScrollView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={[font.small, { width: 70 }]}>{label}</Text>
      <Text style={[font.body, { flex: 1 }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { ...font.small, fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.sm },
  box: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
});
