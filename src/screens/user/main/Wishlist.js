import React, { useEffect, useState } from 'react'
import { FlatList } from 'react-native'
import Container from '../../../components/Container';
// import { images } from '../../../assets/images';
import { useNavigation } from '@react-navigation/native';
import NormalHeader from '../../../components/NormalHeader';
import LineBreak from '../../../components/LineBreak';
import { responsiveHeight, responsiveWidth } from '../../../utils';
import HistoryCard from '../../../components/HistoryCard';
import { useLazyGetAllWishlistsQuery } from '../../../redux/services';
import { useSelector } from 'react-redux';
import Loader from '../../../components/Loader';
import AppText from '../../../components/AppText';
import { IMAGE_URL } from '../../../redux/constant';

const cardData = [
    {
        id: 1,
        // profImg: images.map,
        username: 'Roland Hopper',
        price: '$79.00',
        status: 'Completed',
        designation: 'Pest Technician',
        rating: '3.5',
    },
    {
        id: 2,
        // profImg: images.map,
        username: 'Roland Hopper',
        price: '$79.00',
        status: 'Completed',
        designation: 'Pest Technician',
        rating: '3.5',
    },
    {
        id: 3,
        // profImg: images.map,
        username: 'Roland Hopper',
        price: '$79.00',
        status: 'Completed',
        designation: 'Pest Technician',
        rating: '3.5',
    },
    {
        id: 4,
        // profImg: images.map,
        username: 'Roland Hopper',
        price: '$79.00',
        status: 'Completed',
        designation: 'Pest Technician',
        rating: '3.5',
    },
    {
        id: 5,
        // profImg: images.map,
        username: 'Roland Hopper',
        price: '$79.00',
        status: 'Completed',
        designation: 'Pest Technician',
        rating: '3.5',
    },
    {
        id: 6,
        // profImg: images.map,
        username: 'Roland Hopper',
        price: '$79.00',
        status: 'Completed',
        designation: 'Pest Technician',
        rating: '3.5',
    },
    {
        id: 7,
        // profImg: images.map,
        username: 'Roland Hopper',
        price: '$79.00',
        status: 'Completed',
        designation: 'Pest Technician',
        rating: '3.5',
    },
    {
        id: 8,
        // profImg: images.map,
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
    const [getAllWishlists,{data,isLoading}] = useLazyGetAllWishlistsQuery()
    const {_id} = useSelector(state => state.persistedData.user)

    console.log('data ===>',data)

    useEffect(() => {

        getAllWishlists(_id)

    },[])

    return (
        <Container>
            <NormalHeader heading={'Wishlist'} onBackPress={() => nav.goBack()} />
             {isLoading ?   
                        <Loader style={{marginVertical: responsiveHeight(3)}} />
                : !data?.success ?
                        <AppText align={'center'} title={data?.msg} />
                    :
            <FlatList
                data={data?.data}
                contentContainerStyle={{
                    paddingHorizontal: responsiveWidth(4),
                    gap: 15,
                }}
                ListHeaderComponent={() => <LineBreak val={1} />}
                ListFooterComponent={() => <LineBreak val={2} />}
                renderItem={({ item }) => {
                    // alert(item._id)
                    return (
                        <HistoryCard
                            item={{
                                profImg: `${IMAGE_URL}${item.technicianId?.profileImage}`,
                                price: `$${item.technicianId?.price.toFixed(2)}`,
                                username: item.technicianId?.fullName,
                                rating: item.technicianId?.avgRating || 0,
                                designation: `${item.technicianId?.service.name} Technician`
                            }}
                            favourite={true}
                            selectedCard={selectedCard}
                            onCardPress={() => setSelectedCard({ id: item._id })}
                            favItem={'favItem'}
                            callOnPress={() => nav.navigate('CallAndChatHistory', { screen: 'cALL hISTORY' })}
                            chatOnPress={() => nav.navigate('CallAndChatHistory', { screen: 'cHAT hISTORY' })}
                        />
                    );
                }}
            />
            }
        </Container>
    );
};

export default Wishlist;