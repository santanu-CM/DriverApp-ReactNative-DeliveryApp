import React, { useState, useContext, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity, Alert, Modal, TextInput, Platform, RefreshControl } from 'react-native'
import * as Animatable from 'react-native-animatable';
import CustomHeader from '../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TextInput as GestureTextInput, LongPressGestureHandler, State } from 'react-native-gesture-handler'
import { addressWhiteImg, dubbleArrowImg, downloadImg, searchImg, userPhoto, acceptImg, declineImg } from '../utils/Images'
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
import { setNewOrder } from '../store/notificationSlice';
import Share from 'react-native-share';
import { SafeAreaView } from 'react-native-safe-area-context';

const NewOrderScreen = () => {
    const { logout } = useContext(AuthContext);
    const [userInfo, setuserInfo] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const navigation = useNavigation();
    const [activeSections, setActiveSections] = useState([]);
    const [collapsed, setCollapsed] = useState(true);
    const [totalExpectedEarning, settotalExpectedEarning] = useState(0)
    const dispatch = useDispatch();
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedReason, setSelectedReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [currentOrderId, setCurrentOrderId] = useState(null);
    const [currentOrderItemId, setCurrentOrderItemId] = useState(null);
    const [currentOrderType, setCurrentOrderType] = useState(null);
    const [declineReasons, setDeclineReasons] = useState([]);
    const [getFaq, setFaq] = useState([]);

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

    const acceptSingleOrder = (orderId, orderItemId, type) => {
        setIsLoading(true)
        //console.log(type, 'for accept single order')
        //console.log(orderId, 'for accept single order')
        const myArr = []
        const myArr2 = []
        const option = {};
        if (type == "batch") {
            const batchWithId1 = getFaq.find(batch => batch.batch_no === orderId)
            //console.log(batchWithId1)
            for (let i = 0; i < batchWithId1.batch_order_items.length; i++) {
                myArr.push(batchWithId1.batch_order_items[i].order_id)
            }
            option.status = 2;
            option.order_id = myArr;
            option.batch_id = orderId;
            //console.log(option,'batch order accept')
        } else if (type == "single") {
            myArr.push(orderId)
            option.status = 2;
            option.order_item_id = myArr;
            myArr2.push(orderItemId)
            option.id = myArr2;
            //console.log(option, 'single order accept')
        }
        console.log(option)
        AsyncStorage.getItem('userToken', (err, usertoken) => {
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
                            text2: "Order successfully accepted",
                            position: 'top',
                            topOffset: Platform.OS == 'ios' ? 55 : 20
                        });
                        fetchNewOrders()
                    } else {
                        Alert.alert('Oops..', res.data.response.message || 'Something went wrong', [
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
                    console.log(`acceptSingleOrder error ${e}`)
                    console.log(e.response.data)
                    Alert.alert('Oops..', e.response.data?.message || e.response.data?.response?.status?.message || 'Something went wrong', [
                        { text: 'OK', onPress: () => console.log('OK Pressed') },
                    ]);
                });
        });
    }

    const declineSingleOrder = (orderId, itemId, type) => {
        setCurrentOrderId(orderId);
        setCurrentOrderItemId(itemId);
        setCurrentOrderType(type);
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
        executeDeclineOrder(currentOrderId, currentOrderItemId, currentOrderType, reason);
        setShowCancelModal(false);
        setSelectedReason('');
        setCustomReason('');
    }

    const executeDeclineOrder = (orderId, itemId, type, reason) => {
        setIsLoading(true)
        const myArr = []
        const myArr2 = []
        const option = {};
        if (type == "batch") {
            const batchWithId1 = getFaq.find(batch => batch.batch_no === orderId)
            for (let i = 0; i < batchWithId1.batch_order_items.length; i++) {
                myArr.push(batchWithId1.batch_order_items[i].order_id)
            }
            option.status = 3;
            option.order_id = myArr;
            option.id = myArr;
            option.batch_id = orderId;
            option.cancellation_reason = reason;
        } else if (type == "single") {
            myArr.push(orderId)
            myArr2.push(itemId)
            option.status = 3;
            option.order_item_id = myArr;
            option.id = myArr2;
            option.cancellation_reason = reason;
        }
        console.log(option)
        AsyncStorage.getItem('userToken', (err, usertoken) => {
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
                            text2: "Order successfully declined",
                            position: 'top',
                            topOffset: Platform.OS == 'ios' ? 55 : 20
                        });
                        fetchNewOrders()
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
                    Alert.alert('Error', 'Failed to decline order. Please try again.', [
                        {
                            text: 'Cancel',
                            onPress: () => console.log('Cancel Pressed'),
                            style: 'cancel',
                        },
                        { text: 'OK', onPress: () => console.log('OK Pressed') },
                    ]);
                });
        });
    };

    const fetchInvoice = (orderId) => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            console.log(orderId, 'orderId')
            console.log('Bearer ' + usertoken)
            console.log(`${process.env.API_URL}/api/driver/invoice/print/${orderId}?type=pdf`)
            axios.get(`${process.env.API_URL}/api/driver/invoice/print/${orderId}?type=pdf`, {
                headers: {
                    "Authorization": 'Bearer ' + usertoken,
                    "Content-Type": 'application/json'
                },
            })
                .then(res => {
                    // let userInfo = res.data.response.records;
                    // console.log(JSON.stringify(userInfo), 'fetch new order')
                    // setFaq(userInfo)
                    // setIsLoading(false);
                    console.log(res.data.pdf_url)
                    // return
                    invoiceDownload(res.data.pdf_url)
                })
                .catch(e => {
                    console.log(`User fetch error ${e}`)
                });
        });
    }
    // const invoiceDownload = (url) => {
    //     const { dirs } = RNFetchBlob.fs;
    //     RNFetchBlob.config({
    //         fileCache: true,
    //         addAndroidDownloads: {
    //             useDownloadManager: true,
    //             notification: true,
    //             mediaScannable: true,
    //             title: `invoice.pdf`,
    //             path: `${dirs.DownloadDir}/invoice..pdf`,
    //         },
    //     })
    //         .fetch('GET', url, {})
    //         .then((res) => {
    //             console.log('The file saved to ', res.path());
    //             // ToastAndroid.show('The file saved to ', res.path(), ToastAndroid.SHORT);
    //             Toast.show({
    //                 type: 'success',
    //                 text2: "PDF Downloaded successfully",
    //                 position: 'top',
    //                 topOffset: Platform.OS == 'ios' ? 55 : 20
    //             });
    //         })
    //         .catch((e) => {
    //             console.log(e)
    //         });
    // }

    const invoiceDownload = (url) => {
        const { dirs } = RNFetchBlob.fs;

        // Separate configs for Android and iOS
        const configOptions = Platform.select({
            android: {
                fileCache: true,
                addAndroidDownloads: {
                    useDownloadManager: true,
                    notification: true,
                    mediaScannable: true,
                    title: `invoice.pdf`,
                    path: `${dirs.DownloadDir}/invoice.pdf`,
                },
            },
            ios: {
                fileCache: true,
                path: `${dirs.DocumentDir}/invoice.pdf`, // iOS sandbox
            },
        });

        RNFetchBlob.config(configOptions)
            .fetch('GET', url)
            .then((res) => {
                console.log('The file saved to', res.path());

                Toast.show({
                    type: 'success',
                    text2: 'PDF Downloaded successfully',
                    position: 'top',
                    topOffset: Platform.OS === 'ios' ? 55 : 20,
                });

                // Optional: Share or preview file on iOS after download
                if (Platform.OS === 'ios') {
                    Share.open({
                        url: 'file://' + res.path(),
                        type: 'application/pdf',
                    }).catch(err => console.log('Share error:', err));
                }
            })
            .catch((e) => {
                console.log('Download error:', e);
            });
    };

    const toggleExpanded = () => {
        setCollapsed(!collapsed)
    };

    const setSections = sections => {
        setActiveSections(sections.includes(undefined) ? [] : sections)
    };

    const renderHeader = (section, _, isActive) => {

        return (
            <Animatable.View
                duration={400}
                style={[styles.header, isActive ? styles.active : styles.inactive]}
                transition="backgroundColor"
            >
                <View style={styles.questionView}>
                    <View style={{ width: responsiveWidth(70) }}>
                        {/* <Text style={styles.headerText}>{section.question}</Text> */}
                        <View style={{ flexDirection: 'row' }}>
                            <Image
                                source={addressWhiteImg}
                                style={styles.iconImage}
                            />
                            <Text style={styles.headerText}>{section.batch_no}</Text>
                        </View>
                    </View>

                    {isActive ?
                        <Icon name="keyboard-arrow-up" size={30} color="#FFFFFF" />
                        :
                        <Icon name="keyboard-arrow-down" size={30} color="#FFFFFF" />
                    }
                </View>
            </Animatable.View>
        );
    };

    const renderContent = (section, _, isActive) => {
        // console.log(section, 'bbbbb')
        return (
            <Animatable.View
                duration={400}
                style={[styles.content, isActive ? styles.active : styles.inactive]}
                transition="backgroundColor"
            >
                <View style={styles.answerView}>
                    {/* {acceptedOrders.map((item, index) => ( */}
                    {section.batch_order_items.map((item, index) => (

                        <View style={styles.table}>
                            <View style={styles.tableRow1}>
                                <View style={{ flexDirection: 'column', padding: 10, }}>
                                    <View style={styles.cellmain}>
                                        <Text style={styles.tableHeader1}>Order ID :</Text>
                                        <Text style={styles.tableHeader2}> {item?.reference}</Text>
                                    </View>
                                    {item?.warehouse_location ?
                                        <Text style={{ color: '#339999' }}>(Warehouse Entry Required)</Text>
                                        : <></>}
                                </View>
                                <View style={{ flexDirection: 'row', paddingRight: 20 }}>
                                    {
                                        // item?.status === 'Declined' ?
                                        //     <TouchableOpacity onPress={() => acceptSingleOrder(item?.order_id, "single")}>
                                        //         <Image source={acceptImg} style={styles.iconImage2} />
                                        //     </TouchableOpacity>
                                        //     :
                                        item?.status === 'Accepted' ?
                                            <TouchableOpacity onPress={() => declineSingleOrder(item?.order_item_id, item?.id, "single")}>
                                                <Image source={declineImg} style={styles.iconImage2} />
                                            </TouchableOpacity>
                                            :
                                            item?.status === 'Active' ?
                                                <>
                                                    <TouchableOpacity onPress={() => acceptSingleOrder(item?.order_item_id, item?.id, "single")}>
                                                        <Image source={acceptImg} style={styles.iconImage2} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => declineSingleOrder(item?.order_item_id, item?.id, "single")}>
                                                        <Image source={declineImg} style={styles.iconImage2} />
                                                    </TouchableOpacity>
                                                </>
                                                : null
                                    }

                                </View>
                            </View>
                            {item.pickup_location ?
                                <View style={{ padding: 10 }}>
                                    <Text style={styles.locationheader}>Pickup Location :</Text>
                                    <View style={{ justifyContent: 'center', }}>
                                        <Text style={styles.iconText}>{item.pickup_location}</Text>
                                    </View>
                                </View>
                                : <></>}
                            <View style={{ borderBottomColor: '#E0E0E0', borderBottomWidth: StyleSheet.hairlineWidth, }} />
                            {item.warehouse_location ?
                                <View style={{ padding: 10 }}>
                                    <Text style={styles.locationheader}>Warehouse Location :</Text>
                                    <View style={{ justifyContent: 'center', }}>
                                        <Text style={styles.iconText}>{item.warehouse_location}</Text>
                                    </View>
                                </View> : <></>}
                            <View style={{ borderBottomColor: '#E0E0E0', borderBottomWidth: StyleSheet.hairlineWidth, }} />
                            {item.delivery_location ?
                                <View style={{ padding: 10 }}>
                                    <Text style={styles.locationheader}>Delivery Location :</Text>
                                    <View style={{ justifyContent: 'center', }}>
                                        <Text style={styles.iconText}>{item.delivery_location}</Text>
                                    </View>
                                </View>
                                : <></>}
                            <View style={{ borderBottomColor: '#E0E0E0', borderBottomWidth: StyleSheet.hairlineWidth, }} />
                            <View style={{ padding: 10 }}>
                                <Text style={styles.locationheader}>Order Items :</Text>
                                {/* {item.order_item.map((orderitem, index) => ( */}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                                    <Text style={styles.iconText}>{Math.floor(item?.order_details.quantity)} x {item?.order_details.product_name.substring(0, 20)}..</Text>
                                    <Text style={styles.iconText}>₵{parseFloat(item?.order_details.price).toFixed(2)}</Text>
                                </View>
                                {/* ))} */}
                                <View style={{ borderBottomColor: '#949494', borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: 5 }} />
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                                    <Text style={styles.iconText}>Subtotal</Text>
                                    <Text style={styles.iconText}>₵{parseFloat(item?.total_order_amount).toFixed(2)}</Text>
                                </View>
                            </View>
                            <View style={styles.tableFooterRow1}>
                                {item?.status === 'Completed' ?
                                    <View style={styles.tableFooterRow2}>
                                        <View style={styles.cellFootermain}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', }}>
                                                <Text style={{ color: '#FFFFFF', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), marginRight: 5 }}>Item Status Completed</Text>

                                            </View>
                                        </View>
                                    </View>
                                    :
                                    <View style={styles.cellFootermain}>

                                        <TouchableOpacity onPress={() => declineSingleOrder(item?.order_item_id, item?.id, "single")}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: responsiveWidth(40) }}>
                                                <Text style={{ color: '#BA0909', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), marginRight: 5 }}>Cancel Order</Text>
                                                <Image source={dubbleArrowImg} style={styles.iconImage} tintColor={'#BA0909'} />
                                            </View>
                                        </TouchableOpacity>
                                        <View style={styles.verticleLine}></View>
                                        <TouchableOpacity onPress={() => fetchInvoice(item?.order_id)}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: responsiveWidth(40) }}>
                                                <Text style={{ color: '#949494', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), marginRight: 5 }}>Download</Text>
                                                <Image source={downloadImg} style={styles.iconImage} tintColor={'#339999'} />
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                }
                            </View>
                        </View>
                    )

                    )}
                </View>
                {/* {
                    getFaq[0]?.status === 'Declined' ?
                        <CustomButton label={"Accept Batch"} buttonIcon={false} onPress={() => acceptSingleOrder(section?.batch_no, "batch")} />
                        :
                        getFaq[0]?.status === 'Accepted' ?
                            <CustomButton label={"Decline Batch"} buttonIcon={false} buttonColor={'red'} onPress={() => declineSingleOrder(section?.batch_no, "batch")} />
                            :
                            getFaq[0]?.status === 'Active' ?
                                <>
                                    <CustomButton label={"Accept Batch"} buttonIcon={false} onPress={() => acceptSingleOrder(section?.batch_no, "batch")} />
                                    <CustomButton label={"Decline Batch"} buttonIcon={false} buttonColor={'red'} onPress={() => declineSingleOrder(section?.batch_no, "batch")} />
                                </>
                                : null
                } */}

            </Animatable.View>
        );
    }
    const fetchNewOrders = (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            //setIsLoading(true);
        }
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.get(`${process.env.API_URL}/api/driver/get-all-order-item`, {
                headers: {
                    "Authorization": 'Bearer ' + usertoken,
                    "Content-Type": 'application/json'
                },
            })
                .then(res => {
                    let userInfo = res.data.response.records;
                    console.log(JSON.stringify(userInfo), 'fetch new order')
                    // Filter out items with status 'Active' inside batch_order_items
                    userInfo.forEach(item => {
                        item.batch_order_items = item.batch_order_items.filter(batch => batch.status === 'Active');
                    });

                    // Remove items with empty batch_order_items array
                    userInfo = userInfo.filter(item => item.batch_order_items.length > 0);

                    setFaq(userInfo.reverse());
                    let totalExpectedEarning = 0;

                    userInfo.forEach(batch => {
                        console.log(batch.total_expected_earning, 'batch.total_expected_earning')
                        if (batch.total_expected_earning) {
                            totalExpectedEarning += parseFloat(batch.total_expected_earning);
                        }
                    });
                    settotalExpectedEarning(totalExpectedEarning || 0)
                    setIsLoading(false);
                    setRefreshing(false);
                })
                .catch(e => {
                    console.log(`User fetch error ${e}`)
                    setIsLoading(false);
                    setRefreshing(false);
                });
        });
    }

    useEffect(() => {
        fetchNewOrders()
    }, [])
    useFocusEffect(
        React.useCallback(() => {
            fetchNewOrders()
        }, [])
    )

    useEffect(() => {
        // Clear the new order notification when screen is mounted
        dispatch(setNewOrder(false));
    }, [dispatch]);

    // Auto-refresh every 2 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            fetchNewOrders();
        }, 2 * 60 * 1000); // 2 minutes in milliseconds

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        fetchDeclineReasons();
    }, []);

    useEffect(() => {
        // Open all accordion sections by default when data is loaded
        if (getFaq.length > 0) {
            setActiveSections(getFaq.map((_, index) => index));
        }
    }, [getFaq]);

    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'New Order'} onPress={() => navigation.goBack()} title={'New Order'} />
            <ScrollView 
                style={styles.wrapper}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => fetchNewOrders(true)}
                        colors={['#339999']}
                        tintColor={'#339999'}
                    />
                }
            >
                {getFaq.length > 0 ?
                    <View style={styles.table}>
                        <View style={styles.toptableRow1}>
                            <View style={styles.topcellmain}>
                                <Text style={styles.toptableHeader1}>Total Earning</Text>
                            </View>
                        </View>
                        <View style={{ padding: 15, backgroundColor: '#E0E0E0', flexDirection: 'row', justifyContent: 'center', borderBottomLeftRadius: 10, borderBottomRightRadius: 10, height: responsiveHeight(7) }}>
                            <Text style={styles.toptableHeader2}>Expected Earning </Text>
                            <Text style={styles.toptableHeader3}>₵{parseFloat(totalExpectedEarning).toFixed(2)} </Text>
                        </View>
                    </View> :
                    <View>
                        <Text style={{ color: '#4D4B4B', fontFamily: 'Poppins-Medium', fontSize: responsiveFontSize(2), textAlign: 'center', }}>No new assign order found</Text>
                    </View>
                }

                <View style={{ marginBottom: responsiveHeight(10) }}>

                    <Accordion
                        activeSections={activeSections}
                        sections={getFaq}
                        touchableComponent={TouchableOpacity}
                        renderHeader={renderHeader}
                        renderContent={renderContent}
                        duration={400}
                        onChange={setSections}
                    />
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

export default NewOrderScreen

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
        height: responsiveHeight(9),
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
