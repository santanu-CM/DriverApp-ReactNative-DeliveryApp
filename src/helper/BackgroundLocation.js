import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import BackgroundActions from 'react-native-background-actions';
import { API_URL } from '@env';

// Background task function
const backgroundTask = async () => {
  console.log('[Background Task] Started');

  const getCurrentLocation = (retryCount = 0) => {
    return new Promise((resolve, reject) => {
      const options = retryCount === 0 
        ? { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
        : { enableHighAccuracy: false, timeout: 8000, maximumAge: 120000 };

      Geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => {
          if (retryCount < 2 && error.code === error.TIMEOUT) {
            console.log(`[Location] Retry ${retryCount + 1} due to timeout`);
            // Retry with different settings
            setTimeout(() => {
              getCurrentLocation(retryCount + 1).then(resolve).catch(reject);
            }, 1000);
          } else {
            reject(error);
          }
        },
        options
      );
    });
  };

  try {
    while (BackgroundActions.isRunning()) {
      console.log('[Background Task] Loop iteration');

      try {
        const position = await getCurrentLocation();
        const { latitude, longitude, heading } = position.coords;
        console.log(`[Location] Lat: ${latitude}, Lng: ${longitude}, Heading: ${heading}`);
        await sendLocationToServer(latitude, longitude, heading);
      } catch (error) {
        console.warn('[Location Error]', error?.message || error);
        // Continue the loop even if location fails
      }

      // Delay between location fetches
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  } catch (error) {
    console.error('[Background Task Error]', error);
  }

  console.log('[Background Task] Stopped');
};

// Options for the background task
const backgroundTaskOptions = {
  taskName: 'LocationTracking',
  taskTitle: 'Driver Location Tracking',
  taskDesc: 'Sending location to server...',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#ff00ff',
  parameters: {
    delay: 10000,
  },
  isForeground: true, // Required for Android 10+
};

// Send location to server
const sendLocationToServer = async (latitude, longitude, heading) => {
  try {
      const userToken = await AsyncStorage.getItem('userToken');
      const storedStatus = await AsyncStorage.getItem('switchStatus');
      if (!userToken) return;

      console.log(storedStatus, 'storedStatus');

      // Get last stored location
      const lastLocation = await AsyncStorage.getItem('lastLocation');
      const lastCoords = lastLocation ? JSON.parse(lastLocation) : null;

      // Check if location is the same
      if (lastCoords && lastCoords.latitude === latitude && lastCoords.longitude === longitude) {
          console.log('Location unchanged, skipping API call.');
          return;
      }

      console.log(latitude, 'latitude');
      console.log(longitude, 'longitude');

      if (storedStatus === 'on') {
          const option = {
              "driver_lat": latitude,
              "driver_long": longitude,
              "heading": heading
          };

          const response = await axios.post(`${process.env.API_URL}/api/driver/driver-live-location-get`, option, {
              headers: {
                  "Authorization": `Bearer ${userToken}`,
                  "Content-Type": 'application/json'
              }
          });

          console.log("Location sent successfully", response.data);

          // Save new location after successful API call
          await AsyncStorage.setItem('lastLocation', JSON.stringify({ latitude, longitude }));
      }
  } catch (error) {
      console.log("Error sending location:", error);
  }
};

// Sleep function for delay
const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

// Request necessary permissions
export const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
      ]);

      const allGranted = Object.values(granted).every((status) => status === PermissionsAndroid.RESULTS.GRANTED);

      if (!allGranted) {
        Alert.alert('Permissions required', 'Please grant all location permissions');
        return false;
      }
    } catch (err) {
      console.warn('[Permission] Error requesting permissions', err);
      return false;
    }
  }

  return true;
};

// Start location tracking
export const startLocationTracking = async () => {
  console.log('[Location Tracking] Starting...');

  const hasPermission = await requestLocationPermission();
  if (!hasPermission) return;

  const isRunning = await BackgroundActions.isRunning();
  if (isRunning) {
    console.warn('[Background] Already running, stopping first...');
    await BackgroundActions.stop();
  }

  try {
    await BackgroundActions.start(backgroundTask, backgroundTaskOptions);
    console.log('[Background] Task started');
  } catch (err) {
    console.error('[Background] Error starting task', err);
  }
};

// Stop location tracking
export const stopLocationTracking = async () => {
  console.log('[Location Tracking] Stopping...');
  try {
    await BackgroundActions.stop();
    console.log('[Background] Task stopped');
  } catch (err) {
    console.error('[Background] Error stopping task', err);
  }
};
