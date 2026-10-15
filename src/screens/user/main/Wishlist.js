import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import Container from '../../../components/Container';
import NormalHeader from '../../../components/NormalHeader';
import LineBreak from '../../../components/LineBreak';
import { useNavigation } from '@react-navigation/native';
import {
  getProfileImage,
  responsiveHeight,
  responsiveWidth,
  openDialer,
} from '../../../utils';
import HistoryCard from '../../../components/HistoryCard';
import { useLazyGetAllWishlistsQuery } from '../../../redux/services';
import { useSelector } from 'react-redux';
import Loader from '../../../components/Loader';
import AppText from '../../../components/AppText';

const Wishlist = () => {
  const nav = useNavigation();
  const [selectedCard, setSelectedCard] = useState({ id: 1 });
  const [getAllWishlists, { data, isLoading }] = useLazyGetAllWishlistsQuery();
  const user = useSelector(state => state.persistedData.user);
  const userId = user?._id;

  useEffect(() => {
    if (userId) {
      getAllWishlists(userId);
    }
  }, [userId, getAllWishlists]);

  return (
    <Container scrollEnabled={false}>
      <NormalHeader heading={'Wishlist'} onBackPress={() => nav.goBack()} />
      {isLoading ? (
        <Loader style={{ marginVertical: responsiveHeight(3) }} />
      ) : !data?.success ? (
        <AppText align={'center'} title={data?.msg} />
      ) : (
        <FlatList
          data={data?.data}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={<LineBreak val={1} />}
          ListFooterComponent={<LineBreak val={2} />}
          renderItem={({ item }) => {
            return (
              <HistoryCard
                item={{
                  profImg: getProfileImage(item.technicianId?.profileImage),
                  price: `$${(item.technicianId?.price || 0).toFixed(2)}`,
                  username: item.technicianId?.fullName,
                  rating: item.technicianId?.avgRating || 0,
                  designation: `${item.technicianId?.service?.name || 'General'} Technician`,
                }}
                favourite={true}
                selectedCard={selectedCard}
                onCardPress={() => setSelectedCard({ id: item._id })}
                favItem={'favItem'}
                callOnPress={() =>
                  openDialer(
                    item.technicianId?.phoneNumber ||
                      item.technicianId?.phone,
                  )
                }
                chatOnPress={() =>
                  nav.navigate('Chat', {
                    otherUserId:
                      item.technicianId?._id || item.technicianId?.id,
                    userName: item.technicianId?.fullName,
                    userImage: item.technicianId?.profileImage,
                  })
                }
              />
            );
          }}
        />
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: responsiveWidth(4),
    gap: 15,
  },
});

export default Wishlist;
