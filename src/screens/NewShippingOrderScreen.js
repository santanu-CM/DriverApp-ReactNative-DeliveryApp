import React, { useState, useContext, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity, Alert, Platform, Modal } from 'react-native'
import * as Animatable from 'react-native-animatable';
import CustomHeader from '../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TextInput, LongPressGestureHandler, State } from 'react-native-gesture-handler'
import { addressWhiteImg, dubbleArrowImg, downloadImg, searchImg, userPhoto, acceptImg, declineImg, dateIconImg } from '../utils/Images'
import CustomButton from '../components/CustomButton'
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { API_URL } from '@env'
import Loader from '../utils/Loader'
import { useFocusEffect } from '@react-navigation/native';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import Accordion from 'react-native-collapsible/Accordion';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import RNFetchBlob from 'rn-fetch-blob';
import Toast from 'react-native-toast-message';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { setNewShipping } from '../store/notificationSlice';
import { SafeAreaView } from 'react-native-safe-area-context';

 
const NewShippingOrderScreen = () => {
    const { logout } = useContext(AuthContext);
    const [userInfo, setuserInfo] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const navigation = useNavigation();
    const [activeSections, setActiveSections] = useState([0]);
    const [collapsed, setCollapsed] = useState(true);
    const [totalExpectedEarning, settotalExpectedEarning] = useState(0)
    const [allShipmentList, setallShipmentList] = useState([])
    const dispatch = useDispatch();
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedReason, setSelectedReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [currentOrderId, setCurrentOrderId] = useState(null);
    const [currentOrderFlag, setCurrentOrderFlag] = useState(null);
    const [flag, setFlag] = useState(false);
    const [declineReasons, setDeclineReasons] = useState([]);

    //const acceptedOrders = getFaq[0]?.batch.flatMap(batch => batch.order.filter(order => order.status === "accepted"));

    const [getFaq, setFaq] = useState([])

    const fetchDeclineReasons = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.get(`${process.env.API_URL}/api/driver/decline-list`, {
                headers: {
                    "Authorization": 'Bearer ' + usertoken,
                    "Content-Type": 'application/json'
                },
            })
                .then(res => {
                    if (res.data.response) {
                        setDeclineReasons(res.data.data);
                    }
                })
                .catch(e => {
                    console.log(`Error fetching decline reasons: ${e}`);
                });
        });
    };
    const acceptSingleOrder = (orderId, flag) => {
        console.log(flag, 'flag')
        setIsLoading(true)
        const option = {
            "shipper_profile_id": orderId,
            "assign_driver_status": 'Accepted',
            "flag": flag
        };

        console.log(option)
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${process.env.API_URL}/api/driver/notification-accept-for-driver`, option, {
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
                            text2: "Order successfully accepted",
                            position: 'top',
                            topOffset: Platform.OS == 'ios' ? 55 : 20
                        });
                        fetchNewOrders()
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

    const declineSingleOrder = (orderId, flag) => {
        setCurrentOrderId(orderId);
        setCurrentOrderFlag(flag);
        setShowCancelModal(true);
    }

    const handleCancelConfirm = () => {
        if (!selectedReason) {
            Alert.alert('Error', 'Please select a reason for cancellation');
            return;
        }

        if (selectedReason === 'Other' && !customReason.trim()) {
            Alert.alert('Error', 'Please provide a custom reason');
            return;
        }

        const reason = selectedReason === 'Other' ? customReason : selectedReason;
        executeDeclineOrder(currentOrderId, reason, currentOrderFlag);
        setShowCancelModal(false);
        setSelectedReason('');
        setCustomReason('');
        setCurrentOrderFlag(null);
    }

    const executeDeclineOrder = (orderId, reason, flag) => {

        console.log(flag, 'flag')
        setIsLoading(true)
        const option = {
            "shipper_profile_id": orderId,
            "assign_driver_status": 'Not-Accept',
            "cancellation_reason": reason,
            "flag": flag
        };
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${process.env.API_URL}/api/driver/notification-accept-for-driver`, option, {
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
                            text2: "Order successfully declined",
                            position: 'top',
                            topOffset: Platform.OS == 'ios' ? 55 : 20
                        });
                        fetchNewOrders()
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
                });
        });
    }

    const fetchNewOrders = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${process.env.API_URL}/api/driver/shipping-pending`, {}, {
                headers: {
                    "Authorization": 'Bearer ' + usertoken,
                    "Content-Type": 'application/json'
                },
            })
                .then(res => {
                    console.log(JSON.stringify(res.data), 'fetch new ordersddd') 
                    let userInfo = res.data.response.records.shipments; 
                    let flag = res.data.response.records.flag;
                    console.log(JSON.stringify(userInfo), 'fetch new orders')
                    setallShipmentList(userInfo)
                    setFlag(flag)
                    setIsLoading(false);
                })
                .catch(e => {
                    console.log(`User fetch error ${JSON.stringify(e.response.data)}`)
                });
        });
    }

    useEffect(() => {
        fetchNewOrders() 
        dispatch(setNewShipping(false));
    }, [])
    
    // Auto-refresh every 2 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            fetchNewOrders();
        }, 2 * 60 * 1000); // 2 minutes in milliseconds

        return () => clearInterval(interval);
    }, []);
    
    useFocusEffect(
        React.useCallback(() => {
            fetchNewOrders()
        }, [])
    )
    useEffect(() => {
        fetchDeclineReasons();
    }, []);

    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'New Order'} onPress={() => navigation.goBack()} title={'New Shipping Order'} />
            <ScrollView style={styles.wrapper}>
                <View style={{ paddingBottom: responsiveHeight(11) }}>
                    {allShipmentList?.length > 0 ? (
                        allShipmentList?.map((item, index) => (
                            <View style={styles.table} key={index}>
                                <View style={styles.tableRow1}>
                                    <View style={{ flexDirection: 'column', padding: 10, }}>
                                        <View style={styles.cellmain}>
                                            <Text style={styles.tableHeader1}>Shipping ID :</Text>
                                            <Text style={styles.tableHeader2}> {item?.shipping_id}</Text>
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: 'row', paddingRight: 20 }}>
                                        {/* {
                                        item?.status === 'Accepted' ?
                                            <TouchableOpacity onPress={() => declineSingleOrder(item?.order_item_id, "single")}>
                                                <Image source={declineImg} style={styles.iconImage2} />
                                            </TouchableOpacity>
                                            :
                                            item?.status === 'Active' ? */}
                                        <>
                                            <TouchableOpacity onPress={() => acceptSingleOrder(item?.id, flag)}>
                                                <Image source={acceptImg} style={styles.iconImage2} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => declineSingleOrder(item?.id, flag)}>
                                                <Image source={declineImg} style={styles.iconImage2} />
                                            </TouchableOpacity>
                                        </>
                                        {/* : null
                                    } */}

                                    </View>
                                </View>
                                <View style={{ padding: 10 }}>
                                    <>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={styles.locationheader}>Pickup Location :</Text>
                                            <View style={{ flexDirection: 'row' }}>
                                                <Image
                                                    source={dateIconImg}
                                                    style={{ height: 18, width: 18, marginRight: 5 }}
                                                />
                                                <Text style={styles.dateText}>{item?.pickup_location?.pickup_date}</Text>
                                            </View>
                                        </View>
                                        <View style={{ justifyContent: 'center', }}>
                                            <Text style={styles.nameText}>{item?.other?.shipping_for == 'for_myself' ? item?.other?.shipper_name : item?.other?.sender_name}</Text>
                                            <Text style={styles.iconText}>{item?.pickup_location?.pickup_location}</Text>
                                        </View>
                                        <View
                                            style={{
                                                marginVertical: 10,
                                                borderBottomColor: '#F3F3F3',
                                                borderBottomWidth: StyleSheet.hairlineWidth + 3,
                                            }}
                                        />
                                    </>
                                    <>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={styles.locationheader}>Delivery Location :</Text>
                                            <View style={{ flexDirection: 'row' }}>
                                                <Image
                                                    source={dateIconImg}
                                                    style={{ height: 18, width: 18, marginRight: 5 }}
                                                />
                                                <Text style={styles.dateText}>{item?.delivery_location?.delivery_date}</Text>
                                            </View>
                                        </View>
                                        <View style={{ justifyContent: 'center', }}>
                                            <Text style={styles.nameText}>{item?.delivery_location?.recipient_name}</Text>
                                            <Text style={styles.iconText}>{item?.delivery_location?.delivery_location}</Text>
                                        </View>
                                        <View
                                            style={{
                                                marginVertical: 10,
                                                borderBottomColor: '#F3F3F3',
                                                borderBottomWidth: StyleSheet.hairlineWidth + 3,
                                            }}
                                        />
                                    </>
                                    <>
                                        <Text style={styles.locationheader}>Product Details</Text>
                                        <Text style={styles.productHeaderText}>Weight: <Text style={styles.productHeaderValue}>{item?.product_details?.weight} KG</Text></Text>
                                        <Text style={styles.productHeaderText}>Dimensions: <Text style={styles.productHeaderValue}>{item?.product_details?.dimension_l} Cm X {item?.product_details?.dimension_b} Cm</Text></Text>
                                        <Text style={styles.productHeaderText}>Load Cash Value: <Text style={styles.productHeaderValue}>₵{item?.other?.load_cache_value}</Text></Text>
                                        <View
                                            style={{
                                                marginVertical: 10,
                                                borderBottomColor: '#F3F3F3',
                                                borderBottomWidth: StyleSheet.hairlineWidth + 3,
                                            }}
                                        />

                                    </>
                                    <View style={styles.expEarningView}>
                                        <Text style={styles.locationheader}>Expected Earning :</Text>
                                        <View style={styles.expPriceView}>
                                            <Text style={styles.expPriceText}>₵{item?.other?.driver_payment}</Text>
                                        </View>
                                    </View>
                                </View>

                            </View>
                        ))
                    ) : (
                        <View style={styles.noOrderContainer}>
                            <Text style={styles.noOrderText}>No new order found</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            <Modal
                visible={showCancelModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCancelModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.modalTitle}>Cancel Order</Text>
                            <Text style={styles.modalSubtitle}>Please select a reason for cancellation:</Text>

                            <View style={styles.dropdownContainer}>
                                {declineReasons.map((reason) => (
                                    <TouchableOpacity
                                        key={reason.id}
                                        style={[
                                            styles.reasonOption,
                                            selectedReason === reason.title && styles.selectedReason
                                        ]}
                                        onPress={() => setSelectedReason(reason.title)}
                                    >
                                        <Text style={[
                                            styles.reasonText,
                                            selectedReason === reason.title && styles.selectedReasonText
                                        ]}>{reason.title}</Text>
                                    </TouchableOpacity>
                                ))}
                                <TouchableOpacity
                                    style={[
                                        styles.reasonOption,
                                        selectedReason === 'Other' && styles.selectedReason
                                    ]}
                                    onPress={() => setSelectedReason('Other')}
                                >
                                    <Text style={[
                                        styles.reasonText,
                                        selectedReason === 'Other' && styles.selectedReasonText
                                    ]}>Other</Text>
                                </TouchableOpacity>
                            </View>

                            {selectedReason === 'Other' && (
                                <TextInput
                                    style={styles.customReasonInput}
                                    placeholder="Please specify your reason"
                                    value={customReason}
                                    onChangeText={setCustomReason}
                                    multiline
                                    numberOfLines={4}
                                />
                            )}
                        </ScrollView>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setShowCancelModal(false);
                                    setSelectedReason('');
                                    setCustomReason('');
                                }}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={handleCancelConfirm}
                            >
                                <Text style={[styles.buttonText, styles.confirmButtonText]}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

export default NewShippingOrderScreen

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    wrapper: {
        padding: responsiveWidth(5),
        marginBottom: responsiveHeight(1)
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
        marginBottom: responsiveHeight(10)
    },
    iconImage: {
        width: 23,
        height: 23,
    },
    iconImage2: {
        width: 30,
        height: 30,
        marginRight: 10
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
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: '#ddd',
        height: responsiveHeight(7),
        backgroundColor: '#DEFFFF',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10
    },
    tableFooterRow1: {
        flexDirection: 'row',
        borderBottomWidth: 0,
        borderColor: '#E0E0E0',
        height: responsiveHeight(7),
        backgroundColor: '#F6F6F6',
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10
    },
    cellmain: {
        flex: 1,
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
        fontFamily: 'Outfit-Medium',
        fontSize: responsiveFontSize(2),
        textAlign: 'left',
        marginBottom: 5
    },
    tableHeader1: {
        color: '#339999',
        fontFamily: 'Outfit-Medium',
        fontSize: responsiveFontSize(2),
        textAlign: 'left',
    },
    tableHeader2: {
        color: '#949494',
        fontFamily: 'Outfit-Medium',
        fontWeight: 'bold',
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
    toptableRow1: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#ddd',
        height: responsiveHeight(7),
        backgroundColor: '#339999',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10
    },
    toptableHeader1: {
        color: '#FFFFFF',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(2),
        textAlign: 'center',
    },
    toptableHeader2: {
        color: '#4D4B4B',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(2),
        textAlign: 'center',
    },
    toptableHeader3: {
        color: '#339999',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(2),
        textAlign: 'center',
    },
    topcellmain: {
        flex: 1,
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonwrapper: {
        paddingHorizontal: 20,
        position: 'absolute',
        bottom: 0,
        width: responsiveWidth(100)
    },
    tableFooterRow2: {
        flexDirection: 'row',
        borderBottomWidth: 0,
        borderColor: '#E0E0E0',
        height: responsiveHeight(7.3),
        width: responsiveWidth(90),
        backgroundColor: '#3F709E',
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10
    },
    dateText: {
        color: '#989898',
        fontFamily: 'Outfit-Medium',
        fontSize: responsiveFontSize(1.7),
    },
    nameText: {
        color: '#000000',
        fontFamily: 'Outfit-Regular',
        fontSize: responsiveFontSize(2),
    },
    productHeaderText: {
        color: '#3F709E',
        fontFamily: 'Outfit-Regular',
        fontSize: responsiveFontSize(2),
    },
    productHeaderValue: {
        color: '#949494',
        fontFamily: 'Outfit-Regular',
        fontSize: responsiveFontSize(2),
    },
    expEarningView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    expPriceView: {
        height: responsiveHeight(4),
        //width: responsiveWidth(20),
        borderRadius: 15,
        backgroundColor: '#308822',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10
    },
    expPriceText: {
        color: '#FFFFFF',
        fontFamily: 'Outfit-Regular',
        fontSize: responsiveFontSize(2),
    },
    noOrderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: responsiveHeight(30)
    },
    noOrderText: {
        fontFamily: 'Outfit-Medium',
        fontSize: responsiveFontSize(2),
        color: '#339999'
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: responsiveFontSize(2.5),
        fontFamily: 'Outfit-Medium',
        color: '#339999',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: responsiveFontSize(2),
        fontFamily: 'Outfit-Regular',
        color: '#4D4B4B',
        marginBottom: 15,
    },
    dropdownContainer: {
        marginBottom: 15,
    },
    reasonOption: {
        padding: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 5,
        marginBottom: 8,
    },
    selectedReason: {
        backgroundColor: '#339999',
        borderColor: '#339999',
    },
    reasonText: {
        fontSize: responsiveFontSize(2),
        fontFamily: 'Outfit-Regular',
        color: '#4D4B4B',
    },
    selectedReasonText: {
        color: 'white',
    },
    customReasonInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#F6F6F6',
    },
    confirmButton: {
        backgroundColor: '#339999',
    },
    buttonText: {
        fontSize: responsiveFontSize(2),
        fontFamily: 'Outfit-Medium',
        color: '#4D4B4B',
        textAlign: 'center',
    },
    confirmButtonText: {
        color: 'white',
    },
});
