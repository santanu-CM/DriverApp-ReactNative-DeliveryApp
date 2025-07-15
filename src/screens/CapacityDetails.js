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
import { API_URL } from '@env'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

const CapacityDetails = ({ navigation, route }) => {
  const [vehicleType, setvehicleType] = useState('');
  const [vehicleTypeError, setvehicleTypeError] = useState('')
  const [VehicleRegistration, setVehicleRegistration] = useState('');
  const [VehicleRegistrationError, setVehicleRegistrationError] = useState('')
  const [Maximumpayload, setMaximumpayload] = useState('');
  const [MaximumpayloadError, setMaximumpayloadError] = useState('')
  const [Vehiclecontainerwidth, setVehiclecontainerwidth] = useState('');
  const [VehiclecontainerError, setVehiclecontainerError] = useState('')
  const [Vehiclecontainerheight, setVehiclecontainerheight] = useState('');

  const [isLoading, setIsLoading] = useState(false)
  const { login, userToken } = useContext(AuthContext);

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

  const changeMaximumpayload = (text) =>{
    setMaximumpayload(text)
    // if (text) {
    //   setMaximumpayloadError('')
    // } else {
    //   setMaximumpayloadError('Please enter Maximum payload')
    // }
  }

  const changeVehiclecontainerwidth = (text) =>{
    setVehiclecontainerwidth(text)
    // if (text) {
    //   setVehiclecontainerError('')
    // } else {
    //   setVehiclecontainerError('Please enter Vehicle container capacity')
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

  const submitForm = () => {
    //navigation.navigate('BankDetails')
    if (!vehicleType) {
      setvehicleTypeError('Please enter Vehicle type')
    }else if(!VehicleRegistration){
      setVehicleRegistrationError('Please enter Vehicle Registration Number')
    } else {
      setIsLoading(true)
        var option = {
          "vehicleType": vehicleType,
          "vehicleRegNo": VehicleRegistration,
          "maxPayload": Maximumpayload,
          "vehicleContCapacity": Vehiclecontainerwidth,
          "vehicleContCapacityHeight": Vehiclecontainerheight
        }
      axios.post(`${API_URL}/api/driver/submit-info`, option, {
        headers: {
          Accept: 'application/json',
          "Authorization": 'Bearer ' + route?.params?.usertoken,
        },
      })
        .then(res => {
          console.log(res.data)
          if (res.data.response.status.code === 200) {
            setIsLoading(false)
            navigation.push('BankDetails', { usertoken: route?.params?.usertoken })
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


  }

  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: responsiveHeight(4) }}>
        <View style={{ paddingHorizontal: 20, paddingVertical: 25 }}>
          <MaterialIcons name="arrow-back" size={25} color="#000" onPress={() => navigation.goBack()} />
        </View>
        <View style={styles.wrapper}>

          <Text style={styles.header1}>Capacity Details</Text>
          <Text style={styles.subheader}>The app should include essential information about the driver capacity details</Text>

          <View style={styles.textinputview}>
            <Text
              style={styles.header}>
              Vehicle type
            </Text>
            {vehicleTypeError?<Text style={{color:'red',fontFamily:'Outfit-Regular'}}>{vehicleTypeError}</Text>:<></>}
            <View style={styles.inputView}>
              <InputField
                label={'e.g. Truck'}
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
            {VehicleRegistrationError?<Text style={{color:'red',fontFamily:'Outfit-Regular'}}>{VehicleRegistrationError}</Text>:<></>}
            <View style={styles.inputView}>
              <InputField
                label={'e.g. fg67898'}
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
            {/* {MaximumpayloadError?<Text style={{color:'red',fontFamily:'Outfit-Regular'}}>{MaximumpayloadError}</Text>:<></>} */}
            <View style={styles.inputView}>
              <InputField
                label={'e.g. 5'}
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
            {/* {VehiclecontainerError?<Text style={{color:'red',fontFamily:'Outfit-Regular'}}>{VehiclecontainerError}</Text>:<></>} */}
            <View style={styles.inputView}>
              <InputField
                label={'e.g. 20'}
                keyboardType=" "
                value={Vehiclecontainerwidth}
                helperText={VehiclecontainerError}
                inputType={'others'}
                onChangeText={(text) => changeVehiclecontainerwidth(text)}
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

        </View>
        <View style={styles.buttonwrapper}>
          <CustomButton label={"Save & Next"}
            // onPress={() => { login() }}
            onPress={() => { submitForm() }}
          />
        </View>
      </KeyboardAwareScrollView>

    </SafeAreaView >
  );
};

export default CapacityDetails;

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
