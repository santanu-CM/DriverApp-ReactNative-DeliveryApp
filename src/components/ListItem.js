import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import { windowWidth } from '../utils/Dimensions';

export default function ListItem({photo, title, subTitle, buttonType, price, onPress}) {
  return (
    <View style={{
      flexDirection:'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    }}>
      <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
        <Image
          source={photo}
          style={{width: 60, height: 60, borderRadius: 10, marginRight: 8}}
          resizeMode='contain'
        />
        <View style={{width: windowWidth - 220}}>
          <Text
            style={{
              color: '#333',
              fontFamily: 'Outfit-Medium',
              fontSize: 14,
            }}>
            {title}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              color: '#333',
              fontFamily: 'Outfit-Medium',
              fontSize: 14,
              textTransform: 'uppercase',
            }}>
            {price}
          </Text>
        </View>
      </View>

      <TouchableOpacity onPress={onPress} style={{
        backgroundColor:'#0aada8',
        padding:10,
        width: 80,
        borderRadius: 10,
      }}>
        <Text style={{
          color: '#fff',
          textAlign: 'center',
          fontFamily: 'Outfit-Medium',
          fontSize: 14,
        }}>
          {buttonType == 'buy' && 'Buy'}
          {buttonType == 'remove' && 'Remove'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
