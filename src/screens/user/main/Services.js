import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react';
import {
  View,
  FlatList,
  Platform,
  StyleSheet,
  Animated,
  Text,
  Image,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-simple-toast';
import LottieView from 'lottie-react-native';

import Container from '../../../components/Container';
import NormalHeader from './../../../components/NormalHeader';
import NearByCard from '../../../components/NearByCard';

import {
  estimateTimeMinutes,
  formatMinutes,
  getDistanceInMiles,
  getProfileImage,
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../utils';
import { images } from '../../../assets/images';

import {
  useAddToFavouritesMutation,
  useLazyGetNearbyTechniciansQuery,
} from '../../../redux/services/index';

const Services = ({ route }) => {
  const nav = useNavigation();
  const { _id } = useSelector(state => state.persistedData.user);
  const { service, lat, long, requestData } = route?.params || {};

  const [getNearbyTechnicians, { data, isLoading }] =
    useLazyGetNearbyTechniciansQuery();
  const [addToFavourites] = useAddToFavouritesMutation();
  const [minLoading, setMinLoading] = useState(true);

  // Animation values
  const mapFade = useRef(new Animated.Value(0)).current;
  const listFade = useRef(new Animated.Value(0)).current;

  // Memoize coordinates to prevent the map from re-rendering/flashing
  const nearbyCoordinates = useMemo(() => {
    return (
      data?.data?.map(item => ({
        id: item._id,
        longitude: parseFloat(item.location.coordinates[0]),
        latitude: parseFloat(item.location.coordinates[1]),
        fullName: item.fullName,
      })) || []
    );
  }, [data]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (lat && long && service) {
      getNearbyTechnicians({ lat, long, service });
    }
  }, [lat, long, service, getNearbyTechnicians]);

  useEffect(() => {
    if (!isLoading && data?.success) {
      mapFade.setValue(0);
      listFade.setValue(0);

      const animationTimer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(mapFade, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(listFade, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
      }, 50);

      return () => clearTimeout(animationTimer);
    }
  }, [isLoading, data, mapFade, listFade]);

  const onFavouritePress = async technicianId => {
    try {
      const res = await addToFavourites({ userId: _id, technicianId }).unwrap();
      Toast.show(res.msg || 'Success', Toast.SHORT);

      if (res.success) {
        getNearbyTechnicians({ lat, long, service });
      }
    } catch (error) {
      console.error('Wishlist Error:', error);
      Toast.show('Problem updating favorites', Toast.SHORT);
    }
  };

  const handleNavigateToProfile = useCallback(
    item => {
      nav.navigate('ServicesProfile', {
        requestData: { ...requestData, service },
        profileData: item,
        coordinates: { lat, lng: long },
      });
    },
    [nav, requestData, service, lat, long],
  );

  const technicianList = data?.data || [];

  return (
    <Container extraStyle={styles.safeAreaBg} style={styles.screenBg}>
      <NormalHeader
        heading={'Technician Profiles'}
        onBackPress={() => nav.goBack()}
      />

      {(!isLoading && !data?.success) || technicianList.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>
            {data?.msg || 'No technicians found near this location.'}
          </Text>
          <Text style={styles.emptySubtitle}>
            Please try selecting a different service area or pest category.
          </Text>
        </View>
      ) : (
        <>
          {/* Floating Map Card */}
          <Animated.View style={[styles.mapCard, { opacity: mapFade }]}>
            <MapView
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              style={StyleSheet.absoluteFillObject}
              region={{
                latitude: parseFloat(lat) || 40.7128,
                longitude: parseFloat(long) || -74.006,
                latitudeDelta: 0.12,
                longitudeDelta: 0.12,
              }}
            >
              {nearbyCoordinates.map(coord => (
                <Marker
                  key={coord.id}
                  title={coord.fullName}
                  coordinate={{
                    latitude: coord.latitude,
                    longitude: coord.longitude,
                  }}
                >
                  <Image
                    source={images.pin_marker}
                    style={styles.markerIcon}
                  />
                </Marker>
              ))}
            </MapView>

            {/* Map Top Floating Status Badge */}
            <View style={styles.mapBadge}>
              <View style={styles.livePulseDot} />
              <Text style={styles.mapBadgeText}>Nearby Service Coverage</Text>
            </View>
          </Animated.View>

          {/* List Section */}
          <View style={styles.listSection}>
            <Animated.View style={[styles.sectionHeader, { opacity: listFade }]}>
              <View>
                <Text style={styles.sectionTitle}>Nearby Profiles</Text>
                <Text style={styles.sectionSubtitle}>
                  Verified pest specialists ready to dispatch
                </Text>
              </View>

              {technicianList.length > 0 && (
                <View style={styles.countPill}>
                  <Text style={styles.countText}>
                    {technicianList.length} Available
                  </Text>
                </View>
              )}
            </Animated.View>

            {isLoading || minLoading ? (
              <View style={styles.loadingContainer}>
                <LottieView
                  source={require('../../../assets/animations/searching.json')}
                  autoPlay={true}
                  loop={true}
                  style={styles.lottieLoader}
                />
                <Text style={styles.loadingText}>
                  Finding nearest certified technicians...
                </Text>
              </View>
            ) : (
              <FlatList
                data={technicianList}
                keyExtractor={item => item._id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
                renderItem={({ item, index }) => {
                  const [techLng, techLat] = item.location?.coordinates || [
                    0, 0,
                  ];
                  const distanceMiles = getDistanceInMiles(
                    lat,
                    long,
                    techLat,
                    techLng,
                  );
                  const minutes = estimateTimeMinutes(distanceMiles);

                  return (
                    <AnimatedTechnicianCard
                      index={index}
                      onPress={() => handleNavigateToProfile(item)}
                      item={{
                        profImg: getProfileImage(item.profileImage),
                        username: item.fullName,
                        price: item.price ? `$${item.price}` : 'Quote Only',
                        designation: `${item.service?.name || ''} Technician`,
                        rating: item.avgRating || 0,
                        ml: distanceMiles.toFixed(1),
                        min: formatMinutes(minutes),
                      }}
                      favourite={item.favouriteBy?.includes(_id)}
                      onHeartPress={() => onFavouritePress(item._id)}
                      viewDetailsHandlePress={() =>
                        handleNavigateToProfile(item)
                      }
                    />
                  );
                }}
              />
            )}
          </View>
        </>
      )}
    </Container>
  );
};

const AnimatedTechnicianCard = ({
  index,
  item,
  favourite,
  onHeartPress,
  onPress,
  viewDetailsHandlePress,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 450,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, [animatedValue, index]);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });

  return (
    <Animated.View
      style={{
        opacity: animatedValue,
        transform: [{ translateY }],
      }}
    >
      <NearByCard
        onCardPress={onPress}
        disabled={false}
        item={item}
        favourite={favourite}
        onHeartPress={onHeartPress}
        isShowBadge={true}
        viewDetailsHandlePress={viewDetailsHandlePress}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  safeAreaBg: {
    backgroundColor: '#FFFFFF',
  },
  screenBg: {
    backgroundColor: '#F8FAFC',
  },
  mapCard: {
    marginHorizontal: responsiveWidth(4.5),
    marginTop: 14,
    height: responsiveHeight(30),
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    position: 'relative',
  },
  markerIcon: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  mapBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  mapBadgeText: {
    fontSize: responsiveFontSize(1.2),
    fontWeight: '700',
    color: '#0F172A',
  },
  listSection: {
    flex: 1,
    paddingHorizontal: responsiveWidth(4.5),
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: responsiveFontSize(2.0),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: responsiveFontSize(1.3),
    color: '#64748B',
    marginTop: 2,
  },
  countPill: {
    backgroundColor: 'rgba(160, 204, 217, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: responsiveFontSize(1.2),
    fontWeight: '700',
    color: '#0F172A',
  },
  cardSeparator: {
    height: 12,
  },
  listContent: {
    paddingBottom: responsiveHeight(6),
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  lottieLoader: {
    width: responsiveWidth(45),
    height: responsiveWidth(45),
  },
  loadingText: {
    fontSize: responsiveFontSize(1.4),
    fontWeight: '600',
    color: '#64748B',
    marginTop: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    minHeight: responsiveHeight(50),
  },
  emptyTitle: {
    fontSize: responsiveFontSize(1.8),
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: responsiveFontSize(1.3),
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
  },
});

export default Services;
