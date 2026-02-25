import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
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
import { IMAGE_URL, MAP_API_KEY } from '../redux/constant';
import { useCreateUpdateProfileMutation } from '../redux/services/index';
import { useLazyGetAllServicesQuery } from '../redux/services/adminApis';

const Profile = ({ route }) => {
  const { user } = route?.params || {};
  const nav = useNavigation();

  // --- States ---
  const [state, setState] = useState({
    fullName: user?.fullName || '',
    image: user?.profileImage
      ? getProfileImage(user?.profileImage)
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
  const [predictions, setPredictions] = useState([]);
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

    // Profile Image: Only upload if it's a new file
    if (typeof state.image === 'string' && state.image.startsWith('file')) {
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
      .then(image => handleInputChange('image', image.path))
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
      const res = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${MAP_API_KEY}`,
      );
      console.log('res in fetchCurrentLocation:-', res.data);
      if (res.data.status === 'OK') {
        const address = res.data.results[0].formatted_address;
        setState(prev => ({
          ...prev,
          location: { name: address, lat: latitude, long: longitude },
        }));
      }
    } catch (error) {
      Toast.show('Location Error', Toast.SHORT);
    }
  };

  const searchLocation = async key => {
    if (!key) return setPredictions([]);
    try {
      const res = await axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
        {
          params: { input: key, key: MAP_API_KEY, components: 'country:us' },
        },
      );
      setPredictions(res.data.predictions || []);
    } catch (error) {
      console.log(error);
    }
  };

  const getPlaceDetails = async placeId => {
    try {
      const res = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json`,
        {
          params: { place_id: placeId, key: MAP_API_KEY },
        },
      );
      const loc = res.data.result;
      setState(prev => ({
        ...prev,
        location: {
          name: loc.formatted_address,
          lat: loc.geometry.location.lat,
          long: loc.geometry.location.lng,
        },
      }));
      setPredictions([]);
    } catch (error) {
      console.log(error);
    }
  };

  const profileSrc =
    typeof state.image === 'string' ? { uri: state.image } : state.image;

  console.log('state.location', state.location);
  console.log('user:-', user);
  return (
    <Container>
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
          <View>
            <AppText
              title="Home Address"
              color={AppColors.LIGHTGRAY}
              size={1.8}
            />
            <LineBreak val={1} />
            <AppTextInput
              value={state.location.name}
              inputPlaceHolder={'Address'}
              inputWidth={75}
              borderRadius={30}
              borderColor={AppColors.BLACK}
              placeholderTextColor={AppColors.LIGHTGRAY}
              onChangeText={t => {
                handleInputChange('location', t, 'name');
                searchLocation(t);
              }}
              rightIcon={
                <TouchableOpacity onPress={fetchCurrentLocation}>
                  <Icon name="my-location" size={22} color={colors.primary} />
                </TouchableOpacity>
              }
            />
            {predictions.map(item => (
              <TouchableOpacity
                key={item.place_id}
                onPress={() => getPlaceDetails(item.place_id)}
                style={{
                  padding: 12,
                  borderBottomWidth: 0.5,
                  borderColor: '#eee',
                }}
              >
                <AppText
                  title={item.description}
                  textColor={AppColors.BLACK}
                  size={1.6}
                />
              </TouchableOpacity>
            ))}
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

// import {
//   View,
//   TouchableOpacity,
//   ImageBackground,
//   Platform,
// } from 'react-native';
// import Container from '../components/Container';
// import { useNavigation } from '@react-navigation/native';
// import NormalHeader from '../components/NormalHeader';
// import {
//   AppColors,
//   getCurrentLocation,
//   getFileNameFromUri,
//   getProfileImage,
//   getShortFileName,
//   responsiveFontSize,
//   responsiveHeight,
//   responsiveWidth,
// } from '../utils';
// import Feather from 'react-native-vector-icons/Feather';
// import { images } from '../assets/images';
// import LineBreak from '../components/LineBreak';
// import { colors } from '../assets/colors';
// import AppText from '../components/AppText';
// import AppTextInput from '../components/AppTextInput';
// import AppButton from '../components/AppButton';
// import { useSelector } from 'react-redux';
// import { useCreateUpdateProfileMutation } from '../redux/services/index';
// import { useEffect, useState } from 'react';
// import Toast from 'react-native-simple-toast';
// import DateTimePickerModal from 'react-native-modal-datetime-picker';
// import moment from 'moment';
// import ImageCropPicker from 'react-native-image-crop-picker';
// import { IMAGE_URL, MAP_API_KEY, PDF_URL } from '../redux/constant';
// import DropDownPicker from 'react-native-dropdown-picker';
// import { pick, types } from '@react-native-documents/picker';
// import { useLazyGetAllServicesQuery } from '../redux/services/adminApis';
// import Loader from '../components/Loader';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import axios from 'axios';
// import RNFetchBlob from 'react-native-blob-util';

// const Profile = ({ route }) => {
//   const { user } = route?.params;
//   // const { user } = useSelector(state => state.persistedData);
//   const [state, setState] = useState({
//     fullName: user?.fullName || '',
//     // image: user?.profileImage
//     //   ? `${IMAGE_URL}${user.profileImage}`
//     //   : images.userProfile,
//     image: user?.profileImage
//       ? getProfileImage(user?.profileImage)
//       : images.userProfile,
//     dob: user?.DOB || moment(new Date()).format('DD-MM-YYYY'),
//     phone: user?.phone || '',
//     location: {
//       name: user?.locationName || '',
//       lat: '',
//       long: '',
//     },
//     ss: user?.ss || '',
//     license:
//       user?.pestControlLicense?.length > 0
//         ? [{ file: user?.pestControlLicense[0] }]
//         : [{ file: '', name: '' }],
//     workingHours: {
//       startTime: user?.workingHours?.startTime || '09:00 AM',
//       endTime: user?.workingHours?.endTime || '05: 00 PM',
//     },
//     service: user?.service?._id || null,
//     portfolio: (user?.portfolio || []).map(file => {
//       if (typeof file === 'string') {
//         return {
//           path: `${IMAGE_URL}${file}`,
//           filename: file,
//         };
//       }
//       return file;
//     }),
//     price: user?.price?.toString() || '',
//   });
//   const [picker, setPicker] = useState({ visible: false, type: null });
//   const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
//   const [predictions, setPredictions] = useState([]);
//   const [createUpdateProfile, { isLoading }] = useCreateUpdateProfileMutation();
//   const [getAllServices, { data: servicesData, isLoading: serviceLoader }] =
//     useLazyGetAllServicesQuery();
//   const nav = useNavigation();
//   const [open, setOpen] = useState(false);
//   const profileSrc =
//     typeof state.image === 'string'
//       ? { uri: state.image } // URLs or file paths
//       : state.image || images.userProfile;

//   const [items, setItems] = useState([
//     { label: 'Test Service', value: 'Test Service' },
//     { label: 'Test Service 2', value: 'Test Service 2' },
//     { label: 'Test Service 3', value: 'Test Service 3' },
//     { label: 'Test Service 4', value: 'Test Service 4' },
//   ]);

//   useEffect(() => {
//     getAllServices();
//   }, []);

//   useEffect(() => {
//     if (servicesData?.data) {
//       const updatedData = servicesData?.data.map(item => ({
//         label: item.name,
//         value: item._id,
//       }));
//       setItems(updatedData);
//     }
//   }, [servicesData]);

//   const onProfilePress = async () => {
//     const data = new FormData();
//     data.append('userId', String(user?._id || ''));
//     data.append('fullName', String(state.fullName || ''));
//     data.append('phone', String(state.phone || ''));
//     data.append('DOB', String(state.dob || ''));
//     data.append('longitude', String(state.location.long || ''));
//     data.append('latitude', String(state.location.lat || ''));
//     data.append('locationName', String(state.location.name || ''));

//     if (user?.type === 'Technician') {
//       data.append('price', String(state.price || '0'));
//       if (state.service) {
//         data.append('service', String(state.service));
//       }
//       data.append('workingHours', JSON.stringify(state.workingHours));
//       data.append('ss', String(state.ss || ''));

//       // License handling - only if it's a new local file
//       if (state.license && state.license.length > 0) {
//         const fileObj = state.license[0];
//         if (
//           fileObj.file &&
//           typeof fileObj.file === 'string' &&
//           fileObj.file.startsWith('file')
//         ) {
//           data.append('license', {
//             uri: fileObj.file,
//             type: 'application/pdf',
//             name: fileObj.name || 'License.pdf',
//           });
//         }
//       }

//       // Portfolio handling - only local files
//       if (state.portfolio && Array.isArray(state.portfolio)) {
//         state.portfolio.forEach((file, index) => {
//           const uri = file.path || file.uri;
//           if (uri && typeof uri === 'string' && uri.startsWith('file')) {
//             data.append('portfolio', {
//               uri: uri,
//               type: file.type || 'image/jpeg',
//               name: file.filename || file.name || `portfolio_${index}.jpg`,
//             });
//           }
//         });
//       }
//     }

//     // Profile Image handling - only if it's a new local file
//     if (
//       state.image &&
//       typeof state.image === 'string' &&
//       state.image.startsWith('file')
//     ) {
//       data.append('profileImage', {
//         uri: state.image,
//         type: 'image/jpeg',
//         name: 'profile_image.jpg',
//       });
//     }

//     console.log(data);

//     await createUpdateProfile(data)
//       .unwrap()
//       .then(res => {
//         console.log('response of profile/creation', res);
//         Toast.show(res.msg, Toast.SHORT);
//         nav.goBack();
//       })
//       .catch(error => {
//         console.log('error of profile/creation ===>', error);
//         Toast.show('Some problem occured', Toast.SHORT);
//       });
//   };

//   const onChangeText = (parent, child, value) => {
//     if (child) {
//       setState(prevState => ({
//         ...prevState,
//         [parent]: {
//           ...prevState[parent],
//           [child]: value,
//         },
//       }));
//     } else {
//       setState(prevState => ({
//         ...prevState,
//         [parent]: value,
//       }));
//     }
//   };

//   const onImageSelect = () => {
//     ImageCropPicker.openPicker({
//       width: 300,
//       height: 400,
//       cropping: true,
//       mediaType: 'photo',
//     }).then(image => {
//       setState(prevState => ({
//         ...prevState,
//         image: image.path,
//       }));
//       console.log(image);
//     });
//   };

//   const showPicker = type => {
//     // console.log('type', type);
//     setPicker({ visible: true, type });
//   };

//   const hidePicker = () => {
//     setPicker({ visible: false, type: null });
//   };

//   const handleConfirm = date => {
//     if (picker.type === 'start') {
//       setState(prevState => ({
//         ...prevState,
//         workingHours: {
//           ...prevState.workingHours,
//           startTime: moment(date).format('h:mm A'),
//         },
//       }));

//       hidePicker();
//       setTimeout(() => showPicker('end'), 300);
//     } else if (picker.type === 'end') {
//       setState(prevState => ({
//         ...prevState,
//         workingHours: {
//           ...prevState.workingHours,
//           endTime: moment(date).format('h:mm A'),
//         },
//       }));
//       hidePicker();
//     }
//   };

//   // const onPortfolioImage = () => {
//   //   ImageCropPicker.openPicker({
//   //     width: 300,
//   //     height: 400,
//   //     cropping: true,
//   //     mediaType: 'photo',
//   //   }).then(image => {
//   //     setState(prevState => ({
//   //       ...prevState,
//   //       portfolio: [
//   //         ...prevState.portfolio,
//   //         { path: image.path, filename: image.filename },
//   //       ],
//   //     }));
//   //     console.log(image);
//   //   });
//   // };

//   const onSelectFile = async type => {
//     try {
//       const [pickResult] = await pick({
//         type: type === 'license' ? [types.pdf] : [types.allFiles],
//       });

//       if (type === 'license') {
//         setState(prev => ({
//           ...prev,
//           license: [
//             {
//               file: pickResult.uri,
//               name: pickResult.name || '',
//             },
//           ],
//         }));
//       } else {
//         setState(prev => ({
//           ...prev,
//           portfolio: [
//             ...prev.portfolio,
//             {
//               path: pickResult.uri,
//               filename: pickResult.name,
//               type: pickResult.type,
//             },
//           ],
//         }));
//       }
//     } catch (err) {
//       console.log('Error picking document', err);
//     }
//   };

//   const currentLocationAndFetchAddress = async () => {
//     try {
//       Toast.show('Fetching current location...', Toast.SHORT);
//       const { latitude, longitude } = await getCurrentLocation();
//       console.log('latitude & longitude:-', latitude, longitude);

//       const address = await convertLatLongToAddress(latitude, longitude);
//       setState(prevState => ({
//         ...prevState,
//         location: {
//           name: address,
//           lat: latitude,
//           long: longitude,
//         },
//       }));
//       Toast.show('Current Location Fetched Successfuly!', Toast.SHORT);
//       // console.log('Converted Address:', address);
//     } catch (error) {
//       console.log('Error getting location or converting:', error);
//       Toast.show('Failed to fetch current location...', Toast.SHORT);
//       return null;
//     }
//   };

//   const convertLatLongToAddress = async (lat, lng) => {
//     try {
//       const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${MAP_API_KEY}`;
//       const response = await axios.get(url);

//       if (
//         response.data.status === 'OK' &&
//         response.data.results &&
//         response.data.results.length > 0
//       ) {
//         return response.data.results[0].formatted_address;
//       } else {
//         console.log('No address found for given coordinates');
//         return null;
//       }
//     } catch (error) {
//       console.log('Error in geocoding API:', error);
//       return null;
//     }
//   };

//   const searchLocation = async key => {
//     if (!key) {
//       setPredictions([]);
//       return;
//     }
//     try {
//       const response = await axios.get(
//         `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
//         {
//           params: {
//             input: key,
//             key: MAP_API_KEY,
//             components: 'country:us',
//           },
//         },
//       );

//       if (response.data?.predictions) {
//         setPredictions(response.data.predictions);
//       }
//     } catch (error) {
//       console.error('Error fetching predictions', error);
//     }
//   };

//   const getPlaceDetails = async placeId => {
//     try {
//       const response = await axios.get(
//         `https://maps.googleapis.com/maps/api/place/details/json`,
//         {
//           params: {
//             place_id: placeId,
//             key: MAP_API_KEY,
//           },
//         },
//       );

//       const details = response.data?.result;
//       if (details) {
//         const locationName = details.formatted_address || details.name;
//         const lat = details.geometry?.location?.lat;
//         const long = details.geometry?.location?.lng;

//         setState(prevState => ({
//           ...prevState,
//           location: {
//             name: locationName,
//             lat,
//             long,
//           },
//         }));
//         setPredictions([]);
//       }
//     } catch (error) {
//       console.error('Error fetching place details', error);
//     }
//   };

//   console.log('user in vendor profile:-', user);

//   return (
//     <Container>
//       <NormalHeader heading={'Profile'} onBackPress={() => nav.goBack()} />
//       <LineBreak val={3} />

//       <View style={{ alignItems: 'center' }}>
//         <ImageBackground
//           // source={{ uri: state.image }}
//           source={profileSrc}
//           style={{
//             width: 100,
//             height: 100,
//             position: 'relative',
//           }}
//           imageStyle={{ borderRadius: 100 }}
//         >
//           <TouchableOpacity
//             style={{
//               width: 30,
//               height: 30,
//               borderRadius: 100,
//               backgroundColor:
//                 user?.type === 'Technician'
//                   ? colors.secondary_button
//                   : colors.primary,
//               position: 'absolute',
//               bottom: 0,
//               right: 0,
//               justifyContent: 'center',
//               alignItems: 'center',
//             }}
//             onPress={onImageSelect}
//           >
//             <Feather
//               name="plus"
//               size={responsiveFontSize(2.5)}
//               color={AppColors.BLACK}
//             />
//           </TouchableOpacity>
//         </ImageBackground>
//       </View>

//       <LineBreak val={3} />

//       <View style={{ paddingHorizontal: responsiveWidth(5) }}>
//         <View style={{ gap: 20 }}>
//           <View>
//             <AppText
//               title={'Your Full Name'}
//               color={AppColors.LIGHTGRAY}
//               size={1.8}
//             />
//             <LineBreak val={1} />
//             <AppTextInput
//               inputPlaceHolder={'Alicia John'}
//               placeholderTextColor={AppColors.LIGHTGRAY}
//               borderRadius={30}
//               onChangeText={text => onChangeText('fullName', null, text)}
//               value={state.fullName}
//               borderColor={AppColors.BLACK}
//             />
//           </View>
//           <TouchableOpacity onPress={() => setIsDatePickerVisible(true)}>
//             <AppText
//               title={'Date Of Birth'}
//               color={AppColors.LIGHTGRAY}
//               size={1.8}
//             />
//             <LineBreak val={1} />
//             <AppTextInput
//               inputPlaceHolder={'123-456-7890'}
//               placeholderTextColor={AppColors.LIGHTGRAY}
//               borderRadius={30}
//               editable={false}
//               value={state.dob}
//               borderColor={AppColors.BLACK}
//             />{' '}
//             <DateTimePickerModal
//               isVisible={isDatePickerVisible}
//               mode="date"
//               onConfirm={date => {
//                 setState(prevState => ({
//                   ...prevState,
//                   dob: moment(date).format('DD-MM-YYYY'),
//                 }));
//                 setIsDatePickerVisible(false);
//               }}
//               onCancel={() => setIsDatePickerVisible(false)}
//             />
//           </TouchableOpacity>
//           <View>
//             <AppText
//               title={'Home Address'}
//               color={AppColors.LIGHTGRAY}
//               size={1.8}
//             />
//             <LineBreak val={1} />
//             <AppTextInput
//               inputPlaceHolder={'..........'}
//               placeholderTextColor={AppColors.LIGHTGRAY}
//               borderRadius={30}
//               onChangeText={text => {
//                 onChangeText('location', 'name', text);
//                 searchLocation(text);
//               }}
//               value={state.location.name}
//               inputWidth={75}
//               rightIcon={
//                 <TouchableOpacity onPress={currentLocationAndFetchAddress}>
//                   <Icon name="my-location" size={22} color={colors.primary} />
//                 </TouchableOpacity>
//               }
//               borderColor={AppColors.BLACK}
//             />
//             {predictions.length > 0 && (
//               <View
//                 style={{
//                   backgroundColor: '#fff',
//                   borderRadius: 8,
//                   marginTop: 5,
//                   elevation: 3,
//                 }}
//               >
//                 {predictions.map(item => (
//                   <TouchableOpacity
//                     key={item.place_id}
//                     onPress={() => getPlaceDetails(item.place_id)}
//                     style={{
//                       padding: 12,
//                       borderBottomWidth: 0.5,
//                       borderColor: '#eee',
//                     }}
//                   >
//                     <AppText
//                       title={item.description}
//                       textColor={AppColors.BLACK}
//                       textSize={1.6}
//                     />
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             )}
//           </View>
//           <View>
//             <AppText
//               title={'Phone Number'}
//               color={AppColors.LIGHTGRAY}
//               size={1.8}
//             />
//             <LineBreak val={1} />
//             <AppTextInput
//               inputPlaceHolder={'123-456-7890'}
//               placeholderTextColor={AppColors.LIGHTGRAY}
//               borderRadius={30}
//               keyboardType={'numeric'}
//               onChangeText={text => onChangeText('phone', null, text)}
//               value={state.phone}
//               borderColor={AppColors.BLACK}
//             />
//           </View>
//           <View>
//             <AppText
//               title={'Email Address'}
//               color={AppColors.LIGHTGRAY}
//               size={1.8}
//             />
//             <LineBreak val={1} />
//             <AppTextInput
//               inputPlaceHolder={'aliciajohn456@gmail.com'}
//               placeholderTextColor={AppColors.LIGHTGRAY}
//               borderRadius={30}
//               value={user?.email}
//               editable={false}
//               borderColor={AppColors.BLACK}
//             />
//           </View>
//           {serviceLoader ? (
//             <Loader />
//           ) : (
//             user?.type === 'Technician' && (
//               <>
//                 <View>
//                   <AppText
//                     title={'Which service do you provide?'}
//                     color={AppColors.LIGHTGRAY}
//                     size={1.8}
//                   />
//                   <LineBreak val={1} />
//                   <DropDownPicker
//                     open={open}
//                     setOpen={setOpen}
//                     value={state.service}
//                     items={items}
//                     setItems={setItems}
//                     dropDownDirection="BOTTOM"
//                     placeholder="Select Service"
//                     dropDownContainerStyle={{
//                       borderColor: colors.black,
//                       borderRadius: 15,
//                     }}
//                     style={{
//                       borderRadius: open ? 15 : 30,
//                       borderColor: colors.black,
//                     }}
//                     setValue={val =>
//                       setState(prevState => ({
//                         ...prevState,
//                         service: val(),
//                       }))
//                     }
//                   />
//                 </View>
//                 <TouchableOpacity onPress={() => showPicker('start')}>
//                   <AppText
//                     title={'Working Hours'}
//                     color={AppColors.LIGHTGRAY}
//                     size={1.8}
//                   />
//                   <LineBreak val={1} />
//                   <AppTextInput
//                     inputPlaceHolder={'9:00 AM - 5:00 PM'}
//                     placeholderTextColor={AppColors.LIGHTGRAY}
//                     borderRadius={30}
//                     editable={false}
//                     onChangeText={text => onChangeText('price', null, text)}
//                     value={`${state.workingHours.startTime} - ${state.workingHours.endTime}`}
//                     borderColor={AppColors.BLACK}
//                   />
//                   <DateTimePickerModal
//                     isVisible={picker.visible}
//                     mode="time"
//                     onConfirm={handleConfirm}
//                     onCancel={hidePicker}
//                   />
//                 </TouchableOpacity>
//                 <View>
//                   <AppText
//                     title={'Pricing'}
//                     color={AppColors.LIGHTGRAY}
//                     size={1.8}
//                   />
//                   <LineBreak val={1} />
//                   <AppTextInput
//                     inputPlaceHolder={'$20 per kilometer*'}
//                     placeholderTextColor={AppColors.LIGHTGRAY}
//                     borderRadius={30}
//                     keyboardType={'numeric'}
//                     onChangeText={text => onChangeText('price', null, text)}
//                     value={state.price}
//                     borderColor={AppColors.BLACK}
//                   />
//                 </View>
//                 <View>
//                   <AppText
//                     title={'SS'}
//                     color={AppColors.LIGHTGRAY}
//                     size={1.8}
//                   />
//                   <LineBreak val={1} />
//                   <AppTextInput
//                     inputPlaceHolder={'Enter details'}
//                     placeholderTextColor={AppColors.LIGHTGRAY}
//                     borderRadius={30}
//                     keyboardType={'default'}
//                     onChangeText={text => onChangeText('ss', null, text)}
//                     value={state.ss}
//                     borderColor={AppColors.BLACK}
//                   />
//                 </View>
//                 <TouchableOpacity onPress={() => onSelectFile('license')}>
//                   <AppText
//                     title={'Pest Control License'}
//                     color={AppColors.LIGHTGRAY}
//                     size={1.8}
//                   />
//                   <LineBreak val={1} />
//                   <AppTextInput
//                     inputPlaceHolder={'Choose file...'}
//                     placeholderTextColor={AppColors.LIGHTGRAY}
//                     borderRadius={30}
//                     value={state.license[0]?.name || state.license[0].file}
//                     editable={false}
//                     borderColor={AppColors.BLACK}
//                   />
//                 </TouchableOpacity>
//                 <TouchableOpacity onPress={() => onSelectFile('portfolio')}>
//                   <AppText
//                     title={'Portfolio'}
//                     color={AppColors.LIGHTGRAY}
//                     size={1.8}
//                   />
//                   <LineBreak val={1} />
//                   <View
//                     style={{
//                       padding: responsiveHeight(1.65),
//                       flexDirection: 'row',
//                       gap: 5,
//                       borderColor: colors.black,
//                       borderWidth: 1,
//                       borderRadius: 100,
//                     }}
//                   >
//                     <AppText size={1.8} title={'Drag an image here or'} />
//                     <AppText
//                       fontWeight={'bold'}
//                       color={colors.secondary_button}
//                       size={1.8}
//                       textDecorationLine={'underline'}
//                       title={'upload a file'}
//                     />
//                   </View>
//                 </TouchableOpacity>
//                 {state.portfolio.length > 0 && (
//                   <View style={{ marginTop: 10 }}>
//                     {state.portfolio.map((file, index) => {
//                       const isImage =
//                         file.type?.includes('image') ||
//                         file.path?.match(/\.(jpg|jpeg|png|gif)$/i);

