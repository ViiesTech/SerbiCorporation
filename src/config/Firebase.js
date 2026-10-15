import {
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  onTokenRefresh,
  registerDeviceForRemoteMessages,
  isDeviceRegisteredForRemoteMessages,
  getAPNSToken,
} from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import notifee, {
  AndroidImportance,
  EventType,
  AuthorizationStatus as NotifeeAuthorizationStatus,
} from '@notifee/react-native';
import axios from 'axios';
import { store } from '../redux/store';
import { navigationRef } from '../routes';
import { BASE_URL, endpoints } from '../redux/constant';

export const NOTIFICATION_CHANNEL_ID = 'serbi_notifications';

// Ensure Firebase Messaging Instance
export function getFirebaseMessaging() {
  return getMessaging();
}

function navigateSafely(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    setTimeout(() => {
      navigateSafely(name, params);
    }, 500);
  }
}

export function handleNotificationClick(remoteMessage) {
  if (!remoteMessage) return;

  const data = remoteMessage.data || {};
  const type = (data.type || data.notification_type || '').toLowerCase();
  const action = (data.action || '').toLowerCase();
  const formId = data.formId || data.form_id || data.requestFormId;
  const status = data.status || '';
  const chatId = data.chatId || data.chat_id;
  const senderId =
    data.senderId ||
    data.sender ||
    data.receiverId ||
    data.recipientId ||
    data.otherUserId;
  const name =
    data.name ||
    data.senderName ||
    data.userName ||
    data.title ||
    remoteMessage.notification?.title ||
    'Chat';

  const persisted = store.getState()?.persistedData;
  const role = persisted?.user?.type;
  const token = persisted?.token;

  if (!token) return;

  // 1. Chat Message Notification (Event 3: type === "chat")
  if (type === 'chat' || type === 'message') {
    navigateSafely('Chat', {
      otherUserId: senderId,
      userName: name,
      chatId,
    });
    return;
  }

  // 2. Service Request / Booking Notifications (Event 1 & 2: type === "request")
  if (type === 'request' || type === 'booking' || type === 'appointment' || type === 'job') {
    if (role === 'Technician') {
      // Event 1: New Service Request -> navigate technician to Home / Requests
      if (action === 'create' || action === 'new') {
        navigateSafely('VendorRoutes', {
          screen: 'Home',
          params: { formId, currentCategory: 'REQUESTED' },
        });
      } else {
        navigateSafely('VendorRoutes', {
          screen: 'Home',
          params: { formId, status },
        });
      }
    } else {
      // Event 2: Booking Status Updated -> navigate customer to Appointments with updated status
      navigateSafely('UserRoutes', {
        screen: 'Appointments',
        params: { formId, status },
      });
    }
    return;
  }

  // 3. General In-App Notification / Bell Icon click
  navigateSafely('Notifications');
}

export async function createNotificationChannel() {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: NOTIFICATION_CHANNEL_ID,
      name: 'Serbi Notifications',
      importance: AndroidImportance.HIGH,
      vibration: true,
    });
  }
}

export async function displayLocalNotification(remoteMessage) {
  if (!remoteMessage) return;

  await createNotificationChannel();

  const title =
    remoteMessage.notification?.title ||
    remoteMessage.data?.title ||
    'New Notification';
  const body =
    remoteMessage.notification?.body ||
    remoteMessage.data?.body ||
    remoteMessage.data?.message ||
    '';

  await notifee.displayNotification({
    title,
    body,
    data: remoteMessage.data || {},
    android: {
      channelId: NOTIFICATION_CHANNEL_ID,
      smallIcon: 'ic_launcher',
      importance: AndroidImportance.HIGH,
      pressAction: {
        id: 'default',
        launchActivity: 'default',
      },
    },
    ios: {
      sound: 'default',
    },
  });
}

// Background handler function to be registered in index.js
export async function backgroundMessageHandler(remoteMessage) {
  console.log('[FCM] Background message received:', remoteMessage);
  if (remoteMessage && !remoteMessage.notification && remoteMessage.data) {
    await displayLocalNotification(remoteMessage);
  }
}

export async function requestUserPermission() {
  try {
    const settings = await notifee.requestPermission();

    const enabled =
      settings.authorizationStatus >= NotifeeAuthorizationStatus.AUTHORIZED ||
      settings.authorizationStatus === NotifeeAuthorizationStatus.PROVISIONAL ||
      settings.authorizationStatus === 1 ||
      settings.authorizationStatus === 2;

    console.log(
      '[FCM] Authorization status:',
      settings.authorizationStatus,
      'Enabled:',
      enabled,
    );

    if (enabled && Platform.OS === 'ios') {
      try {
        const messaging = getFirebaseMessaging();
        const isRegistered = isDeviceRegisteredForRemoteMessages(messaging);
        if (!isRegistered) {
          await registerDeviceForRemoteMessages(messaging);
        }
      } catch (err) {
        console.log(
          '[FCM] iOS registerDeviceForRemoteMessages notice:',
          err?.message || err,
        );
      }
    }

    return enabled;
  } catch (error) {
    console.log('[FCM] Error requesting permission:', error);
    return false;
  }
}

