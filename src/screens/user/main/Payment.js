import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Text,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppIntroSlider from 'react-native-app-intro-slider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import { CardField, confirmSetupIntent } from '@stripe/stripe-react-native';
import Toast from 'react-native-simple-toast';
import LottieView from 'lottie-react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useSelector } from 'react-redux';

// Components
import NormalHeader from '../../../components/NormalHeader';
import LineBreak from '../../../components/LineBreak';
import AppButton from '../../../components/AppButton';
import AppText from '../../../components/AppText';
import SVGIcon from '../../../components/SVGIcon';
import Container from '../../../components/Container';
import Card from '../../../components/Card';
import Loader from '../../../components/Loader';

// Utils & Assets
import {
  AppColors,
  getProfileImage,
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../utils';
import icons from '../../../assets/icons';
import { colors } from '../../../assets/colors';
import {
  useCreatePaymentMutation,
  useCreateSetupIntentMutation,
  useLazyGetAllCardsQuery,
  useSaveCardMutation,
  useUpdateDiscussionMutation,
  useCreateUpdateProfileMutation,
} from '../../../redux/services';

const options = [{ id: 1, icon: icons.apple_pay, title: 'Pay With Card' }];

const Payment = ({ route }) => {
  const nav = useNavigation();
  const sliderRef = useRef(null);
  const sheetRef = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPayMethod, setSelectedPayMethod] = useState({ id: 1 });
  const [selectedCard, setSelectedCard] = useState({
    methodId: null,
    id: null,
  });
  const [cardDetails, setCardDetails] = useState([]);
  const [cardFields, setCardFields] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [addingCard, setAddingCard] = useState(false);

  const { user, customer_id } = useSelector(state => state.persistedData);
  const { pest_tech, request } = route?.params || {};

  const [getAllCards, { isLoading: cardLoading }] = useLazyGetAllCardsQuery();
  const [createSetupIntent, { isLoading }] = useCreateSetupIntentMutation();
  const [saveCard] = useSaveCardMutation();
  const [createUpdateProfile] = useCreateUpdateProfileMutation();
  const [createPayment, { isLoading: paymentLoader }] =
    useCreatePaymentMutation();
  const [updateDiscussion] = useUpdateDiscussionMutation();
  console.log('customer_id:-', customer_id);
  console.log('pest_tech:-', pest_tech);
  console.log('request:-', request);
  useEffect(() => {
    fetchAllCards();
    setShowSuccess(false);
  }, []);

  const fetchAllCards = async () => {
    try {
      const res = await getAllCards().unwrap();
      if (res?.cards?.length > 0) {
        setCardDetails(res.cards);
        setSelectedCard({
          methodId: res.cards[0].id,
          id: 0,
        });
      }
    } catch (error) {
      console.log('Failed to fetch cards:', error);
    }
  };

  const onAddCard = async () => {
    if (!cardFields?.complete) {
      return Toast.show('Please fill in complete card details', Toast.SHORT);
    }

    setAddingCard(true);
    try {
      let res;
      try {
        res = await createSetupIntent().unwrap();
      } catch (intentErr) {
        console.log('createSetupIntent error:', intentErr);
        const errString = JSON.stringify(intentErr || '');
        if (
          errString.includes('No such customer') ||
          intentErr?.data?.error?.includes('No such customer') ||
          intentErr?.data?.msg?.includes('No such customer')
        ) {
          const formData = new FormData();
          formData.append('userId', user?._id || '');
          formData.append('stripeCustomerId', '');
          await createUpdateProfile(formData).unwrap();
          res = await createSetupIntent().unwrap();
        } else {
          throw intentErr;
        }
      }

      console.log('SetupIntent response:-', res);
      if (res?.customerId && res?.clientSecret) {
        const { error, setupIntent } = await confirmSetupIntent(
          res.clientSecret,
          {
            paymentMethodType: 'Card',
            paymentMethodData: {
              billingDetails: { name: user?.fullName || 'User' },
            },
          },
        );

        if (error) {
          console.log('confirmSetupIntent error:', error);
          return Toast.show(
            error?.message || 'Failed to add card.',
            Toast.SHORT,
          );
        }

        const isSuccess =
          setupIntent?.status?.toLowerCase() === 'succeeded' ||
          setupIntent?.status === 'Succeeded';

        if (isSuccess) {
          const paymentMethodId =
            setupIntent?.paymentMethod?.id || setupIntent?.paymentMethodId;

          if (!paymentMethodId) {
            throw new Error('Payment method ID not found');
          }

          const saveRes = await saveCard({
            customerId: res.customerId,
            paymentMethodId: paymentMethodId,
          }).unwrap();

          if (saveRes?.success) {
            sheetRef?.current.close();
            fetchAllCards();
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2500);
          } else {
            Toast.show(
              saveRes?.msg || saveRes?.message || 'Failed to save card.',
              Toast.SHORT,
            );
          }
        } else {
          Toast.show(`Setup status: ${setupIntent?.status}`, Toast.SHORT);
        }
      } else {
        throw new Error('Invalid setup intent response from server');
      }
    } catch (error) {
      console.log('onAddCard error:', error);
      sheetRef?.current.close();
      const msg =
        error?.data?.msg ||
        error?.data?.error ||
        error?.data?.message ||
        error?.message ||
        'Some problem occurred';
      Toast.show(msg, Toast.SHORT);
    } finally {
      setAddingCard(false);
    }
  };

  const onPayNow = async () => {
    if (!cardDetails?.length)
      return Toast.show('No cards in your wallet', Toast.SHORT);
    if (!selectedCard?.methodId)
      return Toast.show('Please select a card', Toast.SHORT);

    try {
      const payload = {
        amount: pest_tech?.price,
        formType: request ? 'request' : 'discussion',
        formId: pest_tech?.appointmentData?.id,
        customerId: customer_id,
        paymentMethodId: selectedCard.methodId,
      };

      const res = await createPayment(payload).unwrap();
      Toast.show(res.msg, Toast.SHORT);
      if (!res.success) return;

      const paymentInfo = {
        amount: res.paymentIntent.amount,
        created: res.paymentIntent.created,
        methodType: 'Card',
        refNumber: Math.random(),
      };

      if (!request) {
        await updateDiscussion({
          formId: pest_tech?.appointmentData?.id,
          status: 'Paid',
        }).unwrap();
      }

      nav.navigate('PaymentSuccess', {
        request: !!request,
        pest_tech: { ...pest_tech, requestPayInfo: paymentInfo },
      });
    } catch (error) {
      Toast.show('Payment failed, use another card', Toast.SHORT);
    }
  };

  const renderDots = () => (
    <View style={styles.dotContainer}>
      {cardDetails.map((_, index) => (
        <View
          key={index}
          style={[styles.dot, index === currentIndex && styles.activeDot]}
        />
      ))}
    </View>
  );

  const renderCardItem = ({ item, index }) => {
    const expMonth = String(item.card.exp_month).padStart(2, '0');
    const expYear = String(item.card.exp_year).slice(-2);
    return (
      <View style={styles.cardSlideWrapper}>
        <Card
          type={item.card.brand?.toLowerCase()}
          onCardPress={() => setSelectedCard({ methodId: item.id, id: index })}
          borderColor={
            selectedCard.id === index ? colors.primary : colors.secondary_button
          }
          cardNumber={`••••  ${item.card.last4}`}
          cardHolder={
            item.billing_details?.name || user?.fullName || 'Card Holder'
          }
          expiry={`${expMonth}/${expYear}`}
        />
      </View>
    );
  };

  const handleSlideChange = index => {
    setCurrentIndex(index);
    if (cardDetails[index]) {
      setSelectedCard({
        methodId: cardDetails[index].id,
        id: index,
      });
    }
  };

  const formattedPrice = pest_tech?.price
    ? Number(pest_tech.price).toFixed(2)
    : null;

  return (
    <Container scrollEnabled={true} contentStyle={styles.containerContent}>
      <NormalHeader heading="Payment" onBackPress={() => nav.goBack()} />
      <LineBreak val={2} />

      {/* Payment / Booking Details Card */}
      {pest_tech && (
        <View style={styles.paymentDetailsCard}>
          <View style={styles.detailsHeader}>
            <View style={styles.techInfoRow}>
              {pest_tech?.profileImage ? (
                <Image
                  source={{
                    uri: getProfileImage(pest_tech.profileImage, true),
                  }}
                  style={styles.techAvatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={24} color={AppColors.BLACK} />
                </View>
              )}
              <View style={styles.techTextContainer}>
                <AppText
                  title={pest_tech?.fullName || 'Technician'}
                  fontWeight="bold"
                  size={1.9}
                  color={AppColors.BLACK}
                />
                {pest_tech?.service?.name && (
                  <View style={styles.serviceBadge}>
                    <AppText
                      title={pest_tech.service.name}
                      size={1.3}
                      fontWeight="600"
                      color={AppColors.BLACK}
                    />
                  </View>
                )}
              </View>
            </View>

            <View style={styles.priceContainer}>
              <AppText
                title="Total"
                color={AppColors.DARKGRAY}
                size={1.3}
                align="right"
              />
              <AppText
                title={`$${formattedPrice || '0.00'}`}
                size={2.3}
                fontWeight="bold"
                color={AppColors.BLACK}
              />
            </View>
          </View>

          <View style={styles.cardDivider} />

          {/* Breakdown Items */}
          <View style={styles.detailRow}>
            <View style={styles.detailLabel}>
              <Ionicons
                name="briefcase-outline"
                size={16}
                color={AppColors.DARKGRAY}
              />
              <AppText title="Service Type" color={AppColors.GRAY} size={1.5} />
            </View>
            <AppText
              title={request ? 'Service Request' : 'Discussion Form'}
              fontWeight="600"
              size={1.5}
              color={AppColors.BLACK}
            />
          </View>

          {pest_tech?.locationName ? (
            <View style={styles.detailRow}>
              <View style={styles.detailLabel}>
                <Ionicons
                  name="location-outline"
                  size={16}
                  color={AppColors.DARKGRAY}
                />
                <AppText title="Location" color={AppColors.GRAY} size={1.5} />
              </View>
              <View style={styles.locationWrapper}>
                <Text numberOfLines={1} style={styles.locationText}>
                  {pest_tech.locationName}
                </Text>
              </View>
            </View>
          ) : null}

          {pest_tech?.workingHours?.startTime ? (
            <View style={styles.detailRow}>
              <View style={styles.detailLabel}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={AppColors.DARKGRAY}
                />
                <AppText
                  title="Working Hours"
                  color={AppColors.GRAY}
                  size={1.5}
                />
              </View>
              <AppText
                title={`${pest_tech.workingHours.startTime} - ${pest_tech.workingHours.endTime}`}
                size={1.5}
                color={AppColors.BLACK}
                fontWeight="500"
              />
            </View>
          ) : null}

          <View style={styles.detailRow}>
            <View style={styles.detailLabel}>
              <Ionicons
                name="receipt-outline"
                size={16}
                color={AppColors.DARKGRAY}
              />
              <AppText title="Service Fee" color={AppColors.GRAY} size={1.5} />
            </View>
            <AppText
              title={`$${formattedPrice || '0.00'}`}
              size={1.5}
              color={AppColors.BLACK}
              fontWeight="500"
            />
          </View>
        </View>
      )}

      {/* Saved Cards Section */}
      <View style={styles.sectionHeader}>
        <AppText
          title="Saved Cards"
          color={AppColors.BLACK}
          size={2}
          fontWeight="bold"
        />
        <TouchableOpacity
          style={styles.addCardBtn}
          onPress={() => sheetRef?.current?.open()}
        >
          <Entypo
            name="plus"
            size={responsiveFontSize(2.5)}
            color={AppColors.BLACK}
          />
          <AppText title="Add New Card" color={AppColors.BLACK} size={1.7} />
        </TouchableOpacity>
      </View>

      {cardLoading ? (
        <Loader />
      ) : cardDetails?.length < 1 ? (
        <View style={styles.emptyWallet}>
          <AppText align="center" title="No cards in your wallet" />
        </View>
      ) : (
        <View style={styles.sliderContainer}>
          <AppIntroSlider
            ref={sliderRef}
            data={cardDetails}
            renderItem={renderCardItem}
            onSlideChange={handleSlideChange}
            showNextButton={false}
            showDoneButton={false}
            dotStyle={styles.hidden}
            activeDotStyle={styles.hidden}
          />

          {renderDots()}
        </View>
      )}

      <LineBreak val={1.5} />

      {/* Other Payment Options */}
      <View style={styles.otherOptionsWrapper}>
        <AppText
          title="Other Payment Options"
          color={AppColors.BLACK}
          size={2}
          fontWeight="bold"
        />
        <LineBreak val={1} />
        {options.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.optionItem}
            onPress={() => setSelectedPayMethod(item)}
          >
            <View style={styles.optionLabel}>
              <SVGIcon xml={item.icon} width={28} height={28} />
              <AppText title={item.title} color={AppColors.BLACK} size={1.8} />
            </View>
            <Ionicons
              name={
                selectedPayMethod.id === item.id
                  ? 'radio-button-on-sharp'
                  : 'radio-button-off-sharp'
              }
              size={responsiveFontSize(3)}
              color={AppColors.BLACK}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Pay Now Button */}
      <View style={styles.buttonWrapper}>
        <AppButton
          title={formattedPrice ? `PAY $${formattedPrice} NOW` : 'PAY NOW'}
          bgColor={colors.secondary_button}
          textColor={AppColors.BLACK}
          textFontWeight="bold"
          borderRadius={30}
          isLoading={paymentLoader}
          buttoWidth={92}
          textTransform="uppercase"
          handlePress={onPayNow}
        />
      </View>

      <RBSheet
        ref={sheetRef}
        closeOnPressBack
        draggable
        height={responsiveHeight(53)}
        customStyles={{ container: styles.sheetContainer }}
      >
        <ScrollView contentContainerStyle={styles.contentStyle}>
          <Text style={styles.sheetHeading}>Adding A Card</Text>
          <Text style={styles.desc}>
            Securely add your card details to enable seamless transactions.
          </Text>
          <CardField
            postalCodeEnabled={false}
            cardStyle={styles.stripeCardStyle}
            onCardChange={setCardFields}
            style={styles.cardField}
          />
          <AppButton
            bgColor={colors.primary}
            isLoading={isLoading || addingCard}
            loaderColor={colors.white}
            title="ADD CARD"
            handlePress={onAddCard}
          />
        </ScrollView>
      </RBSheet>

      {showSuccess && (
        <View style={styles.successOverlay}>
          <View style={styles.successModal}>
            <LottieView
              source={require('../../../assets/animations/saveCard.json')}
              autoPlay
              style={styles.lottie}
            />
            <AppText
              title="Card Added Successfully!"
              color={AppColors.BLACK}
              fontWeight="bold"
              size={2}
            />
          </View>
        </View>
      )}
    </Container>
  );
};

