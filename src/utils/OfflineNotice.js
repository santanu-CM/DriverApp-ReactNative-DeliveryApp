import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, StyleSheet, Platform } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import { SafeAreaView } from 'react-native-safe-area-context';
import { responsiveHeight } from 'react-native-responsive-dimensions';
const { width } = Dimensions.get('window');


export default function OfflineNotice({ navigation }) {

    const [isConnected, setIsConnected] = useState(true)

    useEffect(() => {

        const unsubscribe = NetInfo.addEventListener(state => {
            console.log('Is connected?', state.isInternetReachable);

            const connection = state.isInternetReachable;
            handleConnectivityChange(connection)

        });
        return () => unsubscribe();

    }, []);

    const handleConnectivityChange = isConnected => {
        setIsConnected(isConnected)
    };


    if (isConnected === false) {

        return (
            <SafeAreaView style={styles.offlineContainer}>
                <Text style={styles.offlineText}>No Internet Connection</Text>
            </SafeAreaView>
        )
    }
    return null;


}
const styles = StyleSheet.create({
    offlineContainer: {
        backgroundColor: '#b52424',
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Platform.OS == 'ios' ? responsiveHeight(6) : 0,

    },
    offlineText: { color: '#fff' }
});