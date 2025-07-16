import React, { useState, useContext, useEffect } from 'react'
import { View, Text, SafeAreaView, StyleSheet, ScrollView, ImageBackground, Image, TouchableOpacity } from 'react-native'
import CheckBox from '@react-native-community/checkbox'
import CustomHeader from '../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TextInput, LongPressGestureHandler, State } from 'react-native-gesture-handler'
import { dollerImg, starImg, userPhoto, contactImg, bankDetailsImg, documentImg, reviewImg, deleteImg } from '../utils/Images'
import CustomButton from '../components/CustomButton'
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Modal from "react-native-modal";
import Icon from 'react-native-vector-icons/Entypo';
import axios from 'axios';
import { API_URL } from '@env'
import Loader from '../utils/Loader'
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const ProfileScreen = ({  }) => {
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);
  const [userInfo, setuserInfo] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalVisible, setModalVisible] = useState(false);
  const [totalRating, setTotalRating] = useState(0)
  const [totalEarning, setTotalEarning] = useState(0)


  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  }; 

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
          console.log(JSON.stringify(userInfo), 'user details from profile page')
          setuserInfo(userInfo)
          setTotalRating(res.data.response.records.total_rating)
          console.log(res.data.response.records.total_rating);
          setTotalEarning(res.data.response.records.totalEarn)
          setIsLoading(false);
        })
        .catch(e => {
          console.log(`Profile error ${e}`)
        });
    });
  }

  useEffect(() => {
    fetchProfileDetails()
  }, [])
  useFocusEffect(
    React.useCallback(() => {
      fetchProfileDetails()
    }, [])
  )

  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={styles.Container}>
      <CustomHeader commingFrom={'Profile'} onPress={() => navigation.goBack()} title={'Profile'} />
      <ScrollView style={styles.wrapper}>
        <View style={styles.mainView}>
          {userInfo?.profilePic ?
            <Image
              source={{ uri: userInfo?.profilePic  + '?' + new Date() }}
              style={styles.headerImage}
            /> :
            <Image
              source={userPhoto}
              style={styles.headerImage}
            />
          }
          <Text style={styles.maintext}>{userInfo?.name} </Text>
          <Text style={styles.subtext}>{userInfo?.phone}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, marginBottom: 10 }}>
          <View style={styles.firstCardView}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={starImg}
                style={styles.iconImage}
              />
              <Text style={{ color: '#9C9C9C', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), marginLeft: 10 }}>Rating</Text>
            </View>
            <Text style={{ color: '#2F2F2F', fontFamily: 'Outfit-Bold', fontSize: responsiveFontSize(3), marginTop: 10 }}>{totalRating} Star</Text>
          </View>
          <View style={styles.firstCardView}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={dollerImg}
                style={styles.iconImage}
              />
              <Text style={{ color: '#9C9C9C', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), marginLeft: 10 }}>Total Earning</Text>
            </View>
            <Text style={{ color: '#2F2F2F', fontFamily: 'Outfit-Bold', fontSize: responsiveFontSize(3), marginTop: 10 }}>${totalEarning}</Text>
          </View>
        </View>
        <View style={{ marginTop: 20 }}>
          <TouchableOpacity onPress={() => navigation.navigate('ContactInformation')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: '#F4F4F4', borderBottomWidth: 1, paddingVertical: 10 }}>
              <Image
                source={contactImg}
                style={styles.iconImage}
              />
              <Text style={{ color: '#9C9C9C', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), marginLeft: 10 }}>Contact Information</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('BankInformation')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: '#F4F4F4', borderBottomWidth: 1, paddingVertical: 10 }}>
              <Image
                source={bankDetailsImg}
                style={styles.iconImage}
              />
              <Text style={{ color: '#9C9C9C', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), marginLeft: 10 }}>Bank Details</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('EditDocuments')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: '#F4F4F4', borderBottomWidth: 1, paddingVertical: 10 }}>
              <Image
                source={documentImg}
                style={styles.iconImage}
              />
              <Text style={{ color: '#9C9C9C', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), marginLeft: 10 }}>Documents</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ReviewScreen')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: '#F4F4F4', borderBottomWidth: 1, paddingVertical: 10 }}>
              <Image
                source={reviewImg}
                style={styles.iconImage}
              />
              <Text style={{ color: '#9C9C9C', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), marginLeft: 10 }}>Reviews</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('TermsScreen')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: '#F4F4F4', borderBottomWidth: 1, paddingVertical: 10 }}>
              <Image
                source={documentImg}
                style={styles.iconImage}
              />
              <Text style={{ color: '#9C9C9C', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), marginLeft: 10 }}>Term of service</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleModal()}>
            <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: '#F4F4F4', borderBottomWidth: 1, paddingVertical: 10 }}>
              <Image
                source={deleteImg}
                style={styles.iconImage}
              />
              <Text style={{ color: '#EB0000', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), marginLeft: 10 }}>Log Out</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal
        isVisible={isModalVisible}
        style={{
          margin: 0, // Add this line to remove the default margin
          justifyContent: 'flex-end',
        }}>
        <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', height: 50, width: 50, borderRadius: 25, position: 'absolute', bottom: '40%', left: '45%', right: '45%' }}>
          <Icon name="cross" size={30} color="#900" onPress={toggleModal} />
        </View>
        <View style={{ height: '35%', backgroundColor: '#fff', position: 'absolute', bottom: 0, width: '100%' }}>
          <View style={{ justifyContent: 'center', alignItems: 'center', paddingTop: 20 }}>
            <Text style={{ color: '#2F2F2F', fontFamily: 'Outfit-Bold', fontSize: responsiveFontSize(2.7), marginBottom: 10 }}>Are you sure want to log out?</Text>
            <View style={styles.buttonwrapper}>
              <CustomButton label={"Yes, log me out"}
                onPress={() => logout()}
              />
            </View>
            <View style={styles.buttonwrapper}>
              <CustomButton label={"Cancel"}
                buttonColor='red'
                onPress={() => toggleModal()}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

