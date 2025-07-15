
import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL, API_URL } from '@env'
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [userToken, setUserToken] = useState(null);
    const [userType, setUserType] = useState(null)
    const [userInfo, setUserInfo] = useState([])
    

    const login = (token) => {
        setIsLoading(true);
        axios.get(`${API_URL}/api/driver/driver-profile`, { 
            headers: {
                "Authorization": 'Bearer ' + token,
                "Content-Type": 'application/json'
            },
        })
            .then(res => {
                //console.log(res.data,'user details')
                let userInfo = res.data.response.records.data;
                console.log(userInfo,'userInfo from loginnnnn')
                AsyncStorage.setItem('userToken', token)
                AsyncStorage.setItem('userInfo', JSON.stringify(userInfo))
                setUserInfo(userInfo)
                setUserToken(token)
                setIsLoading(false);
            })
            .catch(e => {
                console.log(`Login error ${e}`)
            });
    }

    const logout = () => {
        setIsLoading(true)
        setUserToken(null);
        AsyncStorage.removeItem('userInfo')
        AsyncStorage.removeItem('userToken')
        AsyncStorage.removeItem('notifications')
        setIsLoading(false);
    }
    const isLoggedIn = async () => {
        console.log('islogin')
        try {
            setIsLoading(true)
            let userInfo = await AsyncStorage.getItem('userInfo')
            let userToken = await AsyncStorage.getItem('userToken')
            userInfo = JSON.parse(userInfo)
            if (userInfo) {
                setUserToken(userToken)
                setUserInfo(userInfo)
            }
            setIsLoading(false)
        } catch (e) {
            console.log(`isLoggedIn error ${e}`)
        }
    }

    useEffect(() => {
        isLoggedIn()
    }, []);


    return (
        <AuthContext.Provider value={{ login, logout, isLoading, userToken, userInfo }}>
            {children}
        </AuthContext.Provider>
    )
}