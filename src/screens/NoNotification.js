import React from 'react'
import { View, Text, SafeAreaView, StyleSheet, ScrollView, ImageBackground, Image } from 'react-native'
import CustomHeader from '../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { notificationImg, notifyImg } from '../utils/Images'
import { useNavigation } from '@react-navigation/native'


const NoNotification = ({  }) => {
    const navigation = useNavigation();
    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Notification'} onPress={() => navigation.goBack()} title={'Notification'} />
            <ScrollView style={styles.wrapper}>
                <View style={{justifyContent:'center',alignItems:'center',marginTop: responsiveHeight(15)}}>
                    <Image source={notificationImg} style={styles.iconImage} tintColor={'#339999'} />
                    <Text style={{color:'#3A3232',fontFamily:'Outfit-Medium',fontSize: responsiveFontSize(2),marginVertical: responsiveHeight(2)}}>No Notification Yet</Text>
                    <Text style={{color:'#949494',fontFamily:'Outfit-Medium',fontSize: responsiveFontSize(2),textAlign:'center'}}>No Notification right now. notifications about your activity will show up here</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}


export default NoNotification

 
const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    wrapper: {
        padding: 20,
        marginBottom: responsiveHeight(1),
        flex: 3,
    },
    iconImage: {
        height: responsiveHeight(30),
        width: responsiveWidth(30),
        resizeMode: 'contain'
    }

});