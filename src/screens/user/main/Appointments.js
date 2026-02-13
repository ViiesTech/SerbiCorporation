import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, TouchableOpacity, View, StyleSheet } from 'react-native';
import Container from '../../../components/Container';
import NormalHeader from '../../../components/NormalHeader';
import LineBreak from '../../../components/LineBreak';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import {
  AppColors,
  getProfileImage,
  responsiveHeight,
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

const REQUESTED_STATUS = [
  'Paid',
  'On The Way',
  'Arrived',
  'Completed',
  // 'Pending',
];
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
  }, [user, isFocused]);

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
          (item.status === 'Accepted' && item.paymentStatus === 'Paid'),
      );
    }

    return sourceData.filter(item => item.status === currentStatus);
  }, [sourceData, selectedStatusIndex]);

  console.log('Appointments:-', data);
  // console.log('filteredAppointments:-', filteredAppointments);
  return (
    <Container>
      <NormalHeader heading="Appointments" onBackPress={() => nav.goBack()} />
      <LineBreak val={2} />

      {isLoading ? (
        <Loader />
      ) : (
        <>
          {/* Top Tabs */}
          <FlatList
            data={TAB_DATA}
            horizontal
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.topTabsContainer}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.topTabButton,
                  selectedTab === item.title && styles.activeTopTab,
                ]}
                onPress={() => {
                  setSelectedTab(item.title);
                  setSelectedStatusIndex(0);
                }}
              >
                <AppText title={item.title} fontWeight="bold" size={1.8} />
              </TouchableOpacity>
            )}
          />

          <LineBreak val={2} />

          {/* Status Tabs */}
          <FlatList
            horizontal
            keyExtractor={(item, index) => index.toString()}
            data={statusList}
            contentContainerStyle={styles.statusTabsContainer}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  index === selectedStatusIndex && styles.activeStatusButton,
                ]}
                onPress={() => setSelectedStatusIndex(index)}
              >
                <AppText
                  title={item}
                  color={
                    index === selectedStatusIndex
                      ? AppColors.WHITE
                      : AppColors.BLACK
                  }
                />
              </TouchableOpacity>
            )}
          />

          <LineBreak val={2} />

          {/* Appointments List */}
          <FlatList
            data={filteredAppointments}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={() => (
              <AppText title="No Appointments Found" align="center" />
            )}
            ListFooterComponent={() => <LineBreak val={2} />}
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
  topTabsContainer: {
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: responsiveWidth(4),
  },
  topTabButton: {
    backgroundColor: AppColors.WHITE,
    paddingHorizontal: responsiveWidth(10),
    paddingVertical: responsiveHeight(1.2),
    borderRadius: 20,
  },
  activeTopTab: {
    backgroundColor: colors.primary,
  },
  statusTabsContainer: {
    gap: responsiveHeight(1),
    paddingHorizontal: responsiveWidth(4),
  },
  statusButton: {
    backgroundColor: AppColors.WHITE,
    borderWidth: 1,
    borderColor: AppColors.BLACK,
    paddingHorizontal: responsiveWidth(8),
    paddingVertical: responsiveHeight(1.2),
    borderRadius: 20,
  },
  activeStatusButton: {
    backgroundColor: colors.black,
  },
  listContainer: {
    paddingHorizontal: responsiveWidth(4),
    gap: 15,
  },
});

// import React, { useEffect, useState } from 'react';
// import { FlatList, TouchableOpacity, View } from 'react-native';
// import Container from '../../../components/Container';
// import NormalHeader from '../../../components/NormalHeader';
// import LineBreak from '../../../components/LineBreak';
// import {
//   TabRouter,
//   useIsFocused,
//   useNavigation,
// } from '@react-navigation/native';
// import {
//   AppColors,
//   getProfileImage,
//   responsiveHeight,
//   responsiveWidth,
// } from '../../../utils';
// import AppText from '../../../components/AppText';
// import HistoryCard from '../../../components/HistoryCard';
// import { colors } from '../../../assets/colors';
// import { useLazyGetAllAppointmentsQuery } from '../../../redux/services';
// import { useSelector } from 'react-redux';
// import Loader from '../../../components/Loader';
// import { IMAGE_URL } from '../../../redux/constant';
// import moment from 'moment';
// import AppTextInput from '../../../components/AppTextInput';

// // const appointmentTypes = [
// //     { id: 1, title: 'REQUESTED' },
// //     { id: 2, title: 'DISCUSSION' },
// // ];

// const tabData = [
//   // { id: 1, title: 'TODAY' },
//   // { id: 2, title: 'YESTERDAY' },
//   { id: 1, title: 'REQUESTED' },
//   { id: 2, title: 'DISCUSSION' },
// ];

