/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, TouchableOpacity, FlatList } from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LineBreak from './LineBreak';
import { useNavigation } from '@react-navigation/native';
import { AppColors, responsiveFontSize, responsiveWidth } from '../utils';
import AppText from './AppText';
import { useDispatch } from 'react-redux';
import {resetUser} from '../redux/slices/index'
import Toast from 'react-native-simple-toast'

const data = [
  {
    id: 1,
    icon: (
      <FontAwesome6
        name="user-large"
        size={responsiveFontSize(2.2)}
        color={AppColors.BLACK}
      />
    ),
    title: 'profile',
    navTo: 'Profile',
  },
  {
    id: 2,
    icon: (
      <AntDesign
        name="clockcircleo"
        size={responsiveFontSize(2.2)}
        color={AppColors.BLACK}
      />
    ),
    title: 'history',
    navTo: 'History',
  },
  {
    id: 3,
    icon: (
      <FontAwesome
        name="calendar"
        size={responsiveFontSize(2.2)}
        color={AppColors.BLACK}
      />
    ),
    title: 'appointments',
    navTo: 'Appointments',
  },
  {
    id: 4,
    icon: (
      <AntDesign
        name="heart"
        size={responsiveFontSize(2.2)}
        color={AppColors.BLACK}
      />
    ),
    title: 'wishlist',
    navTo: 'Wishlist',
  },
  {
    id: 5,
    icon: (
      <Feather
        name="settings"
        size={responsiveFontSize(2.2)}
        color={AppColors.BLACK}
      />
    ),
    title: 'settings',
    navTo: 'AppSettings',
  },
];

const Drawer = ({
  isVisible = true,
  onBackdropPress,
  closeIconOnPress,
}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch()

  return (
    <Modal
      isVisible={isVisible}
      animationIn="slideInRight"
      animationOut="slideOutRight"
      onBackdropPress={onBackdropPress}
      style={{
        margin: 0,
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
      }}>
      <View
        style={{
          height: '100%',
          width: responsiveWidth(55),
          backgroundColor: AppColors.WHITE,
        }}>
        <LineBreak val={1} />
        <View style={{ marginHorizontal: responsiveWidth(2) }}>
          <TouchableOpacity onPress={closeIconOnPress}>
            <Ionicons
              name="close"
              size={responsiveFontSize(2.2)}
              color={AppColors.BLACK}
            />
          </TouchableOpacity>
        </View>

        <LineBreak val={12} />

        <View style={{ marginHorizontal: responsiveWidth(4) }}>
          <FlatList
            data={data}
            ItemSeparatorComponent={() => <LineBreak val={2} />}
            renderItem={({ item }) => {
              return (
                <TouchableOpacity
                  style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}
                  onPress={() => {
                    if (item.navTo) {
                      navigation.navigate(item.navTo, { screen: item.title });
                      onBackdropPress();
                    }
                  }}
                >
                  {item.icon}
                  <AppText
                    title={item.title}
                    color={AppColors.BLACK}
                    size={1.8}
                    textTransform={'uppercase'}
                    fontWeight={'bold'}
                  />
                </TouchableOpacity>
              );
            }}
          />
        </View>

        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            marginHorizontal: responsiveWidth(4),
          }}>
          <TouchableOpacity
            style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}
            onPress={() => {
              dispatch(resetUser())
              Toast.show('Logout successfully',2000,Toast.SHORT)
              // navigation.navigate('AuthStack');
              onBackdropPress();
            }}
          >
            <MaterialIcons
              name="logout"
              size={responsiveFontSize(2.2)}
              color={AppColors.BLACK}
            />  
            <AppText
              title={'Logout'}
              color={AppColors.BLACK}
              size={1.8}
              textTransform={'uppercase'}
              fontWeight={'bold'}
            />
          </TouchableOpacity>
        </View>

        <LineBreak val={3} />
      </View>
    </Modal>
  );
};

export default Drawer;
