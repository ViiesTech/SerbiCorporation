import React, { useEffect, useState } from 'react';
import Routes from './routes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { persistor, store } from './redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import { LogBox } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { CLIENT_ID, IOS_CLIENT_ID, STRIPE_KEY } from './redux/constant';
import { StripeProvider } from '@stripe/stripe-react-native';
import NetInfo from '@react-native-community/netinfo';
import OfflineModal from './components/OfflineModal';

GoogleSignin.configure({
  webClientId: CLIENT_ID,
  iosClientId: IOS_CLIENT_ID,
  offlineAccess: true,
  scopes: ['profile', 'email'],
});

const App = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    LogBox.ignoreAllLogs();

    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaView style={{ flex: 1 }}>
          <StripeProvider publishableKey={STRIPE_KEY}>
            <Routes />
            <OfflineModal visible={isOffline} />
          </StripeProvider>
        </SafeAreaView>
      </PersistGate>
    </Provider>
  );
};

export default App;
