import React, { useContext, useState, useEffect,useCallback } from 'react';
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
    RefreshControl
} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from '@env'
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { add } from '../store/cartSlice';
import Loader from '../utils/Loader';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import CustomHeader from '../components/CustomHeader';
import ProgressCircle from 'react-native-progress-circle'
import StarRating from 'react-native-star-rating-widget';
import moment from 'moment';
import { useFocusEffect, useNavigation } from '@react-navigation/native'; 

const BannerWidth = Dimensions.get('window').width;
const ITEM_WIDTH = Math.round(BannerWidth * 0.7)
const { height, width } = Dimensions.get('screen')



export default function ReviewScreenShipment({  }) {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { data: products, status } = useSelector(state => state.products)
    //const { userInfo } = useContext(AuthContext)
    const [isModalVisible, setModalVisible] = useState(false);
    const [getData, setData] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [starCount, setStarCount] = useState(0)
    const [activeTabs, setActiveTabs] = useState({});
    const [singlestarCount, setSingleStarCount] = useState(3.5)
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchReview()
        setRefreshing(false);
    }, []);


    const toggleTab = (index, tabKey) => {
        setActiveTabs((prevState) => ({
            ...prevState,
            [index]: tabKey,
        }));
    };


    const fetchReview = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            console.log(usertoken);

            axios.get(`${process.env.API_URL}/api/driver/list-shipment-rates`, {
                headers: {
                    "Authorization": 'Bearer ' + usertoken,
                    "Content-Type": 'application/json'
                },
            })
                .then(res => {
                    console.log(JSON.stringify(res.data))
                    if (res.data.response.status.code === 200) {
                        setIsLoading(false)
                        const records_rate_avg = res.data.response.records.shipment_rate_avg;
                        setStarCount(records_rate_avg)
                        const records_rate_list = res.data.response.records.shipment_rate_list;
                        setData(records_rate_list)
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
        fetchReview();
    }, [])
    useFocusEffect(
        React.useCallback(() => {
            fetchReview()
        }, [])
    )

    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Reviews'} title={'Reviews'} onPress={() => navigation.goBack()} onPressProfile={() => navigation.navigate('Profile')} />
            <ScrollView style={styles.wrapper} refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#339999" colors={['#339999']} />
            }>
                <View style={{ paddingBottom: responsiveHeight(4) }}>
                    {getData.length > 0 ?
                        <View style={{ alignSelf: 'center', marginBottom: 10 }}>
                            <ProgressCircle
                                percent={starCount * 2 * 10}
                                radius={70}
                                borderWidth={8}
                                color="#339999"
                                shadowColor="#fff"
                                bgColor="#fff"
                            >
                                <Text style={{ color: '#3A3232', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(3), }}>{starCount}</Text>
                                <StarRating
                                    disabled={true}
                                    maxStars={5}
                                    rating={starCount}
                                    onChange={(rating) => setStarCount(rating)}
                                    fullStarColor={'#FFCB45'}
                                    starSize={20}
                                    starStyle={{ marginHorizontal: -0.5 }}
                                />
                                <Text style={{ color: '#339999', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), }}>Rating</Text>
                            </ProgressCircle>
                        </View>
                        :
                        <View>
                            <Text style={{ color: '#4D4B4B', fontFamily: 'Poppins-Medium', fontSize: responsiveFontSize(2), textAlign: 'center', }}>You have no review & rating yet</Text>
                        </View>}
                    {/* <Text style={{ color: '#2F2F2F', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2.2), marginBottom: 10 }}>Last 10 Reviews</Text> */}
                    {getData.map((item, index) => (
                        <View style={styles.table}>
                            <View style={styles.tableRow1}>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ color: '#339999', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2) }}>Shipping ID : </Text>
                                    <Text style={{ color: '#949494', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2) }}>{item?.shiper_profile.shipping_id}</Text>
                                </View>
                                <Text style={{ color: '#949494', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(1.7) }}>Date: {moment(item?.created_at).format('YYYY-MM-DD')}</Text>

                            </View>
                            <View style={styles.tableRow3}>

                                <View style={{ padding: 10 }}>
                                    <View>

                                        <View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Text style={{ color: '#339999', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2) }}>Review</Text>
                                                <StarRating
                                                    disabled={true}
                                                    maxStars={5}
                                                    rating={item.rate}
                                                    starSize={20}
                                                    fullStarColor={'#FFCB45'}
                                                />
                                            </View>
                                            <Text style={{ color: '#949494', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2) }}>{item.review}</Text>
                                        </View>

                                    </View>
                                </View>
                            </View>

                        </View>
                    )

                    )}
                </View>
            </ScrollView>
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
        //paddingBottom: responsiveHeight(2)
    },
    iconimg: {
        height: responsiveHeight(5),
        width: responsiveWidth(5),
        resizeMode: 'contain',
    },
    headerText: {
        color: '#3A3232',
        fontFamily: 'Outfit-Medium',
        fontSize: responsiveFontSize(2),
    },
    questionView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: '#F8F7F9',
        borderColor: '#E0E0E0',
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 5
    },
    answerView: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        borderColor: '#E0E0E0',
        borderWidth: 1,
        //paddingBottom:10
    },
    iconImage: {
        width: 23,
        height: 23,
    },
    firstCardView: {
        height: responsiveHeight(13),
        width: responsiveWidth(42),
        backgroundColor: '#F6F6F6',
        borderRadius: 8,
        padding: 10,
        borderColor: '#E0E0E0',
        borderWidth: 1
    },
    secondCardView: {
        height: responsiveHeight(15),
        width: responsiveWidth(89),
        backgroundColor: '#A7E7E7',
        borderRadius: 8,
        padding: 10,
        borderColor: '#A7E7E7',
        borderWidth: 1,
        marginBottom: 10
    },
    verticleLine: {
        height: '100%',
        width: 1,
        backgroundColor: '#339999',
    },
    dropdown: {
        height: responsiveHeight(4),
        width: responsiveWidth(35),
        borderColor: '#E0E0E0',
        borderWidth: 0.7,
        borderRadius: 8,
        paddingHorizontal: 8,
        marginTop: 5,
        backgroundColor: '#FFFFFF'
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
    table: {
        borderWidth: 1,
        borderColor: '#ddd',
        //margin: 10,
        width: responsiveWidth(89),
        //height: responsiveHeight(40),
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomWidth: 1,
        marginBottom: responsiveHeight(2),
    },
    tableRow1: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: '#A7E7E7',
        height: responsiveHeight(7),
        backgroundColor: '#DEFFFF',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        padding: 10
    },
    cellmain: {
        flex: 1,
        padding: 10,
        flexDirection: 'row',
        //justifyContent: 'center',
        alignItems: 'center',
    },
    tableRow3: {
        borderBottomWidth: 0,
        borderColor: '#ddd',
        //height: responsiveHeight(50),

    },
    tableHeader: {
        color: '#339999',
        fontFamily: 'Outfit-Medium',
        fontSize: responsiveFontSize(2),
        textAlign: 'left',
    },
    tableHeader2: {
        color: '#716E6E',
        fontFamily: 'Outfit-Medium',
        fontSize: responsiveFontSize(1.7),
        fontWeight: '500',
        textAlign: 'left'
    },
    cell: {
        width: responsiveWidth(28),
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});