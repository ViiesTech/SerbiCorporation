import { useRef, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { responsiveHeight, responsiveWidth, slides } from '../../utils';
import AppText from '../../components/AppText';
import LineBreak from '../../components/LineBreak';
import Button from '../../components/Button';
import { colors } from '../../assets/colors';
import { useNavigation } from '@react-navigation/native';

const OnBoarding = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef(null);
  const navigation = useNavigation();

  const renderItem = ({ item, index }) => {
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
        <View
          style={{
            padding: responsiveHeight(2),
          }}
        >
          <AppText size={2.3} title={item.title} />
          <LineBreak val={2} />
          <AppText size={3.5} fontWeight={'bold'} title={item.sub_title} />
          <LineBreak val={2} />
          <AppText title={item.text} />
        </View>
      </View>
    );
  };

  const renderPagination = () => {
    return (
      <View style={styles.bottomButtons}>
        {currentIndex > 0 ? (
          <Button
            onPress={() => {
              const prevIndex = currentIndex - 1;
              setCurrentIndex(prevIndex);
              sliderRef.current?.goToSlide(prevIndex);
            }}
            color={colors.secondary_button}
            width={44}
            title="PREVIOUS"
          />
        ) : (
          <Button
            onPress={() => navigation.replace('Login')}
            color={colors.secondary_button}
            width={44}
            title="SKIP"
          />
        )}
        <Button
          onPress={() => {
            console.log(
              'Next pressed. currentIndex:',
              currentIndex,
              'slides:',
              slides.length,
            );
            if (currentIndex === slides.length - 1) {
              navigation.replace('Login');
            } else {
              if (sliderRef.current) {
                const nextIndex = currentIndex + 1;
                console.log('Calling goToSlide', nextIndex);
                setCurrentIndex(nextIndex); // Update state before goToSlide
                sliderRef.current.goToSlide(nextIndex);
              } else {
                console.log('sliderRef.current is null');
              }
            }
          }}
          width={44}
          title={
            currentIndex === slides.length - 1 ? 'CONTINUE TO APP' : 'NEXT'
          }
        />
      </View>
    );
  };

  return (
    <AppIntroSlider
      data={slides}
      ref={sliderRef}
      renderItem={renderItem}
      renderPagination={renderPagination}
      onSlideChange={index => {
        setCurrentIndex(index + 1);
      }}
    />
  );
};

export default OnBoarding;

const styles = StyleSheet.create({
  buttonStyle: {
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
    marginTop: responsiveHeight(2),
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
    // opacity: 0.4,
    backgroundColor: colors.secondary_button,
  },
  activeDot: {
    width: responsiveWidth(6.5),
    height: 8,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
});
