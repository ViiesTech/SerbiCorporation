/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, ImageBackground, Image, TouchableOpacity } from 'react-native';
import {
  AppColors,
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../utils';
import { images } from '../assets/images';
import AppText from '../components/AppText';
import LineBreak from '../components/LineBreak';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

const IncomingCall = () => {
  const navigation = useNavigation();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: AppColors.PRIMARY,
      }}
    >
      <ImageBackground
        source={images.animation}
        style={{
          width: responsiveWidth(100),
          height: responsiveHeight(100),
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
        resizeMode="contain"
      >
        <View style={{ position: 'absolute', top: responsiveHeight(34.5) }}>
          <AppText
            title={'Incoming Call'}
            color={AppColors.WHITE}
            size={3}
            textTransform={'uppercase'}
          />
        </View>
        <Image
          source={images.imageProf}
          style={{ width: 150, height: 150, borderRadius: 100 }}
        />
        <View style={{ position: 'absolute', bottom: responsiveHeight(17) }}>
          <AppText
            title={'Tony Mora'}
            color={AppColors.WHITE}
            size={2.5}
            align="center"
            fontWeight={'bold'}
          />
          <LineBreak val={1} />
          <AppText
            title={'Your Gardener Calling...'}
            color={AppColors.WHITE}
            size={2}
            align="center"
          />
          <LineBreak val={1} />
          <AppText
            title={'ORDER #7ASHSF'}
            color={AppColors.WHITE}
            size={2}
            textTransform={'uppercase'}
            align="center"
          />

          <LineBreak val={4} />

          <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                height: 50,
                width: 50,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 100,
                backgroundColor: '#55B7FF',
              }}
            >
              <FontAwesome6
                name="phone-slash"
                size={responsiveFontSize(2.5)}
                color={'#EB5757'}
              />
            </TouchableOpacity>

            <Image source={images.dotsLeft} />

            <TouchableOpacity
              style={{
                padding: 15,
                borderRadius: 100,
                backgroundColor: AppColors.WHITE,
              }}
            >
              <FontAwesome6
                name="phone"
                size={responsiveFontSize(4)}
                color={AppColors.ThemeBlue}
              />
            </TouchableOpacity>

            <Image source={images.dotsRight} />

            <TouchableOpacity
              style={{
                height: 50,
                width: 50,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 100,
                backgroundColor: '#55B7FF',
              }}
            >
              <Feather
                name="phone-call"
                size={responsiveFontSize(2.5)}
                color={AppColors.BGCOLOURS}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

export default IncomingCall;
