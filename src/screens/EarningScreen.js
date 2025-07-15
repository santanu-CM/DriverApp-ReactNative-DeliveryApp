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
import { chatImg, downloadImg, emailImg, forwordImg, ordersImg, phoneImg } from '../utils/Images';
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
import RNFetchBlob from 'rn-fetch-blob';
import Toast from 'react-native-toast-message';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';

const BannerWidth = Dimensions.get('window').width;
const ITEM_WIDTH = Math.round(BannerWidth * 0.7)
const { height, width } = Dimensions.get('screen')

const data = [
    { label: 'Today', value: '1' },
    { label: 'Date Wise', value: '2' },
];

export default function EarningScreen({ navigation }) {

    const dispatch = useDispatch();
    const { data: products, status } = useSelector(state => state.products)
    const { userInfo } = useContext(AuthContext)
    const [isModalVisible, setModalVisible] = useState(false);
    const [startDay, setStartDay] = useState(null);
    const [endDay, setEndDay] = useState(null);
    const [markedDates, setMarkedDates] = useState({});

    const [isLoading, setIsLoading] = useState(true)
    const [value, setValue] = useState('1');
    const [isFocus, setIsFocus] = useState(false);
    const [earningData, setEarningData] = useState([])
    const [totalEarning, settotalEarning] = useState(0)
    const [totalCompletedOrder, setTotalCompletedOrder] = useState(0)
    const [pdfUrl, setPdfUrl] = useState('')

    const formatDate = (date) => {
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        return date.toLocaleDateString('en-US', options);
    };

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const handleDayPress = (day) => {
        if (startDay && !endDay) {
            const date = {}
            for (const d = moment(startDay); d.isSameOrBefore(day.dateString); d.add(1, 'days')) {
                //console.log(d,'vvvvvvvvvv')
                date[d.format('YYYY-MM-DD')] = {
                    //marked: true,
                    color: '#339999',
                    textColor: 'white'
                };

                if (d.format('YYYY-MM-DD') === startDay) {
                    date[d.format('YYYY-MM-DD')].startingDay = true;
                }
                if (d.format('YYYY-MM-DD') === day.dateString) {
                    date[d.format('YYYY-MM-DD')].endingDay = true;
                }
            }

            setMarkedDates(date);
            setEndDay(day.dateString);
        }
        else {
            setStartDay(day.dateString)
            setEndDay(null)
            setMarkedDates({
                [day.dateString]: {
                    //marked: true,
                    color: '#339999',
                    textColor: 'white',
                    startingDay: true,
                    endingDay: true
                }
            })
        }

    }

    const actualDownload = (url) => {
        const { dirs } = RNFetchBlob.fs;
        RNFetchBlob.config({
            fileCache: true,
            addAndroidDownloads: {
                useDownloadManager: true,
                notification: true,
                mediaScannable: true,
                title: `statement.pdf`,
                path: `${dirs.DownloadDir}/statement.pdf`,
            },
        })
            .fetch('GET', url, {})
            .then((res) => {
                console.log('The file saved to ', res.path());
                // ToastAndroid.show('The file saved to ', res.path(), ToastAndroid.SHORT);
                Toast.show({
                    type: 'success',
                    text2: "PDF Downloaded successfully",
                    position: 'top',
                    topOffset: Platform.OS == 'ios' ? 55 : 20
                });
            })
            .catch((e) => {
                console.log(e)
            });
    }

    const fetchData = (getId) => {
        var toDate = null;
        var formDate = null;
        if (getId == '1') {
            console.log('today')
            const today = new Date();
            const year_today = today.getFullYear();
            const month_today = today.getMonth() + 1; // Months are zero-indexed
            const day_today = today.getDate();
            const formattedDate_for_today = `${year_today}-${month_today < 10 ? '0' + month_today : month_today}-${day_today < 10 ? '0' + day_today : day_today}`;
            console.log(formattedDate_for_today)
            // Get tomorrow's date by adding one day
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const year_tomorrow = tomorrow.getFullYear();
            const month_tomorrow = tomorrow.getMonth() + 1; // Months are zero-indexed
            const day_tomorrow = tomorrow.getDate();
            const formattedDate_for_tomorrow = `${year_tomorrow}-${month_tomorrow < 10 ? '0' + month_tomorrow : month_tomorrow}-${day_tomorrow < 10 ? '0' + day_tomorrow : day_tomorrow}`;
            console.log(formattedDate_for_tomorrow)
            toDate = formattedDate_for_today;
            formDate = formattedDate_for_tomorrow;
        } else {
            if (value == '1') {
                console.log('today')
                const today = new Date();
                const year_today = today.getFullYear();
                const month_today = today.getMonth() + 1; // Months are zero-indexed
                const day_today = today.getDate();
                const formattedDate_for_today = `${year_today}-${month_today < 10 ? '0' + month_today : month_today}-${day_today < 10 ? '0' + day_today : day_today}`;
                console.log(formattedDate_for_today)
                // Get tomorrow's date by adding one day
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                const year_tomorrow = tomorrow.getFullYear();
                const month_tomorrow = tomorrow.getMonth() + 1; // Months are zero-indexed
                const day_tomorrow = tomorrow.getDate();
                const formattedDate_for_tomorrow = `${year_tomorrow}-${month_tomorrow < 10 ? '0' + month_tomorrow : month_tomorrow}-${day_tomorrow < 10 ? '0' + day_tomorrow : day_tomorrow}`;
                console.log(formattedDate_for_tomorrow)
                toDate = formattedDate_for_today;
                formDate = formattedDate_for_tomorrow;
            } else if (value == '2') {
                toDate = startDay;
                formDate = endDay;
            }
        }

        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.get(`${process.env.API_URL}/api/driver/get-driver-earning?status=Completed&to=${toDate}&from=${formDate}`, {
                headers: {
                    "Authorization": 'Bearer ' + usertoken,
                    "Content-Type": 'application/json'
                },
            })
                .then(res => {
                    console.log(JSON.stringify(res.data))
                    if (res.data.response.status.code === 200) {
                        setIsLoading(false)
                        if (res.data.response.records.totalEarning.total) {
                            setEarningData(res.data.response.records.data)
                            settotalEarning(res.data.response.records.totalEarning.total)
                            setTotalCompletedOrder(res.data.response.records.data.length)
                            setPdfUrl(res.data.response.records.pdf_url)
                        } else {
                            setEarningData([])
                            settotalEarning(0)
                            setTotalCompletedOrder(0)
                        }
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

    const dateRangeSearch = () => {
        console.log(startDay)
        console.log(endDay)
        fetchData()
        toggleModal()
    }

    useEffect(() => {
        fetchData();
    }, [])

    useFocusEffect(
        React.useCallback(() => {
            fetchData()
        }, [])
    )

    if (isLoading) {
        return (
            <Loader />
        )
    }

    const renderList = (item, index) => {
        console.log(item)
        return (
            <View style={styles.tableRow3}>
                <View style={styles.cell}>
                    <Text style={styles.tableHeader2}>{item.item.reference}</Text>
                </View>
                <View style={styles.cell}>
                    <Text style={styles.tableHeader2}>{item.item.total_distance}Km</Text>
                </View>
                <View style={styles.cell}>
                    <Text style={styles.tableHeader2}>${Number(item.item.totalAmount).toFixed(2)}</Text>
                </View>
            </View>
        )
    }


    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Earnings'} title={'Earnings'} onPress={() => navigation.goBack()} onPressProfile={() => navigation.navigate('Profile')} />
            <ScrollView style={styles.wrapper}>
                <View style={styles.secondCardView}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ color: '#9C9C9C', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2),  }}>Total Earning</Text>
                        <Dropdown
                            style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            inputSearchStyle={styles.inputSearchStyle}
                            itemTextStyle={styles.selectedTextStyle}
                            data={data}
                            //search
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder={!isFocus ? 'Select item' : '...'}
                            searchPlaceholder="Search..."
                            value={value}
                            onFocus={() => setIsFocus(true)}
                            onBlur={() => setIsFocus(false)}
                            onChange={item => {
                                if (item.value == '2') {
                                    setValue('2');
                                    toggleModal()
                                } else if (item.value == '1') {
                                    console.log(item.value, 'jjjjjj')
                                    setValue('1');
                                    fetchData(item.value)
                                }
                                setIsFocus(false);
                            }}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                        <Text style={{ color: '#3A3232', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(3), marginTop: 10 }}>${Number(totalEarning).toFixed(2)}</Text>
                        <View style={styles.verticleLine}></View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, justifyContent: 'space-between' }}>
                            <Image
                                source={ordersImg}
                                style={styles.iconImage}
                            />
                            <Text style={{ color: '#339999', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), marginLeft: 5 }}>{totalCompletedOrder} order completed</Text>
                        </View>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 20 }}>
                    <Text style={{ color: '#2F2F2F', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2.2), marginBottom: 10 }}>Earning Breakup</Text>
                    {totalEarning ?
                        <TouchableOpacity onPress={() => actualDownload(pdfUrl)}>
                            <Image
                                source={downloadImg}
                                style={styles.iconImage}
                            />
                        </TouchableOpacity>
                        :
                        <></>}
                </View>
                <View style={styles.table}>
                    <View style={styles.tableRow1}>
                        <View style={styles.cell}>
                            <TouchableOpacity onPress={() => actualDownload()}>
                                <Text style={styles.tableHeader}>Order Id</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.cell}>
                            <Text style={styles.tableHeader}>Distance</Text>
                        </View>
                        <View style={styles.cell}>
                            <Text style={styles.tableHeader}>Earnings</Text>
                        </View>
                    </View>
                    <FlatList
                        data={earningData}
                        renderItem={renderList}
                        keyExtractor={(item, index) => index}
                        horizontal={false}
                        showsHorizontalScrollIndicator={false}
                        removeClippedSubviews={true}
                        initialNumToRender={5}
                    //numColumns={2}
                    />


                </View>
            </ScrollView>
            <Modal
                isVisible={isModalVisible}
                style={{
                    margin: 0, // Add this line to remove the default margin
                    justifyContent: 'flex-end',
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', height: 50, width: 50, borderRadius: 25, position: 'absolute', bottom: '75%', left: '45%', right: '45%' }}>
                    <Icon name="cross" size={30} color="#464646" onPress={toggleModal} />
                </View>
                <View style={{ height: '70%', backgroundColor: '#fff', position: 'absolute', bottom: 0, width: '100%' }}>
                    <View style={{ padding: 20 }}>
                        <View style={{ marginBottom: responsiveHeight(3) }}>
                            <Text style={{ color: '#444', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2) }}>Select your date</Text>
                            <Calendar
                                onDayPress={(day) => {
                                    handleDayPress(day)
                                }}
                                //monthFormat={"yyyy MMM"}
                                //hideDayNames={false}
                                markingType={'period'}
                                markedDates={markedDates}
                                theme={{
                                    selectedDayBackgroundColor: '#339999',
                                    selectedDayTextColor: 'white',
                                    monthTextColor: '#339999',
                                    textMonthFontFamily: 'Outfit-Medium',
                                    dayTextColor: 'black',
                                    textMonthFontSize: 18,
                                    textDayHeaderFontSize: 16,
                                    arrowColor: '#2E2E2E',
                                    dotColor: 'black'
                                }}
                                style={{
                                    borderWidth: 1,
                                    borderColor: '#E3EBF2',
                                    borderRadius: 15,
                                    height: responsiveHeight(50),
                                    marginTop: 20,
                                    marginBottom: 10
                                }}
                            />
                            <View style={styles.buttonwrapper2}>
                                <CustomButton label={"Ok"} onPress={() => { dateRangeSearch() }} />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
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
        color: '#2F2F2F'
    },
    selectedTextStyle: {
        fontSize: 16,
        color: '#2F2F2F'
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
        color: '#2F2F2F'
    },
    table: {
        borderWidth: 1,
        borderColor: '#ddd',
        //margin: 10,
        width: responsiveWidth(89),
        //height: responsiveHeight(40),
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomWidth: 0,

    },
    tableRow1: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#E0E0E0',
        height: responsiveHeight(7),
        backgroundColor: '#F8F7F9',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10
    },
    cellmain: {
        flex: 1,
        padding: 10,
        flexDirection: 'row',
        //justifyContent: 'center',
        alignItems: 'center',
    },
    tableRow3: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#ddd',
        height: responsiveHeight(8),

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