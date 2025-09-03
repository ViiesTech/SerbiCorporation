import { Text } from 'react-native'
import React from 'react'
import { colors } from '../assets/colors'
import { responsiveFontSize } from '../utils'

const AppText = ({fontWeight,size,color,title,align}) => {
  return (
      <Text style={{textAlign: align, color: color || colors.black,fontSize: responsiveFontSize(size || 2),fontWeight: fontWeight}}>{title}</Text>
  )
}

export default AppText
