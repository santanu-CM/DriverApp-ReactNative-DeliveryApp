// src/services/LocationService.js
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

// Global variables to track state
let intervalId = null;
let isRunning = false;

// Send location to server
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

    // Check if location is unchanged (with small tolerance for GPS variations)
    if (lastCoords && 
        Math.abs(lastCoords.latitude - latitude) < 0.0001 && 
        Math.abs(lastCoords.longitude - longitude) < 0.0001) {
      console.log('Location unchanged, skipping API call.');
      return;
    }

    console.log('Sending location:', { latitude, longitude, heading });

    const response = await axios.post(
      `${process.env.API_URL}/api/driver/driver-live-location-get`,
      {
        driver_lat: latitude,
        driver_long: longitude,
        heading: heading || 0,
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout for API call
      }
    );

    console.log('Location sent successfully:', response.data);

    // Save new location after successful API call
    await AsyncStorage.setItem('lastLocation', JSON.stringify({ latitude, longitude }));
  } catch (error) {
    console.error('Error sending location:', error.message);
  }
};

// Get current location with retry logic
const getCurrentLocation = (retryCount = 0) => {
  return new Promise((resolve, reject) => {
    const maxRetries = 3;
    
    // Different options based on retry attempt
    const getLocationOptions = (attempt) => {
      if (attempt === 0) {
        // First attempt: High accuracy
        return {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000, // Accept cached location up to 30 seconds old
        };
      } else if (attempt === 1) {
        // Second attempt: Medium accuracy, longer timeout
        return {
          enableHighAccuracy: false,
          timeout: 20000,
          maximumAge: 60000, // Accept cached location up to 1 minute old
        };
      } else {
        // Final attempt: Any accuracy, longest timeout
        return {
          enableHighAccuracy: false,
          timeout: 30000,
          maximumAge: 300000, // Accept cached location up to 5 minutes old
        };
      }
    };

    const options = getLocationOptions(retryCount);
    
    console.log(`Getting location (attempt ${retryCount + 1}/${maxRetries + 1}) with options:`, options);

    Geolocation.getCurrentPosition(
      (position) => {
        console.log(`Location obtained on attempt ${retryCount + 1}:`, position.coords);
        resolve(position);
      },
      (error) => {
        console.log(`Location error on attempt ${retryCount + 1}:`, error);
        
        if (retryCount < maxRetries) {
          console.log(`Retrying location request (${retryCount + 1}/${maxRetries})...`);
          // Retry with different settings
          setTimeout(() => {
            getCurrentLocation(retryCount + 1).then(resolve).catch(reject);
          }, 1000); // Wait 1 second before retry
        } else {
          // All retries failed, try to get last known location as fallback
          getLastKnownLocation()
            .then((lastLocation) => {
              if (lastLocation) {
                console.log('Using last known location as fallback');
                resolve({
                  coords: {
                    latitude: lastLocation.latitude,
                    longitude: lastLocation.longitude,
                    heading: lastLocation.heading || 0,
                  }
                });
              } else {
                reject(error);
              }
            })
            .catch(() => reject(error));
        }
      },
      options
    );
  });
};

// Get last known location from AsyncStorage
const getLastKnownLocation = async () => {
  try {
    const lastLocation = await AsyncStorage.getItem('lastLocation');
    return lastLocation ? JSON.parse(lastLocation) : null;
  } catch (error) {
    console.error('Error getting last known location:', error);
    return null;
  }
};

// Get location and send to server with better error handling
const getCurrentLocationAndSend = async () => {
  try {
    console.log('Starting location request...');
    const position = await getCurrentLocation();
    const { latitude, longitude, heading } = position.coords;
    
    // Validate coordinates
    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      console.error('Invalid coordinates received:', { latitude, longitude });
      return;
    }
    
    console.log('Valid location obtained:', { latitude, longitude, heading });
    await sendLocationToServer(latitude, longitude, heading);
  } catch (error) {
    console.error('Failed to get and send location after all retries:', error);
    
    // Log specific error types for debugging
    switch (error.code) {
      case 1:
        console.error('Location permission denied');
        break;
      case 2:
        console.error('Location position unavailable');
        break;
      case 3:
        console.error('Location request timed out');
        break;
      case 4:
        console.error('Location activity null');
        break;
      default:
        console.error('Unknown location error');
    }
  }
};

