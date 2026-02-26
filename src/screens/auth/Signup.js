import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Platform, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-simple-toast';
import moment from 'moment';
import { pick, types } from '@react-native-documents/picker';
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
  responsiveHeight,
  responsiveWidth,
} from '../../utils';
import { useRegisterMutation } from '../../redux/services';
import { MAP_API_KEY } from '../../redux/constant';
import { colors } from '../../assets/colors';

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
    address: '',
    dob: '', // Empty for placeholder
    lat: '',
    long: '',
  });

  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);

  // Helper to update state
  const onChangeText = (key, value) => {
    setState(prevState => ({ ...prevState, [key]: value }));
  };

  const convertLatLongToAddress = async (lat, lng) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${MAP_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      return data.status === 'OK' ? data.results[0].formatted_address : null;
    } catch (error) {
      return null;
    }
  };

  const currentLocationAndFetchAddress = async () => {
    try {
      Toast.show('Fetching location...', Toast.SHORT);
      const { latitude, longitude } = await getCurrentLocation();
      const address = await convertLatLongToAddress(latitude, longitude);

      setState(prev => ({
        ...prev,
        lat: latitude,
        long: longitude,
        address: address || '',
      }));
      googlePlacesRef.current?.setAddressText(address || '');
      Toast.show('Location Fetched!', Toast.SHORT);
    } catch (error) {
      Toast.show('Failed to fetch location', Toast.SHORT);
    }
  };

  const onSelectFile = async () => {
    try {
      const [pickResult] = await pick({ type: types.pdf });
      onChangeText('license', [
        { name: pickResult.name, file: pickResult.uri },
      ]);
    } catch (err) {
      console.log('Picker error', err);
    }
  };

  const onSignupPress = async () => {
    console.log('--- Signup Press Started ---');
    console.log('User Type:', type);
    console.log('Current State:', {
      ...state,
      password: '***',
      cPassword: '***',
    });

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
        return Toast.show('License PDF required', Toast.SHORT);
      }

      console.log('Creating FormData payload...');
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
          type: 'application/pdf',
        });
      }
      payload = data;
      console.log(
        'FormData Payload Parts:',
        data._parts?.map(p => p[0]),
      );
    } else {
      console.log('Creating JSON payload...');
      payload = {
        type,
        fullName: name,
        email: email.toLowerCase().trim(),
        password: password,
        locationName: address,
        latitude: String(lat),
        longitude: String(long),
      };
      console.log('JSON Payload keys:', Object.keys(payload));
    }

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
        onChangeText={text => onChangeText('name', text)}
        value={state.name}
        placeholder={'Full Name'}
      />

      <LineBreak val={2} />

      {/* Address Autocomplete */}
      <View style={styles.autocompleteWrapper}>
        <GooglePlacesAutocomplete
          ref={googlePlacesRef}
          placeholder="Home Address"
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
          <TouchableOpacity onPress={onSelectFile}>
            <View pointerEvents="none">
              <InputField
                value={state.license[0]?.name}
                placeholder={'Upload License (PDF)'}
              />
            </View>
          </TouchableOpacity>
          <LineBreak val={2} />
          <TouchableOpacity onPress={() => setIsDatePickerVisible(true)}>
            <View pointerEvents="none">
              <InputField value={state.dob} placeholder={'Date Of Birth'} />
            </View>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            maximumDate={new Date()}
            onConfirm={date => {
              onChangeText('dob', moment(date).format('DD-MM-YYYY'));
              setIsDatePickerVisible(false);
            }}
            onCancel={() => setIsDatePickerVisible(false)}
          />
        </>
      )}

      <LineBreak val={2} />
      <InputField
        value={state.email}
        onChangeText={text => onChangeText('email', text)}
        keyboardType={'email-address'}
        placeholder={'Email Address'}
      />

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

      <LineBreak val={4} />
      <Button indicator={isLoading} onPress={onSignupPress} title={'SIGN UP'} />

      <LineBreak val={3} />
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <AppText align={'center'} title={'Already have an account? Login'} />
      </TouchableOpacity>
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

// import React, { useEffect, useState, useCallback, useRef } from 'react';
// import { Platform, TouchableOpacity, View } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import Toast from 'react-native-simple-toast';
// import moment from 'moment';
// import { pick, types } from '@react-native-documents/picker';
// import DateTimePickerModal from 'react-native-modal-datetime-picker';
// import axios from 'axios';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

