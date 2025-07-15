import React, { useState, useContext, useEffect } from 'react'
import { View, Text, SafeAreaView, StyleSheet, ScrollView, ImageBackground, Image, TouchableOpacity, KeyboardAvoidingView } from 'react-native'
import CheckBox from '@react-native-community/checkbox'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { Dropdown } from 'react-native-element-dropdown';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { launchImageLibrary } from 'react-native-image-picker';
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


const data = [
    { label: 'Users', value: 'users' },
    { label: 'Admin', value: 'admin' },
    { label: 'Super Admin', value: 'superadmin' },
];

const EditUsers = ({ navigation, route }) => {
 
    const [userInfo, setuserInfo] = useState([])
    const [value, setValue] = useState(null);
    const [isFocus, setIsFocus] = useState(false);
    const [isLoading, setIsLoading] = useState(true)
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [phoneno, setPhone] = useState('');
    const [pickedDocument, setPickedDocument] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [firstNameError, setFirstNameError] = useState('')

    const headerHeight = useHeaderHeight();

    const fetchProfileDetails = () => {
        const option = {
            "userId": route?.params?.userid,
            "flag": 'approve'
        }
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${process.env.API_URL}/public/api/user/requestingaction`, option, {
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
                        //console.log(res.data, 'data from aproved or rejected api')
                        setuserInfo(res.data.user)
                        let userInfo = res.data.user;
                        setFirstname(userInfo?.fname)
                        setLastname(userInfo?.lname)
                        setPhone(userInfo?.phone)
                        //setPickedDocument(userInfo?.photo)
                        setImageFile(userInfo?.photo)
                        setValue(userInfo?.roll)
                        setIsLoading(false);


                    }
                })
                .catch(e => {
                    console.log(`aproved or rejected error ${e}`)
                });
        });
    }
    useEffect(() => {
        fetchProfileDetails()
        //console.log(route?.params?.userid)
    }, [])

    // const pickDocument = async () => {
    //     try {
    //         const result = await DocumentPicker.pick({
    //             type: [DocumentPicker.types.allFiles],
    //         });

    //         //console.log('URI: ', result[0].uri);
    //         //console.log('Type: ', result[0].type);
    //         //console.log('Name: ', result[0].name);
    //         //console.log('Size: ', result[0].size);

    //         setPickedDocument(result[0]);
    //     } catch (err) {
    //         if (DocumentPicker.isCancel(err)) {
    //             // User cancelled the document picker
    //             console.log('Document picker was cancelled');
    //         } else {
    //             console.error('Error picking document', err);
    //         }
    //     }
    // };

    const pickDocument = async () => {
        const options = {
          mediaType: 'mixed', // 'photo' | 'video' | 'mixed'
          selectionLimit: 1,  // pick only one file
        };
      
        launchImageLibrary(options, (response) => {
          if (response.didCancel) {
            console.log('User cancelled image picker');
          } else if (response.errorCode) {
            console.error('ImagePicker Error: ', response.errorMessage);
          } else if (response.assets && response.assets.length > 0) {
            const asset = response.assets[0];
            console.log('URI:', asset.uri);
            console.log('Type:', asset.type);
            console.log('Name:', asset.fileName);
            console.log('Size:', asset.fileSize);
      
            setPickedDocument(asset); // Adjust based on your state management
          }
        });
      };

    const updateProfile = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            if (!firstname) {
                setFirstNameError('Please enter First name')
            } else {
                setIsLoading(true)
                const formData = new FormData();
                if (pickedDocument != null) {
                    formData.append("photo", {
                        uri: pickedDocument.uri,
                        type: 'image/jpeg',
                        name: 'photo.jpg',
                    });
                } else {
                    formData.append("photo", "");
                }

                formData.append("fname", firstname);
                formData.append("lname", String(lastname))
                formData.append("roll", value);
                formData.append("userId", route?.params?.userid);
                //console.log(formData)

                axios.post(`${process.env.API_URL}/public/api/user/editeusers`, formData, {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'multipart/form-data',
                        "Authorization": 'Bearer ' + usertoken,
                    },
                })
                    .then(res => {
                       // console.log(res.data)
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
                            //console.log(res.data, 'data from edit user api')
                            Toast.show({
                                type: 'success',
                                text1: 'Hello',
                                text2: res.data.message,
                                position: 'top',
                                topOffset: Platform.OS == 'ios' ? 55 : 20
                              });
                            setIsLoading(false)
                        }
                    })
                    .catch(e => {
                        console.log(`user update error ${e}`)
                    });
            }
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
                                    source={{ uri: imageFile }}
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

                    <View style={styles.textinputview}>
                        <View style={styles.inputView}>
                            <InputField
                                label={'First name'}
                                keyboardType=" "
                                value={firstname}
                                helperText={firstNameError}
                                inputType={'name'}
                                onChangeText={(text) => setFirstname(text)}
                            />
                        </View>
                        <View style={styles.inputView}>
                            <InputField
                                label={'Last name'}
                                keyboardType=" "
                                value={lastname}
                                //helperText={'Please enter lastname'}
                                inputType={'name'}
                                onChangeText={(text) => setLastname(text)}
                            />
                        </View>
                    </View>
                    {/* {userInfo.roll != 'users' ? */}
                        <View style={styles.dropdownView}>
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
                                placeholder={!isFocus ? 'Select Roles' : '...'}
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
                        {/* :
                        <></>
                    } */}
                    <View style={styles.mobileinputview}>
                        <InputField
                            value={'   +91'}
                            inputType={'code'}
                        />
                        <InputField
                            label={'Mobile Number'}
                            keyboardType="numeric"
                            value={JSON.stringify(phoneno)}
                            editable={'no'}
                            //helperText={'please enter 10 digit no'}
                            onChangeText={(text) => setPhone(text)}
                            onFocus={() => refs['scroll'].scrollTo({ y: 60 })}
                        />
                    </View>


                </ScrollView>
                <View style={styles.buttonwrapper}>
                    <CustomButton label={"Save Changes"} buttonIcon={true} onPress={() => updateProfile()} />
                </View>
            </KeyboardAwareScrollView>

        </SafeAreaView>
    )
}

export default EditUsers

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
        alignItems: 'center'
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
        left: 75
    },
    inputView: {
        paddingVertical: 5
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
        width: responsiveWidth(100)
    },
});