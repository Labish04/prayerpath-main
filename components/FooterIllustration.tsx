import React from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';

const { width } = Dimensions.get('window');

export const FooterIllustration = () => {
  return (
    <View style={styles.footerContainer}>
      <Image 
        source={require('../assets/images/path_bg.jpg')}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 500,
    zIndex: -1,
  },
  image: {
    width: '100%',
    height: '100%',
  }
});
