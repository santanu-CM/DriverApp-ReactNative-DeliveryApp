import React from 'react';
import { Image } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { homeImg, contactImg, helpImg, bankDetailsImg, documentImg, capacityImg, reviewImg, earningImg, acceptedOrderImg, completedOrderImg, availabilityImg, termsImg, supportImg } from '../utils/Images';
import CustomDrawer from '../components/CustomDrawer';

import Ionicons from 'react-native-vector-icons/Ionicons';

import FaqScreen from '../screens/FaqScreen';

import TabNavigator from './TabNavigator';
import TermsScreen from '../screens/TermsScreen';
import ContactInformation from '../screens/ContactInformation';
import BankInformation from '../screens/BankInformation';
import CapacityInformation from '../screens/CapacityInformation';
import AvailabilityScreen from '../screens/AvailabilityScreen';
import EarningScreen from '../screens/EarningScreen';
import ReviewScreen from '../screens/ReviewScreen';
import EditDocuments from '../screens/EditDocuments';
import MapForAllPickup from '../screens/MapForAllPickup';
import NewOrderScreen from '../screens/NewOrderScreen';
import OrderSummary from '../screens/OrderSummary';
import NoNotification from '../screens/NoNotification';
import Report from '../screens/Report';
import ReviewScreenShipment from '../screens/ReviewScreenShipment';
import EditBankInformation from '../screens/EditBankInformation';

const Drawer = createDrawerNavigator();

const AuthStack = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: '#EEFFFF',
        drawerActiveTintColor: '#333',
        drawerInactiveTintColor: '#949494',
        drawerLabelStyle: {
          marginLeft: 0,
          fontFamily: 'Outfit-Medium',
          fontSize: 15,
        },
        drawerStyle: {
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        },
        //swipeEdgeWidth: 0, //for off the drawer swipe
      }}>
      <Drawer.Screen
        name="Home"
        component={TabNavigator}
        options={{
          drawerIcon: ({ color }) => (
            // <Ionicons name="home-outline" size={22} color={color} />
            <Image source={homeImg} style={{ width: 25, height: 25 }} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Contact Information"
        component={ContactInformation}
        options={{
          drawerIcon: ({ color }) => (
            // <Ionicons name="settings-outline" size={22} color={color} />
            <Image source={contactImg} style={{ width: 25, height: 25 }} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Bank Details"
        component={BankInformation}
        options={{
          drawerIcon: ({ color }) => (
            // <Ionicons name="settings-outline" size={22} color={color} />
            <Image source={bankDetailsImg} style={{ width: 25, height: 25 }} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="My Availability"
        component={AvailabilityScreen}
        options={{
          drawerIcon: ({ color }) => (
            // <Ionicons name="settings-outline" size={22} color={color} />
            <Image source={availabilityImg} style={{ width: 25, height: 25 }} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Documents"
        component={EditDocuments}
        options={{
          drawerIcon: ({ color }) => (
            // <Ionicons name="settings-outline" size={22} color={color} />
            <Image source={documentImg} style={{ width: 25, height: 25 }} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="My Capacity"
        component={CapacityInformation}
        options={{
          drawerIcon: ({ color }) => (
            // <Ionicons name="settings-outline" size={22} color={color} />
            <Image source={capacityImg} style={{ width: 25, height: 25 }} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Reviews"
        component={ReviewScreen}
        options={{
          drawerIcon: ({ color }) => (
            // <Ionicons name="settings-outline" size={22} color={color} />
            <Image source={reviewImg} style={{ width: 25, height: 25 }} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Shipment Reviews"
        component={ReviewScreenShipment}
        options={{
          drawerIcon: ({ color }) => (
            // <Ionicons name="settings-outline" size={22} color={color} />
            <Image source={reviewImg} style={{ width: 25, height: 25 }} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Earning"
        component={EarningScreen}
        options={{
          drawerIcon: ({ color }) => (
            // <Ionicons name="settings-outline" size={22} color={color} />
            <Image source={earningImg} style={{ width: 25, height: 25 }} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Report"
        component={Report}
        options={{
          drawerIcon: ({ color }) => (
            // <Ionicons name="settings-outline" size={22} color={color} />
            <Image source={acceptedOrderImg} style={{ width: 25, height: 25 }} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="EditBankInformation"
        component={EditBankInformation}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      {/* <Drawer.Screen
        name="Complete Orders"
        component={OrderSummary}
        options={{
          drawerIcon: ({color}) => (
            // <Ionicons name="settings-outline" size={22} color={color} />
            <Image source={completedOrderImg} style={{ width: 25,height: 25}} color={color}/>
          ),
        }}
      /> */}
      {/* <Drawer.Screen
        name="Accepted Orders"
        component={NoNotification}
        options={{
          drawerIcon: ({color}) => (
            // <Ionicons name="settings-outline" size={22} color={color} />
            <Image source={acceptedOrderImg} style={{ width: 25,height: 25}} color={color}/>
          ),
        }}
      /> */}
      <Drawer.Screen
        name="Help & Support"
        component={FaqScreen}
        options={{
          drawerIcon: ({ color }) => (
            // <Ionicons name="settings-outline" size={22} color={color} />
            <Image source={supportImg} style={{ width: 25, height: 25 }} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Term of service"
        component={TermsScreen}
        options={{
          drawerIcon: ({ color }) => (
            // <Ionicons name="settings-outline" size={22} color={color} />
            <Image source={termsImg} style={{ width: 25, height: 25 }} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export default AuthStack;
