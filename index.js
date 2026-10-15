/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import { getFirebaseMessaging, backgroundMessageHandler } from './src/config/Firebase';

// Register background message handler for FCM
getFirebaseMessaging().setBackgroundMessageHandler(backgroundMessageHandler);

AppRegistry.registerComponent(appName, () => App);
