import { useState } from 'react';
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

const ServicesProfile = ({ route }) => {
  const nav = useNavigation();
  const [isShowCalendar, setIsShowCalendar] = useState(false);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(moment().format('hh:mm A'));
  const { user } = useSelector(state => state.persistedData);
  const [address, setAddress] = useState(user?.location?.locationName || '');
  //   const [comment, setComment] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [createRequestForm, { isLoading }] = useCreateRequestFormMutation();
  // const [updateDiscussion, { isLoading: discussionLoading }] =
  //   useUpdateDiscussionMutation();

  const { requestData, profileData } = route?.params;
  console.log('requestData ===>', profileData);

  const onConfirmBooking = async () => {
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
      longitude: -80.4808,
      latitude: 25.4482,
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
        Toast.show('Some problem occured');
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

  return (
    <Container>
      <NormalHeader
        heading={profileData?.fullName}
        onBackPress={() => nav.goBack()}
      />
      <LineBreak val={2} />
      <View style={{ paddingHorizontal: responsiveWidth(4) }}>
        <HistoryCard
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
              title={`Date: ${
                moment(profileData?.appointmentData?.date).format(
                  'DD-MM-YYYY',
                ) || 'N/A'
              }`}
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
            // profileData?.appointmentData?.status === 'Completed') ||
            profileData?.appointmentData?.status === 'Stop' ? (
              <Button
                onPress={() =>
                  reviewOrStatus(profileData?.appointmentData?.status)
                }
                title={'Complete your job'}
                // indicator={discussionLoading}
                textTransform={'uppercase'}
                color={colors.primary}
                width={90}
              />
            ) : (
              profileData?.appointmentData?.type === 'REQUESTED' && (
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
                    inputPlaceHolder={'03/17/2025'}
                    borderRadius={30}
                    editable={false}
                    value={moment(date).format('DD/MM/YYYY')}
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
                  <AppCalendar changeDate={day => setDate(day)} date={date} />
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
                    inputPlaceHolder={'10:00 AM'}
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
              <View>
                <AppText
                  title={'Address'}
                  color={AppColors.BLACK}
                  size={1.8}
                  fontWeight={'bold'}
                />
                <LineBreak val={0.5} />
                <AppTextInput
                  inputPlaceHolder={'371 7th Ave, New York, NY 10001'}
                  borderRadius={30}
                  inputWidth={77}
                  placeholderTextColor={AppColors.GRAY}
                  value={address}
                  onChangeText={text => setAddress(text)}
                  rightIcon={
                    <Entypo
                      name="location-pin"
                      size={responsiveFontSize(3.5)}
                      color={AppColors.BLACK}
                    />
                  }
                />
              </View>
              {/* <View>
            <AppText
              title={'Add Comment'}
              color={AppColors.BLACK}
              size={1.8}
              fontWeight={'bold'}
            />
            <LineBreak val={0.5} />
            <AppTextInput
              inputPlaceHolder={'Lorem ipsum...'}
              borderRadius={7}
              value={comment}
              onChangeText={text => setComment(text)}
              inputWidth={77}
              inputHeight={12}
              multiline={true}
              textAlignVertical={'top'}
            />
          </View> */}
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
