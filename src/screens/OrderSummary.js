import React, { useState, useContext, useEffect } from 'react'
import { View, Text, SafeAreaView, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity } from 'react-native'
import * as Animatable from 'react-native-animatable';
import CustomHeader from '../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TextInput, LongPressGestureHandler, State } from 'react-native-gesture-handler'
import { addressWhiteImg, dubbleArrowImg, downloadImg, searchImg, userPhoto, acceptImg, declineImg, successImg } from '../utils/Images'
import CustomButton from '../components/CustomButton'
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { API_URL } from '@env'
import Loader from '../utils/Loader'
import { useFocusEffect } from '@react-navigation/native';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import Accordion from 'react-native-collapsible/Accordion';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';


const OrderSummary = ({ route }) => {
    const navigation = useNavigation();
    const { logout } = useContext(AuthContext);
    const [userInfo, setuserInfo] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [orderType, setorderType] = useState(route?.params?.orderType);
    const [amount, setAmount] = useState(route?.params?.amount)
    const [collapsed, setCollapsed] = useState(true);



    useEffect(() => {
        console.log(orderType, 'order type from order summary page')
    }, [])
    useFocusEffect(
        React.useCallback(() => {
 
        }, [])
    )

    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Order Summary'} onPress={() => navigation.goBack()} title={'Order Summary'} />
            <ScrollView style={styles.wrapper}>
                <Image source={successImg} style={[styles.iconImage, { marginTop: responsiveWidth(3) }]} />
                {orderType == 'pickup' ?
                    <Text style={{ color: '#339999', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), textAlign: 'center', marginVertical: responsiveHeight(3) }}>Pickup Completed!</Text>
                    : orderType == 'delivery' ?
                        <Text style={{ color: '#339999', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), textAlign: 'center', marginVertical: responsiveHeight(3) }}>Delivery Completed!</Text>
                        :
                        <Text style={{ color: '#339999', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), textAlign: 'center', marginVertical: responsiveHeight(3) }}>Warehouse Delivery Completed!</Text>}
                {orderType == 'pickup' ?
                    <View style={styles.table}>
                        <View style={styles.toptableRow1}>
                            <View style={styles.topcellmain}>
                                <Text style={styles.toptableHeader1}>Total Earning</Text>
                            </View>
                        </View>
                        <View style={{ padding: 15, backgroundColor: '#E0E0E0', flexDirection: 'row', justifyContent: 'center' }}>
                            <Text style={styles.toptableHeader2}>Expected Earning </Text>
                            <Text style={styles.toptableHeader3}>₵{Number(amount).toFixed(2)} </Text>
                        </View>
                    </View> 
                    : orderType == 'delivery' ?
                        <View style={styles.table}>
                            <View style={styles.toptableRow1}>
                                <View style={styles.topcellmain}>
                                    <Text style={styles.toptableHeader1}>Total Earning</Text>
                                </View>
                            </View>
                            <View style={{ padding: 15, backgroundColor: '#E0E0E0', flexDirection: 'row', justifyContent: 'center' }}>
                                <Text style={styles.toptableHeader2}>Expected Earning </Text>
                                <Text style={styles.toptableHeader3}>₵{Number(amount).toFixed(2)} </Text>
                            </View>
                        </View>
                        : <></>}
            </ScrollView>
            <View style={styles.buttonwrapper}>
                <CustomButton label={"Continue to Homepage"}
                    // onPress={() => { login() }}
                    onPress={() => { navigation.push('OrderScreen') }}
                />
            </View>
        </SafeAreaView>
    )
}

export default OrderSummary

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    wrapper: {
        padding: 20,
        marginBottom: responsiveHeight(1)
    },
    headerText: {
        color: '#FFFFFF',
        fontFamily: 'Outfit-Medium',
        fontSize: responsiveFontSize(2),
        marginLeft: 10
    },
    questionView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: '#339999',
        borderColor: '#339999',
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 5
    },
    answerView: {
        //paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        borderColor: '#E0E0E0',
        borderWidth: 0,
        marginBottom: responsiveHeight(11)
    },
    iconImage: {
        width: 100,
        height: 100,
        alignSelf: 'center'
    },
    iconImage2: {
        width: 30,
        height: 30,
        marginRight: 10
    },
    buttonViewRed: {
        backgroundColor: '#FFF',
        borderColor: '#339999',
        borderWidth: 1,
        padding: 20,
        borderRadius: 8,
        marginBottom: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        height: responsiveHeight(8)
    },
    buttonTextRed: {
        fontFamily: 'Outfit-Medium',
        textAlign: 'center',
        fontWeight: '400',
        fontSize: 16,
        color: '#339999',
    },
    table: {
        borderWidth: 1,
        borderColor: '#ddd',
        //margin: 10,
        width: responsiveWidth(89),
        //height: responsiveHeight(56.4),
        borderRadius: 10,
        marginBottom: 10
    },
    tableRow1: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: '#ddd',
        height: responsiveHeight(9),
        backgroundColor: '#DEFFFF',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10
    },
    tableFooterRow1: {
        flexDirection: 'row',
        borderBottomWidth: 0,
        borderColor: '#E0E0E0',
        height: responsiveHeight(7),
        backgroundColor: '#F6F6F6',
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10
    },
    cellmain: {
        flex: 1,
        flexDirection: 'row',
        //justifyContent: 'center',
        alignItems: 'center',
    },
    cellFootermain: {
        flex: 1,
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    locationheader: {
        color: '#339999',
        fontFamily: 'Outfit-Medium',
        fontSize: responsiveFontSize(2),
        textAlign: 'left',
        marginBottom: 5
    },
    tableHeader1: {
        color: '#339999',
        fontFamily: 'Outfit-Medium',
        fontSize: responsiveFontSize(2),
        textAlign: 'left',
    },
    tableHeader2: {
        color: '#949494',
        fontFamily: 'Outfit-Medium',
        fontSize: responsiveFontSize(2),
        textAlign: 'left',
    },
    iconText: {
        color: '#9C9C9C',
        fontFamily: 'Outfit-Regular',
        fontSize: responsiveFontSize(2),

    },
    verticleLine: {
        height: '100%',
        width: 1,
        backgroundColor: '#E0E0E0',
    },
    toptableRow1: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#ddd',
        height: responsiveHeight(7),
        backgroundColor: '#339999',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10
    },
    toptableHeader1: {
        color: '#FFFFFF',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(2),
        textAlign: 'center',
    },
    toptableHeader2: {
        color: '#4D4B4B',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(2),
        textAlign: 'center',
    },
    toptableHeader3: {
        color: '#339999',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(2),
        textAlign: 'center',
    },
    topcellmain: {
        flex: 1,
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonwrapper: {
        paddingHorizontal: 20,
        position: 'absolute',
        bottom: 0,
        width: responsiveWidth(100)
    },
});
