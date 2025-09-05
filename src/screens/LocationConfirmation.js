import React, { useState, useContext, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity } from 'react-native'
import * as Animatable from 'react-native-animatable';
import CustomHeader from '../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TextInput, LongPressGestureHandler, State } from 'react-native-gesture-handler'
import { addressWhiteImg, dubbleArrowImg, downloadImg, searchImg, userPhoto, addressImg, pointerImg } from '../utils/Images'
import CustomButton from '../components/CustomButton'
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { API_URL } from '@env'
import Loader from '../utils/Loader'
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Entypo';
import Modal from "react-native-modal";
// import Signature from "react-native-signature-canvas";
import SignatureScreen from "react-native-signature-canvas";
import GetLocation from 'react-native-get-location'
import haversine from 'haversine-distance';
import Toast from 'react-native-toast-message';
import getDirections from 'react-native-google-maps-directions'
import { SafeAreaView } from 'react-native-safe-area-context';
const RADIUS_OF_EARTH = 6378; 

const LocationConfirmation = ({ route }) => {
    const navigation = useNavigation();
    const { logout } = useContext(AuthContext);
    const [userInfo, setuserInfo] = useState([])
    const [getorders, setOrders] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalVisible, setModalVisible] = useState(false);
    const [buttonStatus, setButtonStatus] = useState(true);
    const [orderId, setOrderId] = useState(route?.params?.orderId)
    const [orderType, setOrderType] = useState(route?.params?.fromPage)
    const [currentLat, setCurrentLat] = useState('')
    const [currentLong, setCurrentLong] = useState('')
    const [destLat, setDestLat] = useState('')
    const [destLong, setDestLong] = useState('')
    const [initialPosition, setInitialPosition] = useState({
        latitude: 22.556749,
        longitude: 88.412102,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1
    });

    const getDistanceFromLocation = (from, to) => {
        const latF = from.lat / 180 * Math.PI;
        const lngF = from.lng / 180 * Math.PI;
        const latT = to.lat / 180 * Math.PI;
        const lngT = to.lng / 180 * Math.PI;
        const latD = Math.abs(latF - latT);
        const lngD = Math.abs(lngF - lngT);
        const latH = Math.pow(Math.sin(latD / 2), 2);
        const lngH = Math.pow(Math.sin(lngD / 2), 2);
        const delta = 2 * Math.asin(Math.sqrt(latH + Math.cos(latF) * Math.cos(latT) * lngH));
        return RADIUS_OF_EARTH * delta;
    }

    // useEffect(() => {
    //     const getLocationAndUpdatePosition = () => {
    //         GetLocation.getCurrentPosition({
    //             enableHighAccuracy: true,
    //             timeout: 60000,
    //         })
    //             .then(location => {
    //                 console.log(location);
    //                 setCurrentLat(location.latitude);
    //                 setCurrentLong(location.longitude);
    //                 console.log(destLat, 'destination lat')
    //                 console.log(destLong, 'destination long')
    //                 const destinationLat = destLat;
    //                 const destinationLong = destLong;
    //                 let initialPosition = {
    //                     latitude: location.latitude,
    //                     longitude: location.longitude,
    //                     latitudeDelta: 0.09,
    //                     longitudeDelta: 0.035
    //                 };

    //                 // Calculate distance
    //                 const distance = calculateDistance(
    //                     location.latitude,
    //                     location.longitude,
    //                     destinationLat,
    //                     destinationLong
    //                 );
    //                 console.log(distance, 'distance between to location')
    //                 if (distance < 2) {
    //                     // If distance is less than 1 km, set status to true
    //                     setButtonStatus(true);
    //                     console.log('you are reaching the location soon')
    //                 }

    //                 setInitialPosition(initialPosition);
    //             })
    //             .catch(error => {
    //                 const { code, message } = error;
    //                 console.warn(code, message);
    //             });
    //     };

    //     // Function to calculate distance between two coordinates using Haversine formula
    //     const calculateDistance = (lat1, lon1, lat2, lon2) => {
    //         const R = 6371; // Radius of the Earth in kilometers
    //         const dLat = deg2rad(lat2 - lat1);
    //         const dLon = deg2rad(lon2 - lon1);
    //         const a =
    //             Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    //             Math.cos(deg2rad(lat1)) *
    //             Math.cos(deg2rad(lat2)) *
    //             Math.sin(dLon / 2) *
    //             Math.sin(dLon / 2);
    //         const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    //         const distance = R * c; // Distance in km
    //         return distance;
    //     };

    //     const deg2rad = deg => {
    //         return deg * (Math.PI / 180);
    //     };

    //     // Run initially after 5 seconds
    //     const timeout = setTimeout(() => {
    //         getLocationAndUpdatePosition();
    //         // Then run every 5 seconds
    //         const interval = setInterval(getLocationAndUpdatePosition, 5000);

    //         // Clear interval on component unmount
    //         return () => clearInterval(interval);
    //     }, 5000);

    //     // Clear timeout on component unmount
    //     return () => clearTimeout(timeout);
    // }, []);


    useEffect(() => {
        let isMounted = true;
    
        const getLocationAndUpdatePosition = () => {
            GetLocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 60000,
            })
            .then(location => {
                if (isMounted) {
                    console.log(location);
                    setCurrentLat(location.latitude);
                    setCurrentLong(location.longitude);
                    console.log(destLat, 'destination lat')
                    console.log(destLong, 'destination long')
                    const destinationLat = destLat;
                    const destinationLong = destLong;
                    let initialPosition = {
                        latitude: location.latitude,
                        longitude: location.longitude,
                        latitudeDelta: 0.09,
                        longitudeDelta: 0.035
                    };
    
                    const distance = calculateDistance(
                        location.latitude,
                        location.longitude,
                        destinationLat,
                        destinationLong
                    );
                    console.log(distance, 'distance between to location')
                    if (distance < 2) {
                        setButtonStatus(true);
                        console.log('you are reaching the location soon')
                    }
    
                    setInitialPosition(initialPosition);
                }
            })
            .catch(error => {
                if (isMounted) {
                    const { code, message } = error;
                    console.warn(code, message);
                }
            });
        };
    
        const calculateDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371;
            const dLat = deg2rad(lat2 - lat1);
            const dLon = deg2rad(lon2 - lon1);
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(deg2rad(lat1)) *
                Math.cos(deg2rad(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;
            return distance;
        };
    
        const deg2rad = deg => {
            return deg * (Math.PI / 180);
        };
    
        const timeout = setTimeout(() => {
            getLocationAndUpdatePosition();
            const interval = setInterval(getLocationAndUpdatePosition, 5000);
    
            return () => {
                clearInterval(interval);
                isMounted = false;
            };
        }, 5000);
    
        return () => {
            clearTimeout(timeout);
            isMounted = false;
        };
    }, []);
 
    const fetchOrderDetails = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            console.log(orderId)
            console.log(orderType)
            axios.get(`${process.env.API_URL}/api/driver/get-batch-order-by-id/${orderId}`, {
                headers: {
                    "Authorization": 'Bearer ' + usertoken,
                    "Content-Type": 'application/json'
                },
            })
                .then(res => {
                    let userInfo = res.data.response.records[0];
                    console.log(JSON.stringify(userInfo), 'fetch from location confirm')
                    setOrders(userInfo)
                    if (orderType === 'pickup') {
                        setDestLat(userInfo?.pickup_lat)
                        setDestLong(userInfo?.pickup_long)
                    } else if (orderType === 'warehouse') {
                        setDestLat(userInfo?.warehouse_lat)
                        setDestLong(userInfo?.warehouse_long)
                    } else {
                        console.log(userInfo?.delivery_lat,'vvvvv')
                        console.log(userInfo?.delivery_long, 'mmmmmm')
                        setDestLat(userInfo?.delivery_lat)
                        setDestLong(userInfo?.delivery_long)
                    } 
                    setIsLoading(false);
                })
                .catch(e => {
                    console.log(`User fetch error ${e}`)
                });
        });
    }
    useEffect(() => {
        fetchOrderDetails()
    }, [])

    const handleGetDirections = (destinationLat, destinationLong) => {
        console.log(initialPosition, 'initialpostion location')
        console.log(destinationLat, destinationLong, "destination location")
        const newlat = JSON.parse(destinationLat) 
        const newlong = JSON.parse(destinationLong)
        const data = {
            //source: initialPosition,
            source: {
                latitude: initialPosition.latitude,
                longitude: initialPosition.longitude
            },
            destination: {
                latitude: newlat,
                longitude: newlong
            },
            params: [
                {
                    key: "travelmode",
                    value: "driving"        // may be "walking", "bicycling" or "transit" as well
                },
                {
                    key: "dir_action",
                    value: "navigate"       // this instantly initializes navigation using the given travel mode
                }
            ],
        }
        console.log(data)

        getDirections(data)
    }

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };
    const ref = useRef();


    useFocusEffect(
        React.useCallback(() => {
            //fetchProfileDetails()
        }, [])
    )

    const warehouseCompleted = (orderId, orderItemId) => {
        setIsLoading(true)
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            const myArr = []
            const myArr2 = []
            myArr.push(orderId)
            myArr2.push(orderItemId)
            const option = {};

            option.warehouse_status = 1;

            option.order_item_id = myArr;
            option.id = myArr2;

            console.log(JSON.stringify(option), '-----')
            console.log(usertoken, 'usertoken')

            axios.post(`${process.env.API_URL}/api/driver/update-order-item-status`, option, {
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
                            text2: "Order successfully delivered to warehouse",
                            position: 'top',
                            topOffset: Platform.OS == 'ios' ? 55 : 20
                        });
                        navigation.navigate('OrderSummary', { orderType: orderType })
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
            <CustomHeader
                commingFrom={'Find Pickup Location'}
                title={orderType === 'pickup' ? 'Reach Pickup Location' : orderType === 'warehouse' ? 'Reach Warehouse Location' : 'Reach Delivery Location'}
                onPress={() => navigation.goBack()}
            />
            <ScrollView style={styles.wrapper}>
                <View style={styles.table}>
                    <View style={styles.tableRow1}>
                        <View style={styles.cellmain3}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Image source={addressImg} style={styles.iconImage} tintColor={'#339999'} />
                                <Text style={styles.tableHeader1}>{orderType === 'pickup' ? 'Pickup' : orderType === 'warehouse' ? 'Warehouse' : 'Delivery'} Location</Text>
                            </View>
                            {orderType === 'pickup' ? (
                                <Text style={styles.tableHeader3}> {(getDistanceFromLocation({ lat: currentLat, lng: currentLong }, { lat: getorders.pickup_lat, lng: getorders.pickup_long })).toFixed(2)} KM Away</Text>
                            ) : orderType === 'warehouse' ? (
                                <Text style={styles.tableHeader3}> {(getDistanceFromLocation({ lat: currentLat, lng: currentLong }, { lat: getorders.warehouse_lat, lng: getorders.warehouse_long })).toFixed(2)} KM Away</Text>
                            ) : (
                                <Text style={styles.tableHeader3}> {(getDistanceFromLocation({ lat: currentLat, lng: currentLong }, { lat: getorders.delivery_lat, lng: getorders.delivery_long })).toFixed(2)} KM Away</Text>
                            )}
                        </View>
                    </View>
                    <View style={styles.tableRow2}>
                        <View style={styles.cellmain2}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', }}>
                                <Text style={styles.tableHeader1}>Order ID :</Text>
                                <Text style={styles.tableHeader2}> {getorders.reference}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ padding: 10, borderBottomWidth: 1, borderColor: '#ddd', }}>
                        {orderType === 'pickup' ? (
                            <Text style={{ color: '#949494', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2) }}>{getorders.pickup_location}</Text>
                        ) : orderType === 'warehouse' ? (
                            <Text style={{ color: '#949494', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2) }}>{getorders.warehouse_location}</Text>
                        ) : (
                            <Text style={{ color: '#949494', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2) }}>{getorders.delivery_location}</Text>
                        )}
                    </View>
                    <View style={{ padding: 10 }}>
                        <Text style={styles.locationheader}>Order Items :</Text>
                        {/* {item.order_item.map((orderitem, index) => ( */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                            <Text style={styles.iconText}>{Math.floor(getorders?.order_details.quantity)} x {getorders?.order_details.product_name.substring(0, 20)}..</Text>
                            <Text style={styles.iconText}>₵{parseFloat(getorders?.order_details.price).toFixed(2)}</Text>
                        </View>
                        {/* ))} */}
                        <View style={{ borderBottomColor: '#949494', borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: 5 }} />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                            <Text style={styles.iconText}>Subtotal</Text>
                            <Text style={styles.iconText}>₵{parseFloat(getorders?.total_order_amount).toFixed(2)}</Text>
                        </View>
                    </View>
                    <View style={styles.tableFooterRow1}>
                        <View style={styles.cellFootermain}>
                            {orderType === 'pickup' ? (
                                <TouchableOpacity onPress={() => handleGetDirections(getorders?.pickup_lat, getorders?.pickup_long)}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: responsiveWidth(40) }}>
                                        <Image source={pointerImg} style={styles.iconImage} tintColor={'#3F709E'} />
                                        <Text style={{ color: '#3F709E', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), marginLeft: 5 }}>Direction</Text>
                                    </View>
                                </TouchableOpacity>
                            ) : orderType === 'warehouse' ? (
                                <TouchableOpacity onPress={() => handleGetDirections(getorders?.warehouse_lat, getorders?.warehouse_long)}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: responsiveWidth(40) }}>
                                        <Image source={pointerImg} style={styles.iconImage} tintColor={'#3F709E'} />
                                        <Text style={{ color: '#3F709E', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), marginLeft: 5 }}>Direction</Text>
                                    </View>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity onPress={() => handleGetDirections(getorders?.delivery_lat, getorders?.delivery_long)}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: responsiveWidth(40) }}>
                                        <Image source={pointerImg} style={styles.iconImage} tintColor={'#3F709E'} />
                                        <Text style={{ color: '#3F709E', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), marginLeft: 5 }}>Direction</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>
            {orderType === 'warehouse' ?
                buttonStatus ?
                    <View style={{ marginBottom: responsiveHeight(12), position: 'absolute', bottom: 0, width: '90%', alignSelf: 'center' }}>
                        <CustomButton label={"I have arrived"}
                            buttonColor={'gray'}
                            onPress={() => warehouseCompleted(getorders.order_item_id, getorders.id)}
                        />
                    </View>
                    :
                    <View style={{ marginBottom: responsiveHeight(12), position: 'absolute', bottom: 0, width: '90%', alignSelf: 'center' }}>
                        <CustomButton label={"I have arrived"}
                            buttonColor={'gray'}
                            onPress={null}
                        />
                    </View>
                :
                buttonStatus ?
                    <View style={{ marginBottom: responsiveHeight(12), position: 'absolute', bottom: 0, width: '90%', alignSelf: 'center' }}>
                        <CustomButton label={"I have arrived"}
                            buttonColor={'active'}
                            onPress={() => navigation.navigate('ItemVerifiedScreen', { orderId: getorders.order_item_id, itemId: getorders.id, orderType: orderType, amount: orderType == 'pickup' ? getorders.pickup_amount : orderType == 'delivery' ? getorders.delivery_amount : 0, forWhich: orderType == 'pickup' ? getorders.order_details.vendor_id : orderType == 'delivery' ? getorders.order_details.order.user_id : 0 })}
                        />
                    </View>
                    :
                    <View style={{ marginBottom: responsiveHeight(12), position: 'absolute', bottom: 0, width: '90%', alignSelf: 'center' }}>
                        <CustomButton label={"I’m Arrived"}
                            buttonColor={'gray'}
                            onPress={null}
                        />
                    </View>
            }
            {/* <Modal
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
            </Modal> */}
        </SafeAreaView>
    )
}

export default LocationConfirmation

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    wrapper: {
        padding: responsiveWidth(5),
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
        width: responsiveWidth(90),
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
        fontWeight:'bold',
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
});
