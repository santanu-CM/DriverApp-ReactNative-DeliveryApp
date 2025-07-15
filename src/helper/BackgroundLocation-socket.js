import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import BackgroundActions from 'react-native-background-actions';
import { io } from 'socket.io-client';
import { API_URL } from '@env';

// Initialize socket connection
const socket = io(API_URL, { transports: ['websocket'] });

const sendLocationToServer = async (latitude, longitude) => {
    try {
        const userInfo = await AsyncStorage.getItem('userInfo');
        const storedStatus = await AsyncStorage.getItem('switchStatus');
        if (!userInfo || storedStatus !== 'on') return;

        console.log(`Sending Location: ${latitude}, ${longitude}`);

        // Emit location update to the server via Socket.IO
        socket.emit('locationUpdate', {
            latitude,
            longitude,
            token: userInfo.driver_id
        });

        // Store last location locally
        await AsyncStorage.setItem('lastLocation', JSON.stringify({ latitude, longitude }));

    } catch (error) {
        console.log("Error sending location:", error);
    }
};

const sleep = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

const backgroundTask = async () => {
    await new Promise(async () => {
        while (true) {
            Geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    console.log("Background Location:", latitude, longitude);
                    sendLocationToServer(latitude, longitude);
                },
                error => {
                    console.log("Error getting location:", error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 30000,
                    maximumAge: 10000,
                    distanceFilter: 10
                }
            );
            
            await sleep(120000); // Wait for 2 minutes
        }
    });
};

export const startLocationTracking = async () => {
    if (Platform.OS === 'ios') {
        await Geolocation.requestAuthorization('always');
    }

    try {
        const isRunning = await BackgroundActions.isRunning();
        if (!isRunning) {
            await BackgroundActions.start(backgroundTask, {
                taskName: 'LocationUpdates',
                taskTitle: 'Location Tracking',
                taskDesc: 'Sending location updates',
                taskIcon: { name: 'ic_launcher', type: 'mipmap' },
                color: '#ff00ff',
                parameters: { delay: 120000 },
                isForeground: true
            });
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
