/* eslint-disable react-native/no-inline-styles */
import {  View } from 'react-native'
import { responsiveHeight } from '../utils'

const LineBreak = ({val}) => {
  return (
    <View 
    style={{
        height: responsiveHeight(val),
        opacity: 0,
        overflow: 'visible',
        zIndex: 0,
      }}
    />
  )
}

export default LineBreak
