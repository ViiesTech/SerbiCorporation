import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import AuthStack from './AuthStack/authStack'
import { NavigationContainer } from '@react-navigation/native'
import AppStatusBar from '../components/AppStatusBar'
import userRoutes from './UserStack/userRoutes'


const Stack = createStackNavigator()

const Routes = () => {
  return (
    <>  
      <AppStatusBar />
     <NavigationContainer>
        <Stack.Navigator initialRouteName='userRoutes' screenOptions={{
          headerShown: false
        }}>
          <Stack.Screen name={'AuthStack'} component={AuthStack} /> 
          <Stack.Screen name={'userRoutes'} component={userRoutes} /> 
        </Stack.Navigator>
        </NavigationContainer>
        </>

  )
}

export default Routes
