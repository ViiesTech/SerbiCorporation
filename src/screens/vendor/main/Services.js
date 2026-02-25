import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Geolocation from 'react-native-geolocation-service';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-simple-toast';

import { images } from '../../../assets/images';
import {
  AppColors,
  DEFAULT_REGION,
  getProfileImage,
  responsiveHeight,
  responsiveWidth,
} from '../../../utils';
import AppText from '../../../components/AppText';
import AppButton from '../../../components/AppButton';
import LineBreak from '../../../components/LineBreak';
import Loader from '../../../components/Loader';
import {
  useLazyGetAppointmentDetailQuery,
  useUpdateRequestAppointmentMutation,
  useLazyGetDiscussionFormsQuery,
  useUpdateDiscussionMutation,
  useCreateUpdateProfileMutation,
} from '../../../redux/services/index';
import { MAP_API_KEY } from '../../../redux/constant';
import { colors } from '../../../assets/colors';

const Services = ({ route, navigation }) => {
  const { ids } = route?.params || {};
  const { user } = useSelector(state => state.persistedData);

  // --- State ---
  const [currentStatus, setCurrentStatus] = useState(null);
  const [eta, setEta] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [technicianLocation, setTechnicianLocation] = useState({
    latitude: user?.location?.coordinates?.[1],
    longitude: user?.location?.coordinates?.[0],
  });

  // --- API Hooks ---
  const [updateRequestAppointment, { isLoading: isUpdating }] =
    useUpdateRequestAppointmentMutation();
  const [updateDiscussion, { isLoading: isUpdatingDiscussion }] =
    useUpdateDiscussionMutation();
  const [getAppointmentDetail, { data, isLoading: appointmentLoader }] =
    useLazyGetAppointmentDetailQuery();
  const [
    getDiscussionForms,
    { data: discussionData, isLoading: discussionLoader },
  ] = useLazyGetDiscussionFormsQuery();
  const [createUpdateProfile] = useCreateUpdateProfileMutation();

  // --- Refs ---
  const mapRef = useRef(null);
  const watchId = useRef(null);
  const centeredMapRef = useRef(false);

  // --- Memoized Values ---
  const isDiscussion = useMemo(() => ids?.type === 'DISCUSSION', [ids?.type]);

  const statusFlow = useMemo(
    () =>
      isDiscussion
        ? ['Upcoming', 'Start', 'Stop', 'Completed', 'Paid']
        : ['Accepted', 'On The Way', 'Arrived'],
    [isDiscussion],
  );

  const nextStatus = useMemo(() => {
    const currentIndex = statusFlow.findIndex(s => s === currentStatus);
    return statusFlow[currentIndex + 1] || null;
  }, [currentStatus, statusFlow]);

  // --- Effects ---

  // 1. Initial Data Fetching
  useEffect(() => {
    if (ids?.requestFormId) {
      if (isDiscussion) {
        getDiscussionForms({
          id: user?._id,
          type: user?.type,
          status: ids?.status,
        });
      } else {
        getAppointmentDetail(ids.requestFormId);
      }
    }
  }, [
    ids?.requestFormId,
    isDiscussion,
    getDiscussionForms,
    getAppointmentDetail,
    user,
  ]);

  // 2. Sync Status from API data
  useEffect(() => {
    if (isDiscussion) {
      const currentForm = discussionData?.data?.find(
        item => item._id === ids?.requestFormId,
      );
      if (currentForm?.status) setCurrentStatus(currentForm.status);
    } else if (data?.data?.status) {
      setCurrentStatus(data.data.status);
    }
  }, [data, discussionData, isDiscussion, ids?.requestFormId]);

  // 3. Map Animation Logic
  useEffect(() => {
    if (
      ids?.coordinates?.lat &&
      technicianLocation?.latitude &&
      mapReady &&
      !centeredMapRef.current
    ) {
      const region = {
        latitude: (technicianLocation.latitude + ids.coordinates.lat) / 2,
        longitude: (technicianLocation.longitude + ids.coordinates.lng) / 2,
        latitudeDelta: 0.25,
        longitudeDelta: 0.25,
      };
      mapRef.current?.animateToRegion(region, 1000);
      centeredMapRef.current = true;
    }
  }, [
    mapReady,
    ids?.coordinates,
    technicianLocation?.latitude,
    technicianLocation?.longitude,
  ]);

  // 3.5 Initial Current Location
  useEffect(() => {
    const getCurrentLocation = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
      }

      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setTechnicianLocation({ latitude, longitude });
        },
        error => console.log('GetCurrentPosition Error:', error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    };

    getCurrentLocation();
  }, []);

  // 4. Geolocation Tracking
  useEffect(() => {
    const startTracking = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
      }

      watchId.current = Geolocation.watchPosition(
        async position => {
          const { latitude, longitude } = position.coords;
          setTechnicianLocation({ latitude, longitude });

          if (currentStatus === 'On The Way') {
            const userId = user?._id || user?.id;
            if (!userId) return;

            const formData = new FormData();
            formData.append('userId', String(userId));
            formData.append('latitude', String(latitude));
            formData.append('longitude', String(longitude));

            try {
              await createUpdateProfile(formData).unwrap();
            } catch (err) {
              console.error('TECH_TRACKING: Sync Error', err);
            }
          }
        },
        error => console.log('Geolocation Error:', error),
        {
          enableHighAccuracy: true,
          distanceFilter: 10,
          interval: 5000,
          fastestInterval: 2000,
        },
      );
    };

    if (currentStatus === 'On The Way') {
      startTracking();
    } else {
      if (watchId.current !== null) {
        Geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    }

    return () => {
      if (watchId.current !== null) Geolocation.clearWatch(watchId.current);
    };
  }, [currentStatus, user, createUpdateProfile]);

  // --- Handlers ---
  const onChangeStatus = useCallback(
    async (status, shouldNavigateBack = true) => {
      const payload = { formId: ids?.requestFormId, status };
      const mutation = isDiscussion
        ? updateDiscussion
        : updateRequestAppointment;

      try {
        const res = await mutation(payload).unwrap();
        setCurrentStatus(res.data?.status);
        Toast.show(`Status updated to ${status}`, Toast.SHORT);
        if (shouldNavigateBack) {
          setTimeout(() => navigation.goBack(), 500);
        }
      } catch (error) {
        Toast.show('Some problem occurred', Toast.SHORT);
      }
    },
    [
      ids?.requestFormId,
      isDiscussion,
      updateDiscussion,
      updateRequestAppointment,
      navigation,
    ],
  );

  const handlePress = () => onChangeStatus(nextStatus);

  const handleCompleteService = async () => {
    await onChangeStatus('Discussing', false);
    navigation.navigate('JobDiscussionForm', { ids });
  };

  const getStatusMessage = () => {
    switch (currentStatus) {
      case 'Accepted':
        return 'Payment received. Ready to start the journey.';
      case 'On The Way':
        return eta !== null
          ? `You're on the way. Estimated arrival in ${Math.round(eta)} mins`
          : 'Calculating ETA...';
      case 'Arrived':
        return "You've arrived at the customer's location.";
      case 'Upcoming':
        return 'Service is upcoming.';
      case 'Start':
        return 'Service started.';
      case 'Stop':
        return 'Service stopped.';
      case 'Completed':
        return 'Service completed.';
      case 'Paid':
        return 'Service paid.';
      default:
        return 'Waiting to start...';
    }
  };

  if (appointmentLoader || discussionLoader) {
    return (
      <Loader
        color={AppColors.PRIMARY}
        style={{ marginVertical: responsiveHeight(4) }}
      />
    );
  }

  // console.log('ids:---', ids);
  // console.log('technicianUser:---', user);
  return (
    <Fragment>
      {ids?.user?.location?.coordinates || user?.location?.coordinates ? (
        <MapView
          provider={Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE}
          ref={mapRef}
          onMapReady={() => setMapReady(true)}
          style={styles.map}
          initialRegion={
            ids?.coordinates
              ? {
                  latitude: ids.coordinates.lat,
                  longitude: ids.coordinates.lng,
                  latitudeDelta: 0.25,
                  longitudeDelta: 0.25,
                }
              : DEFAULT_REGION
          }
        >
          {technicianLocation?.latitude && (
            <Marker
              coordinate={technicianLocation}
              title="You (Technician)"
              description="Your current location"
              pinColor={AppColors.PRIMARY}
            />
          )}

          {ids?.coordinates && (
            <Marker
              coordinate={{
                latitude: ids.coordinates.lat,
                longitude: ids.coordinates.lng,
              }}
              title={ids?.user?.fullName || 'Customer'}
              description="Appointment location"
              pinColor={AppColors.PRIMARY}
            />
          )}

          {technicianLocation?.latitude && ids?.coordinates && (
            <MapViewDirections
              origin={technicianLocation}
              destination={{
                latitude: ids.coordinates.lat,
                longitude: ids.coordinates.lng,
              }}
              apikey={MAP_API_KEY}
              strokeWidth={4}
              strokeColor="#4285F4"
              mode="DRIVING"
              onReady={result => {
                setEta(result.duration);
                mapRef.current?.fitToCoordinates(result.coordinates, {
                  edgePadding: { top: 50, right: 50, bottom: 300, left: 50 },
                  animated: true,
                });
              }}
            />
          )}
        </MapView>
      ) : (
        <View style={styles.fallbackContainer}>
          <AppText
            title="Location data not available"
            size={2}
            align="center"
            color="#666"
          />
          <LineBreak val={1} />
          <AppText
            title="Unable to show map and directions"
            size={1.5}
            align="center"
            color="#999"
          />
        </View>
      )}

      {/* Info Card */}
      <View style={styles.bottomCard}>
        <View style={styles.cardHeader}>
          <View style={styles.userInfo}>
            <Image
              source={
                ids?.user?.profileImage
                  ? { uri: getProfileImage(ids.user.profileImage) }
                  : images.userProfile
              }
              style={styles.avatar}
            />
            <AppText fontWeight="bold" size={2.4} title={ids?.user?.fullName} />
          </View>
          <View style={styles.actionIcons}>
            <TouchableOpacity style={styles.iconBtn}>
              <FontAwesome name="phone" size={25} color={AppColors.BLACK} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="logo-wechat" size={25} color={AppColors.BLACK} />
            </TouchableOpacity>
          </View>
        </View>

        <LineBreak val={2} />
        <View style={styles.divider} />
        <LineBreak val={3} />

        <AppText size={2} align="center" title={getStatusMessage()} />
        <LineBreak val={3} />

        {nextStatus && (
          <AppButton
            handlePress={handlePress}
            textColor="black"
            textFontWeight="bold"
            alignSelf="center"
            isLoading={isUpdating || isUpdatingDiscussion}
            title={nextStatus.toUpperCase()}
            buttoWidth={80}
            bgColor="#A0CCD9"
            borderRadius={30}
          />
        )}

        {!nextStatus && currentStatus === 'Arrived' && (
          <TouchableOpacity
            onPress={handleCompleteService}
            style={styles.completeBtn}
          >
            <AppText
              title="SERVICE COMPLETED"
              color="#fff"
              size={2}
              fontWeight="bold"
              align="center"
            />
          </TouchableOpacity>
        )}
      </View>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  map: {
    height: responsiveHeight(100),
    width: responsiveWidth(100),
  },
  fallbackContainer: {
    height: responsiveHeight(100),
    width: responsiveWidth(100),
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  bottomCard: {
    backgroundColor: AppColors.WHITE,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderRadius: responsiveHeight(2),
    paddingHorizontal: responsiveHeight(2),
    height: responsiveHeight(28),
    paddingVertical: responsiveHeight(2),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveHeight(1.5),
  },
  avatar: {
    height: responsiveHeight(5),
    width: responsiveWidth(10),
    borderRadius: 100,
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveHeight(1),
  },
  iconBtn: {
    backgroundColor: colors.secondary_button,
    padding: responsiveHeight(0.7),
    paddingHorizontal: responsiveHeight(0.8),
    borderRadius: responsiveHeight(2),
  },
  divider: {
    backgroundColor: '#F5F5F5',
    height: 2,
    width: '100%',
  },
  completeBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: responsiveHeight(1.5),
    paddingHorizontal: responsiveWidth(10),
    borderRadius: 30,
    alignSelf: 'center',
    width: responsiveWidth(80),
  },
});

