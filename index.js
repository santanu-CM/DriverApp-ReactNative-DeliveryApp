/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
// import { initializeApp } from '@react-native-firebase/app';
import 'react-native-gesture-handler';
import 'react-native-get-random-values';

// const firebaseConfig = {
//     apiKey: 'AIzaSyC-vCkuuBqnsZcSwSXvMDMyHM88-NssTCQ',
//     authDomain: 'your-auth-domain',
//     projectId: 'driverapp-dd55a',
//     storageBucket: 'driverapp-dd55a.appspot.com',
//     databseURL: 'https://driverapp-dd55a-default-rtdb.firebaseio.com/',
//     messagingSenderId: 'your-messaging-sender-id',
//     appId: '1:705575053072:android:03482b18254c411a7b2795',
//   };

// const app = initializeApp(firebaseConfig);

// if (!app) {
//   throw new Error('Firebase is not initialized!');
// }

AppRegistry.registerComponent(appName, () => App);
