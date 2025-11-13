import { View, ImageBackground, Image, TouchableOpacity } from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { images } from '../../../assets/images';
import AppTextInput from './../../../components/AppTextInput';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { AppColors, responsiveHeight, responsiveWidth } from '../../../utils';
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

const Services = ({ route, navigation }) => {
  const [currentStatus, setCurrentStatus] = useState(null);
  const [eta, setEta] = useState(null);
  const { ids } = route?.params;
  const [updateRequestAppointment, { isLoading }] =
    useUpdateRequestAppointmentMutation();
  const [getAppointmentDetail, { data, isLoading: appointmentLoader }] =
    useLazyGetAppointmentDetailQuery();
  console.log('ids', ids);

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

  const statusFlow = ['On The Way', 'Arrived', 'Accepted'];

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
    // if (!nextStatus) {
    //   navigation.navigate('JobDiscussionForm', { ids });
    //   return;
    // }
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
      {/* <MapView
        provider={PROVIDER_GOOGLE}
        style={{
          height: responsiveHeight(50),
          width: responsiveWidth(100),
        }}
        initialRegion={{
          latitude: (destination.latitude + technicianLocation.latitude) / 2,
          longitude:
            (destination.longitude + technicianLocation.longitude) / 2,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        }}>
      
              <Marker
                  coordinate={technicianLocation}
                  title="Technician"
                  pinColor="blue"
                />
      
                <Marker coordinate={destination} title="You" pinColor="green" />
                <MapViewDirections
                  origin={technicianLocation}
                  mode="DRIVING"
                  destination={destination}
                  // lineCap="round"
                  // lineJoin="round"
                  optimizeWaypoints={true}
                  apikey={MAP_API_KEY}
                  strokeWidth={4}
                  strokeColor={'#4296f5'}
                  onReady={result => {
                    console.log(`Distance: ${result.distance} km`);
                    console.log(`Duration: ${result.duration} min`);
                    setEta(result.duration);
                  }}
                  onError={error => {
                    console.error('Directions Error:', error);
                  }}
                /> 
      </MapView> */}
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
          alignSelf: 'center',
          bottom: 20,
          borderRadius: responsiveHeight(2),
          padding: responsiveHeight(2),
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
                  ? { uri: `${IMAGE_URL}${ids.user.profileImage}` }
                  : images.userProfile
              }
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
          title="Youre on the way. Estimated arrival in 15 - 20 mins"
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