export default Payment;

const styles = StyleSheet.create({
  containerContent: {
    paddingBottom: responsiveHeight(5),
  },
  paymentDetailsCard: {
    marginHorizontal: responsiveWidth(4),
    marginBottom: responsiveHeight(2.5),
    backgroundColor: AppColors.WHITE,
    borderRadius: 16,
    padding: responsiveWidth(4),
    borderWidth: 1,
    borderColor: '#E8ECF2',
    shadowColor: AppColors.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  techInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  techAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F0F0',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary_button,
    justifyContent: 'center',
    alignItems: 'center',
  },
  techTextContainer: {
    flex: 1,
    gap: 4,
  },
  serviceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#EAEAEA',
    marginVertical: responsiveHeight(1.5),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: responsiveHeight(0.6),
  },
  detailLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationWrapper: {
    flex: 1,
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  locationText: {
    fontSize: responsiveFontSize(1.5),
    color: AppColors.BLACK,
    fontWeight: '500',
  },
  sectionHeader: {
    marginHorizontal: responsiveWidth(4),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveHeight(1.5),
  },
  addCardBtn: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  emptyWallet: {
    paddingVertical: responsiveHeight(3),
    alignItems: 'center',
  },
  sliderContainer: {
    height: responsiveHeight(23),
  },
  cardSlideWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: responsiveHeight(0.8),
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: colors.primary,
  },
  otherOptionsWrapper: {
    marginHorizontal: responsiveWidth(4),
    marginTop: responsiveHeight(1),
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: responsiveHeight(1),
  },
  optionLabel: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
  },
  buttonWrapper: {
    alignItems: 'center',
    marginTop: responsiveHeight(3),
    marginBottom: responsiveHeight(2),
  },
  sheetContainer: {
    backgroundColor: AppColors.PRIMARY,
    paddingTop: responsiveHeight(2),
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetHeading: {
    color: AppColors.WHITE,
    fontWeight: 'bold',
    fontSize: responsiveHeight(2.5),
    textAlign: 'center',
    marginBottom: responsiveHeight(2.3),
  },
  contentStyle: {
    paddingBottom: responsiveHeight(10),
    paddingTop: responsiveHeight(3),
    alignItems: 'center',
  },
  cardField: {
    height: responsiveHeight(6),
    width: responsiveWidth(90),
    marginVertical: responsiveHeight(4),
    backgroundColor: colors.white,
    borderRadius: 15,
  },
  stripeCardStyle: {
    fontSize: responsiveFontSize(2),
    placeholderColor: 'gray',
    textColor: 'black',
  },
  desc: {
    color: AppColors.WHITE,
    width: responsiveWidth(90),
    fontSize: responsiveFontSize(2),
    textAlign: 'center',
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    height: responsiveHeight(100),
  },
  successModal: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  lottie: {
    width: responsiveWidth(50),
    height: responsiveWidth(50),
  },
  hidden: {
    display: 'none',
  },
});

