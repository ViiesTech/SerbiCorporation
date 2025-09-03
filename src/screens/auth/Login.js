import { StyleSheet } from 'react-native';
import Container from '../../components/Container';
import LineBreak from '../../components/LineBreak';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import SocialButtons from '../../components/SocialButtons';

const Login = () => {
  return (
    <Container space={25} authHeading={'LOGIN TO CONTINUE'}>
      <LineBreak val={4} />
      <InputField
        keyboardType={'email-address'}
        placeholder={'Email Address'}
      />
      <LineBreak val={2} />
      <InputField placeholder={'Password'} />
      <LineBreak val={3} />
      <Button onPress={() => {}} title={'LOGIN'} />
        <LineBreak val={3} />
        <SocialButtons heading={'Or Login With'} />
    </Container>
  );
};

export default Login;

const styles = StyleSheet.create({});
