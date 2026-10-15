import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { AppColors, responsiveFontSize } from '../utils';

const BackIcon = ({ onBackPress, iconColor, style }) => {
  const nav = useNavigation();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.backButton, style]}
      onPress={onBackPress || (() => nav.goBack())}
    >
      <Ionicons
        name="arrow-back"
        size={responsiveFontSize(2.4)}
        color={iconColor || '#0F172A'}
      />
    </TouchableOpacity>
  );
};

export default BackIcon;

const styles = StyleSheet.create({
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
