import { Image } from 'react-native'
import Container from '../../components/Container'
import Button from '../../components/Button'
import LineBreak from '../../components/LineBreak'
import { colors } from '../../assets/colors'
import { images } from '../../assets/images'
import { responsiveHeight } from '../../utils'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'

const SelectType = () => {
  const navigation = useNavigation()

  const onSelectType = async (type) => {
        await AsyncStorage.setItem('type',type)
        navigation.navigate('Signup')
  }

  return (
        <Container space={12} authHeading={true}>
                <Image resizeMode='cover' style={{height: responsiveHeight(30),width: responsiveHeight(30),alignSelf: 'center'}} source={images.logo} />
                <Button onPress={() => onSelectType('Technician')} title={'TECHNICIAN'} color={colors.secondary_button} />
            <LineBreak val={2} />
                <Button onPress={() => onSelectType('User')} title={'USER'} color={colors.primary} />
        </Container>
  )
}

export default SelectType
