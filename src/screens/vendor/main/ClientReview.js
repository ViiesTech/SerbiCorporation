import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import Container from '../../../components/Container'
import AppText from '../../../components/AppText'
import { responsiveHeight } from '../../../utils'
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LineBreak from '../../../components/LineBreak'
import { useNavigation } from '@react-navigation/native'

const ClientReview = () => {
  const nav = useNavigation();
  return (
    <Container contentStyle={{ flexGrow: 1, justifyContent: 'center', alignSelf: 'center', padding: responsiveHeight(2) }}>
      <View style={{ borderWidth: 1, borderColor: '#A0CCD9', padding: responsiveHeight(2), borderRadius: responsiveHeight(1.5) }}>
        <View style={{ alignSelf: 'flex-end' }}>
          <TouchableOpacity onPress={() => nav.navigate('Home')}>
          <Entypo name='cross' size={28} />
          </TouchableOpacity>
        </View>
        <AppText fontWeight='800' size={3} title='Client Review' align='center' />
        <LineBreak val={2} />
        <AppText color='#494949' align='center' title='The technician arrived on time, was polite and professional, and explained
everything clearly. The service was done efficiently and my issue was resolved quickly.'/>
        <LineBreak val={1} />

        <AppText fontWeight='bold' color='#494949' title='Highly recommended!' align='center' />
        <LineBreak val={2} />

        <AppText fontWeight='bold' color={'#000'} title='- Roland Hopper' align='center' />
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: responsiveHeight(2) }}>
          <AntDesign size={28} name='star' color={'#FFBB00'} />
          <AntDesign size={28} name='star' color={'#FFBB00'} />
          <AntDesign size={28} name='star' color={'#FFBB00'} />
          <AntDesign size={28} name='star' color={'#FFBB00'} />
          <Ionicons size={28} name='star-outline' color={'#FFBB00'} />
        </View>
      </View>
    </Container>
  )
}

export default ClientReview