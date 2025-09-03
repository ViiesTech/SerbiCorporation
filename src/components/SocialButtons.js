import { StyleSheet, View } from 'react-native'
import AppText from './AppText'
import LineBreak from './LineBreak'
import Button from './Button'
import { colors } from '../assets/colors'
import SVGIcon from './SVGIcon'
import icons from '../assets/icons'

const SocialButtons = ({heading,onSocialPress}) => {
  return (
    <View style={styles.wrapper}>
        <AppText title={heading} />
        <LineBreak val={3.5} />
        <Button icon={
          <SVGIcon width={50} xml={icons.facebook} /> 
        } onPress={() => onSocialPress('facebook')} style={{
          borderRadius: 10,
          alignItems: 'center',
        
        }} titleColour={colors.white} color={colors.social_color1} title={'Continue with Facebook'} />
        <LineBreak val={2} />
        <Button icon={
          <SVGIcon width={50} xml={icons.google} /> 
        } onPress={() => onSocialPress('google')} style={{
          borderWidth: 0.5,
          borderColor: colors.black,
          borderRadius: 10,
          alignItems: 'center', 
        }} color={'transparent'} title={'Continue with Google'} />
    </View>
  )
}

export default SocialButtons

const styles = StyleSheet.create({
  wrapper:{
    alignItems: 'center'
  }
})