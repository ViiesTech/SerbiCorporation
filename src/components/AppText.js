import { Text } from 'react-native'
import React from 'react'
import { colors } from '../assets/colors'
import { responsiveFontSize, responsiveWidth } from '../utils'

const AppText = ({ fontWeight, size, color, title, align, textTransform, textWidth }) => {
  return (
    <Text style={{ textAlign: align, color: color || colors.black, fontSize: responsiveFontSize(size || 2), width: responsiveWidth(textWidth), textTransform: textTransform, fontWeight: fontWeight }}>{title}</Text>
  )
}

export default AppText
