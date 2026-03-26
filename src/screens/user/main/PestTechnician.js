import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Icon from 'react-native-vector-icons/Feather';

// Components
import Container from '../../../components/Container';
import NormalHeader from '../../../components/NormalHeader';
import LineBreak from '../../../components/LineBreak';
import AppText from '../../../components/AppText';
import AppButton from '../../../components/AppButton';

// Utils & Constants
import {
  AppColors,
  getDistanceInMiles,
  estimateTimeMinutes,
  getProfileImage,
  responsiveHeight,
  responsiveWidth,
} from '../../../utils';
import { colors } from '../../../assets/colors';
import { images } from '../../../assets/images';
import { MAP_API_KEY } from '../../../redux/constant';
import { useLazyGetAppointmentDetailQuery } from '../../../redux/services';
import LottieView from 'lottie-react-native';

const PestTechnician = ({ route }) => {
  const nav = useNavigation();
  const mapRef = useRef(null);
  const { user } = useSelector(state => state.persistedData);

  const technicianData = route?.params?.pest_tech;
  const appointmentId = technicianData?.appointmentData?.id;

  const [step, setStep] = useState(0);
  const [eta, setEta] = useState(null);
  const [technicianLocation, setTechnicianLocation] = useState({
    longitude: technicianData?.location?.coordinates[0] || 0,
    latitude: technicianData?.location?.coordinates[1] || 0,
  });

  const [getAppointmentDetail, { data, isLoading }] =
    useLazyGetAppointmentDetailQuery();
  const [minLoading, setMinLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  // Animation values
  const mapFade = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const centeredMapRef = useRef(false);

  const destination = {
    longitude: user?.location?.coordinates?.[0] || -80.1918,
    latitude: user?.location?.coordinates?.[1] || 25.7617,
  };

  const steps = [1, 2, 3, 4]; // Visual markers

  // Polling Appointment Details
  useEffect(() => {
    if (!appointmentId) return;

    getAppointmentDetail(appointmentId);
    const interval = setInterval(() => {
      getAppointmentDetail(appointmentId);
    }, 10000);

    return () => clearInterval(interval);
  }, [appointmentId]);

  // Map Animation Logic (Same as vendor screen)
  useEffect(() => {
    if (
      destination?.latitude &&
      technicianLocation?.latitude &&
      mapReady &&
      !centeredMapRef.current
    ) {
      const region = {
        latitude: (technicianLocation.latitude + destination.latitude) / 2,
        longitude: (technicianLocation.longitude + destination.longitude) / 2,
        latitudeDelta: 0.25,
        longitudeDelta: 0.25,
      };
      mapRef.current?.animateToRegion(region, 1000);
      centeredMapRef.current = true;
    }
  }, [
    mapReady,
    destination?.latitude,
    destination?.longitude,
    technicianLocation?.latitude,
    technicianLocation?.longitude,
  ]);

  // Sync UI with Polled Data
  useEffect(() => {
    if (data?.data) {
      const status = data.data.status;

      // Update Progress Step based on status
      const statusMap = {
        Pending: 0,
        'On The Way': 1,
        Arrived: 2,
        Accepted: 3,
      };
      if (statusMap[status] !== undefined) setStep(statusMap[status]);

      // Update Live Location
      if (data.data?.location?.coordinates) {
        const [lng, lat] = data.data.location.coordinates;
        const newLoc = { longitude: lng, latitude: lat };
        setTechnicianLocation(newLoc);

        // Auto-fit map to show both markers
        if (mapRef.current) {
          mapRef.current.fitToCoordinates([destination, newLoc], {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }

        // Fallback ETA calculation
        if (eta === null) {
          const dist = getDistanceInMiles(
            destination.latitude,
            destination.longitude,
            lat,
            lng,
          );
          setEta(Math.round(estimateTimeMinutes(dist)));
        }
      }
    }
  }, [data, eta]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoading(false);
    }, 2000); // 2 seconds minimum loading for this screen
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Animate once both the minimum time has passed and data is either successfully loaded or already exists
    if (!minLoading && (!isLoading || data)) {
      const animationTimer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(mapFade, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(contentFade, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();
      }, 100);

      return () => clearTimeout(animationTimer);
    }
  }, [isLoading, minLoading, data, mapFade, contentFade]);

  const progressBar = () => (
    <View style={styles.stepContainer}>
      {steps.map((_, i) => (
        <View
          key={i}
          style={[
            styles.stepDot,
            { backgroundColor: i <= step ? colors.secondary_button : '#ddd' },
          ]}
        />
      ))}
    </View>
  );

  const renderContent = () => {
    switch (step) {
      case 0: // Pending State
        return (
          <View style={styles.centerContent}>
            <LineBreak val={1} />
            <AppText
              title={'Waiting...'}
              color={AppColors.BLACK}
              size={3}
              fontWeight={'bold'}
            />
            <LineBreak val={2} />
            {progressBar()}
            <LineBreak val={2} />
            <AppText
              title={
                'Your service request has been received. Please hold tight while the technician confirms.'
              }
              color={AppColors.GRAY}
              size={2}
              textWidth={80}
              align={'center'}
            />
          </View>
        );

      case 1: // Tracking State
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
                  ? eta < 5
                    ? 'Arriving soon'
                    : `${eta} mins`
                  : 'Calculating...'
              }
              color={AppColors.BLACK}
              size={2.5}
              fontWeight={'bold'}
            />
            <LineBreak val={1} />
            {progressBar()}
            <View style={styles.contactCard}>
              <Image
                source={
                  technicianData?.profileImage
                    ? { uri: getProfileImage(technicianData.profileImage) }
                    : images.userProfile
                }
                style={styles.avatar}
              />
              <View style={{ flex: 1 }}>
                <AppText
                  title={`Contact your Technician`}
                  color={AppColors.BLACK}
                  size={1.4}
                  fontWeight={'bold'}
                />
                <AppText
                  title={technicianData?.fullName}
                  color={AppColors.GRAY}
                  size={1.8}
                />
              </View>
              <TouchableOpacity style={styles.iconBtn}>
                <Icon name="phone" size={20} color={AppColors.BLACK} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <Icon name="message-circle" size={20} color={AppColors.BLACK} />
              </TouchableOpacity>
            </View>
          </View>
        );

      case 2: // Arrived State
        return (
          <View style={styles.centerContent}>
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

      case 3: // Completion/Payment State
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
              handlePress={() =>
                nav.navigate('Payment', {
                  pest_tech: technicianData,
                  request: false,
                })
              }
            />
          </View>
        );

      default:
        return null;
    }
  };

  // console.log('technicianData:-', technicianData);
  console.log('technicianLocation:-', technicianLocation);
  console.log('destination:-', destination);
  console.log('eta:-', eta);

  const coordinates = [destination, technicianLocation];

  return (
    <Container contentStyle={{ paddingBottom: responsiveHeight(5) }}>
      <NormalHeader
        heading={`Pest Technician`}
        onBackPress={() => nav.goBack()}
      />

      {isLoading || minLoading ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <LottieView
            source={require('../../../assets/animations/searching.json')}
            autoPlay={true}
            loop={true}
            style={{
              width: responsiveWidth(60),
              height: responsiveWidth(60),
            }}
          />
          <AppText
            title="Locating your technician..."
            size={2}
            color={AppColors.GRAY}
          />
        </View>
      ) : (
        <>
          <Animated.View style={{ opacity: mapFade }}>
            <MapView
              provider={Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE}
              ref={mapRef}
              onMapReady={() => setMapReady(true)}
              style={styles.map}
              initialRegion={{
                latitude:
                  (destination.latitude + technicianLocation.latitude) / 2,
                longitude:
                  (destination.longitude + technicianLocation.longitude) / 2,
                latitudeDelta: 0.25,
                longitudeDelta: 0.25,
              }}
            >
              <Marker
                coordinate={destination}
                title="You"
                pinColor={colors.secondary_button}
              />
              <Marker
                coordinate={technicianLocation}
                title="Technician"
                pinColor={colors.secondary_button}
              />

              <MapViewDirections
                origin={technicianLocation}
                destination={destination}
                apikey={MAP_API_KEY}
                strokeWidth={4}
                strokeColor={colors.social_color1}
                onReady={result => {
                  setEta(Math.round(result.duration));
                  if (mapRef.current) {
                    mapRef.current.fitToCoordinates(result.coordinates, {
                      edgePadding: { top: 70, right: 50, bottom: 70, left: 50 },
                      animated: true,
                    });
                  }
                }}
              />
            </MapView>
          </Animated.View>

          <Animated.View style={{ opacity: contentFade, flex: 1 }}>
            <LineBreak val={3} />
            <View style={{ alignItems: 'center' }}>
              <LottieView
                source={require('../../../assets/animations/delivery.json')}
                autoPlay={true}
                loop={true}
                style={{
                  width: responsiveWidth(50),
                  height: responsiveWidth(50),
                }}
              />
            </View>
            {renderContent()}
          </Animated.View>
        </>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  map: {
    height: responsiveHeight(40), //45
    width: responsiveWidth(100),
  },
  mainImage: {
    width: responsiveWidth(100),
    height: responsiveHeight(20),
    alignSelf: 'center',
  },
  centerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: responsiveWidth(85),
  },
  stepDot: {
    width: responsiveWidth(18),
    height: 6,
    borderRadius: 3,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    padding: 12,
    borderRadius: 15,
    elevation: 3,
    width: '100%',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    marginRight: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});

export default PestTechnician;
