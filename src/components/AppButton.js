/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import { AppColors, responsiveWidth } from '../utils';
import AppText from './AppText';


const AppButton = ({
  title,
  handlePress,
  textColor = AppColors.WHITE,
  textFontWeight = true,
  textSize = 2,
  bgColor,
  RightColour = AppColors.BTNCOLOURS,
  buttoWidth = 90,
  leftIcon,
  borderWidth,
  borderColor,
  borderRadius,
  textTransform,
  padding,
}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{
        backgroundColor: bgColor ? bgColor : AppColors.BTNCOLOURS,
        alignItems: 'center',
        justifyContent: leftIcon ? 'center' : 'space-between',
        padding: padding ? padding : 12,
        borderRadius: borderRadius ? borderRadius : 8,
        gap: leftIcon ? 7 : 0,
        width: responsiveWidth(buttoWidth),
        borderWidth: borderWidth,
        borderColor: borderColor,
        flexDirection: leftIcon ? 'row' : null,
      }}>
      {leftIcon}
      <View />
      <AppText
        color={textColor}
        size={textSize}
        title={title}
        fontWeight={textFontWeight}
        textTransform={textTransform}
      />
    </TouchableOpacity>
  );
};

export default AppButton;
