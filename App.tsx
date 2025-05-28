import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import NotificationService from './services/NotificationService';

const { width } = Dimensions.get('window');

const App: React.FC = () => {
  const [permissionStatus, setPermissionStatus] = useState<boolean | null>(null);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Setup notifications
    const setupNotifications = async () => {
      NotificationService.setupBackgroundHandler();
      
      const hasPermission = await NotificationService.requestUserPermission();
      setPermissionStatus(hasPermission);
      
      if (hasPermission) {
        const token = await NotificationService.getFCMToken();
        setFcmToken(token);
        
        const unsubscribe = NotificationService.setupForegroundHandler();
        
        messaging().onNotificationOpenedApp((remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
          console.log('Notification opened app:', remoteMessage);
        });
        
        messaging()
          .getInitialNotification()
          .then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
            if (remoteMessage) {
              console.log('Initial notification:', remoteMessage);
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

  const copyTokenToClipboard = () => {
    if (fcmToken) {
      Alert.alert('FCM Token', fcmToken, [
        { text: 'OK', style: 'default' }
      ]);
    }
  };

  const getStatusColor = () => {
    if (permissionStatus === null) return '#FFA726';
    return permissionStatus ? '#4CAF50' : '#F44336';
  };

  const getStatusIcon = () => {
    if (permissionStatus === null) return '⏳';
    return permissionStatus ? '✅' : '❌';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      <ScrollView 
        contentInsetAdjustmentBehavior="automatic" 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.iconContainer}>
              <View style={styles.bellIcon}>
                <Text style={styles.bellEmoji}>🔔</Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>Push Notifications</Text>
            <Text style={styles.heroSubtitle}>
              Stay connected with real-time updates and never miss important messages
            </Text>
          </View>

          {/* Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusTitle}>Notification Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
                <Text style={styles.statusText}>
                  {permissionStatus === null ? 'Pending' : permissionStatus ? 'Active' : 'Disabled'}
                </Text>
              </View>
            </View>
            
            <Text style={styles.statusDescription}>
              {permissionStatus === null 
                ? 'Notification permission has not been requested yet'
                : permissionStatus 
                ? 'Great! You\'ll receive push notifications'
                : 'Push notifications are currently disabled'
              }
            </Text>
          </View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>Why Enable Notifications?</Text>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>⚡</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Instant Updates</Text>
                <Text style={styles.featureDescription}>
                  Get notified immediately when something important happens
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>🎯</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Personalized Content</Text>
                <Text style={styles.featureDescription}>
                  Receive notifications tailored to your interests and preferences
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>🔒</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Privacy Focused</Text>
                <Text style={styles.featureDescription}>
                  Your notification preferences are secure and can be changed anytime
                </Text>
              </View>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              permissionStatus && styles.actionButtonSuccess
            ]}
            onPress={requestPermission}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>
              {permissionStatus ? 'Permission Granted' : 'Enable Notifications'}
            </Text>
            <Text style={styles.actionButtonIcon}>
              {permissionStatus ? '✓' : '→'}
            </Text>
          </TouchableOpacity>

          {/* Token Section */}
          {fcmToken && (
            <View style={styles.tokenSection}>
              <Text style={styles.tokenTitle}>Device Token</Text>
              <TouchableOpacity style={styles.tokenContainer} onPress={copyTokenToClipboard}>
                <Text style={styles.tokenText} numberOfLines={2} ellipsizeMode="middle">
                  {fcmToken}
                </Text>
                <Text style={styles.tokenHint}>Tap to view full token</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Built by Timothy with Firebase Cloud Messaging
            </Text>
            <View style={styles.footerDots}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingBottom: 40,
  },
  
  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  iconContainer: {
    marginBottom: 20,
  },
  bellIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  bellEmoji: {
    fontSize: 32,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },

  // Status Card
  statusCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusDescription: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
  },

  // Features Section
  featuresSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureEmoji: {
    fontSize: 18,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },

  // Action Button
  actionButton: {
    backgroundColor: '#48BB78',
    marginHorizontal: 24,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonSuccess: {
    backgroundColor: '#38A169',
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  actionButtonIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Token Section
  tokenSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  tokenTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  tokenContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tokenText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  tokenHint: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
  },
  footerDots: {
    flexDirection: 'row',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 2,
  },
});

export default App;