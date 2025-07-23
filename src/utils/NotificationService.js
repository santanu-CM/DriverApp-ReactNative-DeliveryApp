import { Alert, Linking, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { PERMISSIONS, request, check, RESULTS } from 'react-native-permissions';

// Request notification permission
export const requestNotificationPermission = async () => {
  const permission = Platform.OS === 'android'
    ? PERMISSIONS.ANDROID.POST_NOTIFICATIONS
    : PERMISSIONS.IOS.NOTIFICATIONS;
  return await request(permission);
};

// Check notification permission
export const checkNotificationPermission = async () => {
  const permission = Platform.OS === 'android'
    ? PERMISSIONS.ANDROID.POST_NOTIFICATIONS
    : PERMISSIONS.IOS.NOTIFICATIONS;
  return await check(permission);
};

// Request location permission
export const requestLocationPermission = async () => {
  const locationPermission = Platform.OS === 'android'
    ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
    : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
  return await request(locationPermission);
};

// Check location permission
export const checkLocationPermission = async () => {
  const locationPermission = Platform.OS === 'android'
    ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
    : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
  return await check(locationPermission);
};

// Open app settings
export const openSettings = () => {
  Linking.openSettings();
};

// Combined permission request function
export const requestPermissions = async () => {
  const notificationPermission = await checkNotificationPermission();
  const locationPermission = await checkLocationPermission();

  console.log('Current permissions - Notification:', notificationPermission, 'Location:', locationPermission);

  // Handle notification permission
  if (notificationPermission !== RESULTS.GRANTED) {
    const result = await requestNotificationPermission();
    if (result !== RESULTS.GRANTED) {
      //if (Platform.OS == 'android') {
        Alert.alert(
          'Notification Permission Required',
          'Please enable notifications to stay updated.',
          [
            { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
            { text: 'OK', onPress: openSettings }
          ]
        );
     // }
    }
  }

  // Handle location permission
  if (locationPermission !== RESULTS.GRANTED) {
    const result = await requestLocationPermission();
    if (result !== RESULTS.GRANTED) {
      Alert.alert(
        'Location Permission Required',
        'This app needs location access for better service. Please enable location permissions.',
        [
          { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
          { text: 'OK', onPress: openSettings }
        ]
      );
    }
  }
};

// Handle notifications with actions
export const handleNotification = (remoteMessage, setNotifications, setnotifyStatus, navigation) => {
  const action = remoteMessage?.data?.action;
  if (action) {
    handleAction(action, remoteMessage, navigation);
  } else {
    setNotifications(prevNotifications => {
      const newNotifications = [...prevNotifications, remoteMessage];
      setnotifyStatus(true);
      return newNotifications;
    });
  }
};

const handleAction = (action, remoteMessage, navigation) => {
  switch (action) {
    case 'reply':
      console.log('User chose to reply to the message:', remoteMessage);
      break;
    case 'mark_as_read':
      console.log('User chose to mark the message as read:', remoteMessage);
      break;
    default:
      console.log('Unknown action:', action);
      break;
  }
};

// Setup notification handlers
export const setupNotificationHandlers = (setNotifications, setnotifyStatus, navigation) => {
  const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
    console.log('Received foreground message:', JSON.stringify(remoteMessage));
    handleNotification(remoteMessage, setNotifications, setnotifyStatus, navigation);
  });

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Received background message:', JSON.stringify(remoteMessage));
    handleNotification(remoteMessage, setNotifications, setnotifyStatus, navigation);
  });

  return unsubscribeForeground;
};
