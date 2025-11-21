import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
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
} from '../../../redux/services';
import Card from '../../../components/Card';
import Loader from '../../../components/Loader';
import AppText from '../../../components/AppText';

const Wallet = () => {
  const [cardDetails, setCardDetails] = useState([]);
  const [cardFields, setCardFields] = useState(null);

  // const [createCustomer] = useCreateCustomerMutation()
  const [createSetupIntent, { isLoading }] = useCreateSetupIntentMutation();
  const [getAllCards, { isLoading: cardLoading }] = useLazyGetAllCardsQuery();
  const [saveCard] = useSaveCardMutation();

  const { user, customer_id } = useSelector(state => state.persistedData);
  console.log('email', cardDetails);

  const navigation = useNavigation();

  const sheetRef = useRef();

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
          return Toast.show('Some problem occured', 2000, Toast.SHORT);
        });
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
