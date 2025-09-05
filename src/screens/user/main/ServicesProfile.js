import React, { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Container from '../../../components/Container'
import { useNavigation } from '@react-navigation/native';
import NormalHeader from '../../../components/NormalHeader';
import LineBreak from '../../../components/LineBreak';
import { AppColors, responsiveFontSize, responsiveHeight, responsiveWidth } from '../../../utils';
import { images } from '../../../assets/images';
import HistoryCard from '../../../components/HistoryCard';
import AppText from '../../../components/AppText';
import AppTextInput from './../../../components/AppTextInput';
import Entypo from 'react-native-vector-icons/Entypo';
import Button from '../../../components/Button';
import { colors } from '../../../assets/colors';
import AppCalendar from '../../../components/AppCalendar';
import AppClock from '../../../components/AppClock';

const ServicesProfile = () => {
    const nav = useNavigation();
    const [isShowCalendar, setIsShowCalendar] = useState(false);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    return (
        <Container>
            <NormalHeader
                heading={'Roland hopper'}
                onBackPress={() => nav.goBack()}
            />
            <LineBreak val={2} />
            <View style={{ paddingHorizontal: responsiveWidth(4) }}>
                <HistoryCard
                    item={{
                        id: 1,
                        profImg: images.imageProf,
                        username: 'Roland Hopper',
                        designation: 'Expert Gerdener',
                        rating: '3.5',
                        time: '30',
                    }}
                    selectedCard={{ id: 1 }}
                    activeCardBgColor={AppColors.PRIMARY}
                    profiles={'profiles'}
                    isHideClose={false}
                    isShowBadge={true}
                    viewDetailsHandlePress={() => nav.navigate('ServicesProfile')}
                />
                <LineBreak val={2} />
                <AppText
                    title={'Experience In Pest Control,'}
                    color={AppColors.BLACK}
                    size={2.5}
                    fontWeight={'bold'}
                />
                <LineBreak val={0.5} />
                <AppText
                    title={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut dolore magna aliqua.'}
                    color={AppColors.DARKGRAY}
                    size={1.5}
                />

                <LineBreak val={2} />

                <View style={{ gap: responsiveHeight(1) }}>
                    <View>
                        <AppText
                            title={'Select Date'}
                            color={AppColors.BLACK}
                            size={1.8}
                            fontWeight={'bold'}
                        />
                        <LineBreak val={0.5} />
                        <TouchableOpacity onPress={() => setIsShowCalendar(!isShowCalendar)}>
                            <AppTextInput
                                inputPlaceHolder={'03/17/2025'}
                                borderRadius={30}
                                editable={false}
                                inputWidth={77}
                                rightIcon={
                                    <Entypo
                                        name="chevron-small-down"
                                        size={responsiveFontSize(3.5)}
                                        color={AppColors.BLACK}
                                    />
                                }
                            />
                        </TouchableOpacity>
                        {isShowCalendar && <AppCalendar />}
                    </View>
                    <View>
                        <AppText
                            title={'Select Time'}
                            color={AppColors.BLACK}
                            size={1.8}
                            fontWeight={'bold'}
                        />
                        <LineBreak val={0.5} />
                        <TouchableOpacity onPress={() => setDatePickerVisibility(!isDatePickerVisible)}>
                            <AppTextInput
                                inputPlaceHolder={'10:00 AM'}
                                borderRadius={30}
                                inputWidth={77}
                                editable={false}
                                rightIcon={
                                    <Entypo
                                        name="chevron-small-down"
                                        size={responsiveFontSize(3.5)}
                                        color={AppColors.BLACK}
                                    />
                                }
                            />
                        </TouchableOpacity>
                        <AppClock isDatePickerVisible={isDatePickerVisible} setDatePickerVisibility={setDatePickerVisibility} />}
                    </View>
                    <View>
                        <AppText
                            title={'Address'}
                            color={AppColors.BLACK}
                            size={1.8}
                            fontWeight={'bold'}
                        />
                        <LineBreak val={0.5} />
                        <AppTextInput
                            inputPlaceHolder={'371 7th Ave, New York, NY 10001'}
                            borderRadius={30}
                            inputWidth={77}
                            rightIcon={
                                <Entypo
                                    name="location-pin"
                                    size={responsiveFontSize(3.5)}
                                    color={AppColors.BLACK}
                                />
                            }
                        />
                    </View>
                    <View>
                        <AppText
                            title={'Add Comment'}
                            color={AppColors.BLACK}
                            size={1.8}
                            fontWeight={'bold'}
                        />
                        <LineBreak val={0.5} />
                        <AppTextInput
                            inputPlaceHolder={'Lorem ipsum...'}
                            borderRadius={7}
                            inputWidth={77}
                            inputHeight={12}
                            multiline={true}
                            textAlignVertical={'top'}
                        />
                    </View>
                </View>

                <LineBreak val={2} />

                <Button
                    onPress={() => nav.navigate("WorkDone")}
                    title={'Confirm booking'}
                    textTransform={'uppercase'}
                    color={colors.primary}
                    width={90} />

            </View>
        </Container>
    )
}

export default ServicesProfile