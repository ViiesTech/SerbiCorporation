/* eslint-disable eqeqeq */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, Image, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import NormalHeader from '../../../components/NormalHeader';
import LineBreak from '../../../components/LineBreak';
import Feather from 'react-native-vector-icons/Entypo';
import AppIntroSlider from 'react-native-app-intro-slider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AppButton from '../../../components/AppButton';
import Modal from 'react-native-modal';
import AppTextInput from '../../../components/AppTextInput';
import AppText from '../../../components/AppText';
import {
  AppColors,
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../utils';
import icons from '../../../assets/icons';
import { images } from '../../../assets/images';
import SVGIcon from '../../../components/SVGIcon';
import Container from '../../../components/Container';
import { colors } from '../../../assets/colors';

const slides = [
  {
    key: 1,
    image: images.payment,
  },
  {
    key: 2,
    image: images.payment,
  },
  {
    key: 3,
    image: images.payment,
  },
];

const options = [
  { id: 1, icon: icons.apple_pay, title: 'Apple Pay' },
  { id: 2, icon: icons.paypal, title: 'PayPal' },
  { id: 3, icon: icons.google_pay, title: 'Google Pay' },
  { id: 4, icon: icons.home, title: 'Bank' },
];

const options2 = [
  { id: 1, icon: icons.apple_pay, title: 'Apple Pay' },
  { id: 2, icon: icons.paypal, title: 'PayPal' },
  { id: 3, icon: icons.google_pay, title: 'Google Pay' },
  { id: 4, icon: icons.home, title: 'Bank' },
  { id: 5, icon: icons.dollar, title: 'COD (Cash on delivery)' },
];

const Payment = ({ route }) => {
  const nav = useNavigation();
  const sliderRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [addNewCarModal, setAddNewCarModal] = useState(false);
  const [selectedPayMethod, setSelectedPayMethod] = useState({ id: 1 });
  // const pest_tech = route?.params?.pest_tech;
  const { pest_tech, request } = route?.params;

  console.log('profile', pest_tech);

  const renderDots = () => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: responsiveHeight(2),
      }}
    >
      {slides.map((_, index) => (
        <View
          key={index}
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor:
              index === currentIndex ? AppColors.DARKGRAY : '#ccc',
            marginHorizontal: 4,
          }}
        />
      ))}
    </View>
  );

  const renderItem = ({ item }) => (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
      }}
    >
      <Image
        source={item.image}
        style={{
          height: responsiveHeight(30),
          width: responsiveWidth(90),
          resizeMode: 'contain',
        }}
      />
      {renderDots()}
    </View>
  );

  return (
    <Container>
      <NormalHeader heading={'Payment'} onBackPress={() => nav.goBack()} />
      <LineBreak val={2} />

      <View style={{ marginHorizontal: responsiveWidth(4) }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <AppText
            title={'Saved Cards'}
            color={AppColors.BLACK}
            size={2}
            fontWeight={'bold'}
          />

          <TouchableOpacity
            style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}
            onPress={() => setAddNewCarModal(true)}
          >
            <Feather
              name="plus"
              size={responsiveFontSize(2.5)}
              color={AppColors.BLACK}
            />
            <AppText
              title={'Add New Card'}
              color={AppColors.BLACK}
              size={1.7}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flex: 0.7 }}>
        <AppIntroSlider
          ref={sliderRef}
          data={slides}
          renderItem={renderItem}
          onSlideChange={index => setCurrentIndex(index)}
          showNextButton={false}
          showSkipButton={false}
          showDoneButton={false}
          dotStyle={{ display: 'none' }}
        />
      </View>

      <LineBreak val={2} />

      <View style={{ flex: 1, marginHorizontal: responsiveWidth(4) }}>
        <AppText
          title={'Other Payment Options'}
          color={AppColors.BLACK}
          size={2}
          fontWeight={'bold'}
        />

        <FlatList
          data={pest_tech ? options2 : options}
          ListHeaderComponent={() => <LineBreak val={2} />}
          ItemSeparatorComponent={() => <LineBreak val={2} />}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onPress={() => setSelectedPayMethod({ id: item.id })}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 15,
                    alignItems: 'center',
                  }}
                >
                  <SVGIcon xml={item.icon} width={28} height={28} />
                  <AppText
                    title={item.title}
                    color={AppColors.BLACK}
                    size={1.8}
                  />
                </View>
                <Ionicons
                  name={
                    selectedPayMethod.id == item.id
                      ? 'radio-button-on-sharp'
                      : 'radio-button-off-sharp'
                  }
                  size={responsiveFontSize(3)}
                  color={AppColors.BLACK}
                />
              </TouchableOpacity>
            );
          }}
        />

        <LineBreak val={8} />

        <View>
          <AppButton
            title={'pay now'}
            bgColor={colors.secondary_button}
            textColor={AppColors.BLACK}
            textFontWeight={'bold'}
            borderRadius={30}
            buttoWidth={92}
            textTransform={'uppercase'}
            handlePress={() => {
              nav.navigate('UserHome')
              // nav.navigate('PaymentSuccess', {
              //   request: request && request,
              //   pest_tech,
              // });
              // nav.navigate('PaymentSuccess',{pest_tech});
            }}
          />
        </View>
        <LineBreak val={2} />
      </View>

      <Modal
        isVisible={addNewCarModal}
        backdropOpacity={0.2}
        onBackdropPress={() => setAddNewCarModal(false)}
        onBackButtonPress={() => setAddNewCarModal(false)}
        style={{
          flex: 1,
          margin: 0,
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            backgroundColor: 'white',
            paddingHorizontal: responsiveWidth(4),
            height: responsiveHeight(40),
          }}
        >
          <LineBreak val={3} />
          <View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: responsiveWidth(3),
              }}
            >
           <TouchableOpacity onPress={() => nav.navigate('Wallet')}>   
              <AppText
                title={'Add New Card'}
                color={AppColors.BLACK}
                size={2.5}
                fontWeight={'bold'}
              />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}
                onPress={() => setAddNewCarModal(false)}
              >
                <Ionicons
                  name="close"
                  size={responsiveFontSize(2.5)}
                  color={AppColors.BLACK}
                />
              </TouchableOpacity>
            </View>
          </View>
          <LineBreak val={2} />

          <View style={{ gap: 15 }}>
            <View>
              <View style={{ marginHorizontal: responsiveWidth(3) }}>
                <AppText
                  title={'Name on card'}
                  color={AppColors.DARKGRAY}
                  size={1.5}
                />
              </View>
              <AppTextInput
                inputPlaceHolder={'Roronoa Zoro'}
                borderBottomWidth={1}
                borderBottomColor={AppColors.BLACK}
              />
            </View>
            <View>
              <View style={{ marginHorizontal: responsiveWidth(3) }}>
                <AppText
                  title={'Card number'}
                  color={AppColors.DARKGRAY}
                  size={1.5}
                />
              </View>
              <AppTextInput
                inputPlaceHolder={'1234  4567  7890  1234'}
                borderBottomWidth={1}
                borderBottomColor={AppColors.BLACK}
              />
            </View>

            <View style={{ flexDirection: 'row' }}>
              <View>
                <View style={{ marginHorizontal: responsiveWidth(3) }}>
                  <AppText
                    title={'Expiry date'}
                    color={AppColors.DARKGRAY}
                    size={1.5}
                  />
                </View>
                <AppTextInput
                  inputPlaceHolder={'02/24'}
                  borderBottomWidth={1}
                  inputWidth={42}
                  borderBottomColor={AppColors.BLACK}
                />
              </View>
              <View>
                <View style={{ marginHorizontal: responsiveWidth(3) }}>
                  <AppText
                    title={'CVV'}
                    color={AppColors.DARKGRAY}
                    size={1.5}
                  />
                </View>
                <AppTextInput
                  inputPlaceHolder={'•••'}
                  borderBottomWidth={1}
                  inputWidth={42}
                  borderBottomColor={AppColors.BLACK}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </Container>
  );
};

export default Payment;
