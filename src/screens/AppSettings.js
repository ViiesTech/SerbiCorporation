import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-simple-toast';

import NormalHeader from '../components/NormalHeader';
import {
  getProfileImage,
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../utils';
import { images } from '../assets/images';
import { resetUser } from '../redux/slices';
import { removeDeviceTokenFromBackend } from '../config/Firebase';

const AppSettings = () => {
  const nav = useNavigation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.persistedData);

  const isTechnician = user?.type === 'Technician';

  const handleLogout = async () => {
    try {
      await removeDeviceTokenFromBackend();
    } catch (e) {
      console.log('Error removing device token:', e);
    }
    dispatch(resetUser());
    Toast.show('Logged out successfully', Toast.SHORT);
  };

  const accountItems = [
    {
      id: 'profile',
      title: 'My Profile',
      subtitle: 'Account details & location',
      iconName: 'user',
      iconBg: 'rgba(160, 204, 217, 0.25)',
      iconColor: '#2C6E80',
      navTo: 'VendorProfile',
    },
    {
      id: 'messages',
      title: 'Messages',
      subtitle: 'Chats & conversations',
      iconName: 'message-square',
      iconBg: '#EBF3FE',
      iconColor: '#2563EB',
      navTo: 'Inbox',
    },
    ...(!isTechnician
      ? [
          {
            id: 'wallet',
            title: 'Wallet & Payments',
            subtitle: 'Saved cards & billing',
            iconName: 'credit-card',
            iconBg: '#D1FAE5',
            iconColor: '#059669',
            navTo: 'Wallet',
          },
        ]
      : []),
  ];

  const supportItems = [
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'FAQs & 24/7 client care',
      iconName: 'help-circle',
      iconBg: '#CCFBF1',
      iconColor: '#0D9488',
      navTo: 'Help',
    },
    {
      id: 'terms',
      title: 'Terms & Conditions',
      subtitle: 'Service rules & guidelines',
      iconName: 'file-text',
      iconBg: '#EFF6FF',
      iconColor: '#2563EB',
      navTo: 'TermsAndCondition',
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      subtitle: 'Data protection & security',
      iconName: 'shield',
      iconBg: '#EDE9FE',
      iconColor: '#7C3AED',
      navTo: 'PrivacyPolicy',
    },
  ];

  return (
    <View style={styles.container}>
      <NormalHeader heading="Settings" onBackPress={() => nav.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Hero Card */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => nav.navigate('VendorProfile')}
          style={styles.profileCard}
        >
          <View style={styles.avatarWrapper}>
            <Image
              source={
                user?.profileImage
                  ? { uri: getProfileImage(user.profileImage, true) }
                  : images.userProfile
              }
              style={styles.avatar}
            />
            <View style={styles.onlineDot} />
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.fullName ||
                (isTechnician ? 'Technician' : 'Valued Client')}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user?.email || user?.phone || 'Personal Account'}
            </Text>
            <View style={styles.roleBadge}>
              <Ionicons
                name={isTechnician ? 'hammer' : 'shield-checkmark'}
                size={11}
                color="#2C6E80"
              />
              <Text style={styles.roleBadgeText}>
                {isTechnician ? 'Technician Account' : 'Client Account'}
              </Text>
            </View>
          </View>

          <View style={styles.chevronWrapper}>
            <Feather name="chevron-right" size={20} color="#94A3B8" />
          </View>
        </TouchableOpacity>

        {/* Section 1: Account */}
        <Text style={styles.sectionTitle}>PREFERENCES & ACCOUNT</Text>
        <View style={styles.cardGroup}>
          {accountItems.map((item, index) => {
            const isLast = index === accountItems.length - 1;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                style={[styles.menuRow, !isLast && styles.menuRowDivider]}
                onPress={() => nav.navigate(item.navTo)}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: item.iconBg },
                  ]}
                >
                  <Feather
                    name={item.iconName}
                    size={18}
                    color={item.iconColor}
                  />
                </View>

                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>

                <Feather name="chevron-right" size={18} color="#CBD5E1" />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Section 2: Support & Legal */}
        <Text style={styles.sectionTitle}>SUPPORT & LEGAL</Text>
        <View style={styles.cardGroup}>
          {supportItems.map((item, index) => {
            const isLast = index === supportItems.length - 1;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                style={[styles.menuRow, !isLast && styles.menuRowDivider]}
                onPress={() => nav.navigate(item.navTo)}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: item.iconBg },
                  ]}
                >
                  <Feather
                    name={item.iconName}
                    size={18}
                    color={item.iconColor}
                  />
                </View>

                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>

                <Feather name="chevron-right" size={18} color="#CBD5E1" />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Section 3: Logout Action */}
        <Text style={styles.sectionTitle}>SESSION</Text>
        <View style={styles.cardGroup}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.logoutRow}
            onPress={handleLogout}
          >
            <View style={styles.logoutIconContainer}>
              <Feather name="log-out" size={18} color="#EF4444" />
            </View>

            <View style={styles.menuTextContainer}>
              <Text style={styles.logoutTitle}>Log Out</Text>
              <Text style={styles.logoutSubtitle}>
                Sign out of your account on this device
              </Text>
            </View>

            <Feather name="chevron-right" size={18} color="#FCA5A5" />
          </TouchableOpacity>
        </View>

        {/* App Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>Serbi Corporation</Text>
          <Text style={styles.footerVersion}>Version 1.0.0 (Build 2026)</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default AppSettings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: responsiveWidth(4.5),
    paddingTop: 16,
    paddingBottom: responsiveHeight(5),
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E2E8F0',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  userName: {
    fontSize: responsiveFontSize(1.85),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  userEmail: {
    fontSize: responsiveFontSize(1.3),
    color: '#64748B',
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(160, 204, 217, 0.25)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
    marginTop: 6,
  },
  roleBadgeText: {
    fontSize: responsiveFontSize(1.1),
    fontWeight: '700',
    color: '#2C6E80',
  },
  chevronWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: responsiveFontSize(1.2),
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  cardGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  menuTitle: {
    fontSize: responsiveFontSize(1.6),
    fontWeight: '700',
    color: '#1E293B',
  },
  menuSubtitle: {
    fontSize: responsiveFontSize(1.2),
    color: '#94A3B8',
    marginTop: 2,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFBFB',
  },
  logoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutTitle: {
    fontSize: responsiveFontSize(1.6),
    fontWeight: '700',
    color: '#EF4444',
  },
  logoutSubtitle: {
    fontSize: responsiveFontSize(1.2),
    color: '#F87171',
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  footerBrand: {
    fontSize: responsiveFontSize(1.3),
    fontWeight: '700',
    color: '#94A3B8',
  },
  footerVersion: {
    fontSize: responsiveFontSize(1.1),
    color: '#CBD5E1',
    marginTop: 3,
  },
});
