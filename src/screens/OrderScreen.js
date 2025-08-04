import React, { useState, useContext, useEffect } from 'react'
import { View, Text, SafeAreaView, StyleSheet, ScrollView, Image, TouchableOpacity, PermissionsAndroid, Dimensions, Platform } from 'react-native'
import * as Animatable from 'react-native-animatable';
import CustomHeader from '../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TextInput, LongPressGestureHandler, State } from 'react-native-gesture-handler'
import { addressWhiteImg, dubbleArrowImg, downloadImg, searchImg, userPhoto } from '../utils/Images'
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
import GetLocation from 'react-native-get-location'
import Toast from 'react-native-toast-message';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';

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

  const fetchInvoice = (orderId) => {
    AsyncStorage.getItem('userToken', (err, usertoken) => {
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
          invoiceDownload(res.data.pdf_url)
        })
        .catch(e => {
          console.log(`User fetch error ${e}`)
        });
    });
  }
  const invoiceDownload = (url) => {
    const { dirs } = RNFetchBlob.fs;
    RNFetchBlob.config({
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        mediaScannable: true,
        title: `invoice.pdf`,
        path: `${dirs.DownloadDir}/invoice..pdf`,
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
  const isItemFullyCompleted = (item) => {
    // Check each task type and see if it's assigned and completed
    const hasPickup = item.pickup_location;
    const hasWarehouse = item.warehouse_location;
    const hasDelivery = item.delivery_location;

    const pickupCompleted = !hasPickup || item.pickup_status === 'Completed';
    const warehouseCompleted = !hasWarehouse || item.warehouse_status === 'Completed';
    const deliveryCompleted = !hasDelivery || item.delivery_status === 'Completed';

    // Item is fully completed if ALL assigned tasks are completed
    return pickupCompleted && warehouseCompleted && deliveryCompleted;
  };
  const fetchNewOrders = () => {
    AsyncStorage.getItem('userToken', (err, usertoken) => {
      axios.get(`${process.env.API_URL}/api/driver/get-all-order-item`, {
        headers: {
          "Authorization": 'Bearer ' + usertoken,
          "Content-Type": 'application/json'
        },
      })
        .then(res => {
          // let userInfo = res.data.response.records;
          // console.log(JSON.stringify(userInfo), 'fetch accepted order')
          // setFaq(userInfo.reverse())
          // setIsLoading(false);
          let userInfo = res.data.response.records;
          console.log(JSON.stringify(userInfo), 'fetch accepted order');
          // userInfo.forEach(item => {
          //   item.batch_order_items = item.batch_order_items.filter(batch => batch.status === 'Accepted');
          // });

          userInfo.forEach(item => {
            // Filter for items that are Accepted but NOT fully completed
            item.batch_order_items = item.batch_order_items.filter(batch => {
              return batch.status === 'Accepted' && !isItemFullyCompleted(batch);
            });
          });

          // Remove items with empty batch_order_items array
          userInfo = userInfo.filter(item => item.batch_order_items.length > 0);
          // Filter batch_order_items based on status 'Accepted'
          //const acceptedOrders = userInfo.filter(item => item.status === 'Accepted');

          setFaq(userInfo.reverse());
          setIsLoading(false);
        })
        .catch(e => {
          console.log(`User fetch error ${e}`)
        });
    });
  }
  useEffect(() => {
    fetchNewOrders();
  }, [])
  useFocusEffect(
    React.useCallback(() => {
      fetchNewOrders()
    }, [])
  )
  const declineSingleOrder = (orderId, type) => {
    setIsLoading(true)
    // console.log(type, 'for decline single order')
    // console.log(orderId, 'for decline single order')
    const myArr = []
    const option = {};
    if (type == "batch") {
      const batchWithId1 = getFaq.find(batch => batch.batch_no === orderId)
      //console.log(batchWithId1)
      for (let i = 0; i < batchWithId1.batch_order_items.length; i++) {
        myArr.push(batchWithId1.batch_order_items[i].order_id)
      }
      option.status = 3;
      option.order_id = myArr;
      option.batch_id = orderId;
      //console.log(option,'batch order accept')
    } else if (type == "single") {
      myArr.push(orderId)
      option.status = 3;
      option.order_id = myArr;
      console.log(option, 'single order accept')
    }
    //console.log(myArr)
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

  if (isLoading) {
    return (
      <Loader />
    )
  }
  const toggleExpanded = () => {
    setCollapsed(!collapsed)
  };

  const setSections = sections => {
    setActiveSections(sections.includes(undefined) ? [] : sections)
  };
  // const acceptedOrders = getFaq[0]?.batch.flatMap(batch => batch.order.filter(order => order.status === "accepted"));

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
              <Text style={styles.headerText}>{section?.batch_no}</Text>
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
    return (
      <Animatable.View
        duration={400}
        style={[styles.content, isActive ? styles.active : styles.inactive]}
        transition="backgroundColor"
      >
        <View style={styles.answerView}>
          {/* <Animatable.Text animation={isActive ? 'zoomIn' : undefined}>
            {section.answer.replace(/<\/?[^>]+(>|$)/g, "")}
          </Animatable.Text> */}
          <TouchableOpacity onPress={() => navigation.navigate('BatchDetails', { batchId: section.id })} style={styles.buttonViewRed}>
            <Text style={styles.buttonTextRed}>View Details </Text>
            <Image source={dubbleArrowImg} style={styles.iconImage} />
          </TouchableOpacity>
          {section.batch_order_items.map((item, index) => (
            item.status == 'Accepted' ?
              <View style={styles.table}>
                <View style={styles.tableRow1}>
                  <View style={styles.cellmain}>
                    <Text style={styles.tableHeader1}>Order ID :</Text>
                    <Text style={styles.tableHeader2}> {item?.reference}</Text>
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
                <View style={styles.tableFooterRow1}>
                  <View style={styles.cellFootermain}>
                    {/* <TouchableOpacity onPress={() => declineSingleOrder(item?.order_id, "single")}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: responsiveWidth(40) }}>
                        <Text style={{ color: '#BA0909', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), marginRight: 5 }}>Cancel Order</Text>
                        <Image source={dubbleArrowImg} style={styles.iconImage} tintColor={'#BA0909'} />
                      </View>
                    </TouchableOpacity> */}
                    {/* <View style={styles.verticleLine}></View> */}
                    <TouchableOpacity onPress={() => fetchInvoice(item?.order_id)}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: responsiveWidth(40) }}>
                        <Text style={{ color: '#949494', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), marginRight: 5 }}>Download</Text>
                        <Image source={downloadImg} style={styles.iconImage} tintColor={'#339999'} />
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              : <></>
          )

          )}
        </View>

      </Animatable.View>
    );
  }
  return (
    <ScrollView style={styles.wrapper}>
      {getFaq.length > 0 ?
        <View style={{ marginBottom: responsiveHeight(12) }}>
          <Accordion
            activeSections={activeSections}
            sections={getFaq}
            touchableComponent={TouchableOpacity}
            renderHeader={renderHeader}
            renderContent={renderContent}
            duration={400}
            onChange={setSections}
          />
        </View> :
        <View>
          <Text style={{ color: '#339999', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), textAlign: 'center' }}>No accepted order yet</Text>
        </View>
      }
    </ScrollView>
  );
};

