import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import WelcomeScreen from '../screens/WelcomeScreen';
import QuizScreen from '../screens/QuizScreen';
import ActivitiesScreen from '../screens/ActivitiesScreen';
import ActivityDetailScreen from '../screens/ActivityDetailScreen';
import SEOHomeScreen from '../screens/SEOHomeScreen';
import KeywordTrackerScreen from '../screens/KeywordTrackerScreen';
import ContentAnalysisScreen from '../screens/ContentAnalysisScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SEOHome"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="SEOHome" component={SEOHomeScreen} />
        <Stack.Screen name="KeywordTracker" component={KeywordTrackerScreen} />
        <Stack.Screen name="ContentAnalysis" component={ContentAnalysisScreen} />
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