// /* eslint-disable eqeqeq */
// /* eslint-disable react/no-unstable-nested-components */
// /* eslint-disable react-native/no-inline-styles */
// import React, { useEffect, useRef, useState } from 'react';
// import {
//   View,
//   TouchableOpacity,
//   Image,
//   FlatList,
//   StyleSheet,
//   ScrollView,
//   Text,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import NormalHeader from '../../../components/NormalHeader';
// import LineBreak from '../../../components/LineBreak';
// import Feather from 'react-native-vector-icons/Entypo';
// import AppIntroSlider from 'react-native-app-intro-slider';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import AppButton from '../../../components/AppButton';
// import Modal from 'react-native-modal';
// import AppTextInput from '../../../components/AppTextInput';
// import AppText from '../../../components/AppText';
// import {
//   AppColors,
//   responsiveFontSize,
//   responsiveHeight,
//   responsiveWidth,
// } from '../../../utils';
// import icons from '../../../assets/icons';
// import { images } from '../../../assets/images';
// import SVGIcon from '../../../components/SVGIcon';
// import Container from '../../../components/Container';
// import { colors } from '../../../assets/colors';
// import { useSelector } from 'react-redux';
// import Card from '../../../components/Card';
// import Loader from '../../../components/Loader';
// import {
//   useCreatePaymentMutation,
//   useCreateSetupIntentMutation,
//   useLazyGetAllCardsQuery,
//   useSaveCardMutation,
//   useUpdateDiscussionMutation,
// } from '../../../redux/services';
// import RBSheet from 'react-native-raw-bottom-sheet';
// import { CardField, confirmSetupIntent } from '@stripe/stripe-react-native';
// import Toast from 'react-native-simple-toast';
// import LottieView from 'lottie-react-native';

