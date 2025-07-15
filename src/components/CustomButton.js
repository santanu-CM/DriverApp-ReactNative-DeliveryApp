import { Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import React from 'react';
import { chatImg, forwordImg } from '../utils/Images';

export default function CustomButton({ label, onPress, buttonIcon, buttonColor }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={buttonColor == 'red' ? styles.buttonViewRed : buttonColor == 'gray' ? styles.buttonViewGray : styles.buttonView}>
      
      <Text
        style={buttonColor == 'red' ? styles.buttonTextRed : styles.buttonText}>
        {label}
      </Text>
      {buttonIcon ? <Image source={forwordImg} style={styles.iconImage} tintColor={'#FFF'} /> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonView: {
    backgroundColor: '#339999',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonViewRed: {
    backgroundColor: '#FFF',
    borderColor: '#EB0000',
    borderWidth: 1,
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonViewGray:{
    backgroundColor: '#B6B6B6',
    padding: 20,
    borderRadius: 8,
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonText: {
    fontFamily: 'Outfit-Medium',
    textAlign: 'center',
    fontWeight: '400',
    fontSize: 16,
    color: '#FFFFFF',
  },
  buttonTextRed: {
    fontFamily: 'Outfit-Medium',
    textAlign: 'center',
    fontWeight: '400',
    fontSize: 16,
    color: '#EB0000',
  },
  iconImage: {
    width: 23,
    height: 23,
    marginLeft: 5
  }
})
