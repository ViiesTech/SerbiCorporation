import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import Modal from 'react-native-modal';
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
import { useDeleteAccountMutation } from '../redux/services';

const AppSettings = () => {
  const nav = useNavigation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.persistedData);
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const handleConfirmDelete = async () => {
    try {
      const res = await deleteAccount({ userId: user?._id }).unwrap();
      if (res?.success === false) {
        Toast.show(res?.msg || 'Could not delete account', Toast.LONG);
        return;
      }
      try {
        await removeDeviceTokenFromBackend();
      } catch (tokenErr) {
        console.log('Error removing device token:', tokenErr);
      }
      setShowDeleteModal(false);
      dispatch(resetUser());
      Toast.show(
        res?.msg || 'User is Deleted Successfully!',
        Toast.LONG,
      );
    } catch (err) {
      console.log('Error deleting account:', err);
      const errMsg =
        err?.data?.msg ||
        err?.data?.error ||
        err?.error ||
        'Failed to delete account. Please try again.';
      Toast.show(errMsg, Toast.LONG);
    }
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
      : [
          {
            id: 'stripeConnect',
            title: 'Payouts & Bank Account',
            subtitle: 'Stripe Connect & direct payouts',
            iconName: 'credit-card',
            iconBg: '#D1FAE5',
            iconColor: '#059669',
            navTo: 'StripeConnectScreen',
          },
        ]),
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

        {/* Section 3: Session & Account Actions */}
        <Text style={styles.sectionTitle}>ACCOUNT ACTIONS</Text>
        <View style={styles.cardGroup}>
          {isTechnician && (
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.logoutRow, styles.menuRowDivider]}
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
          )}

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.deleteAccountRow}
            onPress={() => setShowDeleteModal(true)}
          >
            <View style={styles.deleteIconContainer}>
              <Feather name="trash-2" size={18} color="#DC2626" />
            </View>

            <View style={styles.menuTextContainer}>
              <Text style={styles.deleteTitle}>Delete Account</Text>
              <Text style={styles.deleteSubtitle}>
                Permanently delete account and all data
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

      {/* Custom Delete Account Confirmation Modal */}
      <Modal
        isVisible={showDeleteModal}
        animationIn="zoomIn"
        animationOut="zoomOut"
        backdropOpacity={0.5}
        onBackdropPress={() => {
          if (!isDeleting) setShowDeleteModal(false);
        }}
        style={styles.modalOverlay}
      >
        <View style={styles.modalCard}>
          {/* Close X Button */}
          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={() => setShowDeleteModal(false)}
            disabled={isDeleting}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color="#64748B" />
          </TouchableOpacity>

          {/* Warning Icon Badge */}
          <View style={styles.modalIconHalo}>
            <View style={styles.modalIconCircle}>
              <Feather name="trash-2" size={26} color="#DC2626" />
            </View>
          </View>

          {/* Heading & Details */}
          <Text style={styles.modalTitle}>Delete Account?</Text>
          <Text style={styles.modalDesc}>
            Are you sure you want to permanently delete your account? This
            action cannot be undone.
          </Text>

          {/* Warning Callout Notice */}
          <View style={styles.warningCallout}>
            <Ionicons name="alert-circle" size={18} color="#DC2626" />
            <Text style={styles.warningCalloutText}>
              All your active bookings, messages, and profile data will be
              permanently wiped from our servers.
            </Text>
          </View>

          {/* Action Buttons Row */}
          <View style={styles.modalActionButtons}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowDeleteModal(false)}
              disabled={isDeleting}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>Keep Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmDeleteBtn}
              onPress={handleConfirmDelete}
              disabled={isDeleting}
              activeOpacity={0.8}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmDeleteBtnText}>
                  Delete Permanently
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  deleteAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FEF2F2',
  },
  deleteIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteTitle: {
    fontSize: responsiveFontSize(1.6),
    fontWeight: '700',
    color: '#DC2626',
  },
  deleteSubtitle: {
    fontSize: responsiveFontSize(1.2),
    color: '#EF4444',
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
  modalOverlay: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(5),
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    position: 'relative',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  modalIconHalo: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: responsiveFontSize(2.2),
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: responsiveFontSize(1.4),
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  warningCallout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    marginBottom: 20,
  },
  warningCalloutText: {
    flex: 1,
    fontSize: responsiveFontSize(1.2),
    color: '#9F1239',
    lineHeight: 17,
  },
  modalActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: responsiveFontSize(1.4),
    fontWeight: '700',
    color: '#475569',
  },
  confirmDeleteBtn: {
    flex: 1.2,
    backgroundColor: '#DC2626',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmDeleteBtnText: {
    fontSize: responsiveFontSize(1.4),
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
