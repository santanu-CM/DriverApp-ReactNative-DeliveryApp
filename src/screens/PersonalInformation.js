import React, { useContext, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView
} from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DocumentPicker from '@react-native-documents/picker';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import { plus, userPhoto } from '../utils/Images';
import { AuthContext } from '../context/AuthContext';
import Loader from '../utils/Loader';
import axios from 'axios';
import { API_URL,GOOGLE_MAP_KEY_ANDROID, GOOGLE_MAP_KEY_IOS } from '@env'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const PersonalInformation = ({ navigation, route }) => {
  const concatNo =  route?.params?.countrycode +'-'+ route?.params?.phoneno;
  const [phoneno, setPhoneno] = useState(concatNo);
  const [firstname, setFirstname] = useState('');
  const [firstNameError, setFirstNameError] = useState('')
  const [lastname, setLastname] = useState('');
  const [lastNameError, setLastNameError] = useState('')
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('')
  const [address, setAddress] = useState('');
  const [addressError, setAddressError] = useState('')
  const [city, setCity] = useState('');
  const [cityError, setCityError] = useState('')
  const [postaddress, setPostaddress] = useState('');
  const [postaddressError, setPostaddressError] = useState('')
  const [addressLat, setAddressLat] = useState('');
  const [addressLng, setAddressLng] = useState('');
  
  const [isLoading, setIsLoading] = useState(false)
  const { login, userToken } = useContext(AuthContext);

  const changeFirstname = (text) => {
    setFirstname(text)
    if (text) {
      setFirstNameError('')
    } else {
      setFirstNameError('Please enter First name')
    }
  }

  const changeLastname = (text) => {
    setLastname(text)
    if (text) {
      setLastNameError('')
    } else {
      setLastNameError('Please enter Last name')
    }
  }

  const changeAddress = (text) => {
    setAddress(text)
    if (text) {
      setAddressError('')
    } else {
      setAddressError('Please enter Address')
    }
  }
  const changeCity = (text) => {
    setCity(text)
    if (text) {
      setCityError('')
    } else {
      setCityError('Please enter City')
    }
  }
  const changePostAddress = (text) => {
    setPostaddress(text);
    const ghanaPostRegex = /^[a-zA-Z0-9]{5,7}$/;
    if (!text) {
      setPostaddressError('Please enter Ghana Post Address');
    } else if (!ghanaPostRegex.test(text)) {
      setPostaddressError('Ghana Post Address must be 5-7 alphanumeric characters');
    } else {
      setPostaddressError('');
    }
  }

  const submitForm = () => {
    //navigation.navigate('DocumentsUpload')
    if (!firstname) {
      setFirstNameError('Please enter First name')
    }else if(!lastname){
      setLastNameError('Please enter Last name')
    }else if(!address){
      setAddressError('Please enter Address')
    }else if(!city){
      setCityError('Please enter City')
    } else if (!postaddress) {
      setPostaddressError('Please enter Ghana Post Address')
    } else if (postaddressError) {
      // Prevent submission if error exists
      return;
    } else {
      setIsLoading(true)
      var option = {}
      if(email){
        var option = {
          "firstName": firstname,
          "lastName": lastname,
          "email": email,
          "address": address,
          "zipcode": postaddress,
          "city" : city
        }
      }else{
        var option = {
          "firstName": firstname,
          "lastName": lastname,
          "address": address,
          "zipcode": postaddress,
          "city" : city
        }
      }
      
      axios.post(`${process.env.API_URL}/api/driver/updateInformation`, option, { 
        headers: {
          Accept: 'application/json',
          "Authorization": 'Bearer ' + route?.params?.usertoken,
        },
      })
        .then(res => {
          console.log(res.data)
          if (res.data.response.status.code === 200) {
            setIsLoading(false)
            navigation.push('DocumentsUpload', { usertoken: route?.params?.usertoken })
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
          Alert.alert('Oops..', JSON.stringify(e.response.data?.response.records.email[0])||"Something went wrong", [
            {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            { text: 'OK', onPress: () => console.log('OK Pressed') },
        ]);
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
      {/* <KeyboardAwareScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: responsiveHeight(4) }}> */}
      <ScrollView keyboardShouldPersistTaps='handled' contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ paddingHorizontal: 20, paddingVertical: 25 }}>
          <MaterialIcons name="arrow-back" size={25} color="#000" onPress={() => navigation.goBack()} />
        </View>
        <View style={styles.wrapper}>

          <Text style={styles.header1}>Personal Information</Text>
          <Text style={styles.subheader}>Enter the details below so we can get to know and serve you better</Text>

          <View style={styles.textinputview}>
            <Text
              style={styles.header}>
              Primary mobile number
            </Text>
            <View style={styles.inputView}>
              <InputField
                label={'Mobile number'}
                keyboardType=" "
                value={phoneno}
                helperText={firstNameError}
                inputType={'nonedit'}
                //onChangeText={(text) => changeFirstname(text)}
              />
            </View>
            <Text
              style={styles.header}>
              First Name
            </Text>
            {firstNameError?<Text style={{color:'red',fontFamily:'Outfit-Regular'}}>{firstNameError}</Text>:<></>}
            <View style={styles.inputView}>
              <InputField
                label={'First name'}
                keyboardType=" "
                value={firstname}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => changeFirstname(text)}
              />
            </View>
            <Text
              style={styles.header}>
              Last Name
            </Text>
            {lastNameError?<Text style={{color:'red',fontFamily:'Outfit-Regular'}}>{lastNameError}</Text>:<></>}
            <View style={styles.inputView}>
              <InputField
                label={'Last Name'}
                keyboardType=" "
                value={lastname}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => changeLastname(text)}
              />
            </View>
            <Text
              style={styles.header}>
              Email
            </Text>
            <View style={styles.inputView}>
              <InputField
                label={'e.g. abc@gmail.com'}
                keyboardType=" "
                value={email}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => setEmail(text)}
              />
            </View>
            <Text
              style={styles.header}>
              Address
            </Text>
            {addressError?<Text style={{color:'red',fontFamily:'Outfit-Regular'}}>{addressError}</Text>:<></>}
            {/* <View style={styles.inputView}>
              <InputField
                label={'Address'}
                keyboardType=" "
                value={address}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => changeAddress(text)}
              />
            </View> */}
            <View style={[styles.inputView, { flex: 1, width: responsiveWidth(88), marginBottom: responsiveHeight(2) }]}>
              <GooglePlacesAutocomplete
                placeholder="Enter Address"
                minLength={2}
                fetchDetails={true}
                onPress={(data, details = null) => {
                  setAddress(details?.formatted_address);
                  setAddressLat(details?.geometry?.location?.lat);
                  setAddressLng(details?.geometry?.location?.lng);
                  setAddressError('');
                }}
                onFail={error => console.log(error)}
                onNotFound={() => console.log('no results')}
                query={{
                  key: Platform.OS == 'android' ? GOOGLE_MAP_KEY_ANDROID : GOOGLE_MAP_KEY_IOS,
                  language: 'en',
                }}
                styles={{
                  textInput: { fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(1.6), color: '#716E6E', borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, height: 48 },
                  listView: { backgroundColor: '#fff', borderRadius: 8 },
                  description: { color: '#716E6E', fontSize: responsiveFontSize(1.6), fontFamily: 'Outfit-Medium' },
                }}
                debounce={200}
                enablePoweredByContainer={false}
                textInputProps={{
                  autoCorrect: false,
                  autoCapitalize: 'none',
                  placeholderTextColor: '#999999',
                }}
              />
            </View>
            <Text
              style={styles.header}>
              City
            </Text>
            {cityError?<Text style={{color:'red',fontFamily:'Outfit-Regular'}}>{cityError}</Text>:<></>}
            <View style={styles.inputView}>
              <InputField
                label={'City'}
                keyboardType=" "
                value={city}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => changeCity(text)}
              />
            </View>
            <Text
              style={styles.header}>
              Ghana Post Address
            </Text>
            {postaddressError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{postaddressError}</Text> : <></>}
            <View style={styles.inputView}>
              <InputField
                label={'Post Address'}
                keyboardType=" "
                value={postaddress}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => changePostAddress(text)}
              />
            </View>
          </View>

        </View>
        <View style={styles.buttonwrapper}>
          <CustomButton label={"Save & Next"}
            // onPress={() => { login() }}
            onPress={() => { submitForm() }}
          />
        </View>
      {/* </KeyboardAwareScrollView> */}
      </ScrollView>
    </SafeAreaView >
  );
};

export default PersonalInformation;

const styles = StyleSheet.create({

  container: {
    //justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    flex: 1
  },
  wrapper: {
    paddingHorizontal: 23,
    //height: responsiveHeight(78)
  },
  header1: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: responsiveFontSize(3),
    color: '#2F2F2F',
    marginBottom: responsiveHeight(1),
  },
  header: {
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(2),
    color: '#2F2F2F',
    marginBottom: responsiveHeight(1),
  },
  subheader: {
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(1.8),
    fontWeight: '400',
    color: '#808080',
    marginBottom: responsiveHeight(1),
  },
  photoheader: {
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(2),
    color: '#2F2F2F'
  },
  imageView: {
    marginTop: responsiveHeight(2)
  },
  imageStyle: {
    height: 80,
    width: 80,
    borderRadius: 40,
    marginBottom: 10
  },
  plusIcon: {
    position: 'absolute',
    bottom: 10,
    left: 50
  },
  textinputview: {
    marginBottom: responsiveHeight(10),
    marginTop: responsiveHeight(5)
  },
  inputView: {
    paddingVertical: 1
  },
  buttonwrapper: {
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: -20,
    width: responsiveWidth(100),
  }
});
