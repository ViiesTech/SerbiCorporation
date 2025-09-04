/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View} from 'react-native';
import { AppColors, responsiveHeight, responsiveWidth } from '../utils';
import AppText from './AppText';
import BackIcon from './BackIcon';

const NormalHeader = ({onBackPress, heading, rightIcon, middleIcon, backIconColor}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 20,
        paddingVertical: responsiveHeight(2),
        paddingHorizontal: responsiveWidth(4),
        borderBottomWidth: 1,
        borderBottomColor: AppColors.DARKGRAY,
        backgroundColor: AppColors.WHITE,
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}>
        {onBackPress && <BackIcon onBackPress={onBackPress} iconColor={backIconColor} />}
        {middleIcon ? (
          middleIcon
        ) : (
          <AppText
            title={heading}
            color={backIconColor ? backIconColor : AppColors.BLACK}
            size={2.2}
            fontWeight={'bold'}
            textTransform={'uppercase'}
          />
        )}
      </View>
      {rightIcon}
    </View>
  );
};

export default NormalHeader;
