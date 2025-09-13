import { StyleSheet } from 'react-native';
import { useState } from 'react';
import Container from '../../components/Container';
import LineBreak from '../../components/LineBreak';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import { useResetPasswordMutation } from '../../redux/services';
import Toast from 'react-native-simple-toast';
import { useNavigation } from '@react-navigation/native';

const ResetPassword = ({ route }) => {
  const [newPassword, setNewPassword] = useState('');
  const [cPassword, setCPassword] = useState('');
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const nav = useNavigation();

  const { id } = route?.params;

  const onResetPassword = async () => {
    if (!newPassword) {
      Toast.show('Please enter your new password', 2000, Toast.SHORT);
      return;
    }
    if (newPassword.length < 8) {
      Toast.show('Password is too short', 2000, Toast.SHORT);
      return;
    }
    if (!cPassword) {
      Toast.show('Please confirm your password', 2000, Toast.SHORT);
      return;
    }
    if (cPassword !== newPassword) {
      Toast.show(`Password doesn't match`, 2000, Toast.SHORT);
      return;
    }
    let data = {
      userId: id,
      password: newPassword,
    };
    await resetPassword(data)
      .unwrap()
      .then(res => {
        console.log('response of reset password ===>', res);
        Toast.show(res.msg);
        if (res.success) {
          nav.navigate('Login');
        }
      })
      .catch(error => {
        console.log('error of reset password ===>', error);
        Toast.show('Some problem occured', 2000, Toast.SHORT);
      });
  };

  return (
    <Container space={25} authHeading={'RESET PASSWORD'}>
      <LineBreak val={4} />
      <InputField
        value={newPassword}
        onChangeText={text => setNewPassword(text)}
        placeholder={'New Password'}
      />
      <LineBreak val={3} />
      <InputField
        value={cPassword}
        onChangeText={text => setCPassword(text)}
        placeholder={'Confirm Password'}
      />
      <LineBreak val={4} />
      <Button
        indicator={isLoading}
        onPress={() => onResetPassword()}
        title={'SUBMIT'}
      />
    </Container>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({});
