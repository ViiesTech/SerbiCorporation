import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import Container from '../../../components/Container';
import NormalHeader from '../../../components/NormalHeader';
import LineBreak from '../../../components/LineBreak';
import { TabRouter, useNavigation } from '@react-navigation/native';
import { AppColors, responsiveHeight, responsiveWidth } from '../../../utils';
import AppText from '../../../components/AppText';
import HistoryCard from '../../../components/HistoryCard';
import { colors } from '../../../assets/colors';
import { useLazyGetAllAppointmentsQuery } from '../../../redux/services';
import { useSelector } from 'react-redux';
import Loader from '../../../components/Loader';
import { IMAGE_URL } from '../../../redux/constant';
import moment from 'moment';
import AppTextInput from '../../../components/AppTextInput';

const tabData = [
  { id: 1, title: 'Pending Appointments' },
  { id: 2, title: 'Complete Appointments' },
];

// const appointmentTypes = [
//     { id: 1, title: 'REQUESTED' },
//     { id: 2, title: 'DISCUSSION' },
// ];

const cardData = [
  {
    id: 1,
    // profImg: images.map,
    username: 'Roland Hopper',
    price: '$79.00',
    status: 'Upcoming',
    designation: 'Pest Technician',
    rating: '3.5',
    location: 'California, United State',
    date: 'Tuesday, 11 March 2025 at 10:00 AM',
  },
  {
    id: 2,
    // profImg: images.map,
    username: 'Roland Hopper',
    price: '$79.00',
    status: 'Upcoming',
    designation: 'Pest Technician',
    rating: '3.5',
    location: 'California, United State',
    date: 'Tuesday, 11 March 2025 at 10:00 AM',
  },
  {
    id: 3,
    // profImg: images.map,
    username: 'Roland Hopper',
    price: '$79.00',
    status: 'Upcoming',
    designation: 'Pest Technician',
    rating: '3.5',
    location: 'California, United State',
    date: 'Tuesday, 11 March 2025 at 10:00 AM',
  },
  {
    id: 4,
    // profImg: images.map,
    username: 'Roland Hopper',
    price: '$79.00',
    status: 'Upcoming',
    designation: 'Pest Technician',
    rating: '3.5',
    location: 'California, United State',
    date: 'Tuesday, 11 March 2025 at 10:00 AM',
  },
  {
    id: 5,
    // profImg: images.map,
    username: 'Roland Hopper',
    price: '$79.00',
    status: 'Upcoming',
    designation: 'Pest Technician',
    rating: '3.5',
    location: 'California, United State',
    date: 'Tuesday, 11 March 2025 at 10:00 AM',
  },
  {
    id: 6,
    // profImg: images.map,
    username: 'Roland Hopper',
    price: '$79.00',
    status: 'Upcoming',
    designation: 'Pest Technician',
    rating: '3.5',
    location: 'California, United State',
    date: 'Tuesday, 11 March 2025 at 10:00 AM',
  },
  {
    id: 7,
    // profImg: images.map,
    username: 'Roland Hopper',
    price: '$79.00',
    status: 'Upcoming',
    designation: 'Pest Technician',
    rating: '3.5',
    location: 'California, United State',
    date: 'Tuesday, 11 March 2025 at 10:00 AM',
  },
  {
    id: 8,
    // profImg: images.map,
    username: 'Roland Hopper',
    price: '$79.00',
    status: 'Upcoming',
    designation: 'Pest Technician',
    rating: '3.5',
    location: 'California, United State',
    date: 'Tuesday, 11 March 2025 at 10:00 AM',
  },
];

const cardTwoData = [
  {
    id: 1,
    // profImg: images.map,
    username: 'Roland Hopper',
    price: '$79.00',
    status: 'Completed',
    designation: 'Pest Technician',
    rating: '3.5',
    location: 'California, United State',
    date: 'Tuesday, 11 March 2025 at 10:00 AM',
  },
  {
    id: 2,
    // profImg: images.map,
    username: 'Roland Hopper',
    price: '$79.00',
    status: 'Completed',
    designation: 'Pest Technician',
    rating: '3.5',
    location: 'California, United State',
    date: 'Tuesday, 11 March 2025 at 10:00 AM',
  },
  {
    id: 3,
    // profImg: images.map,
    username: 'Roland Hopper',
    price: '$79.00',
    status: 'Completed',
    designation: 'Pest Technician',
    rating: '3.5',
    location: 'California, United State',
    date: 'Tuesday, 11 March 2025 at 10:00 AM',
  },
  {
    id: 4,
    // profImg: images.map,
    username: 'Roland Hopper',
    price: '$79.00',
    status: 'Completed',
    designation: 'Pest Technician',
    rating: '3.5',
    location: 'California, United State',
    date: 'Tuesday, 11 March 2025 at 10:00 AM',
  },
  {
    id: 5,
    // profImg: images.map,
    username: 'Roland Hopper',
    price: '$79.00',
    status: 'Completed',
    designation: 'Pest Technician',
    rating: '3.5',
    location: 'California, United State',
    date: 'Tuesday, 11 March 2025 at 10:00 AM',
  },
  {
    id: 6,
    // profImg: images.map,
    username: 'Roland Hopper',
    price: '$79.00',
    status: 'Completed',
    designation: 'Pest Technician',
    rating: '3.5',
    location: 'California, United State',
    date: 'Tuesday, 11 March 2025 at 10:00 AM',
  },
  {
    id: 7,
    // profImg: images.map,
    username: 'Roland Hopper',
    price: '$79.00',
    status: 'Completed',
    designation: 'Pest Technician',
    rating: '3.5',
    location: 'California, United State',
    date: 'Tuesday, 11 March 2025 at 10:00 AM',
  },
  {
    id: 8,
    // profImg: images.map,
    username: 'Roland Hopper',
    price: '$79.00',
    status: 'Completed',
    designation: 'Pest Technician',
    rating: '3.5',
    location: 'California, United State',
    date: 'Tuesday, 11 March 2025 at 10:00 AM',
  },
];

