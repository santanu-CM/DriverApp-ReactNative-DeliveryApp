import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';
import { Platform } from 'react-native';
import BackgroundActions from 'react-native-background-actions';

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

            const response = await axios.post(`${API_URL}/api/driver/driver-live-location-get`, option, {
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

const backgroundTaskOptions = {
    taskName: 'LocationUpdates',
    taskTitle: 'Location Tracking',
    taskDesc: 'Sending location updates',
    taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
    },
    color: '#ff00ff',
    linkingURI: 'yourapp://location', // Deep linking URI (optional)
    parameters: {
        delay: 120000 // 2 minutes in milliseconds
    },
    isForeground: true
};

const sleep = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

const backgroundTask = async () => {
    await new Promise(async () => {
        while (true) {
            // Get current location and send to server
            // Geolocation.getCurrentPosition(
            //     position => {
            //         const { latitude, longitude } = position.coords;
            //         console.log("Background Location:", latitude, longitude);
            //         sendLocationToServer(latitude, longitude);
            //     },
            //     error => console.log("Error getting location:", error),
            //     { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            // );
            Geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude, heading } = position.coords;
                    console.log("Background Location:", latitude, longitude);
                    console.log(position,'positionpositionpositionposition')
                    sendLocationToServer(latitude, longitude, heading);
                },
                error => {
                    console.log("Error getting location:", error);
                    if (error.code === 3) {
                        console.log("Retrying location fetch...");
                        setTimeout(() => startLocationTracking(), 10000); // Retry after 10 seconds
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 60000,  // Increase timeout to 30 seconds
                    maximumAge: 10000,
                    distanceFilter: 10 // Fetch only if the user moves 10 meters
                }
            );
            
            await sleep(120000); // Wait for 5 minutes
        }
    });
};

export const startLocationTracking = async () => {
    if (Platform.OS === 'ios') {
        await Geolocation.requestAuthorization('always');
    }

    try {
        // Check if the task is already running
        const isRunning = await BackgroundActions.isRunning();
        if (!isRunning) {
            await BackgroundActions.start(backgroundTask, backgroundTaskOptions);
            console.log('Background location tracking started');
        }
    } catch (error) {
        console.log("Error starting background task:", error);
    }
};

export const stopLocationTracking = async () => {
    try {
        await BackgroundActions.stop();
        console.log('Background location tracking stopped');
    } catch (error) {
        console.log("Error stopping background task:", error);
    }
};
