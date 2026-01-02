// Minimal test app to isolate the crash
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
// import Svg, { Path } from 'react-native-svg';

const Stack = createStackNavigator();

function TestScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Test Screen</Text>
      {/* Uncomment to test SVG
      <Svg width={100} height={100}>
        <Path d="M0 0 L100 100" stroke="black" />
      </Svg>
      */}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Test" component={TestScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
  },
});