export default Services;

// import React, {
//   Fragment,
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from 'react';
// import {
//   View,
//   Image,
//   TouchableOpacity,
//   Platform,
//   PermissionsAndroid,
// } from 'react-native';
// import { images } from '../../../assets/images';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import FontAwesome from 'react-native-vector-icons/FontAwesome';
// import {
//   AppColors,
//   DEFAULT_REGION,
//   getProfileImage,
//   responsiveHeight,
//   responsiveWidth,
// } from '../../../utils';
// import AppText from '../../../components/AppText';
// import AppButton from '../../../components/AppButton';
// import LineBreak from '../../../components/LineBreak';
// import {
//   useLazyGetAppointmentDetailQuery,
//   useUpdateRequestAppointmentMutation,
//   useLazyGetDiscussionFormsQuery,
//   useUpdateDiscussionMutation,
//   useCreateUpdateProfileMutation,
// } from '../../../redux/services/index';
// import { IMAGE_URL, MAP_API_KEY } from '../../../redux/constant';
// import Toast from 'react-native-simple-toast';
// import Loader from '../../../components/Loader';
// import MapViewDirections from 'react-native-maps-directions';
// import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
// import { useSelector } from 'react-redux';
// import Geolocation from 'react-native-geolocation-service';

// const Services = ({ route, navigation }) => {
//   const [currentStatus, setCurrentStatus] = useState(null);
//   const [eta, setEta] = useState(null);
//   const { ids } = route?.params;
//   const { user } = useSelector(state => state.persistedData);
//   const [technicianLocation, setTechnicianLocation] = useState({
//     latitude: user?.location?.coordinates[1],
//     longitude: user?.location?.coordinates[0],
//   });
//   const [mapReady, setMapReady] = useState(false);
//   const [updateRequestAppointment, { isLoading: isUpdating }] =
//     useUpdateRequestAppointmentMutation();
//   const [updateDiscussion, { isLoading: isUpdatingDiscussion }] =
//     useUpdateDiscussionMutation();

