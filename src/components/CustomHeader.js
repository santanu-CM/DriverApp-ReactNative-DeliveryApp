import React, { useContext, useState, useEffect } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    ActivityIndicator,
    ImageBackground,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Image,
    Switch,
    PermissionsAndroid, Platform
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { hambargar } from '../utils/Images';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { API_URL } from '@env'
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Geolocation from 'react-native-geolocation-service';
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import LinearGradient from 'react-native-linear-gradient';

export default function CustomHeader({
    onPress,
    commingFrom,
    title,
    onPressProfile,
}) {
    // const { userInfo } = useContext(AuthContext)
    // console.log(userInfo?.photo)
    const navigation = useNavigation();
    const [userInfo, setuserInfo] = useState([])
    const [isEnabled, setIsEnabled] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchProfileDetails = async () => {
        try {
            // Get user token from AsyncStorage
            const usertoken = await AsyncStorage.getItem('userToken');

            // Check if user token exists
            if (!usertoken) {
                console.log("User token not found");
                return;
            }

            // Fetch user profile details
            const response = await axios.get(`${API_URL}/api/driver/me`, {
                headers: {
                    "Authorization": `Bearer ${usertoken}`,
                    "Content-Type": 'application/json'
                },
            });

            // Process the response
            let userInfo = response.data.response.records.data;
            setuserInfo(userInfo);
            setLoading(false);
            // Get switch status from AsyncStorage
            const switchStatus = await AsyncStorage.getItem('switchStatus');

            // Set the switch state based on the switchStatus value
            if (switchStatus === 'off') {
                setIsEnabled(false);
            } else if (switchStatus === 'on') {
                setIsEnabled(true);
            }
        } catch (e) {
            console.log(`Error fetching user details: ${e}`);
        }
    };
    const toggleSwitch = async () => {
        const newStatus = !isEnabled;
        const statusString = newStatus ? 'on' : 'off'; // Convert to string

        // Optimistically update the switch UI
        setIsEnabled(newStatus);

        try {
            await AsyncStorage.setItem('switchStatus', statusString);
            console.log('Switch status saved:', statusString);
        } catch (error) {
            console.error('Error saving switch status:', error);
        }
    };

    const requestLocationPermission = async () => {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
    };

    const getLocation = async () => {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) return;

        Geolocation.getCurrentPosition(
            position => {
                console.log(position.coords.latitude, position.coords.longitude);
            },
            error => console.error(error),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    useEffect(() => {
        getLocation();
    }, []);

    useEffect(() => {
        fetchProfileDetails()
    }, [])
    useFocusEffect(
        React.useCallback(() => {
            fetchProfileDetails()
        }, [])
    )
    return (
        <>
            {commingFrom == 'Home' ?
                <>
                    <View style={styles.headerView}>
                        <View style={styles.firstSection}>
                            <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
                                {/* {userInfo?.photo ?
                                    <Image
                                        source={{ uri: userInfo?.photo }}
                                        style={styles.headerImage}
                                    /> : */}
                                <Image
                                    source={hambargar}
                                    style={styles.headerImage}
                                />
                                {/* } */}
                            </TouchableOpacity>
                            <ShimmerPlaceholder
                                visible={!loading}
                                style={{
                                    marginLeft: 5,
                                    //borderRadius: 24
                                }}
                                shimmerColors={["#DDFFFF", "#8AC2C2", "#0E6767"]}
                                LinearGradient={LinearGradient}
                            >
                                <View>

                                    <Text style={styles.firstText}>Hi, {userInfo?.name || "Driver"}</Text>

                                    <Text style={styles.secondText}>
                                        {/* {userInfo?.roll} */}
                                        Delivery Partner
                                    </Text>
                                </View>
                            </ShimmerPlaceholder>
                        </View>

                        <View style={{ height: responsiveHeight(6), width: responsiveWidth(30), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 2, }}>
                            <Text style={{ fontSize: responsiveFontSize(1.5), fontFamily: 'Outfit-SemiBold', marginRight: responsiveWidth(3), color: '#fff' }}>Availability</Text>
                            <Switch
                                trackColor={{ false: '#767577', true: '#3F709E' }}
                                thumbColor={isEnabled ? '#fff' : '#000'}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={toggleSwitch}
                                value={isEnabled}
                                style={styles.switchStyle}
                            />
                        </View>
                        {/* <TouchableOpacity onPress={onPress}>
                            <Ionicons name="notifications-outline" size={28} color="#F4F4F4" />
                            <View style={styles.notificationdotView}>
                                <Text style={styles.notificationdot}>{'\u2B24'}</Text>
                            </View>
                        </TouchableOpacity>  */}
                    </View>
                    <View style={styles.headerBottomMargin} />
                </>
                : commingFrom == 'chat' ?
                    <>
                        <View style={styles.chatPageheaderView}>
                            <TouchableOpacity onPress={onPress}>
                                <Ionicons name="arrow-back" size={25} color="#FFF" />
                            </TouchableOpacity>
                            <Image
                                source={userPhoto}
                                style={styles.imageStyle}
                            />
                            <Text style={styles.chatPageheaderTitle}>{title}</Text>
                        </View>
                        <View style={styles.headerBottomMargin} />
                    </>
                    :
                    <>
                        <View style={styles.innerPageheaderView}>
                            <TouchableOpacity onPress={onPress}>
                                <Ionicons name="arrow-back" size={25} color="#000" />
                            </TouchableOpacity>
                            <Text style={styles.innerPageheaderTitle}>{title}</Text>
                        </View>
                        <View style={styles.headerBottomMargin} />
                    </>
            }
        </>
    )
}

const styles = StyleSheet.create({
    headerView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#339999',
        marginTop: -responsiveHeight(1)
    },
    innerPageheaderView: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    chatPageheaderView: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#4B47FF'
    },
    innerPageheaderTitle: {
        color: '#2F2F2F',
        fontSize: responsiveFontSize(2.2),
        fontFamily: 'Outfit-Bold',
        marginLeft: 10
    },
    chatPageheaderTitle: {
        color: '#FFF',
        fontSize: responsiveFontSize(2.2),
        fontFamily: 'Outfit-Bold',
        marginLeft: 10
    },
    firstSection: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    headerImage: {
        width: 50,
        height: 50,
        borderRadius: 25
    },
    firstText: {
        fontSize: responsiveFontSize(2),
        fontFamily: 'Outfit-Bold',
        marginLeft: 10,
        color: '#FFFFFF'
    },
    secondText: {
        fontSize: responsiveFontSize(1.5),
        fontFamily: 'Outfit-Bold',
        marginLeft: 10,
        color: '#F4F4F4'
    },
    notificationdotView: {
        position: 'absolute',
        top: Platform.OS === 'android' ? -2 : 2, // Adjust top for iOS and Android
        right: Platform.OS === 'android' ? 3 : 2, // Adjust right for iOS and Android
    },
    notificationdot: {
        color: '#EB0000',
        fontSize: Platform.OS === 'android' ? 12 : 6,
    },
    headerBottomMargin: {
        borderBottomColor: '#808080',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    imageStyle: {
        height: 40,
        width: 40,
        borderRadius: 40 / 2,
        marginLeft: 5
    },
    switchStyle: {
        transform: [
            { scaleX: Platform.OS === 'ios' ? 0.8 : 1.2 },
            { scaleY: Platform.OS === 'ios' ? 0.8 : 1.2 }
        ]
    }

})