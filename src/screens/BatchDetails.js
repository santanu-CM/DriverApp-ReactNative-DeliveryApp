import React, { useState, useContext, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity } from 'react-native'
import * as Animatable from 'react-native-animatable';
import CustomHeader from '../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TextInput, LongPressGestureHandler, State } from 'react-native-gesture-handler'
import { addressWhiteImg, dubbleArrowImg, downloadImg, searchImg, userPhoto, pointerImg, infoImg } from '../utils/Images'
import CustomButton from '../components/CustomButton'
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { API_URL } from '@env'
import Loader from '../utils/Loader'
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import Accordion from 'react-native-collapsible/Accordion';
import Icon from 'react-native-vector-icons/MaterialIcons';
import GetLocation from 'react-native-get-location'
import haversine from 'haversine-distance';
import { SafeAreaView } from 'react-native-safe-area-context';
const RADIUS_OF_EARTH = 6378; 

const Pickup = ({ batchId, currentLat, currentLong }) => {
    const [activeSections, setActiveSections] = useState([]);
    const [getorders, setOrders] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const navigation = useNavigation();
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
    const fetchBatchDetails = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            console.log(batchId, 'mmm')
            axios.get(`${process.env.API_URL}/api/driver/get-batch-by-id/${batchId}?status=Accepted`, {
                headers: {
                    "Authorization": 'Bearer ' + usertoken,
                    "Content-Type": 'application/json'
                },
            })
                .then(res => {
                    let userInfo = res.data.response.records;
                    console.log(JSON.stringify(userInfo), 'fetch pickup order from batchdetails')
                    setOrders(userInfo)
                    setIsLoading(false);
                })
                .catch(e => {
                    console.log(`User fetch error ${e}`)
                });
        });
    }
    useEffect(() => {
        fetchBatchDetails()
    }, [])
    useFocusEffect(
        React.useCallback(() => {
            fetchBatchDetails()
        }, [])
    )
    if (isLoading) {
        return (
            <Loader />
        )
    }
    return (
        <>
            <ScrollView style={styles.wrapper}>
                <View style={{ paddingBottom: responsiveHeight(15) }}>
                    {getorders[0]?.batch_order_items?.map((item, index) => (
                        <>
                            {item.pickup_location ?
                                <View style={styles.table}>
                                    <View style={styles.tableRow1}>
                                        <View style={styles.cellmain}>
                                            <Text style={styles.tableHeader1}>Batch Number :</Text>
                                            <Text style={styles.tableHeader2}> B - {item?.batch_id}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.tableRow2}>
                                        <View style={styles.cellmain2}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', }}>
                                                <Text style={styles.tableHeader1}>Order ID :</Text>
                                                <Text style={styles.tableHeader2}> {item?.reference}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ padding: 10 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                            <Text style={styles.locationheader}>Pickup Location :</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Image source={pointerImg} style={{ height: 20, width: 20 }} tintColor={'#3F709E'} />
                                                <Text style={{ color: '#3F709E', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(1.7), marginLeft: 5 }}>
                                                    {isNaN(currentLat) || isNaN(currentLong) || isNaN(item.pickup_lat) || isNaN(item.pickup_long) ? 'Calculating distance...' :
                                                        (getDistanceFromLocation({ lat: currentLat, lng: currentLong }, { lat: item.pickup_lat, lng: item.pickup_long })).toFixed(2) + ' KM Away'}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={{ justifyContent: 'center', }}>
                                            <Text style={styles.iconText}>{item?.pickup_location}</Text>
                                        </View>
                                    </View>
                                    <View style={{ borderBottomColor: '#E0E0E0', borderBottomWidth: StyleSheet.hairlineWidth, }} />
                                    <View style={{ padding: 10 }}>
                                        <Text style={styles.locationheader}>Order Items :</Text>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                                            <Text style={styles.iconText}>{Math.floor(item?.order_details.quantity)} x {item?.order_details.product_name.substring(0, 20)}..</Text>
                                            <Text style={styles.iconText}>₵{parseFloat(item?.order_details.price).toFixed(2)}</Text>
                                        </View>

                                        <View style={{ borderBottomColor: '#949494', borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: 5 }} />
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                                            <Text style={styles.iconText}>Subtotal</Text>
                                            <Text style={styles.iconText}>₵{parseFloat(item?.total_order_amount).toFixed(2)}</Text>
                                        </View>
                                    </View>
                                    {item?.pickup_status == 'Completed' ?
                                        <View style={styles.tableFooterRow2}>
                                            <View style={styles.cellFootermain}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: responsiveWidth(40) }}>
                                                    <Text style={{ color: '#FFFFFF', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), marginRight: 5 }}>Items Collected</Text>

                                                </View>
                                            </View>
                                        </View>
                                        :
                                        <View style={styles.tableFooterRow1}>
                                            <View style={styles.cellFootermain}>
                                                <TouchableOpacity onPress={() => navigation.navigate('LocationConfirmation', { orderId: item.id, fromPage: 'pickup' })}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: responsiveWidth(40) }}>
                                                        <Text style={{ color: '#339999', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), marginRight: 5 }}>Go to Pickup</Text>
                                                        <Image source={dubbleArrowImg} style={styles.iconImage} tintColor={'#339999'} />
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    }
                                </View>
                                : <Text style={{ color: '#339999', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), textAlign: 'center' }}>Pickup location not available</Text>}
                            {/* {item.warehouse_location &&
                                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 5, paddingHorizontal: 10, marginVertical: responsiveHeight(1) }}>
                                    <Image source={infoImg} style={styles.iconImage} tintColor={'#339999'} />
                                    <Text style={{ color: '#339999', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(1.8), marginLeft: 5 }}>Need to go warehouse for complete delivery</Text>
                                </View>
                            } */}
                        </>
                    )

                    )}
                </View>
            </ScrollView>
            <View style={styles.buttonwrapper}>
                <CustomButton label={"View All Pickup on Map"} buttonIcon={true} onPress={() => navigation.navigate('MapForAllPickup', { fromPage: 'pickup' })} />
            </View>
        </>
    );
};

