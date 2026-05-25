import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import WelcomeScreen from '../screens/WelcomeScreen';
import QuizScreen from '../screens/QuizScreen';
import ActivitiesScreen from '../screens/ActivitiesScreen';
import ActivityDetailScreen from '../screens/ActivityDetailScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
        <Stack.Screen
          name="Activities"
          component={ActivitiesScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
