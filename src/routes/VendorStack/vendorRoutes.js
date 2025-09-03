import { createStackNavigator } from '@react-navigation/stack'
import Home from '../../screens/vendor/main/Home'

const Stack = createStackNavigator()

const VendorStack = () => {
  return (
        <Stack.Navigator screenOptions={{
          headerShown: false
        }}>
          <Stack.Screen name={'Home'} component={Home} />
        </Stack.Navigator>
  )
}

export default VendorStack;
