/* eslint-disable eqeqeq */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react'
import { FlatList, TouchableOpacity, View } from 'react-native'
import Container from '../../../components/Container'
import NormalHeader from '../../../components/NormalHeader'
import LineBreak from '../../../components/LineBreak'
import { useNavigation } from '@react-navigation/native'
import { images } from '../../../assets/images'
import { AppColors, responsiveHeight, responsiveWidth } from '../../../utils'
import AppText from '../../../components/AppText'
import HistoryCard from '../../../components/HistoryCard'
import { colors } from '../../../assets/colors'

const tabData = [
    { id: 1, title: 'Upcoming Appointments' },
    { id: 2, title: 'Complete Appointments' },
];

const cardData = [
    {
        id: 1,
        profImg: images.map,
        username: 'Roland Hopper',
        price: '$79.00',
        status: 'Upcoming',
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
        status: 'Upcoming',
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
        status: 'Upcoming',
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
        status: 'Upcoming',
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
        status: 'Upcoming',
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
        status: 'Upcoming',
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
        status: 'Upcoming',
        designation: 'Pest Technician',
        rating: '3.5',
        location: 'California, United State',
        date: 'Tuesday, 11 March 2025 at 10:00 AM',
    },
    {
        id: 8,
        profImg: images.map,
        username: 'Roland Hopper',
        price: '$79.00',
        status: 'Upcoming',
        designation: 'Pest Technician',
        rating: '3.5',
        location: 'California, United State',
        date: 'Tuesday, 11 March 2025 at 10:00 AM',
    },
];

const cardTwoData = [
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
        designation: 'Pest Technician',
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
        designation: 'Pest Technician',
        rating: '3.5',
        location: 'California, United State',
        date: 'Tuesday, 11 March 2025 at 10:00 AM',
    },
];

const Appointments = () => {
    const nav = useNavigation();
    const [selectedTab, setSelectedTab] = useState({ id: 1 });
    const [selectedCard, setSelectedCard] = useState({ id: 1 });

    return (
        <Container>
            <NormalHeader heading={'Appointments'} onBackPress={() => nav.goBack()} />
            <LineBreak val={2} />
            <View>
                <FlatList
                    data={tabData}
                    horizontal
                    contentContainerStyle={{ flex: 1, justifyContent: 'center', gap: 10 }}
                    renderItem={({ item }) => {
                        return (
                            <TouchableOpacity
                                style={{
                                    backgroundColor:
                                        selectedTab.id == item.id
                                            ? colors.primary
                                            : AppColors.WHITE,
                                    paddingHorizontal: responsiveWidth(5),
                                    paddingVertical: responsiveHeight(1.2),
                                    borderRadius: 20,
                                }}
                                onPress={() => setSelectedTab({ id: item.id })}>
                                <AppText
                                    title={item.title}
                                    color={AppColors.BLACK}
                                    size={1.6}
                                    fontWeight={'bold'}
                                />
                            </TouchableOpacity>
                        );
                    }}
                />

                <LineBreak val={2} />

                {selectedTab.id == 1 && (
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
                                    activeCardBgColor={AppColors.PRIMARY}
                                />
                            );
                        }}
                    />
                )}

                {selectedTab.id == 2 && (
                    <FlatList
                        data={cardTwoData}
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
                                    activeCardBgColor={AppColors.PRIMARY}
                                />
                            );
                        }}
                    />
                )}
            </View>
        </Container>
    );
};

export default Appointments;