// Start location tracking every 2 minutes
const startLocationService = async () => {
  if (isRunning) {
    console.log('Location service is already running');
    return;
  }

  console.log('Starting location service - sending every 2 minutes');
  isRunning = true;

  // Send location immediately (with delay to ensure app is ready)
  setTimeout(async () => {
    await getCurrentLocationAndSend();
  }, 2000);

  // Set up interval to send location every 2 minutes (120000 ms)
  intervalId = setInterval(async () => {
    await getCurrentLocationAndSend();
  }, 120000); // 2 minutes
};

// Stop location tracking
const stopLocationService = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    isRunning = false;
    console.log('Location service stopped');
  }
};

// Restart location tracking
const restartLocationService = async () => {
  console.log('Restarting location service...');
  stopLocationService();
  // Add small delay before restarting
  setTimeout(async () => {
    await startLocationService();
  }, 1000);
};

// Check if service is running
const isLocationServiceRunning = () => {
  return isRunning;
};

// Update interval (in milliseconds)
const updateLocationInterval = async (intervalMs) => {
  if (isRunning) {
    stopLocationService();
    
    console.log(`Starting location service with ${intervalMs}ms interval`);
    isRunning = true;

    // Send location immediately
    setTimeout(async () => {
      await getCurrentLocationAndSend();
    }, 1000);

    // Set up new interval
    intervalId = setInterval(async () => {
      await getCurrentLocationAndSend();
    }, intervalMs);

    console.log(`Location service updated to ${intervalMs}ms interval`);
  }
};

// Get location once (without starting service)
const getLocationOnce = async () => {
  try {
    console.log('Getting single location...');
    const position = await getCurrentLocation();
    const { latitude, longitude, heading } = position.coords;
    console.log('Single location obtained:', { latitude, longitude, heading });
    return { latitude, longitude, heading };
  } catch (error) {
    console.error('Error getting single location:', error);
    
    // Try to return last known location as fallback
    const lastLocation = await getLastKnownLocation();
    if (lastLocation) {
      console.log('Returning last known location');
      return lastLocation;
    }
    
    return null;
  }
};

// Send current location immediately (without starting service)
const sendCurrentLocation = async () => {
  console.log('Sending current location immediately...');
  await getCurrentLocationAndSend();
};

// Clear location cache (useful for testing)
const clearLocationCache = async () => {
  try {
    await AsyncStorage.removeItem('lastLocation');
    console.log('Location cache cleared');
  } catch (error) {
    console.error('Error clearing location cache:', error);
  }
};

// Get location service status
const getLocationServiceStatus = () => {
  return {
    isRunning,
    intervalId: intervalId !== null,
  };
};

// Export all functions
export {
  startLocationService,
  stopLocationService,
  restartLocationService,
  isLocationServiceRunning,
  updateLocationInterval,
  getLocationOnce,
  sendCurrentLocation,
  sendLocationToServer,
  getCurrentLocation,
  getLastKnownLocation,
  clearLocationCache,
  getLocationServiceStatus,
};

// Default export for convenience
export default {
  start: startLocationService,
  stop: stopLocationService,
  restart: restartLocationService,
  isRunning: isLocationServiceRunning,
  updateInterval: updateLocationInterval,
  getLocationOnce,
  sendCurrentLocation,
  sendLocationToServer,
  getCurrentLocation,
  getLastKnownLocation,
  clearLocationCache,
  getStatus: getLocationServiceStatus,
};