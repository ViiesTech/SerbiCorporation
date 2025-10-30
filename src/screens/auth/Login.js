import { StyleSheet, TouchableOpacity } from 'react-native';
import Container from '../../components/Container';
import LineBreak from '../../components/LineBreak';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import SocialButtons from '../../components/SocialButtons';
import { useLoginMutation } from '../../redux/services';
import { useState } from 'react';
import Toast from 'react-native-simple-toast';
import AppText from '../../components/AppText';
import { responsiveHeight } from '../../utils';
import { useNavigation } from '@react-navigation/native';

const Login = () => {
  const [state, setState] = useState({
    email: '',
    password: '',
  });
  const [login, { isLoading }] = useLoginMutation();
  const nav = useNavigation()

  const onLoginPress = async () => {
    if (!state.email) {
      Toast.show('Please enter your email', 2000, Toast.SHORT);
      return;
    }
    if (!state.password) {
      Toast.show('Please enter your password', 2000, Toast.SHORT);
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
        Toast.show(res.msg, 2000, Toast.SHORT);
      })
      .catch(error => {
        console.log('error of login ===>', error);
        Toast.show('Some problem occured', 2000, Toast.SHORT);
      });
  };

  const onChangeText = (state, value) => {
    setState(prevState => ({
      ...prevState,
      [state]: value,
    }));
  };

  return (
    <Container contentStyle={{paddingBottom: responsiveHeight(5)}} space={25} authHeading={'LOGIN TO CONTINUE'}>
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
      <SocialButtons heading={'Or Login With'} />
      <LineBreak val={3} />
       <TouchableOpacity onPress={() => nav.navigate('SelectType')}>
              <AppText align={'center'} title={`Don't have an account? Signup`} />
            </TouchableOpacity>
    </Container>
  );
};

export default Login;

const styles = StyleSheet.create({});
