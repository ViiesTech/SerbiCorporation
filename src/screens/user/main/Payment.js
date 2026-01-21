/* eslint-disable eqeqeq */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  ScrollView,
  Text,
} from 'react-native';
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
import { useSelector } from 'react-redux';
import Card from '../../../components/Card';
import Loader from '../../../components/Loader';
import {
  useCreatePaymentMutation,
  useCreateSetupIntentMutation,
  useLazyGetAllCardsQuery,
  useSaveCardMutation,
  useUpdateDiscussionMutation,
} from '../../../redux/services';
import RBSheet from 'react-native-raw-bottom-sheet';
import { CardField, confirmSetupIntent } from '@stripe/stripe-react-native';
import Toast from 'react-native-simple-toast';

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
  { id: 1, icon: icons.apple_pay, title: 'Pay With Card' },
  // { id: 2, icon: icons.paypal, title: 'PayPal' },
  // { id: 3, icon: icons.google_pay, title: 'Google Pay' },
  // { id: 4, icon: icons.home, title: 'Bank' },
  // { id: 5, icon: icons.dollar, title: 'COD (Cash on delivery)' },
];

const options2 = [
  { id: 1, icon: icons.apple_pay, title: 'Apple Pay' },
  { id: 2, icon: icons.paypal, title: 'PayPal' },
  { id: 3, icon: icons.google_pay, title: 'Google Pay' },
  { id: 4, icon: icons.home, title: 'Bank' },
];

