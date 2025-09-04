import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import UserHome from '../../screens/user/main/UserHome';
import Services from '../../screens/user/main/Services';
import ServicesProfile from '../../screens/user/main/ServicesProfile';

const Stack = createStackNavigator();

const userRoutes = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="UserHome">
      <Stack.Screen name="UserHome" component={UserHome} />
      <Stack.Screen name="Services" component={Services} />
      <Stack.Screen name="ServicesProfile" component={ServicesProfile} />
    </Stack.Navigator>
  );
};

export default userRoutes