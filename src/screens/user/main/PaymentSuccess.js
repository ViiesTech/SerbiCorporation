/* eslint-disable react-native/no-inline-styles */
import React, { useEffect } from 'react'
import { FlatList, View } from 'react-native'
import Container from '../../../components/Container'
import { AppColors, responsiveFontSize, responsiveHeight, responsiveWidth } from '../../../utils'
import { colors } from '../../../assets/colors'
import AppText from '../../../components/AppText'
import LineBreak from '../../../components/LineBreak'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native'

const data = [
    { id: 1, title: 'Ref Number', subTitle: '000085752257' },
    { id: 2, title: 'Payment Time', subTitle: '05-08-2025, 13:22:16' },
    { id: 3, title: 'Payment Method', subTitle: 'Bank Transfer' },
    { id: 4, title: 'Sender Name', subTitle: 'Roland Hopper' },
    { id: 5, title: 'Amount', subTitle: '$ 49.00' },
]

const PaymentSuccess = () => {
    const nav = useNavigation();

    useEffect(() => {
        setTimeout(() => {
            nav.navigate('PestTechnician');
        }, 2000);
    }, [nav])

    return (
        <Container>
            <View style={{
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#F8F9FD',
                height: responsiveHeight(89)
            }}>
                <View style={{
                    borderWidth: 1,
                    borderColor: colors.secondary_button,
                    elevation: 5,
                    width: responsiveWidth(90),
                    backgroundColor: AppColors.WHITE,
                    paddingVertical: responsiveHeight(1.5),
                    paddingHorizontal: responsiveWidth(4),
                    borderRadius: 15,
                }}>
                    <View>
                        <View style={{ alignSelf: 'center', backgroundColor: '#FEFAEC', borderRadius: 100, width: 75, height: 75, justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ backgroundColor: colors.primary, borderRadius: 100, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
                                <FontAwesome5 name='check' size={responsiveFontSize(2.3)} color={AppColors.WHITE} />
                            </View>
                        </View>

                        <LineBreak val={2} />

                        <View style={{ alignItems: 'center', }}>
                            <AppText
                                title={'Payment Success!'}
                                color={AppColors.GRAY}
                                size={1.8}
                            />
                            <LineBreak val={0.5} />
                            <AppText
                                title={'$ 49.00'}
                                color={AppColors.BLACK}
                                size={2.5}
                                fontWeight={'bold'}
                            />
                        </View>

                        <LineBreak val={2} />

                        <View style={{
                            borderTopWidth: 1,
                            borderTopColor: AppColors.LIGHTESTGRAY,
                            paddingTop: responsiveHeight(3),
                        }}>
                            <FlatList
                                data={data}
                                ItemSeparatorComponent={<LineBreak val={1} />}
                                renderItem={({ item }) => (
                                    <>
                                        {item.id == 5 && (
                                            <>
                                                <LineBreak val={1} />
                                                <View style={{ width: responsiveWidth(100), height: 1, backgroundColor: AppColors.LIGHTESTGRAY }} />
                                            </>
                                        )}
                                        {item.id == 5 && <LineBreak val={1} />}
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <AppText
                                                title={item.title}
                                                color={AppColors.GRAY}
                                                size={1.8}
                                            />
                                            <AppText
                                                title={item.subTitle}
                                                color={AppColors.BLACK}
                                                size={2}
                                                fontWeight={500}
                                            />
                                        </View>
                                    </>
                                )}
                            />
                        </View>


                    </View>
                </View>
            </View>
        </Container>
    )
}

export default PaymentSuccess