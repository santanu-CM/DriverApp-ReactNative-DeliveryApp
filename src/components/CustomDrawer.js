import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  Switch
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { AuthContext } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { API_URL } from '@env'
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { userPhoto } from '../utils/Images';
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import LinearGradient from 'react-native-linear-gradient';

const CustomDrawer = props => {
  const { logout } = useContext(AuthContext);
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  const [userInfo, setuserInfo] = useState([])
  const [loading, setLoading] = useState(true);

  const fetchProfileDetails = () => {
    AsyncStorage.getItem('userToken', (err, usertoken) => {
      axios.get(`${API_URL}/api/driver/driver-profile`, { 
        headers: {
          "Authorization": 'Bearer ' + usertoken,
          "Content-Type": 'application/json'
        },
      })
        .then(res => {
          let userInfo = res.data.response.records.data;
          console.log(userInfo, 'user data from contact informmation')
          setuserInfo(userInfo)
          setLoading(false);
        })
        .catch(e => {
          console.log(`Profile error ${e}`)
        });
    });
  }
  useFocusEffect(
    React.useCallback(() => {
      fetchProfileDetails()
    }, [])
  )
  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ backgroundColor: '#EEFFFF' }}>
        <View style={{ backgroundColor: '#EEFFFF', padding: 20, height: responsiveHeight(20), alignSelf: 'center', justifyContent: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {userInfo?.profilePic ?
              <Image
                source={{ uri: userInfo?.profilePic + '?' + new Date() }}
                style={{ height: 60, width: 60, borderRadius: 40, marginBottom: 10, marginTop: 10, marginRight: 20 }}
              />
              :
              <Image
                source={userPhoto}
                style={{ height: 60, width: 60, borderRadius: 40, marginBottom: 10, marginTop: 10, marginRight: 20 }}
              />
            }
            <View style={{ flexDirection: 'column', marginLeft: 10 }}>
            <ShimmerPlaceholder
                visible={!loading}
                style={{
                  marginLeft: 5,
                  // borderRadius:24
                }}
                shimmerColors={["#DDFFFF", "#8AC2C2", "#0E6767"]}
                LinearGradient={LinearGradient}
              >
              <Text
                style={{
                  color: '#3A3232',
                  fontSize: 18,
                  fontFamily: 'Outfit-Medium',
                  marginBottom: 5,
                }}>
                {userInfo.name}
              </Text>
              <Text
                style={{
                  color: '#949494',
                  fontFamily: 'Roboto-Regular',
                  marginRight: 5,
                }}>
                Delivery Partner
              </Text>
              </ShimmerPlaceholder>
            </View>
          </View>
          {/* <View style={{ backgroundColor: '#FFFFFF', height: responsiveHeight(6), width: responsiveWidth(61), borderRadius: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10,borderColor:'#E0E0E0',borderWidth:1 }}>
              <Text style={{ fontSize: 15, fontFamily: 'Outfit-Bold', marginLeft: 5, }}>Duty Status </Text>
              <Switch
                trackColor={{ false: '#767577', true: '#339999' }}
                thumbColor={isEnabled ? '#f4f3f4' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isEnabled}
              />
            </View> */}
        </View>
        <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 10 }}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>
      <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: '#ccc' }}>
        {/* <TouchableOpacity onPress={() => { }} style={{ paddingVertical: 15 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="share-social-outline" size={22} />
            <Text
              style={{
                fontSize: 15,
                fontFamily: 'Outfit-Medium',
                marginLeft: 5,
              }}>
              Tell a Friend
            </Text>
          </View>
        </TouchableOpacity> */}
        <TouchableOpacity onPress={() => { logout() }} style={{ paddingVertical: 15 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="exit-outline" size={22} color={'#2F2F2F'}/>
            <Text
              style={{
                fontSize: 15,
                fontFamily: 'Outfit-Medium',
                marginLeft: 5,
                color: '#2F2F2F'
              }}>
              Sign Out
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CustomDrawer;
