import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from './AppText';
import { colors } from '../assets/colors';
import LineBreak from './LineBreak';

const Container = ({
  children,
  scrollEnabled,
  showScrollIndicator = false,
  contentStyle,
  style,
  authHeading,
  space,
}) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={contentStyle}
        style={[{ backgroundColor: colors.white }, style]}
        scrollEnabled={scrollEnabled}
        showsVerticalScrollIndicator={showScrollIndicator}
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled={true}
      >
        {authHeading && (
          <>
            <LineBreak val={space} />
            <AppText
              align={'center'}
              fontWeight={'bold'}
              size={3.3}
              title={authHeading}
            />
          </>
        )}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Container;
