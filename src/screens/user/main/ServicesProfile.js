import { useEffect, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import Container from '../../../components/Container';
import { useNavigation } from '@react-navigation/native';
import NormalHeader from '../../../components/NormalHeader';
import LineBreak from '../../../components/LineBreak';
import {
  AppColors,
  getProfileImage,
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../utils';
import HistoryCard from '../../../components/HistoryCard';
import AppText from '../../../components/AppText';
import AppTextInput from './../../../components/AppTextInput';
import Entypo from 'react-native-vector-icons/Entypo';
import Button from '../../../components/Button';
import { colors } from '../../../assets/colors';
import AppCalendar from '../../../components/AppCalendar';
import AppClock from '../../../components/AppClock';
import { IMAGE_URL } from '../../../redux/constant';
import { useSelector } from 'react-redux';
import moment from 'moment';
import {
  useCreateRequestFormMutation,
  useUpdateDiscussionMutation,
} from '../../../redux/services';
import Toast from 'react-native-simple-toast';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { MAP_API_KEY } from '../../../redux/constant';

const ServicesProfile = ({ route }) => {
  const nav = useNavigation();
  const [isShowCalendar, setIsShowCalendar] = useState(false);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState('');
  const { user } = useSelector(state => state.persistedData);
  const [address, setAddress] = useState(user?.location?.locationName || '');
  const [latitude, setLatitude] = useState(); // Default latitude
  const [longitude, setLongitude] = useState(); // Default longitude
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [createRequestForm, { isLoading }] = useCreateRequestFormMutation();
  //   const [comment, setComment] = useState('');
  // const [updateDiscussion, { isLoading: discussionLoading }] =
  //   useUpdateDiscussionMutation();
  const { requestData, profileData, coordinates } = route?.params;
  const selectedTab = route?.params;

  useEffect(() => {
    if (coordinates) {
      setLatitude(coordinates.lat);
      setLongitude(coordinates.lng);
    }
  }, [coordinates]);

  const onConfirmBooking = async () => {
    if (!date) {
      Toast.show('Please select booking date', Toast.SHORT);
      return;
    }
    if (!time) {
      Toast.show('Please select booking time', Toast.SHORT);
      return;
    }
    if (!address) {
      Toast.show('Please enter your address', Toast.SHORT);
      return;
    }
    let data = {
      userId: user?._id,
      technicianId: profileData._id,
      serviceId: requestData.service,
      propertyType: requestData.propertyType,
      areaTobeTreated: requestData.area,
      ...(requestData?.residential && {
        residentailType: requestData?.residential,
      }),
      // "areaSqFt": 120,
      severity: requestData.severity,
      date: moment(date).format('DD-MM-YYYY'),
      time,
      address,
      notes: requestData.note,
      longitude,
      latitude,
      // locationName: "Florida City Canal Park"
    };
    await createRequestForm(data)
      .unwrap()
      .then(res => {
        console.log('request form response ===>', res);
        // Toast.show(res.msg)
        if (res.success) {
          nav.navigate('WorkDone', {
            profileData: {
              ...profileData,
              appointmentData: { status: res.data.status, id: res.data._id },
            },
          });
        }
      })
      .catch(error => {
        console.log('error while creating request form ===>', error);
        console.log('error msg ===>', error?.data?.msg);
        let msg = error?.data?.msg;
        if (msg?.includes('Existing booking')) {
          msg = 'Technician already have an appointment on this time.';
        }
        Toast.show(msg || 'Some problem occured', Toast.SHORT);
      });
  };

  const onCheckStatus = () => {
    nav.navigate('PestTechnician', { pest_tech: profileData });
  };

  const reviewOrStatus = async status => {
    // return console.log(profileData)
    // if (status === 'Completed') {
    //   nav.navigate('PaymentSuccess', { pest_tech: profileData, });
    // }
    // {
    nav.navigate('Payment', { pest_tech: profileData, request: false });

    // }
  };

  console.log('profileData:-', profileData);
  // console.log('Latitude and Longitude:- ', latitude, longitude);
  return (
    <Container>
      <NormalHeader
        heading={profileData?.fullName}
        onBackPress={() => nav.goBack()}
      />
      <LineBreak val={2} />
      <View style={{ paddingHorizontal: responsiveWidth(4) }}>
        <HistoryCard
          activeOpacity={1}
          item={{
            id: profileData?._id,
            profImg: getProfileImage(profileData?.profileImage),
            // profImg: profileData?.isGoogleUser ? `${profileData?.profileImage}` : `${IMAGE_URL}${profileData?.profileImage}`,
            username: `${profileData?.fullName}`,
            designation: 'Pest Technician',
            rating: profileData?.avgRating || 0,
            time: '30',
          }}
          selectedCard={{ id: profileData?._id }}
          favourite={profileData.favouriteBy?.includes(user?._id)}
          activeCardBgColor={AppColors.PRIMARY}
          profiles={'profiles'}
          isHideClose={false}
          isShowBadge={true}
          viewDetailsHandlePress={() => nav.navigate('ServicesProfile')}
        />
        <LineBreak val={2} />
        <AppText
          title={`Experience in Pest Technician`}
          color={AppColors.BLACK}
          size={2.5}
          fontWeight={'bold'}
        />
        <LineBreak val={0.5} />
        <AppText
          title={'No Detail Found'}
          color={AppColors.DARKGRAY}
          size={1.5}
        />

        <LineBreak val={2} />
        {profileData?.previousScreen === 'Appointments' ? (
          <View
            style={{
              marginTop: responsiveHeight(2),
              gap: responsiveHeight(1.5),
            }}
          >
            <AppText
              title={'Appointment Details'}
              size={2.2}
              fontWeight="bold"
              color={AppColors.BLACK}
            />

            <AppText
              title={`Date: ${profileData?.appointmentData?.date}`}
              size={1.8}
              color={AppColors.DARKGRAY}
            />

            <AppText
              title={`Time: ${profileData?.appointmentData?.time || 'N/A'}`}
              size={1.8}
              color={AppColors.DARKGRAY}
            />

            {profileData?.appointmentData?.type === 'REQUESTED' && (
              <AppText
                title={`Address: ${
                  profileData?.appointmentData?.address || 'N/A'
                }`}
                size={1.8}
                color={AppColors.DARKGRAY}
              />
            )}

            <AppText
              title={`Status: ${
                profileData?.appointmentData?.status || 'Pending'
              }`}
              size={1.8}
              color={AppColors.BLACK}
              fontWeight="bold"
            />

            <LineBreak val={2} />
            {profileData?.appointmentData?.type === 'DISCUSSION' &&
            (profileData?.appointmentData?.status === 'Completed' ||
              profileData?.appointmentData?.status === 'Stop') ? (
              <Button
                onPress={() =>
                  reviewOrStatus(profileData?.appointmentData?.status)
                }
                title={
                  profileData?.appointmentData?.status === 'Completed'
                    ? 'Pay'
                    : 'Complete your job'
                }
                // indicator={discussionLoading}
                textTransform={'uppercase'}
                color={colors.primary}
                width={90}
              />
            ) : (
              profileData?.appointmentData?.type === 'REQUESTED' &&
              selectedTab?.profileData?.appointmentData?.status ==
                'On The Way' && (
                <Button
                  onPress={() => onCheckStatus()}
                  title={'See Technician on Map'}
                  // indicator={isLoading}
                  textTransform={'uppercase'}
                  color={colors.primary}
                  width={90}
                />
              )
            )}
          </View>
        ) : (
          <>
            <View style={{ gap: responsiveHeight(1) }}>
              <View>
                <AppText
                  title={'Select Date'}
                  color={AppColors.BLACK}
                  size={1.8}
                  fontWeight={'bold'}
                />
                <LineBreak val={0.5} />
                <TouchableOpacity
                  onPress={() => setIsShowCalendar(!isShowCalendar)}
                >
                  <AppTextInput
                    inputPlaceHolder={'MM/DD/YYYY'} // Assuming user wants this or similar placeholder
                    borderRadius={30}
                    editable={false}
                    value={date ? moment(date).format('MM/DD/YYYY') : ''}
                    inputWidth={77}
                    rightIcon={
                      <Entypo
                        name="chevron-small-down"
                        size={responsiveFontSize(3.5)}
                        color={AppColors.BLACK}
                      />
                    }
                  />
                </TouchableOpacity>
                {isShowCalendar && (
                  <AppCalendar
                    date={date}
                    changeDate={day => {
                      setDate(day);
                      setIsShowCalendar(false);
                    }}
                  />
                )}
              </View>

              <View>
                <AppText
                  title={'Select Time'}
                  color={AppColors.BLACK}
                  size={1.8}
                  fontWeight={'bold'}
                />
                <LineBreak val={0.5} />
                <TouchableOpacity
                  onPress={() => setDatePickerVisibility(!isDatePickerVisible)}
                >
                  <AppTextInput
                    inputPlaceHolder={'Select Time'}
                    borderRadius={30}
                    inputWidth={77}
                    editable={false}
                    value={time}
                    rightIcon={
                      <Entypo
                        name="chevron-small-down"
                        size={responsiveFontSize(3.5)}
                        color={AppColors.BLACK}
                      />
                    }
                  />
                </TouchableOpacity>
                <AppClock
                  isDatePickerVisible={isDatePickerVisible}
                  handleConfirm={date =>
                    setTime(moment(date).format('hh:mm A'))
                  }
                  setDatePickerVisibility={setDatePickerVisibility}
                />
              </View>

              <View style={{ zIndex: 10000, position: 'relative' }}>
                <AppText
                  title={'Address'}
                  color={AppColors.BLACK}
                  size={1.8}
                  fontWeight={'bold'}
                />
                <LineBreak val={0.5} />

                <GooglePlacesAutocomplete
                  placeholder="Address"
                  fetchDetails={true}
                  onPress={(data, details = null) => {
                    console.log('data, details:-', data, details);
                    setAddress(data.description);
                    if (details) {
                      setLatitude(details.geometry.location.lat);
                      setLongitude(details.geometry.location.lng);
                    }
                  }}
                  query={{
                    key: MAP_API_KEY,
                    language: 'en',
                  }}
                  onFail={error => {
                    console.error('Google Places Library Error: ', error);
                    Toast.show(
                      `Library Error: ${error?.message || 'Unknown error'}`,
                      Toast.LONG,
                    );
                  }}
                  onTimeout={() => {
                    console.log('Google Places Timeout');
                    // Toast.show('Google Places Timeout', Toast.SHORT);
                  }}
                  onNotFound={() => {
                    console.log('Google Places Not Found');
                    // Toast.show('Google Places Not Found', Toast.SHORT);
                  }}
                  debounce={400}
                  minLength={2}
                  enablePoweredByContainer={false}
                  keepResultsAfterBlur={true}
                  keyboardShouldPersistTaps={'always'}
                  listEmptyComponent={() => (
                    <View
                      style={{ padding: 10, backgroundColor: AppColors.WHITE }}
                    >
                      <AppText
                        title="No matching places found"
                        color={AppColors.BLACK}
                        size={1.5}
                      />
                    </View>
                  )}
                  prepopulatedValue={address}
                  styles={{
                    container: {
                      flex: 0,
                      zIndex: 10000,
                    },
                    textInputContainer: {
                      borderWidth: 1,
                      borderColor: AppColors.PRIMARY,
                      borderRadius: 30,
                      backgroundColor: AppColors.WHITE,
                      paddingRight: 10,
                    },
                    textInput: {
                      height: responsiveHeight(5),
                      color: AppColors.BLACK,
                      fontSize: responsiveFontSize(1.8),
                      backgroundColor: 'transparent',
                    },
                    listView: {
                      backgroundColor: AppColors.WHITE,
                      zIndex: 10000,
                      position: 'absolute',
                      top: 50,
                      elevation: 5,
                    },
                  }}
                  textInputProps={{
                    placeholderTextColor: AppColors.GRAY,
                    onChangeText: async text => {
                      if (text.length >= 2) {
                        console.log('Manual Fetch Diagnostic for:', text);
                        try {
                          const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
                            text,
                          )}&key=${MAP_API_KEY}&language=en`;
                          const response = await fetch(url);
                          const json = await response.json();
                          console.log('Manual Fetch Result:', {
                            status: response.status,
                            ok: response.ok,
                            data: json,
                          });
                          if (!response.ok || json.status !== 'OK') {
                            Toast.show(
                              `API Diagnostic: ${json.status} - ${
                                json.error_message || 'Check logs'
                              }`,
                              Toast.LONG,
                            );
                          }
                        } catch (err) {
                          console.error('Manual Fetch Network Error:', err);
                          Toast.show(
                            `Network Error: ${err.message}`,
                            Toast.LONG,
                          );
                        }
                      }
                    },
                  }}
                  renderRightButton={() => (
                    <View style={{ justifyContent: 'center' }}>
                      <Entypo
                        name="location-pin"
                        size={responsiveFontSize(3.5)}
                        color={AppColors.BLACK}
                      />
                    </View>
                  )}
                />
              </View>
            </View>

            <LineBreak val={4} />

            <Button
              onPress={() => onConfirmBooking()}
              title={'Confirm booking'}
              indicator={isLoading}
              textTransform={'uppercase'}
              color={colors.primary}
              width={90}
            />
          </>
        )}
      </View>
    </Container>
  );
};

export default ServicesProfile;
