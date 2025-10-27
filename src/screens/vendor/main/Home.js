import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useEffect, useState } from 'react';
import {
  AppColors,
  getCreationStatus,
  responsiveHeight,
  responsiveWidth,
} from './../../../utils/index';
import { images } from '../../../assets/images';
import AppText from '../../../components/AppText';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import SVGIcon from '../../../components/SVGIcon';
import icons from '../../../assets/icons';
import AppTextInput from '../../../components/AppTextInput';
import LineBreak from '../../../components/LineBreak';
import HistoryCard from './../../../components/HistoryCard';
import { firstTimeVisit } from '../../../redux/slices';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../../assets/colors';
import { IMAGE_URL } from '../../../redux/constant';
import { useLazyGetAllAppointmentsQuery } from '../../../redux/services';
import Loader from '../../../components/Loader';
import { isForInitializer } from 'typescript';
import moment from 'moment';
import { useIsFocused } from '@react-navigation/native';
const cardsData = [
  { id: 1, title: 'Roland Hopper' },
  { id: 2, title: 'Alexis Clark' },
  { id: 3, title: 'Richard h.' },
  { id: 4, title: 'dakota west' },
  { id: 5, title: 'LEon Carroll' },
];

const data1 = [
  // { id: 1, title: 'TODAY' },
  // { id: 2, title: 'YESTERDAY' },
  { id: 1, title: 'REQUESTED' },
  { id: 2, title: 'DISCUSSION' },
];

const data2 = [
  {
    id: 1,
    sub_title: 'Pending',
  },
  {
    id: 2,
    sub_title: 'Accepted',
  },
  {
    id: 3,
    sub_title: 'Arrived',
  },
];

const data3 = [
  {
    id: 1,
    sub_title: 'Upcoming',
  },
  {
    id: 2,
    sub_title: 'Start',
  },
  {
    id: 3,
    sub_title: 'Completed',
  },
];

