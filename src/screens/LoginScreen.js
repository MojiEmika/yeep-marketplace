// A01–A03 เข้าสู่ระบบด้วยอีเมลมหาวิทยาลัย (รอบนี้เป็นระบบจำลอง)
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Field, Icon, Logo, Notice } from '../components/ui';
import { useApp } from '../context/AppContext';
import { ALLOWED_EMAIL_DOMAIN, MOCK_OTP } from '../data/mock';
import { colors, font, radius, spacing } from '../theme';

export default function LoginScreen({ navigation }) {
  const { login } = useApp();
  const [step, setStep] = useState('email'); // 'email' | 'code'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateEmail = () => {
    const value = email.trim().toLowerCase();
    if (!value) return 'กรุณากรอกอีเมล';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'รูปแบบอีเมลไม่ถูกต้อง';
    if (!value.endsWith('@' + ALLOWED_EMAIL_DOMAIN)) return `ใช้ได้เฉพาะอีเมลนักศึกษา @${ALLOWED_EMAIL_DOMAIN}`;
    if (!agreed) return 'กรุณายอมรับข้อตกลงการใช้งานก่อน';
    return null;
  };

  const requestCode = () => {
    const err = validateEmail();
    setError(err);
    if (err) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('code');
    }, 600);
  };

  const verify = () => {
    if (code !== MOCK_OTP) {
      setError('รหัสไม่ถูกต้อง ลองใหม่อีกครั้ง');
      return;
    }
    login(email);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.cream }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: spacing.xl }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center', marginVertical: spacing.xl }}>
          <Logo height={56} />
          <Text style={[font.small, { marginTop: spacing.sm, textAlign: 'center' }]}>
            Good Things Find New People
ตลาดของมือสองสำหรับนักศึกษา มทส.
          </Text>
        </View>

        {step === 'email' ? (
          <>
            <Field
              label="อีเมลนักศึกษา"
              placeholder={`b6xxxxxx@${ALLOWED_EMAIL_DOMAIN}`}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setError(null);
              }}
              hint="ใช้อีเมลมหาวิทยาลัยเพื่อยืนยันว่าเป็นนักศึกษา"
            />
            <Pressable style={styles.consent} onPress={() => setAgreed(!agreed)} accessibilityRole="checkbox" accessibilityState={{ checked: agreed }}>
              <View style={[styles.checkbox, agreed && styles.checkboxOn]}>
                {agreed ? <Icon name="checkmark" size={16} color={colors.white} /> : null}
              </View>
              <Text style={[font.small, { flex: 1, color: colors.text }]}>
                ฉันยอมรับข้อตกลงการใช้งานและนโยบายความเป็นส่วนตัวของ YeEP
              </Text>
            </Pressable>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title="ขอรหัสยืนยัน" onPress={requestCode} loading={loading} style={{ marginTop: spacing.md }} />
          </>
        ) : (
          <>
            <Text style={[font.body, { marginBottom: spacing.md }]}>
              ส่งรหัส 6 หลักไปที่ <Text style={{ fontWeight: '700' }}>{email.trim().toLowerCase()}</Text> แล้ว
            </Text>
            <Field
              label="รหัสยืนยัน"
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={(t) => {
                setCode(t.replace(/\D/g, ''));
                setError(null);
              }}
              error={error}
            />
            <Notice icon="flask-outline" text={`โหมดทดสอบ: ใช้รหัส ${MOCK_OTP}`} style={{ marginBottom: spacing.lg }} />
            <Button title="ยืนยันและเข้าสู่ระบบ" disabled={code.length !== 6} onPress={verify} />
            <Button
              title="แก้ไขอีเมล"
              variant="ghost"
              onPress={() => {
                setStep('email');
                setCode('');
                setError(null);
              }}
              style={{ marginTop: spacing.sm }}
            />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  consent: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.sm / 2,
    borderWidth: 1.5,
    borderColor: colors.navy,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  checkboxOn: { backgroundColor: colors.navy },
  error: { color: colors.danger, fontSize: 13, marginTop: spacing.xs },
});
