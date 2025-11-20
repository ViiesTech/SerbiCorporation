import { View, ImageBackground, Image, TouchableOpacity } from 'react-native';
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
} from '../../../redux/services/index';
import { IMAGE_URL, MAP_API_KEY } from '../../../redux/constant';
import Toast from 'react-native-simple-toast';
import Loader from '../../../components/Loader';
import MapViewDirections from 'react-native-maps-directions';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSelector } from 'react-redux';

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
  const [updateRequestAppointment, { isLoading }] =
    useUpdateRequestAppointmentMutation();
  const [getAppointmentDetail, { data, isLoading: appointmentLoader }] =
    useLazyGetAppointmentDetailQuery();
  const mapRef = useRef(null);
  // console.log('technician == current user', technicianLocation);

  // const userLocation = {
  //   latitude: ids?.user?.location?.coordinates[1],
  //   longitude: ids?.user?.location?.coordinates[0],
  // };

  useEffect(() => {
    if (
      user?.location?.coordinates &&
      ids?.user?.location?.coordinates &&
      mapReady
    ) {
      const region = {
        latitude:
          (user.location.coordinates[1] + ids.user.location.coordinates[1]) / 2,
        longitude:
          (user.location.coordinates[0] + ids.user.location.coordinates[0]) / 2,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      };

      mapRef.current?.animateToRegion(region, 1000);
    }
  }, [mapReady, ids?.user?.location?.coordinates]);
  // console.log(technicianLocation)

  useEffect(() => {
    const interval = setInterval(() => {
      setTechnicianLocation(prev => {
        const latDiff = ids?.user?.location?.coordinates[1] - prev.latitude;
        const lngDiff = ids?.user?.location?.coordinates[0] - prev.longitude;

        // Stop when very close
        if (Math.abs(latDiff) < 0.0001 && Math.abs(lngDiff) < 0.0001) {
          // alert('hello')
          clearInterval(interval);
          return prev;
        }

        return {
          latitude: prev.latitude + latDiff * 0.01,
          longitude: prev.longitude + lngDiff * 0.01,
        };
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [ids?.user?.location?.coordinates]);

  useEffect(() => {
    if (ids?.requestFormId) {
      getAppointmentDetail(ids.requestFormId);
    }
  }, [ids?.requestFormId]);

  // useEffect(() => {
  //   if (!data?.data?.status) return;
  //   if (data?.data?.status !== 'Pending') {
  //     setCurrentStatus(data?.data?.status);
  //   }
  // }, [data]);

  const statusFlow = ['On The Way', 'Arrived', 'Accepted', 'Proceed'];

  useEffect(() => {
    if (ids?.requestFormId) getAppointmentDetail(ids.requestFormId);
  }, [ids?.requestFormId]);

  useEffect(() => {
    if (data?.data?.status) {
      setCurrentStatus(data.data.status);
    }
  }, [data]);

  const nextStatus = useMemo(() => {
    const currentIndex = statusFlow.findIndex(s => s === currentStatus);
    return statusFlow[currentIndex + 1] || null;
  }, [currentStatus]);

  console.log('user == appointment user', nextStatus);

  // console.log('nnext', nextStatus);

  const onChangeStatus = useCallback(
    async status => {
      if (!status || status === currentStatus) return;
      console.log('status ===>', status);
      const data = {
        formId: ids?.requestFormId,
        status: status,
      };

      await updateRequestAppointment(data)
        .unwrap()
        .then(res => {
          console.log('response of status ===>', res);
          setCurrentStatus(res.data?.status);
        })
        .catch(error => {
          console.log('failed updating status ===>', error);
          Toast.show('Some problem occurred', 2000, Toast.SHORT);
        });
    },
    [ids?.requestFormId, updateRequestAppointment, currentStatus],
  );

  const handlePress = async () => {
    if (nextStatus === 'Accepted') {
      navigation.navigate('JobDiscussionForm', { ids });
      await onChangeStatus(nextStatus);
      return;
    }
    await onChangeStatus(nextStatus);
  };

  // console.log(ids);

  return appointmentLoader ? (
    <Loader
      color={AppColors.PRIMARY}
      style={{ marginVertical: responsiveHeight(4) }}
    />
  ) : (
    <>
      {ids?.user?.location?.coordinates && user?.location?.coordinates && (
        <MapView
          provider={PROVIDER_GOOGLE}
          ref={mapRef}
          onMapReady={() => setMapReady(true)}
          style={{
            height: responsiveHeight(100),
            width: responsiveWidth(100),
          }}
          initialRegion={DEFAULT_REGION}
        >
          <Marker
            coordinate={technicianLocation}
            title="You"
            pinColor="green"
          />

          <Marker
            coordinate={{
              latitude: ids?.user?.location?.coordinates[1],
              longitude: ids?.user?.location?.coordinates[0],
            }}
            title={ids?.user?.fullName}
            pinColor="blue"
          />
          <MapViewDirections
            origin={technicianLocation}
            mode="DRIVING"
            destination={{
              latitude: ids?.user?.location?.coordinates[1],
              longitude: ids?.user?.location?.coordinates[0],
            }}
            // lineCap="round"
            // lineJoin="round"
            optimizeWaypoints={true}
            apikey={MAP_API_KEY}
            strokeWidth={4}
            strokeColor={AppColors.Yellow}
            onReady={result => {
              console.log(`Distance: ${result.distance} km`);
              console.log(`Duration: ${result.duration} min`);
              setEta(result.duration);
            }}
            onError={error => {
              console.error('Directions Error:', error);
            }}
          />
        </MapView>
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
            currentStatus === 'On The Way'
              ? eta !== null
                ? `You’re on the way. Estimated arrival in ${Math.round(
                    eta,
                  )} mins`
                : 'Calculating ETA...'
              : currentStatus === 'Arrived'
              ? 'You’ve arrived at the customer’s location.'
              : currentStatus === 'Accepted'
              ? 'Proceed with the service.'
              : 'Waiting to start...'
          }
        />
        <LineBreak val={3} />
        <AppButton
          handlePress={handlePress}
          //   {
          //   let nextStatus = null;
          //   if (currentStatus === 'ON THE WAY') {
          //     nextStatus = 'On The Way';
          //   } else if (currentStatus === 'Arrived') {
          //     nextStatus = 'Arrived';
          //   } else if (currentStatus === 'Proceed') {
          //     nextStatus = 'Accepted'
          //   }
          //   else {
          //     navigation.navigate('JobDiscussionForm', { ids });
          //     return;
          //   }

          //   setCurrentStatus(nextStatus);
          //   await onChangeStatus(nextStatus);
          // }
          textColor="black"
          textFontWeight="bold"
          alignSelf={'center'}
          isLoading={isLoading}
          title={
            nextStatus === 'Accepted'
              ? 'PROCEED'
              : nextStatus
              ? nextStatus?.toUpperCase()
              : 'PENDING'
          }
          buttoWidth={80}
          bgColor="#A0CCD9"
          borderRadius={30}
        />
      </View>

      {/* </ImageBackground> */}
    </>
  );
};

export default Services;
