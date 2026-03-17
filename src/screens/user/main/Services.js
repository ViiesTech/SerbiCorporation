import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { View, FlatList, Platform, StyleSheet, Animated } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-simple-toast';

import Container from '../../../components/Container';
import NormalHeader from './../../../components/NormalHeader';
import AppText from '../../../components/AppText';
import LineBreak from '../../../components/LineBreak';
import HistoryCard from './../../../components/HistoryCard';
import Loader from '../../../components/Loader';

import {
  AppColors,
  estimateTimeMinutes,
  formatMinutes,
  getDistanceInMiles,
  getProfileImage,
  responsiveHeight,
  responsiveWidth,
} from '../../../utils';

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
    if (lat && long && service) {
      getNearbyTechnicians({ lat, long, service });
    }
  }, [lat, long, service, getNearbyTechnicians]);

  useEffect(() => {
    if (!isLoading && data?.success) {
      // Explicit reset
      mapFade.setValue(0);
      listFade.setValue(0);

      const animationTimer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(mapFade, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(listFade, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();
      }, 100);

      return () => clearTimeout(animationTimer);
    }
  }, [isLoading, data, mapFade, listFade]);

  const onFavouritePress = async technicianId => {
    try {
      const res = await addToFavourites({ userId: _id, technicianId }).unwrap();
      Toast.show(res.msg || 'Success', Toast.SHORT);

      if (res.success) {
        // Use current params instead of hardcoded strings to refresh list
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

  return (
    <Container>
      <NormalHeader
        heading={'Technician Profiles'}
        onBackPress={() => nav.goBack()}
      />

      {isLoading ? (
        <Loader style={styles.loader} />
      ) : !data?.success || data?.data?.length === 0 ? (
        <View style={styles.centered}>
          <AppText
            align={'center'}
            title={data?.msg || 'No technicians found near this location.'}
          />
        </View>
      ) : (
        <>
          <Animated.View style={[styles.mapContainer, { opacity: mapFade }]}>
            <MapView
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              style={styles.map}
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
                  pinColor={AppColors.PRIMARY}
                  coordinate={{
                    latitude: coord.latitude,
                    longitude: coord.longitude,
                  }}
                />
              ))}
            </MapView>
          </Animated.View>

          <View style={styles.listSection}>
            <LineBreak val={2} />
            <Animated.View style={{ opacity: listFade }}>
              <AppText
                title={'Nearby Profiles'}
                color={AppColors.BLACK}
                size={2.2}
                fontWeight={'bold'}
              />
            </Animated.View>

            <FlatList
              data={data?.data}
              keyExtractor={item => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ListHeaderComponent={() => <LineBreak val={1} />}
              ItemSeparatorComponent={() => <LineBreak val={2} />}
              renderItem={({ item, index }) => {
                const [techLng, techLat] = item.location?.coordinates || [0, 0];
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
                    viewDetailsHandlePress={() => handleNavigateToProfile(item)}
                  />
                );
              }}
            />
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
      duration: 500,
      delay: index * 100, // Staggered delay
      useNativeDriver: true,
    }).start();
  }, [animatedValue, index]);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  return (
    <Animated.View
      style={{
        opacity: animatedValue,
        transform: [{ translateY }],
      }}
    >
      <HistoryCard
        onCardPress={onPress}
        disabled={false}
        item={item}
        favourite={favourite}
        onHeartPress={onHeartPress}
        services={'services'}
        isHideClose={false}
        isShowBadge={true}
        viewDetailsHandlePress={viewDetailsHandlePress}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  loader: {
    marginVertical: responsiveHeight(10),
  },
  mapContainer: {
    height: responsiveHeight(40),
    width: responsiveWidth(100),
    overflow: 'hidden',
  },
  map: {
    height: '100%',
    width: '100%',
  },
  listSection: {
    flex: 1,
    paddingHorizontal: responsiveWidth(4),
  },
  listContent: {
    paddingBottom: responsiveHeight(5),
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default Services;
