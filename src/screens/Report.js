import React, { useContext, useState, useEffect } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    Image,
    TouchableOpacity,
    TouchableWithoutFeedback,
    FlatList,
    StyleSheet,
    Dimensions,
    Alert,
} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '@env'
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { add } from '../store/cartSlice';
import { licenseImg, emailImg, forwordImg, ordersImg, phoneImg, deleteRoundImg, uploadImg, testImg, addressImg, pointerImg } from '../utils/Images';
import Loader from '../utils/Loader';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import CustomHeader from '../components/CustomHeader';
import Entypo from 'react-native-vector-icons/Entypo';
import CustomButton from '../components/CustomButton';
import { Dropdown } from 'react-native-element-dropdown';
import ImagePicker from 'react-native-image-crop-picker';
import Toast from 'react-native-toast-message';
import InputField from '../components/InputField'; 
import GetLocation from 'react-native-get-location'
import { useNavigation } from '@react-navigation/native';


// const batchdata = [
//     { label: 'Absa Bank Ghana Limited', value: 'Absa Bank Ghana Limited' },
//     { label: 'Access Bank (Ghana) Plc', value: 'Access Bank (Ghana) Plc' },
//     { label: 'Agricultural Development Bank Plc', value: 'Agricultural Development Bank Plc' },
// ];

const BannerWidth = Dimensions.get('window').width;
const ITEM_WIDTH = Math.round(BannerWidth * 0.7)
const { height, width } = Dimensions.get('screen')

