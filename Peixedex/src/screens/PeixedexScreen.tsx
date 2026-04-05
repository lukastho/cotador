import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PeixedexScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tela do Peixedex</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default PeixedexScreen;
