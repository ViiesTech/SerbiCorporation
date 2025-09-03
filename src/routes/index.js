import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import AuthStack from './AuthStack/authStack'
import { NavigationContainer } from '@react-navigation/native'
import AppStatusBar from '../components/AppStatusBar'


const Stack = createStackNavigator()

const Routes = () => {
  return (
    <>  
      <AppStatusBar />
     <NavigationContainer>
        <Stack.Navigator screenOptions={{
          headerShown: false
        }}>
          <Stack.Screen name={'AuthStack'} component={AuthStack} /> 
        </Stack.Navigator>
        </NavigationContainer>
        </>

  )
}

export default Routes
