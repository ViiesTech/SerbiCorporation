/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Text,
} from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-simple-toast';

import {
  getProfileImage,
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../utils';
import { images } from '../assets/images';
import { resetUser } from '../redux/slices/index';
import { removeDeviceTokenFromBackend } from '../config/Firebase';

const menuItems = [
  {
    id: 'profile',
    title: 'My Profile',
    subtitle: 'Account details & location',
    iconName: 'user',
    iconFamily: 'Feather',
    iconBg: 'rgba(160, 204, 217, 0.25)',
    iconColor: '#2C6E80',
    navTo: 'VendorProfile',
  },
  // {
  //   id: 'notifications',
  //   title: 'Notifications',
  //   subtitle: 'Alerts & updates',
  //   iconName: 'bell',
  //   iconFamily: 'Feather',
  //   iconBg: '#FEF3C7',
  //   iconColor: '#D97706',
  //   navTo: 'Notifications',
  // },
  {
    id: 'appointments',
    title: 'Appointments',
    subtitle: 'Active & upcoming visits',
    iconName: 'calendar',
    iconFamily: 'Feather',
    iconBg: '#D1FAE5',
    iconColor: '#059669',
    navTo: 'Appointments',
  },
  {
    id: 'history',
    title: 'Service History',
    subtitle: 'Past pest treatments',
    iconName: 'clock',
    iconFamily: 'Feather',
    iconBg: '#EDE9FE',
    iconColor: '#7C3AED',
    navTo: 'History',
  },
  // {
  //   id: 'messages',
  //   title: 'Messages',
  //   subtitle: 'Chats & live updates',
  //   iconName: 'message-circle',
  //   iconFamily: 'Feather',
  //   iconBg: 'rgba(160, 204, 217, 0.25)',
  //   iconColor: '#2C6E80',
  //   navTo: 'Inbox',
  // },
  {
    id: 'wishlist',
    title: 'Saved Technicians',
    subtitle: 'Favorite specialists',
    iconName: 'heart',
    iconFamily: 'Feather',
    iconBg: '#FFE4E6',
    iconColor: '#E11D48',
    navTo: 'Wishlist',
  },
  // {
  //   id: 'wallet',
  //   title: 'Wallet & Payments',
  //   subtitle: 'Cards & transactions',
  //   iconName: 'credit-card',
  //   iconFamily: 'Feather',
  //   iconBg: '#FEF3C7',
  //   iconColor: '#D97706',
  //   navTo: 'Wallet',
  // },
  {
    id: 'settings',
    title: 'Settings',
    subtitle: 'Preferences & security',
    iconName: 'settings',
    iconFamily: 'Feather',
    iconBg: '#F1F5F9',
    iconColor: '#475569',
    navTo: 'AppSettings',
  },
  // {
  //   id: 'help',
  //   title: 'Help & Support',
  //   subtitle: '24/7 client care',
  //   iconName: 'help-circle',
  //   iconFamily: 'Feather',
  //   iconBg: '#CCFBF1',
  //   iconColor: '#0D9488',
  //   navTo: 'Help',
  // },
];

const Drawer = ({ isVisible = true, onBackdropPress, closeIconOnPress }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.persistedData);

  const handleClose = () => {
    if (closeIconOnPress) {
      closeIconOnPress();
    } else if (onBackdropPress) {
      onBackdropPress();
    }
  };

  const handleNavigate = item => {
    if (item.navTo) {
      handleClose();
      setTimeout(() => {
        navigation.navigate(item.navTo);
      }, 150);
    }
  };

  const handleLogout = async () => {
    try {
      await removeDeviceTokenFromBackend();
    } catch (e) {
      console.log('Error removing token on logout:', e);
    }
    dispatch(resetUser());
    Toast.show('Logged out successfully', Toast.SHORT);
    handleClose();
  };

  return (
    <Modal
      isVisible={isVisible}
      animationIn="slideInLeft"
      animationOut="slideOutLeft"
      onBackdropPress={onBackdropPress}
      backdropOpacity={0.45}
      style={styles.modal}
    >
      <View style={styles.drawerContainer}>
        {/* Top Header Row with Close Icon */}
        <View style={styles.topBar}>
          <Text style={styles.menuHeading}>Menu</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleClose}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={20} color="#334155" />
          </TouchableOpacity>
        </View>

        {/* Profile Card / Hero Section */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            handleClose();
            setTimeout(() => navigation.navigate('VendorProfile'), 150);
          }}
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
            <View style={styles.onlineBadge} />
          </View>

          <View style={styles.profileTextWrapper}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.fullName || 'Valued Customer'}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user?.email || user?.phone || 'Customer Account'}
            </Text>
            <View style={styles.roleBadge}>
              <Ionicons name="shield-checkmark" size={11} color="#2C6E80" />
              <Text style={styles.roleBadgeText}>Client Account</Text>
            </View>
          </View>

          <Feather name="chevron-right" size={18} color="#94A3B8" />
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Scrollable Navigation Items */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.sectionLabel}>NAVIGATION</Text>

          {menuItems.map(item => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              style={styles.menuItem}
              onPress={() => handleNavigate(item)}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: item.iconBg }]}
              >
                <Feather
                  name={item.iconName}
                  size={19}
                  color={item.iconColor}
                />
              </View>

              <View style={styles.menuItemTextContainer}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
              </View>

              <Feather name="chevron-right" size={17} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bottom Section - Logout & Info */}
        <View style={styles.footerSection}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.logoutBtn}
            onPress={handleLogout}
          >
            <View style={styles.logoutIconWrapper}>
              <Feather name="log-out" size={18} color="#EF4444" />
            </View>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>Serbi Corporation • v1.0.0</Text>
        </View>
      </View>
    </Modal>
  );
};

export default Drawer;

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-start',
    // alignItems: 'flex-end',
  },
  drawerContainer: {
    height: '100%',
    width: responsiveWidth(78),
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    paddingTop: responsiveHeight(5),
    paddingBottom: responsiveHeight(2.5),
    paddingHorizontal: responsiveWidth(4.5),
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  menuHeading: {
    fontSize: responsiveFontSize(2.2),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E2E8F0',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileTextWrapper: {
    flex: 1,
    marginLeft: 12,
    marginRight: 6,
  },
  userName: {
    fontSize: responsiveFontSize(1.8),
    fontWeight: '700',
    color: '#0F172A',
  },
  userEmail: {
    fontSize: responsiveFontSize(1.3),
    color: '#64748B',
    marginTop: 1,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(160, 204, 217, 0.25)',
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  roleBadgeText: {
    fontSize: responsiveFontSize(1.1),
    fontWeight: '600',
    color: '#2C6E80',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  sectionLabel: {
    fontSize: responsiveFontSize(1.2),
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
    marginBottom: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  menuItemTitle: {
    fontSize: responsiveFontSize(1.7),
    fontWeight: '600',
    color: '#1E293B',
  },
  menuItemSubtitle: {
    fontSize: responsiveFontSize(1.2),
    color: '#94A3B8',
    marginTop: 1,
  },
  footerSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 14,
    gap: 12,
  },
  logoutIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: responsiveFontSize(1.7),
    fontWeight: '700',
    color: '#EF4444',
  },
  versionText: {
    fontSize: responsiveFontSize(1.1),
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 12,
  },
});
