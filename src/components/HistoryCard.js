import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
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
import { colors } from '../assets/colors';
import { images } from '../assets/images';

const HistoryCard = ({
  item,
  selectedCard,
  onCardPress,
  activeCardBgColor,
  component,
  favItem,
  services,
  isHideClose,
  isShowBadge,
  viewDetailsHandlePress,
  profiles,
  homeComponent,
  callOnPress,
  chatOnPress,
  appointment,
  onHeartPress,
  favourite,
  myAppointments,
  history,
  disabled,
  activeOpacity = 0.7,
}) => {
  const nav = useNavigation();

  // console.log(item.profImg)

  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      disabled={disabled}
      style={{
        borderWidth: selectedCard?.id == item._id ? 0 : 1,
        borderColor: AppColors.BLACK,
        backgroundColor: component
          ? AppColors.BLACK
          : selectedCard?.id == item._id
          ? activeCardBgColor
            ? activeCardBgColor
            : AppColors.PRIMARY
          : AppColors.WHITE,
        paddingHorizontal: responsiveWidth(4),
        paddingVertical: responsiveHeight(2),
        borderRadius: 10,
        position: 'relative',
      }}
      onPress={onCardPress}
    >
      {services && isHideClose ? (
        <TouchableOpacity
          style={{
            position: 'absolute',
            right: 0,
            borderWidth: 1,
            marginHorizontal: responsiveWidth(1.5),
            marginVertical: responsiveHeight(0.5),
            width: 13,
            height: 13,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 100,
            backgroundColor: AppColors.WHITE,
            borderColor:
              selectedCard?.id == item._id
                ? AppColors.WHITE
                : AppColors.ThemeBlue,
          }}
        >
          <AntDesign
            name={'close'}
            size={responsiveFontSize(1.2)}
            color={
              selectedCard?.id == item._id
                ? AppColors.BLACK
                : AppColors.ThemeBlue
            }
          />
        </TouchableOpacity>
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Image
          source={
            item.profImg &&
            !item.profImg.endsWith('/undefined') &&
            item.profImg.trim() !== ''
              ? { uri: item.profImg }
              : images.userProfile
          }
          style={{
            width: component || profiles ? 80 : 70,
            height: component || profiles ? 80 : 70,
            borderRadius: component || profiles ? 10 : 100,
          }}
        />
        <View style={{ gap: 4 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <AppText
              title={item.username}
              color={AppColors.BLACK}
              size={2}
              fontWeight={'bold'}
              textTransform={'uppercase'}
            />
            {component || favItem || services || profiles ? (
              <View
                style={
                  services || profiles
                    ? { flexDirection: 'row', gap: 7, alignItems: 'center' }
                    : null
                }
              >
                {services || (profiles && isShowBadge) ? (
                  <SVGIcon xml={icons.correct_badge} width={25} height={25} />
                ) : null}
                {services || (profiles && isShowBadge) ? (
                  <SVGIcon xml={icons.simple_badge} width={25} height={25} />
                ) : null}
                {services || profiles || favItem ? (
                  <TouchableOpacity
                    style={{
                      borderWidth: 1,
                      padding: 5,
                      borderRadius: 100,
                      borderColor:
                        selectedCard?.id == item._id
                          ? AppColors.BLACK
                          : AppColors.PRIMARY,
                    }}
                    onPress={onHeartPress}
                  >
                    <AntDesign
                      name={favourite ? 'heart' : 'hearto'}
                      size={responsiveFontSize(1.8)}
                      color={
                        selectedCard?.id == item._id
                          ? AppColors.BLACK
                          : AppColors.PRIMARY
                      }
                    />
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : (
              <AppText
                title={item.status}
                color={AppColors.BLACK}
                // color={
                //   selectedCard?.id == item.id
                //     ? AppColors.BLACK
                //     : homeComponent
                //       ? AppColors.BLACK
                //       : AppColors.BLACK
                // }
                size={1.4}
                // fontWeight={'bold'}
              />
            )}
          </View>
          {services || favItem || profiles || myAppointments || history ? (
            <View
              style={{
                flexDirection: 'row',
                marginTop:
                  component || services || favItem || profiles ? -7 : 0,
                gap: 5,
              }}
            >
              <AppText
                title={item.designation}
                color={AppColors.GRAY}
                size={1.3}
              />
              <View
                style={{
                  flexDirection: 'row',
                  gap: 5,
                  alignItems: 'center',
                }}
              >
                <AppText
                  title={item.rating}
                  color={AppColors.GRAY}
                  size={1.3}
                />
                {/* {item.rating && ( */}
                <View style={{ flexDirection: 'row', gap: 2 }}>
                  {/* {[...Array(item.rating)].map((_, index) => ( */}
                  <Ionicons
                    // key={index}
                    name="star"
                    size={responsiveFontSize(1.3)}
                    color={
                      selectedCard?.id == item._id
                        ? AppColors.WHITE
                        : AppColors.Yellow
                    }
                  />
                  {/* ))} */}
                </View>
                {/* )} */}
              </View>
            </View>
          ) : null}
          <View
            style={{
              width: responsiveWidth(62),
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            {favItem || services ? (
              <View
                style={
                  services
                    ? { flexDirection: 'row', gap: 10, alignItems: 'center' }
                    : null
                }
              >
                <AppButton
                  title="view details"
                  textColor={AppColors.BLACK}
                  bgColor={
                    selectedCard?.id == item._id
                      ? AppColors.WHITE
                      : AppColors.PRIMARY
                  }
                  borderRadius={5}
                  buttoWidth={25}
                  textSize={1.2}
                  padding={7}
                  textFontWeight={'bold'}
                  textTransform={'uppercase'}
                  handlePress={viewDetailsHandlePress}
                />
                {services && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 7,
                    }}
                  >
                    {item.ml && (
                      <AppText
                        title={`${item.ml} ml`}
                        color={AppColors.GRAY}
                        size={1.4}
                      />
                    )}
                    {item.min && (
                      <AppText
                        title={`${item.min} min`}
                        color={AppColors.BLACK}
                        size={1.4}
                        textWidth={10}
                        fontWeight={'bold'}
                      />
                    )}
                  </View>
                )}
              </View>
            ) : null}
            {component || profiles || homeComponent ? (
              <View>
                {component || profiles ? (
                  <View>
                    <AppText
                      title={'Typically reply in'}
                      color={AppColors.GRAY}
                      size={1.4}
                    />
                    <AppText
                      title={`${item.time} seconds`}
                      color={AppColors.GRAY}
                      size={1.4}
                    />
                  </View>
                ) : null}

                {homeComponent && (
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 4,
                      alignItems: 'center',
                    }}
                  >
                    <AppText
                      title={item.appointmentDate}
                      color={
                        selectedCard?.id == item._id
                          ? AppColors.WHITE
                          : AppColors.DARKGRAY
                      }
                      size={1.4}
                    />
                    <AppText
                      title={'|'}
                      color={
                        selectedCard?.id == item._id
                          ? AppColors.WHITE
                          : AppColors.BLACK
                      }
                      size={1.4}
                    />
                    <AppText
                      title={item.appointmentTime}
                      color={
                        selectedCard?.id == item._id
                          ? AppColors.WHITE
                          : AppColors.BLACK
                      }
                      size={1.4}
                      fontWeight={'bold'}
                    />
                  </View>
                )}
              </View>
            ) : (
              <View style={{ gap: 4 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 3,
                    alignItems: 'center',
                  }}
                >
                  {item.location && (
                    <Entypo
                      name="location-pin"
                      size={responsiveFontSize(1.8)}
                      color={
                        selectedCard?.id == item._id
                          ? AppColors.BLACK
                          : AppColors.GRAY
                      }
                    />
                  )}
                  <AppText
                    title={item.location}
                    color={AppColors.GRAY}
                    size={1.3}
                  />
                </View>
                <AppText
                  title={
                    appointment
                      ? item.date + '  |  ' + item.fullTime
                      : item.date
                  }
                  color={AppColors.GRAY}
                  size={1.3}
                />
              </View>
            )}
            {component || profiles || homeComponent || appointment ? (
              <View style={{ flexDirection: 'row', gap: 15 }}>
                <TouchableOpacity
                  style={{
                    padding: 7,
                    borderRadius: 100,
                    backgroundColor: colors.primary,
                  }}
                  onPress={() =>
                    // nav.navigate('CallAndChatHistory', { screen: 'cALL hISTORY' })
                    nav.navigate('IncomingCall')
                  }
                >
                  <Ionicons
                    name="call"
                    size={responsiveFontSize(2.2)}
                    color={
                      homeComponent ? AppColors.ThemeBlue : AppColors.BLACK
                    }
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    padding: 7,
                    borderRadius: 100,
                    backgroundColor: colors.primary,
                  }}
                  onPress={() =>
                    // nav.navigate('CallAndChatHistory', { screen: 'cHAT hISTORY' })
                    nav.navigate('Chat')
                  }
                >
                  <AntDesign
                    name="wechat"
                    size={responsiveFontSize(2.2)}
                    color={
                      homeComponent ? AppColors.ThemeBlue : AppColors.BLACK
                    }
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <AppText
                title={item.price}
                color={AppColors.BLACK}
                size={2.2}
                fontWeight={'bold'}
              />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default HistoryCard;
