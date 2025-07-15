import React, { useState, useContext, useEffect, useRef } from 'react'
import { View, Text, SafeAreaView, StyleSheet, ScrollView, Alert, Image, TouchableOpacity, Platform } from 'react-native'
import * as Animatable from 'react-native-animatable';
import CustomHeader from '../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TextInput, LongPressGestureHandler, State } from 'react-native-gesture-handler'
import { addressWhiteImg, dubbleArrowImg, downloadImg, searchImg, userPhoto, addressImg, pointerImg, verifiedImg } from '../utils/Images'
import CustomButton from '../components/CustomButton'
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { API_URL } from '@env'
import Loader from '../utils/Loader'
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Entypo';
import Modal from "react-native-modal";
import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker from '@react-native-documents/picker';
import SignatureScreen from "react-native-signature-canvas";
import StarRating from 'react-native-star-rating-widget';
import InputField from '../components/InputField';
import RNFetchBlob from 'rn-fetch-blob';
import Toast from 'react-native-toast-message';

const ShippingItemVerifiedScreen = ({ navigation, route }) => {
    const { logout } = useContext(AuthContext);
    const [userInfo, setuserInfo] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isModalVisible, setModalVisible] = useState(false);
    const [isReviewModalVisible, setReviewModalVisible] = useState(false);
    const [starCount, setStarCount] = useState(3.5)
    const [address, setaddress] = useState('');
    const [addressError, setaddressError] = useState('')
    const [itemId, setItemId] = useState(route?.params.itemId)
    const [orderType, setOrderType] = useState(route?.params?.orderType)
    const [forWhich, setForWhich] = useState(route?.params?.forWhich)
    const [orderId, setOrderId] = useState(route?.params?.orderId)
    const [amount, setAmount] = useState(route?.params?.amount)
    const [signatureImg, setSignatureImg] = useState('')
    const [signatureImgError, setSignatureImgError] = useState('')
    const [selectedImage1, setSelectedImage1] = useState(null);
    const [selectedImage1Error, setSelectedImage1Error] = useState('');
    const [pickDocs, setPickedDocs] = useState(null)
    const [pickDocsError, setPickedDocsError] = useState('')
    const [userId, setUserId] = useState(null)

    const fetchProfileDetails = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.get(`${API_URL}/api/driver/me`, {
                headers: {
                    "Authorization": 'Bearer ' + usertoken,
                    "Content-Type": 'application/json'
                },
            })
                .then(res => {
                    //console.log(res.data, 'user details')
                    let userInfo = res.data.response.records.data;
                    console.log(userInfo, '-----------------------------')
                    setUserId(userInfo.id)
                })
                .catch(e => {
                    console.log(`User Details Fetch error ${e}`)
                });
        });
    }
    useEffect(() => {
        fetchProfileDetails()
    }, [])

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };
    const toggleReviewModal = () => {
        setReviewModalVisible(!isReviewModalVisible);
    };
    const ref = useRef();

    const handleOK = (signature) => {
        console.log(signature);
        setSignatureImg(signature)
        setSignatureImgError('')
        toggleModal()
        // const path = RNFetchBlob.fs.dirs.CacheDir + "/sign.png";

        // RNFetchBlob.fs.writeFile(path, signature.replace("data:image/png;base64,", ""), 'base64')
        //     .then(() => RNFetchBlob.fs.stat(path))
        //     .then((stats) => {
        //         console.log(stats.path)
        //         setSignatureImg(stats.path)
        //         setSignatureImgError('')
        //         toggleModal()
        //     })
        //     .catch((err) => console.error(err));

    };

    const handleClear = () => {
        ref.current.clearSignature();
    };

    const handleConfirm = () => {
        console.log("end");
        ref.current.readSignature();
    };

    const selectImageFromCamera1 = () => {
        ImagePicker.openCamera({
            width: 300,
            height: 400,
            cropping: true,
        }).then(image => {
            setSelectedImage1(image.path);
            setSelectedImage1Error('')
            console.log(image.path)
        }).catch(error => {
            console.log('Error:', error);
        });
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.pick({
                type: [DocumentPicker.types.allFiles],
            });

            console.log('URI: ', result[0].uri);
            console.log('Type: ', result[0].type);
            console.log('Name: ', result[0].name);
            console.log('Size: ', result[0].size);

            setPickedDocs(result[0]);
            setPickedDocsError('')

        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                // User cancelled the document picker
                console.log('Document picker was cancelled');
            } else {
                console.error('Error picking document', err);
            }
        }
    };

    const itemCollectedSubmit = () => {

        console.log(itemId)
        const formData = new FormData();

        if (selectedImage1 != null) {
            formData.append("goodsImage", {
                uri: selectedImage1,
                type: 'image/jpeg',
                name: 'photo.jpg',
            });
        } else {
            formData.append("goodsImage", "");
        }

        if (pickDocs != null) {
            formData.append("goodsDocs", {
                uri: pickDocs.uri,
                type: pickDocs.type,
                name: pickDocs.name,
            });
        } else {
            formData.append("goodsDocs", "");
        }

        formData.append("signature", signatureImg);
        formData.append("delivery_status", orderType == 'pickup' ? "Pickup" : "Delivered");
        formData.append("shipper_profile_id", itemId);

        console.log(JSON.stringify(formData), 'form data');
        
        if (!signatureImg) {
            setSignatureImgError('Please draw a signature')
        } else if (!selectedImage1) {
            setSelectedImage1Error('Please upload photos')
        } 
        // else if (!pickDocs) {
        //     setPickedDocsError('Please upload documents')
        // }
         else {
            setIsLoading(true)
            console.log(JSON.stringify(formData))
            AsyncStorage.getItem('userToken', (err, usertoken) => {
                axios.post(`${API_URL}/api/driver/upload-pickup-delivery`, formData, {
                    headers: {
                        Accept: 'application/json',
                        "Authorization": 'Bearer ' + usertoken,
                        "Content-Type": 'multipart/form-data'
                    },
                })
                    .then(res => {
                        console.log(res.data)
                        if (res.data.response.status.code === 200) {
                            setIsLoading(false)
                            Toast.show({
                                type: 'success',
                                text1: 'Hello',
                                text2: orderType === 'pickup' ? 'Order successfully picked up' : 'Order successfully delivered',
                                position: 'top',
                                topOffset: Platform.OS == 'ios' ? 55 : 20
                            });
                            toggleReviewModal()
                        } else {
                            setIsLoading(false)
                            Alert.alert('Oops..', res.data.response.status.message, [
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
                        console.log(`API error:`, e)

                        // Function to extract error message
                        const getErrorMessage = (error) => {
                            // Check for different possible error message locations
                            if (error.response?.data?.response?.records?.message) {
                                return error.response.data.response.records.message;
                            }
                            if (error.response?.data?.response?.status?.message) {
                                return error.response.data.response.status.message;
                            }
                            if (error.response?.data?.message) {
                                return error.response.data.message;
                            }
                            if (error.response?.data?.error) {
                                return error.response.data.error;
                            }
                            if (error.message) {
                                return error.message;
                            }
                            return "Something went wrong";
                        };

                        const errorMessage = getErrorMessage(e);

                        Alert.alert('Oops..', errorMessage, [
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

    const submitReviewuu = () => {
        setIsLoading(true)
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            // console.log(starCount, 'total_rating')
            // console.log(address, 'message')
            // console.log(itemId, 'type_id')
            // console.log(orderType, 'category')
            // console.log(userId, 'rating_by')
            // console.log(forWhich, 'user_id')
            const option = {
                "total_rating": starCount,
                "message": address,
                "type_id": itemId,
                "category": orderType,
                "rating_by": userId,
                "user_id": forWhich
            }
            console.log(option)
            axios.post(`${API_URL}/api/driver/add-rating`, option, {
                headers: {
                    "Authorization": 'Bearer ' + usertoken,
                    "Content-Type": 'application/json'
                },
            })
                .then(res => {
                    console.log(res.data)
                    if (res.data.response.status.code === 200) {
                        setIsLoading(false)
                        toggleReviewModal()
                        orderCompleted()
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
                    if (e.response && e.response.data && e.response.data.response && e.response.data.response.records) {
                        Alert.alert('Oops..', e.response.data.response.records.message, [
                            {
                                text: 'Cancel',
                                onPress: () => console.log('Cancel Pressed'),
                                style: 'cancel',
                            },
                            { text: 'OK', onPress: () => console.log('OK Pressed') },
                        ]);
                    } else {
                        console.log("Error details:", e);
                        Alert.alert('Oops..', "Something went wrong", [
                            {
                                text: 'Cancel',
                                onPress: () => console.log('Cancel Pressed'),
                                style: 'cancel',
                            },
                            { text: 'OK', onPress: () => console.log('OK Pressed') },
                        ]);
                    }
                });
        });
    }

    const submitReview = () => {
        // console.log(starCount)
        // console.log(address)
        const option = {
            "to_user_id": forWhich,
            "shipper_profile_id": itemId,
            "rate": starCount,
            "review": address
        }
        console.log(option)
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            setIsLoading(true)
            axios.post(`${API_URL}/api/driver/add-shipment-rate`, option, {
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
                        setReviewModalVisible(!isReviewModalVisible)
                        Toast.show({
                            type: 'success',
                            text1: '',
                            text2: res.data.response.status.message,
                            position: 'top',
                            topOffset: Platform.OS == 'ios' ? 55 : 20
                        });
                        navigation.navigate('ShippingOrderDetails', { pageFrom: 'completedShipping' })
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
                    console.log(e.response)
                    Alert.alert('Oops..', "Something went wrong", [
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

    const orderCompleted = () => {
        setIsLoading(true)
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            const myArr = []
            myArr.push(orderId)
            const option = {};
            if (orderType == 'pickup') {
                option.pickup_status = 1;

                option.order_item_id = myArr;
            } else {
                option.delivery_status = 1;

                option.order_item_id = myArr;
            }

            console.log(option, '-----')

            axios.post(`${API_URL}/api/driver/update-order-item-status`, option, {
                headers: {
                    "Authorization": 'Bearer ' + usertoken,
                    "Content-Type": 'application/json'
                },
            })
                .then(res => {
                    console.log(JSON.stringify(res.data))
                    if (res.data.response.status.code === 200) {
                        setIsLoading(false)
                        Toast.show({
                            type: 'success',
                            text1: 'Hello',
                            text2: orderType === 'pickup' ? 'Order successfully picked up' : 'Order successfully delivered',
                            position: 'top',
                            topOffset: Platform.OS == 'ios' ? 55 : 20
                        });
                        navigation.navigate('OrderSummary', { orderType: orderType, amount: amount })
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

    if (isLoading) {
        return (
            <Loader />
        )
    }
    const imgWidth = 256;
    const imgHeight = 256;
    const webStyle = `.m-signature-pad--footer
    .save {
        display: none;
    }
    .clear {
        display: none;
    }
`;

    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Reach Pickup Location'} onPress={() => navigation.goBack()} title={'Reach Pickup Location'} />
            <ScrollView style={styles.wrapper}>

                <View style={{ backgroundColor: '#F6F6F6', borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0', padding: 20, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Text style={{ color: '#2F2F2F', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), }}>E-Signature</Text>

                    {signatureImg ?

                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={verifiedImg} style={styles.image} />
                            <Text style={{ color: '#339999', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), }}>Verified</Text>
                        </View>

                        :
                        <TouchableOpacity onPress={() => toggleModal()}>
                            <Text style={{ color: '#3F709E', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), }}>Add Signature</Text>
                        </TouchableOpacity>
                    }

                </View>
                {signatureImgError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular', marginBottom: 10 }}>{signatureImgError}</Text> : <></>}
                <View style={{ backgroundColor: '#F6F6F6', borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0', padding: 20, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Text style={{ color: '#2F2F2F', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), }}>Upload Photos</Text>
                    {selectedImage1 ?
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={verifiedImg} style={styles.image} />
                            <Text style={{ color: '#339999', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), }}>Verified</Text>
                        </View>
                        :
                        <TouchableOpacity onPress={() => selectImageFromCamera1()}>
                            <Text style={{ color: '#3F709E', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), }}>Add Photos</Text>
                        </TouchableOpacity>
                    }
                </View>
                {selectedImage1Error ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular', marginBottom: 10 }}>{selectedImage1Error}</Text> : <></>}
                <View style={{ backgroundColor: '#F6F6F6', borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0', padding: 20, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, }}>
                    <Text style={{ color: '#2F2F2F', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), }}>Upload Documents</Text>
                    {pickDocs ?
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={verifiedImg} style={styles.image} />
                            <Text style={{ color: '#339999', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), }}>Verified</Text>
                        </View>
                        :
                        <TouchableOpacity onPress={() => pickDocument()}>
                            <Text style={{ color: '#3F709E', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), }}>Add Documents</Text>
                        </TouchableOpacity>
                    }
                </View>
                {pickDocsError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular', marginBottom: 10 }}>{pickDocsError}</Text> : <></>}
                {/* {signatureImg && <Image source={{ uri: signatureImg }} style={styles.image} />} */}
            </ScrollView>
            <View style={{ marginBottom: responsiveHeight(12), position: 'absolute', bottom: 0, width: '90%', alignSelf: 'center' }}>
                {signatureImg && selectedImage1 ?
                    <CustomButton label={"Item Collected"}
                        buttonColor={'active'}
                        //onPress={() => toggleReviewModal()}
                        onPress={() => itemCollectedSubmit()}
                    />
                    :
                    <CustomButton label={"I have arrived"}
                        buttonColor={'gray'}
                        onPress={() => null}
                    />
                }
            </View>
            {/* Signature modal */}
            <Modal
                isVisible={isModalVisible}
                style={{
                    margin: 0, // Add this line to remove the default margin
                    justifyContent: 'flex-end',
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', height: 50, width: 50, borderRadius: 25, position: 'absolute', bottom: '75%', left: '45%', right: '45%' }}>
                    <Icon name="cross" size={30} color="#000" onPress={toggleModal} />
                </View>
                <View style={{ height: '70%', backgroundColor: '#fff', position: 'absolute', bottom: 0, width: '100%' }}>
                    <View style={{ padding: 20 }}>

                        <Text style={{ color: '#2F2F2F', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2.3), marginBottom: 10 }}>Draw Signature</Text>
                        <View style={{ height: responsiveHeight(40) }}>
                            <SignatureScreen ref={ref} onOK={handleOK} webStyle={webStyle} showNativeButtons={true} />
                        </View>
                        <View style={styles.buttonwrapper}>
                            <CustomButton label={"Save Signature"}
                                onPress={() => handleConfirm()}
                            />
                        </View>
                        <View style={styles.buttonwrapper}>
                            <CustomButton label={"Retake Signature"}
                                buttonColor='red'
                                onPress={() => handleClear()}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
            {/* Signature modal */}
            {/* Review modal */}
            <Modal
                isVisible={isReviewModalVisible}
                style={{
                    margin: 0, // Add this line to remove the default margin
                    justifyContent: 'flex-end',
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', height: 50, width: 50, borderRadius: 25, position: 'absolute', bottom: '65%', left: '45%', right: '45%' }}>
                    <Icon name="cross" size={30} color="#000" onPress={toggleReviewModal} />
                </View>
                <View style={{ height: '60%', backgroundColor: '#fff', position: 'absolute', bottom: 0, width: '100%' }}>
                    <View style={{ padding: 20 }}>
                        <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', marginBottom: 10 }}>
                            <Text style={{ color: '#3A3232', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2.5) }}>Rate your pickup</Text>
                        </View>
                        <Text style={{ color: '#808080', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2.5), textAlign: 'center' }}>How was your experience?</Text>
                        <View style={{ width: responsiveWidth(70), alignSelf: 'center', marginVertical: 10 }}>
                            <StarRating
                                disabled={false}
                                maxStars={5}
                                rating={starCount}
                                selectedStar={(rating) => setStarCount(rating)}
                                fullStarColor={'#FFCB45'}
                                starSize={40}
                            />
                        </View>
                        <View>
                            <InputField
                                label={'Enter your review...'}
                                keyboardType="default"
                                value={address}
                                helperText={addressError}
                                inputType={'address'}
                                inputFieldType={'address'}
                                onChangeText={(text) => {
                                    setaddress(text)
                                }}
                            />
                        </View>
                        <View style={styles.buttonwrapper}>
                            <CustomButton label={"Submit Review"}
                                onPress={() => submitReview()}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
            {/* Review modal */}

        </SafeAreaView>
    )
}

export default ShippingItemVerifiedScreen

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    wrapper: {
        padding: 20,
        marginBottom: responsiveHeight(1),
    },
    headerText: {
        color: '#FFFFFF',
        fontFamily: 'Outfit-Medium',
        fontSize: responsiveFontSize(2),
        marginLeft: 10
    },
    questionView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: '#339999',
        borderColor: '#339999',
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 5
    },
    answerView: {
        //paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        borderColor: '#E0E0E0',
        borderWidth: 0,
        marginBottom: responsiveHeight(11)
    },
    iconImage: {
        width: 23,
        height: 23,
    },
    buttonViewRed: {
        backgroundColor: '#FFF',
        borderColor: '#339999',
        borderWidth: 1,
        padding: 20,
        borderRadius: 8,
        marginBottom: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        height: responsiveHeight(8)
    },
    buttonTextRed: {
        fontFamily: 'Outfit-Medium',
        textAlign: 'center',
        fontWeight: '400',
        fontSize: 16,
        color: '#339999',
    },
    table: {
        borderWidth: 1,
        borderColor: '#ddd',
        //margin: 10,
        width: responsiveWidth(89),
        //height: responsiveHeight(56.4),
        borderRadius: 10,
        marginBottom: 10
    },
    tableRow1: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#ddd',
        height: responsiveHeight(7),
        backgroundColor: '#DEFFFF',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10
    },
    tableRow2: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#ddd',
        height: responsiveHeight(7),
        backgroundColor: '#FFFFFF',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10
    },
    tableFooterRow1: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderColor: '#E0E0E0',
        height: responsiveHeight(7),
        backgroundColor: '#FFFFFF',
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10
    },
    cellmain: {
        flex: 1,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    cellmain3: {
        flex: 1,
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cellmain2: {
        flex: 1,
        padding: 10,
        flexDirection: 'row',
        //justifyContent: 'center',
        alignItems: 'center',
    },
    cellFootermain: {
        flex: 1,
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    locationheader: {
        color: '#339999',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(2),
        textAlign: 'left',
        marginBottom: 5
    },
    tableHeader1: {
        color: '#339999',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(2),
        textAlign: 'left',
    },
    tableHeader2: {
        color: '#949494',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(2),
        textAlign: 'left',
    },
    tableHeader3: {
        color: '#339999',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(2),
        textAlign: 'left',
    },
    iconText: {
        color: '#9C9C9C',
        fontFamily: 'Outfit-Regular',
        fontSize: responsiveFontSize(2),

    },
    verticleLine: {
        height: '100%',
        width: 1,
        backgroundColor: '#E0E0E0',
    },
    image: {
        width: 20,
        height: 20,
        marginRight: 10
    }
});
