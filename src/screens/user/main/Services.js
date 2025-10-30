import React, { useEffect, useState } from 'react';
import { View, FlatList } from 'react-native';
import Container from '../../../components/Container';
import { useNavigation } from '@react-navigation/native';
import NormalHeader from './../../../components/NormalHeader';
import {
  AppColors,
  estimateTimeMinutes,
  formatMinutes,
  getDistanceInMiles,
  responsiveHeight,
  responsiveWidth,
} from '../../../utils';
import { Image } from 'react-native';
import { images } from '../../../assets/images';
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
  const [addToFavourites, { isLoading: favouritesLoader }] =
    useAddToFavouritesMutation();
  const { service, lat, long,requestData } = route?.params;

  console.log('nearby technicians ===>', service);

  useEffect(() => {
    getNearbyTechnicians({
      lat:  lat,
      long: long,
      service: service,
    });
  }, [lat, long, service]);

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
        Toast.show(res.msg, 2000, Toast.SHORT);
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
        Toast.show('Some problem occured', 2000, Toast.SHORT);
      });
  };

  return (
    <Container>
      <NormalHeader
        heading={'technicians Profiles'}
        onBackPress={() => nav.goBack()}
      />
      <Image source={images.map} style={{ width: responsiveWidth(100) }} />

      <LineBreak val={2} />

      <View style={{ paddingHorizontal: responsiveWidth(4), gap: 20 }}>
        <AppText
          title={'Nearby Profiles'}
          color={AppColors.BLACK}
          size={2.2}
          fontWeight={'bold'}
        />
        {isLoading ? (
          <Loader style={{ marginVertical: responsiveHeight(2) }} />
        ) : !data?.success ? (
          <AppText align={'center'} title={data?.msg} />
        ) : (
          <FlatList
            data={data?.data}
            ListHeaderComponent={() => <LineBreak val={1} />}
            ListFooterComponent={() => <LineBreak val={2} />}
            ItemSeparatorComponent={() => <LineBreak val={2} />}
            renderItem={({ item }) => {
              const [techLng, techLat] = item.location?.coordinates;
              const distanceMiles = getDistanceInMiles(
                lat,
                long,
                techLat,
                techLng,
              );
              const minutes = estimateTimeMinutes(distanceMiles);
              return (
                <HistoryCard
                  disabled={true}
                  item={{
                    profImg: `${IMAGE_URL}${item.profileImage}`,
                    username: item.fullName,
                    price: `$${item.price}`,
                    designation: `${item.service?.name + ' ' + 'Technician'}`,
                    rating: item.avgRating || 0,
                    // time: '30',
                    ml: distanceMiles.toFixed(1),
                    min: formatMinutes(minutes),
                  }}
                  favourite={item.favouriteBy?.includes(_id)}
                  onHeartPress={() => onFavouritePress(item._id)}
                  selectedCard={selectedCard}
                  onCardPress={() => setSelectedCard({ id: item._id })}
                  services={'services'}
                  isHideClose={false}
                  isShowBadge={true}
                  viewDetailsHandlePress={() => nav.navigate('ServicesProfile',{requestData: {...requestData,service},profileData: item})}
                />
              );
            }}
          />
        )}
      </View>
    </Container>
  );
};

export default Services;