// // Custom Components & Utils
// import Container from '../../components/Container';
// import LineBreak from '../../components/LineBreak';
// import Button from '../../components/Button';
// import InputField from '../../components/InputField';
// import AppText from '../../components/AppText';
// import {
//   AppColors,
//   formatSSN,
//   getCurrentLocation,
//   responsiveHeight,
//   responsiveWidth,
// } from '../../utils';
// import { useRegisterMutation } from '../../redux/services';
// import { MAP_API_KEY, MAP_API_KEY_IOS } from '../../redux/constant';

// const Signup = ({ route }) => {
//   const [state, setState] = useState({
//     name: '',
//     email: '',
//     password: '',
//     cPassword: '',
//     ss: '',
//     license: [], // Simplified to empty array
//     address: '',
//     dob: moment().format('DD-MM-YYYY'),
//     lat: '',
//     long: '',
//   });

//   const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showCPassword, setShowCPassword] = useState(false);
//   const navigation = useNavigation();
//   const [register, { isLoading }] = useRegisterMutation();
//   const { type } = route?.params || {};
//   const googlePlacesRef = useRef();

//   let MAP_KEY = MAP_API_KEY;

//   /**
//    * Fetches current coordinates and converts to physical address
//    */
//   const currentLocationAndFetchAddress = async () => {
//     try {
//       Toast.show('Fetching current location...', Toast.SHORT);
//       const { latitude, longitude } = await getCurrentLocation();

//       const address = await convertLatLongToAddress(latitude, longitude);
//       setState(prevState => ({
//         ...prevState,
//         lat: latitude,
//         long: longitude,
//         address: address || '',
//       }));
//       googlePlacesRef.current?.setAddressText(address || '');
//       Toast.show('Current Location Fetched Successfully!', Toast.SHORT);
//     } catch (error) {
//       Toast.show('Failed to fetch current location', Toast.SHORT);
//     }
//   };

//   const convertLatLongToAddress = async (lat, lng) => {
//     try {
//       const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${MAP_KEY}`;
//       const response = await fetch(url, {
//         headers: {
//           [Platform.OS === 'ios'
//             ? 'X-Ios-Bundle-Identifier'
//             : 'X-Android-Package']:
//             Platform.OS === 'ios'
//               ? 'com.app.serbicorp'
//               : 'com.serbicorporation',
//         },
//       });
//       const data = await response.json();
//       if (data.status === 'OK' && data.results.length > 0) {
//         return data.results[0].formatted_address;
//       }
//       return null;
//     } catch (error) {
//       return null;
//     }
//   };

//   /**
//    * Google Places Autocomplete
//    */

//   const onSignupPress = async () => {
//     // Basic Validations
//     if (!state.name || !state.email || !state.password) {
//       Toast.show('Please fill all required fields', Toast.SHORT);
//       return;
//     }
//     if (state.password !== state.cPassword) {
//       Toast.show(`Passwords do not match`, Toast.SHORT);
//       return;
//     }

//     // Role Specific Validations
//     if (type === 'Technician') {
//       const ssnDigits = state.ss.replace(/\D/g, '');
//       if (ssnDigits.length !== 9) {
//         Toast.show('Valid 9-digit SSN required', Toast.SHORT);
//         return;
//       }
//       if (state.license.length === 0) {
//         Toast.show('Pest control license required', Toast.SHORT);
//         return;
//       }
//     }

//     let payload;
//     if (type === 'Technician') {
//       const data = new FormData();
//       data.append('type', type || '');
//       data.append('fullName', state.name || '');
//       data.append('email', (state.email || '').toLowerCase().trim());
//       data.append('password', state.password || '');
//       data.append('locationName', state.address || '');
//       data.append('latitude', String(state.lat || ''));
//       data.append('longitude', String(state.long || ''));
//       data.append('ss', state.ss || '');
//       data.append('DOB', state.dob || '');
//       if (state.license && state.license.length > 0) {
//         data.append('license', {
//           uri: state.license[0].file,
//           name: state.license[0].name || 'license.pdf',
//           type: 'application/pdf',
//         });
//       }
//       payload = data;
//     } else {
//       payload = {
//         type: type || '',
//         fullName: state.name || '',
//         email: (state.email || '').toLowerCase().trim(),
//         password: state.password || '',
//         locationName: state.address || '',
//         latitude: String(state.lat || ''),
//         longitude: String(state.long || ''),
//       };
//     }

