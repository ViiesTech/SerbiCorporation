import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from './AppText';
import { colors } from '../assets/colors';
import LineBreak from './LineBreak';

const Container = ({
  children,
  scrollEnabled = true, // Default to true to match previous behavior
  showScrollIndicator = false,
  contentStyle,
  style,
  authHeading,
  space,
  extraStyle,
  keyboardShouldPersistTaps = 'always',
}) => {
  // Logic: If scrollEnabled is false, we use a View instead of a ScrollView
  // to prevent nesting conflicts with FlatLists.
  const ContentWrapper = scrollEnabled ? ScrollView : View;

  return (
    <SafeAreaView style={[styles.safeArea, extraStyle]}>
      <ContentWrapper
        style={[styles.baseStyle, style]}
        contentContainerStyle={scrollEnabled ? contentStyle : undefined}
        scrollEnabled={scrollEnabled}
        showsVerticalScrollIndicator={showScrollIndicator}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
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
      </ContentWrapper>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  baseStyle: {
    flex: 1,
    backgroundColor: colors.white,
  },
});

export default Container;
