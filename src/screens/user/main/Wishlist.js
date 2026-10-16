import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import Toast from 'react-native-simple-toast';

import Container from '../../../components/Container';
import NormalHeader from '../../../components/NormalHeader';
import Loader from '../../../components/Loader';
import { images } from '../../../assets/images';
import {
  getProfileImage,
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
  openDialer,
} from '../../../utils';
import {
  useLazyGetAllWishlistsQuery,
  useAddToFavouritesMutation,
} from '../../../redux/services';
import { colors } from '../../../assets/colors';

const Wishlist = () => {
  const nav = useNavigation();
  const user = useSelector(state => state.persistedData.user);
  const userId = user?._id;

  const [getAllWishlists, { data, isLoading }] = useLazyGetAllWishlistsQuery();
  const [addToFavourites] = useAddToFavouritesMutation();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (userId) {
      getAllWishlists(userId);
    }
  }, [userId, getAllWishlists]);

  const onRefresh = useCallback(async () => {
    if (userId) {
      setRefreshing(true);
      try {
        await getAllWishlists(userId).unwrap();
      } catch (e) {
        // ignore
      } finally {
        setRefreshing(false);
      }
    }
  }, [userId, getAllWishlists]);

  const handleRemoveFavourite = useCallback(
    async (techId, techName) => {
      try {
        const res = await addToFavourites({
          userId,
          technicianId: techId,
        }).unwrap();
        Toast.show(
          res?.msg || `${techName || 'Technician'} removed from wishlist`,
          Toast.SHORT,
        );
        getAllWishlists(userId);
      } catch (err) {
        Toast.show('Could not update wishlist', Toast.SHORT);
      }
    },
    [userId, addToFavourites, getAllWishlists],
  );

  const wishlistItems = useMemo(() => {
    if (!data?.data || !Array.isArray(data.data)) return [];
    return data.data.filter(item => item && item.technicianId);
  }, [data]);

  const renderCardItem = ({ item }) => {
    const tech = item.technicianId || {};
    const profileImgSrc =
      tech.profileImage &&
      !tech.profileImage.endsWith('/undefined') &&
      tech.profileImage.trim() !== ''
        ? { uri: getProfileImage(tech.profileImage) }
        : images.userProfile;

    const serviceName = tech.service?.name || 'General';
    const ratingValue = tech.avgRating
      ? Number(tech.avgRating).toFixed(1)
      : '5.0';
    const reviewsCount = tech.totalReviews ? `(${tech.totalReviews})` : '';
    const formattedPrice = `$${Number(tech.price || 0).toFixed(0)}`;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.cardContainer}
        onPress={() =>
          nav.navigate('ServicesProfile', {
            profileData: {
              ...tech,
              previousScreen: 'Wishlist',
            },
          })
        }
      >
        {/* Top Header Row: Avatar, Info, Heart Button */}
        <View style={styles.topRow}>
          {/* Avatar with Online Dot */}
          <View style={styles.avatarWrapper}>
            <Image source={profileImgSrc} style={styles.avatarImg} />
            {/* <View style={styles.onlineDot} /> */}
          </View>

          {/* Info Column */}
          <View style={styles.infoCol}>
            <View style={styles.nameRow}>
              <Text style={styles.technicianName} numberOfLines={1}>
                {tech.fullName || 'Certified Technician'}
              </Text>
              {tech.isVerified && (
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={colors.secondary}
                  style={styles.verifiedIcon}
                />
              )}
            </View>

            {/* Badges: Specialty & Star Rating */}
            <View style={styles.badgesRow}>
              <View style={styles.specialtyBadge}>
                <Text style={styles.specialtyText} numberOfLines={1}>
                  {serviceName} Specialist
                </Text>
              </View>

              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={11} color="#F59E0B" />
                <Text style={styles.ratingText}>{ratingValue}</Text>
                {reviewsCount ? (
                  <Text style={styles.reviewsCountText}>{reviewsCount}</Text>
                ) : null}
              </View>
            </View>
          </View>

          {/* Unfavorite Heart Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.heartButton}
            onPress={() => handleRemoveFavourite(tech._id, tech.fullName)}
          >
            <AntDesign name="heart" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Location & Working Hours Meta Rows */}
        {(tech.locationName || tech.workingHours) && (
          <View style={styles.metaContainer}>
            {tech.locationName && (
              <View style={styles.metaRow}>
                <Ionicons name="location-sharp" size={13} color="#64748B" />
                <Text style={styles.metaText} numberOfLines={1}>
                  {tech.locationName}
                </Text>
              </View>
            )}
            {tech.workingHours?.startTime && tech.workingHours?.endTime && (
              <View style={styles.metaRow}>
                <Feather name="clock" size={12} color="#64748B" />
                <Text style={styles.metaText}>
                  Hours: {tech.workingHours.startTime} -{' '}
                  {tech.workingHours.endTime}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Divider */}
        <View style={styles.cardDivider} />

        {/* Bottom Actions Row: Price & Buttons */}
        <View style={styles.bottomRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceAmount}>{formattedPrice}</Text>
            <Text style={styles.priceSubtext}>Service Fee</Text>
          </View>

          <View style={styles.actionsGroup}>
            {/* Quick Call */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.iconActionBtn}
              onPress={() => openDialer(tech.phone || tech.phoneNumber)}
            >
              <Ionicons name="call" size={15} color="#0F172A" />
            </TouchableOpacity>

            {/* Quick Chat */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.iconActionBtn}
              onPress={() =>
                nav.navigate('Chat', {
                  otherUserId: tech._id || tech.id,
                  userName: tech.fullName,
                  userImage: tech.profileImage,
                })
              }
            >
              <Ionicons name="chatbubble-ellipses" size={15} color="#0F172A" />
            </TouchableOpacity>

            {/* View Details Button */}
            {/* <TouchableOpacity
              activeOpacity={0.85}
              style={styles.viewDetailsBtn}
              onPress={() =>
                nav.navigate('ServicesProfile', {
                  profileData: {
                    ...tech,
                    previousScreen: 'Wishlist',
                  },
                })
              }
            >
              <Text style={styles.viewDetailsBtnText}>View Details</Text>
              <Feather name="arrow-right" size={14} color="#0F172A" />
            </TouchableOpacity> */}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderListHeader = () => {
    if (wishlistItems.length === 0) return null;
    return (
      <View style={styles.summaryBar}>
        <View style={styles.countBadge}>
          <AntDesign name="heart" size={12} color="#EF4444" />
          <Text style={styles.countBadgeText}>
            {wishlistItems.length} Saved{' '}
            {wishlistItems.length === 1 ? 'Technician' : 'Technicians'}
          </Text>
        </View>
        <Text style={styles.summarySubtext}>Ready to book</Text>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <AntDesign name="hearto" size={40} color="#F43F5E" />
        </View>
        <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
        <Text style={styles.emptySubtitle}>
          Save your favorite pest control technicians for quick access and
          priority booking anytime you need them.
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.exploreBtn}
          onPress={() => nav.navigate('UserHome')}
        >
          <Text style={styles.exploreBtnText}>Explore Technicians</Text>
          <Feather name="arrow-right" size={16} color="#0F172A" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Container
      scrollEnabled={false}
      extraStyle={styles.safeAreaBg}
      style={styles.screenBg}
    >
      <NormalHeader heading={'Wishlist'} onBackPress={() => nav.goBack()} />

      {isLoading && !refreshing ? (
        <View style={styles.loaderCenter}>
          <Loader />
        </View>
      ) : (
        <FlatList
          data={wishlistItems}
          keyExtractor={item => item._id || item.technicianId?._id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderEmptyState}
          renderItem={renderCardItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#A0CCD9']}
              tintColor={'#A0CCD9'}
            />
          }
        />
      )}
    </Container>
  );
};

export default Wishlist;

const styles = StyleSheet.create({
  safeAreaBg: {
    backgroundColor: '#FFFFFF',
  },
  screenBg: {
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    paddingHorizontal: responsiveWidth(4.5),
    paddingBottom: responsiveHeight(5),
    paddingTop: 14,
    gap: 14,
    flexGrow: 1,
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  countBadgeText: {
    fontSize: responsiveFontSize(1.3),
    fontWeight: '700',
    color: '#991B1B',
  },
  summarySubtext: {
    fontSize: responsiveFontSize(1.2),
    color: '#64748B',
    fontWeight: '500',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
    width: 62,
    height: 62,
  },
  avatarImg: {
    width: 62,
    height: 62,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  onlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  technicianName: {
    fontSize: responsiveFontSize(1.8),
    fontWeight: '800',
    color: '#0F172A',
    flexShrink: 1,
  },
  verifiedIcon: {
    marginLeft: 2,
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
  reviewsCountText: {
    fontSize: responsiveFontSize(1.1),
    color: '#92400E',
    fontWeight: '600',
  },
  heartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaContainer: {
    marginTop: 10,
    gap: 5,
    backgroundColor: '#F8FAFC',
    padding: 9,
    borderRadius: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: responsiveFontSize(1.2),
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  bottomRow: {
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
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#A0CCD9',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 12,
    shadowColor: '#A0CCD9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  viewDetailsBtnText: {
    fontSize: responsiveFontSize(1.3),
    fontWeight: '800',
    color: '#0F172A',
  },
  loaderCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#FFE4E6',
  },
  emptyTitle: {
    fontSize: responsiveFontSize(2.0),
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: responsiveFontSize(1.3),
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#A0CCD9',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#A0CCD9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  exploreBtnText: {
    fontSize: responsiveFontSize(1.4),
    fontWeight: '800',
    color: '#0F172A',
  },
});
