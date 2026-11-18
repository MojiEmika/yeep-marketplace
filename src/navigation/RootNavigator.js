// โครง navigation: แท็บล่าง 5 แท็บ + หน้าที่เปิดซ้อนด้านบน (stack)
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { View } from 'react-native';
import { Icon } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

import ChatScreen from '../screens/ChatScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import HomeScreen from '../screens/HomeScreen';
import InboxScreen from '../screens/InboxScreen';
import ListingDetailScreen from '../screens/ListingDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import MeetupDetailScreen from '../screens/MeetupDetailScreen';
import MeetupRequestScreen from '../screens/MeetupRequestScreen';
import MyListingsScreen from '../screens/MyListingsScreen';
import MyMeetupsScreen from '../screens/MyMeetupsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ReportScreen from '../screens/ReportScreen';
import ReviewScreen from '../screens/ReviewScreen';
import SafetyScreen from '../screens/SafetyScreen';
import SearchScreen from '../screens/SearchScreen';
import SellFormScreen from '../screens/SellFormScreen';
import SellScreen from '../screens/SellScreen';
import SettingsScreen from '../screens/SettingsScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import WishlistScreen from '../screens/WishlistScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.cream, primary: colors.navy, card: colors.white },
};

function TabIcon({ name, focused, color }) {
  return <Icon name={focused ? name : `${name}-outline`} size={24} color={color} />;
}

// ปุ่ม "ลงขาย" ตรงกลางเป็นวงกลมกรมท่า ตามดีไซน์
function SellTabIcon() {
  return (
    <View
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.navy,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -6,
      }}
    >
      <Icon name="add" size={28} color={colors.white} />
    </View>
  );
}

function Tabs() {
  const { unreadChats } = useApp();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.navy,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.border, paddingTop: 4 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'หน้าหลัก', tabBarIcon: (p) => <TabIcon name="home" {...p} /> }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ title: 'ค้นหา', tabBarIcon: (p) => <TabIcon name="search" {...p} /> }}
      />
      <Tab.Screen
        name="Sell"
        component={SellScreen}
        options={{ title: 'ลงขาย', tabBarIcon: () => <SellTabIcon /> }}
      />
      <Tab.Screen
        name="Inbox"
        component={InboxScreen}
        options={{
          title: 'ข้อความ',
          tabBarBadge: unreadChats || undefined,
          tabBarIcon: (p) => <TabIcon name="chatbubble-ellipses" {...p} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'โปรไฟล์', tabBarIcon: (p) => <TabIcon name="person" {...p} /> }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerTintColor: colors.navy,
          headerTitleStyle: { fontWeight: '700' },
          headerStyle: { backgroundColor: colors.cream },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.cream },
        }}
      >
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SellForm" component={SellFormScreen} options={{ title: 'ลงขายสินค้า' }} />
        <Stack.Screen name="EditListing" component={SellFormScreen} options={{ title: 'แก้ไขประกาศ' }} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'แก้ไขโปรไฟล์' }} />
        <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ title: 'โปรไฟล์ผู้ขาย' }} />
        <Stack.Screen name="Wishlist" component={WishlistScreen} options={{ title: 'รายการที่ถูกใจ' }} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'การแจ้งเตือน' }} />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'แชต' }} />
        <Stack.Screen name="MeetupRequest" component={MeetupRequestScreen} options={{ title: 'ขอนัดรับสินค้า' }} />
        <Stack.Screen name="MeetupDetail" component={MeetupDetailScreen} options={{ title: 'รายละเอียดนัดรับ' }} />
        <Stack.Screen name="MyMeetups" component={MyMeetupsScreen} options={{ title: 'นัดรับของฉัน' }} />
        <Stack.Screen name="MyListings" component={MyListingsScreen} options={{ title: 'ประกาศของฉัน' }} />
        <Stack.Screen name="Review" component={ReviewScreen} options={{ title: 'รีวิว' }} />
        <Stack.Screen name="Report" component={ReportScreen} options={{ title: 'รายงานปัญหา' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'ตั้งค่า' }} />
        <Stack.Screen name="Safety" component={SafetyScreen} options={{ title: 'นัดรับอย่างปลอดภัย' }} />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ presentation: 'modal', title: 'เข้าสู่ระบบ' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
