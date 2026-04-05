import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import CameraScreen from '../screens/CameraScreen';
import PeixedexScreen from '../screens/PeixedexScreen';
import FishDetailsScreen from '../screens/FishDetailsScreen';
import { FishRecord } from '../services/storageService';

export type RootTabParamList = {
  Início: undefined;
  Câmera: undefined;
  Peixedex: undefined;
  FishDetails: { fish: FishRecord };
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createStackNavigator<RootTabParamList>();

const PeixedexStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Peixedex" component={PeixedexScreen} />
      <Stack.Screen name="FishDetails" component={FishDetailsScreen} />
    </Stack.Navigator>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Tab.Screen
        name="Início"
        component={HomeScreen}
      />
      <Tab.Screen
        name="Câmera"
        component={CameraScreen}
      />
      <Tab.Screen
        name="Peixedex"
        component={PeixedexStack}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
