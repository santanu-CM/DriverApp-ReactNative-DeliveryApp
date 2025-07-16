import React, { useState, useContext, useEffect, useCallback } from 'react'
import { View, Text, SafeAreaView, StyleSheet, ScrollView, Image, TouchableOpacity, PermissionsAndroid, Dimensions, RefreshControl, Platform, Alert } from 'react-native'
import * as Animatable from 'react-native-animatable';
import CustomHeader from '../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TextInput, LongPressGestureHandler, State, TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { addressWhiteImg, dubbleArrowImg, downloadImg, searchImg, userPhoto, dateIconImg, alertIconImg } from '../utils/Images'
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
import EIcon from 'react-native-vector-icons/Entypo';
import { useNavigation } from '@react-navigation/native';
import GetLocation from 'react-native-get-location'
import Toast from 'react-native-toast-message';
import RNFetchBlob from 'rn-fetch-blob';
import Modal from "react-native-modal";
import StarRating from 'react-native-star-rating-widget';
import InputField from '../components/InputField';

const screen = Dimensions.get('window');
const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE_DELTA = 0.04;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const Accepted = () => {
  const navigation = useNavigation();
  const [activeSections, setActiveSections] = useState([]);
  const [collapsed, setCollapsed] = useState(true);
  const [getFaq, setFaq] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [allAcceptedShipmentList, setAllAcceptedShipmentList] = useState([])
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNewOrders()
    setRefreshing(false);
  }, []);

  const fetchNewOrders = () => {
    AsyncStorage.getItem('userToken', (err, usertoken) => {
      axios.post(`${process.env.API_URL}/api/driver/shipping-accept`, {}, {
        headers: {
          "Authorization": 'Bearer ' + usertoken,
          "Content-Type": 'application/json'
        },
      })
        .then(res => {
          let userInfo = res.data.response.records;
          console.log(JSON.stringify(userInfo), 'fetch approve shipment');
          setAllAcceptedShipmentList(userInfo)
          setIsLoading(false);
        })
        .catch(e => {
          console.log(`all-approve-shipment-list error ${e}`)
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
  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <ScrollView style={styles.wrapper} refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#339999" colors={['#339999']} />
    }>
      <View style={{ marginBottom: responsiveHeight(12) }}>
        {allAcceptedShipmentList?.length > 0 ? (
          allAcceptedShipmentList?.map((item, index) => (
            <TouchableWithoutFeedback onPress={() => navigation.navigate('ShippingOrderDetails', { "details": item })}>
              <View style={styles.table}>
                <View style={styles.tableRow1}>
                  <View style={styles.cellmain}>
                    <Text style={styles.tableHeader1}>Shipping ID :</Text>
                    <Text style={styles.tableHeader2}> {item?.shipping_id}</Text>
                  </View>
                  <View style={[styles.cellmain, { justifyContent: 'flex-end' }]}>
                    <Image
                      source={alertIconImg}
                      style={{ height: 18, width: 18, marginRight: 5, resizeMode: 'contain' }}
                    />
                    <Text style={styles.shippingViewHeader}>Accepted</Text>
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
                  </>
                </View>
                {/* <View style={styles.tableFooterRow1}>
                  <View style={styles.cellFootermain}>
                    <TouchableOpacity onPress={() => fetchInvoice(item?.order_id)}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: responsiveWidth(40) }}>
                        <Text style={{ color: '#000000', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), marginRight: 5 }}>Track this Shipment</Text>
                        <Image source={dubbleArrowImg} style={styles.iconImage} tintColor={'#000000'} />
                      </View>
                    </TouchableOpacity>
                  </View>
                </View> */}
              </View>
            </TouchableWithoutFeedback>
          ))
        ) : (
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <Text style={styles.noOrderText}>No Accepted shipments available.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};
// const Declined = () => {
//   const navigation = useNavigation();
//   const [activeSections, setActiveSections] = useState([]);
//   const [collapsed, setCollapsed] = useState(true);
//   const [getFaq, setFaq] = useState([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [allPendingShipmentList, setAllPendingShipmentList] = useState([])
//   const [refreshing, setRefreshing] = useState(false);

//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     fetchNewOrders()
//     setRefreshing(false);
//   }, []);

//   const fetchNewOrders = () => {
//     AsyncStorage.getItem('userToken', (err, usertoken) => {
//       axios.get(`${process.env.API_URL}/api/driver/get-all-order-item`, {
//         headers: {
//           "Authorization": 'Bearer ' + usertoken,
//           "Content-Type": 'application/json'
//         },
//       })
//         .then(res => {
//           let userInfo = res.data.response.records;
//           console.log(JSON.stringify(userInfo), 'fetch pending shipment');
//           setAllPendingShipmentList(userInfo)
//           setIsLoading(false);
//         })
//         .catch(e => {
//           console.log(`all-pending-shipment-list error ${e}`)
//         });
//     });
//   }
//   useEffect(() => {
//     fetchNewOrders()
//   }, [])
//   useFocusEffect(
//     React.useCallback(() => {
//       fetchNewOrders()
//     }, [])
//   )

//   if (isLoading) {
//     return (
//       <Loader />
//     )
//   }

//   return (
//     <ScrollView style={styles.wrapper} refreshControl={
//       <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#339999" colors={['#339999']} />
//     }>
//       <View style={{ marginBottom: responsiveHeight(12) }}>
//         {allPendingShipmentList?.length > 0 ? (
//           allPendingShipmentList?.map((item, index) => (
//             <View style={styles.table}>
//               <View style={styles.tableRow1}>
//                 <View style={styles.cellmain}>
//                   <Text style={styles.tableHeader1}>Ship ID :</Text>
//                   <Text style={styles.tableHeader2}> {item?.shipping_id}</Text>
//                 </View>
//                 <View style={[styles.cellmain, { justifyContent: 'flex-end' }]}>
//                   <Image
//                     source={alertIconImg}
//                     style={{ height: 18, width: 18, marginRight: 5, resizeMode: 'contain' }}
//                   />
//                   <Text style={styles.shippingViewHeader}>Pending Approval</Text>
//                 </View>
//               </View>
//               <View style={{ padding: 10 }}>
//                 <>
//                   <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
//                     <Text style={styles.locationheader}>Pickup Location :</Text>
//                     <View style={{ flexDirection: 'row' }}>
//                       <Image
//                         source={dateIconImg}
//                         style={{ height: 18, width: 18, marginRight: 5 }}
//                       />
//                       <Text style={styles.dateText}>{item?.pickup_location?.pickup_date}</Text>
//                     </View>
//                   </View>
//                   <View style={{ justifyContent: 'center', }}>
//                     <Text style={styles.nameText}>{item?.pickup_location?.shipping_for == 'for_myself' ? item?.pickup_location?.shipper_name : item?.pickup_location?.sender_name}</Text>
//                     <Text style={styles.iconText}>{item?.pickup_location?.pickup_location}</Text>
//                   </View>
//                   <View
//                     style={{
//                       marginVertical: 10,
//                       borderBottomColor: '#F3F3F3',
//                       borderBottomWidth: StyleSheet.hairlineWidth + 3,
//                     }}
//                   />
//                 </>
//                 <>
//                   <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
//                     <Text style={styles.locationheader}>Delivery Location :</Text>
//                     <View style={{ flexDirection: 'row' }}>
//                       <Image
//                         source={dateIconImg}
//                         style={{ height: 18, width: 18, marginRight: 5 }}
//                       />
//                       <Text style={styles.dateText}>{item?.delivery_location?.delivery_date}</Text>
//                     </View>
//                   </View>
//                   <View style={{ justifyContent: 'center', }}>
//                     <Text style={styles.nameText}>{item?.delivery_location?.recipient_name}</Text>
//                     <Text style={styles.iconText}>{item?.delivery_location?.delivery_location}</Text>
//                   </View>
//                 </>

//               </View>
//             </View>
//           ))
//         ) : (
//           <View style={{ alignItems: 'center', marginTop: 20 }}>
//             <Text style={{ fontSize: 16, color: '#999' }}>No Declined shipments available.</Text>
//           </View>
//         )}
//       </View>
//     </ScrollView>
//   );
// };
const Completed = () => {
  const navigation = useNavigation();
  const [activeSections, setActiveSections] = useState([]);
  const [collapsed, setCollapsed] = useState(true);
  const [getFaq, setFaq] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isReviewModalVisible, setReviewModalVisible] = useState(false);
  const [starCount, setStarCount] = useState(4)
  const [address, setaddress] = useState('');
  const [addressError, setaddressError] = useState('')
  const [allCompletedShipmentList, setAllCompletedShipmentList] = useState([])
  const [refreshing, setRefreshing] = useState(false);
  const [updateIdForReview, setupdateIdForReview] = useState(null)

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNewOrders()
    setRefreshing(false);
  }, []);

  const toggleReviewModal = (id) => {
    setReviewModalVisible(!isReviewModalVisible);
    setupdateIdForReview(id)
  };


  const fetchNewOrders = () => {
    AsyncStorage.getItem('userToken', (err, usertoken) => {
      axios.post(`${process.env.API_URL}/api/driver/shipping-completed`, {}, {
        headers: {
          "Authorization": 'Bearer ' + usertoken,
          "Content-Type": 'application/json'
        },
      })
        .then(res => {
          let userInfo = res.data.response.records;
          console.log(JSON.stringify(userInfo), 'fetch complete shipment');
          setAllCompletedShipmentList(userInfo)
          setIsLoading(false);
        })
        .catch(e => {
          console.log(`all-complete-shipment-list error ${e}`)
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
  const submitReview = () => {
    // console.log(starCount)
    // console.log(address)
    const option = {
      "shipper_profile_id": updateIdForReview,
      "rate": starCount,
      "review": address
    }
    AsyncStorage.getItem('userToken', (err, usertoken) => {
      setIsLoading(true)
      axios.post(`${process.env.API_URL}/api/driver/add-shipment-rate`, option, {
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
  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <ScrollView style={styles.wrapper} refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#339999" colors={['#339999']} />
    }>
      <View style={{ marginBottom: responsiveHeight(12) }}>
        {allCompletedShipmentList?.length > 0 ? (
          allCompletedShipmentList.map((item, index) => (
            <View style={styles.table}>
              <View style={styles.tableRow1}>
                <View style={styles.cellmain}>
                  <Text style={styles.tableHeader1}>Shipping ID :</Text>
                  <Text style={styles.tableHeader2}> {item?.shipping_id}</Text>
                </View>
                <View style={[styles.cellmain, { justifyContent: 'flex-end' }]}>
                  <Image
                    source={alertIconImg}
                    style={{ height: 18, width: 18, marginRight: 5, resizeMode: 'contain' }}
                  />
                  <Text style={styles.shippingViewHeader}>Completed</Text>
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
                    <Text style={styles.nameText}>{item?.pickup_location?.shipping_for == 'for_myself' ? item?.pickup_location?.shipper_name : item?.pickup_location?.sender_name}</Text>
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
                </>
              </View>
              <View style={styles.tableFooterRow2}>
                <View style={styles.cellFootermain}>

                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: responsiveWidth(40) }}>
                    <Text style={{ color: '#339999', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(1.8), marginRight: 5 }}>Total Payment :</Text>
                    <Text style={{ color: '#3A3232', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(1.8), marginRight: 5 }}>${item?.other?.total_amount}</Text>
                  </View>

                  {/* <View style={styles.verticleLine}></View>
                  <TouchableOpacity onPress={() => {
                    setaddress('')
                    toggleReviewModal(item?.id)
                  }
                    }>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: responsiveWidth(40) }}>
                      <Text style={{ color: '#3F709E', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(1.8), marginRight: 5 }}>Rate this Shipment</Text>
                      <Image source={dubbleArrowImg} style={styles.iconImage} tintColor={'#3F709E'} />
                    </View>
                  </TouchableOpacity> */}
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <Text style={styles.noOrderText}>No completed shipments available.</Text>
          </View>
        )}
        {/* Review modal */}
        <Modal
          isVisible={isReviewModalVisible}
          style={{
            margin: 0, // Add this line to remove the default margin
            justifyContent: 'flex-end',
          }}>
          <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', height: 50, width: 50, borderRadius: 25, position: 'absolute', bottom: '65%', left: '45%', right: '45%' }}>
            <EIcon name="cross" size={30} color="#000" onPress={toggleReviewModal} />
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
                  onChange={(rating) => setStarCount(rating)}
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
      </View>
    </ScrollView>
  );
};

const renderScene = SceneMap({
  first: Accepted,
  //second: Declined,
  second: Completed
});

const OrderShippingScreen = ({ route }) => {
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);
  const [userInfo, setuserInfo] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const pageIndexMap = {
    completedShipping: 1,
    AcceptedShipping: 0,
  };
  const [index, setIndex] = React.useState(pageIndexMap[route?.params?.pageFrom] || 0);
  const [routes] = React.useState([
    { key: 'first', title: 'Accepted' },
    //{ key: 'second', title: 'Declined' },
    { key: 'second', title: 'Completed' },

  ]);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: '#339999', marginHorizontal: responsiveWidth(12), width: responsiveWidth(25), }}
      style={{ backgroundColor: '#FFFFFF', }}
      labelStyle={{ textTransform: 'capitalize', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(1.6) }}
      activeColor='#339999'
      inactiveColor='#9FA4A8'
    />
  );

  // Add this useEffect to handle tab changes
  useEffect(() => {
    if (route?.params?.pageFrom) {
      const newIndex = pageIndexMap[route.params.pageFrom];
      if (newIndex !== undefined) {
        setIndex(newIndex);
      }
    }
  }, [route?.params?.pageFrom]);

  useFocusEffect(
    React.useCallback(() => {
      if (route?.params?.pageFrom) {
        const newIndex = pageIndexMap[route.params.pageFrom];
        if (newIndex !== undefined) {
          setIndex(newIndex);
        }
      }
    }, [route?.params?.pageFrom])
  )

  useEffect(() => {
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 60000,
    })
      .then(location => {
        console.log(location);
      })
      .catch(error => {
        const { code, message } = error;
        console.warn(code, message);
      })
  }, [])
  useFocusEffect(
    React.useCallback(() => {
    }, [])
  )

  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={styles.Container}>
      <CustomHeader commingFrom={'Shipping Orders'} onPress={() => navigation.goBack()} title={'Shipping Orders'} />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }} // Use fixed width
      />
    </SafeAreaView>
  )
}

export default OrderShippingScreen

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: '#fff',
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
    //padding: 2,
    borderRadius: 8,
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: responsiveHeight(7)
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
    backgroundColor: '#FFCB45',
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
  shippingViewHeader: {
    color: '#3F709E',
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(1.8),
  },
  tableFooterRow2: {
    flexDirection: 'row',
    borderBottomWidth: 0,
    borderColor: '#E0E0E0',
    height: responsiveHeight(7),
    backgroundColor: '#F6F6F6',
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10
  },
  noOrderText: {
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(2),
    color: '#339999'
  }
});
