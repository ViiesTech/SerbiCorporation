import {
  View,
  ImageBackground,
  Image,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { images } from '../../../assets/images';
import AppTextInput from './../../../components/AppTextInput';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {
  AppColors,
  DEFAULT_REGION,
  getProfileImage,
  responsiveHeight,
  responsiveWidth,
} from '../../../utils';
import AppText from '../../../components/AppText';
import Payment from './../../user/main/Payment';
import AppButton from '../../../components/AppButton';
import LineBreak from '../../../components/LineBreak';
import {
  useLazyGetAppointmentDetailQuery,
  useUpdateRequestAppointmentMutation,
  useLazyGetDiscussionFormsQuery,
  useUpdateDiscussionMutation,
  useCreateUpdateProfileMutation,
} from '../../../redux/services/index';
import { IMAGE_URL, MAP_API_KEY } from '../../../redux/constant';
import Toast from 'react-native-simple-toast';
import Loader from '../../../components/Loader';
import MapViewDirections from 'react-native-maps-directions';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSelector } from 'react-redux';
import Geolocation from 'react-native-geolocation-service';

const Services = ({ route, navigation }) => {
  const [currentStatus, setCurrentStatus] = useState(null);
  const [eta, setEta] = useState(null);
  const { ids } = route?.params;
  const { user } = useSelector(state => state.persistedData);
  const [technicianLocation, setTechnicianLocation] = useState({
    latitude: user?.location?.coordinates[1],
    longitude: user?.location?.coordinates[0],
  });
  const [mapReady, setMapReady] = useState(false);
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
  const mapRef = useRef(null);
  const watchId = useRef(null);

  console.log('data========>', data);

  console.log('Appointment coordinates:- ', ids);

  // const userLocation = {
  //   latitude: ids?.user?.location?.coordinates[1],
  //   longitude: ids?.user?.location?.coordinates[0],
  // };
  // return (
  //   <>
  //     <Loader
  //       color={AppColors.PRIMARY}
  //       style={{ marginVertical: responsiveHeight(4) }}
  //     />
  //   </>
  // );
  useEffect(() => {
    if (
      ids?.coordinates?.lat &&
      ids?.coordinates?.lng &&
      user?.location?.coordinates &&
      mapReady
    ) {
      const region = {
        latitude: (user.location.coordinates[1] + ids.coordinates.lat) / 2,
        longitude: (user.location.coordinates[0] + ids.coordinates.lng) / 2,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

      mapRef.current?.animateToRegion(region, 1000);
    }
  }, [mapReady, ids?.coordinates, user?.location?.coordinates]);
  // console.log(technicianLocation)

  useEffect(() => {
    const startTracking = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          return;
        }
      }

      watchId.current = Geolocation.watchPosition(
        async position => {
          const { latitude, longitude } = position.coords;
          console.log('Technician location updated:', latitude, longitude);
          setTechnicianLocation({ latitude, longitude });

          // Sync with server if "On The Way"
          if (currentStatus === 'On The Way') {
            const userId = user?._id || user?.id;
            if (!userId) {
              console.error('TECH_TRACKING: No User ID found for sync');
              return;
            }

            const formData = new FormData();
            formData.append('userId', String(userId));
            formData.append('latitude', String(latitude));
            formData.append('longitude', String(longitude));

            console.log(
              'TECH_TRACKING: Sending sync request for User:',
              userId,
            );

            createUpdateProfile(formData)
              .unwrap()
              .then(res => {
                console.log('TECH_TRACKING: Location synced successfully', {
                  lat: latitude,
                  lng: longitude,
                  msg: res.msg,
                });
              })
              .catch(err => {
                console.error('TECH_TRACKING: Sync Error', err);
              });
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
      if (watchId.current !== null) {
        Geolocation.clearWatch(watchId.current);
      }
    };
  }, [currentStatus, user?._id, createUpdateProfile]);

  useEffect(() => {
    if (ids?.requestFormId) {
      if (isDiscussion) {
        getDiscussionForms({
          id: user._id,
          type: user.type,
          status: ids.status,
        });
      } else {
        getAppointmentDetail(ids.requestFormId);
      }
    }
  }, [ids?.requestFormId, isDiscussion]);

  // useEffect(() => {
  //   if (!data?.data?.status) return;
  //   if (data?.data?.status !== 'Pending') {
  //     setCurrentStatus(data?.data?.status);
  //   }
  // }, [data]);

  const isDiscussion = ids?.type === 'DISCUSSION';
  const statusFlow = isDiscussion
    ? ['Upcoming', 'Start', 'Stop', 'Completed', 'Paid']
    : ['Accepted', 'On The Way', 'Arrived'];

  useEffect(() => {
    if (isDiscussion) {
      const currentForm = discussionData?.data?.find(
        item => item._id === ids?.requestFormId,
      );
      if (currentForm?.status) {
        setCurrentStatus(currentForm.status);
      }
    } else if (data?.data?.status) {
      setCurrentStatus(data.data.status);
    }
  }, [data, discussionData, isDiscussion, ids?.requestFormId]);

  const nextStatus = useMemo(() => {
    const currentIndex = statusFlow.findIndex(s => s === currentStatus);
    return statusFlow[currentIndex + 1] || null;
  }, [currentStatus]);

  // console.log('user == appointment user', nextStatus);

  console.log('nextStatus:-', nextStatus);

  const onChangeStatus = useCallback(
    async (status, shouldNavigateBack = true) => {
      // if (!status || status === currentStatus) return;
      console.log('status ===>', status);
      const payload = {
        formId: ids?.requestFormId,
        status: status,
      };

      const mutation = isDiscussion
        ? updateDiscussion
        : updateRequestAppointment;

      await mutation(payload)
        .unwrap()
        .then(res => {
          console.log('response of status ===>', res);
          setCurrentStatus(res.data?.status);
          Toast.show(`Status updated to ${status}`, Toast.SHORT);

          if (shouldNavigateBack) {
            // Navigate back to Home screen after successful update
            setTimeout(() => {
              navigation.goBack();
            }, 500);
          }
        })
        .catch(error => {
          console.log('failed updating status ===>', error);
          Toast.show('Some problem occurred', Toast.SHORT);
        });
    },
    [
      ids?.requestFormId,
      updateRequestAppointment,
      updateDiscussion,
      isDiscussion,
      currentStatus,
      navigation,
    ],
  );

  const handlePress = async () => {
    await onChangeStatus(nextStatus);
  };

  const hadleCompleteService = async () => {
    await onChangeStatus('Discussing', false);
    navigation.navigate('JobDiscussionForm', { ids: ids });
  };

  // console.log(ids);
  console.log('IDS == appointment user', ids?.user);

  return appointmentLoader || discussionLoader ? (
    <Loader
      color={AppColors.PRIMARY}
      style={{ marginVertical: responsiveHeight(4) }}
    />
  ) : (
    <>
      {(ids?.user?.location?.coordinates || user?.location?.coordinates) && (
        <MapView
          provider={Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE}
          ref={mapRef}
          onMapReady={() => {
            console.log('Map is ready!');
            setMapReady(true);
          }}
          style={{
            height: responsiveHeight(100),
            width: responsiveWidth(100),
          }}
          initialRegion={
            ids?.coordinates
              ? {
                  latitude: ids.coordinates.lat,
                  longitude: ids.coordinates.lng,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }
              : DEFAULT_REGION
          }
        >
          {/* Technician/Vendor Marker */}
          {technicianLocation?.latitude && technicianLocation?.longitude && (
            <Marker
              coordinate={technicianLocation}
              title="You (Technician)"
              description="Your current location"
              pinColor={AppColors.PRIMARY}
            />
          )}

          {/* Customer/Appointment Marker */}
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

          {/* Directions */}
          {technicianLocation?.latitude &&
            technicianLocation?.longitude &&
            ids?.coordinates && (
              <MapViewDirections
                origin={technicianLocation}
                mode="DRIVING"
                destination={{
                  latitude: ids.coordinates.lat,
                  longitude: ids.coordinates.lng,
                }}
                optimizeWaypoints={true}
                apikey={MAP_API_KEY}
                strokeWidth={4}
                strokeColor="#4285F4"
                onReady={result => {
                  console.log(`Distance: ${result.distance} km`);
                  console.log(`Duration: ${result.duration} min`);
                  setEta(result.duration);

                  // Fit map to show entire route
                  if (mapRef.current) {
                    mapRef.current.fitToCoordinates(result.coordinates, {
                      edgePadding: {
                        top: 50,
                        right: 50,
                        bottom: 300,
                        left: 50,
                      },
                      animated: true,
                    });
                  }
                }}
                onError={error => {
                  console.error('Directions Error:', error);
                }}
              />
            )}
        </MapView>
      )}

      {/* Fallback when no coordinates available */}
      {!ids?.user?.location?.coordinates && !user?.location?.coordinates && (
        <View
          style={{
            height: responsiveHeight(100),
            width: responsiveWidth(100),
            backgroundColor: '#E0E0E0',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
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
      {/* <ImageBackground
      style={{ flex: 1, padding: responsiveHeight(2) }}
      source={images.mapbg}
    > */}
      {/* <AppTextInput
        containerBg={AppColors.WHITE}
        inputWidth={77}
        rightIcon={<Ionicons name="search-outline" size={25} />}
        inputPlaceHolder="What are you looking for?"
        placeholderTextColor="#777777"
        borderRadius={25}
      /> */}
      <View
        style={{
          backgroundColor: AppColors.WHITE,
          position: 'absolute',
          bottom: 0,
          width: '100%',
          borderRadius: responsiveHeight(2),
          paddingHorizontal: responsiveHeight(2),
          height: responsiveHeight(28),
          paddingVertical: responsiveHeight(2),
          // padding: responsiveHeight(2),
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: responsiveHeight(1.5),
            }}
          >
            <Image
              source={
                ids?.user?.profileImage
                  ? { uri: getProfileImage(ids?.user?.profileImage) }
                  : images.userProfile
              }
              // source={
              //   ids?.user?.profileImage
              //     ? { uri: `${IMAGE_URL}${ids.user.profileImage}` }
              //     : images.userProfile
              // }
              style={{
                height: responsiveHeight(5),
                width: responsiveWidth(10),
                borderRadius: 100,
              }}
            />
            <AppText
              fontWeight={'bold'}
              size={2.4}
              title={ids?.user?.fullName}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: responsiveHeight(1),
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: AppColors.BGCOLOURS,
                padding: responsiveHeight(0.7),
                paddingHorizontal: responsiveHeight(0.8),
                borderRadius: responsiveHeight(2),
              }}
            >
              <FontAwesome name="phone" size={25} color={AppColors.BLACK} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: AppColors.BGCOLOURS,
                padding: responsiveHeight(0.7),
                paddingHorizontal: responsiveHeight(0.8),
                borderRadius: responsiveHeight(2),
              }}
            >
              <Ionicons name="logo-wechat" size={25} color={AppColors.BLACK} />
            </TouchableOpacity>
          </View>
        </View>
        <LineBreak val={2} />
        <View
          style={{ backgroundColor: '#F5F5F5', height: 2, width: '100%' }}
        />
        <LineBreak val={3} />
        <AppText
          size={2}
          align={'center'}
          // title="Youre on the way. Estimated arrival in 15 - 20 mins"
          title={
            currentStatus === 'Accepted'
              ? 'Payment received. Ready to start the journey.'
              : currentStatus === 'On The Way'
              ? eta !== null
                ? `You're on the way. Estimated arrival in ${Math.round(
                    eta,
                  )} mins`
                : 'Calculating ETA...'
              : currentStatus === 'Arrived'
              ? "You've arrived at the customer's location."
              : currentStatus === 'Upcoming'
              ? 'Service is upcoming.'
              : currentStatus === 'Start'
              ? 'Service started.'
              : currentStatus === 'Stop'
              ? 'Service stopped.'
              : currentStatus === 'Completed'
              ? 'Service completed.'
              : currentStatus === 'Paid'
              ? 'Service paid.'
              : 'Waiting to start...'
          }
        />
        <LineBreak val={3} />

        {/* Only show button if there's a next status */}
        {nextStatus && (
          <AppButton
            handlePress={handlePress}
            textColor="black"
            textFontWeight="bold"
            alignSelf={'center'}
            isLoading={isUpdating || isUpdatingDiscussion}
            title={nextStatus.toUpperCase()}
            buttoWidth={80}
            bgColor="#A0CCD9"
            borderRadius={30}
          />
        )}

        {/* Show completion message when no next status */}
        {!nextStatus && currentStatus === 'Arrived' && (
          <TouchableOpacity
            onPress={hadleCompleteService}
            style={{
              backgroundColor: '#4CAF50',
              paddingVertical: responsiveHeight(1.5),
              paddingHorizontal: responsiveWidth(10),
              borderRadius: 30,
              alignSelf: 'center',
              width: responsiveWidth(80),
            }}
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

      {/* </ImageBackground> */}
    </>
  );
};

export default Services;
