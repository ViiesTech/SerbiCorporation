import { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import Container from '../../../components/Container';
import { useNavigation } from '@react-navigation/native';
import NormalHeader from '../../../components/NormalHeader';
import LineBreak from '../../../components/LineBreak';
// import { images } from '../../../assets/images';
import HistoryCard from '../../../components/HistoryCard';
import { responsiveWidth } from '../../../utils';
import { useLazyGetDiscussionFormsQuery } from '../../../redux/services';
import Loader from '../../../components/Loader';
import { useSelector } from 'react-redux';
import { IMAGE_URL } from '../../../redux/constant';
import moment from 'moment';

const cardData = [
  {
    id: 1,
    // profImg: images.map,
    username: 'Roland Hopper',
    price: '$79.00',
    status: 'Completed',
    designation: 'Pest Technician',
    rating: '3.5',
    location: 'California, United State',
    date: 'Tuesday, 11 March 2025 at 10:00 AM',
  },
  {
    id: 2,
    // profImg: images.map,
    username: 'Roland Hopper',
    price: '$79.00',
    status: 'Completed',
    designation: 'Pest Technician',
    rating: '3.5',
    location: 'California, United State',
    date: 'Tuesday, 11 March 2025 at 10:00 AM',
  },
  {
    id: 3,
    // profImg: images.map,
    username: 'Roland Hopper',
    price: '$79.00',
    status: 'Completed',
    designation: 'Pest Technician',
    rating: '3.5',
    location: 'California, United State',
    date: 'Tuesday, 11 March 2025 at 10:00 AM',
  },
  {
    id: 4,
    // profImg: images.map,
    username: 'Roland Hopper',
    price: '$79.00',
    status: 'Completed',
    designation: 'Pest Technician',
    rating: '3.5',
    location: 'California, United State',
    date: 'Tuesday, 11 March 2025 at 10:00 AM',
  },
  {
    id: 5,
    // profImg: images.map,
    username: 'Roland Hopper',
    price: '$79.00',
    status: 'Completed',
    designation: 'Pest Technician',
    rating: '3.5',
    location: 'California, United State',
    date: 'Tuesday, 11 March 2025 at 10:00 AM',
  },
  {
    id: 6,
    // profImg: images.map,
    username: 'Roland Hopper',
    price: '$79.00',
    status: 'Completed',
    designation: 'Pest Technician',
    rating: '3.5',
    location: 'California, United State',
    date: 'Tuesday, 11 March 2025 at 10:00 AM',
  },
  {
    id: 7,
    // profImg: images.map,
    username: 'Roland Hopper',
    price: '$79.00',
    status: 'Completed',
    designation: 'Gardener',
    rating: '3.5',
    location: 'California, United State',
    date: 'Tuesday, 11 March 2025 at 10:00 AM',
  },
  {
    id: 8,
    // profImg: images.map,
    username: 'Roland Hopper',
    price: '$79.00',
    status: 'Completed',
    designation: 'Gardener',
    rating: '3.5',
    location: 'California, United State',
    date: 'Tuesday, 11 March 2025 at 10:00 AM',
  },
];

const History = () => {
  const nav = useNavigation();
  const [selectedCard, setSelectedCard] = useState({ id: 1 });
  const { user } = useSelector(state => state.persistedData);

  const [getAllDiscussionForms, { data, isLoading }] =
    useLazyGetDiscussionFormsQuery();

  console.log('history ===>', data);
  console.log('id ===>', user?._id);

  useEffect(() => {
    getAllDiscussionForms({
      id: user?._id,
      type: user?.type,
      status: 'Completed',
    });
  }, []);

  return (
    <Container>
      <NormalHeader heading={'History'} onBackPress={() => nav.goBack()} />
      <LineBreak val={2} />
      {isLoading ? (
        <Loader />
      ) : (
        <FlatList
          data={data?.data}
          contentContainerStyle={{
            paddingHorizontal: responsiveWidth(4),
            gap: 15,
          }}
          ListFooterComponent={() => <LineBreak val={2} />}
          renderItem={({ item }) => {
            return (
              <HistoryCard
                item={{
                  id: item?._id,
                  profImg: `${IMAGE_URL}${item.technicianId?.profileImage}`,
                  username: item.technicianId?.fullName,
                  price: `$${item.amount}`,
                  status: 'Completed',
                  designation: `${item.serviceId.name} Technician`,
                  rating: item?.technicianId?.avgRating || 0,
                  location: item?.technicianId?.locationName,
                  date: `${moment(item.createdAt).format('ddd, MMM D')} at ${item.time}`,
                }}
                selectedCard={selectedCard}
                history={true}
                onCardPress={() => setSelectedCard({ id: item._id })}
              />
            );
          }}
        />
      )}
    </Container>
  );
};

export default History;
