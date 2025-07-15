import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

const LottieLoader = ({ visible = true, size = 100 }) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/images/misc/lottie-file.json')} // Replace with your file path
        autoPlay
        loop
        style={[styles.lottie, { width: size, height: size }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    zIndex: 1000,
  },
  lottie: {
    backgroundColor: 'transparent',
  },
});

export default LottieLoader;