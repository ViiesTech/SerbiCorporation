import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
} from 'react-native';
import Container from '../../../components/Container';
import NormalHeader from '../../../components/NormalHeader';
import LineBreak from '../../../components/LineBreak';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import {
  AppColors,
  getProfileImage,
  responsiveFontSize,
  responsiveWidth,
} from '../../../utils';
import AppText from '../../../components/AppText';
import HistoryCard from '../../../components/HistoryCard';
import { colors } from '../../../assets/colors';
import { useLazyGetAllAppointmentsQuery } from '../../../redux/services';
import { useSelector } from 'react-redux';
import Loader from '../../../components/Loader';
import moment from 'moment';

const TAB_DATA = [
  { id: 1, title: 'REQUESTED' },
  { id: 2, title: 'DISCUSSION' },
];

const REQUESTED_STATUS = ['Paid', 'On The Way', 'Arrived'];
const DISCUSSION_STATUS = ['Upcoming', 'Start', 'Stop', 'Completed'];

const Appointments = () => {
  const nav = useNavigation();
  const isFocused = useIsFocused();
  const { user } = useSelector(state => state.persistedData);

  const [selectedTab, setSelectedTab] = useState('REQUESTED');
  const [selectedStatusIndex, setSelectedStatusIndex] = useState(0);

  const [getAllAppointments, { data, isLoading }] =
    useLazyGetAllAppointmentsQuery();

  // Fetch on focus
  useEffect(() => {
    if (user?._id && user?.type) {
      getAllAppointments({ id: user._id, type: user.type });
    }
  }, [user, isFocused, getAllAppointments]);

  // Counts for top segmented tabs
  const requestedCount = useMemo(() => {
    return data?.data?.requestForms?.length || 0;
  }, [data]);

  const discussionCount = useMemo(() => {
    return data?.data?.discussionForms?.length || 0;
  }, [data]);

  // Get source list
  const sourceData = useMemo(() => {
    if (!data?.data) return [];
    return selectedTab === 'REQUESTED'
      ? data.data.requestForms || []
      : data.data.discussionForms || [];
  }, [data, selectedTab]);

  // Current status list
  const statusList =
    selectedTab === 'REQUESTED' ? REQUESTED_STATUS : DISCUSSION_STATUS;

  // Filtered data
  const filteredAppointments = useMemo(() => {
    const currentStatus = statusList[selectedStatusIndex];
    if (!currentStatus) return sourceData;

    if (currentStatus === 'Paid') {
      return sourceData.filter(
        item =>
          item.status === 'Paid' ||
          item.status === 'Accepted' ||
          (item.status === 'Accepted' && item.paymentStatus === 'Paid'),
      );
    }

    return sourceData.filter(
      item => (item.status || '').toLowerCase() === currentStatus.toLowerCase(),
    );
  }, [sourceData, selectedStatusIndex, statusList]);

  return (
    <Container scrollEnabled={false}>
      <NormalHeader heading="Appointments" onBackPress={() => nav.goBack()} />
      <LineBreak val={1.5} />

      {isLoading ? (
        <Loader />
      ) : (
        <>
          {/* Category Segmented Control */}
          <View style={styles.segmentWrapper}>
            <View style={styles.segmentContainer}>
              {TAB_DATA.map(item => {
                const isActive = item.title === selectedTab;
                const count =
                  item.title === 'REQUESTED' ? requestedCount : discussionCount;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      setSelectedTab(item.title);
                      setSelectedStatusIndex(0);
                    }}
                    style={[
                      styles.segmentBtn,
                      isActive && styles.activeSegmentBtn,
                    ]}
                    activeOpacity={0.8}
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
          </View>

          <LineBreak val={1.5} />

          {/* Status Horizontal Tabs */}
          <FlatList
            horizontal
            keyExtractor={(item, index) => index.toString()}
            data={statusList}
            contentContainerStyle={styles.statusTabsContainer}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item, index }) => {
              const isActive = index === selectedStatusIndex;
              return (
                <TouchableOpacity
                  style={[
                    styles.statusPill,
                    isActive && styles.activeStatusPill,
                  ]}
                  onPress={() => setSelectedStatusIndex(index)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      isActive && styles.activeStatusPillText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />

          <LineBreak val={2} />

          {/* Appointments List */}
          <FlatList
            data={filteredAppointments}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <AppText title="No Appointments Found" align="center" />
            }
            ListFooterComponent={<LineBreak val={2} />}
            renderItem={({ item }) => {
              const price = item?.technicianId?.price ?? item?.amount ?? 0;

              return (
                <HistoryCard
                  item={{
                    id: item._id,
                    profImg: getProfileImage(item.technicianId?.profileImage),
                    username: item.technicianId?.fullName,
                    price: `$${price}`,
                    status: item.status === 'Accepted' ? 'Paid' : item.status,
                    designation: 'Pest Technician',
                    rating: item.technicianId?.avgRating || 0,
                    location: item.address,
                    date: `${moment(item.date, 'DD-MM-YYYY').format(
                      'dddd DD MMMM YYYY',
                    )} at ${item.time}`,
                  }}
                  myAppointments
                  onCardPress={() =>
                    nav.navigate('ServicesProfile', {
                      profileData: {
                        ...item.technicianId,
                        appointmentData: {
                          status: item.status,
                          id: item._id,
                          date: item.date,
                          time: item.time,
                          address: item.address,
                          type: selectedTab,
                        },
                        previousScreen: 'Appointments',
                      },
                    })
                  }
                  activeCardBgColor={AppColors.PRIMARY}
                />
              );
            }}
          />
        </>
      )}
    </Container>
  );
};

export default Appointments;

const styles = StyleSheet.create({
  segmentWrapper: {
    paddingHorizontal: responsiveWidth(4),
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
    color: '#555555',
  },
  activeSegmentText: {
    color: '#FFFFFF',
  },
  countBadge: {
    backgroundColor: '#F1F5F9',
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCountBadge: {
    backgroundColor: colors.primary,
  },
  countBadgeText: {
    fontSize: responsiveFontSize(1.3),
    fontWeight: 'bold',
    color: '#333333',
  },
  activeCountBadgeText: {
    color: '#000000',
  },
  statusTabsContainer: {
    gap: 8,
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: 2,
  },
  statusPill: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStatusPill: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  statusPillText: {
    fontSize: responsiveFontSize(1.5),
    fontWeight: 'bold',
    color: '#000000',
  },
  activeStatusPillText: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: responsiveWidth(4),
    gap: 15,
  },
});
