import React, { useState, useCallback, Component } from 'react';
import {
  View,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Text,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-simple-toast';
import { useLazyGetStripeConnectStatusQuery } from '../redux/services';
import { responsiveFontSize, responsiveWidth } from '../utils';
import { colors } from '../assets/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

class WebViewErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.log('WebView load error / Native module missing:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const BrowserFallback = ({ onboardingUrl, onSync }) => {
  return (
    <View style={styles.fallbackContainer}>
      <View style={styles.fallbackCard}>
        <View style={styles.fallbackIconWrap}>
          <Ionicons name="card-outline" size={36} color="#0F172A" />
        </View>

        <Text style={styles.fallbackTitle}>Stripe Connect Setup</Text>
        <Text style={styles.fallbackDesc}>
          Complete your bank account and identity verification on Stripe's
          secure portal.
        </Text>

        <TouchableOpacity
          style={styles.primaryActionBtn}
          onPress={() => {
            if (onboardingUrl) {
              Linking.openURL(onboardingUrl);
            }
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="open-outline" size={18} color="#000000" />
          <Text style={styles.primaryActionBtnText}>Open Setup in Browser</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryActionBtn}
          onPress={onSync}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh" size={18} color="#2563EB" />
          <Text style={styles.secondaryActionBtnText}>
            Sync Verification Status
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const StripeOnboardingScreen = ({ navigation, route }) => {
  const { onboardingUrl } = route?.params || {};
  const [loading, setLoading] = useState(true);
  const [fetchStatus] = useLazyGetStripeConnectStatusQuery();

  const handleNavigationStateChange = useCallback(
    async navState => {
      const { url } = navState;
      if (!url) return;

      // When Stripe redirects after completing onboarding
      if (url.includes('/stripe-connect/return')) {
        try {
          const res = await fetchStatus().unwrap();
          if (res?.stripeConnect?.isConnected) {
            Alert.alert(
              'Success',
              'Bank account connected successfully! You are now set up to receive direct payouts.',
              [{ text: 'OK', onPress: () => navigation.goBack() }],
            );
          } else {
            Alert.alert(
              'Details Submitted',
              'Your details have been submitted to Stripe and are under verification.',
              [{ text: 'OK', onPress: () => navigation.goBack() }],
            );
          }
        } catch (err) {
          console.log('Error syncing Stripe status:', err);
          Toast.show('Details submitted. Verification pending.', Toast.SHORT);
          navigation.goBack();
        }
        return;
      }

      // If session expired or refreshed
      if (url.includes('/stripe-connect/refresh')) {
        Alert.alert(
          'Session Expired',
          'The onboarding link expired. Please generate a new link to continue.',
          [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
      }
    },
    [fetchStatus, navigation],
  );

  const handleOpenBrowser = useCallback(() => {
    if (onboardingUrl) {
      Linking.openURL(onboardingUrl);
    }
  }, [onboardingUrl]);

  const handleSyncStatus = useCallback(async () => {
    try {
      const res = await fetchStatus().unwrap();
      if (res?.stripeConnect?.isConnected) {
        Alert.alert(
          'Success',
          'Bank account connected successfully! You are now set up to receive direct payouts.',
          [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
      } else {
        Alert.alert(
          'Verification Pending',
          'Your details have been submitted. If you finished all Stripe steps in your browser, verification may take a few moments.',
        );
      }
    } catch (err) {
      Toast.show('Unable to sync status at this moment.', Toast.SHORT);
    }
  }, [fetchStatus, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stripe Account Setup</Text>
        <TouchableOpacity
          style={styles.browserHeaderBtn}
          onPress={handleOpenBrowser}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="open-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* WebView */}
      <View style={styles.webViewWrapper}>
        {onboardingUrl ? (
          <WebViewErrorBoundary
            fallback={
              <BrowserFallback
                onboardingUrl={onboardingUrl}
                onSync={handleSyncStatus}
              />
            }
          >
            <WebView
              source={{ uri: onboardingUrl }}
              onNavigationStateChange={handleNavigationStateChange}
              onLoadEnd={() => setLoading(false)}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.loaderCenter}>
                  <ActivityIndicator size="large" color="#000000" />
                </View>
              )}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          </WebViewErrorBoundary>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.errorText}>No onboarding link provided.</Text>
          </View>
        )}

        {loading && (
          <View style={styles.loaderCenter}>
            <ActivityIndicator size="large" color="#000000" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default StripeOnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveWidth(4),
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  browserHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: responsiveFontSize(1.8),
    fontWeight: '700',
    color: '#0F172A',
  },
  webViewWrapper: {
    flex: 1,
    position: 'relative',
  },
  loaderCenter: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: responsiveFontSize(1.6),
    color: '#64748B',
  },
  fallbackContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(6),
  },
  fallbackCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  fallbackIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(247, 200, 69, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  fallbackTitle: {
    fontSize: responsiveFontSize(2),
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  fallbackDesc: {
    fontSize: responsiveFontSize(1.4),
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    width: '100%',
    marginBottom: 12,
  },
  primaryActionBtnText: {
    fontSize: responsiveFontSize(1.5),
    fontWeight: '700',
    color: '#000000',
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    paddingVertical: 14,
    width: '100%',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  secondaryActionBtnText: {
    fontSize: responsiveFontSize(1.5),
    fontWeight: '700',
    color: '#1D4ED8',
  },
});
