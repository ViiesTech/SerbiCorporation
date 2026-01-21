import { StyleSheet } from 'react-native';
import { useState } from 'react';
import Container from '../../components/Container';
import LineBreak from '../../components/LineBreak';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import { useForgetPasswordMutation } from '../../redux/services';
import Toast from 'react-native-simple-toast';
import { useNavigation } from '@react-navigation/native';

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [forgetPassword, { isLoading }] = useForgetPasswordMutation();
  const nav = useNavigation();

  const onSendEmail = async () => {
    if (!email) {
      Toast.show('Please enter your email', Toast.SHORT);
      return;
    }
    let data = {
      email,
    };
    await forgetPassword(data)
      .unwrap()
      .then(res => {
        console.log('response of forget ===>', res);
        Toast.show(res.msg);
        if (res.success) {
          nav.navigate('Otp', { otpData: { ...res.data, type: 'reset' } });
        }
      })
      .catch(error => {
        console.log('error of forget ===>', error);
        Toast.show('Some problem occured', Toast.SHORT);
      });
  };

  return (
    <Container space={30} authHeading={'FORGET PASSWORD'}>
      <LineBreak val={4} />
      <InputField
        value={email}
        onChangeText={text => setEmail(text)}
        keyboardType={'email-address'}
        placeholder={'Email Address'}
      />
      <LineBreak val={3} />
      <Button
        indicator={isLoading}
        onPress={() => onSendEmail()}
        title={'CONTINUE'}
      />
    </Container>
  );
};

export default ForgetPassword;

const styles = StyleSheet.create({});
