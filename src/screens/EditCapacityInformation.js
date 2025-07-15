import React, { useState, useContext, useEffect } from 'react'
import { View, Text, SafeAreaView, StyleSheet, ScrollView, Alert, Image, TouchableOpacity, KeyboardAvoidingView } from 'react-native'
import CheckBox from '@react-native-community/checkbox'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { Dropdown } from 'react-native-element-dropdown';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import DocumentPicker from '@react-native-documents/picker';
import { TextInput, LongPressGestureHandler, State } from 'react-native-gesture-handler'
import { deleteImg, editImg, phoneImg, plus, searchImg, userPhoto } from '../utils/Images'
import CustomHeader from '../components/CustomHeader'
import CustomButton from '../components/CustomButton'
import InputField from '../components/InputField';
import { AuthContext } from '../context/AuthContext';
import { useHeaderHeight } from "@react-navigation/elements";
import Loader from '../utils/Loader';
import { API_URL } from '@env'
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from 'react-native-toast-message';


const EditCapacityInformation = ({ navigation, route }) => {
    // const { userInfo } = useContext(AuthContext);
    const [isFocus, setIsFocus] = useState(false);
    const [isLoading, setIsLoading] = useState(true)
    const [vehicleType, setvehicleType] = useState('');
    const [vehicleTypeError, setvehicleTypeError] = useState('')
    const [VehicleRegistration, setVehicleRegistration] = useState(''); 
    const [VehicleRegistrationError, setVehicleRegistrationError] = useState('')
    const [Maximumpayload, setMaximumpayload] = useState('');
    const [MaximumpayloadError, setMaximumpayloadError] = useState('')
    const [Vehiclecontainerwidth, setVehiclecontainerwidth] = useState('');
    const [VehiclecontainerError, setVehiclecontainerError] = useState('')
    const [Vehiclecontainerheight, setVehiclecontainerheight] = useState('');
    const [userInfo, setuserInfo] = useState([])

    const headerHeight = useHeaderHeight();

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
                    console.log(userInfo)
                    setuserInfo(userInfo)
                    setvehicleType(userInfo?.vehicleType)
                    setVehicleRegistration(userInfo?.vehicleRegNo)
                    setMaximumpayload(userInfo?.maxPayload)
                    setVehiclecontainerwidth(userInfo?.vehicleContCapacity)
                    setVehiclecontainerheight(userInfo?.vehicleContCapacityHeight)
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

    const changevehicleType = (text) => {
        setvehicleType(text)
        if (text) {
            setvehicleTypeError('')
        } else {
            setvehicleTypeError('Please enter Vehicle type')
        }
    }

    const changeVehicleRegistration = (text) => {
        setVehicleRegistration(text)
        if (text) {
            setVehicleRegistrationError('')
        } else {
            setVehicleRegistrationError('Please enter Vehicle Registration Number')
        }
    }

    const changeMaximumpayload = (text) => {
        setMaximumpayload(text)
        if (text) {
            setMaximumpayloadError('')
        } else {
            setMaximumpayloadError('Please enter Maximum payload')
        }
    }

    const changeVehiclecontainer = (text) => {
        setVehiclecontainerwidth(text)
        // if (text) {
        //     setVehiclecontainerError('')
        // } else {
        //     setVehiclecontainerError('Please enter Vehicle container capacity')
        // }
    }

    const changeVehiclecontainerheight = (text) =>{
        setVehiclecontainerheight(text)
        // if (text) {
        //   setVehiclecontainerError('')
        // } else {
        //   setVehiclecontainerError('Please enter Vehicle container capacity')
        // }
      }


    const updateProfile = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            if (!vehicleType) {
                setvehicleTypeError('Please enter Vehicle type')
            } else if (!VehicleRegistration) {
                setVehicleRegistrationError('Please enter Vehicle Registration Number')
            } else if (!Maximumpayload) {
                setMaximumpayloadError('Please enter Maximum payload')
            } else {
                setIsLoading(true)
                var option = {
                    "vehicleType": vehicleType,
                    "vehicleRegNo": VehicleRegistration,
                    "maxPayload": Maximumpayload,
                    "vehicleContCapacity": Vehiclecontainerwidth,
                    "vehicleContCapacityHeight": Vehiclecontainerheight
                }
                axios.post(`${process.env.API_URL}/api/driver/submit-info`, option, {
                    headers: {
                        Accept: 'application/json',
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
                                text2: res.data.response.status.message,
                                position: 'top',
                                topOffset: Platform.OS == 'ios' ? 55 : 20
                            });
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
                        console.log(e.response.data?.response.records)
                        Alert.alert('Oops..', e.response.data?.response.records.message, [
                            {
                                text: 'Cancel',
                                onPress: () => console.log('Cancel Pressed'),
                                style: 'cancel',
                            },
                            { text: 'OK', onPress: () => console.log('OK Pressed') },
                        ]);
                    });
            }
        });

    }


    if (isLoading) {
        return (
            <Loader />
        )
    }
    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Edit Capacity Details'} onPress={() => navigation.goBack()} title={'Edit Capacity Details'} />
            <KeyboardAwareScrollView>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={styles.textinputview}>
                        <Text
                            style={styles.header}>
                            Vehicle type
                        </Text>
                        {vehicleTypeError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{vehicleTypeError}</Text> : <></>}
                        <View style={styles.inputView}>
                            <InputField
                                label={'vehicle type'}
                                keyboardType=" "
                                value={vehicleType}
                                helperText={vehicleTypeError}
                                inputType={'others'}
                                onChangeText={(text) => changevehicleType(text)}
                            />
                        </View>
                        <Text
                            style={styles.header}>
                            Vehicle Registration Number
                        </Text>
                        {VehicleRegistrationError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{VehicleRegistrationError}</Text> : <></>}
                        <View style={styles.inputView}>
                            <InputField
                                label={'e.g. 5234324'}
                                keyboardType=" "
                                value={VehicleRegistration}
                                helperText={VehicleRegistrationError}
                                inputType={'others'}
                                onChangeText={(text) => changeVehicleRegistration(text)}
                            />
                        </View>
                        <Text
                            style={styles.header}>
                            Maximum payload (weight in KG)
                        </Text>
                        {MaximumpayloadError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{MaximumpayloadError}</Text> : <></>}
                        <View style={styles.inputView}>
                            <InputField
                                label={'e.g. 534'}
                                keyboardType=" "
                                value={Maximumpayload}
                                helperText={MaximumpayloadError}
                                inputType={'others'}
                                onChangeText={(text) => changeMaximumpayload(text)}
                            />
                        </View>
                        <Text
                            style={styles.header}>
                            Vehicle container capacity (width in Feet)
                        </Text>
                        {/* {VehiclecontainerError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{VehiclecontainerError}</Text> : <></>} */}
                        <View style={styles.inputView}>
                            <InputField
                                label={'e.g. 20'}
                                keyboardType=" "
                                value={Vehiclecontainerwidth}
                                helperText={VehiclecontainerError}
                                inputType={'others'}
                                onChangeText={(text) => changeVehiclecontainer(text)}
                            />
                        </View>
                        <Text
                            style={styles.header}>
                            Vehicle container capacity (height in Feet)
                        </Text>
                        {/* {VehiclecontainerError?<Text style={{color:'red',fontFamily:'Outfit-Regular'}}>{VehiclecontainerError}</Text>:<></>} */}
                        <View style={styles.inputView}>
                            <InputField
                                label={'e.g. 20'}
                                keyboardType=" "
                                value={Vehiclecontainerheight}
                                helperText={VehiclecontainerError}
                                inputType={'others'}
                                onChangeText={(text) => changeVehiclecontainerheight(text)}
                            />
                        </View>
                    </View>


                </ScrollView>
                <View style={styles.buttonwrapper}>
                    <CustomButton label={"Update Changes"} buttonIcon={false} onPress={() => updateProfile()} />
                </View>
            </KeyboardAwareScrollView>

        </SafeAreaView>
    )
}

