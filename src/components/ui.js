// ส่วนประกอบ UI ที่ใช้ร่วมกันทุกหน้า (ตาม Core UI Components ของ design system)
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, font, radius, shadow, spacing } from '../theme';

// ไอคอนเส้นมน (Ionicons) — ใช้ชื่อแบบ *-outline เป็นหลัก
export function Icon({ name, size = 22, color = colors.navy, style }) {
  return <Ionicons name={name} size={size} color={color} style={style} />;
}

export function Logo({ height = 32, variant = 'navy' }) {
  const src = variant === 'cream' ? require('../../assets/brand/logo-cream.png') : require('../../assets/brand/logo-navy.png');
  return <Image source={src} style={{ height, width: height * (540 / 203) }} resizeMode="contain" accessibilityLabel="yeep" />;
}

export function Button({ title, onPress, variant = 'primary', size = 'md', disabled, loading, style, icon, iconRight }) {
  const v = buttonVariants[variant];
  const iconSize = size === 'sm' ? 16 : 18;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.button,
        size === 'sm' && styles.buttonSm,
        { backgroundColor: v.bg, borderColor: v.border },
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <View style={styles.buttonInner}>
          {icon ? <Icon name={icon} size={iconSize} color={v.fg} style={{ marginRight: 6 }} /> : null}
          <Text style={[styles.buttonText, size === 'sm' && styles.buttonTextSm, { color: v.fg }]}>{title}</Text>
          {iconRight ? <Icon name={iconRight} size={iconSize} color={v.fg} style={{ marginLeft: 6 }} /> : null}
        </View>
      )}
    </Pressable>
  );
}

const buttonVariants = {
  primary: { bg: colors.navy, fg: colors.white, border: colors.navy },
  secondary: { bg: colors.white, fg: colors.navy, border: colors.navy },
  pill: { bg: colors.blue100, fg: colors.navy, border: colors.blue100 },
  ghost: { bg: 'transparent', fg: colors.navy, border: 'transparent' },
  danger: { bg: colors.white, fg: colors.danger, border: colors.danger },
  light: { bg: colors.white, fg: colors.navy, border: colors.white },
};

export function Chip({ label, selected, onPress, style, icon }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={[styles.chip, selected && styles.chipSelected, style]}
    >
      {icon ? <Icon name={icon} size={14} color={selected ? colors.white : colors.navy} style={{ marginRight: 4 }} /> : null}
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

// ปุ่มหมวดหมู่ทรงกลม (Category Icon Button)
export function CategoryButton({ icon, label, selected, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.catButton} accessibilityRole="button" accessibilityState={{ selected: !!selected }}>
      <View style={[styles.catCircle, selected && { backgroundColor: colors.blue100, borderColor: colors.blue100 }]}>
        <Icon name={icon} size={24} />
      </View>
      <Text style={[styles.catLabel, selected && { fontWeight: '700' }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Avatar({ user, size = 40 }) {
  const initial = user?.name ? user.name.charAt(0) : '?';
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: user?.avatarColor || colors.blue100,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: size >= 64 ? 3 : 0,
        borderColor: colors.white,
      }}
    >
      <Text style={{ color: colors.white, fontWeight: '800', fontSize: size * 0.42 }}>{initial}</Text>
    </View>
  );
}

export function Stars({ value = 0, size = 14, onChange }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable key={n} disabled={!onChange} onPress={() => onChange?.(n)} hitSlop={4} accessibilityLabel={onChange ? `ให้ ${n} ดาว` : undefined}>
          <Icon name={n <= Math.round(value) ? 'star' : 'star-outline'} size={size} color={colors.star} style={{ marginRight: 2 }} />
        </Pressable>
      ))}
    </View>
  );
}

// คะแนนแบบย่อ ★ 5.0 (32)
export function Rating({ value, count }) {
  if (!count) return <Text style={font.tiny}>ยังไม่มีรีวิว</Text>;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Icon name="star" size={13} color={colors.star} />
      <Text style={[font.tiny, { marginLeft: 3, color: colors.text }]}>
        {value.toFixed(1)} <Text style={{ color: colors.muted }}>({count})</Text>
      </Text>
    </View>
  );
}

const LISTING_STATUS = {
  available: { label: 'พร้อมขาย', bg: colors.successBg, fg: colors.success },
  reserved: { label: 'จองแล้ว', bg: colors.warningBg, fg: colors.warning },
  sold: { label: 'ขายแล้ว', bg: colors.navy, fg: colors.white },
  paused: { label: 'ปิดไว้', bg: colors.gray, fg: colors.muted },
};

const MEETUP_STATUS = {
  requested: { label: 'รอตอบรับ', bg: colors.blue50, fg: colors.blue600 },
  accepted: { label: 'นัดแล้ว', bg: colors.warningBg, fg: colors.warning },
  completed: { label: 'สำเร็จ', bg: colors.successBg, fg: colors.success },
  declined: { label: 'ถูกปฏิเสธ', bg: colors.dangerBg, fg: colors.danger },
  cancelled: { label: 'ยกเลิกแล้ว', bg: colors.dangerBg, fg: colors.danger },
};

