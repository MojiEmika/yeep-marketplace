// U03 แก้ไขโปรไฟล์
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar, Button, Field } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors, font, spacing } from '../theme';

const AVATAR_COLORS = ['#F2A541', '#8FB4FF', '#F6A9B8', '#4F6DD7', '#5B9A8B', '#C97B84', '#071943'];

export default function EditProfileScreen({ navigation }) {
  const { me, updateProfile } = useApp();
  const [name, setName] = useState(me?.name || '');
  const [bio, setBio] = useState(me?.bio || '');
  const [avatarColor, setAvatarColor] = useState(me?.avatarColor);
  const [error, setError] = useState(null);

  if (!me) return null;

  const save = () => {
    const n = name.trim();
    if (n.length < 2) {
      setError('ชื่อที่แสดงต้องมีอย่างน้อย 2 ตัวอักษร');
      return;
    }
    updateProfile({ name: n, bio: bio.trim(), avatarColor });
    navigation.goBack();
  };

  return (
    <ScrollView style={{ backgroundColor: colors.cream }} contentContainerStyle={{ padding: spacing.lg }} keyboardShouldPersistTaps="handled">
      <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
        <Avatar user={{ name: name || '?', avatarColor }} size={92} />
        <Text style={[font.small, { marginTop: spacing.md }]}>เลือกสีรูปโปรไฟล์</Text>
        <View style={styles.colors}>
          {AVATAR_COLORS.map((c) => (
            <Text
              key={c}
              onPress={() => setAvatarColor(c)}
              accessibilityRole="button"
              accessibilityLabel={`สี ${c}`}
              style={[styles.swatch, { backgroundColor: c }, avatarColor === c && styles.swatchOn]}
            />
          ))}
        </View>
      </View>

      <Field
        label="ชื่อที่แสดง"
        required
        value={name}
        onChangeText={(t) => {
          setName(t);
          setError(null);
        }}
        maxLength={30}
        error={error}
      />
      <Field label="แนะนำตัว" multiline maxLength={150} value={bio} onChangeText={setBio} placeholder="เช่น นัดรับแถวอาคารเรียนรวมได้" hint={`${bio.length}/150`} />
      <Field label="อีเมล" value={me.email} editable={false} hint="อีเมลนักศึกษาที่ยืนยันแล้ว เปลี่ยนไม่ได้" />
      <Button title="บันทึก" onPress={save} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  colors: { flexDirection: 'row', marginTop: spacing.sm },
  swatch: { width: 30, height: 30, borderRadius: 15, marginHorizontal: 5, overflow: 'hidden' },
  swatchOn: { borderWidth: 3, borderColor: colors.white, transform: [{ scale: 1.15 }] },
});
