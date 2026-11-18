// S01 เริ่มลงขาย (หน้าแนะนำขั้นตอน)
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Icon } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors, font, radius, shadow, spacing } from '../theme';

const STEPS = [
  { icon: 'camera-outline', title: 'ถ่ายรูป', text: 'ถ่ายจากมือถือได้เลย สูงสุด 5 รูป' },
  { icon: 'create-outline', title: 'ใส่รายละเอียด', text: 'ชื่อ หมวด สภาพ และตำหนิ (ถ้ามี)' },
  { icon: 'pricetag-outline', title: 'ตั้งราคาและจุดนัดรับ', text: 'เลือกจุดใน มทส. ที่คุณสะดวก' },
  { icon: 'rocket-outline', title: 'ลงขาย', text: 'เสร็จแล้ว! รอคนทักมาได้เลย' },
];

export default function SellScreen({ navigation }) {
  const { isLoggedIn, me, listings } = useApp();
  const myCount = isLoggedIn ? listings.filter((l) => l.sellerId === me.id && l.status === 'available').length : 0;

  const start = () => (isLoggedIn ? navigation.navigate('SellForm') : navigation.navigate('Login'));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxl }}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={font.display}>ลงขายของ{'\n'}ง่ายกว่าที่คิด</Text>
            <Text style={[font.small, { marginTop: spacing.sm }]}>มีแค่ 1–2 ชิ้น ก็เริ่มได้เลย</Text>
          </View>
          <View style={styles.polaroid}>
            <View style={styles.polaroidInner}>
              <Icon name="bag-handle-outline" size={34} color={colors.navy} />
            </View>
          </View>
        </View>

        <View style={styles.steps}>
          {STEPS.map((s, i) => (
            <View key={s.title} style={styles.step}>
              <View style={styles.stepIcon}>
                <Icon name={s.icon} size={22} color={colors.blue600} />
              </View>
              <Text style={styles.stepNo}>{i + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[font.body, { fontWeight: '700' }]}>{s.title}</Text>
                <Text style={font.tiny}>{s.text}</Text>
              </View>
            </View>
          ))}
        </View>

        <Button title="เริ่มลงขาย" iconRight="arrow-forward" onPress={start} style={{ marginTop: spacing.xl }} />
        {isLoggedIn ? (
          <Button
            title={`ประกาศของฉัน (${myCount} ขายอยู่)`}
            variant="ghost"
            onPress={() => navigation.navigate('MyListings')}
            style={{ marginTop: spacing.sm }}
          />
        ) : (
          <Text style={[font.small, { textAlign: 'center', marginTop: spacing.md }]}>ต้องเข้าสู่ระบบด้วยอีเมลนักศึกษาก่อนลงขาย</Text>
        )}

        <View style={styles.footer}>
          <Text style={styles.script}>Let's</Text>
          <Image source={require('../../assets/brand/logo-navy.png')} style={{ width: 64, height: 24 }} resizeMode="contain" />
          <Text style={styles.script}>it! ♡</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg },
  polaroid: {
    backgroundColor: colors.white,
    padding: 8,
    paddingBottom: 18,
    borderRadius: radius.sm,
    transform: [{ rotate: '6deg' }],
    ...shadow,
  },
  polaroidInner: {
    width: 84,
    height: 84,
    borderRadius: radius.xs,
    backgroundColor: colors.pink100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  steps: {
    marginTop: spacing.xxl,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    ...shadow,
  },
  step: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  stepIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.blue50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNo: { width: 30, textAlign: 'center', fontSize: 18, fontWeight: '800', color: colors.navy },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl, opacity: 0.8 },
  script: { fontStyle: 'italic', fontSize: 16, color: colors.navy, marginHorizontal: 4 },
});