// const data2 = [
//   {
//     id: 1,
//     sub_title: 'Pending',
//   },
//   {
//     id: 2,
//     sub_title: 'On The Way',
//   },
//   {
//     id: 3,
//     sub_title: 'Arrived',
//   },
//   {
//     id: 4,
//     sub_title: 'Accepted',
//   },
// ];

// const data3 = [
//   {
//     id: 1,
//     sub_title: 'Upcoming',
//   },
//   {
//     id: 2,
//     sub_title: 'Start',
//   },
//   {
//     id: 3,
//     sub_title: 'Stop',
//   },
//   {
//     id: 4,
//     sub_title: 'Completed',
//   },
// ];

// const Appointments = () => {
//   const nav = useNavigation();
//   const { user } = useSelector(state => state.persistedData);
//   const [selectedTab, setSelectedTab] = useState('REQUESTED');
//   const [filterData, setFilterData] = useState([]);
//   const [selectedCard, setSelectedCard] = useState({ id: 1 });
//   const [subCategory, setSubCategory] = useState(0);
//   const [getAllAppointments, { data, isLoading }] =
//     useLazyGetAllAppointmentsQuery();
//   const isFocused = useIsFocused();

//   console.log('appointment data >', filterData);

//   useEffect(() => {
//     if (user?._id && user?.type) {
//       getAllAppointments({ id: user._id, type: user.type });
//     }
//   }, [user, isFocused]);

//   useEffect(() => {
//     setSubCategory(0);

//     let sourceData = [];
//     if (selectedTab === 'REQUESTED') {
//       sourceData = data?.data?.requestForms || [];
//     } else if (selectedTab === 'DISCUSSION') {
//       sourceData = data?.data?.discussionForms || [];
//     }

//     const firstTab =
//       selectedTab === 'REQUESTED' ? data2[0].sub_title : data3[0].sub_title;

//     const filtered = sourceData.filter(item => item.status === firstTab);
//     setFilterData(filtered);
//   }, [selectedTab, data]);

//   // ✅ Split logic to handle tab change
//   // const splitAppointmentsByStatus = (statusTitle, id) => {
//   //   setSelectedTab({ id, initial: false });

//   //   let filtered = [];
//   //   if (statusTitle === 'Pending Appointments') {
//   //     filtered = data?.data?.requestForms?.filter(
//   //       item => item.status === statusTitle.substring(0, 7),
//   //     );
//   //   } else {
//   //     filtered = data?.data?.discussionForms?.filter(
//   //       item => item.status === statusTitle.substring(0, 8),
//   //     );
//   //   }

//   //   setFilterData(filtered || []);
//   // };

//   const splitAppointmentsByStatus = (statusTitle, index) => {
//     setSubCategory(index);

//     let sourceData = [];
//     if (selectedTab === 'REQUESTED') {
//       sourceData = data?.data?.requestForms || [];
//     } else if (selectedTab === 'DISCUSSION') {
//       sourceData = data?.data?.discussionForms || [];
//     }

//     const filtered = sourceData.filter(item => item.status == statusTitle);

//     setFilterData(filtered);
//   };

//   const getDisplayData = () => {
//     if (subCategory !== null) return filterData;

//     if (selectedTab === 'REQUESTED') {
//       return data?.data?.requestForms || [];
//     }
//     return data?.data?.discussionForms || [];
//   };

//   return (
//     <Container>
//       <NormalHeader heading={'Appointments'} onBackPress={() => nav.goBack()} />
//       <LineBreak val={2} />
//       {isLoading ? (
//         <Loader />
//       ) : (
//         <>
//           <View>
//             {/* <FlatList
//                     data={appointmentTypes}
//                     horizontal
//                     contentContainerStyle={{ flex: 1, gap: 0 }}
//                     renderItem={({ item }) => {
//                         return (
//                             <TouchableOpacity
//                                 style={{
//                                     backgroundColor:
//                                         selectedAppointment.id == item.id
//                                             ? colors.primary
//                                             : AppColors.WHITE,
//                                     paddingHorizontal: responsiveWidth(5),
//                                     paddingVertical: responsiveHeight(1.2),
//                                     borderRadius: 20,
//                                     width: '60%',
//                                 }}
//                                 onPress={() => setSelectedAppointment({ id: item.id })}>
//                                 <AppText
//                                     title={item.title}
//                                     color={AppColors.BLACK}
//                                     size={1.6}
//                                     fontWeight={'bold'}
//                                 />
//                             </TouchableOpacity>
//                         );
//                     }}
//                 /> */}
//             <FlatList
//               data={tabData}
//               horizontal
//               contentContainerStyle={{
//                 flex: 1,
//                 justifyContent: 'center',
//                 gap: 10,
//               }}
//               renderItem={({ item }) => {
//                 return (
//                   <TouchableOpacity
//                     style={{
//                       backgroundColor:
//                         selectedTab == item.title
//                           ? colors.primary
//                           : AppColors.WHITE,
//                       paddingHorizontal: responsiveWidth(11),
//                       paddingVertical: responsiveHeight(1.2),
//                       borderRadius: 20,
//                       alignItems: 'center',
//                     }}
//                     onPress={
//                       () => setSelectedTab(item.title)
//                       // splitAppointmentsByStatus(item.title, item.id)
//                     }
//                   >
//                     <AppText
//                       title={item.title}
//                       color={AppColors.BLACK}
//                       size={1.8}
//                       fontWeight={'bold'}
//                     />
//                   </TouchableOpacity>
//                 );
//               }}
//             />

