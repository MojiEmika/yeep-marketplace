// X01/X05 คำแนะนำการนัดรับอย่างปลอดภัย
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Card, Icon } from '../components/ui';
import { colors, font, spacing } from '../theme';

const TIPS = [
  { icon: 'location-outline', title: 'นัดในที่สาธารณะ', text: 'เลือกจุดนัดรับในมหาวิทยาลัยที่มีคนพลุกพล่าน เช่น หน้าอาคารเรียนหรือโรงอาหาร ช่วงกลางวัน' },
  { icon: 'search-outline', title: 'ตรวจของก่อนจ่าย', text: 'ลองเปิดใช้งาน เช็กตำหนิ และไซซ์ให้เรียบร้อยก่อนจ่ายเงิน' },
  { icon: 'cash-outline', title: 'ไม่โอนเงินล่วงหน้า', text: 'จ่ายเงินตอนเจอกันและได้รับของแล้วเท่านั้น' },
  { icon: 'chatbubbles-outline', title: 'คุยผ่านแชตในแอป', text: 'หลีกเลี่ยงการให้เบอร์โทรหรือข้อมูลส่วนตัว เพื่อให้มีหลักฐานถ้าเกิดปัญหา' },
  { icon: 'people-outline', title: 'ชวนเพื่อนไปด้วย', text: 'ถ้านัดช่วงเย็นหรือไม่แน่ใจ ชวนเพื่อนไปด้วยจะอุ่นใจกว่า' },
  { icon: 'checkmark-circle-outline', title: 'กดยืนยันหลังได้ของ', text: 'กด "ได้รับสินค้าแล้ว" หรือ "ส่งมอบแล้ว" หลังเจอกันจริงเท่านั้น' },
  { icon: 'flag-outline', title: 'เจอปัญหาให้รายงาน', text: 'ถ้าอีกฝ่ายไม่มาตามนัดหรือมีพฤติกรรมไม่เหมาะสม รายงานผ่านแอปได้ทันที' },
];

export default function SafetyScreen() {
  return (
    <ScrollView style={{ backgroundColor: colors.cream }} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={[font.body, { marginBottom: spacing.lg }]}>
        YeEP เป็นพื้นที่ให้นักศึกษาซื้อขายกันเอง แอปไม่ได้เป็นตัวกลางรับเงิน ทำตามคำแนะนำนี้เพื่อให้การนัดรับราบรื่น
      </Text>
      {TIPS.map((t) => (
        <Card key={t.title} style={{ marginBottom: spacing.md }}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.blue50, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md }}>
              <Icon name={t.icon} size={22} color={colors.blue600} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={font.h3}>{t.title}</Text>
              <Text style={[font.small, { marginTop: 2, color: colors.text }]}>{t.text}</Text>
            </View>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}
