import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from '../utils'
import { colors } from '../assets/colors'
import { images } from '../assets/images'

const Card = ({ type, cardHolder, expiry, cardNumber, onCardPress,borderColor }) => {
  return (
    <TouchableOpacity onPress={onCardPress} style={[styles.cardContainer,{borderColor: borderColor}]}>
      <Text style={styles.cardHolder}>{cardHolder}</Text>
      <Text style={styles.cardHolder}>{expiry}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.cardHolder}>{cardNumber}</Text>
        <Image style={[styles.imageStyle, type === 'mastercard' && { height: responsiveHeight(4), width: responsiveHeight(6.5) }]} source={type === 'visa' ? images.visa : type === 'mastercard' ? images.mastercard : images.express} />
      </View>
    </TouchableOpacity>
  )
}

export default Card

const styles = StyleSheet.create({
  cardContainer: {
    paddingHorizontal: responsiveHeight(3),
    marginBottom: responsiveHeight(4),
    paddingVertical: responsiveHeight(2),
    width: responsiveWidth(87),
    borderWidth: 3,
    borderColor: colors.secondary_button,
    borderRadius: 15,
  },
  cardHolder: {
    color: colors.black,
    fontWeight: 'bold',
    marginBottom: responsiveHeight(2),
    fontSize: responsiveFontSize(2.5)
  },
  imageStyle: {
    height: responsiveHeight(3),
    width: responsiveHeight(5.5),
    alignSelf: 'flex-end',
  }
})