// const slides = [
//   {
//     key: 1,
//     image: images.payment,
//   },
//   {
//     key: 2,
//     image: images.payment,
//   },
//   {
//     key: 3,
//     image: images.payment,
//   },
// ];

// const options = [
//   { id: 1, icon: icons.apple_pay, title: 'Pay With Card' },
//   // { id: 2, icon: icons.paypal, title: 'PayPal' },
//   // { id: 3, icon: icons.google_pay, title: 'Google Pay' },
//   // { id: 4, icon: icons.home, title: 'Bank' },
//   // { id: 5, icon: icons.dollar, title: 'COD (Cash on delivery)' },
// ];

// const options2 = [
//   { id: 1, icon: icons.apple_pay, title: 'Apple Pay' },
//   { id: 2, icon: icons.paypal, title: 'PayPal' },
//   { id: 3, icon: icons.google_pay, title: 'Google Pay' },
//   { id: 4, icon: icons.home, title: 'Bank' },
// ];

// const Payment = ({ route }) => {
//   const nav = useNavigation();
//   const sliderRef = useRef(null);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [addNewCarModal, setAddNewCarModal] = useState(false);
//   const [selectedPayMethod, setSelectedPayMethod] = useState({ id: 1 });
//   const [selectedCard, setSelectedCard] = useState({
//     methodId: null,
//     id: null,
//   });
//   const [cardDetails, setCardDetails] = useState([]);
//   const [cardFields, setCardFields] = useState(null);
//   const [getAllCards, { isLoading: cardLoading }] = useLazyGetAllCardsQuery();
//   const [createSetupIntent, { isLoading }] = useCreateSetupIntentMutation();
//   const [saveCard] = useSaveCardMutation();
//   const { user, customer_id } = useSelector(state => state.persistedData);
//   const [createPayment, { isLoading: paymentLoader }] =
//     useCreatePaymentMutation();
//   const [updateDiscussion, { isLoading: discussionLoading }] =
//     useUpdateDiscussionMutation();
//   const sheetRef = useRef(null);
//   const [showSuccess, setShowSuccess] = useState(false);
//   // const pest_tech = route?.params?.pest_tech;
//   const { pest_tech, request } = route?.params;

