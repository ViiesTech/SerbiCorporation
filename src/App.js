import React, { useEffect } from 'react';
import Routes from './routes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { persistor, store } from './redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import { LogBox } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { CLIENT_ID, STRIPE_KEY } from './redux/constant';
import { StripeProvider } from '@stripe/stripe-react-native';

GoogleSignin.configure({
  webClientId: CLIENT_ID,
});

const App = () => {
  useEffect(() => {
    LogBox.ignoreAllLogs();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaView style={{ flex: 1 }}>
          <StripeProvider publishableKey={STRIPE_KEY}>
            <Routes />
          </StripeProvider>
        </SafeAreaView>
      </PersistGate>
    </Provider>
  );
};

export default App;
