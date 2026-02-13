/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  ImageBackground,
  Platform,
  StyleSheet,
  Image,
} from 'react-native';
import Container from '../../../components/Container';
import { useNavigation } from '@react-navigation/native';
import LineBreak from '../../../components/LineBreak';
import NormalHeader from '../../../components/NormalHeader';
import { images } from '../../../assets/images';
import {
  AppColors,
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../utils';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { colors } from '../../../assets/colors';
import Button from '../../../components/Button';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const WorkDone = ({ route }) => {
  const nav = useNavigation();
  const { profileData } = route?.params;

  const technicianLocation = {
    longitude: profileData?.location?.coordinates[0] || -80.4115,
    latitude: profileData?.location?.coordinates[1] || 25.4486,
  };

  return (
    <Container scrollEnabled={false}>
      <NormalHeader heading={'work done'} onBackPress={() => nav.goBack()} />
      <View style={{ flex: 1, minHeight: responsiveHeight(90) }}>
        <MapView
          provider={Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          initialRegion={{
            ...technicianLocation,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}
        >
          <Marker coordinate={technicianLocation} title="Technician">
            <View
              style={{
                height: 70,
                width: 70,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Image
                source={images.pin_marker}
                style={{ height: 50, width: 50 }}
                resizeMode="contain"
              />
            </View>
          </Marker>
        </MapView>

        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: AppColors.WHITE,
              width: responsiveWidth(90),
              borderRadius: 20,
              paddingVertical: responsiveHeight(2),
              elevation: 5,
              shadowColor: AppColors.BLACK,
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            }}
          >
            <View
              style={{
                alignSelf: 'center',
                backgroundColor: colors.primary,
                borderRadius: 100,
                width: 70,
                height: 70,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <FontAwesome5
                name="check"
                size={responsiveFontSize(3.5)}
                color={AppColors.BLACK}
              />
            </View>
            <LineBreak val={2.5} />
            <Button
              onPress={() =>
                nav.navigate('Payment', {
                  pest_tech: profileData,
                  request: true,
                })
              }
              title={'Proceed to payment'}
              textTransform={'uppercase'}
              color={colors.secondary_button}
              width={85}
            />
          </View>
        </View>
      </View>
    </Container>
  );
};

export default WorkDone;
