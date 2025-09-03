import { StyleSheet, TextInput, View } from 'react-native'
import { colors } from '../assets/colors'
import { responsiveHeight, responsiveWidth } from '../utils'

const InputField = ({style,innerStyle,placeholder, value,onChangeText,keyboardType,length,editable,secureTextEntry,width}) => {
  return (
    <View style={[styles.inputStyle,{width: width || responsiveWidth(88)},style]}>
        <TextInput 
          placeholder={placeholder}
          value={value}
          style={[styles.input,innerStyle]}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          maxLength={length}
          secureTextEntry={secureTextEntry}
          editable={editable}
        />
    </View>
  )
}

export default InputField

const styles = StyleSheet.create({
  inputStyle:{
    backgroundColor: colors.input_color,
    alignSelf: 'center',
    borderRadius: 10,
    borderWidth: 0.2,
    borderColor: colors.black,
    paddingHorizontal: responsiveHeight(1.5),
    padding: responsiveHeight(1)
  },
  input:{
    color: colors.black,
    width: responsiveWidth(80)
  }
})