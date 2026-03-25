import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import moment from 'moment';

// Components
import Container from '../../../components/Container';
import NormalHeader from '../../../components/NormalHeader';
import LineBreak from '../../../components/LineBreak';
import HistoryCard from '../../../components/HistoryCard';
import Loader from '../../../components/Loader';

// Utils & Redux
import { getProfileImage, responsiveWidth } from '../../../utils';
import { useLazyGetDiscussionFormsQuery } from '../../../redux/services';

const History = () => {
  const nav = useNavigation();
  const [selectedCard, setSelectedCard] = useState({ id: 1 });
  const { user } = useSelector(state => state.persistedData);
  const [data, setData] = useState(null);

  const [getAllDiscussionForms, { isLoading }] =
    useLazyGetDiscussionFormsQuery();

  useEffect(() => {
    _getAllAppointment();
  }, []);

  const _getAllAppointment = async () => {
    const payload = {
      id: user?._id,
      type: user?.type,
      status: 'Paid', //'Completed',
    };

    console.log('History payload ===>', payload);

    try {
      const res = await getAllDiscussionForms(payload).unwrap();
      console.log('History response ===>', res);
      setData(res);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const listEmptyComponent = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No history found.</Text>
      </View>
    );
  };

  const renderItem = useCallback(
    ({ item }) => {
      return (
        <HistoryCard
          history={true}
          activeOpacity={1}
          selectedCard={selectedCard}
          onCardPress={() => setSelectedCard({ id: item._id })}
          item={{
            id: item?._id,
            profImg: getProfileImage(item?.technicianId?.profileImage),
            username: item?.technicianId?.fullName || 'N/A',
            price: `$${item?.amount || 0}`,
            status: 'Completed',
            designation: `${item?.serviceId?.name || 'General'} Technician`,
            rating: item?.technicianId?.avgRating || 0,
            location:
              item?.technicianId?.locationName || 'Location not available',
            date: `${moment(item?.createdAt).format('ddd, MMM D')} at ${
              item?.time || ''
            }`,
          }}
        />
      );
    },
    [selectedCard],
  );

  return (
    <Container extraStyle={styles.container} scrollEnabled={false}>
      <NormalHeader heading={'History'} onBackPress={() => nav.goBack()} />
      <LineBreak val={2} />

      {isLoading ? (
        <Loader />
      ) : (
        <FlatList
          data={data?.data || []}
          keyExtractor={item => item?._id?.toString()}
          contentContainerStyle={styles.contentContainerStyle}
          ListEmptyComponent={listEmptyComponent}
          ListFooterComponent={() => <LineBreak val={2} />}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainerStyle: {
    flexGrow: 1,
    paddingHorizontal: responsiveWidth(4),
    paddingBottom: 20,
    gap: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100, // Provides visual centering in the list area
  },
  emptyText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default History;
