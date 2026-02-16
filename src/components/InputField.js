import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../assets/colors';
import { responsiveHeight, responsiveWidth } from '../utils';
import Icon from 'react-native-vector-icons/MaterialIcons';

const InputField = ({
  style,
  innerStyle,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  length,
  editable,
  secureTextEntry,
  width,
  icon,
  onLocationPress,
  rightIcon,
}) => {
  return (
    <View
      style={[
        styles.inputStyle,
        {
          width: responsiveWidth(width || 88),
          flexDirection: 'row',
          alignItems: 'center',
        },
        style,
      ]}
    >
      <TextInput
        placeholder={placeholder}
        value={value}
        style={[
          styles.input,
          innerStyle,
          { width: responsiveWidth(icon || rightIcon ? 75 : 80) },
        ]}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        maxLength={length}
        secureTextEntry={secureTextEntry}
        editable={editable}
      />
      {icon && (
        <TouchableOpacity onPress={onLocationPress}>
          <Icon name="my-location" size={22} color={colors.primary} />
        </TouchableOpacity>
      )}
      {rightIcon && <View>{rightIcon}</View>}
    </View>
  );
};

export default InputField;

const styles = StyleSheet.create({
  inputStyle: {
    backgroundColor: colors.input_color,
    alignSelf: 'center',
    borderRadius: 10,
    borderWidth: 0.2,
    borderColor: colors.black,
    paddingHorizontal: responsiveHeight(1.5),
    padding: responsiveHeight(1),
  },
  input: {
    height: responsiveHeight(4),
    color: colors.black,
    width: responsiveWidth(80),
  },
});
