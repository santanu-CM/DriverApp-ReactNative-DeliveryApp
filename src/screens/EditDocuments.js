import React, { useContext, useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    TouchableWithoutFeedback,
    FlatList,
    StyleSheet,
    Dimensions,
    Alert,
    Platform,
    PermissionsAndroid
} from 'react-native';
import RNDateTimePicker from '@react-native-community/datetimepicker'
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomSwitch from '../components/CustomSwitch';
import ListItem from '../components/ListItem';
import { AuthContext } from '../context/AuthContext';
import { getProducts } from '../store/productSlice'
import { API_URL } from '@env'
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { add } from '../store/cartSlice';
import { licenseImg, emailImg, forwordImg, ordersImg, phoneImg, deleteRoundImg, uploadImg, testImg } from '../utils/Images';
import Loader from '../utils/Loader';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import CustomHeader from '../components/CustomHeader';
import Entypo from 'react-native-vector-icons/Entypo';
import CustomButton from '../components/CustomButton';
import { Dropdown } from 'react-native-element-dropdown'; 
import Modal from "react-native-modal";
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/Entypo';
import moment from "moment"
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import InputField from '../components/InputField';
import { useNavigation } from '@react-navigation/native'; 
import { SafeAreaView } from 'react-native-safe-area-context';

const BannerWidth = Dimensions.get('window').width;
const ITEM_WIDTH = Math.round(BannerWidth * 0.7)
const { height, width } = Dimensions.get('screen')

