import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { StatusBar, View, Text, LogBox, Alert, Platform } from 'react-native';
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
import { startLocationTracking } from './src/helper/BackgroundLocation';
import { requestPermissions, setupNotificationHandlers } from './src/utils/NotificationService';
import { navigate } from './src/navigation/NavigationService'; // Import the navigation function


function App() {
  const [notifications, setNotifications] = useState([]);
  const [notifyStatus, setnotifyStatus] = useState(false)

  useEffect(() => {
    startLocationTracking();
}, []);

  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
    }, 3000);
  }, [])

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
      if (granted === 'granted') {
        console.log('Location permission granted');
      } else {
        console.log('Location permission denied');
      }
    } catch (error) {
      console.error('Failed to request location permission:', error);
    }
  };

  useEffect(() => {
    // Your existing useEffect code
    if (Platform.OS == 'android') {
      requestLocationPermission();
      checkBackgroundPermission();
      // Your existing code continues...
    }
  }, []);



  // useEffect(() => {
  //   if (Platform.OS == 'android') {
  //     const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
  //       Alert.alert('A new notification arrived!', JSON.stringify("New assignment order arrived."));
  //       console.log('Received foreground message:', JSON.stringify(remoteMessage));
  //       setNotifications(prevNotifications => {
  //         const newNotifications = [...prevNotifications, remoteMessage];
  //         AsyncStorage.setItem('notifications', JSON.stringify(newNotifications));
  //         setnotifyStatus(true)
  //         return newNotifications;
  //       });
  //     });

  //     const unsubscribeBackground = messaging().setBackgroundMessageHandler(async remoteMessage => {
  //       console.log('Received background message:', remoteMessage);
  //       setNotifications(prevNotifications => {
  //         const newNotifications = [...prevNotifications, remoteMessage];
  //         AsyncStorage.setItem('notifications', JSON.stringify(newNotifications));
  //         setnotifyStatus(true)
  //         return newNotifications;
  //       });
  //     });

  //     // Load notifications from AsyncStorage when component mounts
  //     AsyncStorage.getItem('notifications').then((value) => {
  //       if (value !== null) {
  //         setNotifications(JSON.parse(value));
  //         setnotifyStatus(true)
  //       }
  //     });

  //     return () => {
  //       unsubscribeForeground();
  //       //unsubscribeBackground();
  //     };
  //   }
  // }, [])

  useEffect(() => {
   
    if(Platform.OS === 'ios'){
      requestUserPermission()
    }

    // Request permissions and set up notifications
    requestPermissions().then(() => {
      const unsubscribeForeground = setupNotificationHandlers(setNotifications, setnotifyStatus);

      // Handle notification when the app is opened from a background state
      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log(remoteMessage?.data?.screen,'rrrrrrrrrrrrr');
        
        if (remoteMessage?.data?.screen === 'ShippingScreen') {
          navigate('Shipping', { screen: 'OrderShippingScreen' });
        } else if(remoteMessage?.data?.screen === 'NewShippingOrderScreen'){
          navigate('NewShippingOrderScreen');
        }
      });

      // Handle notification when the app is opened from a quit state
      messaging().getInitialNotification().then(remoteMessage => {
        console.log(remoteMessage?.data?.screen,'rrrrrrrrrrrrr');
        if (remoteMessage?.data?.screen === 'ShippingScreen') {
          navigate('Shipping', { screen: 'OrderShippingScreen' });
        } else if(remoteMessage?.data?.screen === 'NewShippingOrderScreen'){
          navigate('NewShippingOrderScreen');
        }
      });

      // Clean up foreground listener on unmount
      return () => {
        if (unsubscribeForeground) unsubscribeForeground();
      };
    });
  }, []);

  async function requestUserPermission() {
    const authorizationStatus = await messaging().requestPermission();
  
    if (authorizationStatus) {
      console.log('Permission status:', authorizationStatus);
    }
  }

  return (
    <Provider store={store}>
      <StatusBar backgroundColor="#339999" />
      <OfflineNotice />
      <AuthProvider>
        <AppNav />
        {/* <View><Text>hhh</Text></View> */}
      </AuthProvider>
      <Toast />
    </Provider>
  );
}

export default App;