import React from 'react'
import { View, Text } from 'react-native'
import Container from '../../../components/Container'
import { useNavigation } from '@react-navigation/native';
import NormalHeader from '../../../components/NormalHeader';
import LineBreak from '../../../components/LineBreak';
import { AppColors, responsiveWidth } from '../../../utils';
import { images } from '../../../assets/images';
import HistoryCard from '../../../components/HistoryCard';

const ServicesProfile = () => {
    const nav = useNavigation();

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
            </View>
            <LineBreak val={2} />
            <Text>ServicesProfile</Text>
        </Container>
    )
}

export default ServicesProfile