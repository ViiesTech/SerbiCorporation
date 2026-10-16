import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Plus from 'react-native-vector-icons/AntDesign';
import RBSheet from 'react-native-raw-bottom-sheet';
import AppButton from '../../../components/AppButton';
import { useSelector } from 'react-redux';
import { CardField, confirmSetupIntent } from '@stripe/stripe-react-native';
import { useNavigation } from '@react-navigation/native';
import Container from '../../../components/Container';
import {
  AppColors,
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../utils';
import { colors } from '../../../assets/colors';
import NormalHeader from '../../../components/NormalHeader';
import Toast from 'react-native-simple-toast';
import {
  useCreateSetupIntentMutation,
  useLazyGetAllCardsQuery,
  useSaveCardMutation,
  useCreateUpdateProfileMutation,
} from '../../../redux/services';
import Card from '../../../components/Card';
import Loader from '../../../components/Loader';
import AppText from '../../../components/AppText';
import LottieView from 'lottie-react-native';
import HistoryCard from '../../../components/HistoryCard';

const Wallet = () => {
  const [cardDetails, setCardDetails] = useState([]);
  const [cardFields, setCardFields] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [addingCard, setAddingCard] = useState(false);

  // const [createCustomer] = useCreateCustomerMutation()
  const [createSetupIntent, { isLoading }] = useCreateSetupIntentMutation();
  const [getAllCards, { isLoading: cardLoading }] = useLazyGetAllCardsQuery();
  const [saveCard] = useSaveCardMutation();
  const [createUpdateProfile] = useCreateUpdateProfileMutation();

  const { user, customer_id } = useSelector(state => state.persistedData);
  console.log('email', cardDetails);

  const navigation = useNavigation();

  const sheetRef = useRef();

  const fetchAllCards = useCallback(async () => {
    try {
      const res = await getAllCards().unwrap();
      console.log('response =====>', res);
      if (res?.cards) {
        setCardDetails(res?.cards);
      }
    } catch (error) {
      console.log('failed to fetch cards =======>', error);
    }
  }, [getAllCards]);

  useEffect(() => {
    fetchAllCards();
  }, [fetchAllCards]);

  const onOpenCardSheet = async () => {
    sheetRef?.current.open();
  };

  const renderPaymentHistory = () => {
    return (
      <View style={styles.containerStyle}>
        <View style={styles.paymentContainer}>
          <Text style={styles.heading}>Payment</Text>
          <Text style={styles.heading}>view All</Text>
        </View>
        <View style={styles.historyContainer}>
          <HistoryCard />
        </View>
      </View>
    );
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

      console.log('response of creating customer ======>', res);
      if (res?.customerId && res?.clientSecret) {
        const customerId = res.customerId;
        const clientSecret = res.clientSecret;
        const { error, setupIntent } = await confirmSetupIntent(
          clientSecret,
          {
            paymentMethodType: 'Card',
            paymentMethodData: {
              billingDetails: { name: user?.fullName || 'User' },
            },
          },
        );

        if (error) {
          console.error('Setup Intent Confirmation Failed:', error);
          return Toast.show(error?.message || 'Failed to add card. Try again.', Toast.SHORT);
        }

        const isSuccess =
          setupIntent?.status?.toLowerCase() === 'succeeded' ||
          setupIntent?.status === 'Succeeded';

        if (isSuccess) {
          console.log('Card added successfully:', setupIntent);
          const methodId =
            setupIntent?.paymentMethod?.id || setupIntent?.paymentMethodId;

          if (!methodId) {
            throw new Error('Payment method ID not found');
          }

          const saveRes = await saveCard({ customerId, paymentMethodId: methodId }).unwrap();
          console.log('saveCard response:', saveRes);
          if (saveRes?.success) {
            sheetRef?.current.close();
            fetchAllCards();
            setShowSuccess(true);
            setTimeout(() => {
              setShowSuccess(false);
            }, 2500);
          } else {
            Toast.show(saveRes?.msg || saveRes?.message || 'Failed to save card.', Toast.SHORT);
          }
        } else {
          Toast.show(`Setup status: ${setupIntent?.status}`, Toast.SHORT);
        }
      } else {
        throw new Error('Invalid setup intent response from server');
      }
    } catch (error) {
      console.log('failed to add card', error);
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

  return (
    <Container contentStyle={{ flex: 1 }}>
      <NormalHeader
        heading={'Wallet'}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={{
          alignItems: 'center',
          paddingTop: responsiveHeight(5),
        }}
      >
        {cardLoading ? (
          <Loader />
        ) : cardDetails?.length < 1 ? (
          <AppText title={'No cards in your wallet'} />
        ) : (
          cardDetails?.map(item => {
            return (
              <Card
                type={item.card.brand}
                cardNumber={item.card.last4}
                cardHolder={item.billing_details.name}
                expiry={`0${item.card.exp_month}/${item.card.exp_year
                  .toString()
                  .substring(2, 4)}`}
              />
            );
          })
        )}
      </ScrollView>
      <TouchableOpacity
        style={styles.buttonStyle}
        onPress={() => onOpenCardSheet()}
      >
        <Plus name={'plus'} color={colors.black} size={30} />
      </TouchableOpacity>

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
              number: 'Account NNumber',
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
            isLoading={isLoading || addingCard}
            loaderColor={colors.white}
            title={'ADD CARD'}
            handlePress={() => onAddCard()}
          />
        </ScrollView>
      </RBSheet>

      {showSuccess && (
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <View
            style={{
              backgroundColor: colors.white,
              padding: 20,
              borderRadius: 20,
              alignItems: 'center',
            }}
          >
            <LottieView
              source={require('../../../assets/animations/saveCard.json')}
              autoPlay
              loop={false}
              style={{
                width: responsiveWidth(50),
                height: responsiveWidth(50),
              }}
            />
            <AppText
              title={'Card Added Successfully!'}
              color={AppColors.BLACK}
              fontWeight={'bold'}
              size={2}
            />
          </View>
        </View>
      )}
    </Container>
  );
};

export default Wallet;

const styles = StyleSheet.create({
  subContainer: {
    alignItems: 'center',
    paddingTop: responsiveHeight(4),
  },
  buttonStyle: {
    position: 'absolute',
    borderWidth: 2,
    bottom: responsiveHeight(10),
    right: responsiveHeight(5),
    borderColor: colors.black,
    height: responsiveHeight(7),
    width: responsiveHeight(7),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
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
