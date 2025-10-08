import { View, Text, ImageBackground, Image, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { images } from '../../../assets/images'
import AppTextInput from './../../../components/AppTextInput';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { AppColors, responsiveHeight, responsiveWidth } from '../../../utils';
import AppText from '../../../components/AppText';
import Payment from './../../user/main/Payment';
import AppButton from '../../../components/AppButton';
import LineBreak from '../../../components/LineBreak';

const Services = ({ route, navigation }) => {
  const [currentStatus, setCurrentStatus] = useState('ON THE WAY');
  const {ids} = route?.params;
  console.log('ids',ids)
  return (
    <ImageBackground style={{ flex: 1, padding: responsiveHeight(2) }} source={images.mapbg}>
      <AppTextInput containerBg={AppColors.WHITE} inputWidth={77} rightIcon={<Ionicons name="search-outline" size={25} />} inputPlaceHolder="What are you looking for?" placeholderTextColor="#777777" borderRadius={25} />
      <View style={{ backgroundColor: AppColors.WHITE, position: 'absolute', alignSelf: 'center', bottom: 20, borderRadius: responsiveHeight(2), padding: responsiveHeight(2) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: responsiveHeight(1.5) }}>
            <Image source={images.profile} style={{ height: responsiveHeight(5), width: responsiveWidth(10) }} />
            <AppText fontWeight={'bold'} size={2.4} title='Roland Hopper' />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: responsiveHeight(1) }}>
            <TouchableOpacity style={{ backgroundColor: AppColors.BGCOLOURS, padding: responsiveHeight(0.7), paddingHorizontal: responsiveHeight(0.8), borderRadius: responsiveHeight(2) }}>
              <FontAwesome name='phone' size={25} color={AppColors.BLACK} />
            </TouchableOpacity>
            <TouchableOpacity style={{ backgroundColor: AppColors.BGCOLOURS, padding: responsiveHeight(0.7), paddingHorizontal: responsiveHeight(0.8), borderRadius: responsiveHeight(2) }}>
              <Ionicons name='logo-wechat' size={25} color={AppColors.BLACK} />
            </TouchableOpacity>
          </View>
        </View>
        <LineBreak val={2} />
        <View style={{ backgroundColor: '#F5F5F5', height: 2, width: '100%' }} />
        <LineBreak val={3} />
        <AppText size={2} title='Youre on the way. Estimated arrival in 15 - 20 mins' />
        <LineBreak val={3} />

        <AppButton handlePress={() => currentStatus === 'ON THE WAY' ? setCurrentStatus('ARRIVED') : currentStatus === 'ARRIVED' ? setCurrentStatus('PROCEED') : navigation.navigate('JobDiscussionForm',{ids})} textColor='black' textFontWeight='bold' title={currentStatus} buttoWidth={80} bgColor='#A0CCD9' borderRadius={30} />
      </View>
    </ImageBackground>
  )
}

export default Services