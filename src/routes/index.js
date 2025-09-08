import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import AuthStack from './AuthStack/authStack'
import { NavigationContainer } from '@react-navigation/native'
import AppStatusBar from '../components/AppStatusBar'
import userRoutes from './UserStack/userRoutes'
import Profile from './../screens/Profile';
import AppSettings from '../screens/AppSettings'
import Chat from '../screens/Chat'
import IncomingCall from '../screens/IncomingCall'
import VendorStack from './VendorStack/vendorRoutes'


const Stack = createStackNavigator()

const Routes = () => {
  return (
    <>
      <AppStatusBar />
      <NavigationContainer>
        <Stack.Navigator initialRouteName='vendorRoutes' screenOptions={{
          headerShown: false
        }}>
          <Stack.Screen name={'AuthStack'} component={AuthStack} />
          <Stack.Screen name={'userRoutes'} component={userRoutes} />
          <Stack.Screen name={'vendorRoutes'} component={VendorStack} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="AppSettings" component={AppSettings} />
          <Stack.Screen name="Chat" component={Chat} />
          <Stack.Screen name="IncomingCall" component={IncomingCall} />
        </Stack.Navigator>
      </NavigationContainer>
    </>

  )
}

export default Routes
