import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from '../utils';
import BackIcon from './BackIcon';

const NormalHeader = ({
  onBackPress,
  heading,
  rightIcon,
  middleIcon,
  backIconColor,
}) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftGroup}>
        {onBackPress && (
          <BackIcon onBackPress={onBackPress} iconColor={backIconColor} />
        )}
        {middleIcon ? (
          middleIcon
        ) : (
          <Text
            style={[
              styles.headingText,
              backIconColor ? { color: backIconColor } : null,
            ]}
            numberOfLines={1}
          >
            {heading}
          </Text>
        )}
      </View>
      {rightIcon && <View style={styles.rightGroup}>{rightIcon}</View>}
    </View>
  );
};

export default NormalHeader;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: responsiveHeight(1.6),
    paddingHorizontal: responsiveWidth(4.5),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  leftGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headingText: {
    fontSize: responsiveFontSize(2.0),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
    textTransform: 'uppercase',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
