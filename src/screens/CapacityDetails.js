import React, { useContext, useState, useEffect } from 'react';
import {
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
import { Dropdown } from 'react-native-element-dropdown';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import { plus, userPhoto } from '../utils/Images';
import { AuthContext } from '../context/AuthContext';
import Loader from '../utils/Loader'; 
import axios from 'axios';
import { API_URL } from '@env'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useNavigation } from '@react-navigation/native'; 
import { SafeAreaView } from 'react-native-safe-area-context';

const CapacityDetails = ({ route }) => {
  const navigation = useNavigation();
  const [vehicleType, setvehicleType] = useState('');
  const [vehicleTypeId, setVehicleTypeId] = useState('');
  const [vehicleTypeError, setvehicleTypeError] = useState('')
  const [VehicleRegistration, setVehicleRegistration] = useState('');
  const [VehicleRegistrationError, setVehicleRegistrationError] = useState('')
  const [Maximumpayload, setMaximumpayload] = useState('');
  const [MaximumpayloadError, setMaximumpayloadError] = useState('')
  const [Vehiclecontainerwidth, setVehiclecontainerwidth] = useState('');
  const [VehiclecontainerError, setVehiclecontainerError] = useState('')
  const [Vehiclecontainerheight, setVehiclecontainerheight] = useState('');
  const [vehicleList, setVehicleList] = useState([]);
  const [isFocusVehicleType, setIsFocusVehicleType] = useState(false);
  const [selectedVehicleData, setSelectedVehicleData] = useState(null);

  const [isLoading, setIsLoading] = useState(false)
  const { login, userToken } = useContext(AuthContext);

  const changevehicleType = (item) => {
    setvehicleType(item.name)
    setVehicleTypeId(item.id)
    setSelectedVehicleData(item)
    // Auto-populate payload range for display
    setMaximumpayload(`${item.min_weight} - ${item.max_weight} KG`)
    if (item.name) {
      setvehicleTypeError('')
    } else {
      setvehicleTypeError('Please select Vehicle type')
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
    // This field is now disabled and auto-populated
    // setMaximumpayload(text)
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

  const fetchVehicleList = async () => {
    try {
      const response = await axios.get(`${process.env.API_URL}/api/driver/get-vehicle-list`, {
        headers: {
          "Authorization": `Bearer ${route?.params?.usertoken}`,
          "Content-Type": 'application/json'
        },
      });
      
      if (response.data.response.status.code === 200) {
        const vehicles = response.data.response.records.data.map(vehicle => ({
          id: vehicle.id,
          name: vehicle.name,
          min_weight: vehicle.min_weight,
          max_weight: vehicle.max_weight,
          label: vehicle.name,
          value: vehicle.id
        }));
        setVehicleList(vehicles);
      }
    } catch (error) {
      console.log('Error fetching vehicle list:', error);
      Alert.alert('Error', 'Failed to load vehicle types');
    }
  };

  useEffect(() => {
    fetchVehicleList();
  }, []);

  const submitForm = () => {
    //navigation.navigate('BankDetails')
    if (!vehicleTypeId) {
      setvehicleTypeError('Please select Vehicle type')
    }else if(!VehicleRegistration){
      setVehicleRegistrationError('Please enter Vehicle Registration Number')
    } else {
      setIsLoading(true)
        var option = {
          "vehicleType": vehicleTypeId, // Send vehicle ID instead of name
          "vehicleRegNo": VehicleRegistration,
           "maxPayload": selectedVehicleData ? `${selectedVehicleData.min_weight}-${selectedVehicleData.max_weight}` : '',
          "vehicleContCapacity": Vehiclecontainerwidth,
          "vehicleContCapacityHeight": Vehiclecontainerheight
        }
      axios.post(`${process.env.API_URL}/api/driver/submit-info`, option, {
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
              <Dropdown
                style={[styles.dropdown, isFocusVehicleType && { borderColor: 'blue' }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                data={vehicleList}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isFocusVehicleType ? 'Select vehicle type' : '...'}
                searchPlaceholder="Search..."
                value={vehicleTypeId}
                onFocus={() => setIsFocusVehicleType(true)}
                onBlur={() => setIsFocusVehicleType(false)}
                onChange={item => {
                  changevehicleType(item);
                  setIsFocusVehicleType(false);
                }}
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
                label={'Auto-populated from vehicle type'}
                keyboardType=" "
                value={Maximumpayload}
                helperText={MaximumpayloadError}
                inputType={'others'}
                editable={false}
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
  },
  dropdown: {
    height: responsiveHeight(7),
    borderColor: '#E0E0E0',
    borderWidth: 0.7,
    borderRadius: 5,
    paddingHorizontal: 8,
    marginTop: 5,
    marginBottom: responsiveHeight(4)
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#999'
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  }
});
