import { createStackNavigator } from '@react-navigation/stack';
import OnBoarding from '../../screens/auth/OnBoarding';
import SelectType from '../../screens/auth/SelectType';
import Signup from '../../screens/auth/Signup';
import Login from '../../screens/auth/Login';
import Otp from '../../screens/auth/Otp';
import ForgetPassword from '../../screens/auth/ForgetPassword';
import ResetPassword from '../../screens/auth/ResetPassword';
import { useSelector } from 'react-redux';

const Stack = createStackNavigator();

const AuthStack = () => {
  const { isOnboardingCompleted } = useSelector(state => state.persistedData);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={isOnboardingCompleted ? 'Login' : 'OnBoarding'}
    >
      <Stack.Screen name={'OnBoarding'} component={OnBoarding} />
      <Stack.Screen name={'SelectType'} component={SelectType} />
      <Stack.Screen name={'Signup'} component={Signup} />
      <Stack.Screen name={'Login'} component={Login} />
      <Stack.Screen name={'ForgetPassword'} component={ForgetPassword} />
      <Stack.Screen name={'ResetPassword'} component={ResetPassword} />
      <Stack.Screen name={'Otp'} component={Otp} />
    </Stack.Navigator>
  );
};

export default AuthStack;
