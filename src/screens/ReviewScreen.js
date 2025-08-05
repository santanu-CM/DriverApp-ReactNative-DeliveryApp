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
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomSwitch from '../components/CustomSwitch';
import ListItem from '../components/ListItem';
import { AuthContext } from '../context/AuthContext';
import { getProducts } from '../store/productSlice'
import { API_URL } from '@env'
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { add } from '../store/cartSlice';
import { starWhiteImg, emailImg, forwordImg, ordersImg, phoneImg } from '../utils/Images';
import Loader from '../utils/Loader';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import CustomHeader from '../components/CustomHeader';
import Collapsible from 'react-native-collapsible';
import Accordion from 'react-native-collapsible/Accordion';
import CustomButton from '../components/CustomButton';
import { Dropdown } from 'react-native-element-dropdown';
import Modal from "react-native-modal"; 
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/Entypo';
import ProgressCircle from 'react-native-progress-circle'
import StarRating from 'react-native-star-rating-widget';
// import SwitchSelector from "react-native-switch-selector";
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import moment from 'moment';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const BannerWidth = Dimensions.get('window').width;
const ITEM_WIDTH = Math.round(BannerWidth * 0.7)
const { height, width } = Dimensions.get('screen')



export default function ReviewScreen({  }) {
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


    const toggleTab = (index, tabKey) => {
        setActiveTabs((prevState) => ({
            ...prevState,
            [index]: tabKey,
        }));
    };


    const fetchReview = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            AsyncStorage.getItem('userInfo', (err, userInfo) => {
                axios.get(`${process.env.API_URL}/api/driver/get-rating`, {
                    headers: {
                        "Authorization": 'Bearer ' + usertoken,
                        "Content-Type": 'application/json'
                    },
                })
                    .then(res => {
                        console.log(JSON.stringify(res.data))
                        if (res.data.response.status.code === 200) {
                            setIsLoading(false)
                            const records = res.data.response.records;
                            // Filter records where user_id is equal to 119
                            userInfo = JSON.parse(userInfo); // Ensure it's parsed as an object
                            console.log(records,'asdasdasd');
                            
                            const filteredRecords = records.filter(record => record.user_id === userInfo.user_id);
                            console.log(JSON.stringify(filteredRecords), 'response from review screen')
                            setData(filteredRecords)
                            // Initialize variables for sum and count
                            let sum = 0;
                            let count = 0;
                            // Iterate over filtered records and sum up total ratings
                            filteredRecords.forEach(record => {
                                sum += parseFloat(record.total_rating);
                                count++;
                            });
                            // Calculate average rating
                            const averageRating = count > 0 ? sum / count : 0;
                            setStarCount(averageRating)
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
            <ScrollView style={styles.wrapper}>
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
                                <Text style={{ color: '#3A3232', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(3), }}>{starCount.toFixed(2)}</Text>
                                <StarRating
                                    disabled={true}
                                    maxStars={5}
                                    rating={starCount}
                                    onChange={(rating) => setStarCount(rating)}
                                    fullStarColor={'#FFCB45'}
                                    starSize={20}
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
                                    <Text style={{ color: '#339999', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2) }}>Order ID : </Text>
                                    <Text style={{ color: '#949494', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2) }}>{item?.batch_item?.reference}</Text>
                                </View>
                                <Text style={{ color: '#949494', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2) }}>Date: {moment(item?.created_at).format('YYYY-MM-DD')}</Text>

                            </View>
                            <View style={styles.tableRow3}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: responsiveWidth(10), paddingVertical: 10, borderBottomColor: '#E0E0E0', borderBottomWidth: 1 }}>
                                    {activeTabs[index] === 'pickup' ?
                                        <View style={{ borderBottomColor: '#339999', borderBottomWidth: 2, paddingVertical: 10, }}>
                                            <Text>Pickup</Text>
                                        </View>
                                        :
                                        <TouchableOpacity onPress={() => toggleTab(index, 'pickup')}>
                                            <View style={{ paddingVertical: 10, }}>
                                                <Text>Pickup</Text>
                                            </View>
                                        </TouchableOpacity>
                                    }
                                    {activeTabs[index] === 'delivery' ?
                                        <View style={{ borderBottomColor: '#339999', borderBottomWidth: 2, paddingVertical: 10, }}>
                                            <Text>delivery</Text>
                                        </View>
                                        :
                                        <TouchableOpacity onPress={() => toggleTab(index, 'delivery')}>
                                            <View style={{ paddingVertical: 10, }}>
                                                <Text>delivery</Text>
                                            </View>
                                        </TouchableOpacity>
                                    }
                                </View>
                                <View style={{ padding: 10 }}>
                                    <View>
                                        {activeTabs[index] === 'pickup' && item.category === 'pickup' ? (
                                            <View>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Text>Review</Text>
                                                    <StarRating
                                                        disabled={true}
                                                        maxStars={5}
                                                        rating={item.total_rating}
                                                        starSize={20}
                                                        fullStarColor={'#FFCB45'}
                                                    />
                                                </View>
                                                <Text style={{ color: '#949494', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2) }}>{item.message}</Text>
                                            </View>
                                        ) : (
                                            activeTabs[index] === 'delivery' && item.category === 'delivery' ? (
                                                <View>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Text>Review</Text>
                                                        <StarRating
                                                            disabled={true}
                                                            maxStars={5}
                                                            rating={item.total_rating}
                                                            starSize={20}
                                                            fullStarColor={'#FFCB45'}
                                                        />
                                                    </View>
                                                    <Text style={{ color: '#949494', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2) }}>{item.message}</Text>
                                                </View>
                                            ) : (
                                                <View><Text>No review yet</Text></View>
                                            )
                                        )}
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