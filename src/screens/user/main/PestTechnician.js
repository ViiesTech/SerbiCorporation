import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Container from '../../../components/Container';
import { useNavigation } from '@react-navigation/native';
import NormalHeader from '../../../components/NormalHeader';
import LineBreak from '../../../components/LineBreak';
import { Image } from 'react-native';
import { images } from '../../../assets/images';
import { AppColors, responsiveHeight, responsiveWidth } from '../../../utils';
import Icon from 'react-native-vector-icons/Feather';
import AppText from '../../../components/AppText';
import { colors } from '../../../assets/colors';
import AppButton from '../../../components/AppButton';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSelector } from 'react-redux';
import { IMAGE_URL, MAP_API_KEY } from '../../../redux/constant';
import MapViewDirections from 'react-native-maps-directions';
import Geolocation from 'react-native-geolocation-service';
import { useLazyGetAppointmentDetailQuery } from '../../../redux/services';

const PestTechnician = ({ route }) => {
  const nav = useNavigation();
  const { user } = useSelector(state => state.persistedData);
  const [step, setStep] = useState(0);
  const [eta, setEta] = useState(null);
  const technicianData = route?.params?.pest_tech;
  const [technicianLocation, setTechnicianLocation] = useState({
    longitude: technicianData?.location?.coordinates[0],
    latitude: technicianData?.location?.coordinates[1],
  });
  const [getAppointmentDetail, { data, isLoading }] =
    useLazyGetAppointmentDetailQuery();

  // console.log('hello',technicianData.appointmentData.id)
  const id = technicianData?.appointmentData?.id;
  console.log(data?.data?.status);
  //  const [mapRegion, setMapRegion] = useState({
  //   latitude: (destination.latitude + technicianLocation.latitude) / 2,
  //   longitude: (destination.longitude + technicianLocation.longitude) / 2,
  //   latitudeDelta: 0.015,
  //   longitudeDelta: 0.0121,
  // });

  // useEffect(() => {
  //   if (technicianLocation && destination) {
  //     setMapRegion({
  //       latitude: (destination.latitude + technicianLocation.latitude) / 2,
  //       longitude: (destination.longitude + technicianLocation.longitude) / 2,
  //       latitudeDelta: 0.015,
  //       longitudeDelta: 0.0121,
  //     });
  //   }
  // }, [technicianLocation, destination]);

  // console.log(technicianLocation)

  // Progress values mapped to steps
  const steps = [0.1, 0.4, 0.7, 1.0];
  const destination = {
    longitude: user?.location?.coordinates[0],
    latitude: user?.location?.coordinates[1],
  };

  // useEffect(() => {
  //   let watchId;

  //   const startWatching = async () => {
  //     if (Platform.OS === 'android') {
  //       const granted = await PermissionsAndroid.request(
  //         PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  //       );
  //       if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
  //     }

  //     watchId = Geolocation.watchPosition(
  //       position => {
  //         const { latitude, longitude } = position.coords;
  //         setTechnicianLocation({ longitude, latitude });
  //       },
  //       error => console.log('WatchPosition Error:', error),
  //       {
  //         enableHighAccuracy: true,
  //         distanceFilter: 10,
  //         interval: 5000,
  //         fastestInterval: 2000,
  //       },
  //     );
  //   };

  //   startWatching();

  //   return () => {
  //     if (watchId != null) Geolocation.clearWatch(watchId);
  //   };
  // }, []);

  //   console.log(technicianData.location?.coordinates);

  useEffect(() => {
    if (!id) return;

    getAppointmentDetail(id);

    const interval = setInterval(() => {
      getAppointmentDetail(id);
    }, 10000);

    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (data?.data?.status) {
      console.log('Updated status:', data.data.status);

      switch (data.data.status) {
        case 'On The Way':
          setStep(0);
          break;
        case 'Arrived':
          setStep(1);
          break;
        case 'Discussing':
          setStep(2);
          break;
        case 'Accepted':
          setStep(3);
          break;
        default:
          break;
      }
    }
  }, [data]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTechnicianLocation(prev => {
        const latDiff = destination.latitude - prev.latitude;
        const lngDiff = destination.longitude - prev.longitude;

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
  }, [destination]);

  // const nextStep = () => {
  //   const next = (step + 1) % steps.length;
  //   // console.log(next)
  //   setStep(next);
  // };

  // const origin = {
  //   longitude: technicianData?.location?.coordinates[0],
  //   latitude: technicianData?.location?.coordinates[1],
  // };

  const renderContent = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.centerContent}>
            <AppText
              title={'Estimated Arriving Time'}
              color={AppColors.LIGHTGRAY}
              size={1.9}
            />
            <LineBreak val={1} />
            <AppText
              title={
                eta !== null
                  ? eta < 10
                    ? 'Arriving soon'
                    : eta < 20
                    ? '15 - 20 mins'
                    : eta < 45
                    ? 'About 30 mins'
                    : eta < 90
                    ? 'About 1 hour'
                    : 'About 2 hours'
                  : 'Calculating...'
              }
              color={AppColors.BLACK}
              size={2.5}
              fontWeight={'bold'}
            />
            <LineBreak val={1} />
            {progressBar()}
            <LineBreak val={1} />
            <AppText
              title={`Your pest control technician is on the way and will be arriving shortly.`}
              color={AppColors.LIGHTGRAY}
              size={1.9}
              textWidth={75}
              align={'center'}
            />
            {/* Contact Card */}
            <View style={styles.contactCard}>
              <Image
                source={
                  technicianData?.profileImage
                    ? { uri: `${IMAGE_URL}${technicianData.profileImage}` }
                    : images.userProfile
                }
                style={styles.avatar}
              />
              <View style={{ flex: 1 }}>
                <AppText
                  title={`Contact your Pest Technician`}
                  color={AppColors.BLACK}
                  size={1.4}
                  fontWeight={'bold'}
                />
                <LineBreak val={1} />
                <AppText
                  title={technicianData?.fullName}
                  color={AppColors.GRAY}
                  size={1.8}
                />
              </View>
              <TouchableOpacity
                style={[styles.iconBtn, { backgroundColor: colors.primary }]}
              >
                <Icon name="phone" size={20} color={AppColors.BLACK} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconBtn, { backgroundColor: colors.primary }]}
              >
                <Icon name="message-circle" size={20} color={AppColors.BLACK} />
              </TouchableOpacity>
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.centerContent}>
            <AppText
              title={'Your Pest Control Technician has arrived!'}
              color={AppColors.GRAY}
              size={1.8}
            />
            <LineBreak val={1} />
            <AppText
              title={'Technician Has Arrived'}
              color={AppColors.BLACK}
              size={3}
              fontWeight={'bold'}
            />
            <LineBreak val={2} />
            {progressBar()}
            <LineBreak val={2} />
            <AppText
              title={'Your technician has arrived'}
              color={AppColors.GRAY}
              size={2}
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.centerContent}>
            <AppText
              title={'Your Pest Control Technician is arrived!'}
              color={AppColors.GRAY}
              size={1.8}
            />
            <LineBreak val={1} />
            <AppText
              title={'Discussing Your Service'}
              color={AppColors.BLACK}
              size={3}
              fontWeight={'bold'}
            />
            <LineBreak val={2} />
            {progressBar()}
            <LineBreak val={2} />
            <AppText
              title={
                'Your technician is here and going over the plan with you.'
              }
              color={AppColors.GRAY}
              size={2}
              textWidth={80}
              align={'center'}
            />
          </View>
        );

      case 3:
        return (
          <View style={styles.centerContent}>
            <AppText
              title={'Proceed to payment'}
              color={AppColors.BLACK}
              size={3}
              fontWeight={'bold'}
            />
            <LineBreak val={2} />
            {progressBar()}
            <LineBreak val={2} />
            <AppButton
              title={'Proceed to payment'}
              bgColor={colors.secondary_button}
              textColor={AppColors.BLACK}
              textFontWeight={'bold'}
              borderRadius={30}
              buttoWidth={92}
              textTransform={'uppercase'}
              handlePress={() => {
                nav.navigate('Payment', {
                  pest_tech: route?.params?.pest_tech,
                  request: false,
                });
              }}
            />
          </View>
        );

      default:
        return null;
    }
  };

  const progressBar = () => {
    return (
      <View style={styles.stepContainer}>
        {steps.map((_, i) => (
          <View
            key={i}
            style={[
              styles.stepDot,
              {
                backgroundColor: i <= step ? colors.secondary_button : '#ddd',
              },
            ]}
          />
        ))}
      </View>
    );
  };

  // const midLat = (destination?.latitude + technicianLocation?.latitude) / 2;
  // const midLng = (destination?.longitude + technicianLocation?.longitude) / 2;

  return (
    <Container contentStyle={{ paddingBottom: responsiveHeight(5) }}>
      <NormalHeader
        heading={`Pest Technician`}
        onBackPress={() => nav.goBack()}
      />
      {destination && technicianLocation && (
        <MapView
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
          }}
        >
          <Marker coordinate={destination} title="You" pinColor="green" />
          <Marker
            coordinate={technicianLocation}
            title="Technician"
            pinColor="blue"
          />
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
        </MapView>
      )}
      {/* <Image source={images.locate_map} style={{ width: responsiveWidth(100) }} /> */}
      <LineBreak val={3} />
      <Image
        source={images.pest_controller}
        style={{
          width: responsiveWidth(100),
          alignSelf: 'center',
        }}
        resizeMode="contain"
      />

      {renderContent()}

      {/* {step !== 3 ? (
        <View
          style={{ paddingVertical: responsiveHeight(2), alignItems: 'center' }}
        >
          <AppButton
            title={'Next Step'}
            bgColor={colors.secondary_button}
            textColor={AppColors.BLACK}
            textFontWeight={'bold'}
            borderRadius={30}
            buttoWidth={92}
            textTransform={'uppercase'}
            handlePress={nextStep}
          />
        </View>
      ) : null} */}
    </Container>
  );
};

