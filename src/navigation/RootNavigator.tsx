import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { LoadingScreen } from '../components';
import { useAuthStore } from '../store/authStore';

export function RootNavigator() {
  const { user, initialized, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (!initialized) {
    return <LoadingScreen message="Loading PetPalooza..." />;
  }

  return (
    <NavigationContainer>
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
