import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';
import { Platform, PermissionsAndroid } from 'react-native';
import BackgroundActions from 'react-native-background-actions';

// Function to send location to the server
const sendLocationToServer = async (latitude, longitude, heading) => {
  try {
    const [userToken, storedStatus] = await Promise.all([
      AsyncStorage.getItem('userToken'),
      AsyncStorage.getItem('switchStatus'),
    ]);

    if (!userToken || storedStatus !== 'on') {
      console.log('No token or switch is off, skipping API call.');
      return;
    }

    // Get last stored location
    const lastLocation = await AsyncStorage.getItem('lastLocation');
    const lastCoords = lastLocation ? JSON.parse(lastLocation) : null;

    // Check if location is unchanged
    if (lastCoords && lastCoords.latitude === latitude && lastCoords.longitude === longitude) {
      console.log('Location unchanged, skipping API call.');
      return;
    }

    console.log('Sending location:', { latitude, longitude, heading });

    const response = await axios.post(
      `${process.env.API_URL}/api/driver/driver-live-location-get`,
      {
        driver_lat: latitude,
        driver_long: longitude,
        heading: heading || 0, // Fallback for heading if undefined
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Location sent successfully:', response.data);

    // Save new location after successful API call
    await AsyncStorage.setItem('lastLocation', JSON.stringify({ latitude, longitude }));
  } catch (error) {
    console.error('Error sending location:', error.message);
  }
};

// Background task options
const backgroundTaskOptions = {
  taskName: 'LocationUpdates',
  taskTitle: 'Location Tracking',
  taskDesc: 'Sending location updates in the background',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#ff00ff',
  linkingURI: 'yourapp://location',
  parameters: {
    delay: 120000, // 2 minutes
  },
  isForeground: false, // Run in background
};

// Sleep utility
const sleep = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

// Background task for location updates
const backgroundTask = async (taskData) => {
  const { delay } = taskData || { delay: 120000 }; // Default to 2 minutes

  try {
    await new Promise(async (resolve, reject) => {
      // Handle task termination
      const stopTask = () => {
        console.log('Stopping background task');
        resolve();
      };

      // Register stop event listener
      BackgroundActions.on('stop', stopTask);

      while (BackgroundActions.isRunning()) {
        try {
          // Get current location
          const position = await new Promise((res, rej) => {
            Geolocation.getCurrentPosition(
              res,
              (err) => rej(err),
              {
                enableHighAccuracy: true,
                timeout: 30000, // 30 seconds timeout
                maximumAge: 10000, // Accept cached location up to 10 seconds old
                distanceFilter: 10, // Update only if moved 10 meters
              }
            );
          });

          const { latitude, longitude, heading } = position.coords;
          console.log('Background Location:', { latitude, longitude, heading });

          // Send location to server
          await sendLocationToServer(latitude, longitude, heading);
        } catch (error) {
          console.error('Error in background task:', error.message);
          if (error.code === 3) {
            console.log('Location timeout, retrying after 10 seconds...');
            await sleep(10000); // Wait before retrying
            continue;
          }
        }

        // Wait for the specified delay
        await sleep(delay);
      }

      // Cleanup event listener
      BackgroundActions.removeListener('stop', stopTask);
      resolve();
    });
  } catch (error) {
    console.error('Background task error:', error.message);
  }
};

// Request location permissions
const requestLocationPermissions = async () => {
  try {
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('always');
      return auth === 'granted' || auth === 'authorizedAlways';
    } else if (Platform.OS === 'android') {
      const fineLocation = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location to track it in the background.',
          buttonPositive: 'OK',
        }
      );
      const backgroundLocation = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        {
          title: 'Background Location Permission',
          message: 'This app needs to access your location in the background.',
          buttonPositive: 'OK',
        }
      );
      return (
        fineLocation === PermissionsAndroid.RESULTS.GRANTED &&
        backgroundLocation === PermissionsAndroid.RESULTS.GRANTED
      );
    }
    return false;
  } catch (error) {
    console.error('Error requesting permissions:', error.message);
    return false;
  }
};

// Start location tracking
export const startLocationTracking = async () => {
  try {
    // Check and request permissions
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) {
      console.log('Location permissions not granted');
      return;
    }

    // Check if task is already running
    const isRunning = await BackgroundActions.isRunning();
    if (isRunning) {
      console.log('Background task already running');
      return;
    }

    // Start background task
    await BackgroundActions.start(backgroundTask, backgroundTaskOptions);
    console.log('Background location tracking started');
  } catch (error) {
    console.error('Error starting background task:', error.message);
  }
};

// Stop location tracking
export const stopLocationTracking = async () => {
  try {
    if (await BackgroundActions.isRunning()) {
      await BackgroundActions.stop();
      console.log('Background location tracking stopped');
    }
  } catch (error) {
    console.error('Error stopping background task:', error.message);
  }
};