//   console.log('pest_tech:-', pest_tech);

//   useEffect(() => {
//     if (customer_id) {
//       fetchAllCards();
//       setShowSuccess(false);
//     }
//   }, []);

//   const fetchAllCards = async () => {
//     await getAllCards({ customer_id })
//       .unwrap()
//       .then(res => {
//         console.log('response =====>', res);
//         if (res?.cards) {
//           setCardDetails(res?.cards);
//         }
//       })
//       .catch(error => {
//         console.log('failed to fetch cards =======>', error);
//         // return ShowToast('Some problem occured')
//       });
//   };

//   const onAddCard = async () => {
//     if (!cardFields?.complete) {
//       sheetRef?.current.close();
//       return Toast.show('Please fill in complete card details', Toast.SHORT);
//     } else {
//       await createSetupIntent()
//         .unwrap()
//         .then(async res => {
//           console.log('response of creating customer ======>', res);
//           if (res?.customerId && res?.clientSecret) {
//             const customerId = res.customerId;
//             const clientSecret = res.clientSecret;
//             const { error, setupIntent } = await confirmSetupIntent(
//               clientSecret,
//               {
//                 paymentMethodType: 'Card',
//                 paymentMethodData: {
//                   billingDetails: { name: user?.fullName },
//                 },
//               },
//             );
//             if (error) {
//               console.error('Setup Intent Confirmation Failed:', error);
//               sheetRef?.current.close();
//               return Toast.show('Failed to add card. Try again.', Toast.SHORT);
//             } else if (setupIntent?.status === 'Succeeded') {
//               console.log('Card added successfully:', setupIntent);
//               const methodId = setupIntent?.paymentMethod.id;
//               // return console.log('method id',methodId)
//               await saveCard({ customerId, paymentMethodId: methodId })
//                 .unwrap()
//                 .then(res => {
//                   console.log('response', res);
//                   if (res?.success) {
//                     sheetRef?.current.close();
//                     fetchAllCards();
//                     // navigation.goBack();
//                     setShowSuccess(true);
//                     setTimeout(() => {
//                       setShowSuccess(false);
//                     }, 2500);
//                     return;
//                     // return Toast.show('Card added successfully!', Toast.SHORT);
//                   } else {
//                     console.log(
//                       'success false condition of attach payment',
//                       res.message,
//                     );
//                   }
//                 })
//                 .catch(error => {
//                   console.log('failed to attach payment method', error);
//                 });
//             }
//           }
//         })
//         .catch(error => {
//           console.log('failed to create customer', error);
//           sheetRef?.current.close();
//           return Toast.show('Some problem occured', Toast.SHORT);
//         });
//     }
//   };

