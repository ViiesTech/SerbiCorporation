/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
} from 'react-native';
import Container from '../../../components/Container';
import {
  AppColors,
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../utils';
import { colors } from '../../../assets/colors';
import LineBreak from '../../../components/LineBreak';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
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

  const amountStr = pest_tech?.requestPayInfo?.amount
    ? `$${(pest_tech.requestPayInfo.amount / 100).toFixed(2)}`
    : '$49.00';

  const data = [
    {
      id: 1,
      title: 'Ref Number',
      subTitle:
        pest_tech?.requestPayInfo?.refNumber?.toFixed
          ? pest_tech.requestPayInfo.refNumber.toFixed(8)
          : '000085752257',
    },
    {
      id: 2,
      title: 'Payment Time',
      subTitle: pest_tech?.requestPayInfo?.created
        ? moment(pest_tech.requestPayInfo.created * 1000).format(
            'YYYY-MM-DD HH:mm:ss',
          )
        : moment().format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      id: 3,
      title: 'Payment Method',
      subTitle: pest_tech?.requestPayInfo?.methodType || 'Card Payment',
    },
    {
      id: 4,
      title: 'Sender Name',
      subTitle: fullName || 'Valued Customer',
    },
    {
      id: 5,
      title: 'Amount Paid',
      subTitle: amountStr,
      isTotal: true,
    },
  ];

  useEffect(() => {
    if (request) {
      const timer = setTimeout(() => {
        nav.navigate('UserHome');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [nav, request]);

  const onSubmit = async () => {
    let reviewData = {
      userId: _id,
      technicianId: pest_tech?._id,
      star: rating,
      message,
    };

    try {
      const res = await addReview(reviewData).unwrap();
      Toast.show(res?.msg || 'Feedback submitted', Toast.SHORT);
      if (res?.success) {
        nav.navigate('UserHome');
      }
    } catch (error) {
      console.log('error while adding review ===>>>', error);
      Toast.show('Some problem occurred', Toast.SHORT);
    }
  };

  return (
    <Container contentStyle={styles.containerContent}>
      <View style={styles.centerWrapper}>
        <View style={styles.receiptCard}>
          {/* Success Badge */}
          <View style={styles.badgeHalo}>
            <View style={styles.badgeMid}>
              <View style={styles.badgeCore}>
                <FontAwesome5
                  name="check"
                  size={20}
                  color="#0F172A"
                />
              </View>
            </View>
          </View>

          <Text style={styles.successHeading}>Payment Successful!</Text>
          <Text style={styles.successSubtitle}>
            Your transaction has been securely processed.
          </Text>

          <Text style={styles.amountDisplay}>{amountStr}</Text>

          <View style={styles.cardDivider} />

          {/* Details Table */}
          <View style={styles.detailsList}>
            {data.map(item => (
              <View key={item.id}>
                {item.isTotal ? <View style={styles.totalDivider} /> : null}
                <View style={styles.detailRow}>
                  <Text
                    style={[
                      styles.detailTitle,
                      item.isTotal && styles.totalLabel,
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.detailValue,
                      item.isTotal && styles.totalValue,
                    ]}
                    numberOfLines={1}
                  >
                    {item.subTitle}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {request ? (
            <View style={styles.redirectNotice}>
              <ActivityIndicator size="small" color="#64748B" />
              <Text style={styles.redirectText}>
                Redirecting to Home in a moment...
              </Text>
            </View>
          ) : null}
        </View>

        {!request ? (
          <View style={styles.feedbackSection}>
            <Text style={styles.feedbackHeading}>Rate Your Experience</Text>
            <LineBreak val={1} />

            <StarRating
              starSize={36}
              onChange={setRating}
              rating={rating}
              color="#F59E0B"
            />

            <LineBreak val={2} />

            <AppTextInput
              inputPlaceHolder="Leave a review or feedback..."
              borderRadius={16}
              placeholderTextColor="#94A3B8"
              borderColor="#E2E8F0"
              value={message}
              onChangeText={text => setMessage(text)}
              inputWidth={88}
              logo={
                <Feather
                  name="edit-3"
                  size={responsiveFontSize(2.2)}
                  color={colors.primary}
                />
              }
            />

            <LineBreak val={2} />

            <AppButton
              title="SUBMIT REVIEW"
              bgColor={colors.secondary_button}
              textColor="#0F172A"
              textFontWeight="bold"
              borderRadius={16}
              buttoWidth={88}
              isLoading={isLoading}
              textTransform="uppercase"
              handlePress={onSubmit}
            />
          </View>
        ) : null}
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  containerContent: {
    paddingBottom: responsiveHeight(5),
  },
  centerWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    minHeight: responsiveHeight(90),
    paddingVertical: responsiveHeight(3),
  },
  receiptCard: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    width: responsiveWidth(90),
    maxWidth: 420,
    backgroundColor: AppColors.WHITE,
    paddingVertical: responsiveHeight(3),
    paddingHorizontal: responsiveWidth(5),
    borderRadius: 24,
    alignItems: 'center',
  },
  badgeHalo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(247, 200, 69, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeMid: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(247, 200, 69, 0.38)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeCore: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  amountDisplay: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginTop: 14,
  },
  cardDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 18,
  },
  detailsList: {
    width: '100%',
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailTitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
    maxWidth: '55%',
    textAlign: 'right',
  },
  totalDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 6,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  redirectNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  redirectText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  feedbackSection: {
    width: responsiveWidth(90),
    maxWidth: 420,
    alignItems: 'center',
    marginTop: responsiveHeight(2.5),
  },
  feedbackHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
});

export default PaymentSuccess;