const Warehouse = ({ batchId, currentLat, currentLong }) => {
    const [activeSections, setActiveSections] = useState([]);
    const [getorders, setOrders] = useState([])
    const [isLoading, setIsLoading] = useState(true) 
    const navigation = useNavigation();
    console.log(batchId, 'hhhh')
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
    const fetchBatchDetails = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            console.log(batchId, 'mmm')
            axios.get(`${process.env.API_URL}/api/driver/get-batch-by-id/${batchId}?status=Accepted`, {
                headers: {
                    "Authorization": 'Bearer ' + usertoken,
                    "Content-Type": 'application/json'
                },
            })
                .then(res => {
                    let userInfo = res.data.response.records;
                    console.log(JSON.stringify(userInfo), 'fetch pickup order')
                    setOrders(userInfo)
                    setIsLoading(false);
                })
                .catch(e => {
                    console.log(`User fetch error ${e}`)
                });
        });
    }
    useEffect(() => {
        fetchBatchDetails()
    }, [])
    useFocusEffect(
        React.useCallback(() => {
            fetchBatchDetails()
        }, [])
    )
    if (isLoading) {
        return (
            <Loader />
        )
    }
    return (
        <>
            <ScrollView style={styles.wrapper}>
                <View style={{ paddingBottom: responsiveHeight(15) }}>
                    {getorders[0]?.batch_order_items?.map((item, index) => (
                        <>
                            {item.warehouse_location ?
                                <View style={styles.table}>
                                    <View style={styles.tableRow1}>
                                        <View style={styles.cellmain}>
                                            <Text style={styles.tableHeader1}>Batch Number :</Text>
                                            <Text style={styles.tableHeader2}> B - {item?.batch_id}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.tableRow2}>
                                        <View style={styles.cellmain2}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', }}>
                                                <Text style={styles.tableHeader1}>Order ID :</Text>
                                                <Text style={styles.tableHeader2}> {item?.reference}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ padding: 10 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                            <Text style={styles.locationheader}>Warehouse Location :</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Image source={pointerImg} style={{ height: 20, width: 20 }} tintColor={'#3F709E'} />
                                                <Text style={{ color: '#3F709E', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(1.7), marginLeft: 5 }}>
                                                    {isNaN(currentLat) || isNaN(currentLong) || isNaN(item.warehouse_lat) || isNaN(item.warehouse_long)
                                                        ? 'Calculating distance...'
                                                        : `${(getDistanceFromLocation({ lat: currentLat, lng: currentLong }, { lat: item.warehouse_lat, lng: item.warehouse_long })).toFixed(2)} KM Away`}
                                                </Text>
                                                {/* <Text>{(getDistanceFromLocation({ lat: currentLat, lng: currentLong }, { lat: item.warehouse_lat, lng: item.warehouse_long }))}</Text> */}
                                            </View>
                                        </View>
                                        <View style={{ justifyContent: 'center', }}>
                                            <Text style={styles.iconText}>{item?.warehouse_location}</Text>
                                        </View>
                                    </View>
                                    <View style={{ borderBottomColor: '#E0E0E0', borderBottomWidth: StyleSheet.hairlineWidth, }} />
                                    <View style={{ padding: 10 }}>
                                        <Text style={styles.locationheader}>Order Items :</Text>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                                            <Text style={styles.iconText}>{Math.floor(item?.order_details.quantity)} x {item?.order_details.product_name.substring(0, 20)}..</Text>
                                            <Text style={styles.iconText}>₵{parseFloat(item?.order_details.price).toFixed(2)}</Text>
                                        </View>

                                        <View style={{ borderBottomColor: '#949494', borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: 5 }} />
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                                            <Text style={styles.iconText}>Subtotal</Text>
                                            <Text style={styles.iconText}>₵{parseFloat(item?.total_order_amount).toFixed(2)}</Text>
                                        </View>
                                    </View>
                                    {item?.warehouse_status == 'Completed' ?
                                        <View style={styles.tableFooterRow2}>
                                            <View style={styles.cellFootermain}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: responsiveWidth(40) }}>
                                                    <Text style={{ color: '#FFFFFF', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), marginRight: 5 }}>Items Dispatched</Text>

                                                </View>
                                            </View>
                                        </View>
                                        :
                                        <View style={styles.tableFooterRow1}>
                                            <View style={styles.cellFootermain}>
                                                <TouchableOpacity onPress={() => navigation.navigate('LocationConfirmation', { orderId: item.id, fromPage: 'warehouse' })}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: responsiveWidth(40) }}>
                                                        <Text style={{ color: '#339999', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), marginRight: 5 }}>Go to Warehouse</Text>
                                                        <Image source={dubbleArrowImg} style={styles.iconImage} tintColor={'#339999'} />
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    }
                                </View>
                                : <Text style={{ color: '#339999', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), textAlign: 'center' }}>Warehouse location not available</Text>}
                        </>
                    )

                    )}
                </View>
            </ScrollView>
            <View style={styles.buttonwrapper}>
                <CustomButton label={"View All Warehouse on Map"} buttonIcon={true} onPress={() => navigation.navigate('MapForAllPickup', { fromPage: 'warehouse' })} />
            </View>
        </>
    );
};