//   const [getAppointmentDetail, { data, isLoading: appointmentLoader }] =
//     useLazyGetAppointmentDetailQuery();
//   const [
//     getDiscussionForms,
//     { data: discussionData, isLoading: discussionLoader },
//   ] = useLazyGetDiscussionFormsQuery();
//   const [createUpdateProfile] = useCreateUpdateProfileMutation();
//   const mapRef = useRef(null);
//   const watchId = useRef(null);

//   useEffect(() => {
//     if (
//       ids?.coordinates?.lat &&
//       ids?.coordinates?.lng &&
//       user?.location?.coordinates &&
//       mapReady
//     ) {
//       const region = {
//         latitude: (user.location.coordinates[1] + ids.coordinates.lat) / 2,
//         longitude: (user.location.coordinates[0] + ids.coordinates.lng) / 2,
//         latitudeDelta: 0.25,
//         longitudeDelta: 0.25,
//       };

//       mapRef.current?.animateToRegion(region, 1000);
//     }
//   }, [mapReady, ids?.coordinates, user?.location?.coordinates]);
//   // console.log(technicianLocation)

//   useEffect(() => {
//     const startTracking = async () => {
//       if (Platform.OS === 'android') {
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//         );
//         if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
//           return;
//         }
//       }

//       watchId.current = Geolocation.watchPosition(
//         async position => {
//           const { latitude, longitude } = position.coords;
//           console.log('Technician location updated:', latitude, longitude);
//           setTechnicianLocation({ latitude, longitude });

