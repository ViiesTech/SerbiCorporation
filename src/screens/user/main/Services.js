import React, { useEffect, useState } from 'react';
import { View, FlatList, Image, Platform } from 'react-native';
import Container from '../../../components/Container';
import { useNavigation } from '@react-navigation/native';
import NormalHeader from './../../../components/NormalHeader';
import {
  AppColors,
  estimateTimeMinutes,
  formatMinutes,
  getDistanceInMiles,
  getProfileImage,
  responsiveHeight,
  responsiveWidth,
} from '../../../utils';
import AppText from '../../../components/AppText';
import LineBreak from '../../../components/LineBreak';
import HistoryCard from './../../../components/HistoryCard';
import {
  useAddToFavouritesMutation,
  useLazyGetNearbyTechniciansQuery,
} from '../../../redux/services/index';
import Loader from '../../../components/Loader';
import { IMAGE_URL } from '../../../redux/constant';
import { useSelector } from 'react-redux';
import Toast from 'react-native-simple-toast';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { images } from '../../../assets/images';

// const profiles = [
//   {
//     id: 1,
//     profImg: images.imageProf,
//     username: 'Roland Hopper',
//     price: '$79.00',
//     status: 'Completed',
//     designation: 'Pest Technician',
//     rating: '3.5',
//     time: '30',
//     ml: '0.5',
//     min: '5',
//     isHideClose: false,
//     isShowBadge: true,
//   },
//   {
//     id: 2,
//     profImg: images.imageProf,
//     username: 'Roland Hopper',
//     price: '$79.00',
//     status: 'Completed',
//     designation: 'Pest Technician',
//     rating: '3.5',
//     time: '30',
//     ml: '0.5',
//     min: '5',
//     isHideClose: false,
//     isShowBadge: false,
//   },
//   {
//     id: 3,
//     profImg: images.imageProf,
//     username: 'Roland Hopper',
//     price: '$79.00',
//     status: 'Completed',
//     designation: 'Pest Technician',
//     rating: '3.5',
//     time: '30',
//     ml: '0.5',
//     min: '5',
//     isHideClose: false,
//     isShowBadge: false,
//   },
// ];

const Services = ({ route }) => {
  const nav = useNavigation();
  const [selectedCard, setSelectedCard] = useState({ id: 1 });
  const { _id } = useSelector(state => state.persistedData.user);
  const [getNearbyTechnicians, { data, isLoading }] =
    useLazyGetNearbyTechniciansQuery();
  const [addToFavourites] = useAddToFavouritesMutation();
  const [nearbyCoordinates, setNearbyCoordinates] = useState([]);
  const { service, lat, long, requestData } = route?.params;

  // console.log('nearby technicians ===>', service, lat, long);

  useEffect(() => {
    getNearbyTechnicians({
      //real lat long goes here coming from params
      lat: lat || '37.4219983',
      long: long || '-122.084',
      service: service,
    });
  }, [lat, long, service]);

  useEffect(() => {
    if (data?.data?.length > 0) {
      const getCoordinates = data.data.map(item => ({
        longitude: item.location.coordinates[0],
        latitude: item.location.coordinates[1],
      }));
      setNearbyCoordinates(getCoordinates);
    }
  }, [data?.data]);

  const onFavouritePress = async technicianId => {
    // return  console.log('technician id===>',technicianId)
    let data = {
      userId: _id,
      technicianId,
    };

    await addToFavourites(data)
      .unwrap()
      .then(res => {
        console.log('response of adding into wishlist ===>', res.data);
        Toast.show(res.msg, Toast.SHORT);
        if (res.success) {
          getNearbyTechnicians({
            lat: '25.4486',
            long: '-80.4115',
            service: service,
          });
        }
      })
      .catch(error => {
        console.log('error adding into wishlist ===>', error);
        Toast.show('Some problem occured', Toast.SHORT);
      });
  };

  // console.log('AAAA', lat, long, service);

  return (
    <Container>
      <NormalHeader
        heading={'technicians Profiles'}
        onBackPress={() => nav.goBack()}
      />
      {isLoading ? (
        <Loader style={{ marginVertical: responsiveHeight(2) }} />
      ) : !data?.success ? (
        <AppText align={'center'} title={data?.msg} />
      ) : (
        <>
          <MapView
            provider={Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE}
            style={{
              height: responsiveHeight(50),
              width: responsiveWidth(100),
            }}
            region={{
              latitude: lat || 25.4486,
              longitude: long || -80.4115,
              latitudeDelta: 0.015,
              longitudeDelta: 0.0121,
            }}
          >
            {nearbyCoordinates?.map((coord, index) => {
              return (
                <Marker
                  key={index}
                  title={`Technician ${index + 1}`}
                  coordinate={{
                    latitude: coord.latitude,
                    longitude: coord.longitude,
                  }}
                >
                  <Image
                    source={images.pin_marker}
                    style={{ height: 70, width: 70, borderRadius: 35 }}
                  />
                </Marker>
              );
            })}
          </MapView>
          {/* <Image source={images.map} style={{ width: responsiveWidth(100) }} /> */}

          <LineBreak val={2} />

          <View style={{ paddingHorizontal: responsiveWidth(4), gap: 20 }}>
            <AppText
              title={'Nearby Profiles'}
              color={AppColors.BLACK}
              size={2.2}
              fontWeight={'bold'}
            />
            <FlatList
              data={data?.data}
              ListHeaderComponent={() => <LineBreak val={1} />}
              ListFooterComponent={() => <LineBreak val={2} />}
              ItemSeparatorComponent={() => <LineBreak val={2} />}
              renderItem={({ item }) => {
                const [techLng, techLat] = item.location?.coordinates;
                //real lat long coming from params goes here
                const distanceMiles = getDistanceInMiles(
                  '25.4486',
                  '-80.4115',
                  techLat,
                  techLng,
                );
                const minutes = estimateTimeMinutes(distanceMiles);
                return (
                  <HistoryCard
                    onCardPress={() =>
                      nav.navigate('ServicesProfile', {
                        requestData: { ...requestData, service },
                        profileData: item,
                        coordinates: {
                          lat: lat,
                          lng: long,
                        },
                      })
                    }
                    disabled={false}
                    item={{
                      profImg: getProfileImage(item.profileImage),
                      // profImg: item.GoogleUser
                      //   ? `${item.profileImage}`
                      //   : `${IMAGE_URL}${item.profileImage}`,
                      username: item.fullName,
                      price: `$${item.price}`,
                      designation: `${item.service?.name + ' ' + 'Technician'}`,
                      rating: item.avgRating || 0,
                      // time: '30',
                      ml: distanceMiles.toFixed(1),
                      min: formatMinutes(minutes),
                    }}
                    x
                    favourite={item.favouriteBy?.includes(_id)}
                    onHeartPress={() => onFavouritePress(item._id)}
                    selectedCard={selectedCard}
                    // onCardPress={() => setSelectedCard({ id: item._id })}
                    services={'services'}
                    isHideClose={false}
                    isShowBadge={true}
                    viewDetailsHandlePress={() =>
                      nav.navigate('ServicesProfile', {
                        requestData: { ...requestData, service },
                        profileData: item,
                        coordinates: {
                          lat: lat,
                          lng: long,
                        },
                      })
                    }
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

export default Services;