//   const renderDots = () => (
//     <View
//       style={{
//         flexDirection: 'row',
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginTop: responsiveHeight(1),
//       }}
//     >
//       {cardDetails.map((_, index) => (
//         <View
//           key={index}
//           style={{
//             width: 8,
//             height: 8,
//             borderRadius: 4,
//             backgroundColor:
//               index === currentIndex ? AppColors.DARKGRAY : '#ccc',
//             marginHorizontal: 4,
//           }}
//         />
//       ))}
//     </View>
//   );

//   const renderItem = ({ item, index }) => (
//     <View
//       style={{
//         flex: 1,
//         alignItems: 'center',
//       }}
//     >
//       <Card
//         type={item.card.brand}
//         onCardPress={() =>
//           setSelectedCard({
//             methodId: item.id,
//             id: index,
//           })
//         }
//         borderColor={
//           selectedCard.id == index ? colors.primary : colors.secondary_button
//         }
//         cardNumber={item.card.last4}
//         cardHolder={item.billing_details.name}
//         expiry={`0${item.card.exp_month}/${item.card.exp_year
//           .toString()
//           .substring(2, 4)}`}
//       />
//       {/* <Image
//         source={item.image}
//         style={{
//           height: responsiveHeight(30),
//           width: responsiveWidth(90),
//           resizeMode: 'contain',
//         }}
//       /> */}
//       {renderDots()}
//     </View>
//   );

//   const onPayNow = async () => {
//     try {
//       if (!cardDetails?.length) {
//         Toast.show('No cards in your wallet', Toast.SHORT);
//         return;
//       }

//       if (!selectedCard?.methodId) {
//         Toast.show('Please select your card first to proceed', Toast.SHORT);
//         return;
//       }

//       const payload = {
//         amount: pest_tech?.price,
//         formType: request ? 'request' : 'discussion',
//         formId: pest_tech?.appointmentData?.id,
//         customerId: customer_id,
//         paymentMethodId: selectedCard.methodId,
//       };

//       const res = await createPayment(payload).unwrap();
//       console.log('payment response ===>', res);

//       Toast.show(res.msg, Toast.SHORT);

//       if (!res.success) return;

//       const paymentInfo = {
//         amount: res.paymentIntent.amount,
//         created: res.paymentIntent.created,
//         methodType: 'Card',
//         refNumber: Math.random(),
//       };

//       if (request) {
//         nav.navigate('PaymentSuccess', {
//           request,
//           pest_tech: {
//             ...pest_tech,
//             requestPayInfo: paymentInfo,
//           },
//         });
//         return;
//       }

//       const updatePayload = {
//         formId: pest_tech?.appointmentData?.id,
//         status: 'Paid',
//       };

//       const updateRes = await updateDiscussion(updatePayload).unwrap();
//       console.log('update status response ===>', updateRes);

//       nav.navigate('PaymentSuccess', {
//         request: false,
//         pest_tech: {
//           ...pest_tech,
//           requestPayInfo: paymentInfo,
//         },
//       });
//     } catch (error) {
//       console.log('payment error ===>', error);
//       Toast.show('Payment failed, Use another card', Toast.SHORT);
//     }
//   };

//   return (
//     <Container>
//       <NormalHeader heading={'Payment'} onBackPress={() => nav.goBack()} />
//       <LineBreak val={2} />

//       <View style={{ marginHorizontal: responsiveWidth(4) }}>
//         <View
//           style={{
//             flexDirection: 'row',
//             justifyContent: 'space-between',
//             alignItems: 'center',
//           }}
//         >
//           <AppText
//             title={'Saved Cards'}
//             color={AppColors.BLACK}
//             size={2}
//             fontWeight={'bold'}
//           />

//           <TouchableOpacity
//             style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}
//             onPress={() => sheetRef?.current?.open()}
//           >
//             <Feather
//               name="plus"
//               size={responsiveFontSize(2.5)}
//               color={AppColors.BLACK}
//             />
//             <AppText
//               title={'Add New Card'}
//               color={AppColors.BLACK}
//               size={1.7}
//             />
//           </TouchableOpacity>
//         </View>
//       </View>
//       {cardLoading ? (
//         <Loader />
//       ) : cardDetails?.length < 1 ? (
//         <View style={{ paddingTop: responsiveHeight(2) }}>
//           <AppText align={'center'} title={'No cards in your wallet'} />
//         </View>
//       ) : (
//         <View style={{ flex: 0.7 }}>
//           <AppIntroSlider
//             ref={sliderRef}
//             data={cardDetails}
//             renderItem={renderItem}
//             onSlideChange={index => setCurrentIndex(index)}
//             showNextButton={false}
//             showSkipButton={false}
//             contentContainerStyle={{ paddingTop: responsiveHeight(2) }}
//             showDoneButton={false}
//             dotStyle={{ display: 'none' }}
//           />
//         </View>
//       )}