const Home = ({ navigation }) => {
  const [currentCategory, setCurrentCategory] = useState('REQUESTED');
  const [subCategory, setSubCategory] = useState(0);
  const [currentCard, setCurrentCard] = useState('Roland Hopper');
  const { firstVisit, user } = useSelector(state => state.persistedData);
  const [getAllAppointments, { data, isLoading }] =
    useLazyGetAllAppointmentsQuery();
  const [filterStatusData, setFilterStatusData] = useState([]);
  const [search, setSearch] = useState('');

  const dispatch = useDispatch();
  console.log('status filteration ===>', filterStatusData);
  const combinedTabs = [...data2, ...data3];

  const isFocused = useIsFocused()

  useEffect(() => {
    getAllAppointments({ id: user?._id, type: user?.type });
  }, [isFocused]);

  useEffect(() => {
    setSubCategory(0);

    let sourceData = [];
    if (currentCategory === 'REQUESTED') {
      sourceData = data?.data?.requestForms || [];
    } else if (currentCategory === 'DISCUSSION') {
      sourceData = data?.data?.discussionForms || [];
    }

    const firstTab =
      currentCategory === 'REQUESTED' ? data2[0].sub_title : data3[0].sub_title;

    const filtered = sourceData.filter(item => item.status === firstTab);
    setFilterStatusData(filtered);
  }, [currentCategory, data]);

  useEffect(() => {
    setTimeout(() => {
      dispatch(firstTimeVisit(false));
    }, 5000);
  }, [firstVisit]);

  const showLoginMessage = () => {
    return (
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          backgroundColor: colors.white,
        }}
      >
        <Image
          resizeMode="cover"
          style={{ height: responsiveHeight(13), width: responsiveHeight(13) }}
          source={images.success}
        />
        <LineBreak val={2} />
        <AppText title={'Action Success'} />
        <LineBreak val={2} />
        <AppText fontWeight={'bold'} size={2.8} title={'LOGIN SUCCESS'} />
      </View>
    );
  };

  const splitAppointmentsByStatus = (statusTitle, index) => {
    setSubCategory(index);

    let sourceData = [];
    if (currentCategory === 'REQUESTED') {
      sourceData = data?.data?.requestForms || [];
    } else if (currentCategory === 'DISCUSSION') {
      sourceData = data?.data?.discussionForms || [];
    }

    const filtered = sourceData.filter(item => item.status == statusTitle);

    setFilterStatusData(filtered);
  };

  const onSearchFilter = () => {
    const requested = data?.data?.requestForms || [];
    const discussion = data?.data?.discussionForms || [];

    // Combine both
    const combined = [...requested, ...discussion];

    const filtered = combined.filter(
      item =>
        item?.userId?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        item?.userId?.locationName
          ?.toLowerCase()
          .includes(search.toLowerCase()),
    );

    setFilterStatusData(filtered);
  };

  const getDisplayData = () => {
    if (search.length > 0) return filterStatusData;

    if (subCategory !== null) return filterStatusData;

    if (currentCategory === 'REQUESTED') {
      return data?.data?.requestForms || [];
    }
    return data?.data?.discussionForms || [];
  };

  // console.log('display data ===>', getDisplayData());

  if (firstVisit) {
    return showLoginMessage();
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        backgroundColor: '#f8f9fd',
        flexGrow: 1,
        padding: responsiveHeight(2),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          marginBottom: 20,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            gap: responsiveHeight(2),
            alignItems: 'center',
          }}
        >
          <Image
            style={{
              width: responsiveWidth(16.4),
              height: responsiveHeight(7.5),
            }}
            borderRadius={100}
            source={
              user?.profileImage
                ? { uri: `${IMAGE_URL}${user.profileImage}` }
                : images.profile
            }
          />
          <View>
            <View style={{ flexDirection: 'row', gap: responsiveHeight(1) }}>
              <AppText title="GOOD MORNING!" />
              <SVGIcon height={20} width={20} xml={icons.plant} />
            </View>
            <View style={{ flexDirection: 'row', gap: responsiveHeight(0.5) }}>
              <SVGIcon height={20} width={20} xml={icons.locationPin} />
              <AppText
                color={'#777777'}
                title={user?.location?.locationName || 'No location found'}
              />
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: responsiveHeight(1.5) }}>
          <TouchableOpacity onPress={() => navigation.navigate('AppSettings')}>
            <Feather name="settings" size={25} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('MainProfile')}>
            <Feather name="user" size={25} />
          </TouchableOpacity>
        </View>
      </View>

      <AppTextInput
        inputWidth={77}
        value={search}
        onChangeText={text => setSearch(text)}
        rightIcon={
          <TouchableOpacity onPress={() => onSearchFilter()}>
            <Ionicons name="search-outline" size={25} />
          </TouchableOpacity>
        }
        inputPlaceHolder="What are you looking for?"
        placeholderTextColor="#777777"
        borderRadius={25}
      />
      <LineBreak val={2} />
      <AppText title="APPOINTMENTS" fontWeight="bold" size={2.4} />
      {search.length < 1 && (
        <View>
          <FlatList
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: responsiveHeight(-3) }}
            contentContainerStyle={{
              gap: responsiveHeight(1),
              marginTop: responsiveHeight(1),
              paddingHorizontal: responsiveHeight(3),
            }}
            data={data1}
            horizontal
            renderItem={({ item, index }) => {
              return (
                <TouchableOpacity
                  onPress={() => setCurrentCategory(item.title)}
                  style={{
                    backgroundColor:
                      item.title === currentCategory ? '#000' : '#fff',
                    borderWidth: 1,
                    borderColor: '#000',
                    width: responsiveWidth(45),
                    alignItems: 'center',
                    borderRadius: responsiveHeight(3),
                    padding: responsiveHeight(0.8),
                  }}
                >
                  <AppText
                    color={item.title === currentCategory ? '#fff' : '#000'}
                    title={item.title}
                  />
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}
      <LineBreak val={2} />
      <View>
        <FlatList
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: responsiveHeight(-3) }}
          contentContainerStyle={{
            gap: responsiveHeight(1),
            marginTop: responsiveHeight(1),
            paddingHorizontal: responsiveHeight(3),
          }}
          data={
            search.length > 0
              ? combinedTabs
              : currentCategory === 'REQUESTED'
              ? data2
              : data3
          }
          horizontal
          renderItem={({ item, index }) => {
            return (
              <TouchableOpacity
                onPress={() => splitAppointmentsByStatus(item.sub_title, index)}
                style={{
                  backgroundColor: index === subCategory ? '#000' : '#fff',
                  borderWidth: 1,
                  borderColor: '#000',
                  width: responsiveWidth(29),
                  alignItems: 'center',
                  borderRadius: responsiveHeight(3),
                  padding: responsiveHeight(0.6),
                }}
              >
                <AppText
                  color={index === subCategory ? '#fff' : '#000'}
                  title={item.sub_title}
                />
              </TouchableOpacity>
            );
          }}
        />
      </View>
      <View style={{ marginTop: responsiveHeight(2) }}>
        {isLoading ? (
          <Loader style={{ marginVertical: responsiveHeight(3) }} />
        ) : (
          <FlatList
            contentContainerStyle={{ gap: responsiveHeight(2) }}
            ListEmptyComponent={() => (
              <AppText align={'center'} title={'No Appointments Found'} />
            )}
            data={getDisplayData()}
            renderItem={({ item, index }) => {
              return (
                <HistoryCard
                  onCardPress={() => {
                    setCurrentCard(item._id);
                    // console.log('items ===>',item)
                    if (
                      item.status === 'Upcoming' ||
                      item.status === 'Start' ||
                      item.status === 'Stop' ||
                      item.status === 'Rejected'
                    ) {
                      navigation.navigate('StartJob', { status: item.status,formId: item._id });
                    } else if (item.status === 'Completed') {
                      navigation.navigate('ClientReview',{reviewId: ''});
                    } else {
                      navigation.navigate('Services', {
                        ids: {
                          requestFormId: item._id,
                          technicianId: item.technicianId,
                          serviceId: item.serviceId,
                          user: item.userId
                        },
                        // status: item.status,
                      });
                    }
                  }}
                  item={{
                    id: item._id,
                    profImg: `${IMAGE_URL}${item.userId?.profileImage}`,
                    username: item.userId?.fullName,
                    // designation: 'Expert Gerdener',
                    // rating: '3.5',
                    location: item.userId.locationName,
                    status: moment(item.createdAt).calendar(null, {
                      sameDay: '[TODAY]',
                      lastDay: '[YESTERDAY]',
                      lastWeek: 'dddd',
                      sameElse: 'MMM D',
                    }),
                    date: moment(item.createdAt).format('ddd, MMM D'),
                    fullTime: item.time,
                  }}
                  selectedCard={{ id: currentCard }}
                  activeCardBgColor={
                    item._id === currentCard
                      ? AppColors.PRIMARY
                      : AppColors.WHITE
                  }
                  appointment={true}
                  // profiles={'profiles'}
                  isHideClose={false}
                  isShowBadge={true}
                  viewDetailsHandlePress={() => navigation.navigate('Services')}
                />
              );
            }}
          />
        )}
      </View>
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({});
