/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, TextInput} from 'react-native';
import { AppColors, responsiveHeight, responsiveWidth } from '../utils';

const AppTextInput = ({
  logo,
  secureTextEntry,
  inputPlaceHolder,
  inputWidth = 60,
  containerBg,
  rightIcon,
  placeholderTextColor,
  inputHeight,
  textAlignVertical,
  placeholderTextfontWeight,
  multiline,
  value,
  onChangeText,
  borderRadius,
  borderBottomWidth,
  borderBottomColor,
  editable,
  borderColor,
  keyboardType,
}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: containerBg,
        paddingHorizontal: responsiveWidth(2),
        paddingVertical: borderBottomWidth ? 0 : 5,
        borderRadius: borderRadius ? borderRadius : 12,
        alignItems: 'center',
        gap: 10,
        borderWidth: borderBottomWidth ? 0 : 1,
        borderBottomWidth: borderBottomWidth,
        borderBottomColor: borderBottomColor,
        borderColor: borderColor ? borderColor : AppColors.PRIMARY,
      }}>
      {logo}

      <TextInput
        placeholder={inputPlaceHolder}
        value={value}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        editable={editable}
        placeholderTextColor={
          placeholderTextColor ? placeholderTextColor : AppColors.BLACK
        }
        style={{
          width: responsiveWidth(inputWidth),
          color: AppColors.BLACK,
          height: inputHeight ? responsiveHeight(inputHeight) : null,
          fontWeight: placeholderTextfontWeight
            ? placeholderTextfontWeight
            : null,
        }}
        secureTextEntry={secureTextEntry}
        textAlignVertical={textAlignVertical}
        multiline={multiline}
      />

      {rightIcon}
    </View>
  );
};

export default AppTextInput;
