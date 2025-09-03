import { StatusBar } from 'react-native';
import { colors } from '../assets/colors';

const AppStatusBar = ({ bgColor, barStyle }) => {
  return (
    <StatusBar
      backgroundColor={bgColor || colors.white}
      barStyle={barStyle || 'dark-content'}
    />
  );
};

export default AppStatusBar;
