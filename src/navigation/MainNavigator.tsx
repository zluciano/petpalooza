import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View, StyleSheet } from 'react-native';
import {
  PetsListScreen,
  AddPetScreen,
  PetDetailScreen,
  EditPetScreen,
  WeightTrackingScreen,
} from '../screens/pets';
import { DocumentsScreen } from '../screens/documents';
import { VetVisitsScreen } from '../screens/vet';
import { MedicationsScreen } from '../screens/medications';
import { DietScreen } from '../screens/diet';
import { ExpensesScreen } from '../screens/expenses';
import { EmergencyVetScreen } from '../screens/emergency';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors, typography } from '../constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabIcon({ focused, icon }: { focused: boolean; icon: string }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      <Text style={styles.tabEmoji}>{icon}</Text>
    </View>
  );
}

function PetsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="PetsList"
        component={PetsListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddPet"
        component={AddPetScreen}
        options={{ title: 'Add Pet' }}
      />
      <Stack.Screen
        name="PetDetail"
        component={PetDetailScreen}
        options={{ title: '' }}
      />
      <Stack.Screen
        name="EditPet"
        component={EditPetScreen}
        options={{ title: 'Edit Pet' }}
      />
      <Stack.Screen
        name="WeightTracking"
        component={WeightTrackingScreen}
        options={{ title: 'Weight' }}
      />
      <Stack.Screen
        name="Documents"
        component={DocumentsScreen}
        options={{ title: 'Documents' }}
      />
      <Stack.Screen
        name="VetVisits"
        component={VetVisitsScreen}
        options={{ title: 'Vet Visits' }}
      />
      <Stack.Screen
        name="Medications"
        component={MedicationsScreen}
        options={{ title: 'Medications' }}
      />
      <Stack.Screen
        name="Diet"
        component={DietScreen}
        options={{ title: 'Diet' }}
      />
      <Stack.Screen
        name="Expenses"
        component={ExpensesScreen}
        options={{ title: 'Expenses' }}
      />
    </Stack.Navigator>
  );
}

function EmergencyStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="EmergencyVetList"
        component={EmergencyVetScreen}
        options={{ title: 'Emergency Vets' }}
      />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Stack.Navigator>
  );
}

export function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Pets"
        component={PetsStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="🐾" />,
        }}
      />
      <Tab.Screen
        name="Emergency"
        component={EmergencyStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="🚨" />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="👤" />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    paddingTop: 8,
    height: 85,
  },
  tabLabel: {
    ...typography.caption,
    marginTop: 4,
  },
  tabIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconFocused: {
    backgroundColor: colors.primaryLight,
  },
  tabEmoji: {
    fontSize: 22,
  },
});
