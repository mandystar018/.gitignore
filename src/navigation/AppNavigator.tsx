import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { DivorceStackParamList } from '../types';
import DivorceHomeScreen from '../screens/DivorceHomeScreen';
import DivorcePhaseScreen from '../screens/DivorcePhaseScreen';
import DivorceStepScreen from '../screens/DivorceStepScreen';
import DivorceTimelineScreen from '../screens/DivorceTimelineScreen';

const Stack = createStackNavigator<DivorceStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="DivorceHome"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="DivorceHome" component={DivorceHomeScreen} />
        <Stack.Screen name="DivorcePhase" component={DivorcePhaseScreen} />
        <Stack.Screen name="DivorceStep" component={DivorceStepScreen} />
        <Stack.Screen name="DivorceTimeline" component={DivorceTimelineScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