export default function Report({  }) {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { data: products, status } = useSelector(state => state.products)
    //const { userInfo } = useContext(AuthContext)
    const [batchvalue, setbatchValue] = useState(null);
    const [isFocusbatch, setIsFocusbatch] = useState(false);
    const [batchdata, setBatchdata] = useState([])
    const [batchErr, setBatchErr] = useState('')

    const [ordervalue, setorderValue] = useState(null);
    const [orderRefvalue, setorderRefValue] = useState(null);
    const [isFocusorder, setIsFocusorder] = useState(false);
    const [orderdata, setOrderdata] = useState([])
    const [orderErr, setOrderErr] = useState('')

    const [ordertypevalue, setordertypeValue] = useState(null);
    const [isFocusordertype, setIsFocusordertype] = useState(false);
    const [ordertypedata, setOrdertypedata] = useState([
        { label: 'Pickup', value: 'Pickup' },
        { label: 'Warehouse', value: 'Warehouse' },
        { label: 'Delivery', value: 'Delivery' }
    ])
    const [orderTypeErr, setOrderTypeErr] = useState('')

    const [damagetypevalue, setdamagetypeValue] = useState(null);
    const [isFocusdamagetype, setIsFocusdamagetype] = useState(false);
    const [damagetypedata, setDamagetypedata] = useState([
        { label: 'Vehicle break-down', value: 'Vehicle break-down' },
        { label: 'Transport Issue', value: 'Transport Issue' },
        { label: 'Any other', value: 'Any other' }
    ])
    const [damageErr, setDamageErr] = useState('')

    const [selectedImage1, setSelectedImage1] = useState(null);
    const [selectedImage2, setSelectedImage2] = useState(null);
    const [selectedImage3, setSelectedImage3] = useState(null);
    const [address, setAddress] = useState('');
    const [addressErr, setAddressErr] = useState('')
    const [review, setreview] = useState('');
    const [myLocation, setMyLocation] = useState(null);
    const [locationErr, setLocationErr] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const fetchBatch = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.get(`${process.env.API_URL}/api/driver/get-all-batch`, {
                headers: {
                    "Authorization": 'Bearer ' + usertoken,
                    "Content-Type": 'application/json'
                },
            })
                .then(res => {
                    console.log(JSON.stringify(res.data))
                    if (res.data.response.status.code === 200) {
                        setIsLoading(false)
                        const originalResponse = res.data.response.records
                        const transformedResponse = originalResponse.map(item => ({
                            label: item.batch_no,
                            value: item.id
                        }));
                        setBatchdata(transformedResponse)

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
                    console.log(e.response.data)
                    // Alert.alert('Oops..', e.response.data?., [
                    //     {
                    //         text: 'Cancel',
                    //         onPress: () => console.log('Cancel Pressed'),
                    //         style: 'cancel',
                    //     },
                    //     { text: 'OK', onPress: () => console.log('OK Pressed') },
                    // ]);
                });

        });

    }

    const fetchOrderByBatchId = (id) => {
        console.log(id, 'iiiiiiiiidddddddddd')
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.get(`${process.env.API_URL}/api/driver/get-item-by-batch-id/${id}`, {
                headers: {
                    "Authorization": 'Bearer ' + usertoken,
                    "Content-Type": 'application/json'
                },
            })
                .then(res => {
                    console.log(JSON.stringify(res.data))
                    if (res.data.response.status.code === 200) {
                        setIsLoading(false)
                        const originalResponse = res.data.response.records
                        const transformedResponse = originalResponse.map(item => ({
                            label: item.reference,
                            value: item.id
                        }));
                        setOrderdata(transformedResponse)

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
                    console.log(e.response.data)
                    // Alert.alert('Oops..', e.response.data?., [
                    //     {
                    //         text: 'Cancel',
                    //         onPress: () => console.log('Cancel Pressed'),
                    //         style: 'cancel',
                    //     },
                    //     { text: 'OK', onPress: () => console.log('OK Pressed') },
                    // ]);
                });

        });
    }

    useEffect(() => {
        fetchBatch();
    }, [])

    const submitForm = () => {
        if (!batchvalue) {
            //console.warn('No document selected for upload');
            setBatchErr('Please select batch Id')
        } else if (!ordervalue) {
            setOrderErr('Please select Order Id')
        } else if (!ordertypevalue) {
            setOrderTypeErr('Please select order type')
        } else if (!damagetypevalue) {
            setDamageErr('Please select damage type')
        } else if (!myLocation) {
            setLocationErr('Please select location')
        } else if (!address) {
            setAddressErr('Please enter address')
        } else {
            setIsLoading(true)
            const formData = new FormData();
            if (selectedImage1 != null) {
                formData.append("pic_1", {
                    uri: selectedImage1.uri,
                    type: 'image/jpeg',
                    name: 'photo.jpg',
                });
            } else {
                formData.append("pic_1", "");
            }
            if (selectedImage2 != null) {
                formData.append("pic_2", {
                    uri: selectedImage2.uri,
                    type: 'image/jpeg',
                    name: 'photo.jpg',
                });
            } else {
                formData.append("pic_2", "");
            }
            if (selectedImage3 != null) {
                formData.append("pic_3", {
                    uri: selectedImage3.uri,
                    type: 'image/jpeg',
                    name: 'photo.jpg',
                });
            } else {
                formData.append("pic_3", "");
            }

            formData.append("batch_id", batchvalue);
            formData.append("order_id", ordervalue);
            formData.append("order_reference", orderRefvalue);
            formData.append("order_type", ordertypevalue);
            formData.append("damage_type", damagetypevalue);
            formData.append("lat", myLocation.latitude);
            formData.append("lng", myLocation.longitude);
            formData.append("description", review);
            formData.append("location", address);
            console.log(JSON.stringify(formData))
            AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${process.env.API_URL}/api/driver/submit-delivery-report`, formData, {
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
                            text2: 'Report submitted successfully.',
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

    if (isLoading) {
        return (
            <Loader />
        )
    }

    const selectImageFromCamera1 = () => {
        ImagePicker.openCamera({
            width: 300,
            height: 400,
            cropping: true,
        }).then(image => {
            setSelectedImage1({ uri: image.path });
        }).catch(error => {
            console.log('Error:', error);
        });
    };
    const selectImageFromCamera2 = () => {
        ImagePicker.openCamera({
            width: 300,
            height: 400,
            cropping: true,
        }).then(image => {
            setSelectedImage2({ uri: image.path });
        }).catch(error => {
            console.log('Error:', error);
        });
    };
    const selectImageFromCamera3 = () => {
        ImagePicker.openCamera({
            width: 300,
            height: 400,
            cropping: true,
        }).then(image => {
            setSelectedImage3({ uri: image.path });
        }).catch(error => {
            console.log('Error:', error);
        });
    };


    const deleteFrontImg = () => {
        setSelectedImage1(null)
    }
    const deleteFrontImg2 = () => {
        setSelectedImage2(null)
    }
    const deleteFrontImg3 = () => {
        setSelectedImage3(null)
    }
    const fetchLocation = () => {
        GetLocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 60000,
        })
            .then(location => {
                console.log(location);
                setMyLocation(location)
                setLocationErr('')
            })
            .catch(error => {
                const { code, message } = error;
                console.warn(code, message);
            })
    }


    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Report'} title={'Report'} onPress={() => navigation.goBack()} onPressProfile={() => navigation.navigate('Profile')} />
            <ScrollView style={styles.wrapper}>
                <Text
                    style={styles.header}>
                    Batch Id
                </Text>
                {batchErr ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{batchErr}</Text> : <></>}
                <View style={styles.inputView}>
                    <Dropdown
                        style={[styles.dropdown, isFocusbatch && { borderColor: 'blue' }]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        data={batchdata}
                        search
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder={!isFocusbatch ? 'Select batch' : '...'}
                        searchPlaceholder="Search..."
                        value={batchvalue}
                        onFocus={() => setIsFocusbatch(true)}
                        onBlur={() => setIsFocusbatch(false)}
                        onChange={item => {
                            setbatchValue(item.value);
                            setBatchErr('')
                            fetchOrderByBatchId(item.value)
                            setIsFocusbatch(false);
                        }}
                    />
                </View>
                <Text
                    style={styles.header}>
                    Order Id
                </Text>
                {orderErr ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{orderErr}</Text> : <></>}
                <View style={styles.inputView}>
                    <Dropdown
                        style={[styles.dropdown, isFocusorder && { borderColor: 'blue' }]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        data={orderdata}
                        search
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder={!isFocusorder ? 'Select order' : '...'}
                        searchPlaceholder="Search..."
                        value={ordervalue}
                        onFocus={() => setIsFocusorder(true)}
                        onBlur={() => setIsFocusorder(false)}
                        onChange={item => {
                            setorderValue(item.value);
                            setorderRefValue(item.label)
                            setOrderErr('')
                            setIsFocusorder(false);
                        }}
                    />
                </View>
                <Text
                    style={styles.header}>
                    Order Type
                </Text>
                {orderTypeErr ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{orderTypeErr}</Text> : <></>}
                <View style={styles.inputView}>
                    <Dropdown
                        style={[styles.dropdown, isFocusordertype && { borderColor: 'blue' }]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        data={ordertypedata}
                        search
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder={!isFocusordertype ? 'Select order type' : '...'}
                        searchPlaceholder="Search..."
                        value={ordertypevalue}
                        onFocus={() => setIsFocusordertype(true)}
                        onBlur={() => setIsFocusordertype(false)}
                        onChange={item => {
                            setordertypeValue(item.value);
                            setOrderTypeErr('')
                            setIsFocusordertype(false);
                        }}
                    />
                </View>
                <Text
                    style={styles.header}>
                    Damage type
                </Text>
                {damageErr ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{damageErr}</Text> : <></>}
                <View style={styles.inputView}>
                    <Dropdown
                        style={[styles.dropdown, isFocusdamagetype && { borderColor: 'blue' }]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        data={damagetypedata}
                        search
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder={!isFocusdamagetype ? 'Select damage type' : '...'}
                        searchPlaceholder="Search..."
                        value={damagetypevalue}
                        onFocus={() => setIsFocusdamagetype(true)}
                        onBlur={() => setIsFocusdamagetype(false)}
                        onChange={item => {
                            setdamagetypeValue(item.value);
                            setDamageErr('')
                            setIsFocusdamagetype(false);
                        }}
                    />
                </View>
                <Text
                    style={styles.header}>
                    Photos
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    {!selectedImage1 ?
                        <View style={{ height: responsiveHeight(20), width: responsiveWidth(29), borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 10, borderStyle: 'dashed', backgroundColor: '#FAFAFA' }}>
                            <View style={{ flexDirection: 'column', alignItems: 'center', marginVertical: 40 }}>
                                <View style={{ height: 40, width: 40, borderRadius: 40, backgroundColor: '#D9FFFF', justifyContent: 'center', alignItems: 'center', }}>
                                    <TouchableOpacity onPress={() => selectImageFromCamera1()}>
                                        <Image
                                            source={uploadImg}
                                            style={{ height: 25, width: 25 }}
                                        />
                                    </TouchableOpacity>
                                    {/* {selectedImage && (
                                <Image
                                    source={selectedImage}
                                    style={{ width: 200, height: 200, marginBottom: 20 }}
                                />
                            )} */}
                                </View>
                                <Text style={{ fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), color: '#808080', }}>Open Camera</Text>
                            </View>
                        </View>
                        :
                        <View>
                            <Image source={selectedImage1} style={{ height: responsiveHeight(20), width: responsiveWidth(29), borderRadius: 10 }} />

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
                    {!selectedImage2 ?
                        <View style={{ height: responsiveHeight(20), width: responsiveWidth(29), borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 10, borderStyle: 'dashed', backgroundColor: '#FAFAFA' }}>
                            <View style={{ flexDirection: 'column', alignItems: 'center', marginVertical: 40 }}>
                                <View style={{ height: 40, width: 40, borderRadius: 40, backgroundColor: '#D9FFFF', justifyContent: 'center', alignItems: 'center', }}>
                                    <TouchableOpacity onPress={() => selectImageFromCamera2()}>
                                        <Image
                                            source={uploadImg}
                                            style={{ height: 25, width: 25 }}
                                        />
                                    </TouchableOpacity>
                                    {/* {selectedImage && (
                                <Image
                                    source={selectedImage}
                                    style={{ width: 200, height: 200, marginBottom: 20 }}
                                />
                            )} */}
                                </View>
                                <Text style={{ fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), color: '#808080', }}>Open Camera</Text>
                            </View>
                        </View>
                        :
                        <View>
                            <Image source={selectedImage2} style={{ height: responsiveHeight(20), width: responsiveWidth(29), borderRadius: 10 }} />

                            <View style={{ position: 'absolute', right: 5, top: 5 }}>
                                <TouchableOpacity onPress={() => deleteFrontImg2()}>
                                    <Image
                                        source={deleteRoundImg}
                                        style={{ height: 25, width: 25 }}
                                    />
                                </TouchableOpacity>
                            </View>

                        </View>
                    }
                    {!selectedImage3 ?
                        <View style={{ height: responsiveHeight(20), width: responsiveWidth(29), borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 10, borderStyle: 'dashed', backgroundColor: '#FAFAFA' }}>
                            <View style={{ flexDirection: 'column', alignItems: 'center', marginVertical: 40 }}>
                                <View style={{ height: 40, width: 40, borderRadius: 40, backgroundColor: '#D9FFFF', justifyContent: 'center', alignItems: 'center', }}>
                                    <TouchableOpacity onPress={() => selectImageFromCamera3()}>
                                        <Image
                                            source={uploadImg}
                                            style={{ height: 25, width: 25 }}
                                        />
                                    </TouchableOpacity>
                                    {/* {selectedImage && (
                                <Image
                                    source={selectedImage}
                                    style={{ width: 200, height: 200, marginBottom: 20 }}
                                />
                            )} */}
                                </View>
                                <Text style={{ fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), color: '#808080', }}>Open Camera</Text>
                            </View>
                        </View>
                        :
                        <View>
                            <Image source={selectedImage3} style={{ height: responsiveHeight(20), width: responsiveWidth(29), borderRadius: 10 }} />

                            <View style={{ position: 'absolute', right: 5, top: 5 }}>
                                <TouchableOpacity onPress={() => deleteFrontImg3()}>
                                    <Image
                                        source={deleteRoundImg}
                                        style={{ height: 25, width: 25 }}
                                    />
                                </TouchableOpacity>
                            </View>

                        </View>
                    }
                </View>
                {locationErr ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{locationErr}</Text> : <></>}
                <Text style={[styles.header, { marginTop: responsiveHeight(4) }]}>
                    Fetch Location
                </Text>
                <View style={{ height: responsiveHeight(8), borderColor: '#E0E0E0', borderWidth: 0.7, borderRadius: 4, paddingHorizontal: 8, marginTop: 5, marginBottom: responsiveHeight(4), flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: responsiveWidth(75) }}>
                        {myLocation ? <Text style={{ fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), color: '#808080', }}>{myLocation?.latitude} , {myLocation.longitude}</Text> : <Text style={{ fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), color: '#808080', }}>Click on right side pointer</Text>}
                    </View>
                    <TouchableOpacity onPress={() => { fetchLocation() }}>
                        <Image source={pointerImg} style={styles.iconImage} tintColor={'#339999'} />
                    </TouchableOpacity>
                </View>
                {addressErr ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{addressErr}</Text> : <></>}
                <Text style={[styles.header]}>
                    Address
                </Text>
                <View style={{ paddingBottom: responsiveHeight(0) }}>
                    <InputField
                        label={'Enter your physical address'}
                        keyboardType="default"
                        value={address}
                        //helperText={addressError}
                        inputType={'others'}
                        inputFieldType={'address'}
                        onChangeText={(text) => {
                            setAddress(text)
                        }}
                    />
                </View>
                <Text style={[styles.header]}>
                    Write Something
                </Text>
                <View style={{ paddingBottom: responsiveHeight(10) }}>
                    <InputField
                        label={'Enter your review...'}
                        keyboardType="default"
                        value={review}
                        //helperText={addressError}
                        inputType={'address'}
                        inputFieldType={'address'}
                        onChangeText={(text) => {
                            setreview(text)
                        }}
                    />
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
    header: {
        fontFamily: 'Outfit-Medium',
        fontSize: responsiveFontSize(2),
        color: '#2F2F2F',
        marginBottom: responsiveHeight(1),
    },
    dropdown: {
        height: responsiveHeight(8),
        borderColor: '#E0E0E0',
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
    buttonwrapper: {
        paddingHorizontal: 20,
        position: 'absolute',
        bottom: -20,
        width: responsiveWidth(100),
    },
    iconImage: {
        width: 23,
        height: 23,
    },

});