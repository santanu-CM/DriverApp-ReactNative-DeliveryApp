import React from 'react';
import {
    View,
    ActivityIndicator,
    StyleSheet
} from 'react-native';

export default function Loader({ navigation }) {
    return (
        <View style={styles.Container}>
            <ActivityIndicator
                size="large" color={'#339999'}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 20
    }
});

