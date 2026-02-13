import React, { useEffect, useState, useCallback } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-simple-toast';
import moment from 'moment';
import { pick, types } from '@react-native-documents/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';

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

const Signup = ({ route }) => {
  const [state, setState] = useState({
    name: '',
    email: '',
    password: '',
    cPassword: '',
    ss: '',
    license: [], // Simplified to empty array
    address: '',
    dob: moment().format('DD-MM-YYYY'),
    lat: '',
    long: '',
  });

  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const navigation = useNavigation();
  const [register, { isLoading }] = useRegisterMutation();
  const { type } = route?.params || {};

  /**
   * Fetches current coordinates and converts to physical address
   */
  const currentLocationAndFetchAddress = async () => {
    try {
      Toast.show('Fetching current location...', Toast.SHORT);
      const { latitude, longitude } = await getCurrentLocation();

      const address = await convertLatLongToAddress(latitude, longitude);
      setState(prevState => ({
        ...prevState,
        lat: latitude,
        long: longitude,
        address: address || '',
      }));
      Toast.show('Current Location Fetched Successfully!', Toast.SHORT);
    } catch (error) {
      Toast.show('Failed to fetch current location', Toast.SHORT);
    }
  };

  const convertLatLongToAddress = async (lat, lng) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${MAP_API_KEY}`;
      const response = await axios.get(url);
      if (response.data.status === 'OK' && response.data.results.length > 0) {
        return response.data.results[0].formatted_address;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  /**
   * Google Places Autocomplete
   */
  const searchLocation = async key => {
    if (!key || key.length < 3) {
      setPredictions([]);
      return;
    }
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
        {
          params: {
            input: key,
            key: MAP_API_KEY,
            components: 'country:us',
          },
        },
      );
      if (response.data?.predictions) {
        setPredictions(response.data.predictions);
      }
    } catch (error) {
      console.error('Predictions Error', error);
    }
  };

  const getPlaceDetails = async placeId => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json`,
        {
          params: { place_id: placeId, key: MAP_API_KEY },
        },
      );
      const details = response.data?.result;
      if (details) {
        setState(prevState => ({
          ...prevState,
          address: details.formatted_address || details.name,
          lat: details.geometry?.location?.lat,
          long: details.geometry?.location?.lng,
        }));
        setPredictions([]);
      }
    } catch (error) {
      console.error('Place Details Error', error);
    }
  };

  const onSignupPress = async () => {
    // Basic Validations
    if (!state.name || !state.email || !state.password) {
      Toast.show('Please fill all required fields', Toast.SHORT);
      return;
    }
    if (state.password !== state.cPassword) {
      Toast.show(`Passwords do not match`, Toast.SHORT);
      return;
    }

    // Role Specific Validations
    if (type === 'Technician') {
      const ssnDigits = state.ss.replace(/\D/g, '');
      if (ssnDigits.length !== 9) {
        Toast.show('Valid 9-digit SSN required', Toast.SHORT);
        return;
      }
      if (state.license.length === 0) {
        Toast.show('Pest control license required', Toast.SHORT);
        return;
      }
    }

    let payload;
    if (type === 'Technician') {
      const data = new FormData();
      data.append('type', type || '');
      data.append('fullName', state.name || '');
      data.append('email', (state.email || '').toLowerCase().trim());
      data.append('password', state.password || '');
      data.append('locationName', state.address || '');
      data.append('latitude', String(state.lat || ''));
      data.append('longitude', String(state.long || ''));
      data.append('ss', state.ss || '');
      data.append('DOB', state.dob || '');
      if (state.license && state.license.length > 0) {
        data.append('license', {
          uri: state.license[0].file,
          name: state.license[0].name || 'license.pdf',
          type: 'application/pdf',
        });
      }
      payload = data;
    } else {
      payload = {
        type: type || '',
        fullName: state.name || '',
        email: (state.email || '').toLowerCase().trim(),
        password: state.password || '',
        locationName: state.address || '',
        latitude: String(state.lat || ''),
        longitude: String(state.long || ''),
      };
    }

    console.log('Signup type:', type);
    console.log(
      'Final payload keys:',
      type === 'Technician'
        ? payload._parts.map(p => p[0])
        : Object.keys(payload),
    );

    console.log('payload:-', payload);

    await register(payload)
      .unwrap()
      .then(res => {
        console.log('res in signup:-', res);
        Toast.show(res.msg, Toast.SHORT);
        if (res.success) {
          navigation.navigate('Otp', { otpData: res.data });
        }
      })
      .catch(error => {
        console.log('error in signup:-', error);
        const errorMessage = error?.data?.message || 'Registration failed';
        Toast.show(errorMessage, Toast.SHORT);
      });
  };

  const onChangeText = (key, value) => {
    setState(prevState => ({ ...prevState, [key]: value }));
  };

  const onSelectFile = async () => {
    try {
      const [pickResult] = await pick({ type: types.pdf });
      setState(prevState => ({
        ...prevState,
        license: [{ name: pickResult.name, file: pickResult.uri }],
      }));
    } catch (err) {
      console.log('Document picker error', err);
    }
  };

  // lat 37.4219983
  // long -122.084
  return (
    <Container
      contentStyle={{ paddingBottom: responsiveHeight(7) }}
      space={10}
      authHeading={'SIGN UP'}
    >
      <LineBreak val={4} />

      <InputField
        onChangeText={text => onChangeText('name', text)}
        value={state.name}
        placeholder={'Full Name'}
      />

      <LineBreak val={2} />

      <InputField
        onChangeText={text => {
          onChangeText('address', text);
          searchLocation(text);
        }}
        value={state.address}
        icon={true}
        onLocationPress={currentLocationAndFetchAddress}
        innerStyle={{ width: responsiveWidth(75) }}
        placeholder={'Home Address'}
      />

      {/* Autocomplete Predictions */}
      {predictions.length > 0 && (
        <View style={styles.predictionBox}>
          {predictions.map(item => (
            <TouchableOpacity
              key={item.place_id}
              onPress={() => getPlaceDetails(item.place_id)}
              style={styles.predictionItem}
            >
              <AppText
                title={item.description}
                textColor={AppColors.BLACK}
                textSize={1.6}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}

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
            <InputField
              value={state.license[0]?.name}
              editable={false}
              placeholder={'Upload License (PDF)'}
            />
          </TouchableOpacity>
          <LineBreak val={2} />
          <TouchableOpacity onPress={() => setIsDatePickerVisible(true)}>
            <InputField
              value={state.dob}
              editable={false}
              placeholder={'Date Of Birth'}
            />
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
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

const styles = {
  predictionBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 5,
    marginHorizontal: responsiveHeight(3),
    elevation: 4,
    zIndex: 1000,
  },
  predictionItem: {
    padding: 12,
    borderBottomWidth: 0.5,
    borderColor: '#eee',
  },
};

export default Signup;

// import Container from '../../components/Container';
// import LineBreak from '../../components/LineBreak';
// import Button from '../../components/Button';
// import InputField from '../../components/InputField';
// import SocialButtons from '../../components/SocialButtons';
// import AppText from '../../components/AppText';
// import { TouchableOpacity, View } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { useEffect, useState } from 'react';
// import {
//   AppColors,
//   formatSSN,
//   getCurrentLocation,
//   responsiveHeight,
//   responsiveWidth,
// } from '../../utils';
// import Toast from 'react-native-simple-toast';
// import { useRegisterMutation } from '../../redux/services';
// import { pick, types } from '@react-native-documents/picker';
// import moment from 'moment';
// import DateTimePickerModal from 'react-native-modal-datetime-picker';
// import { MAP_API_KEY } from '../../redux/constant';
// import axios from 'axios';

// const Signup = ({ route }) => {
//   const [state, setState] = useState({
//     name: '',
//     number: '',
//     email: '',
//     password: '',
//     cPassword: '',
//     ss: '',
//     // license: {
//     //   name: '',
//     //   file: '',
//     // },
//     license: [{ name: '', file: '' }],
//     address: '',
//     dob: moment(new Date()).format('DD-MM-YYYY'),
//     lat: '',
//     long: '',
//   });
//   const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
//   const [predictions, setPredictions] = useState([]);
//   const navigation = useNavigation();
//   const [register, { isLoading }] = useRegisterMutation();
//   const { type } = route?.params;

//   // console.log(state.lat,state.long)

//   const currentLocationAndFetchAddress = async () => {
//     try {
//       Toast.show('Fetching current location...', Toast.SHORT);
//       const { latitude, longitude } = await getCurrentLocation();
//       // console.log('Lat Long:', latitude, longitude);

//       const address = await convertLatLongToAddress(latitude, longitude);
//       setState(prevState => ({
//         ...prevState,
//         lat: latitude,
//         long: longitude,
//         address: address,
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

//   const onSignupPress = async () => {
//     if (!state.name) {
//       Toast.show('Please enter your name', Toast.SHORT);
//       return;
//     }
//     // if (!state.number) {
//     //   Toast.show('Please enter your number', 2000, Toast.SHORT);
//     //   return;
//     // }
//     if (!state.email) {
//       Toast.show('Please enter your email', Toast.SHORT);
//       return;
//     }
//     if (!state.password) {
//       Toast.show('Please enter your password', Toast.SHORT);
//       return;
//     }
//     if (state.password.length < 8) {
//       Toast.show('Password is too short', Toast.SHORT);
//       return;
//     }
//     if (!state.cPassword) {
//       Toast.show('Please confirm your password', Toast.SHORT);
//       return;
//     }
//     if (state.cPassword !== state.password) {
//       Toast.show(`Password doesn't match`, Toast.SHORT);
//       return;
//     }

//     if (type === 'Technician') {
//       const ssnDigits = state.ss.replace(/\D/g, '');
//       if (ssnDigits.length !== 9) {
//         Toast.show('Please enter a valid 9-digit SSN', Toast.SHORT);
//         return;
//       }

//       if (state.license.length < 1) {
//         Toast.show('Please upload your pest control license', Toast.SHORT);
//         return;
//       }
//     }

//     let data = new FormData();
//     data.append('type', type);
//     data.append('fullName', state.name);
//     data.append('email', state.email);
//     data.append('ss', state.ss);
//     data.append('password', state.password);
//     data.append('locationName', state.address);
//     data.append('latitude', state.lat);
//     data.append('longitude', state.long);
//     data.append('DOB', state.dob);
//     if (type === 'Technician') {
//       if (state.license.length > 0) {
//         // const fileObj = state.license[0];
//         // if (fileObj.file && fileObj.file.startsWith('file://')) {
//         //   data.append('license', {
//         //     uri: fileObj.file,
//         //     type: 'application/pdf',
//         //     name: fileObj.name,
//         //   });
//         // } else if (typeof fileObj.file === 'string') {
//         //   data.append('license', fileObj.file);
//         // }
//         data.append('license', {
//           uri: state.license[0].file,
//           name: state.license[0].name,
//           type: 'application/pdf',
//         });
//       }
//       // data.append('pestControlLicense', {
//       //   uri: state.license.file,
//       //   type: 'application/pdf',
//       //   name: state.license.name,
//       // });
//     }
//     console.log('data:-', data);
//     // let data = {
//     //   type: type,
//     //   fullName: state.name,
//     //   phone: state.number,
//     //   email: state.email,
//     //   password: state.password,
//     // };

//     await register(data)
//       .unwrap()
//       .then(res => {
//         console.log('response of register ===>', res);
//         Toast.show(res.msg, Toast.SHORT);
//         if (res.success) {
//           navigation.navigate('Otp', { otpData: res.data });
//         }
//       })
//       .catch(error => {
//         console.log('error while register ====>', error);
//         const errorMessage =
//           error?.data?.message || error?.message || 'Some problem occurred';
//         Toast.show(errorMessage, Toast.SHORT);
//       });
//   };

//   const onChangeText = (state, value) => {
//     setState(prevState => ({
//       ...prevState,
//       [state]: value,
//     }));
//   };

//   const onSelectFile = async () => {
//     try {
//       const [pickResult] = await pick({
//         type: types.pdf,
//       });

//       // console.log('pick result ===>', pickResult);
//       setState(prevState => ({
//         ...prevState,
//         license: [
//           {
//             name: pickResult.name,
//             file: pickResult.uri,
//           },
//         ],
//       }));
//     } catch (err) {
//       console.log('error picking document', err);
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
//           address: locationName,
//           lat,
//           long,
//         }));
//         setPredictions([]);
//       }
//     } catch (error) {
//       console.error('Error fetching place details', error);
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
//         placeholder={'Name'}
//       />
//       {/* <LineBreak val={2} />
//       <InputField
//         onChangeText={text => onChangeText('number', text)}
//         value={state.number}
//         keyboardType={'numeric'}
//         placeholder={'Number'}
//       /> */}
//       <LineBreak val={2} />
//       <InputField
//         onChangeText={text => {
//           onChangeText('address', text);
//           searchLocation(text);
//         }}
//         value={state.address}
//         icon={true}
//         onLocationPress={currentLocationAndFetchAddress}
//         innerStyle={{ width: responsiveWidth(75) }}
//         placeholder={'Home Address'}
//       />
//       {predictions.length > 0 && (
//         <View
//           style={{
//             backgroundColor: '#fff',
//             borderRadius: 8,
//             marginTop: 5,
//             margin: responsiveHeight(3),
//             elevation: 3,
//           }}
//         >
//           {predictions.map(item => (
//             <TouchableOpacity
//               key={item.place_id}
//               onPress={() => getPlaceDetails(item.place_id)}
//               style={{
//                 padding: 12,
//                 borderBottomWidth: 0.5,
//                 borderColor: '#eee',
//               }}
//             >
//               <AppText
//                 title={item.description}
//                 textColor={AppColors.BLACK}
//                 textSize={1.6}
//               />
//             </TouchableOpacity>
//           ))}
//         </View>
//       )}
//       {type === 'Technician' && (
//         <>
//           <LineBreak val={2} />
//           <InputField
//             onChangeText={text => {
//               const formatted = formatSSN(text);
//               onChangeText('ss', formatted);
//             }}
//             value={state.ss}
//             keyboardType="numeric"
//             placeholder="SSN"
//           />
//           <LineBreak val={2} />
//           <TouchableOpacity onPress={() => onSelectFile()}>
//             <InputField
//               value={state.license[0]?.name}
//               editable={false}
//               placeholder={'Choose file… (Pest Control License)'}
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
//               setState(prevState => ({
//                 ...prevState,
//                 dob: moment(date).format('DD-MM-YYYY'),
//               }));
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
//         placeholder={'Password'}
//       />
//       <LineBreak val={3} />
//       <InputField
//         onChangeText={text => onChangeText('cPassword', text)}
//         value={state.cPassword}
//         placeholder={'Confirm Password'}
//       />
//       <LineBreak val={3} />
//       <Button
//         indicator={isLoading}
//         onPress={() => onSignupPress()}
//         title={'SIGN UP'}
//       />
//       <LineBreak val={3} />
//       {/* <SocialButtons
//         onSocialPress={type => console.log('type', type)}
//         heading={'Continue with'}
//       /> */}
//       {/* <LineBreak val={5} /> */}
//       <TouchableOpacity onPress={() => navigation.navigate('Login')}>
//         <AppText align={'center'} title={'Already have an account? Login'} />
//       </TouchableOpacity>
//     </Container>
//   );
// };

// export default Signup;
