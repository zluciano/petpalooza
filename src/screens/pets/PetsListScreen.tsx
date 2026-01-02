import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { PetCard, EmptyState, IconButton } from '../../components';
import { colors, spacing, typography } from '../../constants/theme';
import { usePetStore } from '../../store/petStore';
import { useAuthStore } from '../../store/authStore';

type Props = {
  navigation: StackNavigationProp<any>;
};

export function PetsListScreen({ navigation }: Props) {
  const { pets, loading, fetchPets, selectPet } = usePetStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchPets();
  }, []);

  const handlePetPress = (pet: any) => {
    selectPet(pet);
    navigation.navigate('PetDetail', { petId: pet.id });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hello, {user?.name?.split(' ')[0] || 'there'}! 👋
          </Text>
          <Text style={styles.title}>Your Pets</Text>
        </View>
        <IconButton
          icon="➕"
          variant="primary"
          onPress={() => navigation.navigate('AddPet')}
        />
      </View>

      {pets.length === 0 && !loading ? (
        <EmptyState
          icon="🐾"
          title="No pets yet"
          description="Add your first pet to start tracking their health and care"
          actionLabel="Add Pet"
          onAction={() => navigation.navigate('AddPet')}
        />
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PetCard pet={item} onPress={() => handlePetPress(item)} />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchPets}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  greeting: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  list: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
});
