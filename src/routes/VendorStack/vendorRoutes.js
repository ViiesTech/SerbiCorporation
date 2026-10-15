import { createStackNavigator } from '@react-navigation/stack'
import Home from '../../screens/vendor/main/Home'
import Services from '../../screens/vendor/main/Services'
import JobDiscussionForm from '../../screens/vendor/main/JobDiscussionForm'
import StartJob from '../../screens/vendor/main/StartJob'
import ClientReview from '../../screens/vendor/main/ClientReview'
import Notifications from '../../screens/Notifications'

const Stack = createStackNavigator()

const VendorStack = () => {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false
    }}>
      <Stack.Screen name={'Home'} component={Home} />
      <Stack.Screen name={'Services'} component={Services} />
      <Stack.Screen name={'JobDiscussionForm'} component={JobDiscussionForm} />
      <Stack.Screen name={'StartJob'} component={StartJob} />
      <Stack.Screen name={'ClientReview'} component={ClientReview} />
      <Stack.Screen name={'Notifications'} component={Notifications} />
    </Stack.Navigator>
  )
}

export default VendorStack;
