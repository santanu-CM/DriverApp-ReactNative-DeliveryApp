import React, { useState, useContext, useEffect } from 'react'
import { View, Text, SafeAreaView, StyleSheet, ScrollView, ImageBackground, Image, TouchableOpacity, Switch } from 'react-native'
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
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message'

const AvailabilityScreen = ({ navigation }) => {
    const { logout } = useContext(AuthContext);
    const [userInfo, setuserInfo] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isEnabledSunday, setIsEnabledSunday] = useState(false);
    const toggleSwitchSunday = () => setIsEnabledSunday(previousState => !previousState);
    const [isEnabledMonday, setIsEnabledMonday] = useState(false);
    const toggleSwitchMonday = () => setIsEnabledMonday(previousState => !previousState);
    const [isEnabledTuesday, setIsEnabledTuesday] = useState(false);
    const toggleSwitchTuesday = () => setIsEnabledTuesday(previousState => !previousState);
    const [isEnabledWednesday, setIsEnabledWednesday] = useState(false);
    const toggleSwitchWednesday = () => setIsEnabledWednesday(previousState => !previousState);
    const [isEnabledThursday, setIsEnabledThursday] = useState(false);
    const toggleSwitchThursday = () => setIsEnabledThursday(previousState => !previousState);
    const [isEnabledFriday, setIsEnabledFriday] = useState(false);
    const toggleSwitchFriday = () => setIsEnabledFriday(previousState => !previousState);
    const [isEnabledSaturday, setIsEnabledSaturday] = useState(false);
    const toggleSwitchSaturday = () => setIsEnabledSaturday(previousState => !previousState);

    const fetchProfileDetails = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.get(`${API_URL}/api/driver/driver-profile`, { 
                headers: {
                    "Authorization": 'Bearer ' + usertoken,
                    "Content-Type": 'application/json'
                },
            })
                .then(res => {
                    let userInfo = res.data.response.records.data;
                    console.log(userInfo, 'user info from Availability page')
                    setuserInfo(userInfo)
                    if (userInfo.sunday == 'Active') {
                        setIsEnabledSunday(true)
                    } else {
                        setIsEnabledSunday(false)
                    }
                    if (userInfo.monday == 'Active') {
                        setIsEnabledMonday(true)
                    } else {
                        setIsEnabledMonday(false)
                    }
                    if (userInfo.tuesday == 'Active') {
                        setIsEnabledTuesday(true)
                    } else {
                        setIsEnabledTuesday(false)
                    }
                    if (userInfo.wednesday == 'Active') {
                        setIsEnabledWednesday(true)
                    } else {
                        setIsEnabledWednesday(false)
                    }
                    if (userInfo.thursday == 'Active') {
                        setIsEnabledThursday(true)
                    } else {
                        setIsEnabledThursday(false)
                    }
                    if (userInfo.friday == 'Active') {
                        setIsEnabledFriday(true)
                    } else {
                        setIsEnabledFriday(false)
                    }
                    if (userInfo.saturday == 'Active') {
                        setIsEnabledSaturday(true)
                    } else {
                        setIsEnabledSaturday(false)
                    }
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

    const submitForm = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            const option = {
                "sunday": isEnabledSunday ? 1 : 2,
                "monday": isEnabledMonday ? 1 : 2,
                "tuesday": isEnabledTuesday ? 1 : 2,
                "wednesday": isEnabledWednesday ? 1 : 2,
                "thursday": isEnabledThursday ? 1 : 2,
                "friday": isEnabledFriday ? 1 : 2,
                "saturday": isEnabledSaturday ? 1 : 2
            }
            axios.post(`${API_URL}/api/driver/update-driver-ability`, option, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'multipart/form-data',
                    "Authorization": 'Bearer ' + usertoken,
                },
            })
                .then(res => {
                    console.log(res.data)
                    if (res.data.response.status.code === 200) {
                        setIsLoading(false)
                        Toast.show({
                            type: 'success',
                            text1: 'Hello',
                            text2: "Update Successfully",
                            position: 'top',
                            topOffset: Platform.OS == 'ios' ? 55 : 20
                        });
                        fetchProfileDetails()
                    } else {
                        Alert.alert('Oops..', "Something went wrong", [
                            {
                                text: 'Cancel',
                                onPress: () => console.log('Cancel Pressed'),
                                style: 'cancel',
                            },
                            { text: 'OK', onPress: () => console.log('OK Pressed') },
                        ]);
                    }
                })
                .catch(e => {
                    setIsLoading(false)
                    console.log(`user update error ${e}`)
                    console.log(e.response.data?.response)
                    Alert.alert('Oops..', e.response.data?.response.records.message, [
                        {
                            text: 'Cancel',
                            onPress: () => console.log('Cancel Pressed'),
                            style: 'cancel',
                        },
                        { text: 'OK', onPress: () => console.log('OK Pressed') },
                    ]);
                });
        });

    }

    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'My Availability'} onPress={() => navigation.goBack()} title={'My Availability'} />
            <ScrollView style={styles.wrapper}>

                <View style={styles.table}>
                    <View style={styles.tableRow1}>
                        <View style={styles.cellmain}>
                            <Image
                                source={addressImg}
                                style={styles.iconImage}
                            />
                            <Text style={styles.tableHeader}>Select day for availability</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderBottomColor: '#E0E0E0', borderBottomWidth: 1, paddingVertical: 20 }}>
                        <Text style={{ fontSize: 15, fontFamily: 'Outfit-Medium', marginLeft: 5, color: '#3A3232' }}>Sunday </Text>
                        <Switch
                            trackColor={{ false: '#767577', true: '#339999' }}
                            thumbColor={isEnabledSunday ? '#f4f3f4' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleSwitchSunday}
                            value={isEnabledSunday}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderBottomColor: '#E0E0E0', borderBottomWidth: 1, paddingVertical: 20 }}>
                        <Text style={{ fontSize: 15, fontFamily: 'Outfit-Medium', marginLeft: 5, color: '#3A3232' }}>Monday </Text>
                        <Switch
                            trackColor={{ false: '#767577', true: '#339999' }}
                            thumbColor={isEnabledMonday ? '#f4f3f4' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleSwitchMonday}
                            value={isEnabledMonday}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderBottomColor: '#E0E0E0', borderBottomWidth: 1, paddingVertical: 20 }}>
                        <Text style={{ fontSize: 15, fontFamily: 'Outfit-Medium', marginLeft: 5, color: '#3A3232' }}>Tuesday </Text>
                        <Switch
                            trackColor={{ false: '#767577', true: '#339999' }}
                            thumbColor={isEnabledTuesday ? '#f4f3f4' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleSwitchTuesday}
                            value={isEnabledTuesday}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderBottomColor: '#E0E0E0', borderBottomWidth: 1, paddingVertical: 20 }}>
                        <Text style={{ fontSize: 15, fontFamily: 'Outfit-Medium', marginLeft: 5, color: '#3A3232' }}>Wednesday </Text>
                        <Switch
                            trackColor={{ false: '#767577', true: '#339999' }}
                            thumbColor={isEnabledWednesday ? '#f4f3f4' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleSwitchWednesday}
                            value={isEnabledWednesday}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderBottomColor: '#E0E0E0', borderBottomWidth: 1, paddingVertical: 20 }}>
                        <Text style={{ fontSize: 15, fontFamily: 'Outfit-Medium', marginLeft: 5, color: '#3A3232' }}>Thursday </Text>
                        <Switch
                            trackColor={{ false: '#767577', true: '#339999' }}
                            thumbColor={isEnabledThursday ? '#f4f3f4' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleSwitchThursday}
                            value={isEnabledThursday}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderBottomColor: '#E0E0E0', borderBottomWidth: 1, paddingVertical: 20 }}>
                        <Text style={{ fontSize: 15, fontFamily: 'Outfit-Medium', marginLeft: 5, color: '#3A3232' }}>Friday </Text>
                        <Switch
                            trackColor={{ false: '#767577', true: '#339999' }}
                            thumbColor={isEnabledFriday ? '#f4f3f4' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleSwitchFriday}
                            value={isEnabledFriday}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderBottomColor: '#E0E0E0', borderBottomWidth: 1, paddingVertical: 20 }}>
                        <Text style={{ fontSize: 15, fontFamily: 'Outfit-Medium', marginLeft: 5, color: '#3A3232' }}>Saturday </Text>
                        <Switch
                            trackColor={{ false: '#767577', true: '#339999' }}
                            thumbColor={isEnabledSaturday ? '#f4f3f4' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleSwitchSaturday}
                            value={isEnabledSaturday}
                        />
                    </View>
                </View>

            </ScrollView>
            <View style={styles.buttonwrapper2}>
                <CustomButton label={"Update availability"} onPress={() => { submitForm() }} />
            </View>
        </SafeAreaView>
    )
}

export default AvailabilityScreen

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
    buttonwrapper2: {
        padding: 20,
        position: 'absolute',
        bottom: 0,
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
    iconDetails: {
        color: '#339999',
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
        height: responsiveHeight(68),
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
