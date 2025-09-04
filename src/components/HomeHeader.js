/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Image, TouchableOpacity, View} from 'react-native';
import AppText from './AppText';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
// import SVGXml from './SVGXML';
// import {APPICONS} from '../assets/icons/AppIcons';
// import AppImages from '../assets/AppImages';
import { AppColors, responsiveFontSize, responsiveHeight, responsiveWidth } from '../utils';


const HomeHeader = ({
  menuIconOnPress,
  favOnPress,
  chatIconOnPress,
  diverHead,
  callOnPress,
}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: responsiveWidth(4),
        paddingVertical: responsiveHeight(2),
      }}>
      <View
        style={
          diverHead
            ? {flexDirection: 'row', gap: 10, alignItems: 'center'}
            : null
        }>
        {/* {diverHead && (
          <View>
            <Image source={AppImages.user} style={{width: 50, height: 50}} />
          </View>
        )} */}
        <View>
          <View style={{flexDirection: 'row', gap: 5, alignItems: 'center'}}>
            <AppText
              title={'Good Morning!'}
              textColor={AppColors.BLACK}
              size={2.2}
              fontWeight={'bold'}
              textWidth={45}
              textTransform={'uppercase'}
            />
            {/* <SVGXml icon={APPICONS.flower} width={20} height={20} /> */}
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Entypo
              name="location-pin"
              size={responsiveFontSize(2.2)}
              color={AppColors.PRIMARY}
            />
            <AppText
              title={'California, United State'}
              textColor={AppColors.DARKGRAY}
              size={1.5}
            />
          </View>
        </View>
      </View>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 15}}>
        {diverHead ? (
          <TouchableOpacity style={{position: 'relative'}} onPress={callOnPress}>
            <View
              style={{
                backgroundColor: AppColors.ThemeBlue,
                position: 'absolute',
                right: -1,
                top: -3,
                zIndex: 999,
                width: 12,
                height: 12,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 100,
              }}>
              <AppText
                title={'2'}
                textColor={AppColors.WHITE}
                textSize={1}
                textFontWeight
              />
            </View>
            <Ionicons
              name="call"
              size={responsiveFontSize(2.5)}
              color={AppColors.BLACK}
            />
          </TouchableOpacity>
        ) : (
          null
          // <TouchableOpacity style={{position: 'relative'}} onPress={favOnPress}>
          //   <View
          //     style={{
          //       backgroundColor: AppColors.ThemeBlue,
          //       position: 'absolute',
          //       right: -4,
          //       top: -5,
          //       zIndex: 999,
          //       width: 12,
          //       height: 12,
          //       justifyContent: 'center',
          //       alignItems: 'center',
          //       borderRadius: 100,
          //     }}>
          //     <AppText
          //       title={'2'}
          //       textColor={AppColors.WHITE}
          //       textSize={1}
          //       textFontWeight
          //     />
          //   </View>
          //   <AntDesign
          //     name="heart"
          //     size={responsiveFontSize(2.5)}
          //     color={AppColors.BLACK}
          //   />
          // </TouchableOpacity>
        )}
        {/* <TouchableOpacity
          style={{position: 'relative'}}
          onPress={chatIconOnPress}>
          <View
            style={{
              backgroundColor: AppColors.ThemeBlue,
              position: 'absolute',
              right: -4,
              top: -2,
              zIndex: 999,
              width: 12,
              height: 12,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 100,
            }}>
            <AppText
              title={'2'}
              textColor={AppColors.WHITE}
              textSize={1}
              textFontWeight
            />
          </View>
          <AntDesign
            name="wechat"
            size={responsiveFontSize(2.5)}
            color={AppColors.BLACK}
          />
        </TouchableOpacity> */}
        {!diverHead && (
          <TouchableOpacity onPress={menuIconOnPress}>
            <Feather
              name="menu"
              size={responsiveFontSize(3.5)}
              color={AppColors.PRIMARY}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default HomeHeader;