export default ProfileScreen

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  wrapper: {
    padding: 20,
    marginBottom: responsiveHeight(1)
  },
  headerImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10
  },
  iconImage: {
    width: 23,
    height: 23,
  },
  buttonwrapper1: {
    padding: 20,
    position: 'absolute',
    bottom: 70,
    width: responsiveWidth(100)
  },
  buttonwrapper2: {
    padding: 20,
    position: 'absolute',
    bottom: 0,
    width: responsiveWidth(100)
  },
  mainView: {
    flexDirection: 'column',
    alignItems: 'center',
    borderBottomColor: '#E3E3E3',
    //borderBottomWidth: 1,
    paddingBottom: 20
  },
  maintext: {
    color: '#2F2F2F',
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(3),
    marginBottom: 5
  },
  subtext: {
    color: '#9C9C9C',
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(2),
    marginBottom: 5
  },
  imageView: {
    flexDirection: 'row',
    marginBottom: 10
  },
  iconText: {
    color: '#9C9C9C',
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(2)
  },
  deviceText: {
    color: '#9C9C9C',
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(2),
    marginBottom: 10
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },
  editButtonView: {
    backgroundColor: '#4B47FF',
    height: responsiveHeight(5),
    width: responsiveWidth(25),
    borderRadius: 8,
    marginLeft: 5,
    marginRight: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly'
  },
  editButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(2)
  },
  deleteButtonView: {
    backgroundColor: '#EEEEEE',
    height: responsiveHeight(5),
    width: responsiveWidth(25),
    borderRadius: 8,
    marginLeft: 5,
    marginRight: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly'
  },
  deleteButtonText: {
    color: '#EB0000',
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(2)
  },
  firstCardView: {
    height: responsiveHeight(13),
    width: responsiveWidth(42),
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    padding: 10,
    borderColor: '#E0E0E0',
    borderWidth: 1
  },
  buttonwrapper: {
    paddingHorizontal: 20,
    paddingTop: 10,
    width: '100%'
  },
});
