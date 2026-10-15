import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../utils';
import { images } from '../assets/images';
import { colors } from '../assets/colors';

const NearByCard = ({
  item,
  onCardPress,
  viewDetailsHandlePress,
  onHeartPress,
  favourite,
  disabled,
  activeOpacity = 0.85,
  isShowBadge = true,
}) => {
  const profileImageSource =
    item.profImg &&
    !item.profImg.endsWith('/undefined') &&
    item.profImg.trim() !== ''
      ? { uri: item.profImg }
      : images.userProfile;

  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      disabled={disabled}
      style={styles.cardContainer}
      onPress={onCardPress}
    >
      {/* Main Top Row */}
      <View style={styles.topRow}>
        {/* Avatar with Online Dot */}
        <View style={styles.avatarWrapper}>
          <Image source={profileImageSource} style={styles.profileImg} />
          <View style={styles.onlineDot} />
        </View>

        {/* Info Column */}
        <View style={styles.infoCol}>
          {/* Header Row: Name & Wishlist */}
          <View style={styles.nameHeartRow}>
            <Text style={styles.technicianName} numberOfLines={1}>
              {item.username}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.heartButton,
                favourite && styles.heartButtonActive,
              ]}
              onPress={onHeartPress}
            >
              <AntDesign
                name={favourite ? 'heart' : 'hearto'}
                size={14}
                color={favourite ? '#EF4444' : '#64748B'}
              />
            </TouchableOpacity>
          </View>

          {/* Badges Row: Designation & Rating */}
          <View style={styles.badgesRow}>
            <View style={styles.specialtyBadge}>
              <Text style={styles.specialtyText} numberOfLines={1}>
                {item.designation || 'Pest Technician'}
              </Text>
            </View>

            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={11} color="#F59E0B" />
              <Text style={styles.ratingText}>
                {item.rating ? Number(item.rating).toFixed(1) : '5.0'}
              </Text>
            </View>
          </View>

          {/* Distance and ETA */}
          <View style={styles.metaRow}>
            {item.ml && (
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={13} color="#64748B" />
                <Text style={styles.metaText}>{item.ml} mi</Text>
              </View>
            )}
            {item.min && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={13} color="#64748B" />
                <Text style={styles.metaText}>{item.min}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.cardDivider} />

      {/* Bottom Footer Row: Price & Action */}
      <View style={styles.footerRow}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceAmount}>{item.price}</Text>
          <Text style={styles.priceSubtext}>Service Fee</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.detailsBtn}
          onPress={viewDetailsHandlePress || onCardPress}
        >
          <Text style={styles.detailsBtnText}>View Details</Text>
          <Feather name="arrow-right" size={14} color="#0F172A" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default NearByCard;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
    width: 68,
    height: 68,
  },
  profileImg: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  onlineDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  infoCol: {
    flex: 1,
    gap: 5,
  },
  nameHeartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  technicianName: {
    fontSize: responsiveFontSize(1.8),
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  heartButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartButtonActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  specialtyBadge: {
    backgroundColor: 'rgba(160, 204, 217, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  specialtyText: {
    fontSize: responsiveFontSize(1.2),
    fontWeight: '700',
    color: '#246170',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  ratingText: {
    fontSize: responsiveFontSize(1.2),
    fontWeight: '700',
    color: '#D97706',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: responsiveFontSize(1.2),
    color: '#64748B',
    fontWeight: '500',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'column',
  },
  priceAmount: {
    fontSize: responsiveFontSize(2.1),
    fontWeight: '800',
    color: '#0F172A',
  },
  priceSubtext: {
    fontSize: responsiveFontSize(1.1),
    color: '#64748B',
    fontWeight: '500',
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#A0CCD9',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    shadowColor: '#A0CCD9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  detailsBtnText: {
    fontSize: responsiveFontSize(1.3),
    fontWeight: '800',
    color: '#0F172A',
  },
});
