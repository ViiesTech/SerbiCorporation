import { StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import Container from '../../components/Container';
import LineBreak from '../../components/LineBreak';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import { useResetPasswordMutation } from '../../redux/services';
import Toast from 'react-native-simple-toast';
import { useNavigation } from '@react-navigation/native';
import { AppColors } from '../../utils';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ResetPassword = ({ route }) => {
  const [newPassword, setNewPassword] = useState('');
  const [cPassword, setCPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const nav = useNavigation();

  const { id } = route?.params;

  const onResetPassword = async () => {
    if (!newPassword) {
      Toast.show('Please enter your new password', Toast.SHORT);
      return;
    }
    if (newPassword.length < 8) {
      Toast.show('Password is too short', Toast.SHORT);
      return;
    }
    if (!cPassword) {
      Toast.show('Please confirm your password', Toast.SHORT);
      return;
    }
    if (cPassword !== newPassword) {
      Toast.show(`Password doesn't match`, Toast.SHORT);
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
        Toast.show('Some problem occured', Toast.SHORT);
      });
  };

  return (
    <Container space={25} authHeading={'RESET PASSWORD'}>
      <LineBreak val={4} />
      <InputField
        value={newPassword}
        onChangeText={text => setNewPassword(text)}
        placeholder={'New Password'}
        secureTextEntry={!showPassword}
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
      <LineBreak val={3} />
      <InputField
        value={cPassword}
        onChangeText={text => setCPassword(text)}
        placeholder={'Confirm Password'}
        secureTextEntry={!showCPassword}
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
