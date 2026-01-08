import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Card } from './Card';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { getSignedPhotoUrl } from '../services/supabase';
import type { Pet } from '../types';
import { differenceInYears, differenceInMonths } from 'date-fns';

interface PetCardProps {
  pet: Pet;
  onPress: () => void;
}

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
  const dob = new Date(dateOfBirth);
  const years = differenceInYears(new Date(), dob);
  if (years >= 1) {
    return `${years} year${years > 1 ? 's' : ''} old`;
  }
  const months = differenceInMonths(new Date(), dob);
  return `${months} month${months !== 1 ? 's' : ''} old`;
}

export function PetCard({ pet, onPress }: PetCardProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (pet.photo_url) {
      getSignedPhotoUrl(pet.photo_url).then(setPhotoUrl);
    }
  }, [pet.photo_url]);

  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.content}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.emoji}>{petTypeEmojis[pet.type] || '🐾'}</Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.name}>{pet.name}</Text>
          <Text style={styles.type}>
            {petTypeEmojis[pet.type]} {pet.type.charAt(0).toUpperCase() + pet.type.slice(1)}
            {pet.breed && ` • ${pet.breed}`}
          </Text>
          {pet.date_of_birth && (
            <Text style={styles.age}>{getAge(pet.date_of_birth)}</Text>
          )}
          {pet.weight && (
            <Text style={styles.weight}>
              {pet.weight} {pet.weight_unit}
            </Text>
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photo: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.lg,
  },
  photoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 32,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    ...typography.h3,
    color: colors.text,
  },
  type: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  age: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  weight: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
});