//       <LineBreak val={2} />

//       <View style={{ flex: 1, marginHorizontal: responsiveWidth(4) }}>
//         <AppText
//           title={'Other Payment Options'}
//           color={AppColors.BLACK}
//           size={2}
//           fontWeight={'bold'}
//         />

//         <FlatList
//           data={options}
//           ListHeaderComponent={() => <LineBreak val={2} />}
//           ItemSeparatorComponent={() => <LineBreak val={2} />}
//           renderItem={({ item }) => {
//             return (
//               <TouchableOpacity
//                 style={{
//                   flexDirection: 'row',
//                   justifyContent: 'space-between',
//                   alignItems: 'center',
//                 }}
//                 onPress={() => setSelectedPayMethod({ id: item.id })}
//               >
//                 <View
//                   style={{
//                     flexDirection: 'row',
//                     gap: 15,
//                     alignItems: 'center',
//                   }}
//                 >
//                   <SVGIcon xml={item.icon} width={28} height={28} />
//                   <AppText
//                     title={item.title}
//                     color={AppColors.BLACK}
//                     size={1.8}
//                   />
//                 </View>
//                 <Ionicons
//                   name={
//                     selectedPayMethod.id == item.id
//                       ? 'radio-button-on-sharp'
//                       : 'radio-button-off-sharp'
//                   }
//                   size={responsiveFontSize(3)}
//                   color={AppColors.BLACK}
//                 />
//               </TouchableOpacity>
//             );
//           }}
//         />

//         <LineBreak val={8} />

//         <View>
//           <AppButton
//             title={'pay now'}
//             bgColor={colors.secondary_button}
//             textColor={AppColors.BLACK}
//             textFontWeight={'bold'}
//             borderRadius={30}
//             isLoading={paymentLoader}
//             buttoWidth={92}
//             textTransform={'uppercase'}
//             handlePress={
//               () => onPayNow()
//               // nav.navigate('UserHome');
//               // nav.navigate('PaymentSuccess', {
//               //   request: request && request,
//               //   pest_tech,
//               // });
//               // nav.navigate('PaymentSuccess',{pest_tech});
//             }
//           />
//         </View>
//         <LineBreak val={2} />
//       </View>

//       {/* <Modal
//         isVisible={addNewCarModal}
//         backdropOpacity={0.2}
//         onBackdropPress={() => setAddNewCarModal(false)}
//         onBackButtonPress={() => setAddNewCarModal(false)}
//         style={{
//           flex: 1,
//           margin: 0,
//           justifyContent: 'flex-end',
//         }}
//       >
//         <View
//           style={{
//             backgroundColor: 'white',
//             paddingHorizontal: responsiveWidth(4),
//             height: responsiveHeight(40),
//           }}
//         >
//           <LineBreak val={3} />
//           <View>
//             <View
//               style={{
//                 flexDirection: 'row',
//                 justifyContent: 'space-between',
//                 alignItems: 'center',
//                 paddingHorizontal: responsiveWidth(3),
//               }}
//             >
//               <TouchableOpacity onPress={() => nav.navigate('Wallet')}>
//                 <AppText
//                   title={'Add New Card'}
//                   color={AppColors.BLACK}
//                   size={2.5}
//                   fontWeight={'bold'}
//                 />
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}
//                 onPress={() => setAddNewCarModal(false)}
//               >
//                 <Ionicons
//                   name="close"
//                   size={responsiveFontSize(2.5)}
//                   color={AppColors.BLACK}
//                 />
//               </TouchableOpacity>
//             </View>
//           </View>
//           <LineBreak val={2} />

//           <View style={{ gap: 15 }}>
//             <View>
//               <View style={{ marginHorizontal: responsiveWidth(3) }}>
//                 <AppText
//                   title={'Name on card'}
//                   color={AppColors.DARKGRAY}
//                   size={1.5}
//                 />
//               </View>
//               <AppTextInput
//                 inputPlaceHolder={'Roronoa Zoro'}
//                 borderBottomWidth={1}
//                 borderBottomColor={AppColors.BLACK}
//               />
//             </View>
//             <View>
//               <View style={{ marginHorizontal: responsiveWidth(3) }}>
//                 <AppText
//                   title={'Card number'}
//                   color={AppColors.DARKGRAY}
//                   size={1.5}
//                 />
//               </View>
//               <AppTextInput
//                 inputPlaceHolder={'1234  4567  7890  1234'}
//                 borderBottomWidth={1}
//                 borderBottomColor={AppColors.BLACK}
//               />
//             </View>

