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
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import RNDateTimePicker from '@react-native-community/datetimepicker'
import Ionicons from 'react-native-vector-icons/Ionicons';
import DocumentPicker from '@react-native-documents/picker';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import { plus, uploadImg, userPhoto } from '../utils/Images';
import { AuthContext } from '../context/AuthContext';
import Loader from '../utils/Loader';
import moment from "moment"
import axios from 'axios';
import { API_URL } from '@env'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Entypo from 'react-native-vector-icons/Entypo';

const DocumentsUpload = ({ navigation, route }) => {
    const [pickedDrivingLicenseFront, setPickedDrivingLicenseFront] = useState(null);
    const [DrivingLicenseFrontError, setDrivingLicenseFrontError] = useState('')
    const [pickedDrivingLicenseBack, setPickedDrivingLicenseback] = useState(null);
    const [DrivingLicenseBackError, setDrivingLicenseBackError] = useState('')
    const [pickedCarInsurance, setPickedCarInsurance] = useState(null);
    const [CarInsuranceError, setCarInsuranceError] = useState('')
    const [pickedTransitInsurance, setPickedTransitInsurance] = useState(null);
    const [TransitInsuranceError, setTransitInsuranceError] = useState('')
    const [pickedVehicleImage, setpickedVehicleImage] = useState(null);
    const [VehicleImageError, setVehicleImageError] = useState('')
    const [pickedCarRegistration, setCarRegistration] = useState(null);
    const [ghanaCardImage, setghanaCardImage] = useState('');
    const [ghanaCardImageError, setghanaCardImageError] = useState('')

    const [isLoading, setIsLoading] = useState(false)
    const { login, userToken } = useContext(AuthContext);

    const MIN_DATE = new Date(1930, 0, 1)
    const MAX_DATE = new Date()
    const [date, setDate] = useState('DD - MM  - YYYY')
    const [open, setOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState(MAX_DATE)
    const [DrivingLicenseExpiryDateError, setDrivingLicenseExpiryDateError] = useState('')

    const [date2, setDate2] = useState('DD - MM  - YYYY')
    const [open2, setOpen2] = useState(false)
    const [selectedDate2, setSelectedDate2] = useState(MAX_DATE)
    const [CarInsuranceExpiryDateError, setCarInsuranceExpiryDateError] = useState('')

    const [date3, setDate3] = useState('DD - MM  - YYYY')
    const [open3, setOpen3] = useState(false)
    const [selectedDate3, setSelectedDate3] = useState(MAX_DATE)
    const [TransitInsuranceExpiryDateError, setTransitInsuranceExpiryDateError] = useState('')

    const pickDocument = async (forwhat) => {
        try {
            const result = await DocumentPicker.pick({
                type: [DocumentPicker.types.images],
            });

            console.log('URI: ', result[0].uri);
            console.log('Type: ', result[0].type);
            console.log('Name: ', result[0].name);
            console.log('Size: ', result[0].size);
            if (forwhat == 'DrivingLicenseFront') {
                setPickedDrivingLicenseFront(result[0]);
                setDrivingLicenseFrontError('')
                //fileUpload('DrivingLicenseFront')
            } else if (forwhat == 'DrivingLicenseBack') {
                setPickedDrivingLicenseback(result[0])
                setDrivingLicenseBackError('')
            } else if (forwhat == 'CarInsurance') {
                setPickedCarInsurance(result[0])
                setCarInsuranceError('')
            } else if (forwhat == 'TransitInsurance') {
                setPickedTransitInsurance(result[0])
                setTransitInsuranceError('')
            } else if (forwhat == 'VehicleImage') {
                setpickedVehicleImage(result[0])
                setVehicleImageError('')
            } else if (forwhat == 'CarRegistration') {
                setCarRegistration(result[0])
            }


        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                // User cancelled the document picker
                console.log('Document picker was cancelled');
            } else {
                console.error('Error picking document', err);
            }
        }
    };

    const changeLastname = (text) => {
        setghanaCardImage(text)
        if (text) {
            setghanaCardImageError('')
        } else {
            setghanaCardImageError('Please enter ghana card no')
        }
    }

    // const fileUpload = (forwhat) => {
    //     var formData = new FormData();
    //     if (forwhat == 'DrivingLicenseFront') {
    //         formData.append("licenseFront", {
    //             uri: pickedDrivingLicenseFront.uri,
    //             type: 'image/jpeg',
    //             name: 'photo.jpg',
    //         });
    //     }else if (forwhat == 'DrivingLicenseBack') {
    //         formData.append("licenseBack", {
    //             uri: pickedDrivingLicenseBack.uri,
    //             type: 'image/jpeg',
    //             name: 'photo.jpg',
    //         });
    //     } else if (forwhat == 'CarInsurance') {
    //         formData.append("carInsurance", {
    //             uri: pickedCarInsurance.uri,
    //             type: 'image/jpeg',
    //             name: 'photo.jpg',
    //         });
    //     }else if (forwhat == 'TransitInsurance') {
    //         formData.append("gtInsurance", {
    //             uri: pickedTransitInsurance.uri,
    //             type: 'image/jpeg',
    //             name: 'photo.jpg',
    //         });
    //     } else if (forwhat == 'VehicleImage') {

    //     }else if (forwhat == 'CarRegistration') {

    //     }
    //     axios.post(`${API_URL}/api/driver/submitDocuments`, formData, {
    //         headers: {
    //             Accept: 'application/json',
    //             'Content-Type': 'multipart/form-data',
    //             "Authorization": 'Bearer ' + route?.params?.usertoken,
    //         },
    //     })
    //         .then(res => {
    //             console.log(res.data)
    //             if (res.data.response.status.code === 200) {
    //                 setIsLoading(false)
    //                 navigation.push('CapacityDetails', { usertoken: route?.params?.usertoken })
    //             } else {
    //                 Alert.alert('Oops..', "Something went wrong", [
    //                     {
    //                         text: 'Cancel',
    //                         onPress: () => console.log('Cancel Pressed'),
    //                         style: 'cancel',
    //                     },
    //                     { text: 'OK', onPress: () => console.log('OK Pressed') },
    //                 ]);
    //             }
    //         })
    //         .catch(e => {
    //             setIsLoading(false)
    //             console.log(`user update error ${e}`)
    //             console.log(e.response.data?.response)
    //             Alert.alert('Oops..', e.response.data?.response.records.message, [
    //                 {
    //                     text: 'Cancel',
    //                     onPress: () => console.log('Cancel Pressed'),
    //                     style: 'cancel',
    //                 },
    //                 { text: 'OK', onPress: () => console.log('OK Pressed') },
    //             ]);
    //         });
    // }

    const submitForm = () => {
        //navigation.navigate('CapacityDetails')
        if (!pickedDrivingLicenseFront) {
            //console.warn('No document selected for upload');
            setDrivingLicenseFrontError('Please upload Driving License Front side')
        } else if (!pickedDrivingLicenseBack) {
            setDrivingLicenseBackError('Please upload Driving License Back side')
        } else if (!pickedCarInsurance) {
            setCarInsuranceError('Please upload Car Insurance')
        } else if (!pickedTransitInsurance) {
            setTransitInsuranceError('Please upload Transit Insurance')
        } else if (!pickedVehicleImage) {
            setVehicleImageError('Please upload Vehicle Image')
        } else if (!ghanaCardImage) {
            setghanaCardImageError('Please enter Ghana Card')
        } else if (date == 'DD - MM  - YYYY') {
            setDrivingLicenseExpiryDateError('Please choose Driving License Expiry Date')
        } else if (date2 == 'DD - MM  - YYYY') {
            setCarInsuranceExpiryDateError('Please choose Car Insurance Expiry Date')
        } else if (date3 == 'DD - MM  - YYYY') {
            setTransitInsuranceExpiryDateError('Please choose Transit Insurance Expiry Date')
        } else {
            setIsLoading(true)
            const formData = new FormData();
            formData.append("licenseFront", {
                uri: pickedDrivingLicenseFront.uri,
                type: 'image/jpeg',
                name: 'photo.jpg',
            });
            formData.append("licenseBack", {
                uri: pickedDrivingLicenseBack.uri,
                type: 'image/jpeg',
                name: 'photo.jpg',
            });
            formData.append("carInsurance", {
                uri: pickedCarInsurance.uri,
                type: 'image/jpeg',
                name: 'photo.jpg',
            });
            formData.append("gtInsurance", {
                uri: pickedTransitInsurance.uri,
                type: 'image/jpeg',
                name: 'photo.jpg',
            });
            formData.append("vehicleImage", {
                uri: pickedVehicleImage.uri,
                type: 'image/jpeg',
                name: 'photo.jpg',
            });
            if (pickedCarRegistration != null) {
                formData.append("carRegistrationPaper", {
                    uri: pickedCarRegistration.uri,
                    type: 'image/jpeg',
                    name: 'photo.jpg',
                });
            } else {
                formData.append("carRegistrationPaper", "");
            }
            formData.append("licenseExpDate", moment(selectedDate).format('YYYY-MM-DD'));
            formData.append("carInsuranceExpDate", moment(selectedDate2).format('YYYY-MM-DD'));
            formData.append("gtInsuranceExpDate", moment(selectedDate3).format('YYYY-MM-DD'));
            formData.append("ghanaCardNo", ghanaCardImage);

            console.log(formData)
            axios.post(`${API_URL}/api/driver/submitDocuments`, formData, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'multipart/form-data',
                    "Authorization": 'Bearer ' + route?.params?.usertoken,
                },
            })
                .then(res => {
                    console.log(res.data)
                    if (res.data.response.status.code === 200) {
                        setIsLoading(false)
                        navigation.push('CapacityDetails', { usertoken: route?.params?.usertoken })
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
        }

    }

    const handleAndroidChange = (event, selectedDate) => {
        if (event.type === 'set') { // User clicked OK
            const formattedDate = moment(selectedDate).format('DD-MM-YYYY');
            setSelectedDate(selectedDate);
            setDate(formattedDate);
            setDrivingLicenseExpiryDateError('')
        }
        setOpen(false); // Close the picker
    };

    const handleIOSChange = (event, selectedDate) => {
        if (selectedDate) {
            const formattedDate = moment(selectedDate).format('DD-MM-YYYY');
            setSelectedDate(selectedDate);
            setDate(formattedDate);
            setDrivingLicenseExpiryDateError('')
        }
    };

    const handleAndroidChange2 = (event, selectedDate) => {
        if (event.type === 'set') { // User clicked OK
            const formattedDate = moment(selectedDate).format('DD-MM-YYYY');
            setSelectedDate2(selectedDate);
            setDate2(formattedDate);
            setCarInsuranceExpiryDateError('')
        }
        setOpen2(false); // Close the picker
    };

    const handleIOSChange2 = (event, selectedDate) => {
        if (selectedDate) {
            const formattedDate = moment(selectedDate).format('DD-MM-YYYY');
            setSelectedDate2(selectedDate);
            setDate2(formattedDate);
            setCarInsuranceExpiryDateError('')
        }
    };

    const handleAndroidChange3 = (event, selectedDate) => {
        if (event.type === 'set') { // User clicked OK
            const formattedDate = moment(selectedDate).format('DD-MM-YYYY');
            setSelectedDate3(selectedDate);
            setDate3(formattedDate);
            setTransitInsuranceExpiryDateError('')
        }
        setOpen3(false); // Close the picker
    };

    const handleIOSChange3 = (event, selectedDate) => {
        if (selectedDate) {
            const formattedDate = moment(selectedDate).format('DD-MM-YYYY');
            setSelectedDate3(selectedDate);
            setDate3(formattedDate);
            setTransitInsuranceExpiryDateError('')
        }
    };

    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ paddingHorizontal: 20, paddingVertical: 25 }}>
                <MaterialIcons name="arrow-back" size={25} color="#000" onPress={() => navigation.goBack()} />
            </View>
            <View style={styles.wrapper}>
                <KeyboardAwareScrollView style={{ marginBottom: responsiveHeight(7) }} showsVerticalScrollIndicator={false}>
                    <View style={{ paddingBottom: Platform.OS === 'ios' ? responsiveHeight(10) : responsiveHeight(0) }}>
                        <Text style={styles.header1}>Upload Your Documents</Text>
                        <Text style={styles.subheader}>To ensure a smooth experience, all drivers must provide the following documents</Text>

                        <View style={styles.textinputview}>
                            <Text
                                style={styles.header}>
                                Driving License
                            </Text>
                            {DrivingLicenseFrontError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{DrivingLicenseFrontError}</Text> : <></>}
                            {DrivingLicenseBackError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{DrivingLicenseBackError}</Text> : <></>}
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                            <View style={{ height: responsiveHeight(20), width: responsiveWidth(40), borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 10, borderStyle: 'dashed', backgroundColor: '#FAFAFA' }}>
                                <View style={{ flexDirection: 'column', alignItems: 'center', marginVertical: 40 }}>
                                    <View style={{ height: 40, width: 40, borderRadius: 40, backgroundColor: '#D9FFFF', justifyContent: 'center', alignItems: 'center' }}>
                                        <TouchableOpacity onPress={() => pickDocument('DrivingLicenseFront')}>
                                            <Image
                                                source={uploadImg}
                                                style={{ height: 25, width: 25 }}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    {!pickedDrivingLicenseFront ?
                                        <Text style={{ fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), color: '#808080', }}>Front Side</Text>
                                        :
                                        <Text style={{ fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), color: '#808080', paddingHorizontal: 5 }}>{pickedDrivingLicenseFront.name}</Text>
                                    }
                                </View>
                            </View>
                            <View style={{ height: responsiveHeight(20), width: responsiveWidth(40), borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 10, borderStyle: 'dashed', backgroundColor: '#FAFAFA' }}>
                                <View style={{ flexDirection: 'column', alignItems: 'center', marginVertical: 40 }}>
                                    <View style={{ height: 40, width: 40, borderRadius: 40, backgroundColor: '#D9FFFF', justifyContent: 'center', alignItems: 'center' }}>
                                        <TouchableOpacity onPress={() => pickDocument('DrivingLicenseBack')}>
                                            <Image
                                                source={uploadImg}
                                                style={{ height: 25, width: 25 }}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    {!pickedDrivingLicenseBack ?
                                        <Text style={{ fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), color: '#808080', }}>Back Side</Text>
                                        :
                                        <Text style={{ fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), color: '#808080', paddingHorizontal: 5 }}>{pickedDrivingLicenseBack.name}</Text>
                                    }
                                </View>
                            </View>
                        </View>
                        <View style={styles.textinputview}>
                            <Text
                                style={styles.header}>
                                Driving License Expiry Date
                            </Text>
                            {DrivingLicenseExpiryDateError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{DrivingLicenseExpiryDateError}</Text> : <></>}
                        </View>
                        <TouchableOpacity onPress={() => setOpen(true)}>
                            <View style={styles.datebox}>
                                <Text style={styles.dayname}>  {date}</Text>
                                <Entypo name="calendar" size={25} color="#000" />
                            </View>
                        </TouchableOpacity>
                        {/* {open == true ?
                            <RNDateTimePicker
                                mode="date"
                                display='spinner'
                                value={selectedDate}
                                textColor={'#000'}
                                minimumDate={MIN_DATE}
                                // maximumDate={MAX_DATE}
                                themeVariant="light"
                                onChange={(event, selectedDate) => {
                                    if (selectedDate) {
                                        const formattedDate = moment(selectedDate).format('DD-MM-YYYY');
                                        setOpen(false)
                                        setSelectedDate(selectedDate);
                                        setDate(formattedDate);
                                        setDrivingLicenseExpiryDateError('')
                                    } else {
                                        // User canceled the picker
                                        setOpen(false)
                                    }

                                }}
                            /> : null} */}
                        {open && (
                            Platform.OS === 'android' ? (
                                <RNDateTimePicker
                                    mode="date"
                                    display='spinner'
                                    value={selectedDate}
                                    textColor={'#000'}
                                    minimumDate={MIN_DATE}
                                    //maximumDate={MAX_DATE}
                                    themeVariant="light"
                                    onChange={(event, selectedDate) => handleAndroidChange(event, selectedDate)}
                                />) : (
                                <View style={styles.iosPickerContainer}>
                                    <RNDateTimePicker
                                        mode="date"
                                        display="spinner" // Spinner for iOS
                                        value={selectedDate}
                                        textColor={'#000'}
                                        minimumDate={MIN_DATE}
                                        //maximumDate={MAX_DATE}
                                        onChange={(event, selectedDate) => handleIOSChange(event, selectedDate)}
                                    />
                                    <TouchableOpacity onPress={() => setOpen(false)} style={styles.doneButton}>
                                        <Text style={styles.doneText}>Done</Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        )}
                        <View style={styles.textinputview}>
                            <Text
                                style={styles.header}>
                                Car Insurance
                            </Text>
                            {CarInsuranceError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{CarInsuranceError}</Text> : <></>}
                        </View>
                        <View style={{}}>
                            <View style={{ height: responsiveHeight(20), width: responsiveWidth(88), borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 10, borderStyle: 'dashed', backgroundColor: '#FAFAFA' }}>
                                <View style={{ flexDirection: 'column', alignItems: 'center', marginVertical: 40 }}>
                                    <View style={{ height: 40, width: 40, borderRadius: 40, backgroundColor: '#D9FFFF', justifyContent: 'center', alignItems: 'center' }}>
                                        <TouchableOpacity onPress={() => pickDocument('CarInsurance')}>
                                            <Image
                                                source={uploadImg}
                                                style={{ height: 25, width: 25 }}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    {!pickedCarInsurance ?
                                        <Text style={{ fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), color: '#808080', }}>Car Insurance</Text>
                                        :
                                        <Text style={{ fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), color: '#808080', paddingHorizontal: 5 }}>{pickedCarInsurance.name}</Text>
                                    }
                                </View>
                            </View>
                        </View>
                        <View style={styles.textinputview}>
                            <Text
                                style={styles.header}>
                                Car Insurance Expiry Date
                            </Text>
                            {CarInsuranceExpiryDateError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{CarInsuranceExpiryDateError}</Text> : <></>}
                        </View>
                        <TouchableOpacity onPress={() => setOpen2(true)}>
                            <View style={styles.datebox}>
                                <Text style={styles.dayname}>  {date2}</Text>
                                <Entypo name="calendar" size={25} color="#000" />
                            </View>
                        </TouchableOpacity>
                        {/* {open2 == true ?
                            <RNDateTimePicker
                                mode="date"
                                display='spinner'
                                value={selectedDate2}
                                textColor={'#000'}
                                minimumDate={MIN_DATE}
                                // maximumDate={MAX_DATE}
                                themeVariant="light"
                                onChange={(event, selectedDate) => {
                                    if (selectedDate) {
                                        const formattedDate = moment(selectedDate).format('DD-MM-YYYY');
                                        setOpen2(false)
                                        setSelectedDate2(selectedDate);
                                        setDate2(formattedDate);
                                        setCarInsuranceExpiryDateError('')
                                    } else {
                                        // User canceled the picker
                                        setOpen2(false)
                                    }

                                }}
                            /> : null} */}
                            {open2 && (
                            Platform.OS === 'android' ? (
                                <RNDateTimePicker
                                    mode="date"
                                    display='spinner'
                                    value={selectedDate2}
                                    textColor={'#000'}
                                    minimumDate={MIN_DATE}
                                    //maximumDate={MAX_DATE}
                                    themeVariant="light"
                                    onChange={(event, selectedDate) => handleAndroidChange2(event, selectedDate)}
                                />) : (
                                <View style={styles.iosPickerContainer}>
                                    <RNDateTimePicker
                                        mode="date"
                                        display="spinner" // Spinner for iOS
                                        value={selectedDate}
                                        textColor={'#000'}
                                        minimumDate={MIN_DATE}
                                        //maximumDate={MAX_DATE}
                                        onChange={(event, selectedDate) => handleIOSChange2(event, selectedDate)}
                                    />
                                    <TouchableOpacity onPress={() => setOpen2(false)} style={styles.doneButton}>
                                        <Text style={styles.doneText}>Done</Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        )}
                        <View style={styles.textinputview}>
                            <Text
                                style={styles.header}>
                                Goods in Transit  Insurance
                            </Text>
                            {TransitInsuranceError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{TransitInsuranceError}</Text> : <></>}
                        </View>
                        <View style={{}}>
                            <View style={{ height: responsiveHeight(20), width: responsiveWidth(88), borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 10, borderStyle: 'dashed', backgroundColor: '#FAFAFA' }}>
                                <View style={{ flexDirection: 'column', alignItems: 'center', marginVertical: 40 }}>
                                    <View style={{ height: 40, width: 40, borderRadius: 40, backgroundColor: '#D9FFFF', justifyContent: 'center', alignItems: 'center' }}>
                                        <TouchableOpacity onPress={() => pickDocument('TransitInsurance')}>
                                            <Image
                                                source={uploadImg}
                                                style={{ height: 25, width: 25 }}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    {!pickedTransitInsurance ?
                                        <Text style={{ fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), color: '#808080', }}>Car Insurance</Text>
                                        :
                                        <Text style={{ fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), color: '#808080', paddingHorizontal: 5 }}>{pickedTransitInsurance.name}</Text>
                                    }
                                </View>
                            </View>
                        </View>
                        <View style={styles.textinputview}>
                            <Text
                                style={styles.header}>
                                Goods in Transit Insurance Expiry Date
                            </Text>
                            {TransitInsuranceExpiryDateError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{TransitInsuranceExpiryDateError}</Text> : <></>}
                        </View>
                        <TouchableOpacity onPress={() => setOpen3(true)}>
                            <View style={styles.datebox}>
                                <Text style={styles.dayname}>  {date3}</Text>
                                <Entypo name="calendar" size={25} color="#000" />
                            </View>
                        </TouchableOpacity>
                        {/* {open3 == true ?
                            <RNDateTimePicker
                                mode="date"
                                display='spinner'
                                value={selectedDate3}
                                textColor={'#000'}
                                minimumDate={MIN_DATE}
                                // maximumDate={MAX_DATE}
                                themeVariant="light"
                                onChange={(event, selectedDate) => {
                                    if (selectedDate) {
                                        const formattedDate = moment(selectedDate).format('DD-MM-YYYY');
                                        setOpen3(false)
                                        setSelectedDate3(selectedDate);
                                        setDate3(formattedDate);
                                        setTransitInsuranceExpiryDateError('')
                                    } else {
                                        // User canceled the picker
                                        setOpen3(false)
                                    }

                                }}
                            /> : null} */}
                             {open3 && (
                            Platform.OS === 'android' ? (
                                <RNDateTimePicker
                                    mode="date"
                                    display='spinner'
                                    value={selectedDate3}
                                    textColor={'#000'}
                                    minimumDate={MIN_DATE}
                                    //maximumDate={MAX_DATE}
                                    themeVariant="light"
                                    onChange={(event, selectedDate) => handleAndroidChange3(event, selectedDate)}
                                />) : (
                                <View style={styles.iosPickerContainer}>
                                    <RNDateTimePicker
                                        mode="date"
                                        display="spinner" // Spinner for iOS
                                        value={selectedDate3}
                                        textColor={'#000'}
                                        minimumDate={MIN_DATE}
                                        //maximumDate={MAX_DATE}
                                        onChange={(event, selectedDate) => handleIOSChange3(event, selectedDate)}
                                    />
                                    <TouchableOpacity onPress={() => setOpen3(false)} style={styles.doneButton}>
                                        <Text style={styles.doneText}>Done</Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        )}
                        <View style={styles.textinputview}>
                            <Text
                                style={styles.header}>
                                Vehicle Image
                            </Text>
                            {VehicleImageError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{VehicleImageError}</Text> : <></>}
                            <Text style={{ color: '#808080', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(1.5) }}>All vehicles are subject to physical inspection</Text>
                        </View>
                        <View style={{}}>
                            <View style={{ height: responsiveHeight(20), width: responsiveWidth(88), borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 10, borderStyle: 'dashed', backgroundColor: '#FAFAFA' }}>
                                <View style={{ flexDirection: 'column', alignItems: 'center', marginVertical: 40 }}>
                                    <View style={{ height: 40, width: 40, borderRadius: 40, backgroundColor: '#D9FFFF', justifyContent: 'center', alignItems: 'center' }}>
                                        <TouchableOpacity onPress={() => pickDocument('VehicleImage')}>
                                            <Image
                                                source={uploadImg}
                                                style={{ height: 25, width: 25 }}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    {!pickedVehicleImage ?
                                        <Text style={{ fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), color: '#808080', }}>Upload Photo</Text>
                                        :
                                        <Text style={{ fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), color: '#808080', paddingHorizontal: 5 }}>{pickedVehicleImage.name}</Text>
                                    }
                                </View>
                            </View>
                        </View>
                        <View style={styles.textinputview}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                <Text
                                    style={styles.header}>
                                    Ghana Card number
                                </Text>
                                <Text style={{ color: '#808080', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(1.5), marginLeft: 5 }}></Text>
                            </View>
                        </View>
                        {ghanaCardImageError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{ghanaCardImageError}</Text> : <></>}
                        <View style={styles.inputView}>
                            <InputField
                                label={'Ghana card no'}
                                keyboardType=" "
                                value={ghanaCardImage}
                                //helperText={'Please enter lastname'}
                                inputType={'others'}
                                onChangeText={(text) => changeLastname(text)}
                            />
                        </View>
                        <View style={styles.textinputview}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                <Text
                                    style={styles.header}>
                                    Car Registration Paper
                                </Text>
                                <Text style={{ color: '#808080', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(1.5), marginLeft: 5 }}>(Optional)</Text>
                            </View>
                        </View>
                        <View style={{}}>
                            <View style={{ height: responsiveHeight(20), width: responsiveWidth(88), borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 10, borderStyle: 'dashed', backgroundColor: '#FAFAFA' }}>
                                <View style={{ flexDirection: 'column', alignItems: 'center', marginVertical: 40 }}>
                                    <View style={{ height: 40, width: 40, borderRadius: 40, backgroundColor: '#D9FFFF', justifyContent: 'center', alignItems: 'center' }}>
                                        <TouchableOpacity onPress={() => pickDocument('CarRegistration')}>
                                            <Image
                                                source={uploadImg}
                                                style={{ height: 25, width: 25 }}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    {!pickedCarRegistration ?
                                        <Text style={{ fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), color: '#808080', }}>Upload Photo</Text>
                                        :
                                        <Text style={{ fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), color: '#808080', paddingHorizontal: 5 }}>{pickedCarRegistration.name}</Text>
                                    }
                                </View>
                            </View>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </View>
            <View style={styles.buttonwrapper}>
                <CustomButton label={"Save & Next"}
                    // onPress={() => { login() }}
                    onPress={() => { submitForm() }}
                />
            </View>

        </SafeAreaView >
    );
};

export default DocumentsUpload;

const styles = StyleSheet.create({

    container: {
        //justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        flex: 1
    },
    wrapper: {
        paddingHorizontal: 23,
        height: responsiveHeight(90)
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
        marginBottom: responsiveHeight(2),
        marginTop: responsiveHeight(3)
    },
    inputView: {
        paddingVertical: 1
    },
    buttonwrapper: {
        paddingHorizontal: 20,
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 0 : -20,
        width: responsiveWidth(100),
    },
    datebox: {
        marginTop: responsiveHeight(1),
        marginBottom: responsiveHeight(2),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: responsiveWidth(88),
        height: responsiveHeight(7),
        color: '#797979',
        borderColor: '#E3E3E3',
        borderWidth: 1,
        borderRadius: 8,
        paddingLeft: 20,
        paddingRight: 20,
        backgroundColor: '#FFF',
        fontSize: responsiveFontSize(2)
    },
    dayname: {
        color: '#716E6E',
        fontFamily: 'Outfit-Regular',
        fontSize: responsiveFontSize(1.8),
        fontWeight: '500'
    },
    doneButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#EEF8FF',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: responsiveHeight(5)
    },
    doneText: {
        color: '#000',
        fontWeight: 'bold',
    },
});
