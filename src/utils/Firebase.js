import * as firebase from "firebase/app"

const firebaseConfig = {
    apiKey: "AIzaSyChFYRkMqCB88u8TLlGdExY_siS9fYDhHM",
    authDomain: 'kaya-14e2a.firebaseapp.com',
    projectId: 'kaya-14e2a',
    storageBucket: 'kaya-14e2a.firebasestorage.app',
    messagingSenderId: '961524537832',
    appId: '1:961524537832:web:a65f4253cea0ccbcc86c5d',
    measurementId: "G-P7DJJ7MBSE"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export default firebase;