const Completed = () => {
  const navigation = useNavigation();
  const [activeSections, setActiveSections] = useState([]);
  const [collapsed, setCollapsed] = useState(true);
  const [getFaq, setFaq] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchInvoice = (orderId) => {
    AsyncStorage.getItem('userToken', (err, usertoken) => {
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
          invoiceDownload(res.data.pdf_url)
        })
        .catch(e => {
          console.log(`User fetch error ${e}`)
        });
    });
  }
  const invoiceDownload = (url) => {
    const { dirs } = RNFetchBlob.fs;
    RNFetchBlob.config({
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        mediaScannable: true,
        title: `invoice.pdf`,
        path: `${dirs.DownloadDir}/invoice..pdf`,
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

  const isItemFullyCompleted = (item) => {
    // Check each task type and see if it's assigned and completed
    const hasPickup = item.pickup_location;
    const hasWarehouse = item.warehouse_location;
    const hasDelivery = item.delivery_location;

    const pickupCompleted = !hasPickup || item.pickup_status === 'Completed';
    const warehouseCompleted = !hasWarehouse || item.warehouse_status === 'Completed';
    const deliveryCompleted = !hasDelivery || item.delivery_status === 'Completed';

    // Item is fully completed if ALL assigned tasks are completed
    return pickupCompleted && warehouseCompleted && deliveryCompleted;
  };

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
          // const completedOrders = userInfo.filter(order => {
          //   // Check if any of the batch_order_items have pickup_status, warehouse_status, or delivery_status as 'Completed'
          //   return order.batch_order_items.some(item =>
          //     item.pickup_status === 'Completed' ||
          //     item.warehouse_status === 'Completed' ||
          //     item.delivery_status === 'Completed'
          //   );
          // });

          // // Filter out batch_order_items that do not have 'Completed' status
          // completedOrders.forEach(order => {
          //   order.batch_order_items = order.batch_order_items.filter(item =>
          //     item.pickup_status === 'Completed' ||
          //     item.warehouse_status === 'Completed' ||
          //     item.delivery_status === 'Completed'
          //   );
          // });

          // Filter for batches that have fully completed items
          const completedOrders = userInfo.filter(order => {
            return order.batch_order_items.some(item => isItemFullyCompleted(item));
          });

          // Keep only the fully completed batch_order_items
          completedOrders.forEach(order => {
            order.batch_order_items = order.batch_order_items.filter(item =>
              isItemFullyCompleted(item)
            );
          });

          console.log(JSON.stringify(completedOrders), 'fetch completed order');

          // Set the filtered data inside setFaq()
          setFaq(completedOrders.reverse());
          setIsLoading(false);
        })
        .catch(e => {
          console.log(`User fetch error ${e}`)
        });
    });
  }
  useEffect(() => {
    fetchNewOrders();
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
  const toggleExpanded = () => {
    setCollapsed(!collapsed)
  };

  const setSections = sections => {
    setActiveSections(sections.includes(undefined) ? [] : sections)
  };
  // const acceptedOrders = getFaq[0]?.batch.flatMap(batch => batch.order.filter(order => order.status === "accepted"));

  const renderHeader = (section, _, isActive) => {
    return (
      <Animatable.View
        duration={400}
        style={[styles.header, isActive ? styles.active : styles.inactive]}
        transition="backgroundColor"
      >
        {/* {section.status == 'Completed' ? */}
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
        {/* : <></>} */}
      </Animatable.View>
    );
  };

  const renderContent = (section, _, isActive) => {
    return (
      <Animatable.View
        duration={400}
        style={[styles.content, isActive ? styles.active : styles.inactive]}
        transition="backgroundColor"
      >
        <View style={styles.answerView}>
          {/* <Animatable.Text animation={isActive ? 'zoomIn' : undefined}>
            {section.answer.replace(/<\/?[^>]+(>|$)/g, "")}
          </Animatable.Text> */}
          {/* <TouchableOpacity onPress={() => navigation.navigate('BatchDetails', { batchId: section.batch_no })} style={styles.buttonViewRed}>
            <Text style={styles.buttonTextRed}>View Details </Text>
            <Image source={dubbleArrowImg} style={styles.iconImage} />
          </TouchableOpacity> */}
          {section.batch_order_items.map((item, index) => (
            // item.status == 'Completed' ?
            <View style={styles.table}>
              <View style={styles.tableRow1}>
                <View style={styles.cellmain}>
                  <Text style={styles.tableHeader1}>Order ID :</Text>
                  <Text style={styles.tableHeader2}> {item?.reference}</Text>
                </View>
              </View>
              {item.pickup_location && item.pickup_status == 'Completed' ?
                <View style={{ padding: 10 }}>
                  <Text style={styles.locationheader}>Pickup Location :</Text>
                  <View style={{ justifyContent: 'center', }}>
                    <Text style={styles.iconText}>{item.pickup_location}</Text>
                  </View>
                </View>
                : <></>}
              <View style={{ borderBottomColor: '#E0E0E0', borderBottomWidth: StyleSheet.hairlineWidth, }} />
              {item.warehouse_location && item.warehouse_status == 'Completed' ?
                <View style={{ padding: 10 }}>
                  <Text style={styles.locationheader}>Warehouse Location :</Text>
                  <View style={{ justifyContent: 'center', }}>
                    <Text style={styles.iconText}>{item.warehouse_location}</Text>
                  </View>
                </View> : <></>}
              <View style={{ borderBottomColor: '#E0E0E0', borderBottomWidth: StyleSheet.hairlineWidth, }} />
              {item.delivery_location && item.delivery_status == 'Completed' ?
                <View style={{ padding: 10 }}>
                  <Text style={styles.locationheader}>Delivery Location :</Text>
                  <View style={{ justifyContent: 'center', }}>
                    <Text style={styles.iconText}>{item.delivery_location}</Text>
                  </View>
                </View>
                : <></>}
              <View style={styles.tableFooterRow1}>
                <View style={styles.cellFootermain}>
                  {/* <TouchableOpacity onPress={() => declineSingleOrder(item?.order_id, "single")}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: responsiveWidth(40) }}>
                        <Text style={{ color: '#BA0909', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), marginRight: 5 }}>Cancel Order</Text>
                        <Image source={dubbleArrowImg} style={styles.iconImage} tintColor={'#BA0909'} />
                      </View>
                    </TouchableOpacity> */}
                  {/* <View style={styles.verticleLine}></View> */}
                  <TouchableOpacity onPress={() => fetchInvoice(item?.order_id)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: responsiveWidth(40) }}>
                      <Text style={{ color: '#949494', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), marginRight: 5 }}>Download</Text>
                      <Image source={downloadImg} style={styles.iconImage} tintColor={'#339999'} />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            // : <></>
          )

          )}
        </View>

      </Animatable.View>
    );
  }
  return (
    <ScrollView style={styles.wrapper}>
      {getFaq.length > 0 ?
        <View style={{ marginBottom: responsiveHeight(12) }}>
          <Accordion
            activeSections={activeSections}
            sections={getFaq}
            touchableComponent={TouchableOpacity}
            renderHeader={renderHeader}
            renderContent={renderContent}
            duration={400}
            onChange={setSections}
          />
        </View> :
        <View>
          <Text style={{ color: '#339999', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), textAlign: 'center' }}>No completed order yet</Text>
        </View>
      }
    </ScrollView>
  );
};

