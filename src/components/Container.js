import React, { forwardRef, useState, useEffect, useRef } from 'react';
import { Platform, ScrollView, StyleSheet, View, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from './AppText';
import { colors } from '../assets/colors';
import LineBreak from './LineBreak';

const Container = forwardRef(
  (
    {
      children,
      scrollEnabled = true, // Default to true to match previous behavior
      showScrollIndicator = false,
      contentStyle,
      style,
      authHeading,
      space,
      extraStyle,
      keyboardShouldPersistTaps = 'handled',
      keyboardDismissMode = 'on-drag',
    },
    ref,
  ) => {
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [layoutHeight, setLayoutHeight] = useState(0);
    const maxLayoutHeightRef = useRef(0);

    useEffect(() => {
      const showEvent =
        Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
      const hideEvent =
        Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

      const showSub = Keyboard.addListener(showEvent, e => {
        setKeyboardHeight(e.endCoordinates.height);
      });
      const hideSub = Keyboard.addListener(hideEvent, () => {
        setKeyboardHeight(0);
      });

      return () => {
        showSub.remove();
        hideSub.remove();
      };
    }, []);

    const handleLayout = e => {
      const { height } = e.nativeEvent.layout;
      if (height > maxLayoutHeightRef.current) {
        maxLayoutHeightRef.current = height;
      }
      setLayoutHeight(height);
    };

    // Detect if Android window was resized by the OS
    const hasWindowResized =
      Platform.OS === 'android' &&
      layoutHeight > 0 &&
      maxLayoutHeightRef.current - layoutHeight >= keyboardHeight * 0.6;

    // If window did NOT resize (e.g. gesture navigation), add keyboardHeight + 80.
    // If window DID resize, add 80px buffer so the bottom elements have breathing room.
    const dynamicKeyboardPadding =
      Platform.OS === 'android'
        ? keyboardHeight > 0
          ? hasWindowResized
            ? 50
            : keyboardHeight
          : 0
        : 0;

    const flattenedContentStyle = StyleSheet.flatten(contentStyle) || {};
    const basePaddingBottom = flattenedContentStyle.paddingBottom || 0;

    return (
      <SafeAreaView
        style={[styles.safeArea, extraStyle]}
        onLayout={handleLayout}
      >
        {scrollEnabled ? (
          <ScrollView
            ref={ref}
            style={[styles.baseStyle, style]}
            contentContainerStyle={[
              styles.defaultContentContainer,
              contentStyle,
              dynamicKeyboardPadding > 0 && {
                paddingBottom: basePaddingBottom + dynamicKeyboardPadding,
              },
            ]}
            scrollEnabled={true}
            showsVerticalScrollIndicator={showScrollIndicator}
            keyboardShouldPersistTaps={keyboardShouldPersistTaps}
            keyboardDismissMode={keyboardDismissMode}
            nestedScrollEnabled={true}
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
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
        ) : (
          <View ref={ref} style={[styles.baseStyle, style]}>
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
          </View>
        )}
      </SafeAreaView>
    );
  },
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  baseStyle: {
    flex: 1,
    backgroundColor: colors.white,
  },
  defaultContentContainer: {
    flexGrow: 1,
  },
});

export default Container;
