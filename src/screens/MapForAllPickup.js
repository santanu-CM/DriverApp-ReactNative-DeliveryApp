import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Alert,
  Platform,
  Dimensions
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Callout, Polygon, Circle } from 'react-native-maps';
import { request, PERMISSIONS } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
import getDirections from 'react-native-google-maps-directions'
import Carousel from 'react-native-snap-carousel';
import CustomHeader from '../components/CustomHeader';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { phoneImg, emailImg, userPhoto, addressImg, bankDetailsImg, documentImg, reviewImg, deleteImg, pointerImg, markerImg } from '../utils/Images'
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { API_URL } from '@env'
import Loader from '../utils/Loader'
import GetLocation from 'react-native-get-location'
import haversine from 'haversine-distance';
const RADIUS_OF_EARTH = 6378;

const MapForAllPickup = ({ navigation, route }) => {

  const [markers, setMarkers] = useState([]);
  const [coordinates, setCoordinates] = useState([]);
  const [currentLat, setCurrentLat] = useState('')
  const [currentLong, setCurrentLong] = useState('')
  const [initialPosition, setInitialPosition] = useState({
    latitude: 22.556749,
    longitude: 88.412102,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1
  });
  const _map = useRef(null);
  const _carousel = useRef(null);
  const [orderType, setOrderType] = useState(route?.params?.fromPage)
  const [getorders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPickup, setIsPickup] = useState(false)
  const [isWarehouse, setIsWarehouse] = useState(false)
  const [isDelivery, setIsDelivery] = useState(false)

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

  useEffect(() => {
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 60000,
    })
      .then(location => {
        console.log(location, 'current location');
        setCurrentLat(location.latitude)
        setCurrentLong(location.longitude)
        let initialPosition = {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.09,
          longitudeDelta: 0.035
        };
        setInitialPosition(initialPosition);
      })
      .catch(error => {
        const { code, message } = error;
        console.warn(code, message);
      })
  }, [])
  // const fetchOrderDetails = () => {
  //   AsyncStorage.getItem('userToken', (err, usertoken) => {
  //     axios.get(`${process.env.API_URL}/api/driver/get-batch-order-by-status`, {
  //       headers: {
  //         "Authorization": 'Bearer ' + usertoken,
  //         "Content-Type": 'application/json'
  //       },
  //     })
  //       .then(res => {
  //         let userInfo = res.data.response.records;
  //         console.log(JSON.stringify(userInfo), 'fetch map pickup order')
  //         setOrders(userInfo)
  //         setIsLoading(false);
  //         if (orderType == 'pickup') {
  //           const pickupArray = userInfo.pickup.map((pickup, index) => ({
  //             name: pickup.reference,
  //             latitude: parseFloat(pickup.pickup_lat),
  //             longitude: parseFloat(pickup.pickup_long),
  //             image: require('../assets/images/Ellipse7.png'),
  //             batchNo: pickup.batch_id,
  //             orderId: pickup.order_id,
  //             location: pickup.pickup_location,
  //             id: pickup.id
  //           }));
  //           console.log(pickupArray);
  //           setCoordinates(pickupArray)
  //         } else if (orderType == 'warehouse') {
  //           const pickupArray = userInfo.warehouse.map((warehouse, index) => ({
  //             name: warehouse.reference,
  //             latitude: parseFloat(warehouse.warehouse_lat),
  //             longitude: parseFloat(warehouse.warehouse_long),
  //             image: require('../assets/images/Ellipse7.png'),
  //             batchNo: warehouse.batch_id,
  //             orderId: warehouse.order_id,
  //             location: warehouse.warehouse_location,
  //             id: warehouse.id
  //           }));
  //           console.log(pickupArray);
  //           setCoordinates(pickupArray)
  //         } else if (orderType == 'delivery') {
  //           const pickupArray = userInfo.delivery.map((delivery, index) => ({
  //             name: delivery.reference,
  //             latitude: parseFloat(delivery.delivery_lat),
  //             longitude: parseFloat(delivery.delivery_long),
  //             image: require('../assets/images/Ellipse7.png'),
  //             batchNo: delivery.batch_id,
  //             orderId: delivery.order_id,
  //             location: delivery.delivery_location,
  //             id: delivery.id
  //           }));
  //           console.log(pickupArray);
  //           setCoordinates(pickupArray)
  //         }

  //       })
  //       .catch(e => {
  //         console.log(`User fetch error ${e}`)
  //       });
  //   });
  // }

  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  const fetchOrderDetails = () => {
    AsyncStorage.getItem('userToken', (err, usertoken) => {
      axios.get(`${process.env.API_URL}/api/driver/get-batch-order-by-status`, {
        headers: {
          "Authorization": 'Bearer ' + usertoken,
          "Content-Type": 'application/json'
        },
      })
        .then(res => {
          let userInfo = res.data.response.records;
          console.log(JSON.stringify(userInfo), 'fetch map pickup order')
          setOrders(userInfo)
          setIsLoading(false);
          if (orderType == 'pickup' || orderType == 'warehouse' || orderType == 'delivery') {
            const orderArray = userInfo[orderType];
            if (orderArray.length === 0) {
              let message = '';
              switch (orderType) {
                case 'pickup':
                  message = 'No pickup location found.';
                  setIsPickup(true)
                  break;
                case 'warehouse':
                  message = 'No warehouse location found.';
                  setIsWarehouse(true)
                  break;
                case 'delivery':
                  message = 'No delivery location found.';
                  setIsDelivery(true)
                  break;
                default:
                  message = 'No location found.';
              }
              console.log(message);
              // Display or handle the message as per your requirement
            } else {
              const pickupArray = orderArray.map((item, index) => ({
                name: item.reference,
                latitude: parseFloat(item[`${orderType}_lat`]),
                longitude: parseFloat(item[`${orderType}_long`]),
                image: require('../assets/images/Ellipse7.png'),
                batchNo: item.batch_id,
                orderId: item.order_id,
                status: item[`${orderType}_status`],
                location: item[`${orderType}_location`],
                id: item.id
              }));

              // Sort pickupArray based on distance from current location
              const sortedPickupArray = pickupArray.sort((a, b) => {
                const distanceA = getDistance(currentLat, currentLong, a.latitude, a.longitude);
                const distanceB = getDistance(currentLat, currentLong, b.latitude, b.longitude);
                return distanceA - distanceB;
              });

              console.log(sortedPickupArray);
              setCoordinates(sortedPickupArray);
            }
          }
        })
        .catch(e => {
          console.log(`User fetch error ${e}`)
        });
    });
  }

  useEffect(() => {
    //locateCurrentPosition()
    //requestLocationPermission();
    fetchOrderDetails()
  }, []);

  if (isLoading) {
    return (
      <Loader />
    )
  }

  const handleGetDirections = (destinationLat, destinationLong) => {
    console.log(initialPosition, 'nnnnnnnnnnnnnnnnn')
    console.log(destinationLat, destinationLong, "fdsfdsfdsfdsfdsfds")
    const data = {
      source: initialPosition,
      destination: {
        latitude: destinationLat,
        longitude: destinationLong
      },
      params: [
        {
          key: "travelmode",
          value: "driving"        // may be "walking", "bicycling" or "transit" as well
        },
        {
          key: "dir_action",
          value: "navigate"       // this instantly initializes navigation using the given travel mode
        }
      ],
      // waypoints: [
      //   {
      //     latitude: -33.8600025,
      //     longitude: 18.697452
      //   },
      //   {
      //     latitude: -33.8600026,
      //     longitude: 18.697453
      //   },
      //      {
      //     latitude: -33.8600036,
      //     longitude: 18.697493
      //   }
      // ]
    }

    getDirections(data)
  }

  const showWelcomeMessage = () => {
    Alert.alert(
      'Welcome to San Francisco',
      'The food is amazing',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Ok'
        }
      ]
    );
  };

  const requestLocationPermission = async () => {
    let response;
    if (Platform.OS === 'ios') {
      response = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
    } else {
      response = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    }
    if (response === 'granted') {
      locateCurrentPosition();
    }
  };


  const locateCurrentPosition = () => {
    Geolocation.getCurrentPosition(
      position => {
        let initialPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.09,
          longitudeDelta: 0.035
        };
        setInitialPosition(initialPosition);
      },
      // error => Alert.alert(error.message),
      // { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
    );
  };

  const onCarouselItemChange = index => {
    let location = coordinates[index];
    _map.current.animateToRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.09,
      longitudeDelta: 0.035
    });
    markers[index].showCallout();
  };

  const onMarkerPressed = (location, index) => {
    _map.current.animateToRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.09,
      longitudeDelta: 0.035
    });
    _carousel.current.snapToItem(index);
  };

  const renderCarouselItem = ({ item }) => (
    <View style={styles.table}>
      <View style={styles.tableRow1}>
        <View style={styles.cellmain}>
          <Text style={styles.tableHeader1}>Batch Number : </Text>
          <Text style={styles.tableHeader2}>B -{item.batchNo}</Text>
        </View>
      </View>
      <View style={styles.cellmain}>
        <Text style={styles.tableHeader1}>Order ID : </Text>
        <Text style={styles.tableHeader2}>{item.name}</Text>
      </View>
      <View style={{ borderBottomColor: '#E0E0E0', borderBottomWidth: StyleSheet.hairlineWidth, marginHorizontal: 10, marginBottom: 10 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 }}>
        {orderType === 'pickup' && (
          <Text style={{ color: '#339999', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(1.7), }}>Pickup Location :</Text>
        )}
        {orderType === 'warehouse' && (
          <Text style={{ color: '#339999', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(1.7), }}>Warehouse Location :</Text>
        )}
        {orderType === 'delivery' && (
          <Text style={{ color: '#339999', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(1.7), }}>Delivery Location :</Text>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={pointerImg} style={styles.iconImage} tintColor={'#3F709E'} />
          <Text style={{ color: '#3F709E', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(1.7), }}>{(getDistanceFromLocation({ lat: currentLat, lng: currentLong }, { lat: item.latitude, lng: item.longitude })).toFixed(2)} KM Away</Text>
        </View>
      </View>
      <View style={{ justifyContent: 'center', padding: 10, height: responsiveHeight(9) }}>
        <Text style={{ color: '#949494', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(1.7), }}>{item.location}</Text>
      </View>
      <TouchableOpacity onPress={() => handleGetDirections(item.latitude, item.longitude)}>
        <View style={{ height: responsiveHeight(6), width: responsiveWidth(70), backgroundColor: '#339999', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderColor: '#339999', borderWidth: 1, marginBottom: 5, marginTop: 5 }}>
          <Text style={{ color: '#FFFFFF', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(1.7) }}>Direction</Text>
        </View>
      </TouchableOpacity>
      {orderType === 'pickup' && (
        item.status == 'Completed' ?
          <View style={{ height: responsiveHeight(6), width: responsiveWidth(70), backgroundColor: '#3F709E', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderColor: '#339999', borderWidth: 1 }}>
            <Text style={{ color: '#FFFFFF', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(1.7) }}>Items Collected</Text>
          </View>
          :
          <TouchableOpacity onPress={() => navigation.navigate('LocationConfirmation', { orderId: item.id, fromPage: 'pickup' })}>
            <View style={{ height: responsiveHeight(6), width: responsiveWidth(70), backgroundColor: '#FFFFFF', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderColor: '#339999', borderWidth: 1 }}>
              <Text style={{ color: '#339999', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(1.7) }}>Go to Pickup</Text>
            </View>
          </TouchableOpacity>
      )}
      {orderType === 'warehouse' && (
        item.status == 'Completed' ?
          <View style={{ height: responsiveHeight(6), width: responsiveWidth(70), backgroundColor: '#3F709E', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderColor: '#339999', borderWidth: 1 }}>
            <Text style={{ color: '#FFFFFF', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(1.7) }}>Items Collected</Text>
          </View>
          :
          <TouchableOpacity onPress={() => navigation.navigate('LocationConfirmation', { orderId: item.id, fromPage: 'warehouse' })}>
            <View style={{ height: responsiveHeight(6), width: responsiveWidth(70), backgroundColor: '#FFFFFF', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderColor: '#339999', borderWidth: 1 }}>
              <Text style={{ color: '#339999', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(1.7) }}>Go to Warehouse</Text>
            </View>
          </TouchableOpacity>
      )}
      {orderType === 'delivery' && (
        item.status == 'Completed' ?
          <View style={{ height: responsiveHeight(6), width: responsiveWidth(70), backgroundColor: '#3F709E', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderColor: '#339999', borderWidth: 1 }}>
            <Text style={{ color: '#FFFFFF', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(1.7) }}>Items Delivered</Text>
          </View>
          :
          <TouchableOpacity onPress={() => navigation.navigate('LocationConfirmation', { orderId: item.id, fromPage: 'delivery' })}>
            <View style={{ height: responsiveHeight(6), width: responsiveWidth(70), backgroundColor: '#FFFFFF', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderColor: '#339999', borderWidth: 1 }}>
              <Text style={{ color: '#339999', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(1.7) }}>Go to Delivery</Text>
            </View>
          </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomHeader
        commingFrom={'Find Pickup Location'}
        title={orderType === 'pickup' ? 'Find Pickup Location' : orderType === 'warehouse' ? 'Find Warehouse Location' : 'Find Delivery Location'}
        onPress={() => navigation.goBack()}
        onPressProfile={() => navigation.navigate('Profile')}
      />
      {isPickup && (
        <View style={{justifyContent:'center',alignItems:'center',flex:1}}>
        <Text style={{ color: '#339999', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(3), textAlign: 'center' }}>No pickup order was found for your accepted order</Text>
        </View>
      )}
      {isWarehouse && (
         <Text style={{ color: '#339999', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(3), textAlign: 'center' }}>No Warehouse order was found for your accepted order</Text>
      )}
      {isDelivery && (
       <Text style={{ color: '#339999', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(3), textAlign: 'center' }}>No Delivery order was found for your accepted order</Text>
      )}
      {!(isPickup || isWarehouse || isDelivery) && (
        <>
          <MapView
            provider={PROVIDER_GOOGLE}
            ref={_map}
            showsUserLocation={true}
            style={styles.map}
            initialRegion={initialPosition}
          >
            <Polygon
              coordinates={coordinates}
              fillColor={'rgba(100, 100, 200, 0.3)'}
            />
            <Circle
              center={initialPosition}
              radius={200}
              fillColor={'rgba(200, 300, 200, 0.5)'}
            />
            <Marker
              draggable
              coordinate={{ latitude: 37.7825259, longitude: -122.4351431 }}
              image={require('../assets/images/pointer.png')}
            >
              <Callout onPress={showWelcomeMessage}> 
                <Text>An Interesting city</Text>
              </Callout>
            </Marker> 
            {coordinates.map((marker, index) => (
              <Marker
                key={marker.name}
                ref={ref => (markers[index] = ref)}
                onPress={() => onMarkerPressed(marker, index)}
                coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                image={markerImg}
              >
                <Callout>
                  <Text style={{ fontSize: 16, fontFamily: 'Outfit-Medium', color: '#2F2F2F' }}>{marker.name}</Text>
                  <Text style={{ fontSize: 16, fontFamily: 'Outfit-Medium', color: '#2F2F2F', textAlign: 'center' }}>{(getDistanceFromLocation({ lat: currentLat, lng: currentLong }, { lat: marker.latitude, lng: marker.longitude })).toFixed(2)}km</Text>
                </Callout>
              </Marker>
            ))}
          </MapView>
          <Carousel
            ref={_carousel}
            data={coordinates}
            containerCustomStyle={styles.carousel}
            renderItem={renderCarouselItem}
            sliderWidth={Dimensions.get('window').width}
            itemWidth={300}
            removeClippedSubviews={false}
            onSnapToItem={index => onCarouselItemChange(index)}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject
  },
  map: {
    // ...StyleSheet.absoluteFillObject
    flex: 1
  },
  carousel: {
    position: 'absolute',
    bottom: 0,
    marginBottom: 48
  },
  /*--------------- */
  table: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    width: responsiveWidth(78),
    height: responsiveHeight(42),
    borderRadius: 10
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
  cellmain: {
    padding: 10,
    flexDirection: 'row',
    //justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15

  },
  iconImage: {
    width: 15,
    height: 15,
    marginRight: 10
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
    fontSize: responsiveFontSize(2),
    textAlign: 'left',
  },
});

export default MapForAllPickup;