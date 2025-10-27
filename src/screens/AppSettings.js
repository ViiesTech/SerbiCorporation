/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Switch } from 'react-native';
import Container from '../components/Container';
import LineBreak from '../components/LineBreak';
import NormalHeader from '../components/NormalHeader';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import Octicons from 'react-native-vector-icons/Octicons';
import {
  AppColors,
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../utils';
import AppText from '../components/AppText';
import { colors } from '../assets/colors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch } from 'react-redux';
import { resetUser } from '../redux/slices';
import Toast from 'react-native-simple-toast';

const menuOne = [
  {
    id: 1,
    title: 'Account',
    leftIcon: (
      <FontAwesome
        name="user-o"
        size={responsiveFontSize(2.2)}
        color={AppColors.BLACK}
      />
    ),
    rightIcon: (
      <Entypo
        name="chevron-small-right"
        size={responsiveFontSize(4)}
        color={AppColors.BLACK}
      />
    ),
    navTo: 'MainProfile',
  },
  {
    id: 2,
    title: 'Notifications',
    leftIcon: (
      <Ionicons
        name="notifications-outline"
        size={responsiveFontSize(2.2)}
        color={AppColors.BLACK}
      />
    ),
  },
  {
    id: 3,
    title: 'Dark Mode',
    leftIcon: (
      <Octicons
        name="moon"
        size={responsiveFontSize(2.2)}
        color={AppColors.BLACK}
      />
    ),
  },
  {
    id: 4,
    title: 'Language',
    leftIcon: (
      <Ionicons
        name="language-outline"
        size={responsiveFontSize(2.2)}
        color={AppColors.BLACK}
      />
    ),
    rightIcon: (
      <Entypo
        name="chevron-small-right"
        size={responsiveFontSize(4)}
        color={AppColors.BLACK}
      />
    ),
  },
];

const menuTwo = [
  {
    id: 1,
    title: 'Security',
    leftIcon: (
      <Ionicons
        name="shield-checkmark-outline"
        size={responsiveFontSize(2.2)}
        color={AppColors.BLACK}
      />
    ),
    rightIcon: (
      <Entypo
        name="chevron-small-right"
        size={responsiveFontSize(4)}
        color={AppColors.BLACK}
      />
    ),
  },
  {
    id: 2,
    title: 'Terms & Conditions',
    navTo: 'TermsAndCondition',
    leftIcon: (
      <Feather
        name="file"
        size={responsiveFontSize(2.2)}
        color={AppColors.BLACK}
      />
    ),
    rightIcon: (
      <Entypo
        name="chevron-small-right"
        size={responsiveFontSize(4)}
        color={AppColors.BLACK}
      />
    ),
  },
  {
    id: 3,
    title: 'Privacy Policy',
    navTo: 'PrivacyPolicy',
    leftIcon: (
      <Octicons
        name="lock"
        size={responsiveFontSize(2.2)}
        color={AppColors.BLACK}
      />
    ),
    rightIcon: (
      <Entypo
        name="chevron-small-right"
        size={responsiveFontSize(4)}
        color={AppColors.BLACK}
      />
    ),
  },
  {
    id: 4,
    title: 'Help',
    navTo: 'Help',
    leftIcon: (
      <Feather
        name="alert-circle"
        size={responsiveFontSize(2.2)}
        color={AppColors.BLACK}
      />
    ),
    rightIcon: (
      <Entypo
        name="chevron-small-right"
        size={responsiveFontSize(4)}
        color={AppColors.BLACK}
      />
    ),
  },
  {
    id: 5,
    title: 'Logout',
    logoutAction: true,
    // navTo: 'AuthStack',
    leftIcon: (
      <MaterialIcons
        name="logout"
        size={responsiveFontSize(2.2)}
        color={AppColors.BLACK}
      />
    ),
  },
];

const AppSettings = () => {
  const nav = useNavigation();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isEnabledDarkMode, setIsEnabledDarkMode] = useState(false);

  const dispatch = useDispatch();

  return (
    <Container>
      <NormalHeader heading={'Settings'} onBackPress={() => nav.goBack()} />
      <LineBreak val={2} />
      <View>
        <FlatList
          data={menuOne}
          contentContainerStyle={{
            borderWidth: 1,
            borderColor: AppColors.DARKGRAY,
            borderRadius: 10,
            marginHorizontal: responsiveWidth(5),
          }}
          renderItem={({ item, index }) => {
            const id = Number(item.id);
            const isSecond = id === 2;
            const value = isSecond ? isEnabled : isEnabledDarkMode;
            return (
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginHorizontal: responsiveWidth(5),
                  marginVertical: responsiveHeight(0.5),
                  paddingVertical: responsiveHeight(1),
                  borderBottomWidth: index == 3 ? 0 : 1,
                  borderBottomColor: AppColors.DARKGRAY,
                }}
                activeOpacity={item.id == 2 || item.id == 3 ? 1 : 0}
                onPress={() => {
                  if (item.navTo) {
                    nav.navigate(item.navTo);
                  }
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 10,
                    alignItems: 'center',
                  }}
                >
                  {item.leftIcon}
                  <AppText
                    title={item.title}
                    color={AppColors.BLACK}
                    size={1.8}
                  />
                </View>
                {id === 2 || id === 3 ? (
                  <Switch
                    value={value}
                    onValueChange={val => {
                      if (isSecond) setIsEnabled(val);
                      else setIsEnabledDarkMode(val);
                    }}
                    thumbColor={value ? '#fff' : '#f4f3f4'}
                    trackColor={{ false: '#727272ff', true: colors.primary }}
                  />
                ) : (
                  item.rightIcon
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>
      <LineBreak val={2} />

      <View>
        <FlatList
          data={menuTwo}
          contentContainerStyle={{
            borderWidth: 1,
            borderColor: AppColors.DARKGRAY,
            borderRadius: 10,
            marginHorizontal: responsiveWidth(5),
          }}
          renderItem={({ item, index }) => {
            return (
              <TouchableOpacity
                onPress={() => {
                  if (item.navTo) {
                    nav.navigate(item.navTo);
                  } else if (item.logoutAction) {
                    dispatch(resetUser());
                    Toast.show('Logout successfully', 2000, Toast.SHORT);
                  }
                }}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginHorizontal: responsiveWidth(5),
                  marginVertical: responsiveHeight(0.5),
                  paddingVertical: responsiveHeight(1),
                  borderBottomWidth: index == 4 ? 0 : 1,
                  borderBottomColor: AppColors.DARKGRAY,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 10,
                    alignItems: 'center',
                  }}
                >
                  {item.leftIcon}
                  <AppText
                    title={item.title}
                    color={AppColors.BLACK}
                    size={1.8}
                  />
                </View>
                {item.rightIcon}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </Container>
  );
};

export default AppSettings;
