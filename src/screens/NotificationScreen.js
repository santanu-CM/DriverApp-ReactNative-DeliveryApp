import React, { useContext, useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, ImageBackground, Image, Platform, Alert } from 'react-native'
import CustomHeader from '../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { notifyImg } from '../utils/Images'
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NoNotification from './NoNotification';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useNavigation } from '@react-navigation/native';

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [notifyStatus, setnotifyStatus] = useState(false)
  
 
  useEffect(() => {
    if (Platform.OS == 'android') {
      const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
        Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
        console.log('Received foreground message:', JSON.stringify(remoteMessage));
        setNotifications(prevNotifications => {
          const newNotifications = [...prevNotifications, remoteMessage];
          AsyncStorage.setItem('notifications', JSON.stringify(newNotifications));
          setnotifyStatus(true)
          return newNotifications;
        });
      });
 
      const unsubscribeBackground = messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Received background message:', remoteMessage);
        setNotifications(prevNotifications => {
          const newNotifications = [...prevNotifications, remoteMessage];
          AsyncStorage.setItem('notifications', JSON.stringify(newNotifications));
          setnotifyStatus(true)
          return newNotifications;
        });
      });

      // Load notifications from AsyncStorage when component mounts
      AsyncStorage.getItem('notifications').then((value) => {
        if (value !== null) {
          setNotifications(JSON.parse(value));
          setnotifyStatus(true)
        }
      });

      return () => {
        unsubscribeForeground();
        //unsubscribeBackground();
      };
    }
  }, [])

  const handleSwipeLeft = (index) => {
    const updatedNotifications = [...notifications];
    updatedNotifications.splice(index, 1); // Remove the notification at the given index
    setNotifications(updatedNotifications);
    AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications)); // Update AsyncStorage
  }

  if (notifyStatus == false) {
    return (
      <NoNotification />
    )
  }

  return (
    <SafeAreaView style={styles.Container}>
      <CustomHeader commingFrom={'Notification'} onPress={() => navigation.goBack()} title={'Notification'} />
      <ScrollView style={styles.wrapper}>

        {notifications.map((notification, index) => (
          <Swipeable
            key={index}
            renderLeftActions={() => (
              <TouchableOpacity onPress={() => handleSwipeLeft(index)}>
                <View style={styles.swipeLeftContainer}>
                  <Text style={styles.swipeLeftText}>Remove</Text>
                </View>
              </TouchableOpacity>
            )}
          >
            <TouchableOpacity onPress={()=> navigation.navigate('Home')}>
              <View style={styles.notifictionContainer}>
                <View style={styles.singlenotificationView}>
                  <View style={{ height: 50, width: 50, borderRadius: 50 / 2, backgroundColor: '#F8F7F9', justifyContent: 'center', alignItems: 'center' }}>
                    <Image
                      source={notifyImg}
                      style={styles.iconImage}
                    />
                  </View>
                  <View style={styles.notificationTextView}>
                    <Text style={styles.notificationTextOne}>{notification?.notification?.body}</Text>
                    <Text style={styles.notificationTextTwo}>{new Date(notification.sentTime).toLocaleString()}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Swipeable>
        ))}

      </ScrollView>
    </SafeAreaView>
  )
}


export default NotificationScreen


const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  wrapper: {
    padding: 20,
    marginBottom: responsiveHeight(1)
  },
  clearNotitext: {
    alignSelf: 'flex-end',
    color: '#310499',
    fontSize: responsiveFontSize(2),
    fontFamily: 'Outfit-SemiBold'
  },
  iconImage: {
    width: 23,
    height: 23,
  },
  notifictionContainer: {
    paddingVertical: 5,
    borderBottomColor: '#E3E3E3',
    borderBottomWidth: 1,
  },
  singlenotificationView: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  notificationTextView: {
    flexDirection: 'column',
    width: responsiveWidth(70),
    padding: 10
  },
  notificationTextOne: {
    color: '#2F2F2F',
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(1.8)
  },
  notificationTextTwo: {
    color: '#9C9C9C',
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(1.6)
  },
  swipeLeftContainer: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '100%'
  },
  swipeLeftText: {
    color: 'white',
    fontWeight: 'bold'
  }
});
