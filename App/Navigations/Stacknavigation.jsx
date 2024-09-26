import { View, Text,StyleSheet } from 'react-native'
import React from 'react'
import Homescreen from './../Screens/Homescreen';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();
export default function Stacknavigation() {
  return (
    <Stack.Navigator screenOptions={{headerShown:false}}>
        <Stack.Screen name="Home" component={Homescreen} />
        
    </Stack.Navigator>
  )
}

