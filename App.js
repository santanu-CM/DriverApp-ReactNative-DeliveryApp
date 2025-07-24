import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { StatusBar, View, Text, LogBox, Alert, Platform, AppState } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import AppNav from './src/navigation/AppNav';
import store from './src/store/store';
import "./ignoreWarnings";
import OfflineNotice from './src/utils/OfflineNotice'
import Toast from 'react-native-toast-message';

import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PERMISSIONS, request, check, RESULTS } from 'react-native-permissions';
import LinearGradient from 'react-native-linear-gradient';
import { responsiveHeight } from 'react-native-responsive-dimensions';
import SplashScreen from 'react-native-splash-screen';
import { requestPermissions, setupNotificationHandlers } from './src/utils/NotificationService';
import { navigate } from './src/navigation/NavigationService';
import { PermissionsAndroid } from 'react-native';
import { 
  startLocationService, 
  stopLocationService, 
  restartLocationService,
  isLocationServiceRunning 
} from './src/helper/LocationService';
import Geolocation from '@react-native-community/geolocation';
import { startLocationTracking } from './src/helper/BackgroundLocation';

function App() {
  const [notifications, setNotifications] = useState([]);
  const [notifyStatus, setnotifyStatus] = useState(false);
  const [permissionsRequested, setPermissionsRequested] = useState(false);

  // Handle app state changes
  const handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'active') {
      console.log('App has come to the foreground!');
      // Restart location service when app comes to foreground
      restartLocationService();
    } else if (nextAppState.match(/inactive|background/)) {
      console.log('App has gone to the background!');
      startLocationTracking();
      // Keep location service running in background
      // You might want to implement background task here for iOS
    }
  };

  // Initialize location tracking
  useEffect(() => {
    // Configure geolocation for better performance
    if (Platform.OS === 'android') {
      // For Android, set high accuracy mode
      Geolocation.setRNConfiguration({
        skipPermissionRequests: false,
        authorizationLevel: 'whenInUse',
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 30000,
        distanceFilter: 0,
      });
    }

    // Request location permissions first
    requestLocationPermission().then((granted) => {
      if (granted) {
        // Small delay to ensure permissions are properly set
        setTimeout(() => {
          startLocationService();
        }, 1000);
      }
    });

    // Listen for app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup on unmount
    return () => {
      stopLocationService();
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
      // Request notification permission after splash screen hides
      if (!permissionsRequested) {
        requestNotificationPermissionOnLaunch();
        setPermissionsRequested(true);
      }
    }, 3000);
  }, [permissionsRequested]);

  const checkBackgroundPermission = async () => {
    if (Platform.OS === 'android') {
      const result = await check(PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION);
      if (result === RESULTS.DENIED) {
        await request(PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION);
      }
    }
  };

  const requestLocationPermission = async () => {
    try {
      const permission = Platform.select({
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      });
      const granted = await request(permission);
      if (granted === 'granted' || granted === RESULTS.GRANTED) {
        console.log('Location permission granted');
        return true;
      } else {
        console.log('Location permission denied');
        return false;
      }
    } catch (error) {
      console.error('Failed to request location permission:', error);
      return false;
    }
  };

  const requestNotificationPermissionOnLaunch = async () => {
    try {
      // Check if permission was already requested before
      const hasAskedBefore = await AsyncStorage.getItem('notification_permission_asked');
      
      if (!hasAskedBefore) {
        // Show custom alert first (optional)
        Alert.alert(
          'Enable Notifications',
          'Allow notifications to stay updated with your orders and important updates.',
          [
            {
              text: 'Not Now',
              onPress: async () => {
                await AsyncStorage.setItem('notification_permission_asked', 'true');
                console.log('User declined notification permission');
              },
              style: 'cancel',
            },
            {
              text: 'Allow',
              onPress: async () => {
                await AsyncStorage.setItem('notification_permission_asked', 'true');
                await requestUserPermission();
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        // If user has been asked before, just request permission silently
        await requestUserPermission();
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  async function requestUserPermission() {
    try {
      if (Platform.OS === 'ios') {
        const authorizationStatus = await messaging().requestPermission({
          alert: true,
          announcement: false,
          badge: true,
          carPlay: false,
          provisional: false,
          sound: true,
        });
        
        if (authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED) {
          console.log('iOS notification permission granted');
          setupNotificationListeners();
        } else if (authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL) {
          console.log('iOS notification permission provisional');
          setupNotificationListeners();
        } else {
          console.log('iOS notification permission denied');
        }
      } else if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          try {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
              {
                title: 'Notification Permission',
                message: 'This app needs permission to send you notifications about your orders and updates.',
                buttonPositive: 'Allow',
                buttonNegative: 'Deny',
              }
            );

            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
              console.log('Android notification permission granted');
              setupNotificationListeners();
            } else {
              console.log('Android notification permission denied');
            }
          } catch (err) {
            console.warn('Notification permission error:', err);
          }
        } else {
          // For Android versions below 33, no explicit permission needed
          console.log('Android version below 33, no explicit permission needed');
          setupNotificationListeners();
        }
      }
    } catch (error) {
      console.error('Error in requestUserPermission:', error);
    }
  }

  const setupNotificationListeners = () => {
    // Request permissions and set up notifications
    requestPermissions().then(() => {
      const unsubscribeForeground = setupNotificationHandlers(setNotifications, setnotifyStatus);

      // Handle notification when the app is opened from a background state
      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log(remoteMessage?.data?.screen, 'notification opened app');
        
        if (remoteMessage?.data?.screen === 'ShippingScreen') {
          navigate('Shipping', { screen: 'OrderShippingScreen' });
        } else if (remoteMessage?.data?.screen === 'NewShippingOrderScreen') {
          navigate('NewShippingOrderScreen');
        }
      });

      // Handle notification when the app is opened from a quit state
      messaging().getInitialNotification().then(remoteMessage => {
        console.log(remoteMessage?.data?.screen, 'initial notification');
        if (remoteMessage?.data?.screen === 'ShippingScreen') {
          navigate('Shipping', { screen: 'OrderShippingScreen' });
        } else if (remoteMessage?.data?.screen === 'NewShippingOrderScreen') {
          navigate('NewShippingOrderScreen');
        }
      });

      // Store the unsubscribe function to clean up later if needed
      return unsubscribeForeground;
    });
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      checkBackgroundPermission();
    }
  }, []);

  return (
    <Provider store={store}>
      <StatusBar backgroundColor="#339999" />
      <OfflineNotice />
      <AuthProvider>
        <AppNav />
      </AuthProvider>
      <Toast />
    </Provider>
  );
}

export default App;