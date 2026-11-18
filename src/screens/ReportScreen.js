// X02 รายงานประกาศหรือผู้ใช้
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Field, Notice } from '../components/ui';
import { useApp } from '../context/AppContext';
import { reportReasons } from '../data/mock';
import { colors, font, radius, spacing } from '../theme';

export default function ReportScreen({ navigation, route }) {
  const { targetType, targetId } = route.params;
  const { getListing, getUser, submitReport } = useApp();
  const [reason, setReason] = useState(null);
  const [detail, setDetail] = useState('');

  const targetName = targetType === 'listing' ? getListing(targetId)?.title : getUser(targetId)?.name;
  const reasons = reportReasons[targetType] || [];
  const needDetail = reason === 'อื่นๆ';
  const valid = reason && (!needDetail || detail.trim().length >= 10);

  const submit = () => {
    const ref = submitReport({ targetType, targetId, reason, detail: detail.trim() });
    Alert.alert('ส่งรายงานแล้ว', `เลขอ้างอิง ${ref}\nทีมงานจะตรวจสอบ ผู้ถูกรายงานจะไม่เห็นว่าใครเป็นผู้รายงาน`, [
      { text: 'ตกลง', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <ScrollView style={{ backgroundColor: colors.cream }} contentContainerStyle={{ padding: spacing.lg }} keyboardShouldPersistTaps="handled">
      <Text style={font.small}>{targetType === 'listing' ? 'รายงานประกาศ' : 'รายงานผู้ใช้'}</Text>
      <Text style={[font.h2, { marginBottom: spacing.lg }]} numberOfLines={2}>
        {targetName}
      </Text>

      <Text style={[font.h3, { marginBottom: spacing.sm }]}>เกิดอะไรขึ้น?</Text>
      {reasons.map((r) => (
        <Pressable key={r} style={[styles.option, reason === r && styles.optionOn]} onPress={() => setReason(r)} accessibilityRole="radio" accessibilityState={{ selected: reason === r }}>
          <View style={[styles.radio, reason === r && styles.radioOn]} />
          <Text style={font.body}>{r}</Text>
        </Pressable>
      ))}

      <Field
        label={needDetail ? 'รายละเอียด (อย่างน้อย 10 ตัวอักษร)' : 'รายละเอียดเพิ่มเติม (ไม่บังคับ)'}
        multiline
        maxLength={500}
        value={detail}
        onChangeText={setDetail}
        placeholder="อธิบายสั้นๆ ให้ทีมงานเข้าใจ"
        style={{ marginTop: spacing.lg }}
      />
      <Notice icon="warning-outline" tone="warning" text="ถ้าอยู่ในสถานการณ์อันตราย ให้ติดต่อเจ้าหน้าที่รักษาความปลอดภัยของมหาวิทยาลัยทันที" style={{ marginBottom: spacing.lg }} />
      <Button title="ส่งรายงาน" disabled={!valid} onPress={submit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  optionOn: { borderColor: colors.navy },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.muted, marginRight: spacing.md },
  radioOn: { borderColor: colors.navy, backgroundColor: colors.navy },
});