//           // Sync with server if "On The Way"
//           if (currentStatus === 'On The Way') {
//             const userId = user?._id || user?.id;
//             if (!userId) {
//               console.error('TECH_TRACKING: No User ID found for sync');
//               return;
//             }

//             const formData = new FormData();
//             formData.append('userId', String(userId));
//             formData.append('latitude', String(latitude));
//             formData.append('longitude', String(longitude));

//             console.log(
//               'TECH_TRACKING: Sending sync request for User:',
//               userId,
//             );

//             createUpdateProfile(formData)
//               .unwrap()
//               .then(res => {
//                 console.log('TECH_TRACKING: Location synced successfully', {
//                   lat: latitude,
//                   lng: longitude,
//                   msg: res.msg,
//                 });
//               })
//               .catch(err => {
//                 console.error('TECH_TRACKING: Sync Error', err);
//               });
//           }
//         },
//         error => console.log('Geolocation Error:', error),
//         {
//           enableHighAccuracy: true,
//           distanceFilter: 10,
//           interval: 5000,
//           fastestInterval: 2000,
//         },
//       );
//     };

//     if (currentStatus === 'On The Way') {
//       startTracking();
//     } else {
//       if (watchId.current !== null) {
//         Geolocation.clearWatch(watchId.current);
//         watchId.current = null;
//       }
//     }

