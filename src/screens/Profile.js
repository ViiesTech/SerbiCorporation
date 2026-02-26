import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Platform,
  View,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import Toast from 'react-native-simple-toast';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import ImageCropPicker from 'react-native-image-crop-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import { pick, types } from '@react-native-documents/picker';
import Feather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

// Components & Utils
import Container from '../components/Container';
import NormalHeader from '../components/NormalHeader';
import LineBreak from '../components/LineBreak';
import AppText from '../components/AppText';
import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';
import Loader from '../components/Loader';
import { images } from '../assets/images';
import { colors } from '../assets/colors';
import {
  AppColors,
  getCurrentLocation,
  getProfileImage,
  getShortFileName,
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../utils';
import { IMAGE_URL, MAP_API_KEY, MAP_API_KEY_IOS } from '../redux/constant';
import { useCreateUpdateProfileMutation } from '../redux/services/index';
import { useLazyGetAllServicesQuery } from '../redux/services/adminApis';

const Profile = ({ route }) => {
  const { user } = route?.params || {};
  const nav = useNavigation();
  const MAP_KEY = MAP_API_KEY;
  const googlePlacesRef = useRef();

  // --- States ---
  const [state, setState] = useState({
    fullName: user?.fullName || '',
    image: user?.profileImage
      ? getProfileImage(user?.profileImage, true)
      : images.userProfile,
    dob: user?.DOB || moment().format('DD-MM-YYYY'),
    phone: user?.phone || '',
    location: {
      name: user?.locationName || '',
      lat: user?.latitude || '',
      long: user?.longitude || '',
    },
    ss: user?.ss || '',
    license: user?.pestControlLicense?.[0]
      ? [{ file: user.pestControlLicense[0], name: 'Current License' }]
      : [],
    workingHours: {
      startTime: user?.workingHours?.startTime || '09:00 AM',
      endTime: user?.workingHours?.endTime || '05:00 PM',
    },
    service: user?.service?._id || null,
    portfolio: (user?.portfolio || []).map(file =>
      typeof file === 'string'
        ? { path: `${IMAGE_URL}${file}`, filename: file, isRemote: true }
        : file,
    ),
    price: user?.price?.toString() || '',
  });

  const [picker, setPicker] = useState({ visible: false, type: null });
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [openService, setOpenService] = useState(false);
  const [items, setItems] = useState([]);

  // --- API Hooks ---
  const [createUpdateProfile, { isLoading }] = useCreateUpdateProfileMutation();
  const [getAllServices, { data: servicesData, isLoading: serviceLoader }] =
    useLazyGetAllServicesQuery();

  useEffect(() => {
    getAllServices();
  }, [getAllServices]);

  useEffect(() => {
    if (state.location?.name) {
      googlePlacesRef.current?.setAddressText(state.location.name);
    }
  }, []);

  useEffect(() => {
    if (servicesData?.data) {
      setItems(
        servicesData.data.map(item => ({ label: item.name, value: item._id })),
      );
    }
  }, [servicesData]);

  // --- Handlers ---
  const handleInputChange = (key, value, nestedKey = null) => {
    setState(prev => ({
      ...prev,
      [key]: nestedKey ? { ...prev[key], [nestedKey]: value } : value,
    }));
  };

  const onProfilePress = async () => {
    if (!state.location?.name) {
      Toast.show('Location should not be empty', Toast.SHORT);
      return;
    }

    const data = new FormData();
    data.append('userId', user?._id || '');
    data.append('fullName', state.fullName);
    data.append('phone', state.phone);
    data.append('DOB', state.dob);
    data.append('longitude', String(state.location.long));
    data.append('latitude', String(state.location.lat));
    data.append('locationName', state.location.name);

    if (user?.type === 'Technician') {
      data.append('price', state.price || '0');
      data.append('service', state.service || '');
      data.append('workingHours', JSON.stringify(state.workingHours));
      data.append('ss', state.ss);

      // License: Only upload if it's a new file
      if (state.license[0]?.file?.startsWith('file')) {
        data.append('license', {
          uri: state.license[0].file,
          type: 'application/pdf',
          name: state.license[0].name || 'license.pdf',
        });
      }

      // Portfolio: Filter for new local files only
      state.portfolio.forEach((file, index) => {
        const uri = file.path || file.uri;
        if (uri?.startsWith('file')) {
          data.append('portfolio', {
            uri,
            type: file.type || 'image/jpeg',
            name: file.filename || `portfolio_${index}.jpg`,
          });
        }
      });
    }

    // Profile Image: Only upload if it's a new file (local path)
    const isLocalPath =
      typeof state.image === 'string' &&
      (state.image.startsWith('file') || state.image.startsWith('/'));
    if (isLocalPath) {
      data.append('profileImage', {
        uri: state.image,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });
    }

    try {
      const res = await createUpdateProfile(data).unwrap();
      Toast.show(res.msg || 'Profile Updated', Toast.SHORT);
      nav.goBack();
    } catch (error) {
      console.error('Update Error:', error);
      Toast.show('Failed to update profile', Toast.SHORT);
    }
  };

  const onImageSelect = () => {
    ImageCropPicker.openPicker({
      width: 400,
      height: 400,
      cropping: true,
      mediaType: 'photo',
    })
      .then(image => {
        const path =
          Platform.OS === 'ios' && !image.path.startsWith('file://')
            ? `file://${image.path}`
            : image.path;
        handleInputChange('image', path);
      })
      .catch(err => console.log('Picker Error:', err));
  };

  const onSelectFile = async type => {
    try {
      const [res] = await pick({
        type: type === 'license' ? [types.pdf] : [types.images],
      });
      if (type === 'license') {
        handleInputChange('license', [{ file: res.uri, name: res.name }]);
      } else {
        setState(prev => ({
          ...prev,
          portfolio: [
            ...prev.portfolio,
            { path: res.uri, filename: res.name, type: res.type },
          ],
        }));
      }
    } catch (err) {
      if (!err.cancelled) console.log(err);
    }
  };

  const fetchCurrentLocation = async () => {
    try {
      Toast.show('Fetching location...', Toast.SHORT);
      const { latitude, longitude } = await getCurrentLocation();
      console.log('latitude & longitude:-', latitude, longitude);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${MAP_KEY}`;
      const res = await fetch(url, {
        headers: {
          [Platform.OS === 'ios'
            ? 'X-Ios-Bundle-Identifier'
            : 'X-Android-Package']:
            Platform.OS === 'ios'
              ? 'com.app.serbicorp'
              : 'com.serbicorporation',
        },
      });
      const data = await res.json();
      console.log('res in fetchCurrentLocation:-', data);
      if (data.status === 'OK') {
        const address = data.results[0].formatted_address;
        setState(prev => ({
          ...prev,
          location: { name: address, lat: latitude, long: longitude },
        }));
        googlePlacesRef.current?.setAddressText(address);
      }
    } catch (error) {
      Toast.show('Location Error', Toast.SHORT);
    }
  };

  const profileSrc =
    typeof state.image === 'string' ? { uri: state.image } : state.image;

  console.log('state.location', state.location);
  console.log('user:-', user);

  return (
    <Container keyboardShouldPersistTaps="handled">
      <NormalHeader heading="Profile" onBackPress={() => nav.goBack()} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <LineBreak val={3} />

        {/* Profile Image */}
        <View style={{ alignItems: 'center' }}>
          <ImageBackground
            source={profileSrc}
            style={{ width: 100, height: 100 }}
            imageStyle={{ borderRadius: 50 }}
          >
            <TouchableOpacity
              onPress={onImageSelect}
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor:
                  user?.type === 'Technician'
                    ? colors.secondary_button
                    : colors.primary,
                position: 'absolute',
                bottom: 0,
                right: 0,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Feather name="plus" size={18} color={AppColors.BLACK} />
            </TouchableOpacity>
          </ImageBackground>
        </View>

        <View
          style={{
            paddingHorizontal: responsiveWidth(5),
            marginTop: 20,
            gap: 20,
          }}
        >
          {/* Full Name */}
          <View>
            <AppText
              title="Your Full Name"
              color={AppColors.LIGHTGRAY}
              size={1.8}
            />
            <LineBreak val={1} />
            <AppTextInput
              value={state.fullName}
              onChangeText={t => handleInputChange('fullName', t)}
              borderRadius={30}
              borderColor={AppColors.BLACK}
            />
          </View>

          {/* DOB */}
          <TouchableOpacity onPress={() => setIsDatePickerVisible(true)}>
            <AppText
              title="Date Of Birth"
              color={AppColors.LIGHTGRAY}
              size={1.8}
            />
            <LineBreak val={1} />
            <AppTextInput
              value={state.dob}
              editable={false}
              borderRadius={30}
              borderColor={AppColors.BLACK}
            />
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={date => {
                handleInputChange('dob', moment(date).format('DD-MM-YYYY'));
                setIsDatePickerVisible(false);
              }}
              onCancel={() => setIsDatePickerVisible(false)}
            />
          </TouchableOpacity>

          {/* Address */}
          <View style={{ zIndex: 5000, position: 'relative' }}>
            <AppText
              title="Home Address"
              color={AppColors.LIGHTGRAY}
              size={1.8}
            />
            <LineBreak val={1} />

            <GooglePlacesAutocomplete
              ref={googlePlacesRef}
              placeholder="Address"
              fetchDetails={true}
              keyboardShouldPersistTaps="handled"
              onPress={(data, details = null) => {
                setState(prev => ({
                  ...prev,
                  location: {
                    name: data.description || details?.formatted_address,
                    lat: details?.geometry?.location?.lat,
                    long: details?.geometry?.location?.lng,
                  },
                }));
              }}
              query={{
                key: MAP_KEY,
                language: 'en',
                components: 'country:us',
              }}
              // requestHttpHeaders={{
              //   [Platform.OS === 'ios'
              //     ? 'X-Ios-Bundle-Identifier'
              //     : 'X-Android-Package']:
              //     Platform.OS === 'ios'
              //       ? 'com.app.serbicorp'
              //       : 'com.serbicorporation',
              // }}
              // prepopulatedValue={state.location.name}
              // onFail={error => {
              //   console.error('Profile Google Places Error:', error);
              // }}
              // debounce={400}
              styles={autoCompleteStyles}
              renderRightButton={() => (
                <TouchableOpacity
                  onPress={fetchCurrentLocation}
                  style={styles.rightButton}
                >
                  <Icon name="my-location" size={22} color={colors.primary} />
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Technician Specific Fields */}
          {user?.type === 'Technician' && (
            <>
              <View style={{ zIndex: 1000 }}>
                <AppText
                  title="Which service do you provide?"
                  color={AppColors.LIGHTGRAY}
                  size={1.8}
                />
                <LineBreak val={1} />
                <DropDownPicker
                  open={openService}
                  value={state.service}
                  items={items}
                  setOpen={setOpenService}
                  setValue={callback =>
                    setState(prev => ({
                      ...prev,
                      service: callback(prev.service),
                    }))
                  }
                  setItems={setItems}
                  placeholder="Select Service"
                  style={{ borderRadius: 30, borderColor: colors.black }}
                  dropDownContainerStyle={{ borderColor: colors.black }}
                />
              </View>

              <TouchableOpacity
                onPress={() => setPicker({ visible: true, type: 'start' })}
              >
                <AppText
                  title="Working Hours"
                  color={AppColors.LIGHTGRAY}
                  size={1.8}
                />
                <LineBreak val={1} />
                <AppTextInput
                  value={`${state.workingHours.startTime} - ${state.workingHours.endTime}`}
                  editable={false}
                  borderRadius={30}
                  borderColor={AppColors.BLACK}
                />
              </TouchableOpacity>

              <View>
                <AppText
                  title="Pricing"
                  color={AppColors.LIGHTGRAY}
                  size={1.8}
                />
                <LineBreak val={1} />
                <AppTextInput
                  value={state.price}
                  keyboardType="numeric"
                  onChangeText={t => handleInputChange('price', t)}
                  borderRadius={30}
                  borderColor={AppColors.BLACK}
                />
              </View>

              <TouchableOpacity onPress={() => onSelectFile('license')}>
                <AppText
                  title="Pest Control License"
                  color={AppColors.LIGHTGRAY}
                  size={1.8}
                />
                <LineBreak val={1} />
                <AppTextInput
                  value={state.license[0]?.name || 'Choose file...'}
                  editable={false}
                  borderRadius={30}
                  borderColor={AppColors.BLACK}
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => onSelectFile('portfolio')}>
                <AppText
                  title="Portfolio"
                  color={AppColors.LIGHTGRAY}
                  size={1.8}
                />
                <LineBreak val={1} />
                <View
                  style={{
                    padding: 15,
                    borderWidth: 1,
                    borderRadius: 30,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 5,
                  }}
                >
                  <AppText title="Upload portfolio files" size={1.8} />
                  <AppText
                    title="Browse"
                    color={colors.secondary_button}
                    fontWeight="bold"
                    textDecorationLine="underline"
                    size={1.8}
                  />
                </View>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {state.portfolio.map((file, index) => (
                  <View key={index} style={{ alignItems: 'center' }}>
                    <ImageBackground
                      source={{ uri: file.path || file.uri }}
                      style={{ width: 60, height: 60 }}
                      imageStyle={{ borderRadius: 8 }}
                    />
                    <AppText
                      title={getShortFileName(file.filename || 'File')}
                      size={1.2}
                    />
                  </View>
                ))}
              </View>
            </>
          )}

          <AppButton
            title="Update Profile"
            isLoading={isLoading}
            handlePress={onProfilePress}
            bgColor={
              user?.type === 'Technician'
                ? colors.secondary_button
                : colors.primary
            }
            borderRadius={30}
          />
        </View>
      </ScrollView>

      {/* Shared Time Picker */}
      <DateTimePickerModal
        isVisible={picker.visible}
        mode="time"
        onConfirm={date => {
          const time = moment(date).format('h:mm A');
          if (picker.type === 'start') {
            handleInputChange('workingHours', time, 'startTime');
            setPicker({ visible: false, type: null });
            setTimeout(() => setPicker({ visible: true, type: 'end' }), 500);
          } else {
            handleInputChange('workingHours', time, 'endTime');
            setPicker({ visible: false, type: null });
          }
        }}
        onCancel={() => setPicker({ visible: false, type: null })}
      />
    </Container>
  );
};

export default Profile;

const styles = StyleSheet.create({
  rightButton: {
    justifyContent: 'center',
    position: 'absolute',
    right: 15,
    top: 15,
  },
});
const autoCompleteStyles = {
  container: {
    flex: 0,
  },
  textInput: {
    height: responsiveHeight(6.5),
    color: AppColors.BLACK,
    fontSize: 14,
    borderWidth: 1,
    borderColor: AppColors.BLACK,
    borderRadius: 30,
    paddingLeft: 15,
    paddingRight: 45,
  },
  listView: {
    backgroundColor: '#fff',
    elevation: 5,
    zIndex: 5000,
    position: 'absolute',
    top: 50,
  },
};