//     console.log('Signup type:', type);
//     console.log(
//       'Final payload keys:',
//       type === 'Technician'
//         ? payload._parts.map(p => p[0])
//         : Object.keys(payload),
//     );

//     console.log('payload:-', payload);

//     await register(payload)
//       .unwrap()
//       .then(res => {
//         console.log('res in signup:-', res);
//         Toast.show(res.msg, Toast.SHORT);
//         if (res.success) {
//           navigation.navigate('Otp', { otpData: res.data });
//         }
//       })
//       .catch(error => {
//         console.log('error in signup:-', error);
//         const errorMessage = error?.data?.message || 'Registration failed';
//         Toast.show(errorMessage, Toast.SHORT);
//       });
//   };

//   const onChangeText = (key, value) => {
//     setState(prevState => ({ ...prevState, [key]: value }));
//   };

//   const onSelectFile = async () => {
//     try {
//       const [pickResult] = await pick({ type: types.pdf });
//       setState(prevState => ({
//         ...prevState,
//         license: [{ name: pickResult.name, file: pickResult.uri }],
//       }));
//     } catch (err) {
//       console.log('Document picker error', err);
//     }
//   };

//   return (
//     <Container
//       contentStyle={{ paddingBottom: responsiveHeight(7) }}
//       space={10}
//       authHeading={'SIGN UP'}
//     >
//       <LineBreak val={4} />

//       <InputField
//         onChangeText={text => onChangeText('name', text)}
//         value={state.name}
//         placeholder={'Full Name'}
//       />

//       <LineBreak val={2} />

//       <View style={{ zIndex: 1000, position: 'relative' }}>
//         <GooglePlacesAutocomplete
//           ref={googlePlacesRef}
//           placeholder="Home Address"
//           fetchDetails={true}
//           onPress={(data, details = null) => {
//             setState(prevState => ({
//               ...prevState,
//               address: data.description || details?.formatted_address,
//               lat: details?.geometry?.location?.lat,
//               long: details?.geometry?.location?.lng,
//             }));
//           }}
//           query={{
//             key: MAP_KEY,
//             language: 'en',
//             components: 'country:us',
//           }}
//           requestHttpHeaders={{
//             [Platform.OS === 'ios'
//               ? 'X-Ios-Bundle-Identifier'
//               : 'X-Android-Package']:
//               Platform.OS === 'ios'
//                 ? 'com.app.serbicorp'
//                 : 'com.serbicorporation',
//           }}
//           onFail={error => {
//             console.error('Signup Google Places Error:', error);
//             if (
//               error === 'request could not be completed or has been aborted'
//             ) {
//               console.log('Request aborted - checking key/bundle ID...');
//             }
//           }}
//           debounce={400}
//           textInputProps={{
//             onChangeText: async text => {
//               if (text.length >= 3) {
//                 console.log('Diagnostic fetch for:', text);
//                 try {
//                   const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
//                     text,
//                   )}&key=${MAP_KEY}&components=country:us`;

//                   console.log('Test 1: Fetch without headers...');
//                   const resp1 = await fetch(url).catch(e => {
//                     console.error('Test 1 Failed:', e.message);
//                     return null;
//                   });
//                   if (resp1) {
//                     const json1 = await resp1.json();
//                     console.log('Test 1 Result:', json1.status);
//                   }

//                   console.log('Test 2: Fetch with headers...');
//                   const resp2 = await fetch(url, {
//                     headers: {
//                       'X-Ios-Bundle-Identifier': 'com.app.serbicorp',
//                     },
//                   }).catch(e => {
//                     console.error('Test 2 Failed:', e.message);
//                     return null;
//                   });
//                   if (resp2) {
//                     const json2 = await resp2.json();
//                     console.log('Test 2 Result:', json2.status);
//                   }