//             <LineBreak val={2} />
//             <View>
//               <FlatList
//                 showsHorizontalScrollIndicator={false}
//                 // style={{ marginHorizontal: responsiveHeight(-3) }}
//                 contentContainerStyle={{
//                   gap: responsiveHeight(1),
//                   marginTop: responsiveHeight(1),
//                   paddingHorizontal: responsiveHeight(3),
//                 }}
//                 data={selectedTab === 'REQUESTED' ? data2 : data3}
//                 horizontal
//                 renderItem={({ item, index }) => {
//                   return (
//                     <TouchableOpacity
//                       onPress={() =>
//                         splitAppointmentsByStatus(item.sub_title, index)
//                       }
//                       style={{
//                         backgroundColor:
//                           index == subCategory ? colors.black : AppColors.WHITE,
//                         borderWidth: 1,
//                         borderColor: '#000',
//                         paddingHorizontal: responsiveWidth(11),
//                         paddingVertical: responsiveHeight(1.2),
//                         borderRadius: 20,
//                         alignItems: 'center',
//                       }}
//                     >
//                       <AppText
//                         color={index === subCategory ? '#fff' : '#000'}
//                         title={item.sub_title}
//                       />
//                     </TouchableOpacity>
//                   );
//                 }}
//               />
//             </View>
//             <LineBreak val={2} />
//             <FlatList
//               data={getDisplayData()}
//               ListEmptyComponent={() => (
//                 <AppText title={'No Appointments Found'} align={'center'} />
//               )}
//               contentContainerStyle={{
//                 paddingHorizontal: responsiveWidth(4),
//                 gap: 15,
//               }}
//               ListFooterComponent={() => <LineBreak val={2} />}
//               renderItem={({ item }) => {
//                 return (
//                   <HistoryCard
//                     item={{
//                       id: item._id,
//                       profImg: getProfileImage(item.technicianId?.profileImage),
//                       // profImg: item.technicianId?.isGoogleUser ? `${item.technicianId?.profileImage}` : `${IMAGE_URL}${item.technicianId?.profileImage}`,
//                       username: item.technicianId?.fullName,
//                       price:
//                         `$${item?.technicianId?.price || item?.amount}` ||
//                         '$0.00',
//                       status: item.status,
//                       designation: 'Pest Technician',
//                       rating: item.technicianId?.avgRating || 0,
//                       location: item.address,
//                       date: `${moment(item.date, 'DD-MM-YYYY').format(
//                         'dddd DD MMMM YYYY',
//                       )} at ${item.time}`,
//                     }}
//                     myAppointments={true}
//                     selectedCard={selectedCard}
//                     onCardPress={() => {
//                       // return console.log('api appointments',item)
//                       // if (item.status === 'Pending') {
//                       nav.navigate('ServicesProfile', {
//                         profileData: {
//                           ...item.technicianId,
//                           appointmentData: {
//                             status: item.status,
//                             id: item._id,
//                             date: item.date,
//                             time: item.time,
//                             address: item.address,
//                             type: selectedTab,
//                           },
//                           previousScreen: 'Appointments',
//                         },
//                       });
//                       // }
//                       setSelectedCard({ id: item._id });
//                     }}
//                     activeCardBgColor={AppColors.PRIMARY}
//                   />
//                 );
//               }}
//             />

//             {/* {selectedTab.id == 2 && (
//               <FlatList
//                 data={cardTwoData}
//                 contentContainerStyle={{
//                   paddingHorizontal: responsiveWidth(4),
//                   gap: 15,
//                 }}
//                 ListFooterComponent={() => <LineBreak val={2} />}
//                 renderItem={({ item }) => {
//                   return (
//                     <HistoryCard
//                       item={item}
//                       selectedCard={selectedCard}
//                       onCardPress={() => setSelectedCard({ id: item.id })}
//                       activeCardBgColor={AppColors.PRIMARY}
//                     />
//                   );
//                 }}
//               />
//             )} */}
//           </View>
//         </>
//       )}
//     </Container>
//   );
// };

// export default Appointments;
