import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

class NotificationService {
  constructor() {
    this.initializeNotifications();
  }

  initializeNotifications = () => {
    // Configure channel for Android
    PushNotification.createChannel(
      {
        channelId: 'default-channel',
        channelName: 'Default Channel',
        channelDescription: 'A default channel for notifications',
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`Channel created: ${created}`)
    );

    PushNotification.configure({
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
        if (Platform.OS === 'ios') {
          notification.finish('backgroundFetchResultNoData');
        }
      },
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      popInitialNotification: true,

      requestPermissions: Platform.OS === 'ios',
    });
  };

  requestUserPermission = async () => {
    let permissionStatus;
    
    if (Platform.OS === 'ios') {
      // iOS permission request
      permissionStatus = await messaging().requestPermission({
        alert: true,
        badge: true,
        sound: true,
      });
      
      const authStatus = permissionStatus;
      
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      return enabled;
    } else {
      try {
        permissionStatus = await messaging().hasPermission();
        if (permissionStatus === messaging.AuthorizationStatus.NOT_DETERMINED) {
          permissionStatus = await messaging().requestPermission();
        }
        
        const enabled =
          permissionStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          permissionStatus === messaging.AuthorizationStatus.PROVISIONAL;

        return enabled;
      } catch (error) {
        console.log('Permission request error:', error);
        return false;
      }
    }
  };

  // Get FCM token
  getFCMToken = async () => {
    try {
      await messaging().registerDeviceForRemoteMessages();
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.log('Error getting FCM token:', error);
      return null;
    }
  };

  // Handle foreground messages
  setupForegroundHandler = () => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Foreground notification received:', remoteMessage);
      
      // Display local notification
      PushNotification.localNotification({
        channelId: 'default-channel',
        title: remoteMessage.notification?.title || 'New Notification',
        message: remoteMessage.notification?.body || 'You have a new notification',
        smallIcon: 'ic_launcher',
        largeIcon: '',
        bigText: remoteMessage.notification?.body || 'You have a new notification',
        color: '#2196F3',
        vibrate: true,
        vibration: 300,
        priority: 'high',
        userInfo: remoteMessage.data,
    });
    });

    return unsubscribe;
  };

  setupBackgroundHandler = () => {
    // Register background handler
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background message:', remoteMessage);
    });
  };
}

export default new NotificationService();