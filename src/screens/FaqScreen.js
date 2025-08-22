import React, { useContext, useState, useEffect } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    Image,
    TouchableOpacity,
    TouchableWithoutFeedback,
    FlatList,
    StyleSheet,
    Dimensions,
    Alert,
    Linking
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomSwitch from '../components/CustomSwitch';
import ListItem from '../components/ListItem';
import { AuthContext } from '../context/AuthContext';
import { getProducts } from '../store/productSlice'
import { API_URL } from '@env'
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { add } from '../store/cartSlice';
import { chatImg, emailImg, forwordImg, phoneImg } from '../utils/Images';
import Loader from '../utils/Loader';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import CustomHeader from '../components/CustomHeader';
import Collapsible from 'react-native-collapsible';
import Accordion from 'react-native-collapsible/Accordion';
import data from '../model/data' 
import CustomButton from '../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
 
const BannerWidth = Dimensions.get('window').width;
const ITEM_WIDTH = Math.round(BannerWidth * 0.7)
const { height, width } = Dimensions.get('screen')

export default function FaqScreen({  }) {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { data: products, status } = useSelector(state => state.products)
    const { userInfo } = useContext(AuthContext)

    const [activeSections, setActiveSections] = useState([]);
    const [collapsed, setCollapsed] = useState(true);
    const [getFaq, setFaq] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [getAllData, setAllData] = useState([])

    const fetchTerms = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.get(`${process.env.API_URL}/api/driver/get-help-support`,
                {
                    headers: {
                        "Authorization": 'Bearer ' + usertoken,
                        "Content-Type": 'application/json'
                    },
                })
                .then(res => {
                    // console.log(res.data.Termsandconditions[0], 'terms and condition')

                    if (res.data.response.status.code === 200) {
                        setAllData(res.data.response.records)
                        setFaq(res.data.response.records.faq)
                        console.log(res.data.response.records.faq, 'faq')
                        setIsLoading(false);
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
                    console.log(`terms and condition error ${e}`)
                });

        });
    }

    useEffect(() => {
        fetchTerms();
    }, [])


    const toggleExpanded = () => {
        setCollapsed(!collapsed)
    };

    const setSections = sections => {
        setActiveSections(sections.includes(undefined) ? [] : sections)
    };

    const renderHeader = (section, _, isActive) => {
        return (
            <Animatable.View
                duration={400}
                style={[styles.header, isActive ? styles.active : styles.inactive]}
                transition="backgroundColor"
            >
                <View style={styles.questionView}>
                    <View style={{ width: responsiveWidth(70) }}>
                        <Text style={styles.headerText}>{section.title}</Text>
                    </View>

                    {isActive ?
                        <Icon name="keyboard-arrow-up" size={30} color="#000000" />
                        :
                        <Icon name="keyboard-arrow-down" size={30} color="#000000" />
                    }
                </View>
            </Animatable.View>
        );
    };

    const renderContent = (section, _, isActive) => {
        return (
            <Animatable.View
                duration={400}
                style={[styles.content, isActive ? styles.active : styles.inactive]}
                transition="backgroundColor"
            >

                <View style={styles.answerView}>
                    <Animatable.Text animation={isActive ? 'zoomIn' : undefined} style={styles.headerText}>
                        {section.description.replace(/<\/?[^>]+(>|$)/g, "")}
                    </Animatable.Text>
                    {/* <Animatable.Image
                        animation={isActive ? 'zoomIn' : undefined}
                        style={{height:responsiveHeight(10),width:responsiveWidth(85),resizeMode:'cover',marginTop:20}}
                        source={{uri:section.imgUrl}}
                    /> */}
                </View>

            </Animatable.View>
        );
    }

    const handleDialPress = (phoneNumber) => {
        Linking.openURL(`tel:${phoneNumber}`);
    };

    if (isLoading) {
        return (
            <Loader />
        )
    }


    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'FAQs'} title={'Help & Support'} onPress={() => navigation.goBack()} onPressProfile={() => navigation.navigate('Profile')} />
            <ScrollView style={styles.wrapper}>
                <Collapsible collapsed={collapsed} align="center">
                    <View style={styles.content}>
                        <Text>
                            Bacon ipsum dolor amet chuck turducken landjaeger tongue spare
                            ribs
                        </Text>
                    </View>
                </Collapsible>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, marginBottom: 10 }}>
                    <View style={styles.firstCardView}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image
                                source={chatImg}
                                style={styles.iconImage}
                            />
                            <Text style={{ color: '#9C9C9C', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), marginLeft: 10 }}>Contact Us</Text>
                        </View>

                        <TouchableOpacity onPress={() => Linking.openURL(`https://api.whatsapp.com/send/?phone=${getAllData?.help.chatWithUs}&type=phone_number&app_absent=0`)}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                                <Text style={{ color: '#339999', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), }}>Chat with us</Text>
                                <Image
                                    source={forwordImg}
                                    style={styles.iconImage}
                                />
                            </View>
                        </TouchableOpacity>

                    </View>
                    <View style={styles.firstCardView}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image
                                source={emailImg}
                                style={styles.iconImage}
                            />
                            <Text style={{ color: '#9C9C9C', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), marginLeft: 10 }}>Email Us</Text>
                        </View>
                        {getAllData ?
                            <TouchableOpacity onPress={() => Linking.openURL(`mailto:${getAllData?.help?.supportMail}`)}>
                                <Text style={{ color: '#339999', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), marginTop: 10 }}>{getAllData?.help.supportMail}</Text>
                            </TouchableOpacity>
                            : <></>}
                    </View>

                </View>
                <View style={styles.secondCardView}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                            source={phoneImg}
                            style={styles.iconImage}
                        />
                        <Text style={{ color: '#9C9C9C', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), marginLeft: 10 }}>Call Us</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                        <TouchableOpacity onPress={() => handleDialPress(getAllData?.help.phonOne)}>
                            <Text style={{ color: '#339999', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), marginTop: 10 }}>{getAllData?.help.phonOne}</Text>
                        </TouchableOpacity>
                        <View style={styles.verticleLine}></View>
                        <TouchableOpacity onPress={() => handleDialPress(getAllData?.help.phoneTwo)}>
                            <Text style={{ color: '#339999', fontFamily: 'Outfit-Medium', fontSize: responsiveFontSize(2), marginTop: 10 }}>{getAllData?.help.phoneTwo}</Text>
                        </TouchableOpacity>
                    </View>

                </View>
                <Text style={{ color: '#2F2F2F', fontFamily: 'Outfit-Bold', fontSize: responsiveFontSize(2.2), marginBottom: 10 }}>Frequently asked questuion</Text>
                <Accordion
                    activeSections={activeSections}
                    sections={getFaq}
                    touchableComponent={TouchableOpacity}
                    renderHeader={renderHeader}
                    renderContent={renderContent}
                    duration={400}
                    onChange={setSections}
                />
            </ScrollView>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: responsiveHeight(1)
    },
    wrapper: {
        padding: 20,
        //paddingBottom: responsiveHeight(2)
    },
    iconimg: {
        height: responsiveHeight(5),
        width: responsiveWidth(5),
        resizeMode: 'contain',
    },
    headerText: {
        color: '#3A3232',
        fontFamily: 'Outfit-Medium',
        fontSize: responsiveFontSize(2),
    },
    questionView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: '#F8F7F9',
        borderColor: '#E0E0E0',
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 5
    },
    answerView: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        borderColor: '#E0E0E0',
        borderWidth: 1,
        //paddingBottom:10
    },
    iconImage: {
        width: 23,
        height: 23,
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
    secondCardView: {
        height: responsiveHeight(13),
        width: responsiveWidth(89),
        backgroundColor: '#F6F6F6',
        borderRadius: 8,
        padding: 10,
        borderColor: '#E0E0E0',
        borderWidth: 1,
        marginBottom: 10
    },
    verticleLine: {
        height: '100%',
        width: 1,
        backgroundColor: '#339999',
    }

});