//     return () => {
//       if (watchId.current !== null) {
//         Geolocation.clearWatch(watchId.current);
//       }
//     };
//   }, [currentStatus, user?._id, createUpdateProfile]);

//   useEffect(() => {
//     if (ids?.requestFormId) {
//       if (isDiscussion) {
//         getDiscussionForms({
//           id: user._id,
//           type: user.type,
//           status: ids.status,
//         });
//       } else {
//         getAppointmentDetail(ids.requestFormId);
//       }
//     }
//   }, [ids?.requestFormId, isDiscussion]);

//   const isDiscussion = ids?.type === 'DISCUSSION';
//   const statusFlow = isDiscussion
//     ? ['Upcoming', 'Start', 'Stop', 'Completed', 'Paid']
//     : ['Accepted', 'On The Way', 'Arrived'];

//   useEffect(() => {
//     if (isDiscussion) {
//       const currentForm = discussionData?.data?.find(
//         item => item._id === ids?.requestFormId,
//       );
//       if (currentForm?.status) {
//         setCurrentStatus(currentForm.status);
//       }
//     } else if (data?.data?.status) {
//       setCurrentStatus(data.data.status);
//     }
//   }, [data, discussionData, isDiscussion, ids?.requestFormId]);

//   const nextStatus = useMemo(() => {
//     const currentIndex = statusFlow.findIndex(s => s === currentStatus);
//     return statusFlow[currentIndex + 1] || null;
//   }, [currentStatus]);

//   const onChangeStatus = useCallback(
//     async (status, shouldNavigateBack = true) => {
//       // if (!status || status === currentStatus) return;
//       console.log('status ===>', status);
//       const payload = {
//         formId: ids?.requestFormId,
//         status: status,
//       };

//       const mutation = isDiscussion
//         ? updateDiscussion
//         : updateRequestAppointment;

//       await mutation(payload)
//         .unwrap()
//         .then(res => {
//           console.log('response of status ===>', res);
//           setCurrentStatus(res.data?.status);
//           Toast.show(`Status updated to ${status}`, Toast.SHORT);

//           if (shouldNavigateBack) {
//             // Navigate back to Home screen after successful update
//             setTimeout(() => {
//               navigation.goBack();
//             }, 500);
//           }
//         })
//         .catch(error => {
//           console.log('failed updating status ===>', error);
//           Toast.show('Some problem occurred', Toast.SHORT);
//         });
//     },
//     [
//       ids?.requestFormId,
//       updateRequestAppointment,
//       updateDiscussion,
//       isDiscussion,
//       currentStatus,
//       navigation,
//     ],
//   );

//   const handlePress = async () => {
//     await onChangeStatus(nextStatus);
//   };

//   const hadleCompleteService = async () => {
//     await onChangeStatus('Discussing', false);
//     navigation.navigate('JobDiscussionForm', { ids: ids });
//   };

