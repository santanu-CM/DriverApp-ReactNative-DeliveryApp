import React, { useState, useContext, useEffect, useRef } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert
} from 'react-native';
import OTPInputView from '@twotalltotems/react-native-otp-input'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { API_URL } from '@env'
import axios from 'axios';
import CustomButton from '../components/CustomButton';
import InputField from '../components/InputField';
import { AuthContext } from '../context/AuthContext';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import Loader from '../utils/Loader';
import Toast from 'react-native-toast-message';

const OtpScreen = ({ navigation, route }) => {
    const [otp, setOtp] = useState('');
    const [errors, setError] = useState(true)
    const [errorText, setErrorText] = useState('Please enter OTP')
    const [isLoading, setIsLoading] = useState(false)

    const { login, userToken } = useContext(AuthContext);

    const inputRef = useRef();
    const onChangeCode = (code) => {
        setOtp(code) 
        setError(false)

    }

    const goToNextPage = (code) => {
        setIsLoading(true)
        //console.log(`Code is ${code}, you are good to go!`)
        //navigation.navigate('PersonalInformation', { phoneno: 2454545435, usertoken: 'sdfwr32432423424' })
        const option = {
            "phone": route?.params?.phoneno,
            "otp": code,
            "code": route?.params?.counterycode,
            "userId": route?.params?.userid,
        }
        axios.post(`${API_URL}/api/driver/validate-opt`, option)
            .then(res => {
                console.log(res.data)
                if (res.data.response.status.code === 200) {
                    setIsLoading(false)
                    if (res.data.response.records.user.name != "") {
                        login(res.data.response.records.token)
                    } else {
                        navigation.push('PersonalInformation', { phoneno: route?.params?.phoneno, countrycode: route?.params?.counterycode, usertoken: res.data?.response.records.token })
                    }

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
                console.log(`user register error ${e}`)
                //console.log(e.response.data?.response?.records?.message)
                Alert.alert('Oops..', e.response.data?.response?.records?.message, [
                    { text: 'OK', onPress: () => navigation.push('Login') },
                ]);
            });
    }

    const resendOtp = () => {
        setIsLoading(true)
        const option = {
            "code": route?.params?.counterycode,
            "phone": route?.params?.phoneno,
        }
        console.log(option)
        axios.post(`${API_URL}/api/driver/registration`, option)
            .then(res => {
                console.log(JSON.stringify(res.data))
                if (res.data.response.status.code === 200) {
                    Alert.alert(res.data?.response.records.userData.activation_otp)
                    setIsLoading(false)
                    Toast.show({
                        type: 'success',
                        text1: 'Hello',
                        text2: "OTP Sent Successfully",
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
                console.log(`user register error ${e}`)
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

    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
                <MaterialIcons name="arrow-back" size={25} color="#000" onPress={() => navigation.goBack()} />
            </View>
            <View style={styles.wrapper}>
                <Text
                    style={styles.header}>
                    Enter OTP to verify
                </Text>
                <Text
                    style={styles.subheader}>
                    A 4 digit OTP has been sent to your phone number
                </Text>
                <Text
                    style={styles.subheadernum}>
                    {route?.params?.counterycode} - {route?.params?.phoneno}
                </Text>
                {/* <Text
                    style={styles.subheader}>
                    or admin can share OTP over the call
                </Text> */}

                <View style={styles.textinputview}>
                    <OTPInputView
                        ref={inputRef}
                        style={styles.otpTextView}
                        pinCount={4}
                        code={otp} //You can supply this prop or not. The component will be used as a controlled / uncontrolled component respectively.
                        onCodeChanged={code => { onChangeCode(code) }}
                        autoFocusOnLoad={false}
                        codeInputFieldStyle={styles.underlineStyleBase}
                        codeInputHighlightStyle={styles.underlineStyleHighLighted}
                        onCodeFilled={(code) => goToNextPage(code)}
                        keyboardType={'numeric'}
                        keyboardAppearance={'default'}
                    />
                </View>
                {errors &&
                    <Text style={{ fontSize: responsiveFontSize(1.5), color: 'red', marginBottom: 20, marginTop: -25, alignSelf: 'center' }}>{errorText}</Text>
                }
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#808080', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2) }}>Didn’t receive OTP?</Text>
                    <TouchableOpacity onPress={() => resendOtp()}>
                        <Text style={{ color: '#339999', fontFamily: 'Outfit-SemiBold', fontSize: responsiveFontSize(2) }}>Resend OTP</Text>
                    </TouchableOpacity>
                </View>

            </View>
            {/* <View style={styles.buttonwrapper}>
                <CustomButton label={"Continue"}
                //onPress={() => { login(email, pass) }} 
                />
            </View> */}
        </SafeAreaView>
    );
};

export default OtpScreen;

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        height: responsiveHeight(100)
    },
    wrapper: {
        paddingHorizontal: 25,
        height: responsiveHeight(80),
        marginTop: responsiveHeight(10)
    },
    header: {
        fontFamily: 'Outfit-Bold',
        fontSize: responsiveFontSize(3),
        color: '#2F2F2F',
        marginBottom: responsiveHeight(3),
    },
    subheader: {
        fontFamily: 'Outfit-Medium',
        fontSize: responsiveFontSize(1.8),
        fontWeight: '400',
        color: '#808080',
        marginBottom: responsiveHeight(0),
    },
    subheadernum: {
        fontFamily: 'Outfit-SemiBold',
        fontSize: responsiveFontSize(1.8),
        fontWeight: '400',
        color: '#2F2F2F',
        marginBottom: responsiveHeight(0),
        lineHeight: 40
    },
    textinputview: {
        marginBottom: responsiveHeight(0),
    },
    buttonwrapper: {
        paddingHorizontal: 25,
    },
    otpTextView: {
        width: '100%',
        height: 180,
        borderRadius: 10,
    },
    underlineStyleBase: {
        width: responsiveWidth(15),
        height: responsiveHeight(8),
        borderRadius: 8,
        color: '#2F2F2F',
        fontFamily: 'Outfit-Medium',
        fontSize: responsiveFontSize(2)
    },

    underlineStyleHighLighted: {
        borderColor: "#2F2F2F",
        borderRadius: 8
    },
});



