import React from 'react';
import { TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { AppColors, responsiveFontSize } from '../utils';
const BackIcon = () => {

  const nav = useNavigation()

  return (
    <TouchableOpacity onPress={() => nav.goBack()}>
      <Ionicons
        name={'arrow-back'}
        size={responsiveFontSize(3)}
        color={AppColors.BLACK}
      />
    </TouchableOpacity>
  );
};

export default BackIcon;
