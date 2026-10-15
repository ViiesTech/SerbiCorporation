import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { StarRatingDisplay } from 'react-native-star-rating-widget';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';

// Components & Assets
import Container from '../components/Container';
import NormalHeader from '../components/NormalHeader';
import LineBreak from '../components/LineBreak';
import Loader from '../components/Loader';
import { colors } from '../assets/colors';
import { images } from '../assets/images';
import {
  AppColors,
  getProfileImage,
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../utils';
import { useLazyGetProfileQuery } from '../redux/services';

const VendorProfile = () => {
  const nav = useNavigation();
  const isFocused = useIsFocused();

  // Get user ID from Redux
  const { _id } = useSelector(state => state.persistedData.user);
  const [getProfile, { data, isLoading }] = useLazyGetProfileQuery();

  const userProfile = data?.data;

  useEffect(() => {
    if (isFocused && _id) {
      getProfile(_id);
    }
  }, [isFocused, _id, getProfile]);

  const isTechnician = userProfile?.type === 'Technician';

  return (
    <Container scrollEnabled={true} contentStyle={styles.containerContent}>
      <NormalHeader heading={'My Profile'} onBackPress={() => nav.goBack()} />

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <Loader />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 1. Hero Profile Section */}
          <View style={styles.heroSection}>
            <View style={styles.avatarWrapper}>
              <Image
                style={styles.profileImg}
                source={
                  userProfile?.profileImage
                    ? { uri: getProfileImage(userProfile.profileImage, true) }
                    : images.userProfile
                }
              />
              {userProfile?.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-sharp" size={14} color="#FFF" />
                </View>
              )}
            </View>

            <LineBreak val={1.5} />
            <Text style={styles.nameText}>
              {userProfile?.fullName || 'Technician'}
            </Text>

            {/* Specialty Badge */}
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.specialtyBadge,
                  {
                    backgroundColor: isTechnician
                      ? colors.primary
                      : colors.secondary_button,
                  },
                ]}
              >
                <Ionicons
                  name={isTechnician ? 'shield-checkmark' : 'person'}
                  size={13}
                  color={AppColors.BLACK}
                />
                <Text style={styles.specialtyBadgeText}>
                  {isTechnician
                    ? userProfile?.service?.name
                      ? `${userProfile.service.name} Specialist`
                      : 'Certified Technician'
                    : 'Customer Account'}
                </Text>
              </View>
            </View>

            {/* Location */}
            {userProfile?.locationName ? (
              <View style={styles.locationRow}>
                <Ionicons
                  name="location-sharp"
                  size={16}
                  color="#E11D48"
                  style={styles.locationIcon}
                />
                <Text numberOfLines={2} style={styles.locationText}>
                  {userProfile.locationName}
                </Text>
              </View>
            ) : null}

            <LineBreak val={2} />

            {/* Action Button: Edit Profile */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => nav.navigate('Profile', { user: userProfile })}
                style={styles.editProfileBtn}
              >
                <Feather name="edit-2" size={15} color={AppColors.BLACK} />
                <Text style={styles.editProfileBtnText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          <LineBreak val={2} />

          {/* 2. Key Stats Grid (Technician Only) */}
          {isTechnician && (
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <View style={styles.statIconBox}>
                  <Ionicons name="star" size={18} color="#EAB308" />
                </View>
                <Text style={styles.statValue}>
                  {userProfile?.avgRating || '0.0'}
                </Text>
                <Text style={styles.statLabel}>
                  {userProfile?.totalReviews || 0} Reviews
                </Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <View style={styles.statIconBox}>
                  <Ionicons name="cash-outline" size={18} color="#16A34A" />
                </View>
                <Text style={styles.statValue}>${userProfile?.price || 0}</Text>
                <Text style={styles.statLabel}>Rate / Job</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <View style={styles.statIconBox}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={18}
                    color="#2563EB"
                  />
                </View>
                <Text style={styles.statValue}>
                  {userProfile?.isVerified ? 'Verified' : 'Active'}
                </Text>
                <Text style={styles.statLabel}>Status</Text>
              </View>
            </View>
          )}

          <LineBreak val={2} />

          {/* 3. Service & Work Details Card (Technician Only) */}
          {isTechnician && (
            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Ionicons
                    name="briefcase-outline"
                    size={18}
                    color={AppColors.BLACK}
                  />
                  <Text style={styles.cardTitle}>Service & Work Details</Text>
                </View>
              </View>

              <View style={styles.cardItemDivider} />

              <View style={styles.infoRow}>
                <View style={styles.infoRowLeft}>
                  <Ionicons name="bug-outline" size={16} color="#64748B" />
                  <Text style={styles.infoLabel}>Primary Service</Text>
                </View>
                <Text style={styles.infoValue}>
                  {userProfile?.service?.name || 'General Pest Control'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoRowLeft}>
                  <Ionicons name="pricetag-outline" size={16} color="#64748B" />
                  <Text style={styles.infoLabel}>Standard Price</Text>
                </View>
                <Text style={styles.infoValueHighlight}>
                  ${userProfile?.price || 0}.00
                </Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoRowLeft}>
                  <Ionicons name="time-outline" size={16} color="#64748B" />
                  <Text style={styles.infoLabel}>Working Hours</Text>
                </View>
                <Text style={styles.infoValue}>
                  {userProfile?.workingHours?.startTime || '09:00 AM'} -{' '}
                  {userProfile?.workingHours?.endTime || '05:00 PM'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoRowLeft}>
                  <Ionicons
                    name="document-text-outline"
                    size={16}
                    color="#64748B"
                  />
                  <Text style={styles.infoLabel}>Pest Control License</Text>
                </View>
                <View style={styles.licenseTag}>
                  <Text style={styles.licenseTagText}>
                    {userProfile?.pestControlLicense?.length > 0
                      ? 'Uploaded'
                      : userProfile?.isVerified
                      ? 'Verified'
                      : 'Pending'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {isTechnician && <LineBreak val={2} />}

          {/* 4. Personal Information Card */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={AppColors.BLACK}
                />
                <Text style={styles.cardTitle}>Personal Information</Text>
              </View>
            </View>

            <View style={styles.cardItemDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoRowLeft}>
                <Ionicons name="mail-outline" size={16} color="#64748B" />
                <Text style={styles.infoLabel}>Email</Text>
              </View>
              <Text numberOfLines={1} style={styles.infoValue}>
                {userProfile?.email || 'N/A'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoRowLeft}>
                <Ionicons name="call-outline" size={16} color="#64748B" />
                <Text style={styles.infoLabel}>Phone</Text>
              </View>
              <Text style={styles.infoValue}>
                {userProfile?.phone || 'Not provided'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoRowLeft}>
                <Ionicons name="calendar-outline" size={16} color="#64748B" />
                <Text style={styles.infoLabel}>Date of Birth</Text>
              </View>
              <Text style={styles.infoValue}>{userProfile?.DOB || 'N/A'}</Text>
            </View>
          </View>

          {/* 5. Rating & Reviews Breakdown (Technician Only) */}
          {isTechnician && (
            <>
              <LineBreak val={2} />
              <View style={styles.infoCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Ionicons
                      name="star-outline"
                      size={18}
                      color={AppColors.BLACK}
                    />
                    <Text style={styles.cardTitle}>Client Reviews</Text>
                  </View>
                  <Text style={styles.reviewCountText}>
                    {userProfile?.totalReviews || 0} Total
                  </Text>
                </View>

                <View style={styles.cardItemDivider} />

                <View style={styles.reviewsSummaryRow}>
                  <View style={styles.ratingStarsBox}>
                    <StarRatingDisplay
                      rating={Number(userProfile?.avgRating || 0)}
                      starSize={22}
                      starStyle={styles.starSpacing}
                    />
                    <Text style={styles.ratingNumberText}>
                      {userProfile?.avgRating || '0.0'} out of 5.0
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}

          <LineBreak val={4} />
        </ScrollView>
      )}
    </Container>
  );
};

export default VendorProfile;

const styles = StyleSheet.create({
  containerContent: {
    paddingBottom: responsiveHeight(5),
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: responsiveHeight(15),
  },
  scrollContent: {
    paddingHorizontal: responsiveWidth(4),
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: responsiveHeight(2),
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8ECF2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginTop: responsiveHeight(1),
  },
  avatarWrapper: {
    position: 'relative',
  },
  profileImg: {
    height: 96,
    width: 96,
    borderRadius: 48,
    backgroundColor: '#FAFAFA',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#16A34A',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  nameText: {
    fontSize: responsiveFontSize(2.4),
    fontWeight: 'bold',
    color: '#0F172A',
  },
  badgeRow: {
    marginTop: 6,
  },
  specialtyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  specialtyBadgeText: {
    fontSize: responsiveFontSize(1.4),
    fontWeight: '700',
    color: '#000',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: responsiveWidth(6),
  },
  locationIcon: {
    marginTop: 2,
  },
  locationText: {
    fontSize: responsiveFontSize(1.5),
    color: '#64748B',
    flexShrink: 1,
    lineHeight: 20,
  },
  actionsRow: {
    width: '100%',
    marginTop: 8,
    paddingHorizontal: responsiveWidth(6),
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.secondary_button,
    paddingVertical: 11,
    borderRadius: 25,
  },
  editProfileBtnText: {
    fontSize: responsiveFontSize(1.55),
    fontWeight: '700',
    color: '#000',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E8ECF2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statIconBox: {
    marginBottom: 2,
  },
  statValue: {
    fontSize: responsiveFontSize(2),
    fontWeight: 'bold',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: responsiveFontSize(1.3),
    color: '#64748B',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E2E8F0',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8ECF2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: responsiveFontSize(1.8),
    fontWeight: 'bold',
    color: '#0F172A',
  },
  cardItemDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: responsiveFontSize(1.5),
    color: '#64748B',
  },
  infoValue: {
    fontSize: responsiveFontSize(1.5),
    color: '#0F172A',
    fontWeight: '600',
  },
  infoValueHighlight: {
    fontSize: responsiveFontSize(1.6),
    color: '#16A34A',
    fontWeight: 'bold',
  },
  licenseTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  licenseTagText: {
    fontSize: responsiveFontSize(1.2),
    fontWeight: '700',
    color: '#15803D',
  },
  reviewCountText: {
    fontSize: responsiveFontSize(1.4),
    color: '#64748B',
    fontWeight: '500',
  },
  reviewsSummaryRow: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  ratingStarsBox: {
    alignItems: 'center',
    gap: 6,
  },
  starSpacing: {
    marginHorizontal: 1,
  },
  ratingNumberText: {
    fontSize: responsiveFontSize(1.4),
    color: '#64748B',
    fontWeight: '500',
  },
});
