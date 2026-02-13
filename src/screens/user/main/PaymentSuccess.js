/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import Container from '../../../components/Container';
import {
  AppColors,
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../utils';
import { colors } from '../../../assets/colors';
import AppText from '../../../components/AppText';
import LineBreak from '../../../components/LineBreak';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import AppButton from '../../../components/AppButton';
import AppTextInput from '../../../components/AppTextInput';
import Feather from 'react-native-vector-icons/Feather';
import StarRating from 'react-native-star-rating-widget';
import { useAddReviewMutation } from '../../../redux/services';
import { useSelector } from 'react-redux';
import Toast from 'react-native-simple-toast';
import moment from 'moment';

const PaymentSuccess = ({ route }) => {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const nav = useNavigation();
  const pest_tech = route?.params?.pest_tech;
  const request = route?.params?.request;
  const [addReview, { isLoading }] = useAddReviewMutation();
  const { fullName, _id } = useSelector(state => state.persistedData.user);

  const data = [
    {
      id: 1,
      title: 'Ref Number',
      subTitle:
        pest_tech?.requestPayInfo?.refNumber.toFixed(10) || '000085752257',
    },
    {
      id: 2,
      title: 'Payment Time',
      subTitle:
        moment(pest_tech?.requestPayInfo?.created * 1000).format(
          'YYYY-MM-DD HH:mm:ss',
        ) || '05-08-2025, 13:22:16',
    },
    {
      id: 3,
      title: 'Payment Method',
      subTitle: pest_tech?.requestPayInfo?.methodType || 'Bank Transfer',
    },
    { id: 4, title: 'Sender Name', subTitle: fullName || 'Roland Hopper' },
    {
      id: 5,
      title: 'Amount',
      subTitle: `$${pest_tech?.requestPayInfo?.amount / 100}.00` || '$49.00',
    },
  ];
  //   console.log('pest', pest_tech);

  useEffect(() => {
    if (!request) {
      null;
    } else {
      setTimeout(() => {
        nav.navigate('UserHome');
      }, 2000);
    }
  }, [nav, request]);

  const onSubmit = async () => {
    let data = {
      userId: _id,
      technicianId: pest_tech._id,
      star: rating,
      message,
    };

    await addReview(data)
      .unwrap()
      .then(res => {
        console.log('response of client review ===>', res);
        Toast.show(res.msg, Toast.SHORT);
        if (res.success) {
          nav.navigate('UserHome');
        }
      })
      .catch(error => {
        console.log('error while adding review ===>>>', error);
        Toast.show('Some problem occured', Toast.SHORT);
      });
  };

  return (
    <Container contentStyle={{ paddingBottom: responsiveHeight(5) }}>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#F8F9FD',
          height: responsiveHeight(89),
        }}
      >
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.secondary_button,
            elevation: 5,
            width: responsiveWidth(90),
            backgroundColor: AppColors.WHITE,
            paddingVertical: responsiveHeight(1.5),
            paddingHorizontal: responsiveWidth(4),
            borderRadius: 15,
          }}
        >
          <View>
            <View
              style={{
                alignSelf: 'center',
                backgroundColor: '#FEFAEC',
                borderRadius: 100,
                width: 75,
                height: 75,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 100,
                  width: 40,
                  height: 40,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <FontAwesome5
                  name="check"
                  size={responsiveFontSize(2.3)}
                  color={AppColors.WHITE}
                />
              </View>
            </View>

            <LineBreak val={2} />

            <View style={{ alignItems: 'center' }}>
              <AppText
                title={'Payment Success!'}
                color={AppColors.GRAY}
                size={1.8}
              />
              <LineBreak val={0.5} />
              <AppText
                title={
                  `$${pest_tech?.requestPayInfo?.amount / 100}.00` || '$ 49.00'
                }
                color={AppColors.BLACK}
                size={2.5}
                fontWeight={'bold'}
              />
            </View>

            <LineBreak val={2} />

            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: AppColors.LIGHTESTGRAY,
                paddingTop: responsiveHeight(3),
              }}
            >
              <FlatList
                data={data}
                ItemSeparatorComponent={<LineBreak val={1} />}
                renderItem={({ item }) => (
                  <>
                    {item.id == 5 && (
                      <>
                        <LineBreak val={1} />
                        <View
                          style={{
                            width: responsiveWidth(100),
                            height: 1,
                            backgroundColor: AppColors.LIGHTESTGRAY,
                          }}
                        />
                      </>
                    )}
                    {item.id == 5 && <LineBreak val={1} />}
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <AppText
                        title={item.title}
                        color={AppColors.GRAY}
                        size={1.8}
                      />
                      <AppText
                        title={item.subTitle}
                        color={AppColors.BLACK}
                        size={2}
                        fontWeight={500}
                      />
                    </View>
                  </>
                )}
              />
            </View>
          </View>
        </View>
        {!request ? (
          <>
            <LineBreak val={3} />

            <StarRating starSize={40} onChange={setRating} rating={rating} />
            <LineBreak val={3} />
            <View>
              <AppTextInput
                inputPlaceHolder={'Leave feedback'}
                borderRadius={30}
                placeholderTextColor={AppColors.LIGHTGRAY}
                borderColor={AppColors.DARKGRAY}
                value={message}
                onChangeText={text => setMessage(text)}
                inputWidth={75}
                logo={
                  <Feather
                    name="edit"
                    size={responsiveFontSize(3)}
                    color={colors.primary}
                  />
                }
              />
            </View>
            <LineBreak val={2} />
            <AppButton
              title={'submit'}
              bgColor={colors.secondary_button}
              textColor={AppColors.BLACK}
              textFontWeight={'bold'}
              borderRadius={30}
              buttoWidth={90}
              isLoading={isLoading}
              textTransform={'uppercase'}
              handlePress={() => onSubmit()}
            />
          </>
        ) : null}
      </View>
    </Container>
  );
};

export default PaymentSuccess;
