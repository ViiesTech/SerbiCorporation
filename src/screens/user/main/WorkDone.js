/* eslint-disable react-native/no-inline-styles */
import React from 'react'
import { View, ImageBackground } from 'react-native'
import Container from '../../../components/Container'
import { useNavigation } from '@react-navigation/native';
import LineBreak from '../../../components/LineBreak';
import NormalHeader from '../../../components/NormalHeader';
import { images } from '../../../assets/images';
import { AppColors, responsiveFontSize, responsiveHeight, responsiveWidth } from '../../../utils';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { colors } from '../../../assets/colors';
import Button from '../../../components/Button';

const WorkDone = ({route}) => {
    const nav = useNavigation();
    const {profileData} = route?.params

    return (
        <Container>
            <NormalHeader
                heading={'work done'}
                onBackPress={() => nav.goBack()}
            />
            <ImageBackground source={images.big_map}
                style={{
                    width: responsiveWidth(100),
                    height: responsiveHeight(90),
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                <View style={{ backgroundColor: AppColors.WHITE, width: responsiveWidth(90), borderRadius: 20, paddingVertical: responsiveHeight(2) }}>
                    <View style={{ alignSelf: 'center', backgroundColor: colors.primary, borderRadius: 100, width: 70, height: 70, justifyContent: 'center', alignItems: 'center' }}>
                        <FontAwesome5 name='check' size={responsiveFontSize(3.5)} color={AppColors.BLACK} />
                    </View>
                    <LineBreak val={2.5} />
                    <Button
                        onPress={() => nav.navigate("Payment",{pest_tech:profileData})}
                        title={'Proceed to payment'}
                        textTransform={'uppercase'}
                        color={colors.secondary_button}
                        width={85} />
                </View>
            </ImageBackground>
        </Container>
    )
}

export default WorkDone