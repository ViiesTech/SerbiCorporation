import { Image, StyleSheet, View } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { responsiveHeight, responsiveWidth, slides } from '../../utils';
import AppText from '../../components/AppText';
import LineBreak from '../../components/LineBreak';
import Button from '../../components/Button';
import { colors } from '../../assets/colors';
import { useRef } from 'react';
import { useNavigation } from '@react-navigation/native';

const OnBoarding = () => {
   const sliderRef = useRef(null);
   const navigation = useNavigation()

  const renderItem = ({ item,index }) => {
    return (
      <View style={styles.slide}>
        <Image
          resizeMode="cover"
          style={{
            alignSelf: 'center',
            width: responsiveWidth(100),
            height: responsiveHeight(50),
          }}
          source={item.image}
        />
         <View style={styles.dotsRow}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === index && styles.activeDot]}
          />
        ))}
      </View>
      <View style={{
        padding: responsiveHeight(2)
      }}> 
        <AppText size={2.3} title={item.title} />
        <LineBreak val={2} />
        <AppText size={3.5} fontWeight={'bold'} title={item.sub_title} />
        <LineBreak val={2} />
        <AppText title={item.text} />
        </View> 
      </View>
    );
  };

   const renderPagination = (activeIndex) => {
    return (
      <View style={styles.bottomButtons}>
         {activeIndex > 0 ?(
          <Button onPress={() => sliderRef.current?.goToSlide(activeIndex - 1,true)}  color={colors.secondary_button} width={44} title="PREVIOUS" />
        ) : (
           <Button onPress={() => sliderRef.current?.goToSlide(slides.length - 1,true)} color={colors.secondary_button} width={44} title="SKIP" />
        )
      }
        <Button onPress={() => {
          if(activeIndex === slides.length - 1) {
            navigation.navigate('SelectType')
          } else {
            sliderRef.current?.goToSlide(activeIndex + 1,true)
          }
        }} width={44} title={activeIndex === slides.length - 1 ? "CONTINUE TO APP" : "NEXT"} />
      </View>
    );
  };

  return (
      <AppIntroSlider
        data={slides}
        ref={sliderRef} 
        renderItem={renderItem}
        renderPagination={renderPagination}
      />
  );
};

export default OnBoarding;

const styles = StyleSheet.create({
  buttonStyle:{
    position: 'absolute',
    top: 10,
  },
   bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveHeight(2),
    paddingBottom: responsiveHeight(4.5),
    // position: 'absolute',
    // bottom: 0,
    // left: 0,
    // right: 0,
  },
    dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: responsiveHeight(2)
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
    // opacity: 0.4,
    backgroundColor:  colors.secondary_button,
  },
  activeDot: {
    width: responsiveWidth(6.5),
    height: 8,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
});
