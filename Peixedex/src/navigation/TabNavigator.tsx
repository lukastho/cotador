import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import CameraScreen from '../screens/CameraScreen';
import PeixedexScreen from '../screens/PeixedexScreen';

export type RootTabParamList = {
  Início: undefined;
  Câmera: undefined;
  Peixedex: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

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
        component={PeixedexScreen}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
