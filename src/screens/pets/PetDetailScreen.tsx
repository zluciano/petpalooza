import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Card, Button, IconButton } from '../../components';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { usePetStore } from '../../store/petStore';
import { getSignedPhotoUrl } from '../../services/supabase';
import { differenceInYears, differenceInMonths } from 'date-fns';
import type { Pet } from '../../types';

// Format date in UTC to avoid timezone issues
function formatDateUTC(date: Date): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

type Props = {
  navigation: StackNavigationProp<any>;
  route: RouteProp<any>;
};

const petTypeEmojis: Record<string, string> = {
  dog: '🐕',
  cat: '🐱',
  fish: '🐟',
  snake: '🐍',
  bird: '🐦',
  rabbit: '🐰',
  hamster: '🐹',
  turtle: '🐢',
  other: '🐾',
};

function getAge(dateOfBirth: string): string {
  // Parse as UTC to avoid timezone issues
  const dob = new Date(dateOfBirth + 'T12:00:00Z');
  const years = differenceInYears(new Date(), dob);
  const months = differenceInMonths(new Date(), dob) % 12;

  if (years >= 1) {
    return months > 0
      ? `${years} year${years > 1 ? 's' : ''}, ${months} month${months > 1 ? 's' : ''}`
      : `${years} year${years > 1 ? 's' : ''}`;
  }
  const totalMonths = differenceInMonths(new Date(), dob);
  return `${totalMonths} month${totalMonths !== 1 ? 's' : ''}`;
}

export function PetDetailScreen({ navigation, route }: Props) {
  const { selectedPet, deletePet, loading } = usePetStore();
  const pet = selectedPet;
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Load signed URL for pet photo
  useEffect(() => {
    if (pet?.photo_url) {
      getSignedPhotoUrl(pet.photo_url).then(setPhotoUrl);
    }
  }, [pet?.photo_url]);

  if (!pet) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Pet not found</Text>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Pet',
      `Are you sure you want to remove ${pet.name} from your pets? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deletePet(pet.id);
            if (result.error) {
              Alert.alert('Error', result.error);
            } else {
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    { icon: '📊', label: 'Weight Tracking', screen: 'WeightTracking' },
    { icon: '📄', label: 'Documents', screen: 'Documents' },
    { icon: '🏥', label: 'Vet Visits', screen: 'VetVisits' },
    { icon: '💊', label: 'Medications', screen: 'Medications' },
    { icon: '🍽️', label: 'Diet & Feeding', screen: 'Diet' },
    { icon: '💰', label: 'Expenses', screen: 'Expenses' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.emoji}>{petTypeEmojis[pet.type] || '🐾'}</Text>
            </View>
          )}

          <Text style={styles.name}>{pet.name}</Text>
          <Text style={styles.type}>
            {petTypeEmojis[pet.type]} {pet.type.charAt(0).toUpperCase() + pet.type.slice(1)}
            {pet.breed && ` • ${pet.breed}`}
          </Text>
        </View>

        <View style={styles.content}>
          <Card style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Pet Information</Text>

            {pet.date_of_birth && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Age</Text>
                <Text style={styles.infoValue}>{getAge(pet.date_of_birth)}</Text>
              </View>
            )}

            {pet.date_of_birth && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Birthday</Text>
                <Text style={styles.infoValue}>
                  {formatDateUTC(new Date(pet.date_of_birth + 'T12:00:00Z'))}
                </Text>
              </View>
            )}

            {pet.weight && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Weight</Text>
                <Text style={styles.infoValue}>
                  {pet.weight} {pet.weight_unit}
                </Text>
              </View>
            )}

            {pet.size && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Size</Text>
                <Text style={styles.infoValue}>
                  {pet.size} {pet.size_unit}
                </Text>
              </View>
            )}

            {pet.color && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Color</Text>
                <Text style={styles.infoValue}>{pet.color}</Text>
              </View>
            )}

            {pet.microchip_id && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Microchip ID</Text>
                <Text style={styles.infoValue}>{pet.microchip_id}</Text>
              </View>
            )}

            {pet.notes && (
              <View style={styles.notesSection}>
                <Text style={styles.infoLabel}>Notes</Text>
                <Text style={styles.notes}>{pet.notes}</Text>
              </View>
            )}
          </Card>

          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.menuGrid}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.screen}
                style={styles.menuItem}
                onPress={() => navigation.navigate(item.screen, { petId: pet.id })}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.actions}>
            <Button
              title="Edit Pet"
              variant="outline"
              onPress={() => navigation.navigate('EditPet', { petId: pet.id })}
              style={styles.actionButton}
            />
            <Button
              title="Delete Pet"
              variant="ghost"
              onPress={handleDelete}
              style={styles.deleteButton}
              textStyle={styles.deleteButtonText}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.primaryLight,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.surface,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.surface,
  },
  emoji: {
    fontSize: 56,
  },
  name: {
    ...typography.h1,
    color: colors.text,
    marginTop: spacing.md,
  },
  type: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  content: {
    padding: spacing.lg,
  },
  infoCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  notesSection: {
    marginTop: spacing.md,
  },
  notes: {
    ...typography.body,
    color: colors.text,
    marginTop: spacing.xs,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  menuItem: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  menuIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  menuLabel: {
    ...typography.bodySmall,
    color: colors.text,
    textAlign: 'center',
  },
  actions: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  actionButton: {
    flex: 1,
  },
  deleteButton: {
    flex: 1,
  },
  deleteButtonText: {
    color: colors.error,
  },
});
