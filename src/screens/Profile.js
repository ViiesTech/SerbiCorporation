/* eslint-disable react-native/no-inline-styles */
import React from 'react'
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native'
import Container from '../components/Container'
import { useNavigation } from '@react-navigation/native'
import NormalHeader from '../components/NormalHeader'
import icons from '../assets/icons'
import { AppColors, responsiveFontSize, responsiveHeight, responsiveWidth } from '../utils'
import Feather from 'react-native-vector-icons/Feather';
import { images } from '../assets/images'
import LineBreak from '../components/LineBreak'
import { colors } from '../assets/colors'
import AppText from '../components/AppText'
import AppTextInput from '../components/AppTextInput'
import AppButton from '../components/AppButton'

const Profile = () => {
    const nav = useNavigation();
    return (
        <Container>
            <NormalHeader heading={'Profile'} onBackPress={() => nav.goBack()} />
            <LineBreak val={3} />
            <View style={{ alignItems: 'center' }}>
                <ImageBackground
                    source={images.imageProf}
                    style={{
                        width: 100,
                        height: 100,
                        position: 'relative',
                    }}
                    imageStyle={{ borderRadius: 100 }}>
                    <TouchableOpacity
                        style={{
                            width: 30,
                            height: 30,
                            borderRadius: 100,
                            backgroundColor: colors.primary,
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                        <Feather
                            name="plus"
                            size={responsiveFontSize(2.5)}
                            color={AppColors.BLACK}
                        />
                    </TouchableOpacity>
                </ImageBackground>
            </View>
            <LineBreak val={3} />

            <View style={{ paddingHorizontal: responsiveWidth(5) }}>
                <View style={{ gap: 20 }}>
                    <View>
                        <AppText
                            title={'Your Full Name'}
                            color={AppColors.LIGHTGRAY}
                            size={1.8}
                        />
                        <LineBreak val={1} />
                        <AppTextInput
                            inputPlaceHolder={'Alicia John'}
                            placeholderTextColor={AppColors.LIGHTGRAY}
                            borderRadius={30}
                            borderColor={AppColors.BLACK}
                        />
                    </View>

                    <View>
                        <AppText
                            title={'Date Of Birth'}
                            color={AppColors.LIGHTGRAY}
                            size={1.8}
                        />
                        <LineBreak val={1} />
                        <AppTextInput
                            inputPlaceHolder={'123-456-7890'}
                            placeholderTextColor={AppColors.LIGHTGRAY}
                            borderRadius={30}
                            borderColor={AppColors.BLACK}
                        />
                    </View>

                    <View>
                        <AppText
                            title={'Home Address'}
                            color={AppColors.LIGHTGRAY}
                            size={1.8}
                        />
                        <LineBreak val={1} />
                        <AppTextInput
                            inputPlaceHolder={'..........'}
                            placeholderTextColor={AppColors.LIGHTGRAY}
                            borderRadius={30}
                            borderColor={AppColors.BLACK}
                        />
                    </View>

                    <View>
                        <AppText
                            title={'Phone Number'}
                            color={AppColors.LIGHTGRAY}
                            size={1.8}
                        />
                        <LineBreak val={1} />
                        <AppTextInput
                            inputPlaceHolder={'123-456-7890'}
                            placeholderTextColor={AppColors.LIGHTGRAY}
                            borderRadius={30}
                            borderColor={AppColors.BLACK}
                        />
                    </View>

                    <View>
                        <AppText
                            title={'Email Address'}
                            color={AppColors.LIGHTGRAY}
                            size={1.8}
                        />
                        <LineBreak val={1} />
                        <AppTextInput
                            inputPlaceHolder={'aliciajohn456@gmail.com'}
                            placeholderTextColor={AppColors.LIGHTGRAY}
                            borderRadius={30}
                            borderColor={AppColors.BLACK}
                        />
                    </View>

                    <LineBreak val={1} />
                    
                    <AppButton
                        title={"update profile"}
                        bgColor={colors.primary}
                        textColor={AppColors.BLACK}
                        textFontWeight={'bold'}
                        borderRadius={30}
                        buttoWidth={92}
                        textTransform={'uppercase'}
                        handlePress={() => {}}
                    />
                    <LineBreak val={1} />
                </View>
            </View>
        </Container>
    )
}

export default Profile