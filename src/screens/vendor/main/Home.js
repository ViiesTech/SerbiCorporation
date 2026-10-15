import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  TextInput,
} from 'react-native';
import {
  getProfileImage,
  openDialer,
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from './../../../utils';
import { images } from '../../../assets/images';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import SVGIcon from '../../../components/SVGIcon';
import icons from '../../../assets/icons';
import LineBreak from '../../../components/LineBreak';
import { firstTimeVisit } from '../../../redux/slices';
import { useDispatch, useSelector } from 'react-redux';
import {
  useLazyGetAllAppointmentsQuery,
  useLazyGetAllReviewsQuery,
  useGetNotificationsQuery,
} from '../../../redux/services';
import Loader from '../../../components/Loader';
import moment from 'moment';
import { useIsFocused } from '@react-navigation/native';
import Toast from 'react-native-simple-toast';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../assets/colors';

const categoryTabs = [
  { id: 1, title: 'REQUESTED' },
  { id: 2, title: 'DISCUSSION' },
];

const requestedStatuses = [
  { id: 1, sub_title: 'Accepted', display: 'Paid' },
  { id: 2, sub_title: 'On The Way', display: 'On The Way' },
  { id: 3, sub_title: 'Arrived', display: 'Arrived' },
];

const discussionStatuses = [
  { id: 1, sub_title: 'Upcoming', display: 'Upcoming' },
  { id: 2, sub_title: 'Start', display: 'Start' },
  { id: 3, sub_title: 'Stop', display: 'Stop' },
  { id: 4, sub_title: 'Completed', display: 'Completed' },
];

const Home = ({ navigation }) => {
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const { firstVisit, user } = useSelector(state => state.persistedData);

  const [currentCategory, setCurrentCategory] = useState('REQUESTED');
  const [subCategory, setSubCategory] = useState(0);
  const [search, setSearch] = useState('');

  const [getAllAppointments, { data, isLoading }] =
    useLazyGetAllAppointmentsQuery();
  const [getAllReviews, { data: reviewsData }] = useLazyGetAllReviewsQuery();

  const { data: notifData } = useGetNotificationsQuery(
    { page: 1, limit: 1 },
    { skip: !user?._id, pollingInterval: 30000 },
  );
  const unreadNotifCount = notifData?.unreadCount ?? 0;

  // Dynamic Greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'GOOD MORNING!';
    if (hour < 17) return 'GOOD AFTERNOON!';
    return 'GOOD EVENING!';
  }, []);

  // Fetch appointments on screen focus
  useEffect(() => {
    if (isFocused && user?._id) {
      getAllAppointments({ id: user._id, type: user?.type });
      getAllReviews(user._id);
    }
  }, [isFocused, user, getAllAppointments, getAllReviews]);

  // Remove login success splash screen after 5 sec
  useEffect(() => {
    if (firstVisit) {
      const timer = setTimeout(() => {
        dispatch(firstTimeVisit(false));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [firstVisit, dispatch]);

  // Reset status tab to 0 when category changes
  useEffect(() => {
    setSubCategory(0);
  }, [currentCategory]);

  const getSourceData = useCallback(() => {
    if (currentCategory === 'REQUESTED') {
      return data?.data?.requestForms || [];
    }
    return data?.data?.discussionForms || [];
  }, [currentCategory, data]);

  // Filter logic using useMemo
  const displayData = useMemo(() => {
    const source = getSourceData();
    let filtered = [...source];

    // 1. Filter by Status
    const statuses =
      currentCategory === 'REQUESTED' ? requestedStatuses : discussionStatuses;
    const currentStatusConfig = statuses[subCategory] || statuses[0];

    filtered = filtered.filter(item => {
      const itemStatus = (item?.status || '').toLowerCase();
      const targetStatus = currentStatusConfig.sub_title.toLowerCase();
      if (targetStatus === 'accepted') {
        return itemStatus === 'accepted' || itemStatus === 'paid';
      }
      return itemStatus === targetStatus;
    });

    // 2. Filter by Search
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        item =>
          item?.userId?.fullName?.toLowerCase().includes(q) ||
          item?.userId?.locationName?.toLowerCase().includes(q) ||
          item?.locationName?.toLowerCase().includes(q) ||
          item?.address?.toLowerCase().includes(q),
      );
    }

    return filtered;
  }, [getSourceData, currentCategory, subCategory, search]);

  const requestedCount = data?.data?.requestForms?.length || 0;
  const discussionCount = data?.data?.discussionForms?.length || 0;

  const currentStatuses =
    currentCategory === 'REQUESTED' ? requestedStatuses : discussionStatuses;
  const currentStatusConfig =
    currentStatuses[subCategory] || currentStatuses[0];

  const getStatusBadgeStyle = status => {
    const s = (status || '').toLowerCase();
    if (s === 'accepted' || s === 'paid') {
      return {
        label: 'PAID',
        bg: '#E8F8F0',
        border: '#B8EDD2',
        color: '#16A34A',
      };
    }
    if (s === 'on the way') {
      return {
        label: 'ON THE WAY',
        bg: '#EBF3FE',
        border: '#BFDBFE',
        color: '#2563EB',
      };
    }
    if (s === 'arrived') {
      return {
        label: 'ARRIVED',
        bg: '#FEF7EA',
        border: '#FDE68A',
        color: '#D97706',
      };
    }
    if (s === 'completed') {
      return {
        label: 'COMPLETED',
        bg: '#F3F4F6',
        border: '#E5E7EB',
        color: '#4B5563',
      };
    }
    if (s === 'start') {
      return {
        label: 'IN PROGRESS',
        bg: '#EFF6FF',
        border: '#DBEAFE',
        color: '#3B82F6',
      };
    }
    if (s === 'stop') {
      return {
        label: 'STOPPED',
        bg: '#FEE2E2',
        border: '#FECACA',
        color: '#EF4444',
      };
    }
    return {
      label: (status || 'PENDING').toUpperCase(),
      bg: '#F4F5F7',
      border: '#E2E8F0',
      color: '#64748B',
    };
  };

  const handleCardPress = item => {
    console.log('ITEM:-', item);
    if (item.status === 'Completed') {
      const review = reviewsData?.data?.find(
        r => r.userId?._id === item.userId?._id,
      );
      if (review) {
        navigation.navigate('ClientReview', { reviewData: review });
      } else {
        Toast.show('No Feedback Found', Toast.SHORT);
      }
    } else {
      const clientPhone =
        item?.userId?.phone ||
        item?.userId?.phoneNumber ||
        item?.phone ||
        item?.phoneNumber ||
        item?.requestFormId?.phone ||
        item?.requestFormId?.phoneNumber ||
        item?.requestFormId?.userId?.phone ||
        item?.requestFormId?.userId?.phoneNumber;

      navigation.navigate('Services', {
        ids: {
          requestFormId: item._id,
          technicianId: item.technicianId,
          serviceId: item.serviceId,
          user: item.userId,
          phone: clientPhone,
          type: currentCategory,
          status: item.status,
          coordinates: {
            lat:
              item?.latitude ||
              item?.userId?.latitude ||
              item?.userId?.location?.coordinates?.[1] ||
              0,
            lng:
              item?.longitude ||
              item?.userId?.longitude ||
              item?.userId?.location?.coordinates?.[0] ||
              0,
          },
        },
      });
    }
  };

  if (firstVisit) {
    return (
      <View style={styles.loginContainer}>
        <Image
          source={images.success}
          style={styles.successImg}
          resizeMode="cover"
        />
        <LineBreak val={2} />
        <Text style={styles.actionSuccessText}>Action Success</Text>
        <LineBreak val={2} />
        <Text style={styles.loginSuccessText}>LOGIN SUCCESS</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.flex}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('VendorProfile')}
            >
              <Image
                style={styles.profileImg}
                source={
                  user?.profileImage
                    ? { uri: getProfileImage(user.profileImage) }
                    : images.userProfile
                }
              />
            </TouchableOpacity>
            <View style={styles.headerTexts}>
              <View style={styles.row}>
                <Text style={styles.greetingText}>{greeting}</Text>
                <SVGIcon height={18} width={18} xml={icons.plant} />
              </View>
              <View style={styles.rowSmall}>
                <Ionicons name="location-sharp" size={14} color="#777" />
                <Text numberOfLines={1} style={styles.headerLocationText}>
                  {user?.locationName || 'No location set'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.iconRow}>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={20} color="#222" />
              {unreadNotifCount > 0 && <View style={styles.notifDot} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => navigation.navigate('AppSettings')}
            >
              <Feather name="settings" size={20} color="#222" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Modern Search Bar */}
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={20} color="#888" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="What are you looking for?"
            placeholderTextColor="#888"
            style={styles.searchInput}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#888" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Section Heading */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>APPOINTMENTS</Text>
        </View>

        {/* Category Segmented Control */}
        {!search && (
          <View style={styles.segmentContainer}>
            {categoryTabs.map(item => {
              const isActive = item.title === currentCategory;
              const count =
                item.title === 'REQUESTED' ? requestedCount : discussionCount;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setCurrentCategory(item.title)}
                  style={[
                    styles.segmentBtn,
                    isActive && styles.activeSegmentBtn,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      isActive && styles.activeSegmentText,
                    ]}
                  >
                    {item.title}
                  </Text>
                  {count > 0 && (
                    <View
                      style={[
                        styles.countBadge,
                        isActive && styles.activeCountBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.countBadgeText,
                          isActive && styles.activeCountBadgeText,
                        ]}
                      >
                        {count}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <LineBreak val={1.5} />

        {/* Status Horizontal Tabs */}
        <FlatList
          horizontal
          data={currentStatuses}
          keyExtractor={item => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusTabsContainer}
          renderItem={({ item, index }) => {
            const isActive = index === subCategory;
            return (
              <TouchableOpacity
                onPress={() => setSubCategory(index)}
                style={[styles.statusTab, isActive && styles.activeStatusTab]}
              >
                <Text
                  style={[
                    styles.statusTabText,
                    isActive && styles.activeStatusTabText,
                  ]}
                >
                  {item.display || item.sub_title}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        <LineBreak val={1.5} />

        {/* Appointments List */}
        <View style={styles.listContainer}>
          {isLoading ? (
            <View style={styles.loaderBox}>
              <Loader />
            </View>
          ) : displayData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="calendar-outline" size={32} color="#888" />
              </View>
              <Text style={styles.emptyTitle}>No Appointments Found</Text>
              <Text style={styles.emptySubTitle}>
                {search
                  ? 'Try searching with a different client name or address.'
                  : `No appointments under "${
                      currentStatusConfig?.display ||
                      currentStatusConfig?.sub_title
                    }".`}
              </Text>
            </View>
          ) : (
            displayData.map(item => {
              const clientUser = item?.userId;
              const clientName = clientUser?.fullName || 'Client';
              const clientLocation =
                clientUser?.locationName ||
                item?.locationName ||
                'Location not specified';
              const clientPhone =
                clientUser?.phone ||
                clientUser?.phoneNumber ||
                item?.phone ||
                item?.phoneNumber ||
                item?.requestFormId?.phone ||
                item?.requestFormId?.phoneNumber ||
                item?.requestFormId?.userId?.phone ||
                item?.requestFormId?.userId?.phoneNumber;
              const clientAvatar = clientUser?.profileImage
                ? getProfileImage(clientUser.profileImage, true)
                : null;

              const formattedDate = item?.date
                ? moment(item.date, 'DD-MM-YYYY').isValid()
                  ? moment(item.date, 'DD-MM-YYYY').format('ddd, MMM D')
                  : moment(item.createdAt).format('ddd, MMM D')
                : moment(item?.createdAt).format('ddd, MMM D');

              const appointmentTime =
                item?.time || moment(item?.createdAt).format('hh:mm A');
              const relativeTime = moment(item?.createdAt).calendar();
              const statusBadge = getStatusBadgeStyle(item?.status);

              return (
                <TouchableOpacity
                  key={item._id}
                  activeOpacity={0.9}
                  onPress={() => handleCardPress(item)}
                  style={styles.appointmentCard}
                >
                  {/* Top Header: Client Info & Status Badge */}
                  <View style={styles.cardHeader}>
                    <View style={styles.clientInfoRow}>
                      {clientAvatar ? (
                        <Image
                          source={{ uri: clientAvatar }}
                          style={styles.clientAvatar}
                        />
                      ) : (
                        <View style={styles.avatarPlaceholder}>
                          <Ionicons name="person" size={20} color="#666" />
                        </View>
                      )}
                      <View style={styles.clientMeta}>
                        <Text numberOfLines={1} style={styles.clientNameText}>
                          {clientName}
                        </Text>
                        <Text style={styles.relativeTimeText}>
                          {relativeTime}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: statusBadge.bg,
                          borderColor: statusBadge.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          { color: statusBadge.color },
                        ]}
                      >
                        {statusBadge.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  {/* Location & Schedule Details (No overlap!) */}
                  <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                      <View style={styles.infoIconBox}>
                        <Ionicons
                          name="location-sharp"
                          size={15}
                          color="#E11D48"
                        />
                      </View>
                      <Text numberOfLines={2} style={styles.locationText}>
                        {clientLocation}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <View style={styles.infoIconBox}>
                        <Ionicons
                          name="time-outline"
                          size={14}
                          color="#64748B"
                        />
                      </View>
                      <Text style={styles.scheduleText}>
                        {formattedDate}
                        {appointmentTime ? `  •  ${appointmentTime}` : ''}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  {/* Bottom Actions Row */}
                  <View style={styles.cardFooter}>
                    <TouchableOpacity
                      style={styles.detailsBtn}
                      onPress={() => handleCardPress(item)}
                    >
                      <Text style={styles.detailsBtnText}>View Service</Text>
                      <Feather name="chevron-right" size={15} color="#444" />
                    </TouchableOpacity>

                    <View style={styles.actionButtonsGroup}>
                      <TouchableOpacity
                        style={styles.actionBtnCall}
                        onPress={() => openDialer(clientPhone)}
                      >
                        <Ionicons name="call" size={17} color="#000" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionBtnChat}
                        onPress={() =>
                          navigation.navigate('Chat', {
                            otherUserId: clientUser?._id,
                            userName: clientName,
                            userImage: clientUser?.profileImage,
                          })
                        }
                      >
                        <Ionicons
                          name="chatbubble-ellipses"
                          size={17}
                          color="#000"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <LineBreak val={3} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#F8F9FD',
  },
  container: {
    paddingHorizontal: responsiveWidth(4),
    paddingTop: responsiveHeight(1.5),
    paddingBottom: responsiveHeight(3),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveHeight(2),
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  profileImg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFF',
  },
  headerTexts: {
    flex: 1,
    gap: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greetingText: {
    fontSize: responsiveFontSize(2),
    fontWeight: 'bold',
    color: '#000',
  },
  rowSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerLocationText: {
    fontSize: responsiveFontSize(1.5),
    color: '#666',
    flex: 1,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8ECF2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 30,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: responsiveHeight(2),
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: responsiveFontSize(1.7),
    color: '#000',
    paddingVertical: 0,
  },
  sectionHeader: {
    marginBottom: responsiveHeight(1.2),
  },
  sectionTitle: {
    fontSize: responsiveFontSize(2.2),
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 0.5,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 26,
    gap: 6,
  },
  activeSegmentBtn: {
    backgroundColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: responsiveFontSize(1.6),
    fontWeight: '700',
    color: '#555',
  },
  activeSegmentText: {
    color: '#FFFFFF',
  },
  countBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeCountBadge: {
    backgroundColor: colors.primary,
  },
  countBadgeText: {
    fontSize: responsiveFontSize(1.3),
    fontWeight: 'bold',
    color: '#333',
  },
  activeCountBadgeText: {
    color: '#000',
  },
  statusTabsContainer: {
    gap: 8,
    paddingVertical: 2,
  },
  statusTab: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStatusTab: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  statusTabText: {
    fontSize: responsiveFontSize(1.5),
    fontWeight: '600',
    color: '#000',
  },
  activeStatusTabText: {
    color: '#FFFFFF',
  },
  listContainer: {
    gap: responsiveHeight(1.8),
  },
  loaderBox: {
    paddingVertical: responsiveHeight(5),
    alignItems: 'center',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: responsiveHeight(4),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAECEF',
    marginTop: responsiveHeight(1),
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
  emptySubTitle: {
    fontSize: responsiveFontSize(1.5),
    color: '#64748B',
    textAlign: 'center',
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clientInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clientMeta: {
    flex: 1,
    gap: 3,
  },
  clientNameText: {
    fontSize: responsiveFontSize(1.9),
    fontWeight: 'bold',
    color: '#0F172A',
  },
  relativeTimeText: {
    fontSize: responsiveFontSize(1.3),
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: responsiveFontSize(1.2),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  cardBody: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoIconBox: {
    marginTop: 2,
  },
  locationText: {
    flex: 1,
    fontSize: responsiveFontSize(1.5),
    color: '#334155',
    lineHeight: 20,
  },
  scheduleText: {
    flex: 1,
    fontSize: responsiveFontSize(1.4),
    color: '#64748B',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailsBtnText: {
    fontSize: responsiveFontSize(1.4),
    fontWeight: '600',
    color: '#1E293B',
  },
  actionButtonsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionBtnCall: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionBtnChat: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.secondary_button,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  successImg: {
    height: responsiveHeight(13),
    width: responsiveHeight(13),
  },
  actionSuccessText: {
    fontSize: responsiveFontSize(2),
    color: '#555',
  },
  loginSuccessText: {
    fontSize: responsiveFontSize(2.8),
    fontWeight: 'bold',
    color: '#000',
  },
});
