import { createStackNavigator } from '@react-navigation/stack';
import AuthStack from './AuthStack/authStack';
import { NavigationContainer } from '@react-navigation/native';
import AppStatusBar from '../components/AppStatusBar';
import userRoutes from './UserStack/userRoutes';
import VendorStack from './VendorStack/vendorRoutes';
import Profile from './../screens/Profile';
import AppSettings from '../screens/AppSettings';
import Chat from '../screens/Chat';
import IncomingCall from '../screens/IncomingCall';
import { useSelector } from 'react-redux';

const Stack = createStackNavigator();

const Routes = () => {
  const { user, token } = useSelector(state => state.persistedData);
  console.log('userdata===>', token);

  return (
    <>
      <AppStatusBar />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!token ? (
            <Stack.Screen name="AuthStack" component={AuthStack} />
          ) : user?.type === 'User' ? (
            <>
              <Stack.Screen name="UserRoutes" component={userRoutes} />
              <Stack.Screen name="Profile" component={Profile} />
              <Stack.Screen name="AppSettings" component={AppSettings} />
              <Stack.Screen name="Chat" component={Chat} />
              <Stack.Screen name="IncomingCall" component={IncomingCall} />
            </>
          ) : user?.type === 'Technician' && (
            <>
              <Stack.Screen name="VendorRoutes" component={VendorStack} />
              <Stack.Screen name="Profile" component={Profile} />
              <Stack.Screen name="AppSettings" component={AppSettings} />
              <Stack.Screen name="Chat" component={Chat} />
              <Stack.Screen name="IncomingCall" component={IncomingCall} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default Routes;
