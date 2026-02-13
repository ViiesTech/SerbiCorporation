import React, { useEffect, useState, useCallback } from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AppColors,
  getProfileImage,
  responsiveHeight,
  responsiveWidth,
} from './../../../utils';
import { images } from '../../../assets/images';
import AppText from '../../../components/AppText';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import SVGIcon from '../../../components/SVGIcon';
import icons from '../../../assets/icons';
import AppTextInput from '../../../components/AppTextInput';
import LineBreak from '../../../components/LineBreak';
import HistoryCard from './../../../components/HistoryCard';
import { firstTimeVisit } from '../../../redux/slices';
import { useDispatch, useSelector } from 'react-redux';
import {
  useLazyGetAllAppointmentsQuery,
  useLazyGetAllReviewsQuery,
} from '../../../redux/services';
import Loader from '../../../components/Loader';
import moment from 'moment';
import { useIsFocused } from '@react-navigation/native';
import Toast from 'react-native-simple-toast';
import { IMAGE_URL } from '../../../redux/constant';
import { status } from 'express/lib/response';
import { SafeAreaView } from 'react-native-safe-area-context';

const categoryTabs = [
  { id: 1, title: 'REQUESTED' },
  { id: 2, title: 'DISCUSSION' },
];

const requestedStatuses = [
  { id: 1, sub_title: 'Accepted', display: 'Paid' }, // Backend status: Accepted, UI shows: Paid
  { id: 2, sub_title: 'On The Way', display: 'On The Way' },
  { id: 3, sub_title: 'Arrived', display: 'Arrived' },
];

