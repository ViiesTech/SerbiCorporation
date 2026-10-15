import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import moment from 'moment';
import Toast from 'react-native-simple-toast';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import LottieView from 'lottie-react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';

import Container from '../../../components/Container';
import NormalHeader from '../../../components/NormalHeader';
import AppCalendar from '../../../components/AppCalendar';
import AppClock from '../../../components/AppClock';
import Loader from '../../../components/Loader';

import {
  getProfileImage,
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
  openDialer,
} from '../../../utils';
import { images } from '../../../assets/images';
import { colors } from '../../../assets/colors';
import { MAP_API_KEY } from '../../../redux/constant';
import {
  useCreateRequestFormMutation,
  useAddToFavouritesMutation,
} from '../../../redux/services';

const ServicesProfile = ({ route }) => {
  const nav = useNavigation();
  const { user } = useSelector(state => state.persistedData);
  const { requestData, profileData, coordinates } = route?.params || {};
  const selectedTab = route?.params;

  const [isShowCalendar, setIsShowCalendar] = useState(false);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState('');
  const [address, setAddress] = useState(user?.location?.locationName || '');
  const [latitude, setLatitude] = useState(coordinates?.lat);
  const [longitude, setLongitude] = useState(coordinates?.lng);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [favourite, setFavourite] = useState(
    profileData?.favouriteBy?.includes(user?._id) || false,
  );

  const [createRequestForm, { isLoading }] = useCreateRequestFormMutation();
  const [addToFavourites] = useAddToFavouritesMutation();
  const googlePlacesRef = useRef();

  useEffect(() => {
    if (coordinates) {
      setLatitude(coordinates.lat);
      setLongitude(coordinates.lng);
    }
  }, [coordinates]);

  const handleSetHomeAddress = () => {
    if (user?.location?.locationName) {
      setAddress(user.location.locationName);
      if (user?.location?.coordinates) {
        setLongitude(user.location.coordinates[0]);
        setLatitude(user.location.coordinates[1]);
      }
      googlePlacesRef.current?.setAddressText(user.location.locationName);
      Toast.show('Home address selected', Toast.SHORT);
    } else {
      Toast.show('No home address saved in your profile', Toast.SHORT);
    }
  };

  const handleToggleFavourite = async () => {
    try {
      setFavourite(!favourite);
      const res = await addToFavourites({
        userId: user?._id,
        technicianId: profileData?._id,
      }).unwrap();
      Toast.show(res.msg || 'Success', Toast.SHORT);
    } catch (err) {
      setFavourite(favourite);
      Toast.show('Could not update favorites', Toast.SHORT);
    }
  };

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

    const payload = {
      userId: user?._id,
      technicianId: profileData?._id,
      serviceId: requestData?.service,
      propertyType: requestData?.propertyType,
      areaTobeTreated: requestData?.area,
      ...(requestData?.residential && {
        residentailType: requestData?.residential,
      }),
      severity: requestData?.severity,
      date: moment(date).format('DD-MM-YYYY'),
      time,
      address,
      notes: requestData?.note,
      longitude,
      latitude,
    };

    try {
      const res = await createRequestForm(payload).unwrap();
      if (res.success) {
        nav.navigate('WorkDone', {
          profileData: {
            ...profileData,
            appointmentData: { status: res.data?.status, id: res.data?._id },
          },
        });
      }
    } catch (error) {
      let msg = error?.data?.msg;
      if (msg?.includes('Existing booking')) {
        msg = 'Technician already has an appointment at this time.';
      }
      Toast.show(msg || 'Failed to confirm booking', Toast.SHORT);
    }
  };

  const profileImageSource =
    profileData?.profileImage &&
    !profileData.profileImage.endsWith('/undefined') &&
    profileData.profileImage.trim() !== ''
      ? { uri: getProfileImage(profileData.profileImage) }
      : images.userProfile;

  return (
    <Container extraStyle={styles.safeAreaBg} style={styles.screenBg}>
      <NormalHeader
        heading={profileData?.fullName || 'Technician Profile'}
        onBackPress={() => nav.goBack()}
      />

      <View style={styles.contentWrapper}>
        {/* Hero Technician Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            {/* Avatar with Online Dot */}
            <View style={styles.avatarWrapper}>
              <Image source={profileImageSource} style={styles.avatar} />
              <View style={styles.onlineBadge} />
            </View>

            {/* Middle Info */}
            <View style={styles.heroInfo}>
              <View style={styles.nameWishlistRow}>
                <Text style={styles.heroName} numberOfLines={1}>
                  {profileData?.fullName || 'Pest Technician'}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleToggleFavourite}
                  style={[styles.heartBtn, favourite && styles.heartBtnActive]}
                >
                  <AntDesign
                    name={favourite ? 'heart' : 'hearto'}
                    size={16}
                    color={favourite ? '#EF4444' : '#64748B'}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.badgesRow}>
                <View style={styles.specialtyBadge}>
                  <Text style={styles.specialtyBadgeText}>
                    {profileData?.service?.name
                      ? `${profileData.service.name} Specialist`
                      : 'Certified Technician'}
                  </Text>
                </View>

                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={11} color="#F59E0B" />
                  <Text style={styles.ratingText}>
                    {profileData?.avgRating
                      ? Number(profileData.avgRating).toFixed(1)
                      : '5.0'}
                  </Text>
                </View>
              </View>

              {/* Typically reply badge */}
              <View style={styles.replyTimeRow}>
                <View style={styles.pulseDot} />
                <Text style={styles.replyTimeText}>
                  Typically replies in ~30s
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Actions Row: Call & Chat */}
          <View style={styles.heroActionsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.callActionBtn}
              onPress={() =>
                openDialer(profileData?.phone || profileData?.phoneNumber)
              }
            >
              <Ionicons name="call" size={15} color="#0F172A" />
              <Text style={styles.callActionText}>Call Technician</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.chatActionBtn}
              onPress={() =>
                nav.navigate('Chat', {
                  otherUserId: profileData?._id,
                  userName: profileData?.fullName,
                  userImage: profileData?.profileImage,
                })
              }
            >
              <Ionicons name="chatbubble-ellipses" size={15} color="#FFFFFF" />
              <Text style={styles.chatActionText}>Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Previous Screen == Appointments or History Condition */}
        {profileData?.previousScreen === 'Appointments' ||
        profileData?.previousScreen === 'History' ? (
          <View style={styles.appointmentDetailsCard}>
            <Text style={styles.cardHeaderTitle}>Appointment Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>
                {profileData?.appointmentData?.date || 'N/A'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time:</Text>
              <Text style={styles.detailValue}>
                {profileData?.appointmentData?.time || 'N/A'}
              </Text>
            </View>
            {profileData?.appointmentData?.address && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Address:</Text>
                <Text style={styles.detailValue}>
                  {profileData.appointmentData.address}
                </Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={styles.statusHighlight}>
                {profileData?.appointmentData?.status || 'Pending'}
              </Text>
            </View>

            {profileData?.appointmentData?.type === 'REQUESTED' &&
              profileData?.appointmentData?.status === 'Accepted' && (
                <View style={styles.lottieBox}>
                  <LottieView
                    source={require('../../../assets/animations/waiting.json')}
                    autoPlay
                    loop
                    style={styles.lottieAnim}
                  />
                  <Text style={styles.lottieStatusText}>
                    Technician will be there soon
                  </Text>
                </View>
              )}

            {profileData?.appointmentData?.type === 'REQUESTED' &&
              profileData?.appointmentData?.status === 'Arrived' && (
                <View style={styles.lottieBox}>
                  <LottieView
                    source={require('../../../assets/animations/working.json')}
                    autoPlay
                    loop
                    style={styles.lottieAnim}
                  />
                  <Text style={styles.lottieStatusText}>
                    Technician is currently working
                  </Text>
                </View>
              )}
          </View>
        ) : (
          /* Normal Booking Form Section */
          <View style={styles.formCard}>
            {/* Form Header */}
            <View style={styles.formHeaderRow}>
              <View style={styles.formHeaderIcon}>
                <Feather name="calendar" size={20} color="#0F172A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.formTitle}>Schedule Appointment</Text>
                <Text style={styles.formSubtitle}>
                  Service Fee: ${profileData?.price || 0} • Direct Dispatch
                </Text>
              </View>
            </View>

            <View style={styles.formDivider} />

            {/* Field 1: Select Date */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Feather name="calendar" size={15} color="#A0CCD9" />
                <Text style={styles.fieldLabel}>Select Date</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsShowCalendar(!isShowCalendar)}
                style={styles.inputField}
              >
                <Text
                  style={[styles.inputText, !date && styles.placeholderText]}
                >
                  {date ? moment(date).format('MM/DD/YYYY') : 'MM/DD/YYYY'}
                </Text>
                <Feather name="chevron-down" size={18} color="#64748B" />
              </TouchableOpacity>

              {isShowCalendar && (
                <View style={styles.calendarContainer}>
                  <AppCalendar
                    date={date}
                    changeDate={day => {
                      setDate(day);
                      setIsShowCalendar(false);
                    }}
                  />
                </View>
              )}
            </View>

            {/* Field 2: Select Time */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Feather name="clock" size={15} color="#A0CCD9" />
                <Text style={styles.fieldLabel}>Select Time</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setDatePickerVisibility(!isDatePickerVisible)}
                style={styles.inputField}
              >
                <Text
                  style={[styles.inputText, !time && styles.placeholderText]}
                >
                  {time || 'Select Time Slot'}
                </Text>
                <Feather name="chevron-down" size={18} color="#64748B" />
              </TouchableOpacity>

              <AppClock
                isDatePickerVisible={isDatePickerVisible}
                handleConfirm={d => setTime(moment(d).format('hh:mm A'))}
                setDatePickerVisibility={setDatePickerVisibility}
              />
            </View>

            {/* Field 3: Address & Home Shortcut */}
            <View style={[styles.fieldGroup, { zIndex: 10000 }]}>
              <View style={styles.addressLabelRow}>
                <View style={styles.fieldLabelRow}>
                  <Feather name="map-pin" size={15} color="#A0CCD9" />
                  <Text style={styles.fieldLabel}>Service Address</Text>
                </View>

                {/* Quick Action: Pick Home Address */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleSetHomeAddress}
                  style={styles.homeAddressChip}
                >
                  <Feather name="home" size={12} color="#0F172A" />
                  <Text style={styles.homeAddressChipText}>
                    Use Home Address
                  </Text>
                </TouchableOpacity>
              </View>

              <GooglePlacesAutocomplete
                ref={googlePlacesRef}
                placeholder="Enter service address..."
                fetchDetails={true}
                onPress={(data, details = null) => {
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
                requestHttpHeaders={{
                  [Platform.OS === 'ios'
                    ? 'X-Ios-Bundle-Identifier'
                    : 'X-Android-Package']:
                    Platform.OS === 'ios'
                      ? 'com.app.serbicorp'
                      : 'com.serbicorporation',
                }}
                debounce={400}
                minLength={2}
                enablePoweredByContainer={false}
                keepResultsAfterBlur={true}
                keyboardShouldPersistTaps={'always'}
                prepopulatedValue={address}
                styles={{
                  container: {
                    flex: 0,
                    zIndex: 10000,
                  },
                  textInputContainer: {
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                    borderRadius: 14,
                    backgroundColor: '#F8FAFC',
                    paddingHorizontal: 12,
                    height: 48,
                    alignItems: 'center',
                  },
                  textInput: {
                    height: 44,
                    color: '#0F172A',
                    fontSize: responsiveFontSize(1.4),
                    backgroundColor: 'transparent',
                    paddingVertical: 0,
                  },
                  listView: {
                    backgroundColor: '#FFFFFF',
                    borderRadius: 14,
                    borderColor: '#E2E8F0',
                    borderWidth: 1,
                    zIndex: 10000,
                    position: 'absolute',
                    top: 52,
                    elevation: 6,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                  },
                }}
                textInputProps={{
                  placeholderTextColor: '#94A3B8',
                }}
                renderRightButton={() => (
                  <View style={{ justifyContent: 'center' }}>
                    <Feather name="map-pin" size={16} color="#A0CCD9" />
                  </View>
                )}
              />
            </View>

            {/* Action Button: Confirm Booking */}
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={isLoading}
              onPress={onConfirmBooking}
              style={styles.confirmBtn}
            >
              {isLoading ? (
                <Loader />
              ) : (
                <>
                  <Text style={styles.confirmBtnText}>Confirm Booking</Text>
                  <View style={styles.confirmBtnIconWrapper}>
                    <Feather name="arrow-right" size={18} color="#0F172A" />
                  </View>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Container>
  );
};

export default ServicesProfile;

const styles = StyleSheet.create({
  safeAreaBg: {
    backgroundColor: '#FFFFFF',
  },
  screenBg: {
    backgroundColor: '#F8FAFC',
  },
  contentWrapper: {
    paddingHorizontal: responsiveWidth(4.5),
    paddingTop: 14,
    paddingBottom: responsiveHeight(6),
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarWrapper: {
    position: 'relative',
    width: 76,
    height: 76,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  heroInfo: {
    flex: 1,
    gap: 4,
  },
  nameWishlistRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroName: {
    fontSize: responsiveFontSize(2.0),
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 6,
  },
  heartBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartBtnActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  specialtyBadge: {
    backgroundColor: 'rgba(160, 204, 217, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  specialtyBadgeText: {
    fontSize: responsiveFontSize(1.2),
    fontWeight: '700',
    color: '#246170',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  ratingText: {
    fontSize: responsiveFontSize(1.2),
    fontWeight: '700',
    color: '#D97706',
  },
  replyTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  replyTimeText: {
    fontSize: responsiveFontSize(1.15),
    color: '#64748B',
    fontWeight: '500',
  },
  heroActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  callActionBtn: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(160, 204, 217, 0.22)',
    borderWidth: 1,
    borderColor: '#A0CCD9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  callActionText: {
    fontSize: responsiveFontSize(1.3),
    fontWeight: '700',
    color: '#0F172A',
  },
  chatActionBtn: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  chatActionText: {
    fontSize: responsiveFontSize(1.3),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  formHeaderIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#A0CCD9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A0CCD9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: responsiveFontSize(2.0),
    fontWeight: '800',
    color: '#0F172A',
  },
  formSubtitle: {
    fontSize: responsiveFontSize(1.2),
    color: '#64748B',
    marginTop: 1,
  },
  formDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 7,
  },
  addressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },
  fieldLabel: {
    fontSize: responsiveFontSize(1.4),
    fontWeight: '700',
    color: '#1E293B',
  },
  homeAddressChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(160, 204, 217, 0.25)',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A0CCD9',
  },
  homeAddressChipText: {
    fontSize: responsiveFontSize(1.1),
    fontWeight: '700',
    color: '#0F172A',
  },
  inputField: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: {
    fontSize: responsiveFontSize(1.4),
    fontWeight: '600',
    color: '#0F172A',
  },
  placeholderText: {
    color: '#94A3B8',
    fontWeight: '400',
  },
  calendarContainer: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A0CCD9',
    borderRadius: 16,
    height: 52,
    marginTop: 6,
    gap: 10,
    shadowColor: '#A0CCD9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnText: {
    fontSize: responsiveFontSize(1.7),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.2,
  },
  confirmBtnIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appointmentDetailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  cardHeaderTitle: {
    fontSize: responsiveFontSize(2.0),
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: responsiveFontSize(1.4),
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: responsiveFontSize(1.4),
    color: '#0F172A',
    fontWeight: '600',
  },
  statusHighlight: {
    fontSize: responsiveFontSize(1.4),
    color: '#10B981',
    fontWeight: '800',
  },
  lottieBox: {
    alignItems: 'center',
    marginTop: 12,
  },
  lottieAnim: {
    width: responsiveWidth(40),
    height: responsiveWidth(40),
  },
  lottieStatusText: {
    fontSize: responsiveFontSize(1.4),
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 6,
  },
});
