import { ActivityIndicator } from 'react-native';
import { colors } from '../assets/colors';

const Loader = ({ size, color, style }) => {
  return (
    <ActivityIndicator
      size={size || 'small'}
      color={color || colors.black}
      style={[{ alignSelf: 'center' }, style]}
    />
  );
};

export default Loader;