//   // console.log(ids);
//   // console.log('IDS == appointment user', ids?.user);
//   // console.log('user == appointment user', nextStatus);
//   // console.log('nextStatus:-', nextStatus);
//   // console.log('data========>', data);
//   console.log('Appointment:- ', ids);
//   console.log('user coordinates:- ', user?.location?.coordinates);

//   return appointmentLoader || discussionLoader ? (
//     <Loader
//       color={AppColors.PRIMARY}
//       style={{ marginVertical: responsiveHeight(4) }}
//     />
//   ) : (
//     <Fragment>
//       {(ids?.user?.location?.coordinates || user?.location?.coordinates) && (
//         <MapView
//           provider={Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE}
//           ref={mapRef}
//           onMapReady={() => setMapReady(true)}
//           style={{
//             height: responsiveHeight(100),
//             width: responsiveWidth(100),
//           }}
//           initialRegion={
//             ids?.coordinates
//               ? {
//                   latitude: ids.coordinates.lat,
//                   longitude: ids.coordinates.lng,
//                   latitudeDelta: 0.05,
//                   longitudeDelta: 0.05,
//                 }
//               : DEFAULT_REGION
//           }
//         >
//           {/* Technician/Vendor Marker */}
//           {technicianLocation?.latitude && technicianLocation?.longitude && (
//             <Marker
//               coordinate={technicianLocation}
//               title="You (Technician)"
//               description="Your current location"
//               pinColor={AppColors.PRIMARY}
//             />
//           )}

//           {/* Customer/Appointment Marker */}
//           {ids?.coordinates && (
//             <Marker
//               coordinate={{
//                 latitude: ids.coordinates.lat,
//                 longitude: ids.coordinates.lng,
//               }}
//               title={ids?.user?.fullName || 'Customer'}
//               description="Appointment location"
//               pinColor={AppColors.PRIMARY}
//             />
//           )}

//           {/* Directions */}
//           {technicianLocation?.latitude &&
//             technicianLocation?.longitude &&
//             ids?.coordinates && (
//               <MapViewDirections
//                 origin={technicianLocation}
//                 mode="DRIVING"
//                 destination={{
//                   latitude: ids.coordinates.lat,
//                   longitude: ids.coordinates.lng,
//                 }}
//                 optimizeWaypoints={true}
//                 apikey={MAP_API_KEY}
//                 strokeWidth={4}
//                 strokeColor="#4285F4"
//                 onReady={result => {
//                   console.log(`Distance: ${result.distance} km`);
//                   console.log(`Duration: ${result.duration} min`);
//                   setEta(result.duration);

//                   // Fit map to show entire route
//                   if (mapRef.current) {
//                     mapRef.current.fitToCoordinates(result.coordinates, {
//                       edgePadding: {
//                         top: 50,
//                         right: 50,
//                         bottom: 300,
//                         left: 50,
//                       },
//                       animated: true,
//                     });
//                   }
//                 }}
//                 onError={error => {
//                   console.error('Directions Error:', error);
//                 }}
//               />
//             )}
//         </MapView>
//       )}

//       {/* Fallback when no coordinates available */}
//       {!ids?.user?.location?.coordinates && !user?.location?.coordinates && (
//         <View
//           style={{
//             height: responsiveHeight(100),
//             width: responsiveWidth(100),
//             backgroundColor: '#E0E0E0',
//             justifyContent: 'center',
//             alignItems: 'center',
//             padding: 20,
//           }}
//         >
//           <AppText
//             title="Location data not available"
//             size={2}
//             align="center"
//             color="#666"
//           />
//           <LineBreak val={1} />
//           <AppText
//             title="Unable to show map and directions"
//             size={1.5}
//             align="center"
//             color="#999"
//           />
//         </View>
//       )}

