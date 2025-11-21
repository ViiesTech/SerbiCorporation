import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import { AppColors, responsiveWidth } from '../utils';
import AppText from './AppText';
import Loader from './Loader';


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
  isLoading,
  alignSelf,
  loaderColor
}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{
        backgroundColor: bgColor ? bgColor : AppColors.BTNCOLOURS,
        alignItems: 'center',
        alignSelf: alignSelf,
        justifyContent: leftIcon ? 'center' : 'space-between',
        padding: padding ? padding : 12,
        borderRadius: borderRadius ? borderRadius : 8,
        gap: leftIcon ? 7 : 0,
        width: responsiveWidth(buttoWidth),
        borderWidth: borderWidth,
        borderColor: borderColor,
        flexDirection: leftIcon ? 'row' : null,
      }}>
     {isLoading  ?
        <Loader color={loaderColor} />
      :
      <>
      {leftIcon}
      <View />
      <AppText
        color={textColor}
        size={textSize}
        title={title}
        fontWeight={textFontWeight}
        textTransform={textTransform}
      />
      </>
      }
    </TouchableOpacity>
  );
};

export default AppButton;