const Payment = ({ route }) => {
  const nav = useNavigation();
  const sliderRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [addNewCarModal, setAddNewCarModal] = useState(false);
  const [selectedPayMethod, setSelectedPayMethod] = useState({ id: 1 });
  const [selectedCard, setSelectedCard] = useState({
    methodId: null,
    id: null,
  });
  const [cardDetails, setCardDetails] = useState([]);
  const [cardFields, setCardFields] = useState(null);
  const [getAllCards, { isLoading: cardLoading }] = useLazyGetAllCardsQuery();
  const [createSetupIntent, { isLoading }] = useCreateSetupIntentMutation();
  const [saveCard] = useSaveCardMutation();
  const { user, customer_id } = useSelector(state => state.persistedData);
  const [createPayment, { isLoading: paymentLoader }] =
    useCreatePaymentMutation();
  const [updateDiscussion, { isLoading: discussionLoading }] =
    useUpdateDiscussionMutation();
  const sheetRef = useRef(null);
  // const pest_tech = route?.params?.pest_tech;
  const { pest_tech, request } = route?.params;

  console.log('discussion', pest_tech);

  useEffect(() => {
    if (customer_id) {
      fetchAllCards();
    }
  }, []);

  const fetchAllCards = async () => {
    await getAllCards({ customer_id })
      .unwrap()
      .then(res => {
        console.log('response =====>', res);
        if (res?.cards) {
          setCardDetails(res?.cards);
        }
      })
      .catch(error => {
        console.log('failed to fetch cards =======>', error);
        // return ShowToast('Some problem occured')
      });
  };

  const onAddCard = async () => {
    if (!cardFields?.complete) {
      sheetRef?.current.close();
      return Toast.show(
        'Please fill in complete card details',
        2000,
        Toast.SHORT,
      );
    } else {
      await createSetupIntent()
        .unwrap()
        .then(async res => {
          console.log('response of creating customer ======>', res);
          if (res?.customerId && res?.clientSecret) {
            const customerId = res.customerId;
            const clientSecret = res.clientSecret;
            const { error, setupIntent } = await confirmSetupIntent(
              clientSecret,
              {
                paymentMethodType: 'Card',
                paymentMethodData: {
                  billingDetails: { name: user?.fullName },
                },
              },
            );
            if (error) {
              console.error('Setup Intent Confirmation Failed:', error);
              sheetRef?.current.close();
              return Toast.show(
                'Failed to add card. Try again.',
                2000,
                Toast.SHORT,
              );
            } else if (setupIntent?.status === 'Succeeded') {
              console.log('Card added successfully:', setupIntent);
              const methodId = setupIntent?.paymentMethod.id;
              // return console.log('method id',methodId)
              await saveCard({ customerId, paymentMethodId: methodId })
                .unwrap()
                .then(res => {
                  console.log('response', res);
                  if (res?.success) {
                    sheetRef?.current.close();
                    fetchAllCards();
                    // navigation.goBack();
                    return Toast.show(
                      'Card added successfully!',
                      2000,
                      Toast.SHORT,
                    );
                  } else {
                    console.log(
                      'success false condition of attach payment',
                      res.message,
                    );
                  }
                })
                .catch(error => {
                  console.log('failed to attach payment method', error);
                });
            }
          }
        })
        .catch(error => {
          console.log('failed to create customer', error);
          sheetRef?.current.close();
          return Toast.show('Some problem occured', Toast.SHORT);
        });
    }
  };

  const renderDots = () => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: responsiveHeight(1),
      }}
    >
      {cardDetails.map((_, index) => (
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

  const renderItem = ({ item, index }) => (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
      }}
    >
      <Card
        type={item.card.brand}
        onCardPress={() =>
          setSelectedCard({
            methodId: item.id,
            id: index,
          })
        }
        borderColor={
          selectedCard.id == index ? colors.primary : colors.secondary_button
        }
        cardNumber={item.card.last4}
        cardHolder={item.billing_details.name}
        expiry={`0${item.card.exp_month}/${item.card.exp_year
          .toString()
          .substring(2, 4)}`}
      />
      {/* <Image
        source={item.image}
        style={{
          height: responsiveHeight(30),
          width: responsiveWidth(90),
          resizeMode: 'contain',
        }}
      /> */}
      {renderDots()}
    </View>
  );

  const onPayNow = async () => {
    try {
      if (!cardDetails?.length) {
        Toast.show('No cards in your wallet', Toast.SHORT);
        return;
      }

      if (!selectedCard?.methodId) {
        Toast.show(
          'Please select your card first to proceed',
          2000,
          Toast.SHORT,
        );
        return;
      }

      const payload = {
        amount: pest_tech?.price,
        formType: request ? 'request' : 'discussion',
        formId: pest_tech?.appointmentData?.id,
        customerId: customer_id,
        paymentMethodId: selectedCard.methodId,
      };

      const res = await createPayment(payload).unwrap();
      console.log('payment response ===>', res);

      Toast.show(res.msg, Toast.SHORT);

      if (!res.success) return;

      const paymentInfo = {
        amount: res.paymentIntent.amount,
        created: res.paymentIntent.created,
        methodType: 'Card',
        refNumber: Math.random(),
      };

      if (request) {
        nav.navigate('PaymentSuccess', {
          request,
          pest_tech: {
            ...pest_tech,
            requestPayInfo: paymentInfo,
          },
        });
        return;
      }

      const updatePayload = {
        formId: pest_tech?.appointmentData?.id,
        status: 'Completed',
      };

      const updateRes = await updateDiscussion(updatePayload).unwrap();
      console.log('update status response ===>', updateRes);

      nav.navigate('PaymentSuccess', {
        request: false,
        pest_tech: {
          ...pest_tech,
          requestPayInfo: paymentInfo,
        },
      });
    } catch (error) {
      console.log('payment error ===>', error);
      Toast.show('Some problem occurred', Toast.SHORT);
    }
  };

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
            onPress={() => sheetRef?.current?.open()}
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
      {cardLoading ? (
        <Loader />
      ) : cardDetails?.length < 1 ? (
        <View style={{ paddingTop: responsiveHeight(2) }}>
          <AppText align={'center'} title={'No cards in your wallet'} />
        </View>
      ) : (
        <View style={{ flex: 0.7 }}>
          <AppIntroSlider
            ref={sliderRef}
            data={cardDetails}
            renderItem={renderItem}
            onSlideChange={index => setCurrentIndex(index)}
            showNextButton={false}
            showSkipButton={false}
            contentContainerStyle={{ paddingTop: responsiveHeight(2) }}
            showDoneButton={false}
            dotStyle={{ display: 'none' }}
          />
        </View>
      )}

      <LineBreak val={2} />

      <View style={{ flex: 1, marginHorizontal: responsiveWidth(4) }}>
        <AppText
          title={'Other Payment Options'}
          color={AppColors.BLACK}
          size={2}
          fontWeight={'bold'}
        />

        <FlatList
          data={options}
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
            isLoading={paymentLoader}
            buttoWidth={92}
            textTransform={'uppercase'}
            handlePress={
              () => onPayNow()
              // nav.navigate('UserHome');
              // nav.navigate('PaymentSuccess', {
              //   request: request && request,
              //   pest_tech,
              // });
              // nav.navigate('PaymentSuccess',{pest_tech});
            }
          />
        </View>
        <LineBreak val={2} />
      </View>

      {/* <Modal
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
      </Modal> */}
      <RBSheet
        ref={sheetRef}
        closeOnPressBack
        draggable
        height={responsiveHeight(53)}
        openDuration={250}
        customStyles={{
          container: {
            backgroundColor: AppColors.PRIMARY,
            paddingTop: responsiveHeight(2),
          },
        }}
      >
        <ScrollView contentContainerStyle={styles.contentStyle}>
          <Text
            style={[
              styles.heading,
              {
                fontSize: responsiveHeight(2.5),
                textAlign: 'center',
                marginBottom: responsiveHeight(2.3),
              },
            ]}
          >
            Adding A Card
          </Text>
          <Text style={styles.desc}>
            Securely add your card details to enable seamless transactions and
            enjoy a hassle-free payment experience.
          </Text>
          <CardField
            postalCodeEnabled={false}
            placeholders={{
              number: '4242 4242 4242 4242',
            }}
            cardStyle={styles.cardStyle}
            onCardChange={details => {
              console.log(details);
              setCardFields(details);
            }}
            style={styles.cardField}
          />
          <AppButton
            bgColor={colors.primary}
            isLoading={isLoading}
            loaderColor={colors.white}
            title={'ADD CARD'}
            handlePress={() => onAddCard()}
          />
        </ScrollView>
      </RBSheet>
    </Container>
  );
};

