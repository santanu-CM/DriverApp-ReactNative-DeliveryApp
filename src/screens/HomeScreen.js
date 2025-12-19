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
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
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
import { allUserImg, chatImg, chatImgRed, documentImg, homeAcceptedOrderImg, homeCompletedOrderImg, homeCompleteShippingImg, homeDateImg, homeDeclinedOrderImg, homeMarketplaceOrderImg, homeMoneyImg, homeOverviewImg, homeRatingImg, homeShippingOrdersImg, infoImg, newOrderArrived, newShippingArrived, requestImg, userPhoto } from '../utils/Images';
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

export default function HomeScreen({ }) {
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
          let userInfo = res.data.response.records.shipments;
          console.log(JSON.stringify(userInfo), 'fetch new shipping orders')
          if (userInfo) {
            dispatch(setNewShipping(true));
          } else {
            dispatch(setNewShipping(false));
          }
          setIsLoading(false);
        })
        .catch(e => {
          console.log(`User fetch error fetchNewShippingOrders ${e}`)
        });
    });
  }

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing shipping orders');
      fetchNewShippingOrders(); 
    }, 2 * 60 * 1000); // 2 minutes in milliseconds

    return () => clearInterval(interval);
  }, []);

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
          if (userInfo.status == 'Pending') {
            // Check if popup has been shown before
            AsyncStorage.getItem('documentUploadPopupShown', (err, shown) => {
              if (!shown) {
                Alert.alert('Action Required', 'Please Upload your documents to activate your account.', [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Mark popup as shown
                      AsyncStorage.setItem('documentUploadPopupShown', 'true');
                      navigation.navigate('PROFILE', { screen: 'EditDocuments' });
                    }
                  },
                ]);
              }
            });
          } else {
            // Reset the flag if status is not Pending (e.g., Active, Approved, etc.)
            AsyncStorage.removeItem('documentUploadPopupShown');
          }

          if (userInfo.userStatus == 'Inactive') {
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
    //fetchProfileDetails()
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
      <ExpiryNotificationBanner navigation={navigation} refreshTrigger={expiryRefreshTrigger} />
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveHeight(1), paddingRight: 5 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10, gap: 10 }}>
              <Image source={homeOverviewImg} style={styles.iconImage} />
              <Text style={styles.dashboardHeader}>Overview</Text>
            </View>
            <View style={{ width: 100 }}>
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
          </View>
          <View style={{ marginTop: 15, marginBottom: 10 }}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Shipping', {
                  screen: 'OrderShippingScreen',
                  params: { pageFrom: 'completedShipping' },
                })
              }
            >
              <View style={styles.firstCardViewSingle}>
                <View style={[styles.cardLeftAccent, { backgroundColor: '#FF8C45' }]} />
                <View style={[styles.cardGlowEffect, { backgroundColor: 'rgba(255, 140, 69, 0.1)' }]} />
                {/* <View style={[styles.cardGlowEffectLeft, { backgroundColor: 'rgba(255, 140, 69, 0.08)' }]} /> */}
                <View style={[styles.cardGlowEffectBottom, { backgroundColor: 'rgba(255, 140, 69, 0.06)' }]} />
                <View style={styles.cardIconContainerNew}>
                  <Image source={homeCompleteShippingImg} style={styles.cardIconNew} />
                </View>
                <View style={styles.cardContentNew}>
                  <Text style={styles.cardTitleNew}>Completed Shipping</Text>
                  <Text style={styles.cardSubtitleNew}>View completed orders</Text>
                </View>
                <View style={styles.cardNumberContainer}>
                  <Text style={styles.cardNumberNew}>{shippingCompleted}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, marginBottom: 10 }}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Orders', {
                  screen: 'OrderScreen',
                  params: { pageFrom: 'Completed' },
                })
              }
              style={styles.cardTouchable}
            >
              <View style={styles.firstCardView}>
                <View style={[styles.cardLeftAccent, { backgroundColor: '#10B981' }]} />
                <View style={[styles.cardGlowEffectSmall, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]} />
                {/* <View style={[styles.cardGlowEffectSmallLeft, { backgroundColor: 'rgba(16, 185, 129, 0.08)' }]} /> */}
                <View style={[styles.cardGlowEffectSmallBottom, { backgroundColor: 'rgba(16, 185, 129, 0.06)' }]} />
                <View style={styles.cardIconFloating}>
                  <Image source={homeCompletedOrderImg} style={styles.cardIconNew2} />
                </View>
                <View style={styles.cardNumberBadge}>
                  <Text style={styles.cardNumberBadgeText}>{completed}</Text>
                </View>
                <View style={styles.cardContentCentered}>
                  <Text style={styles.cardTitleWhite}>Completed</Text>
                  <Text style={styles.cardSubtitleWhite}>Orders</Text>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Orders', {
                  screen: 'OrderScreen',
                  params: { pageFrom: 'Declined' },
                })
              }
              style={styles.cardTouchable}
            >
              <View style={styles.firstCardView}>
                <View style={[styles.cardLeftAccent, { backgroundColor: '#EF4444' }]} />
                <View style={[styles.cardGlowEffectSmall, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]} />
                {/* <View style={[styles.cardGlowEffectSmallLeft, { backgroundColor: 'rgba(239, 68, 68, 0.08)' }]} /> */}
                <View style={[styles.cardGlowEffectSmallBottom, { backgroundColor: 'rgba(239, 68, 68, 0.06)' }]} />
                <View style={styles.cardIconFloating}>
                <Image source={homeDeclinedOrderImg} style={styles.cardIconNew2} />
                </View>
                <View style={styles.cardNumberBadge}>
                  <Text style={styles.cardNumberBadgeText}>{declined}</Text>
                </View>
                <View style={styles.cardContentCentered}>
                  <Text style={styles.cardTitleWhite}>Declined</Text>
                  <Text style={styles.cardSubtitleWhite}>Orders</Text>
                </View>
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
              style={styles.cardTouchable}
            >
              <View style={styles.firstCardView}>
                <View style={[styles.cardLeftAccent, { backgroundColor: '#3B82F6' }]} />
                <View style={[styles.cardGlowEffectSmall, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]} />
                {/* <View style={[styles.cardGlowEffectSmallLeft, { backgroundColor: 'rgba(59, 130, 246, 0.08)' }]} /> */}
                <View style={[styles.cardGlowEffectSmallBottom, { backgroundColor: 'rgba(59, 130, 246, 0.06)' }]} />
                <View style={styles.cardIconFloating}>
                  <Image source={homeAcceptedOrderImg} style={styles.cardIconNew3} />
                </View>
                <View style={styles.cardNumberBadge}>
                  <Text style={styles.cardNumberBadgeText}>{accepted}</Text>
                </View>
                <View style={styles.cardContentCentered}>
                  <Text style={styles.cardTitleWhite}>Accepted</Text>
                  <Text style={styles.cardSubtitleWhite}>Orders</Text>
                </View>
              </View>
            </TouchableOpacity>
            <View style={styles.firstCardView}>
              <View style={[styles.cardLeftAccent, { backgroundColor: '#F59E0B' }]} />
              <View style={[styles.cardGlowEffectSmall, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]} />
              {/* <View style={[styles.cardGlowEffectSmallLeft, { backgroundColor: 'rgba(245, 158, 11, 0.08)' }]} /> */}
              <View style={[styles.cardGlowEffectSmallBottom, { backgroundColor: 'rgba(245, 158, 11, 0.06)' }]} />
              <View style={styles.cardIconFloating}>
                <Image source={homeRatingImg} style={styles.cardIconNew3} />
              </View>
              <View style={styles.cardNumberBadge}>
                <Text style={styles.cardNumberBadgeText}>{rating}</Text>
              </View>
              <View style={styles.cardContentCentered}>
                <Text style={styles.cardTitleWhite}>Rating</Text>
                <Text style={styles.cardSubtitleWhite}>Average</Text>
              </View>
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
        <View style={{ marginTop: responsiveHeight(2) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10, gap: 10 }}>
            <Image source={homeMoneyImg} style={styles.iconImage} />
            <Text style={styles.dashboardHeader}>Today's Earnings</Text>
          </View>
        </View>
        <LinearGradient
          colors={['#FFFFFF', '#F8FAFC', '#F1F5F9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.earningCardView}
        >
          <View style={styles.earningCardGlow} />
          <View style={styles.earningCardHeader}>
            <View style={styles.earningHeaderIcon}>
              <Image source={homeDateImg} style={styles.earningIcon} />
            </View>
            <Text style={styles.earningCardDate}>{todaysDate}</Text>
          </View>
          
          <View style={styles.earningSection}>
            <View style={[styles.cardLeftAccent, { backgroundColor: '#10B981' }]} />
            <View style={[styles.earningGlowEffect, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]} />
            {/* <View style={[styles.earningGlowEffectLeft, { backgroundColor: 'rgba(16, 185, 129, 0.08)' }]} /> */}
            <View style={[styles.earningGlowEffectBottom, { backgroundColor: 'rgba(16, 185, 129, 0.06)' }]} />
            <View style={styles.earningSectionContent}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10, gap: 10 }}>
                <Image source={homeMarketplaceOrderImg} style={styles.cardIconNew4} />
                <Text style={styles.earningCardheader}>Marketplace Orders</Text>
              </View>
              <View style={styles.earningRow}>
                <View style={styles.amountContainer}>
                  <Text style={styles.currencySymbol}>₵</Text>
                  <Text style={styles.earningCardTextAmount}>{todayEarning}</Text>
                </View>
                <View style={styles.verticleLine}></View>
                <View style={styles.deliveryContainer}>
                  <Text style={styles.deliveryNumber}>{noofDeliverd}</Text>
                  <Text style={styles.deliveryText}>Orders Delivered</Text>
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.earningSection}>
            <View style={[styles.cardLeftAccent, { backgroundColor: '#3B82F6' }]} />
            <View style={[styles.earningGlowEffect, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]} />
            {/* <View style={[styles.earningGlowEffectLeft, { backgroundColor: 'rgba(59, 130, 246, 0.08)' }]} /> */}
            <View style={[styles.earningGlowEffectBottom, { backgroundColor: 'rgba(59, 130, 246, 0.06)' }]} />
            <View style={styles.earningSectionContent}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10, gap: 10 }}>
                <Image source={homeShippingOrdersImg} style={styles.cardIconNew4} />
                <Text style={styles.earningCardheader}>Shipping Orders</Text>
              </View>
              <View style={styles.earningRow}>
                <View style={styles.amountContainer}>
                  <Text style={styles.currencySymbol}>₵</Text>
                  <Text style={styles.earningCardTextAmount}>{todayShippingCompleted}</Text>
                </View>
                <View style={styles.verticleLine}></View>
                <View style={styles.deliveryContainer}>
                  <Text style={styles.deliveryNumber}>{todayShippingCompletedNo}</Text>
                  <Text style={styles.deliveryText}>Orders Delivered</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

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

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: responsiveHeight(1)
  },
  wrapper: {
    padding: 20,
    //marginBottom: responsiveHeight(12)
  },
  dashboardHeader: {
    color: '#1E293B',
    fontFamily: 'Outfit-SemiBold',
    fontSize: responsiveFontSize(2.8),
    
  },
  dropdown: {
    height: responsiveHeight(4.2),
    borderColor: '#E2E8F0',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 6,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    width: 100,
  },
  placeholderStyle: {
    fontSize: responsiveFontSize(1.5),
    color: '#64748B',
    fontFamily: 'Outfit-Medium'
  },
  selectedTextStyle: {
    fontSize: responsiveFontSize(1.5),
    color: '#1E293B',
    fontFamily: 'Outfit-SemiBold'
  },
  inputSearchStyle: {
    height: 40,
    fontSize: responsiveFontSize(1.8),
    color: '#1E293B',
    fontFamily: 'Outfit-Medium'
  },
  imageStyle: {
    height: responsiveHeight(7),
    width: responsiveWidth(89),
    marginBottom: responsiveHeight(2),
    resizeMode: 'contain',
    alignItems: 'center'
  },
  earningCardView: {
    width: responsiveWidth(89),
    borderRadius: 20,
    flexDirection: 'column',
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(15),
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    position: 'relative',
  },
  earningCardGlow: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  firstCardViewSingle: {
    height: responsiveHeight(18),
    width: responsiveWidth(89),
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  cardGlowEffect: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  cardGlowEffectLeft: {
    position: 'absolute',
    top: 20,
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cardGlowEffectBottom: {
    position: 'absolute',
    bottom: -40,
    right: 20,
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cardGlowEffectSmall: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  cardGlowEffectSmallLeft: {
    position: 'absolute',
    top: 10,
    left: -25,
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  cardGlowEffectSmallBottom: {
    position: 'absolute',
    bottom: -25,
    right: 10,
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  earningGlowEffect: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  earningGlowEffectLeft: {
    position: 'absolute',
    top: 10,
    left: -25,
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  earningGlowEffectBottom: {
    position: 'absolute',
    bottom: -25,
    right: 15,
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  cardLeftAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  cardIconContainerNew: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  iconGradientBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardIconContainerSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 8,
  },
  cardIconNew: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  cardIconFloating: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  floatingIcon: {
    fontSize: responsiveFontSize(1.6),
  },
  cardNumberBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 40,
    alignItems: 'center',
  },
  cardNumberBadgeText: {
    color: '#1E293B',
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(1.6),
  },
  cardContentCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 8,
  },
  cardTitleWhite: {
    color: '#1E293B',
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(2),
    textAlign: 'center',
    marginBottom: 2,
  },
  cardSubtitleWhite: {
    color: '#64748B',
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(1.4),
    textAlign: 'center',
  },
  cardIconSmall: {
    fontSize: responsiveFontSize(1.8),
  },
  cardContentNew: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 60,
  },
  cardContentSmall: {
    flex: 1,
    marginTop: 12,
    alignItems: 'center',
  },
  cardContentSmallNoIcon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitleNew: {
    color: '#1E293B',
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(2.4),
    marginBottom: 4,
  },
  cardTitleGradient: {
    color: '#FFFFFF',
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(2.2),
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardTitleSmall: {
    color: '#1E293B',
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(1.8),
    marginBottom: 4,
    textAlign: 'center',
  },
  cardSubtitleNew: {
    color: '#64748B',
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(1.6),
  },
  cardSubtitleSmall: {
    color: '#64748B',
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(1.4),
    textAlign: 'center',
  },
  cardNumberContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 50,
    alignItems: 'center',
  },
  cardNumberContainerSmall: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  cardNumberNew: {
    color: '#1E293B',
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(2.2),
  },
  cardNumberSmall: {
    color: '#1E293B',
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(1.8),
  },
  firstCardTextSingle: {
    color: '#FFFFFF',
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(2.5),
    marginBottom: 4,
  },
  cardSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(1.8),
  },
  firstCardView: {
    height: Platform.OS === 'ios' ? responsiveHeight(18) : responsiveHeight(19),
    width: responsiveWidth(42),
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  cardPattern: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardIconContainerSmall: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardNumber: {
    color: '#FFFFFF',
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(3.5),
    marginBottom: 4,
  },
  cardSubtitleSmall: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(1.4),
    textAlign: 'center',
  },
  cardTouchable: {
    borderRadius: 16,
  },
  cardIconContainer: {
    height: 60,
    width: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardIconText: {
    color: '#FFFFFF',
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(2.5),
  },
  firstCardText: {
    color: '#FFFFFF',
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(1.8),
    textAlign: 'center',
    marginTop: 4,
  },
  firstCardSubText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(1.4)
  },
  secondCardView: {
    height: responsiveHeight(25),
    width: responsiveWidth(42),
    backgroundColor: '#DEFFED',
    borderRadius: 16,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  secondCardText: {
    color: '#FFFFFF',
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(1.8),
    textAlign: 'center',
    marginTop: 4,
  },
  thirdCardText: {
    color: '#FFFFFF',
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(1.8),
    textAlign: 'center',
    marginTop: 4,
  },
  forthCardText: {
    color: '#FFFFFF',
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(1.8),
    textAlign: 'center',
    marginTop: 4,
  },
  secondCardSubText: {
    color: '#FFFFFF',
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(2)
  },
  earningCardHeader: {
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  earningHeaderIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  earningIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  earningCardDate: {
    color: '#1E293B',
    fontFamily: 'Outfit-SemiBold',
    fontSize: responsiveFontSize(2.2),
    flex: 1,
  },
  earningSection: {
    marginVertical: 8,
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  earningSectionContent: {
    position: 'relative',
    zIndex: 1,
  },
  earningCardheader: {
    color: '#1E293B',
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(1.8),
    //marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  earningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flex: 1,
  },
  currencySymbol: {
    color: '#10B981',
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(2.5),
    marginRight: 4,
  },
  earningCardTextAmount: {
    color: '#1E293B',
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(3.5),
  },
  verticleLine: {
    height: 40,
    width: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
  deliveryContainer: {
    alignItems: 'center',
    flex: 1,
  },
  deliveryNumber: {
    color: '#1E293B',
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(2.8),
  },
  deliveryText: {
    color: '#64748B',
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(1.6),
    textAlign: 'center',
  },
  divider: {
    height: 2,
    backgroundColor: 'rgba(226, 232, 240, 0.3)',
    marginVertical: 16,
    borderRadius: 1,
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
  },
  cardIconNew2: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  }, 
  cardIconNew3:{
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  cardIconNew4:{
    width: 20,
    height: 20,
    resizeMode: 'contain',
  }

});