const Delivery = ({ batchId, currentLat, currentLong }) => {
    const [activeSections, setActiveSections] = useState([]);
    const [getorders, setOrders] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const navigation = useNavigation();
    console.log(batchId, 'hhhh')
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
    const fetchBatchDetails = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            console.log(batchId, 'mmm')
            axios.get(`${process.env.API_URL}/api/driver/get-batch-by-id/${batchId}?status=Accepted`, {
                headers: {
                    "Authorization": 'Bearer ' + usertoken,
                    "Content-Type": 'application/json'
                },
            })
                .then(res => {
                    let userInfo = res.data.response.records;
                    console.log(JSON.stringify(userInfo), 'fetch pickup order')
                    setOrders(userInfo)
                    setIsLoading(false);
                })
                .catch(e => {
                    console.log(`User fetch error ${e}`)
                });
        });
    }
    useEffect(() => {
        fetchBatchDetails()
    }, [])
    useFocusEffect(
        React.useCallback(() => {
            fetchBatchDetails()
        }, [])
    )
    if (isLoading) {
        return (
            <Loader />
        )
    }
    return (
        <>
            <ScrollView style={styles.wrapper}>
                <View style={{ paddingBottom: responsiveHeight(15) }}>
                    {getorders[0]?.batch_order_items?.map((item, index) => (
                        <>
                            {item.delivery_location ?
                                <View style={styles.table}>
                                    <View style={styles.tableRow1}>
                                        <View style={styles.cellmain}>
                                            <Text style={styles.tableHeader1}>Batch Number :</Text>
                                            <Text style={styles.tableHeader2}> B - {item?.batch_id}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.tableRow2}>
                                        <View style={styles.cellmain2}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', }}>
                                                <Text style={styles.tableHeader1}>Order ID :</Text>
                                                <Text style={styles.tableHeader2}> {item?.reference}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ padding: 10 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                            <Text style={styles.locationheader}>Delivery Location :</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Image source={pointerImg} style={{ height: 20, width: 20 }} tintColor={'#3F709E'} />
                                                <Text style={{ color: '#3F709E', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(1.7), marginLeft: 5 }}>
                                                    {isNaN(currentLat) || isNaN(currentLong) || isNaN(item.delivery_lat) || isNaN(item.delivery_long)
                                                        ? 'Calculating distance...'
                                                        : `${(getDistanceFromLocation({ lat: currentLat, lng: currentLong }, { lat: item.delivery_lat, lng: item.delivery_long })).toFixed(2)} KM Away`}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={{ justifyContent: 'center', }}>
                                            <Text style={styles.iconText}>{item?.delivery_location}</Text>
                                        </View>
                                    </View>
                                    <View style={{ borderBottomColor: '#E0E0E0', borderBottomWidth: StyleSheet.hairlineWidth, }} />
                                    <View style={{ padding: 10 }}>
                                        <Text style={styles.locationheader}>Order Items :</Text>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                                            <Text style={styles.iconText}>{Math.floor(item?.order_details.quantity)} x {item?.order_details.product_name.substring(0, 20)}..</Text>
                                            <Text style={styles.iconText}>₵{parseFloat(item?.order_details.price).toFixed(2)}</Text>
                                        </View>

                                        <View style={{ borderBottomColor: '#949494', borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: 5 }} />
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                                            <Text style={styles.iconText}>Subtotal</Text>
                                            <Text style={styles.iconText}>₵{parseFloat(item?.total_order_amount).toFixed(2)}</Text>
                                        </View>
                                    </View>
                                    {item?.delivery_status == 'Completed' ?
                                        <View style={styles.tableFooterRow2}>
                                            <View style={styles.cellFootermain}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: responsiveWidth(40) }}>
                                                    <Text style={{ color: '#FFFFFF', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), marginRight: 5 }}>Items Delivered</Text>

                                                </View>
                                            </View>
                                        </View>
                                        :
                                        <View style={styles.tableFooterRow1}>
                                            <View style={styles.cellFootermain}>
                                                <TouchableOpacity onPress={() => navigation.navigate('LocationConfirmation', { orderId: item.id, fromPage: 'delivery' })}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: responsiveWidth(40) }}>
                                                        <Text style={{ color: '#339999', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), marginRight: 5 }}>Go to Delivery</Text>
                                                        <Image source={dubbleArrowImg} style={styles.iconImage} tintColor={'#339999'} />
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    }
                                </View>
                                : <Text style={{ color: '#339999', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), textAlign: 'center' }}>Delivery location not available</Text>}
                        </>
                    )

                    )}
                </View>
            </ScrollView>
            <View style={styles.buttonwrapper}>
                <CustomButton label={"View All Delivery on Map"} buttonIcon={true} onPress={() => navigation.navigate('MapForAllPickup', { fromPage: 'delivery' })} />
            </View>
        </>
    );
};

