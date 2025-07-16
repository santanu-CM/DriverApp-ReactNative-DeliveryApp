import React, { useContext, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView
} from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DocumentPicker from '@react-native-documents/picker';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import { plus, userPhoto } from '../utils/Images';
import { AuthContext } from '../context/AuthContext';
import Loader from '../utils/Loader';
import axios from 'axios';
import { API_URL } from '@env'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Dropdown } from 'react-native-element-dropdown';
import { useNavigation } from '@react-navigation/native';

const data = [
  { label: 'Absa Bank Ghana Limited', value: 'Absa Bank Ghana Limited' },
  { label: 'Access Bank (Ghana) Plc', value: 'Access Bank (Ghana) Plc' },
  { label: 'Agricultural Development Bank Plc', value: 'Agricultural Development Bank Plc' },
];

const BankDetails = ({ route }) => {
  const navigation = useNavigation();
  const [accountno, setaccountno] = useState('');
  const [accountnoError, setaccountnoError] = useState('')
  const [reaccountno, setreaccountno] = useState('');
  const [reaccountnoError, setreaccountnoError] = useState('')
  const [branchname, setbranchname] = useState(''); 
  const [branchnameError, setbranchnameError] = useState('')
  const [banknameError, setbanknameError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, userToken } = useContext(AuthContext);
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);

  const changeaccountno = (text) => {
    setaccountno(text)
    if (text) {
      setaccountnoError('')
    } else {
      setaccountnoError('Please enter Account Number')
    }
  }

  const changereaccountno = (text) => {
    setreaccountno(text)
    if (text) {
      setreaccountnoError('')
    } else {
      setreaccountnoError('Please Re-enter Account Number')
    }
  }

  const changebranchname = (text) => {
    setbranchname(text)
    if (text) {
      setbranchnameError('')
    } else {
      setbranchnameError('Please enter Branch Name')
    }
  }
 
  const submitForm = () => {
    //login('dfgdgsg43543dsfdsg')
    if (!accountno) {
      setaccountnoError('Please enter Account Number')
    }else if(!reaccountno){
      setreaccountnoError('Please Re-enter Account Number')
    }else if (accountno != reaccountno){
      setreaccountnoError('Account Number does not matched')
    }else if(!value){
      setbanknameError('Please enter Bank Name')
    }else if(!branchname){
      setbranchnameError('Please enter Branch Name')
    } else {
      setIsLoading(true)
        var option = {
          "accountNo": accountno,
          "bankName": value,
          "branchName": branchname,
        }
      axios.post(`${process.env.API_URL}/api/driver/submit-info`, option, {
        headers: {
          Accept: 'application/json',
          "Authorization": 'Bearer ' + route?.params?.usertoken,
        },
      })
        .then(res => {
          console.log(res.data)
          if (res.data.response.status.code === 200) {
            setIsLoading(false)
            //navigation.push('BankDetails', { usertoken: route?.params?.usertoken })
            login(route?.params?.usertoken)
        } else {
          setIsLoading(false)
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
          console.log(e.response.data?.response.records)
          Alert.alert('Oops..', e.response.data?.response.records.message, [
            {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            { text: 'OK', onPress: () => console.log('OK Pressed') },
        ]);
        });
    }


  }

  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: responsiveHeight(4) }}>
        <View style={{ paddingHorizontal: 20, paddingVertical: 25 }}>
          <MaterialIcons name="arrow-back" size={25} color="#000" onPress={() => navigation.goBack()} />
        </View>
        <View style={styles.wrapper}>

          <Text style={styles.header1}>Bank Details</Text>
          <Text style={styles.subheader}>Your earnings will be transferred to this bank account every week</Text>

          <View style={styles.textinputview}>
            <Text
              style={styles.header}>
              Account Number
            </Text>
            {accountnoError?<Text style={{color:'red',fontFamily:'Outfit-Regular'}}>{accountnoError}</Text>:<></>}
            <View style={styles.inputView}>
              <InputField
                label={'e.g. 1112356662225'}
                keyboardType=" "
                value={accountno}
                helperText={accountnoError}
                inputType={'name'}
                onChangeText={(text) => changeaccountno(text)}
              />
            </View>
            <Text
              style={styles.header}>
              Re-enter Account Number
            </Text>
            {reaccountnoError?<Text style={{color:'red',fontFamily:'Outfit-Regular'}}>{reaccountnoError}</Text>:<></>}
            <View style={styles.inputView}>
              <InputField
                label={'e.g. 1112356662225'}
                keyboardType=" "
                value={reaccountno}
                helperText={reaccountnoError}
                inputType={'name'}
                onChangeText={(text) => changereaccountno(text)}
              />
            </View>
            <Text
              style={styles.header}>
              Bank Name
            </Text>
            {banknameError?<Text style={{color:'red',fontFamily:'Outfit-Regular'}}>{banknameError}</Text>:<></>}
            <View style={styles.inputView}>
              <Dropdown
                style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                itemTextStyle={styles.selectedTextStyle}
                data={data}
                //search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? 'Select item' : '...'}
                searchPlaceholder="Search..."
                value={value}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  setValue(item.value);
                  setbanknameError('')
                  setIsFocus(false);
                }}
              />
            </View>
            <Text
              style={styles.header}>
              Branch Name
            </Text>
            {branchnameError?<Text style={{color:'red',fontFamily:'Outfit-Regular'}}>{branchnameError}</Text>:<></>}
            <View style={styles.inputView}>
              <InputField
                label={'e.g. Ghana'}
                keyboardType=" "
                value={branchname}
                //helperText={'Please enter lastname'}
                inputType={'name'}
                onChangeText={(text) => changebranchname(text)}
              />
            </View>
          </View>

        </View>
        <View style={styles.buttonwrapper}>
          <CustomButton label={"Complete Registration"}
            // onPress={() => { login() }}
            onPress={() => { submitForm() }}
          />
        </View>
      </KeyboardAwareScrollView>

    </SafeAreaView >
  );
};

export default BankDetails;

const styles = StyleSheet.create({

  container: {
    //justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    flex: 1
  },
  wrapper: {
    paddingHorizontal: 23,
    //height: responsiveHeight(78)
  },
  header1: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: responsiveFontSize(3),
    color: '#2F2F2F',
    marginBottom: responsiveHeight(1),
  },
  header: {
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(2),
    color: '#2F2F2F',
    marginBottom: responsiveHeight(1),
  },
  subheader: {
    fontFamily: 'Outfit-Medium',
    fontSize: responsiveFontSize(1.8),
    fontWeight: '400',
    color: '#808080',
    marginBottom: responsiveHeight(1),
  },
  photoheader: {
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(2),
    color: '#2F2F2F'
  },
  imageView: {
    marginTop: responsiveHeight(2)
  },
  imageStyle: {
    height: 80,
    width: 80,
    borderRadius: 40,
    marginBottom: 10
  },
  plusIcon: {
    position: 'absolute',
    bottom: 10,
    left: 50
  },
  textinputview: {
    marginBottom: responsiveHeight(10),
    marginTop: responsiveHeight(5)
  },
  inputView: {
    paddingVertical: 1
  },
  buttonwrapper: {
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: -20,
    width: responsiveWidth(100),
  },
  dropdown: {
    height: responsiveHeight(8),
    borderColor: 'gray',
    borderWidth: 0.7,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginTop: 5,
    marginBottom: responsiveHeight(4)
  },
  placeholderStyle: {
    fontSize: 16,
    color:'#2F2F2F'
  },
  selectedTextStyle: {
    fontSize: 16,
    color:'#2F2F2F'
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    color:'#2F2F2F'
  },
});
