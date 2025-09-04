/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-undef */
import React, { useState } from 'react'
import { View, Image, TouchableOpacity, FlatList } from 'react-native'
import Container from '../../../components/Container'
import HomeHeader from './../../../components/HomeHeader';
import Drawer from './../../../components/Drawer';
import { AppColors, responsiveFontSize, responsiveHeight, responsiveWidth } from '../../../utils';
import Feather from 'react-native-vector-icons/Feather';
import AppTextInput from './../../../components/AppTextInput';
import { images } from '../../../assets/images';
import LineBreak from '../../../components/LineBreak';
import icons from '../../../assets/icons';
import AppText from '../../../components/AppText';
import { useNavigation } from '@react-navigation/native';
import SVGIcon from '../../../components/SVGIcon';
import Button from '../../../components/Button';

const prefService = [
    { id: 1, icon: icons.pest_one, title: 'Pest Control' },
    { id: 2, icon: icons.pest_two, title: 'Termite control' },
    { id: 3, icon: icons.pest_three, title: 'Mosquito Control' },
];

const UserHome = () => {
    const [openDrawer, setOpenDrawer] = useState(false);
    const [selectedService, setSelectedService] = useState({ id: 1 });
    const nav = useNavigation();

    return (
        <Container>
            <HomeHeader
                menuIconOnPress={() => setOpenDrawer(true)}
            />

            <Drawer
                isVisible={openDrawer}
                onBackdropPress={() => setOpenDrawer(false)}
                closeIconOnPress={() => setOpenDrawer(false)}
            />

            <View style={{ paddingHorizontal: responsiveWidth(4) }}>
                <AppTextInput
                    inputPlaceHolder={'What are you looking for?'}
                    inputWidth={78}
                    placeholderTextColor={AppColors.DARKGRAY}
                    borderRadius={25}
                    rightIcon={
                        <Feather
                            name="search"
                            size={responsiveFontSize(2.5)}
                            color={AppColors.ThemeBlue}
                        />
                    }
                />
            </View>

            <LineBreak val={3} />

            <Image source={images.map} style={{ width: responsiveWidth(100) }} />

            <LineBreak val={2} />

            <View style={{ paddingHorizontal: responsiveWidth(4) }}>
                <AppText
                    title={'Which services do you need?'}
                    color={AppColors.BLACK}
                    size={2.2}
                    textTransform={'uppercase'}
                    fontWeight={'bold'}
                />
                <LineBreak val={2} />
                <FlatList
                    data={prefService}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 15 }}
                    renderItem={({ item }) => {
                        return (
                            <TouchableOpacity
                                style={{
                                    borderWidth: 1,
                                    borderColor: AppColors.BLACK,
                                    paddingVertical: responsiveHeight(1.5),
                                    width: responsiveWidth(35),
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: 6,
                                    borderRadius: 6,
                                    backgroundColor:
                                        selectedService.id == item.id
                                            ? AppColors.PRIMARY
                                            : AppColors.WHITE,
                                }}
                                onPress={() => {
                                    setSelectedService({ id: item.id });
                                }}>
                                <View
                                    style={{
                                        borderWidth: 1,
                                        borderColor: AppColors.BLACK,
                                        padding: responsiveWidth(2),
                                        borderRadius: 100,
                                        backgroundColor: AppColors.WHITE,
                                    }}>
                                    <SVGIcon xml={item.icon} width={50} height={50} />
                                </View>
                                <AppText
                                    title={item.title}
                                    textColor={
                                        selectedService.id == item.id
                                            ? AppColors.WHITE
                                            : AppColors.PRIMARY
                                    }
                                    size={1.2}
                                    fontWeight={'bold'}
                                    textTransform={'uppercase'}
                                />
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>
            <LineBreak val={2} />

            <View style={{ paddingHorizontal: responsiveWidth(4) }}>
                <AppText
                    title={'Request Form'}
                    color={AppColors.BLACK}
                    size={2.5}
                    textTransform={'uppercase'}
                    fontWeight={'bold'}
                />

                <LineBreak val={1} />

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
                            title={'Property Type'}
                            color={AppColors.BLACK}
                            size={1.7}
                            fontWeight={'bold'}
                        />
                        <LineBreak val={0.5} />
                        <AppTextInput inputPlaceHolder={'Home / Residential'} borderRadius={40} inputWidth={70} rightIcon={
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
                </View>
            </View>

            <LineBreak val={2} />

            <Button onPress={() => nav.navigate("Services")} title={'Submit'} textTransform={'uppercase'} color={AppColors.PRIMARY} width={90} />


            <LineBreak val={2} />
        </Container>
    )
}

export default UserHome