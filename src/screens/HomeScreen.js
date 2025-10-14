import React, { useContext, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  RefreshControl,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import Modal from "react-native-modal";
import { AuthContext } from '../context/AuthContext';
import { getProducts } from '../store/productSlice'
import Icon from 'react-native-vector-icons/Entypo';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import moment from 'moment';
import CustomButton from '../components/CustomButton'
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { add } from '../store/cartSlice';
import { allUserImg, chatImg, chatImgRed, documentImg, infoImg, newOrderArrived, newShippingArrived, requestImg, userPhoto } from '../utils/Images';
import Loader from '../utils/Loader';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import CustomHeader from '../components/CustomHeader';
import Carousel from 'react-native-snap-carousel';
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { API_URL } from '@env'
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import messaging from '@react-native-firebase/messaging';
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";
import { setNewOrder, setNewShipping } from '../store/notificationSlice';
import LottieLoader from '../utils/LottieLoader';
// import { WebView } from 'react-native-webview';
import ExpiryNotificationBanner from '../helper/ExpiryNotificationBanner';
import { SafeAreaView } from 'react-native-safe-area-context';

const data = [
  { label: 'Today', value: '1' },
  { label: 'Date Wise', value: '2' },
]; 

export default function HomeScreen({  }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { data: products, status } = useSelector(state => state.products)
  const { logout } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true)
  const [value, setValue] = useState('1');
  const [isFocus, setIsFocus] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [startDay, setStartDay] = useState(null);
  const [endDay, setEndDay] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [completed, setCompleted] = useState(0);
  const [accepted, setAccepted] = useState(0);
  const [declined, setDeclined] = useState(0);
  const [rating, setRating] = useState(0);
  const [todayEarning, setTodayearning] = useState(0);
  const [noofDeliverd, setNoofDeliverd] = useState(0)
  const [todaysDate, setTodaysDate] = useState('')
  const [notificationStatus, setNotificationStatus] = useState(false)
  const [shippingNotification, setShippingNotification] = useState(false)
  const [userInfo, setuserInfo] = useState([])

  const [shippingCompleted, setShippingCompleted] = useState(0)
  const [todayShippingCompleted, setTodayShippingCompleted] = useState(0)
  const [todayShippingCompletedNo, setTodayShippingCompletedNo] = useState(0)
  const [refreshing, setRefreshing] = useState(false);
  const { hasNewOrder, hasNewShipping } = useSelector(state => state.notification);
  const [expiryRefreshTrigger, setExpiryRefreshTrigger] = useState(0);

  const fetchNewOrders = () => {
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
          userInfo.forEach(item => {
            item.batch_order_items = item.batch_order_items.filter(batch => batch.status === 'Active');
          });

          // Remove items with empty batch_order_items array
          userInfo = userInfo.filter(item => item.batch_order_items.length > 0);
          console.log(userInfo.length)
          if (userInfo.length > 0) {
            dispatch(setNewOrder(true));
          } else {
            dispatch(setNewOrder(false));
          }
          setIsLoading(false);
        })
        .catch(e => {
          console.log(`User fetch error ${e}`)
        });
    });
  }

  const fetchNewShippingOrders = () => {
    AsyncStorage.getItem('userToken', (err, usertoken) => {
      axios.post(`${process.env.API_URL}/api/driver/shipping-pending`, {}, {
        headers: {
          "Authorization": 'Bearer ' + usertoken,
          "Content-Type": 'application/json'
        },
      })
        .then(res => {
          let userInfo = res.data.response.records;
          console.log(JSON.stringify(userInfo), 'fetch new orders')
          if (userInfo.length > 0) {
            dispatch(setNewShipping(true));
          } else {
            dispatch(setNewShipping(false));
          }
          setIsLoading(false);
        })
        .catch(e => {
          console.log(`User fetch error ${e}`)
        });
    });
  }

  const getFCMToken = async () => {
    try {
      // if (Platform.OS == 'android') {
      await messaging().registerDeviceForRemoteMessages();
      // }
      const token = await messaging().getToken();
      AsyncStorage.setItem('fcmToken', token)
      console.log(token, 'fcm token');
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (Platform.OS == 'android') {
      LocationServicesDialogBox.checkLocationServicesIsEnabled({
        message: "<font color='#000'>To provide location-based services, we require your permission to access your device's location. Would you like to grant permission?</font>",
        ok: "YES",
        //cancel: "NO",

      }).then(function (success) {
        console.log(success);
      }).catch((error) => {
        console.log(error.message);
      });
    }
  }, [])

  useEffect(() => {
    getFCMToken()

    if (Platform.OS == 'android' || Platform.OS === 'ios') {
      /* this is app foreground notification */
      const unsubscribe = messaging().onMessage(async remoteMessage => {
        Alert.alert(remoteMessage?.notification.title, remoteMessage?.notification.body);
        console.log('Received background message:', JSON.stringify(remoteMessage));
        if (remoteMessage?.data?.screen === 'NewShippingOrderScreen') {
          dispatch(setNewShipping(true));
        } else if (remoteMessage?.data?.screen === 'New trip') {
          dispatch(setNewOrder(true));
        }
      });
      /* This is for handling background messages */
      messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Received background message:', remoteMessage);
        // Handle background message here
        if (remoteMessage?.data?.screen === 'NewShippingOrderScreen') {
          dispatch(setNewShipping(true));
        } else if (remoteMessage?.data?.screen === 'New trip') {
          dispatch(setNewOrder(true));
        }
      });

      return unsubscribe;
    }
  }, [])

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

  const fetchData = (getId) => {
    AsyncStorage.getItem('userToken', (err, usertoken) => {
      console.log(usertoken, 'user token')
      const option = {}
      console.log(value, 'bbbbbbbbbbb')
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
        option.to = formattedDate_for_today;
        option.from = formattedDate_for_tomorrow;
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
          option.to = formattedDate_for_today;
          option.from = formattedDate_for_tomorrow;
        } else if (value == '2') {
          option.to = startDay;
          option.from = endDay;
        }
      }

      console.log(option)
      axios.post(`${process.env.API_URL}/api/driver/order-item-status-count`, option, {
        headers: {
          "Authorization": 'Bearer ' + usertoken,
          "Content-Type": 'application/json'
        },
      })
        .then(res => {
          console.log(JSON.stringify(res.data), "response from order-item-status-count")
          if (res.data.response.status.code === 200) {
            setCompleted(res.data.response.records.completed)
            setAccepted(res.data.response.records.accepted)
            setDeclined(res.data.response.records.declined)
            setRating(res.data.response.records.total_rating)
            setNoofDeliverd(res.data.response.records.todayCompleted)
            setTodayearning(res.data.response.records.todayEarn)

            setShippingCompleted(res.data.response.records.shipping_complete)
            setTodayShippingCompleted(res.data.response.records.todayshippingCompleteEarn)
            setTodayShippingCompletedNo(res.data.response.records.todayshippingCompleted)

            const today = new Date();
            const formattedDate = formatDate(today);
            setTodaysDate(formattedDate)
            setIsLoading(false)
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

  const dateRangeSearch = () => {
    console.log(startDay)
    console.log(endDay)
    fetchData()
    toggleModal()
  }


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
          console.log(userInfo, 'user data from contact information from home screen');

          if(userInfo.userStatus == 'Inactive'){
            Alert.alert('Inactive', 'Your account is inactive. Please contact support.', [
              { text: 'OK', onPress: () => logout() },
            ]);
          }

          // Store userInfo in AsyncStorage
          AsyncStorage.setItem('userInfo', JSON.stringify(userInfo), (error) => {
            if (error) {
              console.log('Error storing userInfo:', error);
            } else {
              console.log('userInfo stored successfully');
              // Trigger expiry banner refresh after storing new data
              setExpiryRefreshTrigger(prev => prev + 1);
            }
          });

          setuserInfo(userInfo);
        })
        .catch(e => {
          console.log(`Profile error ${e}`);
        });
    });
  }

  useEffect(() => {
    fetchNewOrders()
    fetchNewShippingOrders()
    fetchData();
    fetchProfileDetails()
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      fetchNewOrders()
      fetchNewShippingOrders()
      fetchData()
      fetchProfileDetails()
      setExpiryRefreshTrigger(prev => prev + 1);
    }, [])
  )



  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setValue('1');
    fetchNewOrders()
    fetchData()
    fetchProfileDetails()
    setRefreshing(false);
  }, []);

  if (status == 'loading') {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={styles.Container}>
      <CustomHeader commingFrom={'Home'} onPress={() => navigation.navigate('Notification')} onPressProfile={() => navigation.navigate('Profile')} />
      <ExpiryNotificationBanner navigation={navigation} refreshTrigger={expiryRefreshTrigger}/>
      <ScrollView style={styles.wrapper} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#339999" colors={['#339999']} />
      }>
        {hasNewOrder ?
          <TouchableOpacity onPress={() => navigation.navigate('NewOrderScreen')}>
            <Image
              source={newOrderArrived}
              style={styles.imageStyle}
            />
          </TouchableOpacity>
          : <></>}
        {hasNewShipping ?
          <TouchableWithoutFeedback onPress={() => navigation.navigate('NewShippingOrderScreen')}>
            <Image
              source={newShippingArrived}
              style={styles.imageStyle}
            />
          </TouchableWithoutFeedback>
          : <></>}
        <View style={{ marginBottom: responsiveHeight(2) }}>
          <View style={{ marginTop: responsiveHeight(1) }}>
            <Text style={styles.dashboardHeader}>Dashboard</Text>
          </View>
          <View style={{ width: responsiveWidth(40), position: 'absolute', top: -10, right: 0, padding: 10 }}>
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
                //setValue(item.value);
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, marginBottom: 10 }}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Shipping', {
                  screen: 'OrderShippingScreen',
                  params: { pageFrom: 'completedShipping' },
                })
              }
            >
              <View style={styles.firstCardViewSingle}>
                <View style={{ height: 50, width: 50, borderRadius: 50 / 2, backgroundColor: '#FF8C45', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={styles.secondCardSubText}>{shippingCompleted}</Text>
                </View>
                {/* <WebView
  originWhitelist={['*']}
  source={{ html: `<img src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExMmhtZGpyczViZzZkOXJvcXRycHFjNjZkMDVlMTQya2I2bWZ1dXp0eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/duzpaTbCUy9Vu/giphy.gif" style="width:100%;height:100%;" />` }}
  style={{ width: 200, height: 200 }}
/> */}
                <Text style={styles.firstCardTextSingle}>Completed Shipping Orders</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, marginBottom: 10 }}>
            {/* <TouchableOpacity onPress={() => navigation.navigate('OrderScreen', { pageFrom: 'completed' })}> */}
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Orders', {
                  screen: 'OrderScreen',
                  params: { pageFrom: 'Completed' },
                })
              }
            >
              <View style={styles.firstCardView}>
                <View style={{ height: 50, width: 50, borderRadius: 50 / 2, backgroundColor: '#339999', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={styles.secondCardSubText}>{completed}</Text>
                </View>
                <Text style={styles.firstCardText}>Completed Orders</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Orders', {
                  screen: 'OrderScreen',
                  params: { pageFrom: 'Declined' },
                })
              }
            >
              <View style={styles.firstCardView}>
                <View style={{ height: 50, width: 50, borderRadius: 50 / 2, backgroundColor: '#EB0000', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={styles.secondCardSubText}>{declined}</Text>
                </View>
                <Text style={styles.secondCardText}>Declined Orders</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 10 }}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Orders', {
                  screen: 'OrderScreen',
                  params: { pageFrom: 'Accepted' },
                })
              }
            >
              <View style={styles.firstCardView}>
                <View style={{ height: 50, width: 50, borderRadius: 50 / 2, backgroundColor: '#3F709E', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={styles.secondCardSubText}>{accepted}</Text>
                </View>
                <Text style={styles.thirdCardText}>Accepted Orders</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.firstCardView}>
              <View style={{ height: 50, width: 50, borderRadius: 50 / 2, backgroundColor: '#FFCB45', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                <Text style={styles.secondCardSubText}>{rating}</Text>
              </View>
              <Text style={styles.forthCardText}>Rating</Text>
            </View>

          </View>
          <View
            style={{
              marginVertical: 10,
              borderBottomColor: '#F3F3F3',
              borderBottomWidth: StyleSheet.hairlineWidth + 3,
            }}
          />
        </View>
        <View style={{ marginTop: responsiveHeight(1) }}>
          <Text style={styles.dashboardHeader}>Earnings for Today</Text>
        </View>
        <View style={styles.earningCardView}>
          <Text style={[styles.earningCardText, { marginBottom: responsiveHeight(1) }]}>{todaysDate}</Text>
          <View
            style={{
              marginVertical: 10,
              borderBottomColor: '#dadada',
              borderBottomWidth: StyleSheet.hairlineWidth + 1,
            }}
          />
          <Text style={styles.earningCardheader}>Marketplace Orders</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
            <Text style={styles.earningCardTextAmount}>₵{todayEarning}</Text>
            <View style={styles.verticleLine}></View>
            <Text style={styles.earningCardTextNo}>{noofDeliverd} Order Delivered</Text>
          </View>
          <View
            style={{
              marginVertical: 10,
              borderBottomColor: '#dadada',
              borderBottomWidth: StyleSheet.hairlineWidth + 1,
            }}
          />
          <Text style={styles.earningCardheader}>Shipping Orders</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
            <Text style={styles.earningCardTextAmount}>₵{todayShippingCompleted}</Text>
            <View style={styles.verticleLine}></View>
            <Text style={styles.earningCardTextNo}>{todayShippingCompletedNo} Order Delivered</Text>
          </View>
        </View>

      </ScrollView>
      <Modal
        isVisible={isModalVisible}
        style={{
          margin: 0, // Add this line to remove the default margin
          justifyContent: 'flex-end',
        }}>
        <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', height: 50, width: 50, borderRadius: 25, position: 'absolute', bottom: '75%', left: '45%', right: '45%' }}>
          <Icon name="cross" size={30} color="#900" onPress={toggleModal} />
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
      <LottieLoader 
        visible={isLoading} 
        size={100}
      />
    </SafeAreaView>
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
    //marginBottom: responsiveHeight(12)
  },
  dashboardHeader: {
    color: '#2F2F2F',
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(2.5)
  },
  dropdown: {
    height: responsiveHeight(4),
    borderColor: 'gray',
    borderWidth: 0.7,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginTop: 5
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
  imageStyle: {
    height: responsiveHeight(7),
    width: responsiveWidth(89),
    marginBottom: responsiveHeight(2),
    resizeMode: 'contain',
    alignItems: 'center'
  },
  earningCardView: {
    height: responsiveHeight(29),
    width: responsiveWidth(89),
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    flexDirection: 'column',
    //alignItems: 'center',
    //justifyContent: 'center',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(15),
    padding: 20
  },
  firstCardViewSingle: {
    height: responsiveHeight(20),
    width: responsiveWidth(89),
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#E0E0E0',
    borderWidth: 1
  },
  firstCardTextSingle: {
    color: '#FF8C45',
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(2)
  },
  firstCardView: {
    height: responsiveHeight(23),
    width: responsiveWidth(42),
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#E0E0E0',
    borderWidth: 1
  },
  firstCardText: {
    color: '#339999',
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(2)
  },
  firstCardSubText: {
    color: '#9C9C9C',
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(1.5)
  },
  secondCardView: {
    height: responsiveHeight(25),
    width: responsiveWidth(42),
    backgroundColor: '#DEFFED',
    borderRadius: 8,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  secondCardText: {
    color: '#EB0000',
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(2)
  },
  thirdCardText: {
    color: '#3F709E',
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(2)
  },
  forthCardText: {
    color: '#FFCB45',
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(2)
  },
  secondCardSubText: {
    color: '#FFFFFF',
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(2)
  },
  earningCardText: {
    color: '#2F2F2F',
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(2)
  },
  earningCardheader: {
    color: '#909090',
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(2)
  },
  earningCardTextAmount: {
    color: '#2F2F2F',
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(3),
    marginRight: 10
  },
  verticleLine: {
    height: '100%',
    width: 1,
    backgroundColor: '#909090',
  },
  earningCardTextNo: {
    color: '#2F2F2F',
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(2),
    marginLeft: 10
  },
  iconImage: {
    width: 22,
    height: 22,
    resizeMode: 'contain'
  },
  warningPopup: {
    backgroundColor: '#FFCB45',
    height: responsiveHeight(9),
    width: responsiveWidth(89),
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    //justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20
  },
  warningPopupView: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    height: responsiveHeight(5),
    width: responsiveWidth(20),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10
  },
  warningPopupText: {
    color: '#2F2F2F',
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(2),
    marginRight: responsiveWidth(15)
  },
  warningPopupViewText: {
    color: '#2E2E2E',
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(2)
  }


});