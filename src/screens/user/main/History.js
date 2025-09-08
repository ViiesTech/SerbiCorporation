/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react'
import { FlatList } from 'react-native'
import Container from '../../../components/Container'
import { useNavigation } from '@react-navigation/native';
import NormalHeader from '../../../components/NormalHeader';
import LineBreak from '../../../components/LineBreak';
import { images } from '../../../assets/images';
import HistoryCard from '../../../components/HistoryCard';
import { responsiveWidth } from '../../../utils';

const cardData = [
    {
        id: 1,
        profImg: images.map,
        username: 'Roland Hopper',
        price: '$79.00',
        status: 'Completed',
        designation: 'Pest Technician',
        rating: '3.5',
        location: 'California, United State',
        date: 'Tuesday, 11 March 2025 at 10:00 AM',
    },
    {
        id: 2,
        profImg: images.map,
        username: 'Roland Hopper',
        price: '$79.00',
        status: 'Completed',
        designation: 'Pest Technician',
        rating: '3.5',
        location: 'California, United State',
        date: 'Tuesday, 11 March 2025 at 10:00 AM',
    },
    {
        id: 3,
        profImg: images.map,
        username: 'Roland Hopper',
        price: '$79.00',
        status: 'Completed',
        designation: 'Pest Technician',
        rating: '3.5',
        location: 'California, United State',
        date: 'Tuesday, 11 March 2025 at 10:00 AM',
    },
    {
        id: 4,
        profImg: images.map,
        username: 'Roland Hopper',
        price: '$79.00',
        status: 'Completed',
        designation: 'Pest Technician',
        rating: '3.5',
        location: 'California, United State',
        date: 'Tuesday, 11 March 2025 at 10:00 AM',
    },
    {
        id: 5,
        profImg: images.map,
        username: 'Roland Hopper',
        price: '$79.00',
        status: 'Completed',
        designation: 'Pest Technician',
        rating: '3.5',
        location: 'California, United State',
        date: 'Tuesday, 11 March 2025 at 10:00 AM',
    },
    {
        id: 6,
        profImg: images.map,
        username: 'Roland Hopper',
        price: '$79.00',
        status: 'Completed',
        designation: 'Pest Technician',
        rating: '3.5',
        location: 'California, United State',
        date: 'Tuesday, 11 March 2025 at 10:00 AM',
    },
    {
        id: 7,
        profImg: images.map,
        username: 'Roland Hopper',
        price: '$79.00',
        status: 'Completed',
        designation: 'Gardener',
        rating: '3.5',
        location: 'California, United State',
        date: 'Tuesday, 11 March 2025 at 10:00 AM',
    },
    {
        id: 8,
        profImg: images.map,
        username: 'Roland Hopper',
        price: '$79.00',
        status: 'Completed',
        designation: 'Gardener',
        rating: '3.5',
        location: 'California, United State',
        date: 'Tuesday, 11 March 2025 at 10:00 AM',
    },
];

const History = () => {
    const nav = useNavigation();
    const [selectedCard, setSelectedCard] = useState({ id: 1 });

    return (
        <Container>
            <NormalHeader heading={'History'} onBackPress={() => nav.goBack()} />
            <LineBreak val={2} />
            <FlatList
                data={cardData}
                contentContainerStyle={{
                    paddingHorizontal: responsiveWidth(4),
                    gap: 15,
                }}
                ListFooterComponent={() => <LineBreak val={2} />}
                renderItem={({ item }) => {
                    return (
                        <HistoryCard
                            item={item}
                            selectedCard={selectedCard}
                            onCardPress={() => setSelectedCard({ id: item.id })}
                        />
                    );
                }}
            />
        </Container>
    );
};

export default History;