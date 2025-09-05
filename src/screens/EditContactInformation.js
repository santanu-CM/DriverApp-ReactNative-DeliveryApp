import React, { useState, useContext, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, Alert, Image, TouchableOpacity, KeyboardAvoidingView } from 'react-native'
import CheckBox from '@react-native-community/checkbox'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { Dropdown } from 'react-native-element-dropdown';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import {launchImageLibrary} from 'react-native-image-picker';
import { TextInput, LongPressGestureHandler, State } from 'react-native-gesture-handler'
import { deleteImg, editImg, phoneImg, plus, searchImg, userPhoto } from '../utils/Images'
import CustomHeader from '../components/CustomHeader'
import CustomButton from '../components/CustomButton'
import InputField from '../components/InputField';
import { AuthContext } from '../context/AuthContext';
import { useHeaderHeight } from "@react-navigation/elements";
import Loader from '../utils/Loader';
import { API_URL } from '@env'
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native'; 
import { SafeAreaView } from 'react-native-safe-area-context';

const EditContactInformation = ({ route }) => {
  const navigation = useNavigation();
  const { userInfo } = useContext(AuthContext);
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const [isLoading, setIsLoading] = useState(true)
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [phoneno, setPhone] = useState(''); 
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postaddress, setPostaddress] = useState('');
  const [pickedDocument, setPickedDocument] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [firstNameError, setFirstNameError] = useState('')

  const headerHeight = useHeaderHeight();

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
          console.log(userInfo, 'user details')
          const name = userInfo?.name;
          const nameParts = name.split(" ");
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(" ");
          setFirstname(firstName)
          setLastname(lastName)
          setPhone(userInfo?.phone)
          setEmail(userInfo?.email)
          setAddress(userInfo?.address)
          setCity(userInfo?.city)
          setPostaddress(userInfo?.zipcode)
          //setPickedDocument(userInfo?.photo)
          setImageFile(userInfo?.profilePic)
          setValue(userInfo?.roll)
          setIsLoading(false);
        })
        .catch(e => {
          console.log(`User fetch error ${e}`)
        });
    });
  }

  useEffect(() => {
    fetchProfileDetails()
  }, [])

  // const pickDocument = async () => {
  //   try {
  //     const result = await DocumentPicker.pick({
  //       type: [DocumentPicker.types.allFiles],
  //     });

  //     //console.log('URI: ', result[0].uri);
  //     //console.log('Type: ', result[0].type);
  //     //console.log('Name: ', result[0].name);
  //     //console.log('Size: ', result[0].size);

  //     setPickedDocument(result[0]);
  //     await fileUpload(result[0].uri)
  //   } catch (err) {
  //     if (DocumentPicker.isCancel(err)) {
  //       // User cancelled the document picker
  //       console.log('Document picker was cancelled');
  //     } else {
  //       console.error('Error picking document', err);
  //     }
  //   }
  // };
  const pickDocument = async () => {
    try {
        const options = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
        };

        launchImageLibrary(options, async (response) => {
            if (response.didCancel) {
                console.log('Document picker was cancelled');
                return;
            }
            
            if (response.errorMessage) {
                console.error('Error picking document', response.errorMessage);
                return;
            }

            if (response.assets && response.assets.length > 0) {
                const pickedDocument = response.assets[0];
                
                //console.log('URI: ', pickedDocument.uri);
                //console.log('Type: ', pickedDocument.type);
                //console.log('Name: ', pickedDocument.fileName);
                //console.log('Size: ', pickedDocument.fileSize);

                setPickedDocument(pickedDocument);
                await fileUpload(pickedDocument.uri);
            }
        });

    } catch (err) {
        console.error('Error picking document', err);
    }
};

  const fileUpload = async (uri) => {
    AsyncStorage.getItem('userToken', (err, usertoken) => {
      const formData = new FormData();
      formData.append("profilePic", {
        uri: uri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });
      console.log(JSON.stringify(formData),'bbb')
      axios.post(`${process.env.API_URL}/api/driver/driver-upload-documents`, formData, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          "Authorization": 'Bearer ' + usertoken,
        },
      })
        .then(res => {
          console.log(res.data.response)
          if (res.data.response.status.code === 200) {
            setIsLoading(false)
            Toast.show({
              type: 'success',
              text1: 'Hello',
              text2: "Photo Update Successfully",
              position: 'top',
              topOffset: Platform.OS == 'ios' ? 55 : 20
            });
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
          console.log(`user update error ${e}`)
          console.log(e.response.data?.response)
          Alert.alert('Oops..', "Something went wrong", [
            {
              text: 'Cancel',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
            { text: 'OK', onPress: () => console.log('OK Pressed') },
          ]);
        });
    });
  }

  const updateProfile = () => {
    AsyncStorage.getItem('userToken', (err, usertoken) => {
      setIsLoading(true)
      var option = {}
      if (email) {
        var option = {
          "firstName": firstname,
          "lastName": lastname,
          "email": email,
          "address": address,
          "zipcode": postaddress,
          "city": city
        }
      } else {
        var option = {
          "firstName": firstname,
          "lastName": lastname,
          "address": address,
          "zipcode": postaddress,
          "city": city
        }
      }
      axios.post(`${process.env.API_URL}/api/driver/updateInformation`, option, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          "Authorization": 'Bearer ' + usertoken,
        },
      })
        .then(res => {
          console.log(res.data)
          if (res.data.response.status.code === 200) {
            setIsLoading(false)
            Toast.show({
              type: 'success',
              text1: 'Hello',
              text2: "Update Successfully",
              position: 'top',
              topOffset: Platform.OS == 'ios' ? 55 : 20
            });
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
          console.log(`user update error ${e}`)
          console.log(e.response)
          Alert.alert('Oops..', "Something went wrong", [
            {
              text: 'Cancel',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
            { text: 'OK', onPress: () => console.log('OK Pressed') },
          ]);
        });
    });

  }


  if (isLoading) {
    return (
      <Loader />
    )
  }
  return (
    <SafeAreaView style={styles.Container}>
      <CustomHeader commingFrom={'editProfile'} onPress={() => navigation.goBack()} title={'Edit Profile'} />
      <KeyboardAwareScrollView>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.imageView}>

            {pickedDocument == null ?
              imageFile != null ?
                <Image
                  source={{ uri: imageFile  + '?' + new Date()}}
                  style={styles.imageStyle}
                /> :
                <Image
                  source={userPhoto}
                  style={styles.imageStyle}
                /> :
              <Image
                source={{ uri: pickedDocument.uri }}
                style={styles.imageStyle}
              />

            }
            <TouchableOpacity style={styles.plusIcon} onPress={() => pickDocument()}
            >
              <Image source={plus} style={{ height: 23, width: 23 }} />
            </TouchableOpacity>
          </View>
          <Text style={styles.tableHeader}>Upload profile photo</Text>
          <View style={styles.textinputview}>
            <Text
              style={styles.header}>
              Primary mobile number
            </Text>
            <View style={styles.inputView}>
              <InputField
                label={'Mobile number'}
                keyboardType=" "
                value={phoneno}
                helperText={firstNameError}
                inputType={'nonedit'}
                editable={false}
              //onChangeText={(text) => changeFirstname(text)}
              />
            </View>
            <Text
              style={styles.header}>
              First Name
            </Text>
            <View style={styles.inputView}>
              <InputField
                label={'First name'}
                keyboardType=" "
                value={firstname}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => setFirstname(text)}
              />
            </View>
            <Text
              style={styles.header}>
              Last Name
            </Text>
            <View style={styles.inputView}>
              <InputField
                label={'Last Name'}
                keyboardType=" "
                value={lastname}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => setLastname(text)}
              />
            </View>
            <Text
              style={styles.header}>
              Email
            </Text>
            <View style={styles.inputView}>
              <InputField
                label={'e.g. abc@gmail.com'}
                keyboardType=" "
                value={email}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => setEmail(text)}
              />
            </View>
            <Text
              style={styles.header}>
              Address
            </Text>
            <View style={styles.inputView}>
              <InputField
                label={'Address'}
                keyboardType=" "
                value={address}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => setAddress(text)}
              />
            </View>
            <Text
              style={styles.header}>
              City
            </Text>
            <View style={styles.inputView}>
              <InputField
                label={'City'}
                keyboardType=" "
                value={city}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => setCity(text)}
              />
            </View>
            <Text
              style={styles.header}>
              Ghana Post Address
            </Text>
            <View style={styles.inputView}>
              <InputField
                label={'Post Address'}
                keyboardType=" "
                value={postaddress}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => setPostaddress(text)}
              />
            </View>
          </View>


        </ScrollView>
        <View style={styles.buttonwrapper}>
          <CustomButton label={"Update Changes"} buttonIcon={false} onPress={() => updateProfile()} />
        </View>
      </KeyboardAwareScrollView>

    </SafeAreaView>
  )
}

