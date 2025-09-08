import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Home = () => {
  return (
    <View style={{backgroundColor:'#f8f9fd',flex:1}}>
      <View>
        <Image source={'../../../assets/images/profile.png'}/>
      </View>
    </View>
  )
}

export default Home

const styles = StyleSheet.create({})