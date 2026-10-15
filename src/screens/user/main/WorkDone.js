import React from 'react';
import {
  View,
  Platform,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
} from 'react-native';
import Container from '../../../components/Container';
import { useNavigation } from '@react-navigation/native';
import NormalHeader from '../../../components/NormalHeader';
import { images } from '../../../assets/images';
import {
  AppColors,
  getProfileImage,
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../utils';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../assets/colors';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const WorkDone = ({ route }) => {
  const nav = useNavigation();
  const { profileData } = route?.params || {};

  const userLocation = {
    longitude: profileData?.location?.coordinates?.[0] || -80.4115,
    latitude: profileData?.location?.coordinates?.[1] || 25.4486,
  };

  const techName =
    profileData?.fullName ||
    profileData?.name ||
    profileData?.business_name ||
    'Pest Technician';

  const serviceName =
    profileData?.service?.name ||
    (typeof profileData?.service === 'string'
      ? profileData?.service
      : 'Pest Control');

  const price = profileData?.price || profileData?.platform_fee || 20;
  const techAvatar = profileData?.profileImage
    ? getProfileImage(profileData.profileImage, true)
    : null;

  return (
    <Container scrollEnabled={false}>
      <NormalHeader
        heading="Advance Payment"
        onBackPress={() => nav.goBack()}
      />

      <View style={styles.mapContainer}>
        <MapView
          provider={Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          initialRegion={{
            ...userLocation,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}
        >
          <Marker coordinate={userLocation} title={techName}>
            <View style={styles.markerContainer}>
              <View style={styles.markerHalo}>
                <Image
                  source={images.pin_marker}
                  style={styles.markerPin}
                  resizeMode="contain"
                />
              </View>
            </View>
          </Marker>
        </MapView>

        {/* Floating Top Pill */}
        <View style={styles.floatingPill}>
          <View style={styles.activeDot} />
          <Ionicons name="location-sharp" size={15} color="#0F172A" />
          <Text style={styles.floatingPillText}>
            Service Location Confirmed
          </Text>
        </View>

        {/* Floating Advance Payment Card */}
        <View style={styles.overlayContainer}>
          <View style={styles.card}>
            {/* Hero Payment / Calendar Check Badge */}
            <View style={styles.badgeHalo}>
              <View style={styles.badgeMid}>
                <View style={styles.badgeCore}>
                  <FontAwesome5
                    name="calendar-check"
                    size={22}
                    color="#0F172A"
                  />
                </View>
              </View>
            </View>

            {/* Status Pill */}
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>ADVANCE PAYMENT REQUIRED</Text>
            </View>

            <Text style={styles.cardTitle}>Pay Advance Fee</Text>
            <Text style={styles.cardSubtitle}>
              Please pay the advance service fee to confirm your booking and
              dispatch the technician to your address.
            </Text>

            {/* Technician & Advance Fee Summary Box */}
            <View style={styles.summaryBox}>
              <View style={styles.summaryTopRow}>
                {techAvatar ? (
                  <Image
                    source={{ uri: techAvatar }}
                    style={styles.techAvatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={20} color="#0F172A" />
                  </View>
                )}

                <View style={styles.techMeta}>
                  <Text style={styles.techNameText} numberOfLines={1}>
                    {techName}
                  </Text>
                  <Text style={styles.techServiceText} numberOfLines={1}>
                    {serviceName}
                  </Text>
                </View>

                {profileData?.ratings ? (
                  <View style={styles.ratingBadge}>
                    <FontAwesome5 name="star" solid size={11} color="#F59E0B" />
                    <Text style={styles.ratingText}>
                      {Number(profileData.ratings).toFixed(1)}
                    </Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryBottomRow}>
                <View style={styles.feeLabelGroup}>
                  <Ionicons name="wallet-outline" size={16} color="#64748B" />
                  <Text style={styles.feeLabel}>Advance Service Fee</Text>
                </View>
                <Text style={styles.feeAmount}>${price}</Text>
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.payButton}
              onPress={() =>
                nav.navigate('Payment', {
                  pest_tech: profileData,
                  request: true,
                })
              }
            >
              <Text style={styles.payButtonText}>PROCEED TO PAYMENT</Text>
              <View style={styles.arrowCircle}>
                <Ionicons name="arrow-forward" size={17} color="#0F172A" />
              </View>
            </TouchableOpacity>

            {/* Secure Payment Micro-copy */}
            <View style={styles.secureBadgeRow}>
              <Ionicons name="lock-closed" size={12} color="#94A3B8" />
              <Text style={styles.secureBadgeText}>
                Secure 256-bit Encrypted Checkout
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    minHeight: responsiveHeight(90),
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerHalo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(247, 200, 69, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerPin: {
    height: 44,
    width: 44,
  },
  floatingPill: {
    position: 'absolute',
    top: 18,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  floatingPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(5),
  },
  card: {
    backgroundColor: AppColors.WHITE,
    width: responsiveWidth(90),
    maxWidth: 420,
    borderRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 10,
    alignItems: 'center',
  },
  badgeHalo: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: 'rgba(247, 200, 69, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeMid: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(247, 200, 69, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeCore: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.6,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    paddingHorizontal: 8,
  },
  summaryBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginTop: 18,
    marginBottom: 18,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  techAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2E8F0',
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  techMeta: {
    flex: 1,
    marginLeft: 12,
  },
  techNameText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  techServiceText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  summaryBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  feeLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  feeAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  payButton: {
    width: '100%',
    backgroundColor: colors.secondary_button,
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: colors.secondary_button,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 3,
  },
  payButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secureBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  secureBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
  },
});

export default WorkDone;