export default EditContactInformation

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  wrapper: {
    padding: 20,
    marginBottom: responsiveHeight(1)
  },
  textinputview: {
    marginTop: responsiveHeight(5),
    paddingHorizontal: 20,
  },
  mobileinputview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    //marginBottom: responsiveHeight(5),
    paddingHorizontal: 20
  },
  imageView: {
    marginTop: responsiveHeight(4),
    paddingHorizontal: 20,
    alignSelf: 'center'
  },
  imageStyle: {
    height: 90,
    width: 90,
    borderRadius: 40,
    marginBottom: 10
  },
  plusIcon: {
    position: 'absolute',
    bottom: 10,
    left: 75
  },
  inputView: {
    //paddingVertical: 2
  },
  dropdown: {
    height: responsiveHeight(8),
    borderColor: 'gray',
    borderWidth: 0.7,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginTop: 5
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  dropdownView: {
    marginBottom: 35,
    paddingHorizontal: 20,
  },
  buttonwrapper: {
    padding: 20,
    // position: 'absolute',
    // bottom: 0,
    width: responsiveWidth(100),
    marginBottom: responsiveHeight(5)
  },
  tableHeader: {
    color: '#444444',
    fontFamily: 'Poppins-SemiBold',
    fontSize: responsiveFontSize(2),
    fontWeight: 'bold',
    textAlign: 'left',
  },
  tableHeader: {
    color: '#444444',
    fontFamily: 'Poppins-SemiBold',
    fontSize: responsiveFontSize(2),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  header: {
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(2),
    color: '#2F2F2F',
    marginBottom: responsiveHeight(1),
    textAlign: 'left',
    marginTop: -10
  },
});