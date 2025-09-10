/* eslint-disable react-native/no-inline-styles */
import { FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { AppColors, responsiveHeight, responsiveWidth } from './../../../utils/index';
import { images } from '../../../assets/images';
import AppText from '../../../components/AppText';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import SVGIcon from '../../../components/SVGIcon';
import icons from '../../../assets/icons'
import AppTextInput from '../../../components/AppTextInput';
import LineBreak from '../../../components/LineBreak';
import HistoryCard from './../../../components/HistoryCard';

const Home = ({ navigation }) => {
  const data = [
    { id: 1, title: 'TODAY' },
    { id: 2, title: 'YESTERDAY' },
    { id: 3, title: 'COMPLETE' },
    { id: 4, title: 'UPCOMING' },
  ]
  const [currentCategory, setCurrentCategory] = useState('TODAY');
  const [currentCard, setCurrentCard] = useState('Roland Hopper');
  const cardsData = [
    { id: 1, title: 'Roland Hopper' },
    { id: 2, title: 'Alexis Clark' },
    { id: 3, title: 'Richard h.' },
    { id: 4, title: 'dakota west' },
    { id: 5, title: 'LEon Carroll' },
  ]
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ backgroundColor: '#f8f9fd', flexGrow: 1, padding: responsiveHeight(2) }}>
      <View style={{ flexDirection: "row", marginBottom: 20, justifyContent: "space-between", alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', gap: responsiveHeight(2), alignItems: 'center' }}>
          <Image style={{ width: responsiveWidth(16.4), height: responsiveHeight(7.5) }} source={images.profile} />
          <View>
            <View style={{ flexDirection: 'row', gap: responsiveHeight(1) }}>
              <AppText title="GOOD MORNING!" />
              <SVGIcon height={20} width={20} xml={icons.plant} />
            </View>
            <View style={{ flexDirection: 'row', gap: responsiveHeight(0.5) }}>
              <SVGIcon height={20} width={20} xml={icons.locationPin} />
              <AppText color={'#777777'} title="California, United State" />
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: responsiveHeight(1.5) }}>
          <TouchableOpacity onPress={() => navigation.navigate('AppSettings')}>
            <Feather name="settings" size={25} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Feather name="user" size={25} />
          </TouchableOpacity>
        </View>
      </View>

      <AppTextInput inputWidth={77} rightIcon={<Ionicons name="search-outline" size={25} />} inputPlaceHolder="What are you looking for?" placeholderTextColor="#777777" borderRadius={25} />
      <LineBreak val={2} />
      <AppText title="APPOINTMENTS" fontWeight="bold" size={2.4} />
      <View>
        <FlatList showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: responsiveHeight(1), marginTop: responsiveHeight(1) }} data={data} horizontal renderItem={({ item, index }) => {
          return (
            <TouchableOpacity onPress={() => setCurrentCategory(item.title)} style={{ backgroundColor: item.title === currentCategory ? '#000' : '#fff', borderWidth: 1, borderColor: '#000', borderRadius: responsiveHeight(3), padding: responsiveHeight(0.8) }}>
              <AppText color={item.title === currentCategory ? '#fff' : '#000'} title={item.title} />
            </TouchableOpacity>
          )
        }} />
      </View>
      <View style={{ marginTop: responsiveHeight(2) }}>
        <FlatList contentContainerStyle={{ gap: responsiveHeight(2) }} data={cardsData} renderItem={({ item, index }) => {
          return (
            <HistoryCard
              onCardPress={() => {
                setCurrentCard(item.id)
                navigation.navigate('Services')
              }}
              item={{
                id: item.id,
                profImg: images.imageProf,
                username: item.title,
                designation: 'Expert Gerdener',
                rating: '3.5',
                time: '30',
              }}
              selectedCard={{ id: currentCard }}
              activeCardBgColor={item.id === currentCard ? AppColors.PRIMARY : AppColors.WHITE}
              profiles={'profiles'}
              isHideClose={false}
              isShowBadge={true}
              viewDetailsHandlePress={() => navigation.navigate('Services')}
            />
          )
        }} />

      </View>
    </ScrollView>
  )
}

export default Home

const styles = StyleSheet.create({})