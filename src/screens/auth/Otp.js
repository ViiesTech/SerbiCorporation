import Container from '../../components/Container';
import AppText from '../../components/AppText';
import LineBreak from '../../components/LineBreak';
import Button from '../../components/Button';
import CodeField from '../../components/CodeField';
import { useState } from 'react';
import {
  useLazyVerifyOTPPasswordQuery,
  useVerifyOTPMutation,
} from '../../redux/services';
import Toast from 'react-native-simple-toast';
import { useDispatch } from 'react-redux';
import { firstTimeVisit } from '../../redux/slices';
import { useNavigation } from '@react-navigation/native';

const Otp = ({ route }) => {
  const { otpData } = route?.params;
  const [value, setValue] = useState(otpData?.OTP.toString() || '');
  const [verifyOTP, { isLoading }] = useVerifyOTPMutation();
  const [verifyOTPPassword, { isLoading: resetLoader }] =
    useLazyVerifyOTPPasswordQuery();
  const dispatch = useDispatch();
  const nav = useNavigation();

  console.log('otpdata===>', otpData);

  // const goToRoute = async () => {
  //   const type = await AsyncStorage.getItem('type');

  //   if (type === 'User') {
  //     setShowLoginSuccess(false)
  //     nav.navigate('userRoutes')
  //   } else {
  //     setShowLoginSuccess(false)
  //     nav.navigate('vendorRoutes')
  //   }
  // }

  // useEffect(() => {
  //   setTimeout(() => {
  //   }, 3000)

  // }, [showLoginSuccess])

  const onOTPVerify = async () => {
    if (!value) {
      Toast.show('Please enter your 4 digit code', Toast.SHORT);
      return;
    }
    let data = {
      email: otpData?.email,
      OTP: value,
      signupToken: otpData?.signupToken && otpData?.signupToken,
    };

    if (otpData?.type === 'reset') {
      await verifyOTPPassword({ email: otpData?.email, otp: value })
        .unwrap()
        .then(res => {
          console.log('response of otp for password ===>', res);
          Toast.show(res.msg, Toast.SHORT);
          if (res.success) {
            nav.navigate('ResetPassword', { id: otpData?._id });
          }
        })
        .catch(error => {
          console.log('error of otp for password ===>', error);
          Toast.show('Some problem occured', Toast.SHORT);
        });
    } else {
      await verifyOTP(data)
        .unwrap()
        .then(res => {
          console.log('response of otp ===>', res);
          Toast.show(res.msg, Toast.SHORT);
          if (res.success) {
            dispatch(firstTimeVisit(true));
            // setShowLoginSuccess(true);
          }
        })
        .catch(error => {
          console.log('error of otp ===>', error);
          Toast.show('Some problem occured', Toast.SHORT);
        });
    }
  };

  return (
    <Container space={25} authHeading={'ENTER PASS CODE'}>
      <LineBreak val={1} />
      <AppText
        size={1.7}
        align="center"
        title="Number code has been sent to your email"
      />
      <LineBreak val={2} />
      <CodeField value={value} setValue={setValue} />
      <LineBreak val={1} />
      <Button
        indicator={otpData?.type ? resetLoader : isLoading}
        onPress={() => onOTPVerify()}
        title="SUBMIT"
      />
    </Container>
  );
};

export default Otp;