const Declined = () => {
  const navigation = useNavigation();
  const [activeSections, setActiveSections] = useState([]);
  const [collapsed, setCollapsed] = useState(true);
  const [getFaq, setFaq] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchInvoice = (orderId) => {
    AsyncStorage.getItem('userToken', (err, usertoken) => {
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
          invoiceDownload(res.data.pdf_url)
        })
        .catch(e => {
          console.log(`User fetch error ${e}`)
        });
    });
  }
  // const invoiceDownload = (url) => {
  //   const { dirs } = RNFetchBlob.fs;
  //   RNFetchBlob.config({
  //     fileCache: true,
  //     addAndroidDownloads: {
  //       useDownloadManager: true,
  //       notification: true,
  //       mediaScannable: true,
  //       title: `invoice.pdf`,
  //       path: `${dirs.DownloadDir}/invoice..pdf`,
  //     },
  //   })
  //     .fetch('GET', url, {})
  //     .then((res) => {
  //       console.log('The file saved to ', res.path());
  //       // ToastAndroid.show('The file saved to ', res.path(), ToastAndroid.SHORT);
  //       Toast.show({
  //         type: 'success',
  //         text2: "PDF Downloaded successfully",
  //         position: 'top',
  //         topOffset: Platform.OS == 'ios' ? 55 : 20
  //       });
  //     })
  //     .catch((e) => {
  //       console.log(e)
  //     });
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
          // Filter out only the batch order items with status 'Declined'
          let declinedBatches = userInfo.filter(batch =>
            batch.batch_order_items.some(item => item.status === 'Declined')
          );
          console.log(JSON.stringify(declinedBatches), 'fetch declined order')
          setFaq(declinedBatches.reverse())
          setIsLoading(false);
        })
        .catch(e => {
          console.log(`User fetch error ${e}`)
        });
    });
  }
  useEffect(() => {
    fetchNewOrders();
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
  const acceptSingleOrder = (orderId, type) => {
    setIsLoading(true)
    //console.log(type, 'for accept single order')
    //console.log(orderId, 'for accept single order')
    const myArr = []
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
      option.order_id = myArr;
      //console.log(option, 'single order accept')
    }
    //console.log(myArr)
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
              text2: "Order successfully decline",
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
  const toggleExpanded = () => {
    setCollapsed(!collapsed)
  };

  const setSections = sections => {
    setActiveSections(sections.includes(undefined) ? [] : sections)
  };
  // const acceptedOrders = getFaq[0]?.batch.flatMap(batch => batch.order.filter(order => order.status === "accepted"));

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
    return (
      <Animatable.View
        duration={400}
        style={[styles.content, isActive ? styles.active : styles.inactive]}
        transition="backgroundColor"
      >
        <View style={styles.answerView}>
          {/* <Animatable.Text animation={isActive ? 'zoomIn' : undefined}>
            {section.answer.replace(/<\/?[^>]+(>|$)/g, "")}
          </Animatable.Text> */}
          {/* <TouchableOpacity onPress={() => navigation.navigate('BatchDetails',{batchId:section.batch_no})} style={styles.buttonViewRed}>
            <Text style={styles.buttonTextRed}>View Details</Text>
            <Image source={dubbleArrowImg} style={styles.iconImage} />
          </TouchableOpacity> */}
          {section.batch_order_items.map((item, index) => (
            item.status == 'Declined' ?
              <View style={styles.table}>
                <View style={styles.tableRow1}>
                  <View style={styles.cellmain}>
                    <Text style={styles.tableHeader1}>Order ID :</Text>
                    <Text style={styles.tableHeader2}> {item?.reference}</Text>
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
                <View style={styles.tableFooterRow1}>
                  <View style={styles.cellFootermain}>
                    {/* <TouchableOpacity onPress={() => acceptSingleOrder(item?.order_id, "single")}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: responsiveWidth(40) }}>
                        <Text style={{ color: '#27ae60', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), marginRight: 5 }}>Accept Order</Text>
                        <Image source={dubbleArrowImg} style={styles.iconImage} tintColor={'#27ae60'} />
                      </View>
                    </TouchableOpacity> */}
                    {/* <View style={styles.verticleLine}></View> */}
                    <TouchableOpacity onPress={() => fetchInvoice(item?.order_id)}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: responsiveWidth(40) }}>
                        <Text style={{ color: '#949494', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), marginRight: 5 }}>Download</Text>
                        <Image source={downloadImg} style={styles.iconImage} tintColor={'#339999'} />
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              : <></>
          )

          )}
        </View>

      </Animatable.View>
    );
  }
  return (
    <ScrollView style={styles.wrapper}>
      {getFaq.length > 0 ?
        <View style={{ marginBottom: responsiveHeight(12) }}>
          <Accordion
            activeSections={activeSections}
            sections={getFaq}
            touchableComponent={TouchableOpacity}
            renderHeader={renderHeader}
            renderContent={renderContent}
            duration={400}
            onChange={setSections}
          />
        </View> :
        <View>
          <Text style={{ color: '#339999', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(2), textAlign: 'center' }}>No decline order yet</Text>
        </View>
      }
    </ScrollView>
  );
};

const renderScene = SceneMap({
  first: Accepted,
  second: Completed,
  third: Declined
});

const OrderScreen = ({ route }) => {
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);
  const [userInfo, setuserInfo] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const pageIndexMap = {
    Accepted: 0,
    Completed: 1,
    Declined: 2,
  };
  const [index, setIndex] = React.useState(pageIndexMap[route?.params?.pageFrom] || 0);
  const [routes] = React.useState([
    { key: 'first', title: 'Accepted' },
    { key: 'second', title: 'Completed' },
    { key: 'third', title: 'Declined' },
  ]);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

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
      <CustomHeader commingFrom={'Orders'} onPress={() => navigation.goBack()} title={'Orders'} />
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

export default OrderScreen

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
});
