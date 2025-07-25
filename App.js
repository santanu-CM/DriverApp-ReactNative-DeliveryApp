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

  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
      // Start the sequential permission flow after splash screen hides
      if (!permissionsRequested) {
        startSequentialPermissions();
        setPermissionsRequested(true);
      }
    }, 3000);
  }, [permissionsRequested]);

  // Sequential permission flow: Notification -> Foreground Location -> Background Location
  const startSequentialPermissions = async () => {
    try {
      console.log('Starting sequential permissions flow...');
      
      // Step 1: Request notification permission first
      await requestNotificationPermissionFirst();
      
      // Step 2: Then request foreground location permission
      await requestForegroundLocationPermission();
      
      // Step 3: Finally request background location permission and start tracking
      await requestBackgroundLocationPermission();
      
    } catch (error) {
      console.error('Error in sequential permissions flow:', error);
    }
  };

  // Step 1: Request notification permission first
  const requestNotificationPermissionFirst = async () => {
    return new Promise(async (resolve) => {
      try {
        // Check if permission was already requested before
        const hasAskedBefore = await AsyncStorage.getItem('notification_permission_asked');
        
        if (!hasAskedBefore) {
          // Show custom alert first
          Alert.alert(
            'Enable Notifications',
            'Allow notifications to stay updated with your orders and important updates.',
            [
              {
                text: 'Not Now',
                onPress: async () => {
                  await AsyncStorage.setItem('notification_permission_asked', 'true');
                  console.log('User declined notification permission');
                  resolve();
                },
                style: 'cancel',
              },
              {
                text: 'Allow',
                onPress: async () => {
                  await AsyncStorage.setItem('notification_permission_asked', 'true');
                  await requestUserPermission();
                  resolve();
                },
              },
            ],
            { cancelable: false }
          );
        } else {
          // If user has been asked before, just request permission silently
          await requestUserPermission();
          resolve();
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        resolve();
      }
    });
  };

  // Step 2: Request foreground location permission
  const requestForegroundLocationPermission = async () => {
    return new Promise(async (resolve) => {
      try {
        if (Platform.OS === 'android') {
          const fineLocationResult = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message: 'This app needs access to your location to provide location-based services.',
              buttonPositive: 'Allow',
              buttonNegative: 'Deny',
            }
          );

          if (fineLocationResult === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Foreground location permission granted');
          } else {
            console.log('Foreground location permission denied');
          }
          resolve();
        } else if (Platform.OS === 'ios') {
          const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
          
          if (result === RESULTS.GRANTED) {
            console.log('iOS foreground location permission granted');
          } else {
            console.log('iOS foreground location permission denied');
          }
          resolve();
        } else {
          resolve();
        }
      } catch (error) {
        console.error('Error requesting foreground location permission:', error);
        resolve();
      }
    });
  };

  // Step 3: Request background location permission and start tracking
  const requestBackgroundLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        // Check if foreground location is granted first
        const fineLocationCheck = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        
        if (fineLocationCheck === RESULTS.GRANTED) {
          // Only request background permission for Android 10+
          if (Platform.Version >= 29) {
            const backgroundLocationResult = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
              {
                title: 'Background Location Permission',
                message: 'This app needs to access your location in the background to continue tracking when the app is not active.',
                buttonPositive: 'Allow',
                buttonNegative: 'Deny',
              }
            );

            if (backgroundLocationResult === PermissionsAndroid.RESULTS.GRANTED) {
              console.log('Background location permission granted');
            } else {
              console.log('Background location permission denied, but starting location tracking anyway');
            }
          } else {
            console.log('Android version below 10, no background permission needed');
          }
          
          // Start location tracking regardless of background permission result
          startLocationTracking();
        } else {
          console.log('Foreground location not granted, cannot start location tracking');
        }
      } else if (Platform.OS === 'ios') {
        // For iOS, request "always" permission for background
        const alwaysResult = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
        
        if (alwaysResult === RESULTS.GRANTED) {
          console.log('iOS background location permission granted');
        } else {
          console.log('iOS background location permission denied');
        }
        
        // Start location tracking
        startLocationTracking();
      }
    } catch (error) {
      console.error('Error requesting background location permission:', error);
      // Start location tracking anyway in case of error
      startLocationTracking();
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

  // Legacy functions kept for compatibility (not used in new flow)
  const requestAllLocationPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        const fineLocationResult = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to provide location-based services.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          }
        );

        if (fineLocationResult === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Fine location permission granted');
          
          if (Platform.Version >= 29) {
            setTimeout(async () => {
              const backgroundLocationResult = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
                {
                  title: 'Background Location Permission',
                  message: 'This app needs to access your location in the background to continue tracking when the app is not active.',
                  buttonPositive: 'Allow',
                  buttonNegative: 'Deny',
                }
              );

              if (backgroundLocationResult === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('Background location permission granted');
                startLocationTracking();
              } else {
                console.log('Background location permission denied, but starting location tracking anyway');
                startLocationTracking();
              }
            }, 1000);
          } else {
            console.log('Android version below 10, no background permission needed');
            startLocationTracking();
          }
        } else {
          console.log('Fine location permission denied');
        }
      } else if (Platform.OS === 'ios') {
        const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        
        if (result === RESULTS.GRANTED) {
          console.log('iOS location permission granted');
          
          const alwaysResult = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
          
          if (alwaysResult === RESULTS.GRANTED) {
            console.log('iOS always location permission granted');
          }
          
          startLocationTracking();
        } else {
          console.log('iOS location permission denied');
        }
      }
    } catch (error) {
      console.error('Error requesting location permissions:', error);
    }
  };

  const checkBackgroundPermissionAndStartTracking = async () => {
    if (Platform.OS === 'android') {
      try {
        const fineLocationResult = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        
        if (fineLocationResult !== RESULTS.GRANTED) {
          console.log('Fine location permission not granted, requesting...');
          await requestAllLocationPermissions();
          return;
        }

        const backgroundResult = await check(PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION);
        
        if (backgroundResult === RESULTS.GRANTED) {
          console.log('Background location permission already granted');
          startLocationTracking();
        } else if (backgroundResult === RESULTS.DENIED) {
          const requestResult = await request(PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION);
          
          if (requestResult === RESULTS.GRANTED) {
            console.log('Background location permission granted');
            startLocationTracking();
          } else {
            console.log('Background location permission denied');
            startLocationTracking();
          }
        }
      } catch (error) {
        console.error('Error checking/requesting background location permission:', error);
      }
    } else {
      startLocationTracking();
    }
  };

  const checkBackgroundPermission = async () => {
    if (Platform.OS === 'android') {
      const result = await check(PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION);
      if (result === RESULTS.DENIED) {
        const requestResult = await request(PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION);
        
        if (requestResult === RESULTS.GRANTED) {
          console.log('Background location permission granted, starting location tracking');
          startLocationTracking();
        }
      } else if (result === RESULTS.GRANTED) {
        console.log('Background location permission already granted, starting location tracking');
        startLocationTracking();
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