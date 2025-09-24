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
import { useLazyGetNearbyTechniciansQuery } from '../../../redux/services/index';
import Loader from '../../../components/Loader';
import { IMAGE_URL } from '../../../redux/constant';

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
  const [getNearbyTechnicians, { data, isLoading }] =
    useLazyGetNearbyTechniciansQuery();
  const { service, lat, long } = route?.params;

  console.log('nearby technicians ===>', data);

  useEffect(() => {
    getNearbyTechnicians({ lat: '25.4473', long: '-80.479', service: '68d31cacf962675cd0799b74' });
  }, [lat, long, service]);

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
                  item={{
                    profImg: `${IMAGE_URL}${item.profileImage}`,
                    username: item.fullName,
                    price: `$${item.price}`,
                    designation: `${item.service?.name + ' ' + 'Technician'}`,
                    rating: item.avgRating || 0,
                    // time: '30',
                    ml: distanceMiles.toFixed(1),
                    min: formatMinutes(minutes)
                  }}
                  selectedCard={selectedCard}
                  onCardPress={() => setSelectedCard({ id: item._id })}
                  services={'services'}
                  isHideClose={false}
                  isShowBadge={true}
                  viewDetailsHandlePress={() => nav.navigate('ServicesProfile')}
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
