// Design tokens ตาม Yeep Brand Design System
export const colors = {
  // สีหลัก
  navy: '#071943', // Navy primary
  navy700: '#1F2E54',
  navySoft: '#4F6DD7', // Blue 600 ใช้กับลิงก์
  cream: '#FFF8ED', // Cream background
  creamDark: '#F3EBDD',
  white: '#FFFFFF',
  blue: '#8FB4FF', // Accent blue
  blue600: '#4F6DD7',
  blue100: '#CFE0FF',
  blue50: '#EAF1FF',
  pink: '#F6A9B8', // Secondary pink
  pink100: '#FFE3E8',
  gray: '#E7E7ED', // Neutral gray
  gray50: '#FAFAFB',

  // ข้อความ
  text: '#071943',
  muted: '#6E7591',

  // เส้นและสถานะ
  border: '#EFE7DA',
  accent: '#8FB4FF',
  star: '#F5B83D',
  success: '#2E8B5E',
  successBg: '#E3F4EA',
  warning: '#B7791F',
  warningBg: '#FDF1DC',
  danger: '#D2465F',
  dangerBg: '#FFE3E8',
  infoBg: '#EAF1FF',
  overlay: 'rgba(7, 25, 67, 0.45)',
};

// Spacing scale 8pt
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

// Corner radius: xs 4 / sm 8 / md 12 / lg 16 / xl 24
export const radius = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, pill: 999 };

export const font = {
  display: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  h1: { fontSize: 24, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  h2: { fontSize: 20, fontWeight: '700', color: colors.text },
  h3: { fontSize: 17, fontWeight: '700', color: colors.text },
  body: { fontSize: 15, color: colors.text },
  small: { fontSize: 13, color: colors.muted },
  tiny: { fontSize: 12, color: colors.muted },
};

// เงา Subtle / Medium ตาม design system
export const shadow = {
  shadowColor: '#071943',
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};

export const shadowMedium = {
  shadowColor: '#071943',
  shadowOpacity: 0.08,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 6 },
  elevation: 5,
};
