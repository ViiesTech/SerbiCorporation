/* eslint-disable react/no-unstable-nested-components */
import React, { useState } from 'react'
import { View, FlatList } from 'react-native'
import Container from '../../../components/Container'
import { useNavigation } from '@react-navigation/native'
import NormalHeader from './../../../components/NormalHeader';
import { AppColors, responsiveWidth } from '../../../utils';
import { Image } from 'react-native';
import { images } from '../../../assets/images';
import AppText from '../../../components/AppText';
import LineBreak from '../../../components/LineBreak';
import HistoryCard from './../../../components/HistoryCard';

const profiles = [
    {
        id: 1,
        profImg: images.imageProf,
        username: 'Roland Hopper',
        price: '$79.00',
        status: 'Completed',
        designation: 'Pest Technician',
        rating: '3.5',
        time: '30',
        ml: '0.5',
        min: '5',
        isHideClose: false,
        isShowBadge: true,
    },
    {
        id: 2,
        profImg: images.imageProf,
        username: 'Roland Hopper',
        price: '$79.00',
        status: 'Completed',
        designation: 'Pest Technician',
        rating: '3.5',
        time: '30',
        ml: '0.5',
        min: '5',
        isHideClose: false,
        isShowBadge: false,
    },
    {
        id: 3,
        profImg: images.imageProf,
        username: 'Roland Hopper',
        price: '$79.00',
        status: 'Completed',
        designation: 'Pest Technician',
        rating: '3.5',
        time: '30',
        ml: '0.5',
        min: '5',
        isHideClose: false,
        isShowBadge: false,
    },
];

const Services = () => {
    const nav = useNavigation();
    const [selectedCard, setSelectedCard] = useState({ id: 1 });

    return (
        <Container>
            <NormalHeader
                heading={'technicians Profiles'}
                onBackPress={() => nav.goBack()}
            />
            <Image source={images.map} style={{ width: responsiveWidth(100) }} />

            <LineBreak val={2} />

            <View style={{ paddingHorizontal: responsiveWidth(4) }}>
                <AppText
                    title={'Nearby Profiles'}
                    color={AppColors.BLACK}
                    size={2.2}
                    fontWeight={'bold'}
                />

                <FlatList
                    data={profiles}
                    ListHeaderComponent={() => <LineBreak val={1} />}
                    ListFooterComponent={() => <LineBreak val={2} />}
                    ItemSeparatorComponent={() => <LineBreak val={2} />}
                    renderItem={({ item }) => {
                        return (
                            <HistoryCard
                                item={item}
                                selectedCard={selectedCard}
                                onCardPress={() => setSelectedCard({ id: item.id })}
                                services={'services'}
                                isHideClose={item.isHideClose}
                                isShowBadge={item.isShowBadge}
                                viewDetailsHandlePress={() => nav.navigate('ServicesProfile')}
                            />
                        );
                    }}
                />
            </View>
        </Container>
    )
}

export default Services