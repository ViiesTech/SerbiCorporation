import {  View } from 'react-native'
import { responsiveHeight } from '../utils'

const LineBreak = ({val}) => {
  return (
    <View style={{
      height: responsiveHeight(val)
    }} />
  )
}

export default LineBreak
