import { StyleSheet, TouchableOpacity, View } from 'react-native';
import AppText from './AppText';
import { colors } from '../assets/colors';
import { responsiveHeight, responsiveWidth } from '../utils';

const Button = ({ onPress, title, style, textTransform, titleColour, width, color,icon }) => {
  return (
    <TouchableOpacity
      style={[
        styles.buttonStyle,
        {
          width: responsiveWidth(width || 85),
          backgroundColor: color || colors.primary,
        },
        style,
      ]}
      onPress={onPress}
    >
      
    <View style={{flexDirection: icon && 'row'}}>  
      {icon}
      <AppText
        color={titleColour}
        size={1.9}
        fontWeight={'bold'}
        align={'center'}
        textTransform={textTransform}
        title={title}
      /> 
      </View>
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  buttonStyle: {
    padding: responsiveHeight(2),
    borderRadius: 30,
    alignSelf: 'center',
  },
});
