import React, { useState, useRef } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-simple-toast';
import moment from 'moment';
import {
  pick,
  types,
  isErrorWithCode,
  errorCodes,
} from '@react-native-documents/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

// Custom Components & Utils
import Container from '../../components/Container';
import LineBreak from '../../components/LineBreak';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import AppText from '../../components/AppText';
import {
  AppColors,
  formatSSN,
  getCurrentLocation,
  getAddressFromCoordinates,
  responsiveHeight,
  responsiveWidth,
} from '../../utils';
import { useRegisterMutation } from '../../redux/services';
import { MAP_API_KEY } from '../../redux/constant';
import { colors } from '../../assets/colors';

const getMimeType = (fileName = '') => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'txt':
      return 'text/plain';
    default:
      return 'application/octet-stream';
  }
};

const Signup = ({ route }) => {
  const navigation = useNavigation();
  const googlePlacesRef = useRef();
  const { type } = route?.params || {};

  const [register, { isLoading }] = useRegisterMutation();

  const [state, setState] = useState({
    name: '',
    email: '',
    password: '',
    cPassword: '',
    ss: '',
    license: [],
    drivingLicense: [],
    drivingLicenseExpiry: '',
    isTermsAccepted: false,
    address: '',
    dob: '', // Empty for placeholder
    lat: '',
    long: '',
  });

  const [isDobPickerVisible, setIsDobPickerVisible] = useState(false);
  const [isExpiryPickerVisible, setIsExpiryPickerVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);

  // Helper to update state
  const onChangeText = (key, value) => {
    setState(prevState => ({ ...prevState, [key]: value }));
  };

  const currentLocationAndFetchAddress = async () => {
    try {
      Toast.show('Fetching location...', Toast.SHORT);
      const coords = await getCurrentLocation();
      if (!coords?.latitude || !coords?.longitude) {
        return;
      }
      const { latitude, longitude } = coords;
      const address = await getAddressFromCoordinates(latitude, longitude);

      if (address) {
        setState(prev => ({
          ...prev,
          lat: latitude,
          long: longitude,
          address: address,
        }));
        googlePlacesRef.current?.setAddressText(address);
        Toast.show('Location Fetched!', Toast.SHORT);
      } else {
        setState(prev => ({
          ...prev,
          lat: latitude,
          long: longitude,
        }));
        Toast.show(
          'Location coordinates fetched, please enter address',
          Toast.LONG,
        );
      }
    } catch (error) {
      console.log('Signup location fetch error:', error);
      Toast.show('Failed to fetch location', Toast.SHORT);
    }
  };

  const onSelectFile = async (fieldKey = 'license') => {
    try {
      const [pickResult] = await pick({
        type: [types.pdf, types.images, types.doc, types.docx, types.plainText],
      });
      if (pickResult?.uri) {
        onChangeText(fieldKey, [
          {
            name: pickResult.name,
            file: pickResult.uri,
            type: pickResult.type || getMimeType(pickResult.name),
          },
        ]);
      }
    } catch (err) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        return;
      }
      console.log('Picker error', err);
    }
  };

  const onSignupPress = async () => {
    const {
      name,
      email,
      password,
      cPassword,
      address,
      lat,
      long,
      ss,
      dob,
      license,
      drivingLicense,
      drivingLicenseExpiry,
      isTermsAccepted,
    } = state;

    // Common Validations
    if (!name || !email || !password || !address) {
      console.log('Validation Failed: Missing required fields');
      return Toast.show('Please fill all required fields', Toast.SHORT);
    }
    if (password !== cPassword) {
      console.log('Validation Failed: Password mismatch');
      return Toast.show('Passwords do not match', Toast.SHORT);
    }
    if (!isTermsAccepted) {
      console.log('Validation Failed: Terms not accepted');
      return Toast.show(
        'Please agree to the Terms and Conditions',
        Toast.SHORT,
      );
    }

    let payload;

    if (type === 'Technician') {
      console.log('Technician Specific Validation...');
      const ssnDigits = (ss || '').replace(/\D/g, '');
      if (ssnDigits.length !== 9) {
        console.log('Validation Failed: SSN invalid', ssnDigits);
        return Toast.show('Valid 9-digit SSN required', Toast.SHORT);
      }
      if (!license || license.length === 0) {
        console.log('Validation Failed: License missing');
        return Toast.show('Pest control license required', Toast.SHORT);
      }
      if (!drivingLicense || drivingLicense.length === 0) {
        console.log('Validation Failed: Driving License missing');
        return Toast.show('Driving license required', Toast.SHORT);
      }
      if (!drivingLicenseExpiry) {
        console.log('Validation Failed: Driving License Expiry missing');
        return Toast.show('Driving license expiry date required', Toast.SHORT);
      }
      if (!dob) {
        console.log('Validation Failed: DOB missing');
        return Toast.show('Date of birth required', Toast.SHORT);
      }

      const data = new FormData();
      data.append('type', type);
      data.append('fullName', name);
      data.append('email', email.toLowerCase().trim());
      data.append('password', password);
      data.append('locationName', address);
      data.append('latitude', String(lat));
      data.append('longitude', String(long));
      data.append('ss', ss);
      data.append('DOB', dob);
      if (license?.[0]?.file) {
        data.append('license', {
          uri: license[0].file,
          name: license[0].name || 'license.pdf',
          type:
            license[0].type ||
            getMimeType(license[0].name) ||
            'application/pdf',
        });
      }
      if (drivingLicense?.[0]?.file) {
        data.append('drivingLicense', {
          uri: drivingLicense[0].file,
          name: drivingLicense[0].name || 'driving_license.pdf',
          type:
            drivingLicense[0].type ||
            getMimeType(drivingLicense[0].name) ||
            'application/pdf',
        });
      }
      if (drivingLicenseExpiry) {
        data.append('drivingLicenseExpiry', drivingLicenseExpiry);
      }
      data.append('isTermsAccepted', 'true');
      payload = data;
    } else {
      payload = {
        type,
        fullName: name,
        email: email.toLowerCase().trim(),
        password: password,
        locationName: address,
        latitude: String(lat),
        longitude: String(long),
        isTermsAccepted: true,
      };
    }
    console.log('Signup Payload:-', payload);

    try {
      console.log('Executing register mutation...');
      const res = await register(payload).unwrap();
      console.log('Signup Result:', res);
      Toast.show(res.msg, Toast.SHORT);
      if (res.success) navigation.navigate('Otp', { otpData: res.data });
    } catch (error) {
      console.error('Signup Error Exception:', error);
      Toast.show(error?.data?.message || 'Registration failed', Toast.SHORT);
    }
  };

  return (
    <Container
      scrollEnabled={true}
      keyboardShouldPersistTaps="handled"
      authHeading={'SIGN UP'}
      space={5}
    >
      <LineBreak val={3} />

      <InputField
        value={state.name}
        placeholder={'Full Name'}
        onChangeText={text => onChangeText('name', text)}
      />

      <LineBreak val={2} />

      <InputField
        value={state.email}
        placeholder={'Email Address'}
        keyboardType={'email-address'}
        onChangeText={text => onChangeText('email', text)}
      />

      <LineBreak val={2} />

      {/* Address Autocomplete */}
      <View style={styles.autocompleteWrapper}>
        <GooglePlacesAutocomplete
          ref={googlePlacesRef}
          placeholder={
            type === 'Technician' ? 'Business Address' : 'Home Address'
          }
          fetchDetails={true}
          keyboardShouldPersistTaps="handled"
          onPress={(data, details = null) => {
            setState(prev => ({
              ...prev,
              address: data.description || details?.formatted_address,
              lat: details?.geometry?.location?.lat,
              long: details?.geometry?.location?.lng,
            }));
          }}
          query={{ key: MAP_API_KEY, language: 'en', components: 'country:us' }}
          textInputProps={{
            placeholderTextColor: colors.placeholder_color,
            onChangeText: text => {
              onChangeText('address', text);
            },
          }}
          styles={autoCompleteStyles}
          renderRightButton={() => (
            <TouchableOpacity
              onPress={currentLocationAndFetchAddress}
              style={styles.locateBtn}
            >
              <Ionicons name="locate" size={24} color={AppColors.PRIMARY} />
            </TouchableOpacity>
          )}
        />
      </View>

      {type === 'Technician' && (
        <>
          <LineBreak val={2} />
          <InputField
            onChangeText={text => onChangeText('ss', formatSSN(text))}
            value={state.ss}
            keyboardType="numeric"
            placeholder="SSN (XXX-XX-XXXX)"
          />

          <LineBreak val={2} />
          <TouchableOpacity onPress={() => onSelectFile('license')}>
            <View pointerEvents="none">
              <InputField
                value={state.license[0]?.name}
                placeholder={'Upload Pest Control License'}
              />
            </View>
          </TouchableOpacity>

          <LineBreak val={2} />
          <TouchableOpacity onPress={() => onSelectFile('drivingLicense')}>
            <View pointerEvents="none">
              <InputField
                value={state.drivingLicense[0]?.name}
                placeholder={'Upload Driving License'}
              />
            </View>
          </TouchableOpacity>

          <LineBreak val={2} />
          <TouchableOpacity onPress={() => setIsExpiryPickerVisible(true)}>
            <View pointerEvents="none">
              <InputField
                value={state.drivingLicenseExpiry}
                placeholder={'Driving License Expiry'}
              />
            </View>
          </TouchableOpacity>

          <LineBreak val={2} />
          <TouchableOpacity onPress={() => setIsDobPickerVisible(true)}>
            <View pointerEvents="none">
              <InputField value={state.dob} placeholder={'Date Of Birth'} />
            </View>
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={isDobPickerVisible}
            mode="date"
            maximumDate={new Date()}
            onConfirm={date => {
              onChangeText('dob', moment(date).format('DD-MM-YYYY'));
              setIsDobPickerVisible(false);
            }}
            onCancel={() => setIsDobPickerVisible(false)}
          />

          <DateTimePickerModal
            isVisible={isExpiryPickerVisible}
            mode="date"
            minimumDate={new Date()}
            onConfirm={date => {
              onChangeText(
                'drivingLicenseExpiry',
                moment(date).format('DD-MM-YYYY'),
              );
              setIsExpiryPickerVisible(false);
            }}
            onCancel={() => setIsExpiryPickerVisible(false)}
          />
        </>
      )}

      <LineBreak val={2} />

      <InputField
        onChangeText={text => onChangeText('password', text)}
        value={state.password}
        secureTextEntry={!showPassword}
        placeholder={'Password'}
        rightIcon={
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={22}
              color={AppColors.PRIMARY}
            />
          </TouchableOpacity>
        }
      />

      <LineBreak val={2} />
      <InputField
        onChangeText={text => onChangeText('cPassword', text)}
        value={state.cPassword}
        secureTextEntry={!showCPassword}
        placeholder={'Confirm Password'}
        rightIcon={
          <TouchableOpacity onPress={() => setShowCPassword(!showCPassword)}>
            <Ionicons
              name={showCPassword ? 'eye-outline' : 'eye-off-outline'}
              size={22}
              color={AppColors.PRIMARY}
            />
          </TouchableOpacity>
        }
      />

      <LineBreak val={2} />
      <View style={styles.termsWrapper}>
        <TouchableOpacity
          onPress={() =>
            onChangeText('isTermsAccepted', !state.isTermsAccepted)
          }
          style={styles.checkboxTouch}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.checkbox,
              state.isTermsAccepted && styles.checkboxSelected,
            ]}
          >
            {state.isTermsAccepted && (
              <Ionicons name="checkmark" size={15} color="#000000" />
            )}
          </View>
        </TouchableOpacity>
        <View style={styles.termsTextWrap}>
          <Text
            style={styles.termsRegularText}
            onPress={() =>
              onChangeText('isTermsAccepted', !state.isTermsAccepted)
            }
          >
            I agree to the{' '}
            <Text
              style={styles.termsLinkText}
              onPress={() => navigation.navigate('TermsAndCondition')}
            >
              Terms & Conditions
            </Text>
          </Text>
        </View>
      </View>

      <LineBreak val={4} />
      <Button indicator={isLoading} onPress={onSignupPress} title={'SIGN UP'} />

      <LineBreak val={3} />
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <AppText align={'center'} title={'Already have an account? Login'} />
      </TouchableOpacity>
      <LineBreak val={3} />
    </Container>
  );
};

const styles = StyleSheet.create({
  autocompleteWrapper: {
    zIndex: 1000,
    position: 'relative',
    marginHorizontal: responsiveWidth(5),
  },
  locateBtn: {
    justifyContent: 'center',
    position: 'absolute',
    right: 15,
    top: 15,
  },
  termsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: responsiveWidth(6),
    marginTop: responsiveHeight(1),
  },
  checkboxTouch: {
    paddingRight: 10,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  termsTextWrap: {
    flex: 1,
  },
  termsRegularText: {
    fontSize: 13,
    color: '#333333',
  },
  termsLinkText: {
    color: '#000000',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

const autoCompleteStyles = {
  container: { flex: 0 },
  textInput: {
    height: responsiveHeight(6.5),
    color: AppColors.BLACK,
    fontSize: 14,
    borderWidth: 0.2,
    borderColor: colors.black,
    borderRadius: 10,
    paddingLeft: 15,
    paddingRight: 45,
    backgroundColor: colors.input_color,
  },
  listView: {
    backgroundColor: '#fff',
    elevation: 5,
    zIndex: 2000,
    position: 'absolute',
    top: 50,
  },
};

export default Signup;
