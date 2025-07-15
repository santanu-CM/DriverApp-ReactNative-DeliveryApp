import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import OtpScreen from '../screens/OtpScreen';
import PersonalInformation from '../screens/PersonalInformation';
import NotificationScreen from '../screens/NotificationScreen';
import DocumentsUpload from '../screens/DocumentsUpload';
import CapacityDetails from '../screens/CapacityDetails';
import BankDetails from '../screens/BankDetails';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {/* <Stack.Screen name="Onboarding" component={OnboardingScreen} /> */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />
      <Stack.Screen name="PersonalInformation" component={PersonalInformation} />
      <Stack.Screen name="DocumentsUpload" component={DocumentsUpload} />
      <Stack.Screen name="CapacityDetails" component={CapacityDetails} />
      <Stack.Screen name="BankDetails" component={BankDetails} />
    </Stack.Navigator>
  );
};

export default AuthStack;
