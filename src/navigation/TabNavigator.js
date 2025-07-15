import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Text, Image, View, Platform } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationScreen from '../screens/NotificationScreen';
import EditContactInformation from '../screens/EditContactInformation';
import OrderScreen from '../screens/OrderScreen';
import ContactInformation from '../screens/ContactInformation';

import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import Feather from 'react-native-vector-icons/Feather';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import EditBankInformation from '../screens/EditBankInformation';
import EditCapacityInformation from '../screens/EditCapacityInformation';
import BatchDetails from '../screens/BatchDetails';
import LocationConfirmation from '../screens/LocationConfirmation';
import ItemVerifiedScreen from '../screens/ItemVerifiedScreen';
import MapForAllPickup from '../screens/MapForAllPickup';
import NewOrderScreen from '../screens/NewOrderScreen';
import BankInformation from '../screens/BankInformation';
import EditDocuments from '../screens/EditDocuments';
import ReviewScreen from '../screens/ReviewScreen';
import TermsScreen from '../screens/TermsScreen';
import OrderSummary from '../screens/OrderSummary';
import NewShippingOrderScreen from '../screens/NewShippingOrderScreen';
import { homeFillImg, homeNotFillImg, orderFillImg, orderNotFillImg, profileFillImg, profileNotFillImg, shippingFillImg, shippingNotFillImg } from '../utils/Images';
import OrderShippingScreen from '../screens/OrderShippingScreen';
import ShippingOrderDetails from '../screens/ShippingOrderDetails';
import ShippingLocationConfirmation from '../screens/ShippingLocationConfirmation';
import ShippingItemVerifiedScreen from '../screens/ShippingItemVerifiedScreen';
import { useFocusEffect } from '@react-navigation/native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = ({ navigation }) => {
  useFocusEffect(
    React.useCallback(() => {
      // Reset to the initial screen (TherapistList) whenever the tab is focused
      navigation.navigate('Home');
    }, [navigation])
  );
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Notification"
        component={NotificationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditContactInformation"
        component={EditContactInformation}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditBankInformation"
        component={EditBankInformation}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditCapacityInformation"
        component={EditCapacityInformation}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NewOrderScreen"
        component={NewOrderScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NewShippingOrderScreen"
        component={NewShippingOrderScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name='OrderSummary'
        component={OrderSummary}
        options={{ headerShown: false }}
      />

    </Stack.Navigator>
  );
};

const ShippingStack = ({ navigation }) => {
  useFocusEffect(
    React.useCallback(() => {
      // Reset to the initial screen (TherapistList) whenever the tab is focused
      navigation.navigate('OrderShippingScreen');
    }, [navigation])
  );
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="OrderShippingScreen"
        component={OrderShippingScreen}
        options={{ headerShown: false }}
      />
       <Stack.Screen
        name="ShippingOrderDetails"
        component={ShippingOrderDetails}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ShippingLocationConfirmation"
        component={ShippingLocationConfirmation}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ShippingItemVerifiedScreen"
        component={ShippingItemVerifiedScreen}
        options={{ headerShown: false }}
      />
      {/* <Stack.Screen
        name="BatchDetails"
        component={BatchDetails}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LocationConfirmation"
        component={LocationConfirmation}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name='ItemVerifiedScreen'
        component={ItemVerifiedScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name='OrderSummary'
        component={OrderSummary}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name='MapForAllPickup'
        component={MapForAllPickup}
        options={{ headerShown: false }}
      /> */}
    </Stack.Navigator>
  )

};