export default function EditDocuments({  }) {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { data: products, status } = useSelector(state => state.products)
    //const { userInfo } = useContext(AuthContext)
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

    const [userInfo, setuserInfo] = useState([])

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

    const [pickedDrivingLicenseFrontIMG, setPickedDrivingLicenseFrontIMG] = useState(null);
    const [pickedDrivingLicenseBackIMG, setPickedDrivingLicensebackIMG] = useState(null);
    const [pickedCarInsuranceIMG, setPickedCarInsuranceIMG] = useState(null);
    const [pickedTransitInsuranceIMG, setPickedTransitInsuranceIMG] = useState(null);
    const [pickedVehicleImageIMG, setpickedVehicleImageIMG] = useState(null);
    const [pickedCarRegistrationIMG, setCarRegistrationIMG] = useState(null);

    const [isLoading, setIsLoading] = useState(true)

    const source = { uri: 'http://samples.leanpub.com/thereactnativebook-sample.pdf', cache: true };

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
                    console.log(userInfo, 'user info from edit documents page')
                    setuserInfo(userInfo)
                    
                    // Add timestamp to prevent caching issues
                    const timestamp = new Date().getTime();
                    setPickedDrivingLicenseFrontIMG(userInfo?.licenseFront ? `${userInfo.licenseFront}?t=${timestamp}` : null)
                    setPickedDrivingLicensebackIMG(userInfo?.licenseBack ? `${userInfo.licenseBack}?t=${timestamp}` : null)
                    setPickedCarInsuranceIMG(userInfo?.carInsurance ? `${userInfo.carInsurance}?t=${timestamp}` : null)
                    setPickedTransitInsuranceIMG(userInfo?.gtInsurance ? `${userInfo.gtInsurance}?t=${timestamp}` : null)
                    setpickedVehicleImageIMG(userInfo?.vehicleImage ? `${userInfo.vehicleImage}?t=${timestamp}` : null)
                    setCarRegistrationIMG(userInfo?.carRegistrationPaper ? `${userInfo.carRegistrationPaper}?t=${timestamp}` : null)
                    setghanaCardImage(userInfo?.ghanaCardNo || '')
                    
                    // Clear the picked image objects to show server images
                    setPickedDrivingLicenseFront(null)
                    setPickedDrivingLicenseback(null)
                    setPickedCarInsurance(null)
                    setPickedTransitInsurance(null)
                    setpickedVehicleImage(null)
                    setCarRegistration(null)

                    setDate(userInfo?.licenseExpDate ? moment(userInfo.licenseExpDate).format('DD-MM-YYYY') : 'DD - MM  - YYYY')
                    //setSelectedDate(moment(userInfo?.licenseExpDate).format('DD-MM-YYYY'))
                    setDate2(userInfo?.carInsuranceExpDate ? moment(userInfo.carInsuranceExpDate).format('DD-MM-YYYY') : 'DD - MM  - YYYY')
                    //setSelectedDate2(moment(userInfo?.licenseExpDate).format('DD-MM-YYYY'))
                    setDate3(userInfo?.gtInsuranceExpDate ? moment(userInfo.gtInsuranceExpDate).format('DD-MM-YYYY') : 'DD - MM  - YYYY')
                    //setSelectedDate3(moment(userInfo?.licenseExpDate).format('DD-MM-YYYY'))
                    setIsLoading(false);
                })
                .catch(e => {
                    console.log(`Profile error ${e}`)
                });
        });

    }

    useEffect(() => {
        fetchProfileDetails();
    }, [])

    if (isLoading) {
        return (
            <Loader />
        )
    }

    // const pickDocument = async (forwhat) => {
    //     try {
    //         const result = await DocumentPicker.pick({
    //             type: [DocumentPicker.types.allFiles],
    //         });

    //         console.log('URI: ', result[0].uri);
    //         console.log('Type: ', result[0].type);
    //         console.log('Name: ', result[0].name);
    //         console.log('Size: ', result[0].size);
    //         if (forwhat == 'DrivingLicenseFront') {
    //             setPickedDrivingLicenseFront(result[0]);
    //             setPickedDrivingLicenseFrontIMG(result[0].uri)
    //             setDrivingLicenseFrontError('')
    //             //fileUpload('DrivingLicenseFront')
    //         } else if (forwhat == 'DrivingLicenseBack') {
    //             setPickedDrivingLicenseback(result[0])
    //             setPickedDrivingLicensebackIMG(result[0].uri)
    //             setDrivingLicenseBackError('')
    //         } else if (forwhat == 'CarInsurance') {
    //             setPickedCarInsurance(result[0])
    //             setPickedCarInsuranceIMG(result[0].uri)
    //             setCarInsuranceError('')
    //         } else if (forwhat == 'TransitInsurance') {
    //             setPickedTransitInsurance(result[0])
    //             setPickedTransitInsuranceIMG(result[0].uri)
    //             setTransitInsuranceError('')
    //         } else if (forwhat == 'VehicleImage') {
    //             setpickedVehicleImage(result[0])
    //             setpickedVehicleImageIMG(result[0].uri)
    //             setVehicleImageError('')
    //         } else if (forwhat == 'CarRegistration') {
    //             setCarRegistration(result[0])
    //             setCarRegistrationIMG(result[0].uri)
    //         }


    //     } catch (err) {
    //         if (DocumentPicker.isCancel(err)) {
    //             // User cancelled the document picker
    //             console.log('Document picker was cancelled');
    //         } else {
    //             console.error('Error picking document', err);
    //         }
    //     }
    // };

    const requestCameraPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: 'Camera Permission',
                        message: 'This app needs access to your camera to take photos of documents.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true; // iOS permissions are handled automatically
    };

    const showImagePickerOptions = (forwhat) => {
        Alert.alert(
            'Select Image',
            'Choose an option to select image',
            [
                {
                    text: 'Camera',
                    onPress: () => openCamera(forwhat),
                },
                {
                    text: 'Gallery',
                    onPress: () => openGallery(forwhat),
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ],
            { cancelable: true }
        );
    };

    const openCamera = async (forwhat) => {
        const hasPermission = await requestCameraPermission();
        
        if (!hasPermission) {
            Alert.alert(
                'Permission Required',
                'Camera permission is required to take photos. Please enable it in your device settings.',
                [{ text: 'OK' }]
            );
            return;
        }

        const options = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
        };

        launchCamera(options, (response) => {
            if (response.didCancel) {
                console.log('Camera was cancelled');
                return;
            }
            
            if (response.errorMessage) {
                console.error('Camera Error: ', response.errorMessage);
                Alert.alert(
                    'Camera Error',
                    'Unable to open camera. Please try again.',
                    [{ text: 'OK' }]
                );
                return;
            }

            if (response.assets && response.assets.length > 0) {
                handleImageSelection(response.assets[0], forwhat);
            }
        });
    };

    const openGallery = (forwhat) => {
        const options = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
        };

        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('Gallery was cancelled');
                return;
            }
            
            if (response.errorMessage) {
                console.error('Gallery Error: ', response.errorMessage);
                return;
            }

            if (response.assets && response.assets.length > 0) {
                handleImageSelection(response.assets[0], forwhat);
            }
        });
    };

    const handleImageSelection = (image, forwhat) => {
        console.log('URI: ', image.uri);
        console.log('Type: ', image.type);
        console.log('Name: ', image.fileName || 'image.jpg');
        console.log('Size: ', image.fileSize);

        if (forwhat === 'DrivingLicenseFront') {
            setPickedDrivingLicenseFront(image);
            setPickedDrivingLicenseFrontIMG(image.uri);
            setDrivingLicenseFrontError('');
        } else if (forwhat === 'DrivingLicenseBack') {
            setPickedDrivingLicenseback(image);
            setPickedDrivingLicensebackIMG(image.uri);
            setDrivingLicenseBackError('');
        } else if (forwhat === 'CarInsurance') {
            setPickedCarInsurance(image);
            setPickedCarInsuranceIMG(image.uri);
            setCarInsuranceError('');
        } else if (forwhat === 'TransitInsurance') {
            setPickedTransitInsurance(image);
            setPickedTransitInsuranceIMG(image.uri);
            setTransitInsuranceError('');
        } else if (forwhat === 'VehicleImage') {
            setpickedVehicleImage(image);
            setpickedVehicleImageIMG(image.uri);
            setVehicleImageError('');
        } else if (forwhat === 'CarRegistration') {
            setCarRegistration(image);
            setCarRegistrationIMG(image.uri);
        }
    };

    const pickDocument = (forwhat) => {
        showImagePickerOptions(forwhat);
    };

    const submitForm = () => {
        //navigation.navigate('CapacityDetails')
        if (!pickedDrivingLicenseFront && !pickedDrivingLicenseFrontIMG) {
            //console.warn('No document selected for upload');
            setDrivingLicenseFrontError('Please upload Driving License Front side')
        } else if (!pickedDrivingLicenseBack && !pickedDrivingLicenseBackIMG) {
            setDrivingLicenseBackError('Please upload Driving License Back side')
        } else if (date == 'DD - MM  - YYYY') {
            setDrivingLicenseExpiryDateError('Please choose Driving License Expiry Date')
        } else {
            const formData = new FormData();
           
            console.log(pickedDrivingLicenseFront, 'mmmmm')
            if (pickedDrivingLicenseFront != null) {
                formData.append("licenseFront", {
                    uri: pickedDrivingLicenseFront.uri,
                    type: 'image/jpeg',
                    name: 'photo.jpg',
                });
            }
            // else {
            //     formData.append("licenseFront", "");
            // }
            if (pickedDrivingLicenseBack != null) {
                formData.append("licenseBack", {
                    uri: pickedDrivingLicenseBack.uri,
                    type: 'image/jpeg',
                    name: 'photo.jpg',
                });
            }
            //  else {
            //     formData.append("licenseBack", "");
            // }
            if (pickedCarInsurance != null) {
                formData.append("carInsurance", {
                    uri: pickedCarInsurance.uri,
                    type: 'image/jpeg',
                    name: 'photo.jpg',
                });
            }
            //  else {
            //     formData.append("carInsurance", "");
            // }
            if (pickedTransitInsurance != null) {
                formData.append("gtInsurance", {
                    uri: pickedTransitInsurance.uri,
                    type: 'image/jpeg',
                    name: 'photo.jpg',
                });
            }
            //  else {
            //     formData.append("gtInsurance", "");
            // }
            if (pickedVehicleImage != null) {
                formData.append("vehicleImage", {
                    uri: pickedVehicleImage.uri,
                    type: 'image/jpeg',
                    name: 'photo.jpg',
                });
            }
            //  else {
            //     formData.append("vehicleImage", "");
            // }
            if (pickedCarRegistration != null) {
                formData.append("carRegistrationPaper", {
                    uri: pickedCarRegistration.uri,
                    type: 'image/jpeg',
                    name: 'photo.jpg',
                });
            }
            //  else {
            //     formData.append("carRegistrationPaper", "");
            // }
            console.log('Date values:', { date, date2, date3 })
            formData.append("licenseExpDate", date !== 'DD - MM  - YYYY' ? moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD') : "");
            formData.append("carInsuranceExpDate", date2 !== 'DD - MM  - YYYY' ? moment(date2, 'DD-MM-YYYY').format('YYYY-MM-DD') : "");
            formData.append("gtInsuranceExpDate", date3 !== 'DD - MM  - YYYY' ? moment(date3, 'DD-MM-YYYY').format('YYYY-MM-DD') : "");
            formData.append("ghanaCardNo", ghanaCardImage);

            console.log(JSON.stringify(formData), 'form datatatattatatatatatatat')
            //return;
            setIsLoading(true)
            AsyncStorage.getItem('userToken', (err, usertoken) => {
                axios.post(`${process.env.API_URL}/api/driver/submitDocuments`, formData, {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'multipart/form-data',
                        "Authorization": 'Bearer ' + usertoken,
                    },
                })
                    .then(res => {
                        console.log(res.data)
                        if (res.data.response.status.code === 200) {
                            // Refresh profile data after successful upload
                            fetchProfileDetails();
                            Toast.show({
                                type: 'success',
                                text1: 'Hello',
                                text2: "Update Successfully",
                                position: 'top',
                                topOffset: Platform.OS == 'ios' ? 55 : 20
                            });
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
            });
        }

    }

    const deleteFrontImg = () => {
        setPickedDrivingLicenseFrontIMG(null)
        setPickedDrivingLicenseFront(null)
    }
    const deleteBackImg = () => {
        setPickedDrivingLicensebackIMG(null)
        setPickedDrivingLicenseback(null)
    }
    const deleteCarImg = () => {
        setPickedCarInsuranceIMG(null)
        setPickedCarInsurance(null)
    }
    const deleteTransitImg = () => {
        setPickedTransitInsuranceIMG(null)
        setPickedTransitInsurance(null)
    }
    const deleteVehicleImg = () => {
        setpickedVehicleImage(null)
        setpickedVehicleImageIMG(null)
    }
    const deleteCarResImg = () => {
        setCarRegistration(null)
        setCarRegistrationIMG(null)
    }

    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Documents'} title={'Documents'} onPress={() => navigation.goBack()} onPressProfile={() => navigation.navigate('Profile')} />
            <ScrollView style={styles.wrapper}>
                <View style={styles.textinputview}>
                    <Text
                        style={styles.header}>
                        Driving License
                    </Text>
                    {DrivingLicenseFrontError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{DrivingLicenseFrontError}</Text> : <></>}
                    {DrivingLicenseBackError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{DrivingLicenseBackError}</Text> : <></>}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>

                    {!pickedDrivingLicenseFrontIMG ?
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
                        :
                        <View>
                            <Image source={{ uri: pickedDrivingLicenseFrontIMG }} style={{ height: responsiveHeight(20), width: responsiveWidth(40), borderRadius: 10 }} />

                            <View style={{ position: 'absolute', right: 5, top: 5 }}>
                                <TouchableOpacity onPress={() => deleteFrontImg()}>
                                    <Image
                                        source={deleteRoundImg}
                                        style={{ height: 25, width: 25 }}
                                    />
                                </TouchableOpacity>
                            </View>

                        </View>
                    }
                    {!pickedDrivingLicenseBackIMG ?
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
                        :
                        <View>
                            <Image source={{ uri: pickedDrivingLicenseBackIMG }} style={{ height: responsiveHeight(20), width: responsiveWidth(40), borderRadius: 10 }} />

                            <View style={{ position: 'absolute', right: 5, top: 5 }}>
                                <TouchableOpacity onPress={() => deleteBackImg()}>
                                    <Image
                                        source={deleteRoundImg}
                                        style={{ height: 25, width: 25 }}
                                    />
                                </TouchableOpacity>
                            </View>

                        </View>
                    }
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
                {open == true ?
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
                    /> : null}
                <View style={styles.textinputview}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                        <Text
                            style={styles.header}>
                            Car Insurance
                        </Text>
                        <Text style={{ color: '#808080', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(1.5), marginLeft: 5 }}>(Optional)</Text>
                    </View>
                    {CarInsuranceError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{CarInsuranceError}</Text> : <></>}
                </View>
                <View style={{}}>
                    {!pickedCarInsuranceIMG ?
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
                        :
                        <View>
                            <Image source={{ uri: pickedCarInsuranceIMG }} style={{ height: responsiveHeight(20), width: responsiveWidth(88), borderRadius: 10 }} />

                            <View style={{ position: 'absolute', right: 15, top: 7 }}>
                                <TouchableOpacity onPress={() => deleteCarImg()}>
                                    <Image
                                        source={deleteRoundImg}
                                        style={{ height: 25, width: 25 }}
                                    />
                                </TouchableOpacity>
                            </View>

                        </View>
                    }
                </View>
                <View style={styles.textinputview}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                        <Text
                            style={styles.header}>
                            Car Insurance Expiry Date
                        </Text>
                        <Text style={{ color: '#808080', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(1.5), marginLeft: 5 }}>(Optional)</Text>
                    </View>
                    {CarInsuranceExpiryDateError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{CarInsuranceExpiryDateError}</Text> : <></>}
                </View>
                <TouchableOpacity onPress={() => setOpen2(true)}>
                    <View style={styles.datebox}>
                        <Text style={styles.dayname}>  {date2}</Text>
                        <Entypo name="calendar" size={25} color="#000" />
                    </View>
                </TouchableOpacity>
                {open2 == true ?
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
                    /> : null}
                <View style={styles.textinputview}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                        <Text
                            style={styles.header}>
                            Goods in Transit  Insurance
                        </Text>
                        <Text style={{ color: '#808080', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(1.5), marginLeft: 5 }}>(Optional)</Text>
                    </View>
                    {TransitInsuranceError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{TransitInsuranceError}</Text> : <></>}
                </View>
                <View style={{}}>
                    {!pickedTransitInsuranceIMG ?
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
                        :
                        <View>
                            <Image source={{ uri: pickedTransitInsuranceIMG }} style={{ height: responsiveHeight(20), width: responsiveWidth(88), borderRadius: 10 }} />

                            <View style={{ position: 'absolute', right: 15, top: 7 }}>
                                <TouchableOpacity onPress={() => deleteTransitImg()}>
                                    <Image
                                        source={deleteRoundImg}
                                        style={{ height: 25, width: 25 }}
                                    />
                                </TouchableOpacity>
                            </View>

                        </View>
                    }
                </View>
                <View style={styles.textinputview}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                        <Text
                            style={styles.header}>
                            Goods in Transit Insurance Expiry Date
                        </Text>
                        <Text style={{ color: '#808080', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(1.5), marginLeft: 5 }}>(Optional)</Text>
                    </View>
                    {TransitInsuranceExpiryDateError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{TransitInsuranceExpiryDateError}</Text> : <></>}
                </View>
                <TouchableOpacity onPress={() => setOpen3(true)}>
                    <View style={styles.datebox}>
                        <Text style={styles.dayname}>  {date3}</Text>
                        <Entypo name="calendar" size={25} color="#000" />
                    </View>
                </TouchableOpacity>
                {open3 == true ?
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
                    /> : null}
                <View style={styles.textinputview}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                        <Text
                            style={styles.header}>
                            Vehicle Image
                        </Text>
                        <Text style={{ color: '#808080', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(1.5), marginLeft: 5 }}>(Optional)</Text>
                    </View>
                    {VehicleImageError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{VehicleImageError}</Text> : <></>}
                    <Text style={{ color: '#808080', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(1.5) }}>All vehicles are subject to physical inspection</Text>
                </View>
                <View style={{}}>
                    {!pickedVehicleImageIMG ?
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
                        :
                        <View>
                            <Image source={{ uri: pickedVehicleImageIMG }} style={{ height: responsiveHeight(20), width: responsiveWidth(88), borderRadius: 10 }} />

                            <View style={{ position: 'absolute', right: 15, top: 7 }}>
                                <TouchableOpacity onPress={() => deleteVehicleImg()}>
                                    <Image
                                        source={deleteRoundImg}
                                        style={{ height: 25, width: 25 }}
                                    />
                                </TouchableOpacity>
                            </View>

                        </View>
                    }
                </View>
                <View style={styles.textinputview}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                        <Text
                            style={styles.header}>
                            Ghana Card number
                        </Text>
                        <Text style={{ color: '#808080', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(1.5), marginLeft: 5 }}>(Optional)</Text>
                    </View>
                </View>
                {/* {ghanaCardImageError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{ghanaCardImageError}</Text> : <></>} */}
                    <View style={styles.inputView}>
                        <InputField
                            label={'Ghana card no'}
                            keyboardType=" "
                            value={ghanaCardImage}
                            //helperText={'Please enter lastname'}
                            inputType={'others'}
                            onChangeText={(text) => setghanaCardImage(text)}
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
                <View style={{ paddingBottom: responsiveHeight(13) }}>
                    {!pickedCarRegistrationIMG ?
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
                        :
                        <View>
                            <Image source={{ uri: pickedCarRegistrationIMG }} style={{ height: responsiveHeight(20), width: responsiveWidth(88), borderRadius: 10 }} />

                            <View style={{ position: 'absolute', right: 15, top: 7 }}>
                                <TouchableOpacity onPress={() => deleteCarResImg()}>
                                    <Image
                                        source={deleteRoundImg}
                                        style={{ height: 25, width: 25 }}
                                    />
                                </TouchableOpacity>
                            </View>

                        </View>
                    }
                </View>
            </ScrollView>

            <View style={styles.buttonwrapper}>
                <CustomButton label={"Submit"}
                    // onPress={() => { login() }}
                    onPress={() => { submitForm() }}
                />
            </View>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: responsiveHeight(1)
    },
    wrapper: {
        padding: 20,
    },
    textinputview: {
        marginBottom: responsiveHeight(3),
        marginTop: responsiveHeight(1)
    },
    header: {
        fontFamily: 'Outfit-Medium',
        fontSize: responsiveFontSize(2),
        color: '#2F2F2F',
        marginBottom: responsiveHeight(1),
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
    buttonwrapper: {
        paddingHorizontal: 20,
        position: 'absolute',
        bottom: -20,
        width: responsiveWidth(100),
    },

});