import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import Container from '../components/Container';
import NormalHeader from '../components/NormalHeader';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import { colors } from '../assets/colors';
import LineBreak from '../components/LineBreak';
import { Image } from 'react-native';
import AppText from '../components/AppText';
import { images } from '../assets/images';
import { responsiveHeight } from '../utils';
import { StarRatingDisplay } from 'react-native-star-rating-widget';
import { useLazyGetProfileQuery } from '../redux/services';
import { useSelector } from 'react-redux';
import Loader from '../components/Loader';
import { IMAGE_URL } from '../redux/constant';

const MainProfile = () => {
  const nav = useNavigation();
  const { _id } = useSelector(state => state.persistedData.user);
  const [getProfile, { data, isLoading }] = useLazyGetProfileQuery();

  const isFocused = useIsFocused();

  console.log('user data ===>', data?.data);

  useEffect(() => {
    if (isFocused) {
      getProfile(_id);
    }
  }, [isFocused]);


  return (
    <Container>
      <NormalHeader heading={'ACCOUNT'} onBackPress={() => nav.goBack()} />
      {isLoading ? (
        <>
          <LineBreak val={2} />
          <Loader />
        </>
      ) : (
        <>
          <View style={{ alignItems: 'center' }}>
            <LineBreak val={5} />
            <Image
              style={{
                height: responsiveHeight(12),
                width: responsiveHeight(12),
                borderRadius: 100,
              }}
              source={data?.data?.profileImage ? { uri: `${IMAGE_URL}${data?.data?.profileImage}` } : images.userProfile}
            />
            <LineBreak val={2} />
            <AppText title={data?.data?.fullName} />
            <LineBreak val={3} />
            <Button onPress={() => nav.navigate('Profile',{user: data?.data})} title={'Edit Profile'} color={colors.secondary_button} />
            <LineBreak val={2} />
            <AppText title={data?.data?.locationName} />
            <LineBreak val={2.5} />
          {data?.data?.type !== 'User' &&
          <> 
            <AppText size={2.5} fontWeight={'bold'} title={'Review'} />
            <LineBreak val={1} />
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
            >
              <StarRatingDisplay rating={1} maxStars={1} />
              <AppText fontWeight={'bold'} title={data?.data?.avgRating || 0} />
              <AppText title={`(${data?.data?.totalReviews || 0})`} />
            </View>
            <LineBreak val={2.5} />
            </>
            }
            <View
              style={{
                borderBottomWidth: 0.5,
                width: '85%',
                borderBottomColor: colors.black,
              }}
            />
          </View>
          <LineBreak val={2.5} />
          <View style={{ paddingHorizontal: responsiveHeight(3.5) }}>
            <AppText size={2.5} fontWeight={'bold'} title={'About'} />
            <LineBreak val={2} />
            <AppText align={'center'} title={'No Detail Found'} />
          </View>
        </>
      )}
    </Container>
  );
};

export default MainProfile;

const styles = StyleSheet.create({});
