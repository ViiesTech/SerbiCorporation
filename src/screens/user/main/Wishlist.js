/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react'
import { FlatList } from 'react-native'
import Container from '../../../components/Container';
import { images } from '../../../assets/images';
import { useNavigation } from '@react-navigation/native';
import NormalHeader from '../../../components/NormalHeader';
import LineBreak from '../../../components/LineBreak';
import { responsiveWidth } from '../../../utils';
import HistoryCard from '../../../components/HistoryCard';

const cardData = [
    {
        id: 1,
        profImg: images.map,
        username: 'Roland Hopper',
        price: '$79.00',
        status: 'Completed',
        designation: 'Pest Technician',
        rating: '3.5',
    },
    {
        id: 2,
        profImg: images.map,
        username: 'Roland Hopper',
        price: '$79.00',
        status: 'Completed',
        designation: 'Pest Technician',
        rating: '3.5',
    },
    {
        id: 3,
        profImg: images.map,
        username: 'Roland Hopper',
        price: '$79.00',
        status: 'Completed',
        designation: 'Pest Technician',
        rating: '3.5',
    },
    {
        id: 4,
        profImg: images.map,
        username: 'Roland Hopper',
        price: '$79.00',
        status: 'Completed',
        designation: 'Pest Technician',
        rating: '3.5',
    },
    {
        id: 5,
        profImg: images.map,
        username: 'Roland Hopper',
        price: '$79.00',
        status: 'Completed',
        designation: 'Pest Technician',
        rating: '3.5',
    },
    {
        id: 6,
        profImg: images.map,
        username: 'Roland Hopper',
        price: '$79.00',
        status: 'Completed',
        designation: 'Pest Technician',
        rating: '3.5',
    },
    {
        id: 7,
        profImg: images.map,
        username: 'Roland Hopper',
        price: '$79.00',
        status: 'Completed',
        designation: 'Pest Technician',
        rating: '3.5',
    },
    {
        id: 8,
        profImg: images.map,
        username: 'Roland Hopper',
        price: '$79.00',
        status: 'Completed',
        designation: 'Pest Technician',
        rating: '3.5',
    },
];

const Wishlist = () => {
    const nav = useNavigation();
    const [selectedCard, setSelectedCard] = useState({ id: 1 });

    return (
        <Container>
            <NormalHeader heading={'Wishlist'} onBackPress={() => nav.goBack()} />
            <FlatList
                data={cardData}
                contentContainerStyle={{
                    paddingHorizontal: responsiveWidth(4),
                    gap: 15,
                }}
                ListHeaderComponent={() => <LineBreak val={1} />}
                ListFooterComponent={() => <LineBreak val={2} />}
                renderItem={({ item }) => {
                    return (
                        <HistoryCard
                            item={item}
                            selectedCard={selectedCard}
                            onCardPress={() => setSelectedCard({ id: item.id })}
                            favItem={'favItem'}
                            callOnPress={() => nav.navigate('CallAndChatHistory', { screen: 'cALL hISTORY' })}
                            chatOnPress={() => nav.navigate('CallAndChatHistory', { screen: 'cHAT hISTORY' })}
                        />
                    );
                }}
            />
        </Container>
    );
};

export default Wishlist;