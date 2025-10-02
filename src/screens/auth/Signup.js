import Container from '../../components/Container';
import LineBreak from '../../components/LineBreak';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import SocialButtons from '../../components/SocialButtons';
import AppText from '../../components/AppText';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { responsiveHeight, responsiveWidth } from '../../utils';
import Toast from 'react-native-simple-toast';
import { useRegisterMutation } from '../../redux/services';
import { pick, types } from '@react-native-documents/picker';
import moment from 'moment';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const Signup = ({ route }) => {
  const [state, setState] = useState({
    name: '',
    number: '',
    email: '',
    password: '',
    cPassword: '',
    ss: '',
    license: {
      name: '',
      file: '',
    },
    address: '',
    dob: moment(new Date()).format('DD-MM-YYYY'),
  });
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const navigation = useNavigation();
  const [register, { isLoading }] = useRegisterMutation();
  const { type } = route?.params;

  const onSignupPress = async () => {
    if (!state.name) {
      Toast.show('Please enter your name', 2000, Toast.SHORT);
      return;
    }
    // if (!state.number) {
    //   Toast.show('Please enter your number', 2000, Toast.SHORT);
    //   return;
    // }
    if (!state.email) {
      Toast.show('Please enter your email', 2000, Toast.SHORT);
      return;
    }
    if (!state.password) {
      Toast.show('Please enter your password', 2000, Toast.SHORT);
      return;
    }
    if (state.password.length < 8) {
      Toast.show('Password is too short', 2000, Toast.SHORT);
      return;
    }
    if (!state.cPassword) {
      Toast.show('Please confirm your password', 2000, Toast.SHORT);
      return;
    }
    if (state.cPassword !== state.password) {
      Toast.show(`Password doesn't match`, 2000, Toast.SHORT);
      return;
    }

    let data = new FormData();
    data.append('type', type);
    data.append('fullName', state.name);
    data.append('email', state.email);
    data.append('ss', state.ss);
    data.append('password', state.password);
    data.append('locationName', state.address);
    data.append('DOB', state.dob);
    //latlong will come in future
    data.append('license', {
      uri: state.license.file,
      type: 'application/pdf',
      name: state.license.name,
    });

    // let data = {
    //   type: type,
    //   fullName: state.name,
    //   phone: state.number,
    //   email: state.email,
    //   password: state.password,
    // };

    await register(data)
      .unwrap()
      .then(res => {
        console.log('response of register ===>', res);
        Toast.show(res.msg, 2000, Toast.SHORT);
        if (res.success) {
          navigation.navigate('Otp', { otpData: res.data });
        }
      })
      .catch(error => {
        console.log('error while register ====>', error);
        Toast.show('Some problem occured', 2000, Toast.SHORT);
      });
  };

  const onChangeText = (state, value) => {
    setState(prevState => ({
      ...prevState,
      [state]: value,
    }));
  };

  const onSelectFile = async () => {
    try {
      const [pickResult] = await pick({
        type: types.pdf,
      });

      // console.log('pick result ===>', pickResult);
      setState(prevState => ({
        ...prevState,
        license: {
          name: pickResult.name,
          file: pickResult.uri,
        },
      }));
    } catch (err) {
      console.log('error picking document', err);
    }
  };

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
        placeholder={'Name'}
      />
      {/* <LineBreak val={2} />
      <InputField
        onChangeText={text => onChangeText('number', text)}
        value={state.number}
        keyboardType={'numeric'}
        placeholder={'Number'}
      /> */}
      <LineBreak val={2} />
      <InputField
        onChangeText={text => onChangeText('address', text)}
        value={state.address}
        // icon={true}
        onLocationPress={() => {}}
        // innerStyle={{width: responsiveWidth(75)}}
        placeholder={'Home Address'}
      />
      {type === 'Technician' && (
        <>
          <LineBreak val={2} />
          <InputField
            onChangeText={text => onChangeText('ss', text)}
            value={state.ss}
            keyboardType={'numeric'}
            placeholder={'SS'}
          />
          <LineBreak val={2} />
          <TouchableOpacity onPress={() => onSelectFile()}>
            <InputField
              value={state.license.name}
              editable={false}
              placeholder={'Choose file… (Pest Control License)'}
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
              setState(prevState => ({
                ...prevState,
                dob: moment(date).format('DD-MM-YYYY'),
              }));
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
        placeholder={'Password'}
      />
      <LineBreak val={3} />
      <InputField
        onChangeText={text => onChangeText('cPassword', text)}
        value={state.cPassword}
        placeholder={'Confirm Password'}
      />
      <LineBreak val={3} />
      <Button
        indicator={isLoading}
        onPress={() => onSignupPress()}
        title={'SIGN UP'}
      />
      <LineBreak val={3} />
      <SocialButtons
        onSocialPress={type => console.log('type', type)}
        heading={'Continue with'}
      />
      <LineBreak val={5} />
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <AppText align={'center'} title={'Already have an account? Login'} />
      </TouchableOpacity>
    </Container>
  );
};

export default Signup;
