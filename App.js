import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Amplify from 'aws-amplify'
import config from './aws-exports'
import Todo from './Todo';
import { withAuthenticator } from 'aws-amplify-react-native'

Amplify.configure(config)

export default withAuthenticator(function App() {
  return (
    <View style={styles.container}>
      <Text>TodoMate</Text>
      <Todo></Todo>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
