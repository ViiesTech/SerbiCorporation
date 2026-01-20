import { StyleSheet, TouchableOpacity } from 'react-native';
import Container from '../../components/Container';
import LineBreak from '../../components/LineBreak';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import SocialButtons from '../../components/SocialButtons';
import { useGoogleLoginMutation, useLoginMutation } from '../../redux/services';
import { useState } from 'react';
import Toast from 'react-native-simple-toast';
import AppText from '../../components/AppText';
import { responsiveHeight } from '../../utils';
import { useNavigation } from '@react-navigation/native';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

const Login = () => {
  const [state, setState] = useState({
    email: '',
    password: '',
  });
  const [login, { isLoading }] = useLoginMutation();
  const [googleLogin, { isLoading: googleLoading }] = useGoogleLoginMutation();
  const nav = useNavigation();

  const onLoginPress = async () => {
    if (!state.email) {
      Toast.show('Please enter your email', Toast.SHORT);
      return;
    }
    if (!state.password) {
      Toast.show('Please enter your password', Toast.SHORT);
      return;
    }
    let data = {
      email: state.email,
      password: state.password,
    };
    await login(data)
      .unwrap()
      .then(res => {
        console.log('login response ===>', res);
        Toast.show(res.msg, Toast.SHORT);
      })
      .catch(error => {
        console.log('error of login ===>', error);
        Toast.show('Some problem occured', Toast.SHORT);
      });
  };

  const onChangeText = (state, value) => {
    setState(prevState => ({
      ...prevState,
      [state]: value,
    }));
  };

  const onSocialAuth = async loginType => {
    if (loginType !== 'google') {
      return alert('Work in progress');
    }

    try {
      await GoogleSignin.hasPlayServices();

      const userInfo = await GoogleSignin.signIn();
      console.log('Google user info ===>', userInfo);

      if (userInfo?.type !== 'success') {
        Toast.show('Google login failed', Toast.SHORT);
        return;
      }

      const user = userInfo?.data?.user || {};

      const data = {
        googleId: user.id,
        fullName: user.name,
        email: user.email,
        profileImage: user.photo,
      };

      try {
        const res = await googleLogin(data).unwrap();

        console.log('Google API response ===>', res);
        Toast.show(res?.message ?? 'Login successfully!', Toast.SHORT);

        if (!res?.isExist) {
          nav.navigate('SelectType',{token: res.token});
        }
      } catch (apiErr) {
        console.log('Google login API error:', apiErr);
        Toast.show(
          apiErr?.data?.message || 'Unable to login with Google',
          Toast.SHORT,
        );
      }
    } catch (error) {
      console.log('Google Sign-In error:', error);

      const errorMessages = {
        [statusCodes.SIGN_IN_CANCELLED]: 'Sign in cancelled',
        [statusCodes.IN_PROGRESS]: 'Sign in already in progress',
        [statusCodes.PLAY_SERVICES_NOT_AVAILABLE]:
          'Google Play Services unavailable',
      };

      Toast.show(
        errorMessages[error.code] || 'Something went wrong during Google login',
        Toast.SHORT,
      );
    }
  };

  return (
    <Container
      contentStyle={{ paddingBottom: responsiveHeight(5) }}
      space={25}
      authHeading={'LOGIN TO CONTINUE'}
    >
      <LineBreak val={4} />
      <InputField
        value={state.email}
        onChangeText={text => onChangeText('email', text)}
        keyboardType={'email-address'}
        placeholder={'Email Address'}
      />
      <LineBreak val={2} />
      <InputField
        value={state.password}
        onChangeText={text => onChangeText('password', text)}
        placeholder={'Password'}
      />
      <LineBreak val={1.5} />
      <TouchableOpacity
        onPress={() => nav.navigate('ForgetPassword')}
        style={{ alignItems: 'flex-end', marginRight: responsiveHeight(3) }}
      >
        <AppText fontWeight={'bold'} size={1.8} title={'Forgot Password'} />
      </TouchableOpacity>
      <LineBreak val={3} />
      <Button
        indicator={isLoading}
        onPress={() => onLoginPress()}
        title={'LOGIN'}
      />
      <LineBreak val={3} />
      <SocialButtons
        onSocialPress={loginType => onSocialAuth(loginType)}
        apiLoader={googleLoading}
        heading={'Or Login With'}
      />
      <LineBreak val={3} />
      <TouchableOpacity onPress={() => nav.navigate('SelectType')}>
        <AppText align={'center'} title={`Don't have an account? Signup`} />
      </TouchableOpacity>
    </Container>
  );
};

export default Login;

const styles = StyleSheet.create({});
