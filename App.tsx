import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
} from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import NotificationService from './services/NotificationService';
const App: React.FC = () => {
  const [permissionStatus, setPermissionStatus] = useState<boolean | null>(null);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    // Request permission on component mount
    const setupNotifications = async () => {
      // Set up background handler
      NotificationService.setupBackgroundHandler();
      
      // Request permission
      const hasPermission = await NotificationService.requestUserPermission();
      setPermissionStatus(hasPermission);
      
      if (hasPermission) {
        // Get FCM token
        const token = await NotificationService.getFCMToken();
        setFcmToken(token);
        
        // Setup foreground handler
        const unsubscribe = NotificationService.setupForegroundHandler();
        
        // Setup notification opened handler (when app is closed or in background)
        messaging().onNotificationOpenedApp((remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
          console.log('Notification opened app:', remoteMessage);
          // Navigate to a specific screen based on the notification if needed
        });
        
        // Check if app was opened from a notification (when app was completely closed)
        messaging()
          .getInitialNotification()
          .then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
            if (remoteMessage) {
              console.log('Initial notification:', remoteMessage);
              // Navigate to a specific screen based on the notification if needed
            }
          });
          
        return () => unsubscribe();
      }
    };
    
    setupNotifications();
  }, []);

  const requestPermission = async (): Promise<void> => {
    const hasPermission = await NotificationService.requestUserPermission();
    setPermissionStatus(hasPermission);
    
    if (hasPermission) {
      const token = await NotificationService.getFCMToken();
      setFcmToken(token);
      Alert.alert('Success', 'Push notification permission granted!');
    } else {
      Alert.alert('Error', 'Failed to get push notification permission');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollView}>
        <View style={styles.body}>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Firebase Push Notifications Demo</Text>
            <Text style={styles.sectionDescription}>
              Status: {permissionStatus === null ? 'Not requested' : permissionStatus ? 'Granted' : 'Denied'}
            </Text>
            
            {fcmToken && (
              <Text style={styles.tokenText} numberOfLines={1} ellipsizeMode="middle">
                Token: {fcmToken}
              </Text>
            )}
            
            <View style={styles.buttonContainer}>
              <Button
                title="Request Notification Permission"
                onPress={requestPermission}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    backgroundColor: '#F3F3F3',
  },
  body: {
    backgroundColor: '#FFFFFF',
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 18,
    fontWeight: '400',
    color: '#444444',
    marginVertical: 8,
  },
  tokenText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 16,
  },
});

export default App;