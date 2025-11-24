import React, { useState, useContext, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, Alert, Image, TouchableOpacity, KeyboardAvoidingView } from 'react-native'
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
import { useNavigation } from '@react-navigation/native'; 
import { SafeAreaView } from 'react-native-safe-area-context';

const EditCapacityInformation = ({ route }) => {
    const navigation = useNavigation();
    // const { userInfo } = useContext(AuthContext);
    const [isFocus, setIsFocus] = useState(false);
    const [isLoading, setIsLoading] = useState(true)
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
    const [userInfo, setuserInfo] = useState([])
    const [vehicleList, setVehicleList] = useState([]);
    const [isFocusVehicleType, setIsFocusVehicleType] = useState(false);
    const [selectedVehicleData, setSelectedVehicleData] = useState(null);

    const headerHeight = useHeaderHeight();

    const fetchVehicleList = async () => {
        try {
            const usertoken = await AsyncStorage.getItem('userToken');
            const response = await axios.get(`${process.env.API_URL}/api/driver/get-vehicle-list`, {
                headers: {
                    "Authorization": `Bearer ${usertoken}`,
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
        }
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
                    console.log(JSON.stringify(userInfo),'ttttttttfhh')
                    setuserInfo(userInfo)
                    
                    // Find the vehicle in the list by ID (vehicleType contains the ID)
                    const currentVehicle = vehicleList.find(v => v.id === userInfo?.vehicleType);
                    if (currentVehicle) {
                        setvehicleType(currentVehicle.name)
                        setVehicleTypeId(currentVehicle.id)
                        setSelectedVehicleData(currentVehicle)
                        setMaximumpayload(`${currentVehicle.min_weight} - ${currentVehicle.max_weight} KG`)
                    } else {
                        // Fallback: vehicleType is the ID, try to find by ID
                        setVehicleTypeId(userInfo?.vehicleType)
                        setMaximumpayload(userInfo?.maxPayload)
                    }
                    
                    setVehicleRegistration(userInfo?.vehicleRegNo)
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
        fetchVehicleList().then(() => {
            fetchProfileDetails()
        })
    }, [])

    useEffect(() => {
        if (vehicleList.length > 0 && userInfo?.vehicleType) {
            // vehicleType in userInfo is actually the vehicle ID
            const currentVehicle = vehicleList.find(v => v.id === userInfo?.vehicleType);
            if (currentVehicle) {
                setvehicleType(currentVehicle.name)
                setVehicleTypeId(currentVehicle.id)
                setSelectedVehicleData(currentVehicle)
                setMaximumpayload(`${currentVehicle.min_weight} - ${currentVehicle.max_weight} KG`)
            }
        }
    }, [vehicleList, userInfo])

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

    const changeMaximumpayload = (text) => {
        // This field is now disabled and auto-populated
        // setMaximumpayload(text)
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
            if (!vehicleTypeId) {
                setvehicleTypeError('Please select Vehicle type')
            } else if (!VehicleRegistration) {
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
        height: responsiveHeight(7),
        borderColor: 'gray',
        borderWidth: 0.7,
        borderRadius: 5,
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