export default Payment;

const styles = StyleSheet.create({
  containerStyle: {
    paddingTop: responsiveHeight(4),
    width: responsiveWidth(87),
  },
  paymentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heading: {
    color: AppColors.WHITE,
    fontWeight: 'bold',
    fontSize: responsiveHeight(2),
  },
  historyContainer: {
    paddingTop: responsiveHeight(4),
  },
  contentStyle: {
    paddingBottom: responsiveHeight(10),
    paddingTop: responsiveHeight(3),
    alignItems: 'center',
  },
  inputStyle: {
    borderWidth: 1,
    width: responsiveWidth(85),
    marginBottom: responsiveHeight(4),
  },
  cardField: {
    height: responsiveHeight(6),
    width: responsiveWidth(90),
    marginVertical: responsiveHeight(4),
    borderWidth: 1,
    borderRadius: 15,
  },
  cardStyle: {
    borderColor: 'white',
    borderRadius: 8,
    fontSize: responsiveFontSize(2),
    placeholderColor: 'black',
    textColor: 'black',
  },
  desc: {
    color: AppColors.WHITE,
    width: responsiveWidth(90),
    fontSize: responsiveFontSize(2),
    textAlign: 'center',
  },
  message: {
    color: AppColors.WHITE,
    fontWeight: 'bold',
    fontSize: responsiveFontSize(2.2),
  },
});
