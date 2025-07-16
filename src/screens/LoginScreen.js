import React, { useState, useContext, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Image,
  StatusBar
} from 'react-native';
import axios from 'axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { API_URL } from '@env'
import CustomButton from '../components/CustomButton';
import InputField from '../components/InputField';
import { AuthContext } from '../context/AuthContext';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import Loader from '../utils/Loader';
import { CountryPicker } from "react-native-country-codes-picker";
import LinearGradient from 'react-native-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const BannerWidth = Dimensions.get('window').width;
const ITEM_WIDTH = Math.round(BannerWidth * 0.7)
const { height, width } = Dimensions.get('screen')

const LoginScreen = ({  }) => {
  const navigation = useNavigation();
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [deviceId, setDeviceId] = useState('dasdsa')
  const [mobileError, setMobileError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [show, setShow] = useState(false);
  const [countryCode, setCountryCode] = useState('+233');

  const { login, userToken } = useContext(AuthContext);

  const getFCMToken = async () => {
    try {
      // if (Platform.OS == 'android') {
      await messaging().registerDeviceForRemoteMessages();
      // }
      const token = await messaging().getToken();
      AsyncStorage.setItem('fcmToken', token)
      console.log(token, 'fcm token');
    } catch (e) {
      console.log(e,'errorrrrrr');
    }
  };

  useEffect(() => {
    //getDeviceInfo()
    getFCMToken()
  }, [])

  // const getDeviceInfo = () => {
  //   DeviceInfo.getUniqueId().then((deviceUniqueId) => {
  //     console.log(deviceUniqueId)
  //     setDeviceId(deviceUniqueId)
  //   });
  // }

  const onChangeText = (text) => {
    //const phoneRegex = /^\d{10}$/;
    setPhone(text)
    // if (!phoneRegex.test(text)) {
    //   setMobileError('Please enter a 10-digit number.')
    // } else {
    //   setMobileError('')
    // }
  }

  const onChangeEmail = (text) => {
    setEmail(text)
  }

  const handleSubmit = () => {
    const phoneRegex = /^\d{10}$/;
    if (!phone) {
      setMobileError('Please enter Mobile no')
    }
    //  else if (!phoneRegex.test(phone)) {
    //   setMobileError('Please enter a 10-digit number.')
    // }
     else {
      setIsLoading(true)
      AsyncStorage.getItem('fcmToken', (err, fcmToken) => {
        const option = {
          "code": countryCode,
          "phone": phone,
          "deviceid": deviceId,
          "email": email,
          "deviceToken": fcmToken
        }

        console.log(option)
        console.log(API_URL,'yyy');
        
        axios.post(`${process.env.API_URL}/api/driver/registration`, option, {
          headers: {
            'Accept': 'application/json',
            //'Content-Type': 'multipart/form-data',
          },
        })
          .then(res => {
            console.log(JSON.stringify(res.data))
            if (res.data.response.status.code === 200) {
              setIsLoading(false)
              Alert.alert(res.data?.response.records.userData.activation_otp)
              navigation.push('Otp', { counterycode: countryCode, phoneno: phone, userid: res.data?.response.records.userData.id })
            } else {
              setIsLoading(false)
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
      });
    }
  }

  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <KeyboardAwareScrollView>
        <View style={styles.bannaerContainer}>
          <Image
            source={require('../assets/images/Rectangle6.png')}
            style={styles.bannerBg}
          />
          <LinearGradient colors={["rgba(0, 67, 206, 0) 0%", "#339999"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.textWrap}>
            <View style={styles.textWrap}>
              <Text style={styles.bannerText}>Be a Kaya Driver</Text>
              <Text style={styles.bannerSubText} numberOfLines={4}>Freedom to earn at your time</Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.wrapper}>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text
              style={styles.header}>
              Enter your mobile number
            </Text>
            <Text style={{ color: 'red', marginBottom: responsiveHeight(2), fontFamily: 'Outfit-Medium', }}> *(Required)</Text>
          </View>
          <View style={styles.textinputview}>
            {/* <InputField
            value={'  +91'}
            inputType={'code'}
            keyboardType="numeric"
          /> */}
            <View style={styles.countryModal}>
              <TouchableOpacity
                onPress={() => setShow(true)}
                style={styles.countryInputView}
              >
                <Text style={{
                  color: '#808080',
                  fontSize: responsiveFontSize(2),
                }}>
                  {countryCode}
                </Text>
              </TouchableOpacity>
              <CountryPicker
                show={show}
                initialState={'+233'}
                pickerButtonOnPress={(item) => {
                  setCountryCode(item.dial_code);
                  setShow(false);
                }}
                style={{
                  modal: {
                    height: responsiveHeight(60),
                  },
                }}
              />
            </View>
            <InputField
              label={'Mobile Number'}
              keyboardType="numeric"
              value={phone}
              onChangeText={(text) => onChangeText(text)}
              helperText={mobileError}
            />
          </View> 
          {/* <Text
            style={styles.header}>
            Enter your email id
          </Text>
          <View style={styles.textinputview}>
            <InputField
              label={'e.g. abc@gmail.com'}
              keyboardType="default"
              inputType="name"
              value={email}
              onChangeText={(text) => onChangeEmail(text)}
              //helperText={mobileError}
            />
          </View> */}

        </View>
      </KeyboardAwareScrollView>
      <View style={styles.buttonwrapper}>
        <CustomButton label={"Send OTP"}
          onPress={() => handleSubmit()}
        //onPress={() => { navigation.push('Otp', { phoneno: phone }) }}
        />
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1
  },
  wrapper: {
    paddingHorizontal: 25,
    marginTop: responsiveHeight(5)
  },
  header: {
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(2),
    color: '#2F2F2F',
    marginBottom: responsiveHeight(2),
  },
  subheader: {
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(1.8),
    fontWeight: '400',
    color: '#808080',
    marginBottom: responsiveHeight(3),
  },
  textinputview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    //marginBottom: responsiveHeight(1)
  },
  buttonwrapper: {
    paddingHorizontal: 20,
  },
  countryInputView: {
    height: responsiveHeight(7),
    width: responsiveWidth(15),
    borderColor: '#808080',
    borderWidth: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center'
  },
  bannaerContainer: {
    width: responsiveWidth(100),
    height: responsiveHeight(50),
    backgroundColor: '#fff',
  },
  bannerBg: {
    flex: 1,
    position: 'absolute',
    right: 0,
    // bottom: 20,
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
  },
  textWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  bannerText: {
    fontSize: responsiveFontSize(2),
    color: '#FFFFFF',
    fontWeight: '300',
    fontFamily: 'Outfit-Medium',
    position: 'relative',
    zIndex: 1,
    width: width * 0.8,
    marginBottom: 10,
    paddingLeft: 20,
  },

  bannerSubText: {
    fontSize: responsiveFontSize(3),
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'Outfit-Medium',
    position: 'relative',
    zIndex: 1,
    width: width * 0.8,
    marginBottom: 30,
    paddingLeft: 20,
  },
});


export default LoginScreen;
