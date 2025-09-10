/* eslint-disable react-native/no-inline-styles */
import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import NormalHeader from './../../../components/NormalHeader';
import Container from './../../../components/Container';
import { AppColors, responsiveFontSize, responsiveHeight, responsiveWidth } from '../../../utils';
import AppText from '../../../components/AppText';
import LineBreak from '../../../components/LineBreak';
import AppTextInput from './../../../components/AppTextInput';
import Feather from 'react-native-vector-icons/Feather';
import AppButton from './../../../components/AppButton';
const JobDiscussionForm = ({ navigation }) => {
    return (
        <Container>

            <NormalHeader heading={'job discussion Form'} onBackPress={() => navigation.goBack()} />
            <View style={{ paddingHorizontal: responsiveWidth(4) }}>
                <LineBreak val={5} />
                <View style={{
                    backgroundColor: AppColors.WHITE,
                    elevation: 5,
                    borderRadius: 20,
                    paddingHorizontal: responsiveWidth(4),
                    paddingVertical: responsiveHeight(2),
                    gap: responsiveHeight(1),
                }}>
                    <View>
                        <AppText
                            title={'Job Type'}
                            color={AppColors.BLACK}
                            size={1.7}
                            fontWeight={'bold'}
                        />
                        <LineBreak val={0.5} />
                        <AppTextInput inputPlaceHolder={'General Pest Spray'} borderRadius={40} inputWidth={70} rightIcon={
                            <Feather
                                name="chevron-down"
                                size={responsiveFontSize(2.5)}
                                color={AppColors.BLACK}
                            />
                        } />
                    </View>
                    <View>
                        <AppText
                            title={'Area to be Treated'}
                            color={AppColors.BLACK}
                            size={1.7}
                            fontWeight={'bold'}
                        />
                        <LineBreak val={0.5} />
                        <AppTextInput inputPlaceHolder={'Kitchen'} borderRadius={40} inputWidth={70} rightIcon={
                            <Feather
                                name="chevron-down"
                                size={responsiveFontSize(2.5)}
                                color={AppColors.BLACK}
                            />
                        } />
                    </View>
                    <View>
                        <AppText
                            title={'Issue Severity'}
                            color={AppColors.BLACK}
                            size={1.7}
                            fontWeight={'bold'}
                        />
                        <LineBreak val={0.5} />
                        <AppTextInput inputPlaceHolder={'Low'} borderRadius={40} inputWidth={70} rightIcon={
                            <Feather
                                name="chevron-down"
                                size={responsiveFontSize(2.5)}
                                color={AppColors.BLACK}
                            />
                        } />
                    </View>
                    <View>
                        <AppText
                            title={'Area Sq ft'}
                            color={AppColors.BLACK}
                            size={1.7}
                            fontWeight={'bold'}
                        />
                        <LineBreak val={0.5} />
                        <AppTextInput inputPlaceHolder={'140 sq ft'} borderRadius={40} />
                    </View>
                    <View>
                        <AppText
                            title={'Special Instructions or Notes'}
                            color={AppColors.BLACK}
                            size={1.7}
                            fontWeight={'bold'}
                        />
                        <LineBreak val={0.5} />
                        <AppTextInput
                            inputPlaceHolder={'Lore ipsm...'}
                            inputHeight={8}
                            multiline={true}
                            textAlignVertical={'top'}
                            borderRadius={10} />
                    </View>
                    <View>
                        <AppText
                            title={'Amount'}
                            color={AppColors.BLACK}
                            size={1.7}
                            fontWeight={'bold'}
                        />
                        <LineBreak val={0.5} />
                        <AppTextInput inputPlaceHolder={'$150.00'} borderRadius={40} />
                    </View>
                </View>
                <LineBreak val={3} />
                <AppButton handlePress={()=>navigation.navigate('StartJob')} textColor='black' textFontWeight={'bold'} title='SUBMIT' bgColor='#A0CCD9' borderRadius={30} />
            </View>
        </Container>
    )
}

export default JobDiscussionForm