//                       return (
//                         <View
//                           key={index}
//                           style={{
//                             flexDirection: 'row',
//                             alignItems: 'center',
//                             marginBottom: 10,
//                           }}
//                         >
//                           {isImage ? (
//                             <ImageBackground
//                               source={{ uri: file.uri || file.path }}
//                               style={{ width: 40, height: 40, marginRight: 10 }}
//                               imageStyle={{ borderRadius: 5 }}
//                             />
//                           ) : (
//                             <Feather
//                               name="file-text"
//                               size={40}
//                               color={colors.secondary_button}
//                               style={{ marginRight: 10 }}
//                             />
//                           )}
//                           <AppText
//                             size={1.6}
//                             title={getShortFileName(
//                               file.name || file.filename || `File ${index + 1}`,
//                             )}
//                             color={AppColors.BLACK}
//                           />
//                         </View>
//                       );
//                     })}
//                   </View>
//                 )}
//               </>
//             )
//           )}

//           <LineBreak val={1} />
//           <AppButton
//             title={'update profile'}
//             bgColor={
//               user?.type === 'Technician'
//                 ? colors.secondary_button
//                 : colors.primary
//             }
//             textColor={AppColors.BLACK}
//             textFontWeight={'bold'}
//             borderRadius={30}
//             isLoading={isLoading}
//             buttoWidth={92}
//             textTransform={'uppercase'}
//             handlePress={() => onProfilePress()}
//           />
//           <LineBreak val={1} />
//         </View>
//       </View>
//     </Container>
//   );
// };

// export default Profile;
