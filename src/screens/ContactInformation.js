import React, { useState, useContext, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, ImageBackground, Image, TouchableOpacity } from 'react-native'
import CheckBox from '@react-native-community/checkbox'
import CustomHeader from '../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TextInput, LongPressGestureHandler, State } from 'react-native-gesture-handler'
import { phoneImg, emailImg, userPhoto, addressImg, bankDetailsImg, documentImg, reviewImg, deleteImg } from '../utils/Images'
import CustomButton from '../components/CustomButton'
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Modal from "react-native-modal";
import Icon from 'react-native-vector-icons/Entypo';
import axios from 'axios';
import { API_URL } from '@env'
import Loader from '../utils/Loader'
import { useFocusEffect, useNavigation } from '@react-navigation/native'; 
import { SafeAreaView } from 'react-native-safe-area-context';

const ContactInformation = ({  }) => {
    const navigation = useNavigation();
    const { logout } = useContext(AuthContext);
    const [userInfo, setuserInfo] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalVisible, setModalVisible] = useState(false);


    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const fetchProfileDetails = () => { 
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.get(`${process.env.API_URL}/api/driver/driver-profile`, {
                headers: {
                    "Authorization": 'Bearer ' + usertoken,
                    "Content-Type": 'application/json'
                },
            })
                .then(res => {
                    let userInfo = res.data.response.records.data;
                    console.log(userInfo,'user data from contact informmation')
                    setuserInfo(userInfo)
                    setIsLoading(false);
                })
                .catch(e => {
                    console.log(`Profile error ${e}`)
                });
        });
    }

    useEffect(() => {
        fetchProfileDetails()
    }, [])
    useFocusEffect(
        React.useCallback(() => {
            fetchProfileDetails()
        }, [])
    )

    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Profile'} onPress={() => navigation.goBack()} title={'Contact Information'} />
            <ScrollView style={styles.wrapper}>
                <View style={styles.mainView}>
                    {userInfo?.profilePic ?
                        <Image
                            source={{ uri: userInfo?.profilePic + '?' + new Date()}}
                            style={styles.headerImage}
                        /> :
                        <Image
                            source={userPhoto}
                            style={styles.headerImage}
                        />
                    }
                    <Text style={styles.maintext}>{userInfo.name}</Text>
                    <View style={styles.imageView}>
                        <Image
                            source={phoneImg}
                            style={styles.iconImage}
                        />
                        <Text style={styles.iconText}>{userInfo.phone}</Text>
                    </View>
                    <View style={styles.imageView}>
                        {userInfo?.email ?
                            <>
                                <Image
                                    source={emailImg}
                                    style={styles.iconImage}
                                />
                                <Text style={styles.iconText}>{userInfo.email}</Text>
                            </>
                            : <></>}
                    </View>
                </View>
                <View style={styles.table}>
                    <View style={styles.tableRow1}>
                        <View style={styles.cellmain}>
                            <Image
                                source={addressImg}
                                style={styles.iconImage}
                            />
                            <Text style={styles.tableHeader}>Address</Text>
                        </View>
                    </View>
                    <View style={{ justifyContent: 'center', alignItems: 'center', alignSelf: 'center', padding: 25 }}>
                        <Text style={styles.iconText}>{userInfo?.address} {userInfo?.city} {userInfo?.zipcode} </Text>
                    </View>
                </View>

            </ScrollView>
            <View style={styles.buttonwrapper2}>
                <CustomButton label={"Edit"} onPress={() => { navigation.navigate('EditContactInformation') }} />
            </View>
        </SafeAreaView>
    )
}

export default ContactInformation

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    wrapper: {
        padding: 20,
        marginBottom: responsiveHeight(1)
    },
    headerImage: {
        width: 90,
        height: 90,
        borderRadius: 90 / 2,
        marginBottom: 10
    },
    iconImage: {
        width: 20,
        height: 20,
        marginRight: 10
    },
    buttonwrapper1: {
        padding: 20,
        position: 'absolute',
        bottom: 70,
        width: responsiveWidth(100)
    },
    mainView: {
        flexDirection: 'column',
        alignItems: 'center',
        borderBottomColor: '#E3E3E3',
        //borderBottomWidth: 1,
        paddingBottom: 20
    },
    maintext: {
        color: '#2F2F2F',
        fontFamily: 'Outfit-Bold',
        fontSize: responsiveFontSize(3),
        marginBottom: 5
    },
    subtext: {
        color: '#9C9C9C',
        fontFamily: 'Outfit-Medium',
        fontSize: responsiveFontSize(2),
        marginBottom: 5
    },
    imageView: {
        flexDirection: 'row',
        marginBottom: 10
    },
    iconText: {
        color: '#9C9C9C',
        fontFamily: 'Outfit-Medium',
        fontSize: responsiveFontSize(2),

    },
    deviceText: {
        color: '#9C9C9C',
        fontFamily: 'Outfit-Medium',
        fontSize: responsiveFontSize(2),
        marginBottom: 10
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10
    },
    editButtonView: {
        backgroundColor: '#4B47FF',
        height: responsiveHeight(5),
        width: responsiveWidth(25),
        borderRadius: 8,
        marginLeft: 5,
        marginRight: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly'
    },
    editButtonText: {
        color: '#FFFFFF',
        fontFamily: 'Outfit-Medium',
        fontSize: responsiveFontSize(2)
    },
    deleteButtonView: {
        backgroundColor: '#EEEEEE',
        height: responsiveHeight(5),
        width: responsiveWidth(25),
        borderRadius: 8,
        marginLeft: 5,
        marginRight: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly'
    },
    deleteButtonText: {
        color: '#EB0000',
        fontFamily: 'Outfit-Medium',
        fontSize: responsiveFontSize(2)
    },
    firstCardView: {
        height: responsiveHeight(13),
        width: responsiveWidth(42),
        backgroundColor: '#F6F6F6',
        borderRadius: 8,
        padding: 10,
        borderColor: '#E0E0E0',
        borderWidth: 1
    },
    buttonwrapper: {
        paddingHorizontal: 20,
        paddingTop: 10,
        width: '100%'
    },
    table: {
        borderWidth: 1,
        borderColor: '#ddd',
        //margin: 10,
        width: responsiveWidth(89),
        height: responsiveHeight(25),
        borderRadius: 10
    },
    tableRow1: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#ddd',
        height: responsiveHeight(7),
        backgroundColor: '#DEFFFF',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10
    },
    cellmain: {
        flex: 1,
        padding: 10,
        flexDirection: 'row',
        //justifyContent: 'center',
        alignItems: 'center',
    },
    tableHeader: {
        color: '#444444',
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(2),
        fontWeight: 'bold',
        textAlign: 'left',
    },
    buttonwrapper2: {
        padding: 20,
        position: 'absolute',
        bottom: 0,
        width: responsiveWidth(100)
    },
});