// const renderScene = SceneMap({
//     first: Pickup,
//     second: Warehouse,
//     third: Delivery
// });
const renderScene = (props, batchId, currentLat, currentLong) => {
    const { route } = props;
    switch (route.key) {
        case 'first':
            return <Pickup batchId={batchId} currentLat={currentLat} currentLong={currentLong} />;
        case 'second':
            return <Warehouse batchId={batchId} currentLat={currentLat} currentLong={currentLong} />;
        case 'third':
            return <Delivery batchId={batchId} currentLat={currentLat} currentLong={currentLong} />;
        default:
            return null;
    }
};

const BatchDetails = ({ route }) => {
    const navigation = useNavigation();
    const { logout } = useContext(AuthContext);
    const [userInfo, setuserInfo] = useState([])
    const [index, setIndex] = React.useState(0);
    const [batchId, setBatchId] = useState(route?.params?.batchId)
    const [getorders, setOrders] = useState([])
    const [currentLat, setCurrentLat] = useState('')
    const [currentLong, setCurrentLong] = useState('')
    const [routes] = React.useState([
        { key: 'first', title: 'Pickup' },
        { key: 'second', title: 'Warehouse' },
        { key: 'third', title: 'Delivery' },
    ]);

    useEffect(() => {
        GetLocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 60000,
        })
            .then(location => {
                console.log(location);
                setCurrentLat(location.latitude)
                setCurrentLong(location.longitude)
            })
            .catch(error => {
                const { code, message } = error;
                console.warn(code, message);
            })
    }, [])

    const renderTabBar = (props) => (
        <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: '#339999', marginHorizontal: responsiveWidth(7), width: 80, }}
            style={{ backgroundColor: '#FFFFFF', }}
            labelStyle={{ textTransform: 'capitalize', fontFamily: 'Outfit-Medium' }}
            activeColor='#339999'
            inactiveColor='#9FA4A8'
        />
    );



    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Batch Details'} onPress={() => navigation.goBack()} title={'Batch Details'} />
            <TabView
                navigationState={{ index, routes }}
                renderScene={(props) => renderScene({ ...props }, batchId, currentLat, currentLong)}
                renderTabBar={renderTabBar}
                onIndexChange={setIndex}
                initialLayout={{ width: Dimensions.get('window').width }} // Use fixed width
            />
        </SafeAreaView>
    )
}

export default BatchDetails

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
        borderBottomWidth: 0,
        borderColor: '#E0E0E0',
        height: responsiveHeight(7),
        backgroundColor: '#F6F6F6',
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10
    },
    tableFooterRow2: {
        flexDirection: 'row',
        borderBottomWidth: 0,
        borderColor: '#E0E0E0',
        height: responsiveHeight(7),
        backgroundColor: '#3F709E',
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10
    },
    cellmain: {
        flex: 1,
        padding: 10,
        flexDirection: 'row',
        //justifyContent: 'center',
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
    buttonwrapper: {
        paddingHorizontal: 20,
        position: 'absolute',
        bottom: 0,
        width: responsiveWidth(100)
    },
});
