import React, { useContext, useState, useEffect } from 'react'
import { View, Text, SafeAreaView, StyleSheet, ScrollView, ImageBackground, Image, FlatList, Alert } from 'react-native'
import CustomHeader from '../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { userPhoto } from '../utils/Images'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from '@env'
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import Loader from '../utils/Loader'

const RequestScreen = ({ navigation, route }) => {
  const [allRequest, setAllRequest] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = () => {
    AsyncStorage.getItem('userToken', (err, usertoken) => {
      axios.get(`${API_URL}/public/api/user/pendinglist`, {
        headers: {
          "Authorization": 'Bearer ' + usertoken,
          "Content-Type": 'application/json'
        },
      })
        .then(res => {
          setIsLoading(false);
          if (res.data.st == '200') {
            //console.log(res.data.totalpendingusers, 'dsfsdfsd')
            setAllRequest(res.data.totalpendingusers)
          } 

        })
        .catch(e => {
          console.log(`usercount error ${e}`)
        });
    });

  }

  const declineRequest = (id) => {
    Alert.alert('Decline Request', 'Are you sure to decline request?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'OK', onPress: () => {
          const option = {
            "userId": id,
            "flag": 'block'
          }
          AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${API_URL}/public/api/user/requestingaction`, option, {
              headers: {
                Accept: 'application/json',
                "Authorization": 'Bearer ' + usertoken,
              },
            })
              .then(res => {
                console.log(res.data)
                if (res.data.st == '400') {
                  setIsLoading(false)
                  Alert.alert('Oops..', res.data.message, [
                    {
                      text: 'Cancel',
                      onPress: () => console.log('Cancel Pressed'),
                      style: 'cancel',
                    },
                    { text: 'OK', onPress: () => console.log('OK Pressed') },
                  ]);
                } else if (res.data.st == '200') {
                  console.log(res.data, 'data from phone Verify api')
                  Toast.show({
                    type: 'success',
                    text1: 'Hello',
                    text2: res.data.massage,
                    position: 'top',
                    topOffset: Platform.OS == 'ios' ? 55 : 20
                  });
                  setAllRequest(res.data.totalpendingusers)
                  setIsLoading(false)

                }
              })
              .catch(e => {
                console.log(`user update error ${e}`)
              });
          });
        }

      },
    ]);
  }

  const renderMyDeliveries = ({ item, index }) => {

    return (
      <View style={styles.card} elevation={2}>
        <Text style={{ color: '#2F2F2F', fontFamily: 'Outfit-Bold', fontSize: responsiveFontSize(2.7) }}>{item.phone}</Text>
        <View style={styles.headerBottomMargin} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
          <TouchableOpacity onPress={() => navigation.navigate('GenerateOtp',{userid:item.id})} style={[styles.buttonView, { backgroundColor: '#0FC257' }]}>
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.buttonView, { backgroundColor: '#EB0000' }]} onPress={() => declineRequest(item.id)}>
            <Text style={styles.buttonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  useEffect(() => {
    fetchData();
  }, [])
  useFocusEffect(
    React.useCallback(() => {
      fetchData()
    }, [])
  )

  if (isLoading) {
    return (
        <Loader />
    )
}
  return (
    <SafeAreaView style={styles.Container}>
      <CustomHeader commingFrom={'Requests'} onPress={() => navigation.goBack()} title={'Requests'} />
      <ScrollView style={styles.wrapper}>
        <FlatList
          data={allRequest}
          renderItem={renderMyDeliveries}
          keyExtractor={(item, index) => index}
          horizontal={false}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          initialNumToRender={5}
          numColumns={1}
        />

      </ScrollView>

    </SafeAreaView>
  )
}

export default RequestScreen

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: '#FBFBFB'
  },
  wrapper: {
    padding: 20,
    marginBottom: responsiveHeight(1)
  },
  card: {
    padding: 10,
    backgroundColor: '#FFF',
    height: responsiveHeight(20),
    width: responsiveWidth(90),
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 5,
    marginBottom: 5
  },
  headerBottomMargin: {
    borderBottomColor: '#E3E3E3',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10
  },
  buttonView: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 30,
    height: responsiveHeight(7),
    width: responsiveWidth(40)
  },
  buttonText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: responsiveFontSize(2),
    color: '#FFFFFF',
    alignSelf: 'center',
    textAlign: 'center',
    marginTop: responsiveHeight(0.3)
  }
});