//       <View
//         style={{
//           backgroundColor: AppColors.WHITE,
//           position: 'absolute',
//           bottom: 0,
//           width: '100%',
//           borderRadius: responsiveHeight(2),
//           paddingHorizontal: responsiveHeight(2),
//           height: responsiveHeight(28),
//           paddingVertical: responsiveHeight(2),
//           // padding: responsiveHeight(2),
//         }}
//       >
//         <View
//           style={{
//             flexDirection: 'row',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//           }}
//         >
//           <View
//             style={{
//               flexDirection: 'row',
//               alignItems: 'center',
//               gap: responsiveHeight(1.5),
//             }}
//           >
//             <Image
//               source={
//                 ids?.user?.profileImage
//                   ? { uri: getProfileImage(ids?.user?.profileImage) }
//                   : images.userProfile
//               }
//               style={{
//                 height: responsiveHeight(5),
//                 width: responsiveWidth(10),
//                 borderRadius: 100,
//               }}
//             />
//             <AppText
//               fontWeight={'bold'}
//               size={2.4}
//               title={ids?.user?.fullName}
//             />
//           </View>
//           <View
//             style={{
//               flexDirection: 'row',
//               alignItems: 'center',
//               gap: responsiveHeight(1),
//             }}
//           >
//             <TouchableOpacity
//               style={{
//                 backgroundColor: AppColors.BGCOLOURS,
//                 padding: responsiveHeight(0.7),
//                 paddingHorizontal: responsiveHeight(0.8),
//                 borderRadius: responsiveHeight(2),
//               }}
//             >
//               <FontAwesome name="phone" size={25} color={AppColors.BLACK} />
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={{
//                 backgroundColor: AppColors.BGCOLOURS,
//                 padding: responsiveHeight(0.7),
//                 paddingHorizontal: responsiveHeight(0.8),
//                 borderRadius: responsiveHeight(2),
//               }}
//             >
//               <Ionicons name="logo-wechat" size={25} color={AppColors.BLACK} />
//             </TouchableOpacity>
//           </View>
//         </View>
//         <LineBreak val={2} />
//         <View
//           style={{ backgroundColor: '#F5F5F5', height: 2, width: '100%' }}
//         />
//         <LineBreak val={3} />
//         <AppText
//           size={2}
//           align={'center'}
//           // title="Youre on the way. Estimated arrival in 15 - 20 mins"
//           title={
//             currentStatus === 'Accepted'
//               ? 'Payment received. Ready to start the journey.'
//               : currentStatus === 'On The Way'
//               ? eta !== null
//                 ? `You're on the way. Estimated arrival in ${Math.round(
//                     eta,
//                   )} mins`
//                 : 'Calculating ETA...'
//               : currentStatus === 'Arrived'
//               ? "You've arrived at the customer's location."
//               : currentStatus === 'Upcoming'
//               ? 'Service is upcoming.'
//               : currentStatus === 'Start'
//               ? 'Service started.'
//               : currentStatus === 'Stop'
//               ? 'Service stopped.'
//               : currentStatus === 'Completed'
//               ? 'Service completed.'
//               : currentStatus === 'Paid'
//               ? 'Service paid.'
//               : 'Waiting to start...'
//           }
//         />
//         <LineBreak val={3} />

//         {/* Only show button if there's a next status */}
//         {nextStatus && (
//           <AppButton
//             handlePress={handlePress}
//             textColor="black"
//             textFontWeight="bold"
//             alignSelf={'center'}
//             isLoading={isUpdating || isUpdatingDiscussion}
//             title={nextStatus.toUpperCase()}
//             buttoWidth={80}
//             bgColor="#A0CCD9"
//             borderRadius={30}
//           />
//         )}

//         {/* Show completion message when no next status */}
//         {!nextStatus && currentStatus === 'Arrived' && (
//           <TouchableOpacity
//             onPress={hadleCompleteService}
//             style={{
//               backgroundColor: '#4CAF50',
//               paddingVertical: responsiveHeight(1.5),
//               paddingHorizontal: responsiveWidth(10),
//               borderRadius: 30,
//               alignSelf: 'center',
//               width: responsiveWidth(80),
//             }}
//           >
//             <AppText
//               title="SERVICE COMPLETED"
//               color="#fff"
//               size={2}
//               fontWeight="bold"
//               align="center"
//             />
//           </TouchableOpacity>
//         )}
//       </View>
//     </Fragment>
//   );
// };

// export default Services;
