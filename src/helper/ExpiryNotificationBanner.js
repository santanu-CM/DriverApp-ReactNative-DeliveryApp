import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const ExpiryNotificationBanner = ({ refreshTrigger }) => {
    const navigation = useNavigation();
    const [expiryWarnings, setExpiryWarnings] = useState([]);
    const [showBanner, setShowBanner] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        checkExpiryDates();
    }, []);

    // Refresh when refreshTrigger prop changes
    useEffect(() => {
        if (refreshTrigger) {
            checkExpiryDates();
        }
    }, [refreshTrigger]);

    // Add this to refresh when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            checkExpiryDates();
        }, [])
    );

    const checkExpiryDates = async () => {
        try {
            const storedUserInfo = await AsyncStorage.getItem('userInfo');
            console.log('Stored User Info:', storedUserInfo);
            if (storedUserInfo) {
                const userInfo = JSON.parse(storedUserInfo);
                const today = new Date();
                const warningDays = 30;

                const expiryFields = [
                    { key: 'carInsuranceExpDate', label: 'Car Insurance' },
                    { key: 'gtInsuranceExpDate', label: 'GT Insurance' },
                    { key: 'licenseExpDate', label: 'License' }
                ];

                let warnings = [];

                expiryFields.forEach(field => {
                    if (userInfo[field.key]) {
                        const expiryDate = new Date(userInfo[field.key]);
                        const timeDiff = expiryDate.getTime() - today.getTime();
                        const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

                        if (daysLeft <= warningDays) {
                            warnings.push({
                                field: field.label,
                                daysLeft: daysLeft,
                                expired: daysLeft < 0,
                                expiryDate: userInfo[field.key]
                            });
                        }
                    }
                });

                warnings.sort((a, b) => {
                    if (a.expired && !b.expired) return -1;
                    if (!a.expired && b.expired) return 1;
                    if (a.expired && b.expired) return b.daysLeft - a.daysLeft;
                    return a.daysLeft - b.daysLeft;
                });

                if (warnings.length > 0) {
                    setExpiryWarnings(warnings);
                    setShowBanner(true);
                    if (warnings.filter(w => w.expired).length > 1) {
                        setExpanded(true);
                    }
                } else {
                    setExpiryWarnings([]);
                    setShowBanner(false);  // <-- ensure it hides when all are updated
                }
            }
        } catch (error) {
            console.log('Error checking expiry dates:', error);
        }
    };

    const getMainMessage = () => {
        if (!expiryWarnings.length) return '';

        const expiredCount = expiryWarnings.filter(w => w.expired).length;
        const expiringCount = expiryWarnings.filter(w => !w.expired).length;

        if (expiredCount > 0 && expiringCount > 0) {
            return `⚠️ ${expiredCount} expired, ${expiringCount} expiring soon`;
        } else if (expiredCount > 1) {
            return `⚠️ ${expiredCount} documents have expired`;
        } else if (expiredCount === 1) {
            const expiredDoc = expiryWarnings.find(w => w.expired);
            return `⚠️ ${expiredDoc.field} expired ${Math.abs(expiredDoc.daysLeft)} days ago`;
        } else if (expiringCount > 1) {
            return `⚠️ ${expiringCount} documents expiring soon`;
        } else {
            const doc = expiryWarnings[0];
            if (doc.daysLeft === 0) {
                return `⚠️ ${doc.field} expires today!`;
            } else {
                return `⚠️ ${doc.field} expires in ${doc.daysLeft} days`;
            }
        }
    };

    const getBannerColor = () => {
        if (!expiryWarnings.length) return '#FFA500';

        const hasExpired = expiryWarnings.some(w => w.expired);
        if (hasExpired) return '#FF4444';

        const hasVeryUrgent = expiryWarnings.some(w => w.daysLeft <= 7);
        if (hasVeryUrgent) return '#FF6B35';

        const hasUrgent = expiryWarnings.some(w => w.daysLeft <= 15);
        if (hasUrgent) return '#FF8C00';

        return '#FFA500';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusText = (warning) => {
        if (warning.expired) {
            return `Expired ${Math.abs(warning.daysLeft)} days ago`;
        } else if (warning.daysLeft === 0) {
            return 'Expires today';
        } else {
            return `Expires in ${warning.daysLeft} days`;
        }
    };

    if (!showBanner || !expiryWarnings.length) {
        return null;
    }

    return (
        <View style={[styles.bannerContainer, { backgroundColor: getBannerColor() }]}>
            {/* Main Banner */}
            <TouchableOpacity
                style={styles.mainBanner}
                onPress={() => expiryWarnings.length > 1 && setExpanded(!expanded)}
                activeOpacity={expiryWarnings.length > 1 ? 0.7 : 1}
            >
                <View style={styles.bannerContent}>
                    <Text style={styles.bannerText}>{getMainMessage()}</Text>
                    <View style={styles.buttonContainer}>
                        {expiryWarnings.length > 1 && (
                            <TouchableOpacity
                                style={styles.expandButton}
                                onPress={() => setExpanded(!expanded)}
                            >
                                <Text style={styles.expandButtonText}>
                                    {expanded ? '▲' : '▼'}
                                </Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={styles.updateButton}
                            onPress={() => {
                                try {
                                    navigation.navigate('PROFILE', { screen: 'EditDocuments' })
                                } catch (error) {
                                    navigation.navigate('PROFILE', { screen: 'ProfileScreen' })
                                }
                            }}
                        >
                            <Text style={styles.updateButtonText}>
                                {expiryWarnings.some(w => w.expired) ? 'Renew' : 'Update'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowBanner(false)}
                >
                    <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
            </TouchableOpacity>

            {/* Expanded Details */}
            {expanded && expiryWarnings.length > 1 && (
                <View style={styles.expandedContent}>
                    {expiryWarnings.map((warning, index) => (
                        <View key={index} style={styles.documentRow}>
                            <View style={styles.documentInfo}>
                                <Text style={styles.documentName}>{warning.field}</Text>
                                <Text style={styles.documentDate}>Exp: {formatDate(warning.expiryDate)}</Text>
                            </View>
                            <View style={[
                                styles.statusBadge,
                                { backgroundColor: warning.expired ? '#FF6B6B' : '#FFB84D' }
                            ]}>
                                <Text style={styles.statusText}>{getStatusText(warning)}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    bannerContainer: {
        marginHorizontal: responsiveWidth(4),
        marginVertical: responsiveHeight(1),
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    mainBanner: {
        paddingHorizontal: responsiveWidth(4),
        paddingVertical: responsiveHeight(1.5),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bannerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bannerText: {
        color: '#fff',
        fontSize: responsiveFontSize(1.8),
        fontFamily: 'Outfit-Medium',
        flex: 1,
        marginRight: responsiveWidth(2),
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    expandButton: {
        marginRight: responsiveWidth(2),
        paddingHorizontal: responsiveWidth(2),
        paddingVertical: responsiveHeight(0.5),
    },
    expandButtonText: {
        color: '#fff',
        fontSize: responsiveFontSize(1.5),
        fontFamily: 'Outfit-Bold',
    },
    updateButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        paddingHorizontal: responsiveWidth(3),
        paddingVertical: responsiveHeight(0.8),
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    updateButtonText: {
        color: '#fff',
        fontSize: responsiveFontSize(1.6),
        fontFamily: 'Outfit-Medium',
    },
    closeButton: {
        marginLeft: responsiveWidth(2),
        width: 25,
        height: 25,
        borderRadius: 12.5,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: responsiveFontSize(2.2),
        fontFamily: 'Outfit-Bold',
        lineHeight: 20,
    },
    expandedContent: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: responsiveWidth(4),
        paddingVertical: responsiveHeight(1),
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
    },
    documentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: responsiveHeight(0.8),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    },
    documentInfo: {
        flex: 1,
    },
    documentName: {
        color: '#fff',
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'Outfit-Medium',
    },
    documentDate: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: responsiveFontSize(1.4),
        fontFamily: 'Outfit-Regular',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: responsiveWidth(2.5),
        paddingVertical: responsiveHeight(0.5),
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: responsiveFontSize(1.3),
        fontFamily: 'Outfit-Medium',
    },
});

export default ExpiryNotificationBanner;