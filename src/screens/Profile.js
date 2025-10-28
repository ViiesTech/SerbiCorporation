import {
  View,
  TouchableOpacity,
  ImageBackground,
  Platform,
} from 'react-native';
import Container from '../components/Container';
import { useNavigation } from '@react-navigation/native';
import NormalHeader from '../components/NormalHeader';
import {
  AppColors,
  getShortFileName,
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../utils';
import Feather from 'react-native-vector-icons/Feather';
import { images } from '../assets/images';
import LineBreak from '../components/LineBreak';
import { colors } from '../assets/colors';
import AppText from '../components/AppText';
import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';
import { useSelector } from 'react-redux';
import { useCreateUpdateProfileMutation } from '../redux/services/index';
import { useEffect, useState } from 'react';
import Toast from 'react-native-simple-toast';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import ImageCropPicker from 'react-native-image-crop-picker';
import { IMAGE_URL } from '../redux/constant';
import DropDownPicker from 'react-native-dropdown-picker';
import { pick, types } from '@react-native-documents/picker';
import { useLazyGetAllServicesQuery } from '../redux/services/adminApis';
import Loader from '../components/Loader';

const Profile = ({ route }) => {
  const { user } = route?.params;
  // const { user } = useSelector(state => state.persistedData);
  const [state, setState] = useState({
    fullName: user?.fullName || '',
    image: user?.profileImage ? `${IMAGE_URL}${user.profileImage}` : images.userProfile,
    dob: user?.DOB || moment(new Date()).format('DD-MM-YYYY'),
    phone: user?.phone || '',
    location: {
      name: user?.location?.locationName || '',
      lat: '',
      long: '',
    },
    ss: user?.ss || '',
    license: user?.license
      ? {
          file: user.license,
          name: user.license.split('/').pop(),
        }
      : {
          file: '',
          name: '',
        },
    workingHours: {
      startTime: user?.workingHours?.startTime || '09:00 AM',
      endTime: user?.workingHours?.endTime || '05: 00 PM',
    },
    service: user?.service?._id || null,
    portfolio: (user?.portfolio || []).map(file => {
      if (typeof file === 'string') {
        return {
          path: `${IMAGE_URL}${file}`,
          filename: file,
        };
      }
      return file;
    }),
    price: user?.price?.toString() || '',
  });
  const [picker, setPicker] = useState({ visible: false, type: null });
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [createUpdateProfile, { isLoading }] = useCreateUpdateProfileMutation();
  const [getAllServices, { data: servicesData, isLoading: serviceLoader }] =
    useLazyGetAllServicesQuery();
  const nav = useNavigation();
  const [open, setOpen] = useState(false);
  //   const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    { label: 'Test Service', value: 'Test Service' },
    { label: 'Test Service 2', value: 'Test Service 2' },
    { label: 'Test Service 3', value: 'Test Service 3' },
    { label: 'Test Service 4', value: 'Test Service 4' },
  ]);

  console.log(user);

  // console.log('services data', servicesData);

  useEffect(() => {
    getAllServices();
  }, []);

  useEffect(() => {
    if (servicesData?.data) {
      const updatedData = servicesData?.data.map(item => ({
        label: item.name,
        value: item._id,
      }));
      setItems(updatedData);
    }
  }, [servicesData]);

  // console.log('state ===>', user);

  const onProfilePress = async () => {
    let data = new FormData();
    data.append('userId', user?._id);
    data.append('fullName', state.fullName);
    data.append('phone', state.phone);
    data.append('DOB', state.dob);
    data.append('longitude', '-80.4790');
    data.append('latitude', '25.4473');
    data.append('locationName', state.location.name);
    if (user?.type === 'Technician') {
      data.append('price', parseInt(state.price));
      if (state.service) {
        data.append('service', state.service);
      }
      data.append('workingHours', JSON.stringify(state.workingHours));
      if (state.license.file && state.license.file.startsWith('file://')) {
        data.append('license', {
          uri: state.license.file,
          type: 'application/pdf',
          name: state.license.name,
        });
      }
      data.append('ss', state.ss);
      state.portfolio.forEach((file, index) => {
        data.append('portfolio', {
          uri:
            Platform.OS === 'android'
              ? file.path
              : file.path.replace('file://', ''),
          type: 'image/jpeg',
          name: file.filename || `portfolio${index}.pdf`,
        });
      });
    }

    if (state.image) {
      data.append('profileImage', {
        uri:
          Platform.OS === 'android'
            ? state.image
            : state.image.replace('file://', ''),
        type: 'image/jpeg',
        name: `image.jpg`,
      });
    }

    console.log(data);

    await createUpdateProfile(data)
      .unwrap()
      .then(res => {
        console.log('response of profile/creation', res);
        Toast.show(res.msg, 2000, Toast.SHORT);
        nav.goBack();
      })
      .catch(error => {
        console.log('error of profile/creation ===>', error);
        Toast.show('Some problem occured', 2000, Toast.SHORT);
      });
  };

  const onChangeText = (parent, child, value) => {
    if (child) {
      setState(prevState => ({
        ...prevState,
        [parent]: {
          ...prevState[parent],
          [child]: value,
        },
      }));
    } else {
      setState(prevState => ({
        ...prevState,
        [parent]: value,
      }));
    }
  };
  //   console.log('user type ===>', user?.type);

  const onImageSelect = () => {
    ImageCropPicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
      mediaType: 'photo',
    }).then(image => {
      setState(prevState => ({
        ...prevState,
        image: image.path,
      }));
      console.log(image);
    });
  };

  const showPicker = type => {
    // console.log('type', type);
    setPicker({ visible: true, type });
  };

  const hidePicker = () => {
    setPicker({ visible: false, type: null });
  };

  const handleConfirm = date => {
    if (picker.type === 'start') {
      setState(prevState => ({
        ...prevState,
        workingHours: {
          ...prevState.workingHours,
          startTime: moment(date).format('h:mm A'),
        },
      }));

      hidePicker();
      setTimeout(() => showPicker('end'), 300);
    } else if (picker.type === 'end') {
      setState(prevState => ({
        ...prevState,
        workingHours: {
          ...prevState.workingHours,
          endTime: moment(date).format('h:mm A'),
        },
      }));
      hidePicker();
    }
  };

  // const onPortfolioImage = () => {
  //   ImageCropPicker.openPicker({
  //     width: 300,
  //     height: 400,
  //     cropping: true,
  //     mediaType: 'photo',
  //   }).then(image => {
  //     setState(prevState => ({
  //       ...prevState,
  //       portfolio: [
  //         ...prevState.portfolio,
  //         { path: image.path, filename: image.filename },
  //       ],
  //     }));
  //     console.log(image);
  //   });
  // };

  const onSelectFile = async type => {
    try {
      const [pickResult] = await pick({
        type: type === 'license' ? [types.pdf] : [types.allFiles],
      });

      if (type === 'license') {
        setState(prev => ({
          ...prev,
          license: {
            file: pickResult.uri,
            name: pickResult.name || '',
          },
        }));
      } else {
        setState(prev => ({
          ...prev,
          portfolio: [
            ...prev.portfolio,
            {
              uri: pickResult.uri,
              name: pickResult.name,
              type: pickResult.type,
            },
          ],
        }));
      }
    } catch (err) {
      console.log('Error picking document', err);
    }
  };

  return (
    <Container>
      <NormalHeader heading={'Profile'} onBackPress={() => nav.goBack()} />
      <LineBreak val={3} />
      <View style={{ alignItems: 'center' }}>
        <ImageBackground
          source={state.image ? { uri: state.image } : images.imageProf}
          style={{
            width: 100,
            height: 100,
            position: 'relative',
          }}
          imageStyle={{ borderRadius: 100 }}
        >
          <TouchableOpacity
            style={{
              width: 30,
              height: 30,
              borderRadius: 100,
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
            onPress={onImageSelect}
          >
            <Feather
              name="plus"
              size={responsiveFontSize(2.5)}
              color={AppColors.BLACK}
            />
          </TouchableOpacity>
        </ImageBackground>
      </View>
      <LineBreak val={3} />

      <View style={{ paddingHorizontal: responsiveWidth(5) }}>
        <View style={{ gap: 20 }}>
          <View>
            <AppText
              title={'Your Full Name'}
              color={AppColors.LIGHTGRAY}
              size={1.8}
            />
            <LineBreak val={1} />
            <AppTextInput
              inputPlaceHolder={'Alicia John'}
              placeholderTextColor={AppColors.LIGHTGRAY}
              borderRadius={30}
              onChangeText={text => onChangeText('fullName', null, text)}
              value={state.fullName}
              borderColor={AppColors.BLACK}
            />
          </View>
          <TouchableOpacity onPress={() => setIsDatePickerVisible(true)}>
            <AppText
              title={'Date Of Birth'}
              color={AppColors.LIGHTGRAY}
              size={1.8}
            />
            <LineBreak val={1} />
            <AppTextInput
              inputPlaceHolder={'123-456-7890'}
              placeholderTextColor={AppColors.LIGHTGRAY}
              borderRadius={30}
              editable={false}
              value={state.dob}
              borderColor={AppColors.BLACK}
            />{' '}
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={date => {
                setState(prevState => ({
                  ...prevState,
                  dob: moment(date).format('DD-MM-YYYY'),
                }));
                setIsDatePickerVisible(false);
              }}
              onCancel={() => setIsDatePickerVisible(false)}
            />
          </TouchableOpacity>
          <View>
            <AppText
              title={'Home Address'}
              color={AppColors.LIGHTGRAY}
              size={1.8}
            />
            <LineBreak val={1} />
            <AppTextInput
              inputPlaceHolder={'..........'}
              placeholderTextColor={AppColors.LIGHTGRAY}
              borderRadius={30}
              onChangeText={text => onChangeText('location', 'name', text)}
              value={state.location.name}
              borderColor={AppColors.BLACK}
            />
          </View>
          <View>
            <AppText
              title={'Phone Number'}
              color={AppColors.LIGHTGRAY}
              size={1.8}
            />
            <LineBreak val={1} />
            <AppTextInput
              inputPlaceHolder={'123-456-7890'}
              placeholderTextColor={AppColors.LIGHTGRAY}
              borderRadius={30}
              keyboardType={'numeric'}
              onChangeText={text => onChangeText('phone', null, text)}
              value={state.phone}
              borderColor={AppColors.BLACK}
            />
          </View>
          <View>
            <AppText
              title={'Email Address'}
              color={AppColors.LIGHTGRAY}
              size={1.8}
            />
            <LineBreak val={1} />
            <AppTextInput
              inputPlaceHolder={'aliciajohn456@gmail.com'}
              placeholderTextColor={AppColors.LIGHTGRAY}
              borderRadius={30}
              value={user?.email}
              editable={false}
              borderColor={AppColors.BLACK}
            />
          </View>
          {serviceLoader ? (
            <Loader />
          ) : (
            user?.type === 'Technician' && (
              <>
                <View>
                  <AppText
                    title={'Which service do you provide?'}
                    color={AppColors.LIGHTGRAY}
                    size={1.8}
                  />
                  <LineBreak val={1} />
                  <DropDownPicker
                    open={open}
                    value={state.service}
                    items={items}
                    dropDownDirection="BOTTOM"
                    placeholder="Select Service"
                    style={{ borderRadius: 100 }}
                    setOpen={setOpen}
                    setValue={val =>
                      setState(prevState => ({
                        ...prevState,
                        service: val(),
                      }))
                    }
                    setItems={setItems}
                  />
                </View>
                <TouchableOpacity onPress={() => showPicker('start')}>
                  <AppText
                    title={'Working Hours'}
                    color={AppColors.LIGHTGRAY}
                    size={1.8}
                  />
                  <LineBreak val={1} />
                  <AppTextInput
                    inputPlaceHolder={'9:00 AM - 5:00 PM'}
                    placeholderTextColor={AppColors.LIGHTGRAY}
                    borderRadius={30}
                    editable={false}
                    onChangeText={text => onChangeText('price', null, text)}
                    value={`${state.workingHours.startTime} - ${state.workingHours.endTime}`}
                    borderColor={AppColors.BLACK}
                  />
                  <DateTimePickerModal
                    isVisible={picker.visible}
                    mode="time"
                    onConfirm={handleConfirm}
                    onCancel={hidePicker}
                  />
                </TouchableOpacity>
                <View>
                  <AppText
                    title={'Pricing'}
                    color={AppColors.LIGHTGRAY}
                    size={1.8}
                  />
                  <LineBreak val={1} />
                  <AppTextInput
                    inputPlaceHolder={'$20 per kilometer*'}
                    placeholderTextColor={AppColors.LIGHTGRAY}
                    borderRadius={30}
                    keyboardType={'numeric'}
                    onChangeText={text => onChangeText('price', null, text)}
                    value={state.price}
                    borderColor={AppColors.BLACK}
                  />
                </View>
                <View>
                  <AppText
                    title={'SS'}
                    color={AppColors.LIGHTGRAY}
                    size={1.8}
                  />
                  <LineBreak val={1} />
                  <AppTextInput
                    inputPlaceHolder={'Enter details'}
                    placeholderTextColor={AppColors.LIGHTGRAY}
                    borderRadius={30}
                    keyboardType={'numeric'}
                    onChangeText={text => onChangeText('ss', null, text)}
                    value={state.ss}
                    borderColor={AppColors.BLACK}
                  />
                </View>
                <TouchableOpacity onPress={() => onSelectFile('license')}>
                  <AppText
                    title={'Pest Control License'}
                    color={AppColors.LIGHTGRAY}
                    size={1.8}
                  />
                  <LineBreak val={1} />
                  <AppTextInput
                    inputPlaceHolder={'Choose file...'}
                    placeholderTextColor={AppColors.LIGHTGRAY}
                    borderRadius={30}
                    value={state.license.name}
                    editable={false}
                    borderColor={AppColors.BLACK}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onSelectFile('portfolio')}>
                  <AppText
                    title={'Portfolio'}
                    color={AppColors.LIGHTGRAY}
                    size={1.8}
                  />
                  <LineBreak val={1} />
                  <View
                    style={{
                      padding: responsiveHeight(1.65),
                      flexDirection: 'row',
                      gap: 5,
                      borderColor: colors.black,
                      borderWidth: 1,
                      borderRadius: 100,
                    }}
                  >
                    <AppText size={1.8} title={'Drag an image here or'} />
                    <AppText
                      fontWeight={'bold'}
                      color={colors.secondary_button}
                      size={1.8}
                      textDecorationLine={'underline'}
                      title={'upload a file'}
                    />
                  </View>
                </TouchableOpacity>
                {state.portfolio.length > 0 && (
                  <View style={{ marginTop: 10 }}>
                    {state.portfolio.map((file, index) => {
                      const isImage =
                        file.type?.includes('image') ||
                        file.path?.match(/\.(jpg|jpeg|png|gif)$/i);

                      return (
                        <View
                          key={index}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 10,
                          }}
                        >
                          {isImage ? (
                            <ImageBackground
                              source={{ uri: file.uri || file.path }}
                              style={{ width: 40, height: 40, marginRight: 10 }}
                              imageStyle={{ borderRadius: 5 }}
                            />
                          ) : (
                            <Feather
                              name="file-text"
                              size={40}
                              color={colors.secondary_button}
                              style={{ marginRight: 10 }}
                            />
                          )}
                          <AppText
                            size={1.6}
                            title={getShortFileName(
                              file.name || file.filename || `File ${index + 1}`,
                            )}
                            color={AppColors.BLACK}
                          />
                        </View>
                      );
                    })}
                  </View>
                )}
              </>
            )
          )}

          <LineBreak val={1} />
          <AppButton
            title={'update profile'}
            bgColor={
              user?.type === 'Technician'
                ? colors.secondary_button
                : colors.primary
            }
            textColor={AppColors.BLACK}
            textFontWeight={'bold'}
            borderRadius={30}
            isLoading={isLoading}
            buttoWidth={92}
            textTransform={'uppercase'}
            handlePress={() => onProfilePress()}
          />
          <LineBreak val={1} />
        </View>
      </View>
    </Container>
  );
};

export default Profile;