//             <View style={{ flexDirection: 'row' }}>
//               <View>
//                 <View style={{ marginHorizontal: responsiveWidth(3) }}>
//                   <AppText
//                     title={'Expiry date'}
//                     color={AppColors.DARKGRAY}
//                     size={1.5}
//                   />
//                 </View>
//                 <AppTextInput
//                   inputPlaceHolder={'02/24'}
//                   borderBottomWidth={1}
//                   inputWidth={42}
//                   borderBottomColor={AppColors.BLACK}
//                 />
//               </View>
//               <View>
//                 <View style={{ marginHorizontal: responsiveWidth(3) }}>
//                   <AppText
//                     title={'CVV'}
//                     color={AppColors.DARKGRAY}
//                     size={1.5}
//                   />
//                 </View>
//                 <AppTextInput
//                   inputPlaceHolder={'•••'}
//                   borderBottomWidth={1}
//                   inputWidth={42}
//                   borderBottomColor={AppColors.BLACK}
//                 />
//               </View>
//             </View>
//           </View>
//         </View>
//       </Modal> */}
//       <RBSheet
//         ref={sheetRef}
//         closeOnPressBack
//         draggable
//         height={responsiveHeight(53)}
//         openDuration={250}
//         customStyles={{
//           container: {
//             backgroundColor: AppColors.PRIMARY,
//             paddingTop: responsiveHeight(2),
//           },
//         }}
//       >
//         <ScrollView contentContainerStyle={styles.contentStyle}>
//           <Text
//             style={[
//               styles.heading,
//               {
//                 fontSize: responsiveHeight(2.5),
//                 textAlign: 'center',
//                 marginBottom: responsiveHeight(2.3),
//               },
//             ]}
//           >
//             Adding A Card
//           </Text>
//           <Text style={styles.desc}>
//             Securely add your card details to enable seamless transactions and
//             enjoy a hassle-free payment experience.
//           </Text>
//           <CardField
//             postalCodeEnabled={false}
//             placeholders={{
//               number: 'Account Number',
//             }}
//             cardStyle={styles.cardStyle}
//             onCardChange={details => {
//               console.log(details);
//               setCardFields(details);
//             }}
//             style={styles.cardField}
//           />
//           <AppButton
//             bgColor={colors.primary}
//             isLoading={isLoading}
//             loaderColor={colors.white}
//             title={'ADD CARD'}
//             handlePress={() => onAddCard()}
//           />
//         </ScrollView>
//       </RBSheet>

//       {showSuccess && (
//         <View
//           style={{
//             ...StyleSheet.absoluteFillObject,
//             backgroundColor: 'rgba(0,0,0,0.5)',
//             justifyContent: 'center',
//             alignItems: 'center',
//             zIndex: 9999,
//             height: responsiveHeight(100),
//           }}
//         >
//           <View
//             style={{
//               backgroundColor: colors.white,
//               padding: 20,
//               borderRadius: 20,
//               alignItems: 'center',
//             }}
//           >
//             <LottieView
//               source={require('../../../assets/animations/saveCard.json')}
//               autoPlay={true}
//               loop={true}
//               style={{
//                 width: responsiveWidth(50),
//                 height: responsiveWidth(50),
//                 borderRadius: 10,
//               }}
//             />
//             <AppText
//               title={'Card Added Successfully!'}
//               color={AppColors.BLACK}
//               fontWeight={'bold'}
//               size={2}
//             />
//           </View>
//         </View>
//       )}
//     </Container>
//   );
// };

// export default Payment;

// const styles = StyleSheet.create({
//   containerStyle: {
//     paddingTop: responsiveHeight(4),
//     width: responsiveWidth(87),
//   },
//   paymentContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   heading: {
//     color: AppColors.WHITE,
//     fontWeight: 'bold',
//     fontSize: responsiveHeight(2),
//   },
//   historyContainer: {
//     paddingTop: responsiveHeight(4),
//   },
//   contentStyle: {
//     paddingBottom: responsiveHeight(10),
//     paddingTop: responsiveHeight(3),
//     alignItems: 'center',
//   },
//   inputStyle: {
//     borderWidth: 1,
//     width: responsiveWidth(85),
//     marginBottom: responsiveHeight(4),
//   },
//   cardField: {
//     height: responsiveHeight(6),
//     width: responsiveWidth(90),
//     marginVertical: responsiveHeight(4),
//     borderWidth: 1,
//     borderRadius: 15,
//   },
//   cardStyle: {
//     borderColor: 'white',
//     borderRadius: 8,
//     fontSize: responsiveFontSize(2),
//     placeholderColor: 'black',
//     textColor: 'black',
//   },
//   desc: {
//     color: AppColors.WHITE,
//     width: responsiveWidth(90),
//     fontSize: responsiveFontSize(2),
//     textAlign: 'center',
//   },
//   message: {
//     color: AppColors.WHITE,
//     fontWeight: 'bold',
//     fontSize: responsiveFontSize(2.2),
//   },
// });
