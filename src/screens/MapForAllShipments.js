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
import { SafeAreaView } from 'react-native-safe-area-context';

const RADIUS_OF_EARTH = 6378;

const MapForAllShipments = ({ route }) => {
  const navigation = useNavigation();
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
  const [allShipmentList, setAllShipmentList] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [noShipments, setNoShipments] = useState(false)

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
    console.log('Getting current location...');
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 60000,
    })
      .then(location => {
        console.log('Current location received:', location);
        setCurrentLat(location.latitude)
        setCurrentLong(location.longitude)
        let initialPosition = {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.09,
          longitudeDelta: 0.035
        };
        setInitialPosition(initialPosition);
        console.log('Initial position set:', initialPosition);
      })
      .catch(error => {
        const { code, message } = error;
        console.warn('Location error:', code, message);
        // Set default location if current location fails
        const defaultPosition = {
          latitude: 22.556749,
          longitude: 88.412102,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1
        };
        setInitialPosition(defaultPosition);
        console.log('Using default position:', defaultPosition);
      })
  }, [])

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

  const fetchShipmentDetails = () => {
    console.log('Starting to fetch shipment details...');
    AsyncStorage.getItem('userToken', (err, usertoken) => {
      if (err || !usertoken) {
        console.log('Error getting user token:', err);
        setIsLoading(false);
        return;
      }
      
      console.log('Making API call to fetch shipments...');
      axios.post(`${process.env.API_URL}/api/driver/all-shipment-load`, {}, {
        headers: {
          "Authorization": 'Bearer ' + usertoken,
          "Content-Type": 'application/json'
        },
      })
        .then(res => {
          console.log('API Response received:', res.data);
          let shipmentData = res.data.response.records;
          console.log('Shipment data:', JSON.stringify(shipmentData, null, 2));
          console.log('Number of shipments:', shipmentData?.length || 0);
          
          setAllShipmentList(shipmentData)
          setIsLoading(false);
          
          if (!shipmentData || shipmentData.length === 0) {
            setNoShipments(true);
            console.log('No shipments found.');
            return;
          }
          
          // Process shipment data to create map coordinates
          const shipmentLocations = [];
          
          shipmentData.forEach((shipment, index) => {
            console.log(`Processing shipment ${index}:`, shipment);
            
            // Add pickup location if coordinates exist
            const pickupLat = shipment.pickup_location?.pickup_lat;
            const pickupLng = shipment.pickup_location?.pickup_lng; // Fixed: was pickup_long, should be pickup_lng
            
            console.log(`Pickup coordinates: lat=${pickupLat}, lng=${pickupLng}`);
            
            if (pickupLat && pickupLng && !isNaN(parseFloat(pickupLat)) && !isNaN(parseFloat(pickupLng))) {
              const pickupLocation = {
                id: `${shipment.shipping_id}_pickup`,
                name: shipment.shipping_id,
                latitude: parseFloat(pickupLat),
                longitude: parseFloat(pickupLng),
                image: require('../assets/images/Ellipse7.png'),
                shipmentId: shipment.shipping_id,
                location: shipment.pickup_location.pickup_location || 'Pickup Location',
                type: 'pickup',
                date: shipment.pickup_location.pickup_date || 'N/A',
                customerName: shipment.other?.shipping_for === 'for_myself' ? 
                  shipment.other?.shipper_name : shipment.other?.sender_name || 'Unknown',
                weight: shipment.product_details?.weight || 'N/A',
                dimensions: `${shipment.product_details?.dimension_l || 'N/A'} x ${shipment.product_details?.dimension_b || 'N/A'}`,
                loadCashValue: shipment.other?.load_cache_value || '0',
                fullShipmentData: shipment
              };
              shipmentLocations.push(pickupLocation);
              console.log('Added pickup location:', pickupLocation);
            }
            
            // Add delivery location if coordinates exist
            const deliveryLat = shipment.delivery_location?.delivery_lat;
            const deliveryLng = shipment.delivery_location?.delivery_lng; // Fixed: was delivery_long, should be delivery_lng
            
            console.log(`Delivery coordinates: lat=${deliveryLat}, lng=${deliveryLng}`);
            
            if (deliveryLat && deliveryLng && !isNaN(parseFloat(deliveryLat)) && !isNaN(parseFloat(deliveryLng))) {
              const deliveryLocation = {
                id: `${shipment.shipping_id}_delivery`,
                name: shipment.shipping_id,
                latitude: parseFloat(deliveryLat),
                longitude: parseFloat(deliveryLng),
                image: require('../assets/images/Ellipse7.png'),
                shipmentId: shipment.shipping_id,
                location: shipment.delivery_location.delivery_location || 'Delivery Location',
                type: 'delivery',
                date: shipment.delivery_location.delivery_date || 'N/A',
                customerName: shipment.delivery_location.recipient_name || 'Unknown',
                weight: shipment.product_details?.weight || 'N/A',
                dimensions: `${shipment.product_details?.dimension_l || 'N/A'} x ${shipment.product_details?.dimension_b || 'N/A'}`,
                loadCashValue: shipment.other?.load_cache_value || '0',
                fullShipmentData: shipment
              };
              shipmentLocations.push(deliveryLocation);
              console.log('Added delivery location:', deliveryLocation);
            }
          });

          console.log('Total processed locations:', shipmentLocations.length);
          console.log('All processed locations:', shipmentLocations);

          if (shipmentLocations.length === 0) {
            console.log('No valid coordinates found in shipments');
            setNoShipments(true);
            return;
          }

          // Sort locations based on distance from current location if current location is available
          let sortedLocations = shipmentLocations;
          if (currentLat && currentLong) {
            sortedLocations = shipmentLocations.sort((a, b) => {
              const distanceA = getDistance(currentLat, currentLong, a.latitude, a.longitude);
              const distanceB = getDistance(currentLat, currentLong, b.latitude, b.longitude);
              return distanceA - distanceB;
            });
            console.log('Sorted locations by distance');
          } else {
            console.log('Current location not available, using unsorted locations');
          }

          console.log('Setting coordinates:', sortedLocations);
          setCoordinates(sortedLocations);
        })
        .catch(e => {
          console.log(`Shipment fetch error:`, e);
          console.log('Error response:', e.response?.data);
          setIsLoading(false);
          setNoShipments(true);
        });
    });
  }

  useEffect(() => {
    console.log('Component mounted, fetching shipment details...');
    fetchShipmentDetails()
  }, []);

  // Add useFocusEffect to refetch when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('Screen focused, refetching shipment details...');
      fetchShipmentDetails()
    }, [])
  );

  if (isLoading) {
    console.log('Showing loader...');
    return (
      <Loader />
    )
  }

  console.log('Render - noShipments:', noShipments);
  console.log('Render - coordinates length:', coordinates.length);
  console.log('Render - initialPosition:', initialPosition);

  const handleGetDirections = (destinationLat, destinationLong) => {
    console.log(initialPosition, 'Current position for directions')
    console.log(destinationLat, destinationLong, "Destination coordinates")
    const data = {
      source: initialPosition,
      destination: {
        latitude: destinationLat,
        longitude: destinationLong
      },
      params: [
        {
          key: "travelmode",
          value: "driving"
        },
        {
          key: "dir_action",
          value: "navigate"
        }
      ],
    }

    getDirections(data)
  }

  const showWelcomeMessage = () => {
    Alert.alert(
      'Shipment Location',
      'View shipment details',
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
          <Text style={styles.tableHeader1}>Shipping ID : </Text>
          <Text style={styles.tableHeader2}>{item.shipmentId}</Text>
        </View>
      </View>
      
      <View style={styles.cellmain}>
        <Text style={styles.tableHeader1}>Location Type : </Text>
        <Text style={[styles.tableHeader2, { 
          color: item.type === 'pickup' ? '#FF6B35' : '#4CAF50',
          textTransform: 'capitalize'
        }]}>
          {item.type}
        </Text>
      </View>
      
      <View style={{ borderBottomColor: '#E0E0E0', borderBottomWidth: StyleSheet.hairlineWidth, marginHorizontal: 10, marginBottom: 10 }} />
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 }}>
        <Text style={{ color: '#339999', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(1.7), }}>
          {item.type === 'pickup' ? 'Pickup Location :' : 'Delivery Location :'}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={pointerImg} style={styles.iconImage} tintColor={'#3F709E'} />
          <Text style={{ color: '#3F709E', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(1.7), }}>
            {(getDistanceFromLocation({ lat: currentLat, lng: currentLong }, { lat: item.latitude, lng: item.longitude })).toFixed(2)} KM Away
          </Text>
        </View>
      </View>
      
      <View style={{ justifyContent: 'center', padding: 10, height: responsiveHeight(9) }}>
        <Text style={{ color: '#949494', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(1.7), }}>
          {item.location}
        </Text>
      </View>

      <View style={{ paddingHorizontal: 10, marginBottom: 10 }}>
        <Text style={styles.detailsHeader}>Customer: <Text style={styles.detailsValue}>{item.customerName}</Text></Text>
        <Text style={styles.detailsHeader}>Date: <Text style={styles.detailsValue}>{item.date}</Text></Text>
        <Text style={styles.detailsHeader}>Weight: <Text style={styles.detailsValue}>{item.weight} KG</Text></Text>
        <Text style={styles.detailsHeader}>Dimensions: <Text style={styles.detailsValue}>{item.dimensions} CM</Text></Text>
        <Text style={styles.detailsHeader}>Load Cash Value: <Text style={styles.detailsValue}>₵{item.loadCashValue}</Text></Text>
      </View>
      
      {/* <TouchableOpacity onPress={() => handleGetDirections(item.latitude, item.longitude)}>
        <View style={{ height: responsiveHeight(6), width: responsiveWidth(70), backgroundColor: '#339999', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderColor: '#339999', borderWidth: 1, marginBottom: 5, marginTop: 5 }}>
          <Text style={{ color: '#FFFFFF', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(1.7) }}>Get Directions</Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('ShippingOrderDetails', { shipmentData: item.fullShipmentData })}>
        <View style={{ height: responsiveHeight(6), width: responsiveWidth(70), backgroundColor: '#FFFFFF', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderColor: '#339999', borderWidth: 1 }}>
          <Text style={{ color: '#339999', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(1.7) }}>View Details</Text>
        </View>
      </TouchableOpacity> */}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        commingFrom={'All Shipments Map'}
        title={'All Shipments Map'}
        onPress={() => navigation.goBack()}
        onPressProfile={() => navigation.navigate('Profile')}
      />
      
      {noShipments && (
        <View style={{justifyContent:'center',alignItems:'center',flex:1}}>
          <Text style={{ color: '#339999', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(3), textAlign: 'center' }}>
            No shipments found
          </Text>
          <Text style={{ color: '#666', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(1.5), textAlign: 'center', marginTop: 10 }}>
            Debug: Shipments count: {allShipmentList.length}
          </Text>
          <Text style={{ color: '#666', fontFamily: 'Outfit-Regular', fontSize: responsiveFontSize(1.5), textAlign: 'center' }}>
            Coordinates count: {coordinates.length}
          </Text>
        </View>
      )}
      
      {!noShipments && coordinates.length > 0 && (
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
            
            {coordinates.map((marker, index) => (
              <Marker
                key={marker.id}
                ref={ref => (markers[index] = ref)}
                onPress={() => onMarkerPressed(marker, index)}
                coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                image={marker.type === 'pickup' ? 
                  require('../assets/images/pointer.png') : 
                  require('../assets/images/pointer.png')
                }
              >
                <Callout>
                  <View style={{ minWidth: 200 }}>
                    <Text style={{ fontSize: 16, fontFamily: 'Outfit-Medium', color: '#2F2F2F', textAlign: 'center' }}>
                      {marker.shipmentId}
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: 'Outfit-Regular', color: '#666', textAlign: 'center', textTransform: 'capitalize' }}>
                      {marker.type} Location
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: 'Outfit-Medium', color: '#2F2F2F', textAlign: 'center' }}>
                      {(getDistanceFromLocation({ lat: currentLat, lng: currentLong }, { lat: marker.latitude, lng: marker.longitude })).toFixed(2)}km away
                    </Text>
                  </View>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject
  },
  map: {
    flex: 1
  },
  carousel: {
    position: 'absolute',
    bottom: 0,
    marginBottom: 48
  },
  table: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    width: responsiveWidth(78),
    height: responsiveHeight(40),
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
    fontSize: responsiveFontSize(1.7),
    textAlign: 'left',
  },
  tableHeader2: {
    color: '#949494',
    fontFamily: 'Poppins-Medium',
    fontSize: responsiveFontSize(1.7),
    textAlign: 'left',
    fontWeight: 'bold',
  },
  detailsHeader: {
    color: '#339999',
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(1.6),
    marginBottom: 3
  },
  detailsValue: {
    color: '#949494',
    fontFamily: 'Outfit-Regular',
    fontSize: responsiveFontSize(1.6),
  },
});

export default MapForAllShipments;