// -------------------- FCM Token --------------------
export async function getFcmToken() {
  try {
    const hasPermission = await requestUserPermission();
    if (!hasPermission) {
      console.log('[FCM] Permission not granted, skipping token fetch');
      return null;
    }

    const messaging = getFirebaseMessaging();

    if (Platform.OS === 'ios') {
      try {
        const isRegistered = isDeviceRegisteredForRemoteMessages(messaging);
        if (!isRegistered) {
          await registerDeviceForRemoteMessages(messaging);
        }
      } catch (regError) {
        console.log(
          '[FCM] iOS registerDeviceForRemoteMessages notice:',
          regError?.message || regError,
        );
      }

      // Check for APNS token (APNS token is received asynchronously from Apple servers on real devices)
      let apnsToken = null;
      try {
        apnsToken = await getAPNSToken(messaging);
      } catch (e) {
        // ignore
      }

      let retries = 0;
      while (!apnsToken && retries < 4) {
        await new Promise(resolve => setTimeout(resolve, 600));
        try {
          apnsToken = await getAPNSToken(messaging);
        } catch (e) {
          // ignore retry error
        }
        retries++;
      }
    }

    try {
      const fcmToken = await getToken(messaging);
      return fcmToken || null;
    } catch (tokenError) {
      console.log(
        '[FCM] Notice: Unable to retrieve FCM token (normal on iOS Simulator without APNS):',
        tokenError?.message || tokenError,
      );
      return null;
    }
  } catch (error) {
    console.log('[FCM] Error getting FCM token:', error?.message || error);
    return null;
  }
}

// -------------------- Device Token Sync --------------------
export async function syncDeviceToken(fcmToken) {
  try {
    const persisted = store.getState()?.persistedData;
    const userToken = persisted?.token;
    if (!userToken) {
      return null;
    }

    const token = fcmToken || (await getFcmToken());
    if (!token) {
      return null;
    }

    const url = `${BASE_URL}${endpoints.REGISTER_DEVICE_TOKEN}`;
    await axios.post(
      url,
      { fcmToken: token },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      },
    );

    console.log('[DeviceToken] Synced FCM token successfully:', token);
    return token;
  } catch (error) {
    console.log('[DeviceToken] Sync notice:', error?.message || error);
    return null;
  }
}

export async function removeDeviceTokenFromBackend(fcmToken) {
  try {
    const persisted = store.getState()?.persistedData;
    const userToken = persisted?.token;
    const token = fcmToken || (await getFcmToken());

    if (userToken && token) {
      const url = `${BASE_URL}${endpoints.LOGOUT}`;
      await axios.post(
        url,
        { fcmToken: token },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
        },
      );
    }

    console.log('[DeviceToken] Removed successfully on logout:', token);
    return token;
  } catch (error) {
    console.log(
      '[DeviceToken] Remove on logout notice:',
      error?.message || error,
    );
    return null;
  }
}

// -------------------- Initialize Notifications --------------------
export function initNotifications() {
  try {
    requestUserPermission();
    createNotificationChannel();

    const messaging = getFirebaseMessaging();

    if (Platform.OS === 'ios') {
      try {
        const isRegistered = isDeviceRegisteredForRemoteMessages(messaging);
        if (!isRegistered) {
          registerDeviceForRemoteMessages(messaging);
        }
      } catch (regError) {
        console.log(
          '[FCM] iOS registerDeviceForRemoteMessages notice:',
          regError?.message || regError,
        );
      }
    }

    // Attempt token sync on init if user is already authenticated
    syncDeviceToken();

    // 1. Foreground message handler
    const unsubscribeFCM = onMessage(messaging, async remoteMessage => {
      console.log('[FCM] Foreground message received:', remoteMessage);
      await displayLocalNotification(remoteMessage);
    });

    // 2. Token refresh listener
    const unsubscribeTokenRefresh = onTokenRefresh(messaging, token => {
      console.log('[FCM] Token refreshed:', token);
      syncDeviceToken(token);
    });

    // 3. Notifee foreground click handler
    const unsubscribeNotifee = notifee.onForegroundEvent(event => {
      if (event.type === EventType.PRESS) {
        const notification = event.detail.notification;
        if (notification?.data) {
          handleNotificationClick({ data: notification.data });
        }
      }
    });

    // 4. Background notification clicked (app open from background via FCM)
    const unsubscribeOpenedApp = onNotificationOpenedApp(
      messaging,
      remoteMessage => {
        console.log('[FCM] App opened from notification:', remoteMessage);
        handleNotificationClick(remoteMessage);
      },
    );

    // 5. Initial notification from quit/killed state via FCM
    getInitialNotification(messaging).then(remoteMessage => {
      if (remoteMessage) {
        console.log('[FCM] Initial notification received:', remoteMessage);
        handleNotificationClick(remoteMessage);
      }
    });

    // 6. Initial notification from quit state via Notifee
    notifee.getInitialNotification().then(initialNotification => {
      if (initialNotification?.notification?.data) {
        console.log(
          '[Notifee] Initial notification received:',
          initialNotification,
        );
        handleNotificationClick({
          data: initialNotification.notification.data,
        });
      }
    });

    return () => {
      unsubscribeFCM();
      unsubscribeTokenRefresh();
      unsubscribeNotifee();
      unsubscribeOpenedApp();
    };
  } catch (error) {
    console.log('[FCM] Error initializing notifications:', error);
    return () => {};
  }
}
