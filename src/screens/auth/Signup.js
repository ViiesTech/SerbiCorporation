import Container from '../../components/Container';
import LineBreak from '../../components/LineBreak';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import SocialButtons from '../../components/SocialButtons';
import AppText from '../../components/AppText';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Signup = () => {
  const navigation = useNavigation();

  return (
    <Container space={10} authHeading={'SIGN UP'}>
      <LineBreak val={4} />
      <InputField placeholder={'Name'} />
      <LineBreak val={2} />
      <InputField keyboardType={'numeric'} placeholder={'Number'} />
      <LineBreak val={2} />
      <InputField
        keyboardType={'email-address'}
        placeholder={'Email Address'}
      />
      <LineBreak val={2} />
      <InputField placeholder={'Password'} />
      <LineBreak val={3} />
      <Button onPress={() => navigation.navigate('Otp')} title={'SIGN UP'} />
        <LineBreak val={3} />
        <SocialButtons onSocialPress={(type) => console.log('type',type)} heading={'Continue with'} />
          <LineBreak val={5} />
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>  
          <AppText align={'center'} title={'Already have an account? Login'} />
          </TouchableOpacity>
    </Container>
  );
};

export default Signup;

