import React, { useEffect } from 'react';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import AuthStack from './AuthStack/authStack';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();
import AppStatusBar from '../components/AppStatusBar';
import UserRoutes from './UserStack/userRoutes';
import VendorStack from './VendorStack/vendorRoutes';
import Profile from './../screens/Profile';
import AppSettings from '../screens/AppSettings';
import Chat from '../screens/Chat';
import Inbox from '../screens/Inbox';
import IncomingCall from '../screens/IncomingCall';
import { useSelector } from 'react-redux';
import PrivacyPolicy from '../screens/PrivacyPolicy';
import TermsAndCondition from '../screens/TermsAndCondition';
import Help from '../screens/Help';
import VendorProfile from '../screens/VendorProfile';
import Wallet from '../screens/user/main/Wallet';
import Notifications from '../screens/Notifications';
import { connectSocket, disconnectSocket } from '../services/socket';
import { syncDeviceToken } from '../config/Firebase';

const Stack = createStackNavigator();

const Routes = () => {
  const { user, token } = useSelector(state => state.persistedData);

  useEffect(() => {
    if (token && user?._id) {
      connectSocket(token, user._id);
      syncDeviceToken();
    } else {
      disconnectSocket();
    }
  }, [token, user?._id]);

  return (
    <>
      <AppStatusBar />
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
          }}
        >
          {!token ? (
            <Stack.Screen name="AuthStack" component={AuthStack} />
          ) : user?.type === 'User' ? (
            <>
              <Stack.Screen name="UserRoutes" component={UserRoutes} />
              <Stack.Screen name="Notifications" component={Notifications} />
              <Stack.Screen name="VendorProfile" component={VendorProfile} />
              <Stack.Screen name="Profile" component={Profile} />
              <Stack.Screen name="AppSettings" component={AppSettings} />
              <Stack.Screen name="Chat" component={Chat} />
              <Stack.Screen name="ChatScreen" component={Chat} />
              <Stack.Screen name="Inbox" component={Inbox} />
              <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
              <Stack.Screen name="Help" component={Help} />
              <Stack.Screen
                name="TermsAndCondition"
                component={TermsAndCondition}
              />
              <Stack.Screen name="IncomingCall" component={IncomingCall} />
              <Stack.Screen name="Wallet" component={Wallet} />
              <Stack.Screen
                name="BookingDetailsScreen"
                component={UserRoutes}
              />
            </>
          ) : (
            user?.type === 'Technician' && (
              <>
                <Stack.Screen name="VendorRoutes" component={VendorStack} />
                <Stack.Screen name="Notifications" component={Notifications} />
                <Stack.Screen name="VendorProfile" component={VendorProfile} />
                <Stack.Screen name="Profile" component={Profile} />
                <Stack.Screen name="AppSettings" component={AppSettings} />
                <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
                <Stack.Screen name="Help" component={Help} />
                <Stack.Screen
                  name="TermsAndCondition"
                  component={TermsAndCondition}
                />
                <Stack.Screen name="Chat" component={Chat} />
                <Stack.Screen name="ChatScreen" component={Chat} />
                <Stack.Screen name="Inbox" component={Inbox} />
                <Stack.Screen name="IncomingCall" component={IncomingCall} />
                <Stack.Screen
                  name="RequestDetailsScreen"
                  component={VendorStack}
                />
              </>
            )
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default Routes;
