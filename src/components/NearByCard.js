import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {
  AppColors,
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../utils';
import AppText from './AppText';
import SVGIcon from './SVGIcon';
import icons from '../assets/icons';
import AppButton from './AppButton';
import { images } from '../assets/images';

const NearByCard = ({
  item,
  onCardPress,
  viewDetailsHandlePress,
  onHeartPress,
  favourite,
  disabled,
  activeOpacity = 0.7,
  isShowBadge = true,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      disabled={disabled}
      style={styles.cardContainer}
      onPress={onCardPress}
    >
      <View style={styles.row}>
        <Image
          source={
            item.profImg &&
            !item.profImg.endsWith('/undefined') &&
            item.profImg.trim() !== ''
              ? { uri: item.profImg }
              : images.userProfile
          }
          style={styles.profileImg}
        />
        <View style={styles.detailsContainer}>
          <View style={styles.headerRow}>
            <AppText
              title={item.username}
              color={AppColors.BLACK}
              size={2}
              fontWeight={'bold'}
              textTransform={'uppercase'}
            />
            <View style={styles.badgeHeartContainer}>
              {isShowBadge && icons.correct_badge && (
                <SVGIcon xml={icons.correct_badge} width={25} height={25} />
              )}
              {isShowBadge && icons.simple_badge && (
                <SVGIcon xml={icons.simple_badge} width={25} height={25} />
              )}
              <TouchableOpacity
                style={styles.heartButton}
                onPress={onHeartPress}
              >
                <AntDesign
                  name={favourite ? 'heart' : 'hearto'}
                  size={responsiveFontSize(1.8)}
                  color={AppColors.PRIMARY}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.subHeaderRow}>
            <AppText
              title={item.designation}
              color={AppColors.GRAY}
              size={1.3}
            />
            <View style={styles.ratingRow}>
              <AppText title={item.rating} color={AppColors.GRAY} size={1.3} />
              <Ionicons
                name="star"
                size={responsiveFontSize(1.3)}
                color={AppColors.Yellow}
              />
            </View>
          </View>

          <View style={styles.footerRow}>
            <View style={styles.actionContainer}>
              <AppButton
                title="view details"
                textColor={AppColors.BLACK}
                bgColor={AppColors.PRIMARY}
                borderRadius={5}
                buttoWidth={25}
                textSize={1.2}
                padding={7}
                textFontWeight={'bold'}
                textTransform={'uppercase'}
                handlePress={viewDetailsHandlePress}
              />
              <View style={styles.statsContainer}>
                {item.ml && (
                  <AppText
                    title={`${item.ml} ml`}
                    color={AppColors.GRAY}
                    size={1.4}
                  />
                )}
                {item.min && (
                  <AppText
                    title={`${item.min}`}
                    color={AppColors.BLACK}
                    size={1.4}
                    fontWeight={'bold'}
                  />
                )}
              </View>
            </View>
            <View style={{ alignItems: 'center' }}>
              <AppText
                title={item.price}
                color={AppColors.BLACK}
                size={2.2}
                fontWeight={'bold'}
              />
              <AppText title={'Platform Fee'} color={AppColors.GRAY} size={1} />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default NearByCard;

const styles = StyleSheet.create({
  cardContainer: {
    borderWidth: 1,
    borderColor: AppColors.BLACK,
    backgroundColor: AppColors.WHITE,
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(2),
    borderRadius: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileImg: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#Fafafa',
  },
  detailsContainer: {
    flex: 1,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeHeartContainer: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
  },
  heartButton: {
    borderWidth: 1,
    padding: 5,
    borderRadius: 100,
    borderColor: AppColors.PRIMARY,
  },
  subHeaderRow: {
    flexDirection: 'row',
    marginTop: -7,
    gap: 5,
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
});