export function StatusBadge({ status, type = 'listing', style }) {
  const map = type === 'meetup' ? MEETUP_STATUS : LISTING_STATUS;
  const s = map[status] || { label: status, bg: colors.gray, fg: colors.navy };
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }, style]}>
      <Text style={[styles.badgeText, { color: s.fg }]}>{s.label}</Text>
    </View>
  );
}

export function EmptyState({ icon = 'file-tray-outline', title, subtitle, actionLabel, onAction }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyCircle}>
        <Icon name={icon} size={34} color={colors.blue600} />
      </View>
      <Text style={[font.h3, { marginTop: spacing.lg, textAlign: 'center' }]}>{title}</Text>
      {subtitle ? <Text style={[font.small, { marginTop: spacing.xs, textAlign: 'center' }]}>{subtitle}</Text> : null}
      {actionLabel ? <Button title={actionLabel} onPress={onAction} style={{ marginTop: spacing.lg }} /> : null}
    </View>
  );
}

export function Field({ label, hint, error, required, style, ...inputProps }) {
  return (
    <View style={[{ marginBottom: spacing.lg }, style]}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={{ color: colors.danger }}> *</Text> : null}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.input, inputProps.multiline && styles.inputMultiline, error && styles.inputError, inputProps.editable === false && { opacity: 0.6 }]}
        {...inputProps}
      />
      {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function SectionTitle({ title, actionLabel, onAction, style }) {
  return (
    <View style={[styles.sectionTitle, style]}>
      <Text style={font.h3}>{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onAction} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.link}>{actionLabel}</Text>
          <Icon name="arrow-forward" size={14} color={colors.navy} style={{ marginLeft: 4 }} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function Card({ children, style, onPress }) {
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

export function MenuRow({ icon, label, onPress, badge, danger, last }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.menuRow, last && { borderBottomWidth: 0 }, pressed && { backgroundColor: colors.gray50 }]}
    >
      <View style={[styles.menuIcon, danger && { backgroundColor: colors.dangerBg }]}>
        <Icon name={icon} size={18} color={danger ? colors.danger : colors.navy} />
      </View>
      <Text style={[font.body, { flex: 1 }, danger && { color: colors.danger }]}>{label}</Text>
      {badge ? (
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{badge}</Text>
        </View>
      ) : null}
      <Icon name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

// ปุ่มไอคอน: variant 'plain' สำหรับ header, 'circle' สำหรับวางบนรูป
export function IconButton({ icon, onPress, badge, label, variant = 'plain', color = colors.navy, size = 24 }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityRole="button"
      hitSlop={8}
      style={variant === 'circle' ? styles.iconCircle : styles.iconButton}
    >
      <Icon name={icon} size={variant === 'circle' ? 20 : size} color={color} />
      {badge ? (
        <View style={[styles.countBadge, styles.iconBadge]}>
          <Text style={styles.countBadgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function Notice({ icon = 'information-circle-outline', text, tone = 'info', style }) {
  const t = {
    info: { bg: colors.blue50, fg: colors.blue600 },
    warning: { bg: colors.warningBg, fg: colors.warning },
    danger: { bg: colors.dangerBg, fg: colors.danger },
  }[tone];
  return (
    <View style={[styles.notice, { backgroundColor: t.bg }, style]}>
      <Icon name={icon} size={18} color={t.fg} style={{ marginRight: spacing.sm, marginTop: 1 }} />
      <Text style={[font.small, { flex: 1, color: colors.text, lineHeight: 19 }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSm: { minHeight: 36, paddingHorizontal: spacing.lg },
  buttonInner: { flexDirection: 'row', alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: '700' },
  buttonTextSm: { fontSize: 14 },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.gray,
    backgroundColor: colors.white,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipSelected: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipText: { fontSize: 14, color: colors.navy },
  chipTextSelected: { color: colors.white, fontWeight: '700' },
  catButton: { width: 72, alignItems: 'center', marginRight: spacing.sm },
  catCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  catLabel: { fontSize: 12, color: colors.text, textAlign: 'center' },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '700' },
  empty: { alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  emptyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.blue50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 13,
    fontSize: 15,
    color: colors.text,
  },
  inputMultiline: { minHeight: 100, textAlignVertical: 'top' },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 13, marginTop: spacing.xs },
  hint: { color: colors.muted, fontSize: 12, marginTop: spacing.xs },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  link: { color: colors.navy, fontWeight: '600', fontSize: 13 },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.blue50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginRight: spacing.sm,
  },
  countBadgeText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  iconButton: { padding: 6, marginLeft: spacing.xs },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  iconBadge: { position: 'absolute', top: 0, right: -4, marginRight: 0 },
  notice: { flexDirection: 'row', padding: spacing.md, borderRadius: radius.md, alignItems: 'flex-start' },
});