const OrderStack = ({ navigation }) => {
  useFocusEffect(
    React.useCallback(() => {
      // Reset to the initial screen (TherapistList) whenever the tab is focused
      navigation.navigate('OrderScreen');
    }, [navigation])
  );
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="OrderScreen"
        component={OrderScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BatchDetails"
        component={BatchDetails}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LocationConfirmation"
        component={LocationConfirmation}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name='ItemVerifiedScreen'
        component={ItemVerifiedScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name='OrderSummary'
        component={OrderSummary}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name='MapForAllPickup'
        component={MapForAllPickup}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )

};

const ProfileStack = ({ navigation }) => {
  useFocusEffect(
    React.useCallback(() => {
      // Reset to the initial screen (TherapistList) whenever the tab is focused
      navigation.navigate('ProfileScreen');
    }, [navigation])
  );
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ContactInformation"
        component={ContactInformation}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BankInformation"
        component={BankInformation}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditDocuments"
        component={EditDocuments}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ReviewScreen"
        component={ReviewScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TermsScreen"
        component={TermsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )

};

const TabNavigator = () => {
  const cartProducts = useSelector(state => state.cart)
  console.log(cartProducts)
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarInactiveTintColor: '#CACCCE',
        tabBarActiveTintColor: '#339999',
        tabBarStyle: {
          height: 100,
        },
      }}>
      <Tab.Screen
        name="HOME"
        component={HomeStack}
        options={({ route }) => ({
          tabBarStyle: {
            display: getTabBarVisibility(route),
            backgroundColor: '#FFFFFF',
            width: responsiveWidth(80),
            height: responsiveHeight(8),
            alignSelf: 'center',
            marginTop: -responsiveHeight(10),
            borderRadius: 30,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#CACCCE'
          },
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', }}>
              <Image source={focused ? homeFillImg : homeNotFillImg} style={{ width: responsiveWidth(6), height: responsiveHeight(4) }} />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontSize: responsiveFontSize(1.2), marginBottom: Platform.OS === 'ios' ? -responsiveHeight(2) : 5  }}>Home</Text>
          ),
        })}
      />
       <Tab.Screen
        name="Shipping"
        component={ShippingStack}
        options={({ route }) => ({
          tabBarStyle: {
            display: getTabBarVisibility(route),
            backgroundColor: '#FFFFFF',
            width: responsiveWidth(80),
            height: responsiveHeight(8),
            alignSelf: 'center',
            marginTop: -responsiveHeight(10),
            borderRadius: 30,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#CACCCE'
          },
          tabBarIcon: ({ color, size,focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', }}>
              <Image source={focused ? shippingFillImg : shippingNotFillImg} style={{ width: responsiveWidth(6), height: responsiveHeight(4) }} />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontSize: responsiveFontSize(1.2), marginBottom: Platform.OS === 'ios' ? -responsiveHeight(2) : 5  }}>Shipping</Text>
          ),
        })}
      />
      <Tab.Screen
        name="Orders"
        component={OrderStack}
        options={({ route }) => ({
          tabBarStyle: {
            display: getTabBarVisibility(route),
            backgroundColor: '#FFFFFF',
            width: responsiveWidth(80),
            height: responsiveHeight(8),
            alignSelf: 'center',
            marginTop: -responsiveHeight(10),
            borderRadius: 30,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#CACCCE'
          },
          tabBarIcon: ({ color, size,focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', }}>
              <Image source={focused ? orderFillImg : orderNotFillImg} style={{ width: responsiveWidth(6), height: responsiveHeight(4) }} />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontSize: responsiveFontSize(1.2), marginBottom: Platform.OS === 'ios' ? -responsiveHeight(2) : 5  }}>Orders</Text>
          ),
        })}
      />
      <Tab.Screen
        name="PROFILE"
        component={ProfileStack}
        options={({ route }) => ({
          tabBarStyle: {
            display: getTabBarVisibility(route),
            backgroundColor: '#FFFFFF',
            width: responsiveWidth(80),
            height: responsiveHeight(8),
            alignSelf: 'center',
            marginTop: -responsiveHeight(10),
            borderRadius: 30,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#CACCCE'
          },
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', }}>
            <Image source={focused ? profileFillImg : profileNotFillImg} style={{ width: responsiveWidth(8), height: responsiveHeight(4) }} />
          </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontSize: responsiveFontSize(1.2), marginBottom: Platform.OS === 'ios' ? -responsiveHeight(2) : 5  }}>Profile</Text>
          ),
        })}
      />
    </Tab.Navigator>
  );
};

const getTabBarVisibility = route => {
  // console.log(route);
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'Feed';
  console.log(routeName);

  if (routeName == 'MapForAllPickup') {
    return 'none';
  } else if (routeName == 'BatchDetails') {
    return 'none';
  } else if (routeName == 'NewOrderScreen') {
    return 'none';
  } else if (routeName == 'ContactInformation') {
    return 'none';
  } else if (routeName == 'BankInformation') {
    return 'none';
  } else if (routeName == 'EditDocuments') {
    return 'none';
  } else if (routeName == 'ReviewScreen') {
    return 'none';
  } else if (routeName == 'TermsScreen') {
    return 'none';
  } else if (routeName == 'OrderSummary') {
    return 'none';
  } else {
    return 'flex';
  }

};

export default TabNavigator;