const Appointments = () => {
  const nav = useNavigation();
  const { user } = useSelector(state => state.persistedData);
  const [selectedTab, setSelectedTab] = useState({ id: 1, initial: true });
  const [filterData, setFilterData] = useState([]);
  const [selectedCard, setSelectedCard] = useState({ id: 1 });
  const [getAllAppointments, { data, isLoading }] =
    useLazyGetAllAppointmentsQuery();

  console.log('appointment data >', filterData);

  useEffect(() => {
    if (user?._id && user?.type) {
      getAllAppointments({ id: user._id, type: user.type });
    }
  }, [user]);

  useEffect(() => {
    if (!data?.data || !selectedTab.initial) return;

    const filtered =
      data.data.requestForms?.filter(item => item.status === 'Pending') || [];

    setFilterData(filtered);
  }, [selectedTab, data]);

  // ✅ Split logic to handle tab change
  const splitAppointmentsByStatus = (statusTitle, id) => {
    setSelectedTab({ id, initial: false });

    let filtered = [];
    if (statusTitle === 'Pending Appointments') {
      filtered = data?.data?.requestForms?.filter(
        item => item.status === statusTitle.substring(0, 7),
      );
    } else {
      filtered = data?.data?.discussionForms?.filter(
        item => item.status === statusTitle.substring(0, 8),
      );
    }

    setFilterData(filtered || []);
  };

  return (
    <Container>
      <NormalHeader heading={'Appointments'} onBackPress={() => nav.goBack()} />
      <LineBreak val={2} />
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <View>
            {/* <FlatList
                    data={appointmentTypes}
                    horizontal
                    contentContainerStyle={{ flex: 1, gap: 0 }}
                    renderItem={({ item }) => {
                        return (
                            <TouchableOpacity
                                style={{
                                    backgroundColor:
                                        selectedAppointment.id == item.id
                                            ? colors.primary
                                            : AppColors.WHITE,
                                    paddingHorizontal: responsiveWidth(5),
                                    paddingVertical: responsiveHeight(1.2),
                                    borderRadius: 20,
                                    width: '60%',
                                }}
                                onPress={() => setSelectedAppointment({ id: item.id })}>
                                <AppText
                                    title={item.title}
                                    color={AppColors.BLACK}
                                    size={1.6}
                                    fontWeight={'bold'}
                                />
                            </TouchableOpacity>
                        );
                    }}
                /> */}
            <FlatList
              data={tabData}
              horizontal
              contentContainerStyle={{
                flex: 1,
                justifyContent: 'center',
                gap: 10,
              }}
              renderItem={({ item }) => {
                return (
                  <TouchableOpacity
                    style={{
                      backgroundColor:
                        selectedTab.id == item.id
                          ? colors.primary
                          : AppColors.WHITE,
                      paddingHorizontal: responsiveWidth(5),
                      paddingVertical: responsiveHeight(1.2),
                      borderRadius: 20,
                    }}
                    onPress={() =>
                      splitAppointmentsByStatus(item.title, item.id)
                    }
                  >
                    <AppText
                      title={item.title}
                      color={AppColors.BLACK}
                      size={1.6}
                      fontWeight={'bold'}
                    />
                  </TouchableOpacity>
                );
              }}
            />

            <LineBreak val={2} />

            <FlatList
              data={filterData}
              ListEmptyComponent={() => <AppText title={'No Appointments Found'} align={'center'} />}
              contentContainerStyle={{
                paddingHorizontal: responsiveWidth(4),
                gap: 15,
              }}
              ListFooterComponent={() => <LineBreak val={2} />}
              renderItem={({ item }) => {
                return (
                  <HistoryCard
                    item={{
                      id: item._id,
                      profImg: `${IMAGE_URL}${item.technicianId?.profileImage}`,
                      username: item.technicianId?.fullName,
                      price: item?.technicianId?.price || '$0.00',
                      status: item.status,
                      designation: item?.technicianId?.service?.name
                        ? `${item.technicianId?.service.name} Technician`
                        : 'No Service',
                      rating: item.technicianId?.avgRating || 0,
                      location: item.address,
                      date: `${moment(item.date, 'DD-MM-YYYY').format(
                        'dddd DD MMMM YYYY',
                      )} at ${item.time}`,
                    }}
                    myAppointments={true}
                    selectedCard={selectedCard}
                    onCardPress={() => setSelectedCard({ id: item._id })}
                    activeCardBgColor={AppColors.PRIMARY}
                  />
                );
              }}
            />

            {/* {selectedTab.id == 2 && (
              <FlatList
                data={cardTwoData}
                contentContainerStyle={{
                  paddingHorizontal: responsiveWidth(4),
                  gap: 15,
                }}
                ListFooterComponent={() => <LineBreak val={2} />}
                renderItem={({ item }) => {
                  return (
                    <HistoryCard
                      item={item}
                      selectedCard={selectedCard}
                      onCardPress={() => setSelectedCard({ id: item.id })}
                      activeCardBgColor={AppColors.PRIMARY}
                    />
                  );
                }}
              />
            )} */}
          </View>
        </>
      )}
    </Container>
  );
};

export default Appointments;