export default PestTechnician;

const styles = StyleSheet.create({
  progressWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: responsiveWidth(90),
    // marginBottom: 20,
    alignSelf: 'center',
  },
  progress: {
    height: 4,
    borderRadius: 2,
    marginHorizontal: responsiveWidth(1),
  },
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerTitle: { fontSize: 16, fontWeight: '600' },
  map: { width: '100%', height: 220 },
  technician: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginTop: -50,
    marginBottom: 20,
  },
  centerContent: { alignItems: 'center', paddingHorizontal: 20 },
  label: { fontSize: 14, color: '#777' },
  time: { fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  desc: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginVertical: 12,
  },
  arrivedTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 8 },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    padding: 12,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: '100%',
    marginTop: 20,
  },
  avatar: { width: 55, height: 55, borderRadius: 27, marginRight: 12 },
  contactLabel: { fontSize: 12, color: '#888' },
  contactName: { fontSize: 14, fontWeight: 'bold', marginTop: 2 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  paymentBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 20,
  },
  paymentText: { color: '#fff', fontWeight: '600' },
  nextBtn: {
    alignSelf: 'center',
    marginTop: 30,
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  stepContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: responsiveWidth(5),
  },
  stepDot: {
    width: responsiveWidth(20),
    height: responsiveHeight(1),
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
});