//                   console.log('Test 3: Axios with headers...');
//                   const resp3 = await axios
//                     .get(url, {
//                       headers: {
//                         'X-Ios-Bundle-Identifier': 'com.app.serbicorp',
//                       },
//                     })
//                     .catch(e => {
//                       console.error('Test 3 Failed:', e.message);
//                       return null;
//                     });
//                   if (resp3) {
//                     console.log('Test 3 Result:', resp3.data.status);
//                   }
//                 } catch (err) {
//                   console.error('Diagnostic Generic Error:', err);
//                 }
//               }
//             },
//           }}
//           styles={{
//             container: {
//               flex: 0,
//               marginHorizontal: responsiveWidth(5),
//             },
//             textInputContainer: {
//               backgroundColor: 'transparent',
//               borderTopWidth: 0,
//               borderBottomWidth: 0,
//             },
//             textInput: {
//               height: responsiveHeight(6.5),
//               color: AppColors.BLACK,
//               fontSize: 16,
//               borderWidth: 1,
//               borderColor: '#ccc',
//               borderRadius: 8,
//               paddingLeft: 15,
//             },
//             listView: {
//               backgroundColor: '#fff',
//               elevation: 5,
//               zIndex: 1000,
//             },
//           }}
//           renderRightButton={() => (
//             <TouchableOpacity
//               onPress={currentLocationAndFetchAddress}
//               style={{
//                 justifyContent: 'center',
//                 position: 'absolute',
//                 right: 15,
//                 top: 15,
//               }}
//             >
//               <Ionicons name="locate" size={24} color={AppColors.PRIMARY} />
//             </TouchableOpacity>
//           )}
//         />
//       </View>

//       {type === 'Technician' && (
//         <>
//           <LineBreak val={2} />
//           <InputField
//             onChangeText={text => onChangeText('ss', formatSSN(text))}
//             value={state.ss}
//             keyboardType="numeric"
//             placeholder="SSN (XXX-XX-XXXX)"
//           />
//           <LineBreak val={2} />
//           <TouchableOpacity onPress={onSelectFile}>
//             <InputField
//               value={state.license[0]?.name}
//               editable={false}
//               placeholder={'Upload License (PDF)'}
//             />
//           </TouchableOpacity>
//           <LineBreak val={2} />
//           <TouchableOpacity onPress={() => setIsDatePickerVisible(true)}>
//             <InputField
//               value={state.dob}
//               editable={false}
//               placeholder={'Date Of Birth'}
//             />
//           </TouchableOpacity>
//           <DateTimePickerModal
//             isVisible={isDatePickerVisible}
//             mode="date"
//             onConfirm={date => {
//               onChangeText('dob', moment(date).format('DD-MM-YYYY'));
//               setIsDatePickerVisible(false);
//             }}
//             onCancel={() => setIsDatePickerVisible(false)}
//           />
//         </>
//       )}

//       <LineBreak val={2} />
//       <InputField
//         value={state.email}
//         onChangeText={text => onChangeText('email', text)}
//         keyboardType={'email-address'}
//         placeholder={'Email Address'}
//       />

//       <LineBreak val={2} />
//       <InputField
//         onChangeText={text => onChangeText('password', text)}
//         value={state.password}
//         secureTextEntry={!showPassword}
//         placeholder={'Password'}
//         rightIcon={
//           <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//             <Ionicons
//               name={showPassword ? 'eye-outline' : 'eye-off-outline'}
//               size={22}
//               color={AppColors.PRIMARY}
//             />
//           </TouchableOpacity>
//         }
//       />

//       <LineBreak val={2} />
//       <InputField
//         onChangeText={text => onChangeText('cPassword', text)}
//         value={state.cPassword}
//         secureTextEntry={!showCPassword}
//         placeholder={'Confirm Password'}
//         rightIcon={
//           <TouchableOpacity onPress={() => setShowCPassword(!showCPassword)}>
//             <Ionicons
//               name={showCPassword ? 'eye-outline' : 'eye-off-outline'}
//               size={22}
//               color={AppColors.PRIMARY}
//             />
//           </TouchableOpacity>
//         }
//       />

//       <LineBreak val={4} />
//       <Button indicator={isLoading} onPress={onSignupPress} title={'SIGN UP'} />

//       <LineBreak val={3} />
//       <TouchableOpacity onPress={() => navigation.navigate('Login')}>
//         <AppText align={'center'} title={'Already have an account? Login'} />
//       </TouchableOpacity>
//     </Container>
//   );
// };

// const styles = {
//   predictionBox: {
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     marginTop: 5,
//     marginHorizontal: responsiveHeight(3),
//     elevation: 4,
//     zIndex: 1000,
//   },
//   predictionItem: {
//     padding: 12,
//     borderBottomWidth: 0.5,
//     borderColor: '#eee',
//   },
// };

// export default Signup;