const discussionStatuses = [
  { id: 1, sub_title: 'Upcoming' },
  { id: 2, sub_title: 'Start' },
  { id: 3, sub_title: 'Stop' },
  { id: 4, sub_title: 'Completed' },
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

  // Fetch on screen focus
  useEffect(() => {
    if (isFocused && user?._id) {
      getAllAppointments({ id: user._id, type: user?.type });
      getAllReviews(user._id);
    }
  }, [isFocused, user]);

  // Remove login success screen after 5 sec
  useEffect(() => {
    if (firstVisit) {
      const timer = setTimeout(() => {
        dispatch(firstTimeVisit(false));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [firstVisit, dispatch]);

  // Reset to first tab when category changes or when search is cleared/started
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
  const displayData = React.useMemo(() => {
    const source = getSourceData();
    let filtered = [...source];

    // 1. Filter by Status (Tabs)
    const statuses =
      currentCategory === 'REQUESTED' ? requestedStatuses : discussionStatuses;
    const currentStatusConfig = statuses[subCategory] || statuses[0];

    // Important: Filter by currentStatusConfig.sub_title ("Accepted", "On The Way", etc.)
    // Case-insensitive comparison for robustness
    filtered = filtered.filter(
      item =>
        item?.status?.toLowerCase() ===
        currentStatusConfig.sub_title.toLowerCase(),
    );

    // 2. Filter by Search (within the selected status)
    if (search.trim()) {
      filtered = filtered.filter(
        item =>
          item?.userId?.fullName
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          item?.userId?.locationName
            ?.toLowerCase()
            .includes(search.toLowerCase()),
      );
    }

    return filtered;
  }, [getSourceData, currentCategory, subCategory, search]);

  const splitAppointmentsByStatus = (statusTitle, index) => {
    setSubCategory(index);
    // No need to manually filter, useMemo handles it
  };

  const getDisplayData = () => {
    return displayData;
  };

  if (firstVisit) {
    return (
      <View style={styles.loginContainer}>
        <Image
          resizeMode="cover"
          style={styles.successImg}
          source={images.success}
        />
        <LineBreak val={2} />
        <AppText title="Action Success" />
        <LineBreak val={2} />
        <AppText fontWeight="bold" size={2.8} title="LOGIN SUCCESS" />
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
            <Image
              style={styles.profileImg}
              borderRadius={100}
              source={
                user?.profileImage
                  ? { uri: getProfileImage(user.profileImage) }
                  : images.userProfile
              }
            />
            <View>
              <View style={styles.row}>
                <AppText title="GOOD MORNING!" />
                <SVGIcon height={20} width={20} xml={icons.plant} />
              </View>
              <View style={styles.rowSmall}>
                <SVGIcon height={20} width={20} xml={icons.locationPin} />
                <AppText
                  color="#777"
                  noOfLine={1}
                  textWidth={50}
                  title={user?.locationName || 'No location found'}
                />
              </View>
            </View>
          </View>

          <View style={styles.iconRow}>
            <TouchableOpacity
              onPress={() => navigation.navigate('AppSettings')}
            >
              <Feather name="settings" size={25} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('MainProfile')}
            >
              <Feather name="user" size={25} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <AppTextInput
          inputWidth={77}
          value={search}
          onChangeText={setSearch}
          rightIcon={<Ionicons name="search-outline" size={25} />}
          inputPlaceHolder="What are you looking for?"
          placeholderTextColor="#777"
          borderRadius={25}
        />

        <LineBreak val={2} />
        <AppText title="APPOINTMENTS" fontWeight="bold" size={2.4} />

        {/* Category Tabs */}
        {!search && (
          <FlatList
            horizontal
            data={categoryTabs}
            keyExtractor={item => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabContainer}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setCurrentCategory(item.title)}
                style={[
                  styles.tab,
                  item.title === currentCategory && styles.activeTab,
                ]}
              >
                <AppText
                  color={item.title === currentCategory ? '#fff' : '#000'}
                  title={item.title}
                />
              </TouchableOpacity>
            )}
          />
        )}

        <LineBreak val={2} />

        {/* Status Tabs */}
        <FlatList
          horizontal
          data={
            currentCategory === 'REQUESTED'
              ? requestedStatuses
              : discussionStatuses
          }
          keyExtractor={item => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabContainer}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => splitAppointmentsByStatus(item.sub_title, index)}
              // onPress={() => console.log('item:-', item)}
              style={[
                styles.smallTab,
                index === subCategory && styles.activeTab,
              ]}
            >
              <AppText
                color={index === subCategory ? '#fff' : '#000'}
                title={item.display || item.sub_title}
              />
            </TouchableOpacity>
          )}
        />

        {/* List */}
        <View style={{ marginTop: responsiveHeight(2) }}>
          {isLoading ? (
            <Loader />
          ) : (
            <FlatList
              data={getDisplayData()}
              keyExtractor={item => item._id}
              contentContainerStyle={{
                gap: responsiveHeight(2),
              }}
              ListEmptyComponent={() => (
                <AppText align="center" title="No Appointments Found" />
              )}
              renderItem={({ item }) => {
                const ids = {
                  requestFormId: item._id,
                  technicianId: item.technicianId,
                  serviceId: item.serviceId,
                  user: item.userId,
                  type: currentCategory,
                  status: item.status,
                  coordinates: {
                    lat: item?.latitude,
                    lng: item?.longitude,
                  },
                };
                console.log('item:-', ids);

                return (
                  <HistoryCard
                    onCardPress={() => {
                      // console.log('item:-', item);
                      if (item.status === 'Completed') {
                        const review = reviewsData?.data?.find(
                          r => r.userId?._id === item.userId?._id,
                        );

                        if (review) {
                          navigation.navigate('ClientReview', {
                            reviewData: review,
                          });
                        } else {
                          Toast.show('No Feedback Found', Toast.SHORT);
                        }
                      } else {
                        navigation.navigate('Services', {
                          ids: {
                            requestFormId: item._id,
                            technicianId: item.technicianId,
                            serviceId: item.serviceId,
                            user: item.userId,
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
                    }}
                    item={{
                      id: item._id,
                      profImg: item.userId?.profileImage
                        ? `${IMAGE_URL}${item.userId?.profileImage}`
                        : '',
                      username: item.userId?.fullName,
                      location: item.userId?.locationName,
                      status: moment(item.createdAt).calendar(),
                      date: moment(item.createdAt).format('ddd, MMM D'),
                      fullTime: item.time,
                    }}
                    appointment
                  />
                );
              }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#f8f9fd',
    padding: responsiveHeight(2),
  },
  container: {
    // flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveHeight(2),
  },
  profileImg: {
    width: responsiveWidth(16.4),
    height: responsiveHeight(7.5),
  },
  row: {
    flexDirection: 'row',
    gap: responsiveHeight(1),
  },
  rowSmall: {
    flexDirection: 'row',
    gap: responsiveHeight(0.5),
  },
  iconRow: {
    flexDirection: 'row',
    gap: responsiveHeight(1.5),
  },
  tabContainer: {
    height: responsiveHeight(5),
    gap: responsiveHeight(1),
    marginTop: responsiveHeight(1),
    // backgroundColor: 'red',
  },
  tab: {
    height: responsiveHeight(5),
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: responsiveHeight(3),
    padding: responsiveHeight(0.8),
    width: responsiveWidth(44),
    alignItems: 'center',
  },
  smallTab: {
    height: responsiveHeight(5),
    width: responsiveWidth(29),
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: responsiveHeight(3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#000',
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
});

// import {
//   FlatList,
//   Image,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { useEffect, useState } from 'react';
// import {
//   AppColors,
//   getProfileImage,
//   responsiveHeight,
//   responsiveWidth,
// } from './../../../utils/index';
// import { images } from '../../../assets/images';
// import AppText from '../../../components/AppText';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import Feather from 'react-native-vector-icons/Feather';
// import SVGIcon from '../../../components/SVGIcon';
// import icons from '../../../assets/icons';
// import AppTextInput from '../../../components/AppTextInput';
// import LineBreak from '../../../components/LineBreak';
// import HistoryCard from './../../../components/HistoryCard';
// import { firstTimeVisit } from '../../../redux/slices';
// import { useDispatch, useSelector } from 'react-redux';
// import { colors } from '../../../assets/colors';
// import { IMAGE_URL } from '../../../redux/constant';
// import {
//   useLazyGetAllAppointmentsQuery,
//   useLazyGetAllReviewsQuery,
// } from '../../../redux/services';
// import Loader from '../../../components/Loader';
// import moment from 'moment';
// import { useIsFocused } from '@react-navigation/native';
// import Toast from 'react-native-simple-toast';
// const cardsData = [
//   { id: 1, title: 'Roland Hopper' },
//   { id: 2, title: 'Alexis Clark' },
//   { id: 3, title: 'Richard h.' },
//   { id: 4, title: 'dakota west' },
//   { id: 5, title: 'LEon Carroll' },
// ];

// const data1 = [
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

// const Home = ({ navigation }) => {
//   const [currentCategory, setCurrentCategory] = useState('REQUESTED');
//   const [subCategory, setSubCategory] = useState(0);
//   const [currentCard, setCurrentCard] = useState('Roland Hopper');
//   const { firstVisit, user } = useSelector(state => state.persistedData);
//   const [getAllAppointments, { data, isLoading }] =
//     useLazyGetAllAppointmentsQuery();
//   const [filterStatusData, setFilterStatusData] = useState([]);
//   const [getAllReviews, { data: reviewsData }] = useLazyGetAllReviewsQuery();
//   const [search, setSearch] = useState('');

//   const dispatch = useDispatch();
//   console.log('status filteration ===>', filterStatusData);
//   console.log('review Data ===>', user);
//   const combinedTabs = [...data2, ...data3];

//   const isFocused = useIsFocused();

//   useEffect(() => {
//     if (isFocused) {
//       getAllAppointments({ id: user?._id, type: user?.type });
//       getAllReviews(user?._id);
//     }
//   }, [isFocused]);

//   useEffect(() => {
//     setSubCategory(0);

//     let sourceData = [];
//     if (currentCategory === 'REQUESTED') {
//       sourceData = data?.data?.requestForms || [];
//     } else if (currentCategory === 'DISCUSSION') {
//       sourceData = data?.data?.discussionForms || [];
//     }

//     const firstTab =
//       currentCategory === 'REQUESTED' ? data2[0].sub_title : data3[0].sub_title;

//     const filtered = sourceData.filter(item => item.status === firstTab);
//     setFilterStatusData(filtered);
//   }, [currentCategory, data]);

//   useEffect(() => {
//     setTimeout(() => {
//       dispatch(firstTimeVisit(false));
//     }, 5000);
//   }, [firstVisit]);

//   const showLoginMessage = () => {
//     return (
//       <View
//         style={{
//           justifyContent: 'center',
//           alignItems: 'center',
//           flex: 1,
//           backgroundColor: colors.white,
//         }}
//       >
//         <Image
//           resizeMode="cover"
//           style={{ height: responsiveHeight(13), width: responsiveHeight(13) }}
//           source={images.success}
//         />
//         <LineBreak val={2} />
//         <AppText title={'Action Success'} />
//         <LineBreak val={2} />
//         <AppText fontWeight={'bold'} size={2.8} title={'LOGIN SUCCESS'} />
//       </View>
//     );
//   };

//   const splitAppointmentsByStatus = (statusTitle, index) => {
//     setSubCategory(index);

//     let sourceData = [];
//     if (currentCategory === 'REQUESTED') {
//       sourceData = data?.data?.requestForms || [];
//     } else if (currentCategory === 'DISCUSSION') {
//       sourceData = data?.data?.discussionForms || [];
//     }

//     const filtered = sourceData.filter(item => item.status == statusTitle);

//     setFilterStatusData(filtered);
//   };

//   const onSearchFilter = () => {
//     const requested = data?.data?.requestForms || [];
//     const discussion = data?.data?.discussionForms || [];

//     // Combine both
//     const combined = [...requested, ...discussion];

//     const filtered = combined.filter(
//       item =>
//         item?.userId?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
//         item?.userId?.locationName
//           ?.toLowerCase()
//           .includes(search.toLowerCase()),
//     );

//     setFilterStatusData(filtered);
//   };

//   const getDisplayData = () => {
//     if (search.length > 0) return filterStatusData;

//     if (subCategory !== null) return filterStatusData;

//     if (currentCategory === 'REQUESTED') {
//       return data?.data?.requestForms || [];
//     }
//     return data?.data?.discussionForms || [];
//   };

//   // console.log('display data ===>', getDisplayData());

//   if (firstVisit) {
//     return showLoginMessage();
//   }

//   return (
//     <ScrollView
//       showsVerticalScrollIndicator={false}
//       contentContainerStyle={{
//         backgroundColor: '#f8f9fd',
//         flexGrow: 1,
//         padding: responsiveHeight(2),
//       }}
//     >
//       <View
//         style={{
//           flexDirection: 'row',
//           marginBottom: 20,
//           justifyContent: 'space-between',
//           alignItems: 'center',
//         }}
//       >
//         <View
//           style={{
//             flexDirection: 'row',
//             gap: responsiveHeight(2),
//             alignItems: 'center',
//           }}
//         >
//           <Image
//             style={{
//               width: responsiveWidth(16.4),
//               height: responsiveHeight(7.5),
//             }}
//             borderRadius={100}
//             source={
//               user?.profileImage
//                 ? { uri: getProfileImage(user?.profileImage) }
//                 : images.userProfile
//             }
//             // source={
//             //   user?.profileImage
//             //     ? { uri: `${IMAGE_URL}${user.profileImage}` }
//             //     : images.userProfile
//             // }
//           />
//           <View>
//             <View style={{ flexDirection: 'row', gap: responsiveHeight(1) }}>
//               <AppText title="GOOD MORNING!" />
//               <SVGIcon height={20} width={20} xml={icons.plant} />
//             </View>
//             <View style={{ flexDirection: 'row', gap: responsiveHeight(0.5) }}>
//               <SVGIcon height={20} width={20} xml={icons.locationPin} />
//               <AppText
//                 color={'#777777'}
//                 noOfLine={1}
//                 textWidth={50}
//                 title={user?.locationName || 'No location found'}
//               />
//             </View>
//           </View>
//         </View>
//         <View style={{ flexDirection: 'row', gap: responsiveHeight(1.5) }}>
//           <TouchableOpacity onPress={() => navigation.navigate('AppSettings')}>
//             <Feather name="settings" size={25} />
//           </TouchableOpacity>
//           <TouchableOpacity onPress={() => navigation.navigate('MainProfile')}>
//             <Feather name="user" size={25} />
//           </TouchableOpacity>
//         </View>
//       </View>

//       <AppTextInput
//         inputWidth={77}
//         value={search}
//         onChangeText={text => setSearch(text)}
//         rightIcon={
//           <TouchableOpacity onPress={() => onSearchFilter()}>
//             <Ionicons name="search-outline" size={25} />
//           </TouchableOpacity>
//         }
//         inputPlaceHolder="What are you looking for?"
//         placeholderTextColor="#777777"
//         borderRadius={25}
//       />
//       <LineBreak val={2} />
//       <AppText title="APPOINTMENTS" fontWeight="bold" size={2.4} />
//       {search.length < 1 && (
//         <View>
//           <FlatList
//             showsHorizontalScrollIndicator={false}
//             style={{ marginHorizontal: responsiveHeight(-3) }}
//             contentContainerStyle={{
//               gap: responsiveHeight(1),
//               marginTop: responsiveHeight(1),
//               paddingHorizontal: responsiveHeight(3),
//             }}
//             data={data1}
//             horizontal
//             renderItem={({ item, index }) => {
//               return (
//                 <TouchableOpacity
//                   onPress={() => setCurrentCategory(item.title)}
//                   style={{
//                     backgroundColor:
//                       item.title === currentCategory ? '#000' : '#fff',
//                     borderWidth: 1,
//                     borderColor: '#000',
//                     width: responsiveWidth(45),
//                     alignItems: 'center',
//                     borderRadius: responsiveHeight(3),
//                     padding: responsiveHeight(0.8),
//                   }}
//                 >
//                   <AppText
//                     color={item.title === currentCategory ? '#fff' : '#000'}
//                     title={item.title}
//                   />
//                 </TouchableOpacity>
//               );
//             }}
//           />
//         </View>
//       )}
//       <LineBreak val={2} />
//       <View>
//         <FlatList
//           showsHorizontalScrollIndicator={false}
//           style={{ marginHorizontal: responsiveHeight(-3) }}
//           contentContainerStyle={{
//             gap: responsiveHeight(1),
//             marginTop: responsiveHeight(1),
//             paddingHorizontal: responsiveHeight(3),
//           }}
//           data={
//             search.length > 0
//               ? combinedTabs
//               : currentCategory === 'REQUESTED'
//               ? data2
//               : data3
//           }
//           horizontal
//           renderItem={({ item, index }) => {
//             return (
//               <TouchableOpacity
//                 onPress={() => splitAppointmentsByStatus(item.sub_title, index)}
//                 style={{
//                   backgroundColor: index === subCategory ? '#000' : '#fff',
//                   borderWidth: 1,
//                   borderColor: '#000',
//                   width: responsiveWidth(29),
//                   alignItems: 'center',
//                   borderRadius: responsiveHeight(3),
//                   padding: responsiveHeight(0.6),
//                 }}
//               >
//                 <AppText
//                   color={index === subCategory ? '#fff' : '#000'}
//                   title={item.sub_title}
//                 />
//               </TouchableOpacity>
//             );
//           }}
//         />
//       </View>
//       <View style={{ marginTop: responsiveHeight(2) }}>
//         {isLoading ? (
//           <Loader style={{ marginVertical: responsiveHeight(3) }} />
//         ) : (
//           <FlatList
//             contentContainerStyle={{ gap: responsiveHeight(2) }}
//             ListEmptyComponent={() => (
//               <AppText align={'center'} title={'No Appointments Found'} />
//             )}
//             data={getDisplayData()}
//             renderItem={({ item, index }) => {
//               return (
//                 <HistoryCard
//                   onCardPress={() => {
//                     setCurrentCard(item._id);
//                     // console.log('items ===>',item)
//                     if (
//                       item.status === 'Upcoming' ||
//                       item.status === 'Start' ||
//                       item.status === 'Stop' ||
//                       item.status === 'Rejected'
//                     ) {
//                       navigation.navigate('StartJob', {
//                         status: item.status,
//                         formId: item._id,
//                       });
//                     } else if (item.status === 'Completed') {
//                       let filterData = reviewsData?.data?.find(
//                         review => review.userId?._id == item.userId?._id,
//                       );
//                       // return console.log('filterData ===>',filterData)
//                       if (filterData) {
//                         // alert('hel')
//                         navigation.navigate('ClientReview', {
//                           reviewData: filterData,
//                         });
//                       } else {
//                         Toast.show('No Feedback Found', Toast.SHORT);
//                       }
//                     } else {
//                       navigation.navigate('Services', {
//                         ids: {
//                           requestFormId: item._id,
//                           technicianId: item.technicianId,
//                           serviceId: item.serviceId,
//                           user: item.userId,
//                         },
//                         // status: item.status,
//                       });
//                     }
//                   }}
//                   item={{
//                     id: item._id,
//                     profImg: `${IMAGE_URL}${item.userId?.profileImage}`,
//                     username: item.userId?.fullName,
//                     // designation: 'Expert Gerdener',
//                     // rating: '3.5',
//                     location: item.userId.locationName,
//                     status: moment(item.createdAt).calendar(null, {
//                       sameDay: '[TODAY]',
//                       lastDay: '[YESTERDAY]',
//                       lastWeek: 'dddd',
//                       sameElse: 'MMM D',
//                     }),
//                     date: moment(item.createdAt).format('ddd, MMM D'),
//                     fullTime: item.time,
//                   }}
//                   selectedCard={{ id: currentCard }}
//                   activeCardBgColor={
//                     item._id === currentCard
//                       ? AppColors.PRIMARY
//                       : AppColors.WHITE
//                   }
//                   appointment={true}
//                   // profiles={'profiles'}
//                   isHideClose={false}
//                   isShowBadge={true}
//                   viewDetailsHandlePress={() => navigation.navigate('Services')}
//                 />
//               );
//             }}
//           />
//         )}
//       </View>
//     </ScrollView>
//   );
// };

// export default Home;

// const styles = StyleSheet.create({});
