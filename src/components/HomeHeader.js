/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-simple-toast';
import { useGetNotificationsQuery } from '../redux/services';

import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
  openDialer,
} from '../utils';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const HomeHeader = ({
  menuIconOnPress,
  notificationOnPress,
  chatIconOnPress,
  diverHead,
  callOnPress,
}) => {
  const nav = useNavigation();
  const { user } = useSelector(state => state.persistedData);

  const { data: notifData } = useGetNotificationsQuery(
    { page: 1, limit: 1 },
    { skip: !user?._id, pollingInterval: 30000 },
  );
  const unreadNotifCount = notifData?.unreadCount ?? 0;

  const greeting = getGreeting();
  const getGreetingName = name => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (
      parts.length > 1 &&
      ['mr', 'mr.', 'ms', 'ms.', 'mrs', 'mrs.', 'dr', 'dr.'].includes(
        parts[0].toLowerCase(),
      )
    ) {
      return `${parts[0]} ${parts[1]}`;
    }
    return parts[0];
  };
  const displayName = getGreetingName(user?.fullName);

  const handleChat = () => {
    console.log('Chat icon clicked in HomeHeader!');
    if (chatIconOnPress) {
      chatIconOnPress();
    } else {
      try {
        nav.navigate('Inbox');
      } catch (e) {
        Toast.show('Messages unavailable', Toast.SHORT);
      }
    }
  };

  const handleNotification = () => {
    console.log('Notification icon clicked in HomeHeader!');
    if (notificationOnPress) {
      notificationOnPress();
    } else {
      try {
        nav.navigate('Notifications');
      } catch (e) {
        Toast.show('Notifications unavailable', Toast.SHORT);
      }
    }
  };

  return (
    <View style={styles.headerContainer}>
      {/* Left: Drawer Menu Icon */}
      <TouchableOpacity
        style={styles.iconButton}
        onPress={menuIconOnPress}
        activeOpacity={0.7}
      >
        <Feather name="menu" size={responsiveFontSize(2.4)} color="#0F172A" />
      </TouchableOpacity>

      {/* Center: Greeting & Location */}
      <View style={styles.centerCol}>
        <View style={styles.greetingRow}>
          <Text style={styles.greetingText} numberOfLines={1}>
            {displayName ? `${greeting}, ${displayName}!` : `${greeting}!`}
          </Text>
          <Text style={styles.waveEmoji}>👋</Text>
        </View>

        {/* Location Pill */}
        <View style={styles.locationPill}>
          <Entypo
            name="location-pin"
            size={responsiveFontSize(1.7)}
            color="#A0CCD9"
          />
          <Text style={styles.locationText} numberOfLines={1}>
            {user?.locationName || 'Amphitheatre Parkway, Mountain View'}
          </Text>
        </View>
      </View>

      {/* Right: Notifications & Chat */}
      <View style={styles.rightActionsGroup}>
        {diverHead ? (
          <TouchableOpacity
            style={styles.callButton}
            onPress={callOnPress || (() => openDialer())}
            activeOpacity={0.8}
          >
            <View style={styles.notificationBadgeDot} />
            <Ionicons
              name="call"
              size={responsiveFontSize(2.2)}
              color="#0F172A"
            />
          </TouchableOpacity>
        ) : (
          <>
            {/* Chat Icon */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleChat}
              activeOpacity={0.7}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={responsiveFontSize(2.2)}
                color="#0F172A"
              />
            </TouchableOpacity>

            {/* Notification Icon */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleNotification}
              activeOpacity={0.7}
            >
              <Ionicons
                name="notifications-outline"
                size={responsiveFontSize(2.3)}
                color="#0F172A"
              />
              {unreadNotifCount > 0 && (
                <View style={styles.notificationBadgeDot} />
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(4.5),
    paddingTop: responsiveHeight(1.2),
    paddingBottom: responsiveHeight(1.2),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  centerCol: {
    flex: 1,
    marginHorizontal: 10,
    justifyContent: 'center',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  greetingText: {
    fontSize: responsiveFontSize(1.9),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    flexShrink: 1,
  },
  waveEmoji: {
    fontSize: responsiveFontSize(1.8),
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 16,
    marginTop: 4,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    gap: 3,
  },
  locationText: {
    fontSize: responsiveFontSize(1.2),
    color: '#475569',
    fontWeight: '500',
    flexShrink: 1,
  },
  rightActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationBadgeDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  callButton: {
    position: 'relative',
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#A0CCD9',
    borderWidth: 1,
    borderColor: '#8BC3D2',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
