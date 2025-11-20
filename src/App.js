import React, { useEffect } from 'react';
import Routes from './routes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { persistor, store } from './redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import { LogBox } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { CLIENT_ID } from './redux/constant';

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
          <Routes />
        </SafeAreaView>
      </PersistGate>
    </Provider>
  );
};

export default App;
