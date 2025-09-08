import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import UserHome from '../../screens/user/main/UserHome';
import Services from '../../screens/user/main/Services';
import ServicesProfile from '../../screens/user/main/ServicesProfile';
import WorkDone from '../../screens/user/main/WorkDone';
import Payment from '../../screens/user/main/Payment';
import PaymentSuccess from '../../screens/user/main/PaymentSuccess';
import PestTechnician from '../../screens/user/main/PestTechnician';
import History from '../../screens/user/main/History';
import Appointments from '../../screens/user/main/Appointments';
import Wishlist from '../../screens/user/main/Wishlist';

const Stack = createStackNavigator();

const userRoutes = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="UserHome">
      <Stack.Screen name="UserHome" component={UserHome} />
      <Stack.Screen name="Services" component={Services} />
      <Stack.Screen name="ServicesProfile" component={ServicesProfile} />
      <Stack.Screen name="WorkDone" component={WorkDone} />
      <Stack.Screen name="Payment" component={Payment} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccess} />
      <Stack.Screen name="PestTechnician" component={PestTechnician} />
      <Stack.Screen name="History" component={History} />
      <Stack.Screen name="Appointments" component={Appointments} />
      <Stack.Screen name="Wishlist" component={Wishlist} />
    </Stack.Navigator>
  );
};

export default userRoutes