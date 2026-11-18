// S02–S05 ลงขายแบบทีละขั้น และ S07 แก้ไขประกาศ
import * as ImagePicker from 'expo-image-picker';
import React, { useLayoutEffect, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ListingImage } from '../components/ListingCard';
import { Button, Chip, Field, Icon, Notice } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors, font, radius, shadow, spacing } from '../theme';
import { formatPrice } from '../utils/format';

const MAX_PHOTOS = 5;
const STEPS = ['รูปสินค้า', 'รายละเอียด', 'ราคาและจุดนัด', 'ตรวจทาน'];

const emptyForm = {
  images: [],
  title: '',
  categoryId: null,
  condition: null,
  size: '',
  brand: '',
  price: '',
  description: '',
  defects: '',
  meetupSpotIds: [],
};

export default function SellFormScreen({ navigation, route }) {
  const { categories, conditions, meetupSpots, getListing, getCategory, getCondition, getSpot, createListing, updateListing } = useApp();
  const editingId = route.params?.listingId;
  const isEdit = !!editingId;
  const original = isEdit ? getListing(editingId) : null;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() =>
    original
      ? { ...emptyForm, ...original, price: String(original.price), size: original.size || '', brand: original.brand || '' }
      : emptyForm,
  );
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // ประกาศที่ถูกจองหรือขายแล้วห้ามแก้ราคา/รายละเอียด
  const locked = isEdit && original && original.status !== 'available' && original.status !== 'paused';

  useLayoutEffect(() => {
    navigation.setOptions({ title: isEdit ? 'แก้ไขประกาศ' : 'ลงขายสินค้า' });
  }, [navigation, isEdit]);

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const pickImages = async () => {
    const remaining = MAX_PHOTOS - form.images.length;
    if (remaining <= 0) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('ต้องการสิทธิ์เข้าถึงรูปภาพ', 'กรุณาอนุญาตการเข้าถึงคลังรูปในการตั้งค่าของเครื่อง');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.7,
    });
    if (!result.canceled) set('images', [...form.images, ...result.assets.map((a) => a.uri)].slice(0, MAX_PHOTOS));
  };

  const takePhoto = async () => {
    if (form.images.length >= MAX_PHOTOS) return;
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('ต้องการสิทธิ์ใช้กล้อง', 'กรุณาอนุญาตการใช้กล้องในการตั้งค่าของเครื่อง');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) set('images', [...form.images, result.assets[0].uri]);
  };

  const removeImage = (uri) => set('images', form.images.filter((u) => u !== uri));
  const makeCover = (uri) => set('images', [uri, ...form.images.filter((u) => u !== uri)]);

  const toggleSpot = (id) =>
    set('meetupSpotIds', form.meetupSpotIds.includes(id) ? form.meetupSpotIds.filter((s) => s !== id) : [...form.meetupSpotIds, id]);

  // ตรวจเฉพาะช่องของขั้นที่กำลังทำ
  const validateStep = (s) => {
    const e = {};
    if (s === 0 && !isEdit && form.images.length === 0) e.images = 'เพิ่มรูปอย่างน้อย 1 รูป';
    if (s === 1) {
      const title = form.title.trim();
      if (title.length < 5) e.title = 'ชื่อสินค้าต้องมีอย่างน้อย 5 ตัวอักษร';
      if (!form.categoryId) e.categoryId = 'เลือกหมวดหมู่';
      if (!form.condition) e.condition = 'เลือกสภาพสินค้า';
    }
    if (s === 2) {
      const price = Number(form.price);
      if (!form.price || !Number.isInteger(price) || price < 1) e.price = 'กรอกราคาเป็นตัวเลขจำนวนเต็มตั้งแต่ 1 บาท';
      else if (price > 100000) e.price = 'ราคาสูงเกินกำหนด (ไม่เกิน 100,000 บาท)';
      if (form.meetupSpotIds.length === 0) e.meetupSpotIds = 'เลือกจุดนัดรับอย่างน้อย 1 จุด';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => (step === 0 ? navigation.goBack() : setStep((s) => s - 1));

  const submit = () => {
    for (let s = 0; s < 3; s += 1) {
      if (!validateStep(s)) {
        setStep(s);
        return;
      }
    }
    const data = {
      images: form.images,
      title: form.title.trim(),
      categoryId: form.categoryId,
      condition: form.condition,
      size: form.categoryId === 'clothing' ? form.size.trim() : '',
      brand: form.brand.trim(),
      price: Number(form.price),
      description: form.description.trim(),
      defects: form.defects.trim(),
      meetupSpotIds: form.meetupSpotIds,
    };
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      if (isEdit) {
        updateListing(editingId, data);
        navigation.goBack();
      } else {
        const id = createListing(data);
        navigation.replace('ListingDetail', { listingId: id });
      }
    }, 500);
  };

  const preview = { ...form, price: Number(form.price) || 0, tint: original?.tint || colors.creamDark };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.cream }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={100}>
      {/* แถบความคืบหน้า */}
      <View style={styles.progressWrap}>
        <View style={styles.progressRow}>
          {STEPS.map((label, i) => (
            <Pressable key={label} style={{ flex: 1 }} onPress={() => (i < step || isEdit ? setStep(i) : null)}>
              <View style={[styles.progressBar, i <= step && { backgroundColor: colors.navy }]} />
            </Pressable>
          ))}
        </View>
        <Text style={font.tiny}>
          ขั้นที่ {step + 1}/{STEPS.length} · <Text style={{ color: colors.text, fontWeight: '700' }}>{STEPS[step]}</Text>
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        {locked ? (
          <Notice tone="warning" icon="lock-closed-outline" text="ประกาศนี้ถูกจองหรือขายแล้ว แก้ไขราคาและรายละเอียดไม่ได้" style={{ marginBottom: spacing.lg }} />
        ) : null}

        {step === 0 ? (
          <>
            <Text style={font.h2}>เพิ่มรูปสินค้า</Text>
            <Text style={[font.small, { marginBottom: spacing.lg }]}>ถ่ายให้เห็นตำหนิชัดๆ ช่วยให้ขายง่ายขึ้น · สูงสุด {MAX_PHOTOS} รูป</Text>
            <View style={styles.photoGrid}>
              {form.images.map((uri, i) => (
                <Pressable key={uri} style={styles.photo} onLongPress={() => makeCover(uri)}>
                  <Image source={{ uri }} style={styles.photoImg} />
                  {i === 0 ? <Text style={styles.coverTag}>รูปปก</Text> : null}
                  {!locked ? (
                    <Pressable style={styles.removePhoto} onPress={() => removeImage(uri)} accessibilityLabel="ลบรูป" hitSlop={6}>
                      <Icon name="close" size={14} color={colors.white} />
                    </Pressable>
                  ) : null}
                </Pressable>
              ))}
              {form.images.length < MAX_PHOTOS && !locked ? (
                <>
                  <Pressable style={styles.addPhoto} onPress={takePhoto}>
                    <Icon name="camera-outline" size={28} color={colors.blue600} />
                    <Text style={[font.tiny, { color: colors.blue600, marginTop: 4 }]}>ถ่ายรูป</Text>
                  </Pressable>
                  <Pressable style={styles.addPhoto} onPress={pickImages}>
                    <Icon name="images-outline" size={28} color={colors.blue600} />
                    <Text style={[font.tiny, { color: colors.blue600, marginTop: 4 }]}>เลือกจากคลัง</Text>
                  </Pressable>
                </>
              ) : null}
            </View>
            {errors.images ? <Text style={styles.error}>{errors.images}</Text> : null}
            {form.images.length > 1 ? <Text style={font.tiny}>กดค้างที่รูปเพื่อตั้งเป็นรูปปก</Text> : null}
          </>
        ) : null}

        {step === 1 ? (
          <>
            <Text style={[font.h2, { marginBottom: spacing.lg }]}>ใส่รายละเอียด</Text>
            <Field
              label="ชื่อสินค้า"
              required
              placeholder="เช่น เสื้อไหมพรมคอปก สีครีม"
              value={form.title}
              onChangeText={(t) => set('title', t)}
              maxLength={80}
              editable={!locked}
              error={errors.title}
            />
            <Text style={styles.label}>
              หมวดหมู่<Text style={{ color: colors.danger }}> *</Text>
            </Text>
            <View style={styles.wrap}>
              {categories.map((c) => (
                <Chip key={c.id} icon={c.icon} label={c.name} selected={form.categoryId === c.id} onPress={() => !locked && set('categoryId', c.id)} />
              ))}
            </View>
            {errors.categoryId ? <Text style={styles.error}>{errors.categoryId}</Text> : null}

            <Text style={[styles.label, { marginTop: spacing.md }]}>
              สภาพสินค้า<Text style={{ color: colors.danger }}> *</Text>
            </Text>
            <View style={styles.wrap}>
              {conditions.map((c) => (
                <Chip key={c.id} label={c.name} selected={form.condition === c.id} onPress={() => !locked && set('condition', c.id)} />
              ))}
            </View>
            {errors.condition ? <Text style={styles.error}>{errors.condition}</Text> : null}

            <View style={{ height: spacing.md }} />
            <View style={{ flexDirection: 'row' }}>
              {form.categoryId === 'clothing' ? (
                <Field label="ไซซ์" placeholder="S, M, L, Freesize" value={form.size} onChangeText={(t) => set('size', t)} editable={!locked} style={{ flex: 1, marginRight: spacing.sm }} />
              ) : null}
              <Field label="แบรนด์" placeholder="ถ้ามี" value={form.brand} onChangeText={(t) => set('brand', t)} editable={!locked} style={{ flex: 1 }} />
            </View>
            <Field
              label="รายละเอียด"
              placeholder="ซื้อมาเมื่อไหร่ ใช้ไปนานแค่ไหน มีอะไรแถมบ้าง"
              multiline
              value={form.description}
              onChangeText={(t) => set('description', t)}
              maxLength={1000}
              editable={!locked}
            />
            <Field
              label="ตำหนิ (ถ้ามี)"
              placeholder="เช่น มีรอยขีดข่วนที่มุม"
              value={form.defects}
              onChangeText={(t) => set('defects', t)}
              editable={!locked}
              hint="บอกตำหนิให้ชัด ลดปัญหาตอนนัดรับ"
            />
          </>
        ) : null}

        {step === 2 ? (
          <>
            <Text style={[font.h2, { marginBottom: spacing.lg }]}>ตั้งราคาและจุดนัดรับ</Text>
            <Text style={styles.label}>
              ราคา<Text style={{ color: colors.danger }}> *</Text>
            </Text>
            <View style={[styles.priceBox, errors.price && { borderColor: colors.danger }]}>
              <Text style={styles.baht}>฿</Text>
              <Field
                placeholder="0"
                keyboardType="number-pad"
                value={form.price}
                onChangeText={(t) => set('price', t.replace(/\D/g, ''))}
                editable={!locked}
                style={{ flex: 1, marginBottom: 0 }}
              />
            </View>
            {errors.price ? <Text style={styles.error}>{errors.price}</Text> : <Text style={[styles.hint, { marginBottom: spacing.lg }]}>ซื้อขายกันเอง YeEP ไม่เก็บค่าธรรมเนียม</Text>}

            <Text style={[styles.label, { marginTop: spacing.md }]}>
              จุดนัดรับที่สะดวก<Text style={{ color: colors.danger }}> *</Text>
            </Text>
            {meetupSpots.map((s) => {
              const on = form.meetupSpotIds.includes(s.id);
              return (
                <Pressable key={s.id} style={[styles.spotRow, on && styles.spotRowOn]} onPress={() => toggleSpot(s.id)}>
                  <Icon name={on ? 'checkbox' : 'square-outline'} size={22} color={on ? colors.navy : colors.muted} />
                  <View style={{ marginLeft: spacing.md, flex: 1 }}>
                    <Text style={font.body}>{s.name}</Text>
                    <Text style={font.tiny}>{s.zone}</Text>
                  </View>
                  <Icon name="location-outline" size={18} color={colors.blue600} />
                </Pressable>
              );
            })}
            {errors.meetupSpotIds ? <Text style={styles.error}>{errors.meetupSpotIds}</Text> : null}
          </>
        ) : null}

        {step === 3 ? (
          <>
            <Text style={[font.h2, { marginBottom: spacing.lg }]}>ตรวจทานก่อนลงขาย</Text>
            <View style={styles.previewCard}>
              <ListingImage listing={preview} style={styles.previewImg} />
              <View style={{ padding: spacing.lg }}>
                <Text style={font.h3}>{form.title}</Text>
                <Text style={[font.h2, { marginTop: 2 }]}>{formatPrice(form.price)}</Text>
                <Text style={[font.small, { marginTop: spacing.sm }]}>
                  {getCategory(form.categoryId)?.name} · {getCondition(form.condition)?.name}
                  {form.size ? ` · ไซซ์ ${form.size}` : ''}
                </Text>
                {form.defects ? <Text style={[font.small, { color: colors.warning }]}>ตำหนิ: {form.defects}</Text> : null}
                <Text style={[font.small, { marginTop: spacing.sm }]}>
                  นัดรับ: {form.meetupSpotIds.map((id) => getSpot(id)?.name).join(', ')}
                </Text>
              </View>
            </View>
            <Notice
              icon="ban-outline"
              text="ห้ามลงขายสินค้าผิดกฎหมาย ของปลอม หรือสินค้าต้องห้ามตามนโยบายของ YeEP"
              style={{ marginTop: spacing.lg }}
            />
          </>
        ) : null}
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <View style={{ flexDirection: 'row', padding: spacing.md }}>
          <Button title={step === 0 ? 'ยกเลิก' : 'ย้อนกลับ'} variant="secondary" onPress={back} style={{ flex: 1, marginRight: spacing.sm }} />
          {step < STEPS.length - 1 ? (
            <Button title="ต่อไป" iconRight="arrow-forward" onPress={next} style={{ flex: 1.6 }} />
          ) : (
            <Button title={isEdit ? 'บันทึกการแก้ไข' : 'ลงขายเลย'} onPress={submit} loading={submitting} style={{ flex: 1.6 }} />
          )}
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const PHOTO = 100;

const styles = StyleSheet.create({
  progressWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  progressRow: { flexDirection: 'row', marginBottom: spacing.sm },
  progressBar: { height: 5, borderRadius: 3, backgroundColor: colors.gray, marginRight: 4 },
  label: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  error: { color: colors.danger, fontSize: 13, marginBottom: spacing.sm },
  hint: { color: colors.muted, fontSize: 12, marginTop: spacing.xs },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.sm },
  photo: { marginRight: spacing.sm, marginBottom: spacing.sm },
  photoImg: { width: PHOTO, height: PHOTO, borderRadius: radius.md },
  coverTag: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: colors.navy,
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  removePhoto: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhoto: {
    width: PHOTO,
    height: PHOTO,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.blue50,
  },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  baht: { fontSize: 24, fontWeight: '800', color: colors.navy, marginRight: spacing.sm },
  spotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.gray,
    marginBottom: spacing.sm,
  },
  spotRowOn: { borderColor: colors.navy, backgroundColor: colors.blue50 },
  previewCard: { backgroundColor: colors.white, borderRadius: radius.lg, overflow: 'hidden', ...shadow },
  previewImg: { width: '100%', height: 220 },
  footer: { backgroundColor: colors.white, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
});
