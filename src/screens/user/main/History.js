import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';

// Components
import Container from '../../../components/Container';
import NormalHeader from '../../../components/NormalHeader';
import LineBreak from '../../../components/LineBreak';
import Loader from '../../../components/Loader';

// Utils & Assets
import {
  getProfileImage,
  openDialer,
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../utils';
import { useLazyGetDiscussionFormsQuery } from '../../../redux/services';
import { colors } from '../../../assets/colors';
import { images } from '../../../assets/images';

const History = () => {
  const nav = useNavigation();
  const isFocused = useIsFocused();
  const { user } = useSelector(state => state.persistedData);
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [getAllDiscussionForms, { isLoading }] =
    useLazyGetDiscussionFormsQuery();

  const fetchHistory = useCallback(async () => {
    if (!user?._id) return;
    const payload = {
      id: user?._id,
      type: user?.type,
      status: 'Paid',
    };

    try {
      const res = await getAllDiscussionForms(payload).unwrap();
      setData(res);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  }, [user?._id, user?.type, getAllDiscussionForms]);

  useEffect(() => {
    if (isFocused) {
      fetchHistory();
    }
  }, [isFocused, fetchHistory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  }, [fetchHistory]);

  const totalAmount = useMemo(() => {
    if (!data?.data || !Array.isArray(data.data)) return 0;
    return data.data.reduce(
      (sum, item) => sum + (Number(item?.amount) || 0),
      0,
    );
  }, [data]);

  const handleCardPress = useCallback(
    item => {
      const address =
        item?.requestFormId?.address ||
        item?.address ||
        item?.technicianId?.locationName ||
        'Location not available';

      nav.navigate('ServicesProfile', {
        profileData: {
          ...item?.technicianId,
          appointmentData: {
            status: 'Completed',
            id: item?._id,
            date: item?.date || item?.createdAt,
            time: item?.time,
            address: address,
            type: 'DISCUSSION',
            amount: item?.amount,
            typeOfPest: item?.typeOfPest,
            propertyType: item?.propertyType,
          },
          previousScreen: 'History',
        },
      });
    },
    [nav],
  );

  const handleCall = useCallback(phone => {
    if (phone) {
      openDialer(phone);
    }
  }, []);

  const handleChat = useCallback(
    item => {
      nav.navigate('Chat', {
        otherUserId: item?.technicianId?._id,
        userName: item?.technicianId?.fullName || 'Technician',
        item,
      });
    },
    [nav],
  );

  const renderListHeader = () => {
    if (!data?.data || data.data.length === 0) return null;
    return (
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <View style={styles.summaryIconBox}>
            <Ionicons name="checkmark-done-circle" size={24} color="#16A34A" />
          </View>
          <View>
            <Text style={styles.summaryCount}>{data.data.length}</Text>
            <Text style={styles.summaryLabel}>Completed Services</Text>
          </View>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <View style={styles.summaryIconBox}>
            <Ionicons name="wallet-outline" size={22} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.summaryCount}>${totalAmount}</Text>
            <Text style={styles.summaryLabel}>Total Spent</Text>
          </View>
        </View>
      </View>
    );
  };

  const listEmptyComponent = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="receipt-outline" size={32} color="#94A3B8" />
        </View>
        <Text style={styles.emptyTitle}>No Service History</Text>
        <Text style={styles.emptySubtitle}>
          Completed and paid appointments will appear here.
        </Text>
      </View>
    );
  };

  const renderItem = useCallback(
    ({ item }) => {
      const technicianName = item?.technicianId?.fullName || 'Technician';
      const designation = `${item?.serviceId?.name || 'General'} Technician`;
      const rating = item?.technicianId?.avgRating || 4.5;
      const address =
        item?.requestFormId?.address ||
        item?.technicianId?.locationName ||
        item?.address ||
        'Location not available';

      let formattedDate = '';
      if (item?.date) {
        const d = moment(item.date, [
          'YYYY-MM-DD',
          'DD-MM-YYYY',
          moment.ISO_8601,
        ]);
        formattedDate = d.isValid()
          ? d.format('ddd, MMM D, YYYY')
          : String(item.date);
      } else if (item?.createdAt) {
        formattedDate = moment(item.createdAt).format('ddd, MMM D, YYYY');
      }

      const time = item?.time || item?.requestFormId?.time || '';
      const displayDateTime = formattedDate + (time ? ` • ${time}` : '');
      const avatarUri = getProfileImage(item?.technicianId?.profileImage);
      const phone =
        item?.technicianId?.phone || item?.technicianId?.phoneNumber;

      return (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.88}
          onPress={() => handleCardPress(item)}
        >
          {/* Card Top Row: Avatar + Name/Rating + Completed Badge */}
          <View style={styles.cardHeader}>
            <View style={styles.technicianRow}>
              <Image
                source={
                  avatarUri && !avatarUri.endsWith('/undefined')
                    ? { uri: avatarUri }
                    : images.userProfile
                }
                style={styles.avatar}
              />
              <View style={styles.technicianMeta}>
                <Text style={styles.technicianName} numberOfLines={1}>
                  {technicianName}
                </Text>
                <View style={styles.subInfoRow}>
                  <Text style={styles.designationText} numberOfLines={1}>
                    {designation}
                  </Text>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={styles.ratingText}>{rating}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.statusBadge}>
              <Ionicons name="checkmark-circle" size={13} color="#16A34A" />
              <Text style={styles.statusBadgeText}>COMPLETED</Text>
            </View>
          </View>

          {/* Tags row if typeOfPest or propertyType available */}
          {(item?.typeOfPest || item?.propertyType) && (
            <View style={styles.tagsRow}>
              {item?.typeOfPest ? (
                <View style={styles.pestTag}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={12}
                    color="#0284C7"
                  />
                  <Text style={styles.pestTagText}>{item.typeOfPest}</Text>
                </View>
              ) : null}
              {item?.propertyType ? (
                <View style={styles.propertyTag}>
                  <Ionicons name="home-outline" size={12} color="#64748B" />
                  <Text style={styles.propertyTagText}>
                    {item.propertyType}
                  </Text>
                </View>
              ) : null}
            </View>
          )}

          {/* Address & Date Information */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons
                name="location-sharp"
                size={16}
                color="#EF4444"
                style={styles.infoIcon}
              />
              <Text style={styles.addressText} numberOfLines={2}>
                {address}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons
                name="calendar-outline"
                size={15}
                color="#64748B"
                style={styles.infoIcon}
              />
              <Text style={styles.dateText}>{displayDateTime}</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.cardDivider} />

          {/* Card Footer: Price & Actions */}
          <View style={styles.cardFooter}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Total Paid</Text>
              <Text style={styles.priceValue}>${item?.amount || 0}</Text>
            </View>

            <View style={styles.actionGroup}>
              <TouchableOpacity
                style={styles.viewDetailsBtn}
                onPress={() => handleCardPress(item)}
              >
                <Text style={styles.viewDetailsText}>View Details</Text>
                <Feather name="chevron-right" size={14} color="#1E293B" />
              </TouchableOpacity>

              {phone ? (
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => handleCall(phone)}
                >
                  <Ionicons name="call" size={16} color="#000" />
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                style={styles.chatBtn}
                onPress={() => handleChat(item)}
              >
                <Ionicons
                  name="chatbubble-ellipses"
                  size={16}
                  color="#000"
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [handleCardPress, handleCall, handleChat],
  );

  return (
    <Container extraStyle={styles.container} scrollEnabled={false}>
      <NormalHeader heading={'History'} onBackPress={() => nav.goBack()} />
      <LineBreak val={1.5} />

      {isLoading ? (
        <Loader />
      ) : (
        <FlatList
          data={data?.data || []}
          keyExtractor={item => item?._id?.toString()}
          contentContainerStyle={styles.contentContainerStyle}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={listEmptyComponent}
          ListFooterComponent={<LineBreak val={2} />}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD',
  },
  contentContainerStyle: {
    flexGrow: 1,
    paddingHorizontal: responsiveWidth(4),
    paddingBottom: responsiveHeight(3),
    gap: 14,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCount: {
    fontSize: responsiveFontSize(2),
    fontWeight: '800',
    color: '#0F172A',
  },
  summaryLabel: {
    fontSize: responsiveFontSize(1.3),
    color: '#64748B',
    fontWeight: '500',
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  technicianRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F1F5F9',
  },
  technicianMeta: {
    flex: 1,
    gap: 2,
  },
  technicianName: {
    fontSize: responsiveFontSize(1.9),
    fontWeight: 'bold',
    color: '#0F172A',
  },
  subInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  designationText: {
    fontSize: responsiveFontSize(1.3),
    color: '#64748B',
    fontWeight: '500',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: responsiveFontSize(1.2),
    fontWeight: '700',
    color: '#B45309',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F8F0',
    borderWidth: 1,
    borderColor: '#B8EDD2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: responsiveFontSize(1.1),
    fontWeight: '700',
    color: '#16A34A',
    letterSpacing: 0.3,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  pestTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pestTagText: {
    fontSize: responsiveFontSize(1.2),
    color: '#0369A1',
    fontWeight: '600',
  },
  propertyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  propertyTagText: {
    fontSize: responsiveFontSize(1.2),
    color: '#64748B',
    fontWeight: '500',
  },
  infoSection: {
    marginTop: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoIcon: {
    marginTop: 2,
  },
  addressText: {
    flex: 1,
    fontSize: responsiveFontSize(1.4),
    color: '#334155',
    lineHeight: 19,
  },
  dateText: {
    flex: 1,
    fontSize: responsiveFontSize(1.3),
    color: '#64748B',
    fontWeight: '500',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    gap: 1,
  },
  priceLabel: {
    fontSize: responsiveFontSize(1.2),
    color: '#64748B',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: responsiveFontSize(2.2),
    fontWeight: '800',
    color: '#0F172A',
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  viewDetailsText: {
    fontSize: responsiveFontSize(1.3),
    fontWeight: '600',
    color: '#1E293B',
  },
  callBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chatBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.secondary_button || '#A0CCD9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: responsiveHeight(5),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: responsiveHeight(3),
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: responsiveFontSize(2),
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: responsiveFontSize(1.4),
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default History;
