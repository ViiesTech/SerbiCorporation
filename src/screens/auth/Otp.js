/* eslint-disable react-native/no-inline-styles */
import Container from '../../components/Container';
import AppText from '../../components/AppText';
import LineBreak from '../../components/LineBreak';
import Button from '../../components/Button';
import CodeField from '../../components/CodeField';
import { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { images } from '../../assets/images';
import { colors } from '../../assets/colors';
import { responsiveHeight } from '../../utils';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Otp = () => {
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  const nav = useNavigation();

  const goToRoute = async () => {
    const type = await AsyncStorage.getItem('type');

    if (type === 'User') {
      setShowLoginSuccess(false)
      nav.navigate('userRoutes')
    } else {
      setShowLoginSuccess(false)
      nav.navigate('vendorRoutes')
    }
  }

  useEffect(() => {
    setTimeout(() => {
      goToRoute()
    }, 3000)

  }, [showLoginSuccess, nav])

  return (
    !showLoginSuccess ? (
      <Container space={25} authHeading={'ENTER PASS CODE'}>
        <LineBreak val={1} />
        <AppText
          size={1.7}
          align="center"
          title="Number code has been sent to your phone or WhatsApp"
        />
        <LineBreak val={2} />
        <CodeField />
        <LineBreak val={1} />
        <Button onPress={() => setShowLoginSuccess(true)} title="SUBMIT" />
      </Container>
    ) : (
      <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, backgroundColor: colors.white }}>
        <Image resizeMode='cover' style={{ height: responsiveHeight(13), width: responsiveHeight(13) }} source={images.success} />
        <LineBreak val={2} />
        <AppText title={'Action Success'} />
        <LineBreak val={2} />
        <AppText fontWeight={'bold'} size={2.8} title={'LOGIN SUCCESS'} />
      </View>
    )
  );
};

export default Otp;