export default EditCapacityInformation

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    wrapper: {
        padding: 20,
        marginBottom: responsiveHeight(1)
    },
    textinputview: {
        marginTop: responsiveHeight(5),
        paddingHorizontal: 20,
    },
    mobileinputview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        //marginBottom: responsiveHeight(5),
        paddingHorizontal: 20
    },
    imageView: {
        marginTop: responsiveHeight(4),
        paddingHorizontal: 20,
        alignSelf: 'center'
    },
    imageStyle: {
        height: 90,
        width: 90,
        borderRadius: 40,
        marginBottom: 10
    },
    plusIcon: {
        position: 'absolute',
        bottom: 10,
        left: 75
    },
    inputView: {
        //paddingVertical: 2
    },
    dropdown: {
        height: responsiveHeight(8),
        borderColor: 'gray',
        borderWidth: 0.7,
        borderRadius: 4,
        paddingHorizontal: 8,
        marginTop: 5,
        marginBottom: responsiveHeight(4)
    },
    placeholderStyle: {
        fontSize: 16,
    },
    selectedTextStyle: {
        fontSize: 16,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
    },
    dropdownView: {
        marginBottom: 35,
        paddingHorizontal: 20,
    },
    buttonwrapper: {
        padding: 20,
        // position: 'absolute',
        // bottom: 0,
        width: responsiveWidth(100),
        paddingBottom: responsiveHeight(8)
    },
    tableHeader: {
        color: '#444444',
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(2),
        fontWeight: 'bold',
        textAlign: 'left',
    },
    tableHeader: {
        color: '#444444',
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(2),
        fontWeight: 'bold',
        textAlign: 'center',
    },
    header: {
        fontFamily: 'Outfit-Medium',
        fontSize: responsiveFontSize(2),
        color: '#2F2F2F',
        marginBottom: responsiveHeight(1),
        textAlign: 'left',
        marginTop: -10
    },
});