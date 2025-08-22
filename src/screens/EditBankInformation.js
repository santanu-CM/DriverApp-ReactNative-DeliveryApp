import React, { useState, useContext, useEffect } from 'react'
import { View, Text, SafeAreaView, StyleSheet, ScrollView, ImageBackground, Image, TouchableOpacity, KeyboardAvoidingView } from 'react-native'
import CheckBox from '@react-native-community/checkbox'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { Dropdown } from 'react-native-element-dropdown';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import DocumentPicker from '@react-native-documents/picker';
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


const data = [
    { label: 'Absa Bank Ghana Limited', value: 'Absa Bank Ghana Limited' },
    { label: 'Access Bank (Ghana) PLC', value: 'Access Bank (Ghana) PLC' },
    { label: 'Agricultural Development Bank PLC', value: 'Agricultural Development Bank PLC' },
    { label: 'Bank of Africa Ghana Limited', value: 'Bank of Africa Ghana Limited' },
    { label: 'CalBank PLC', value: 'CalBank PLC' },
    { label: 'Consolidated Bank Ghana Limited', value: 'Consolidated Bank Ghana Limited' },
    { label: 'Ecobank Ghana PLC', value: 'Ecobank Ghana PLC' },
    { label: 'FBNBank (Ghana) Limited', value: 'FBNBank (Ghana) Limited' },
    { label: 'Fidelity Bank Ghana Limited', value: 'Fidelity Bank Ghana Limited' },
    { label: 'First Atlantic Bank Limited', value: 'First Atlantic Bank Limited' },
    { label: 'First National Bank (Ghana) Limited', value: 'First National Bank (Ghana) Limited' },
    { label: 'GCB Bank PLC', value: 'GCB Bank PLC' },
    { label: 'Guaranty Trust Bank (Ghana) Limited', value: 'Guaranty Trust Bank (Ghana) Limited' },
    { label: 'National Investment Bank Limited', value: 'National Investment Bank Limited' },
    { label: 'OmniBSIC Bank Ghana Limited', value: 'OmniBSIC Bank Ghana Limited' },
    { label: 'Prudential Bank Limited', value: 'Prudential Bank Limited' },
    { label: 'Republic Bank (Ghana) PLC', value: 'Republic Bank (Ghana) PLC' },
    { label: 'Societe Generale Ghana PLC', value: 'Societe Generale Ghana PLC' },
    { label: 'Stanbic Bank Ghana Limited', value: 'Stanbic Bank Ghana Limited' },
    { label: 'Standard Chartered Bank Ghana PLC', value: 'Standard Chartered Bank Ghana PLC' },
    { label: 'United Bank for Africa (Ghana) Limited', value: 'United Bank for Africa (Ghana) Limited' },
    { label: 'Universal Merchant Bank Limited', value: 'Universal Merchant Bank Limited' },
    { label: 'Zenith Bank (Ghana) Limited', value: 'Zenith Bank (Ghana) Limited' },
  ];

const EditBankInformation = ({ route }) => {
    const navigation = useNavigation();
    const { userInfo } = useContext(AuthContext);
    const [value, setValue] = useState(null); 
    const [isFocus, setIsFocus] = useState(false);
    const [isLoading, setIsLoading] = useState(true)
    const [accountno, setaccountno] = useState('');
    const [accountnoError, setaccountnoError] = useState('')
    const [branchname, setbranchname] = useState('');
    const [branchnameError, setbranchnameError] = useState('')
    const [banknameError, setbanknameError] = useState('')

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
              console.log(userInfo, 'user details');
              setaccountno(userInfo?.accountNo);
              setbranchname(userInfo?.branchName);
      
              // Case-insensitive match for bank name
              const matchedBank = data.find(item => item.value.toLowerCase() === userInfo?.bankName?.toLowerCase());
              if (matchedBank) {
                setValue(matchedBank.value);
              } else {
                setValue(null);
              }
      
              setIsLoading(false);
            })
            .catch(e => {
              console.log(`User fetch error ${e}`);
            });
        });
      }

    useEffect(() => {
        fetchProfileDetails()
    }, [])


    const updateProfile = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            setIsLoading(true)
            var option = {
              "accountNo": accountno,
              "bankName": value,
              "branchName": branchname,
            }
          axios.post(`${process.env.API_URL}/api/driver/submit-info`, option, {
            headers: {
              Accept: 'application/json',
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
        });

    }


    if (isLoading) {
        return (
            <Loader />
        )
    }
    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Edit Bank Details'} onPress={() => navigation.goBack()} title={'Edit Bank Details'} />
            <KeyboardAwareScrollView>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={styles.textinputview}>
                        <Text
                            style={styles.header}>
                            Account Number
                        </Text>
                        <View style={styles.inputView}>
                            <InputField
                                label={'Account Number'}
                                keyboardType=" "
                                value={accountno}
                                //helperText={firstNameError}
                                inputType={'name'}
                                onChangeText={(text) => setaccountno(text)}
                            />
                        </View>
                        
                        <Text
                            style={styles.header}>
                            Bank Names
                        </Text>
                        <View style={styles.inputView}>
                            <Dropdown
                                style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                inputSearchStyle={styles.inputSearchStyle}
                                data={data}
                                search
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
                                    setIsFocus(false);
                                }}
                            />
                        </View>
                        <Text
                            style={styles.header}>
                            Branch Name
                        </Text>
                        <View style={styles.inputView}>
                            <InputField
                                label={'Branch Name'}
                                keyboardType=" "
                                value={branchname}
                                //helperText={'Please enter lastname'}
                                inputType={'name'}
                                onChangeText={(text) => setbranchname(text)}
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

export default EditBankInformation

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
        marginTop: 5,
        marginBottom:responsiveHeight(4)
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
        width: responsiveWidth(100)
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