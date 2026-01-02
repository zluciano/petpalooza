import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';
import { Card, Button, EmptyState } from '../../components';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import type { EmergencyVet } from '../../types';

type Props = {
  navigation: StackNavigationProp<any>;
};

const MOCK_EMERGENCY_VETS: EmergencyVet[] = [
  {
    id: '1',
    name: 'City Emergency Animal Hospital',
    address: '123 Main St, Downtown',
    phone: '+1 (555) 123-4567',
    latitude: 0,
    longitude: 0,
    is_24_hours: true,
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Pet Urgent Care Center',
    address: '456 Oak Ave, Westside',
    phone: '+1 (555) 234-5678',
    latitude: 0,
    longitude: 0,
    is_24_hours: true,
    rating: 4.5,
  },
  {
    id: '3',
    name: "VetNow Emergency Clinic",
    address: '789 Pine Rd, Eastville',
    phone: '+1 (555) 345-6789',
    latitude: 0,
    longitude: 0,
    is_24_hours: false,
    rating: 4.7,
  },
  {
    id: '4',
    name: 'Animal ER & Critical Care',
    address: '321 Elm Blvd, Northtown',
    phone: '+1 (555) 456-7890',
    latitude: 0,
    longitude: 0,
    is_24_hours: true,
    rating: 4.9,
  },
];

export function EmergencyVetScreen({ navigation }: Props) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [vets, setVets] = useState<EmergencyVet[]>([]);

  useEffect(() => {
    getLocationAndVets();
  }, []);

  const getLocationAndVets = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Enable location to find nearby emergency vets'
        );
        setVets(MOCK_EMERGENCY_VETS);
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      // In a real app, you would call an API like Google Places
      // to find nearby emergency vets. For now, we use mock data.
      setVets(
        MOCK_EMERGENCY_VETS.map((vet, index) => ({
          ...vet,
          distance: (index + 1) * 1.2 + Math.random() * 2,
        })).sort((a, b) => (a.distance || 0) - (b.distance || 0))
      );
    } catch (error) {
      console.error('Error getting location:', error);
      setVets(MOCK_EMERGENCY_VETS);
    }
    setLoading(false);
  };

  const handleCall = (phone: string) => {
    const phoneUrl = `tel:${phone.replace(/[^\d+]/g, '')}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Error', 'Unable to make phone call');
        }
      })
      .catch(() => Alert.alert('Error', 'Unable to make phone call'));
  };

  const handleDirections = (vet: EmergencyVet) => {
    const address = encodeURIComponent(vet.address);
    const mapsUrl = `https://maps.google.com/?q=${address}`;
    Linking.openURL(mapsUrl);
  };

  const renderVetCard = ({ item }: { item: EmergencyVet }) => (
    <Card style={styles.vetCard}>
      <View style={styles.vetHeader}>
        <View style={styles.vetIcon}>
          <Text style={styles.vetEmoji}>🏥</Text>
        </View>
        <View style={styles.vetInfo}>
          <View style={styles.vetNameRow}>
            <Text style={styles.vetName}>{item.name}</Text>
            {item.is_24_hours && (
              <View style={styles.badge24h}>
                <Text style={styles.badge24hText}>24/7</Text>
              </View>
            )}
          </View>
          <Text style={styles.vetAddress}>{item.address}</Text>
          {item.rating && (
            <Text style={styles.vetRating}>
              ⭐ {item.rating.toFixed(1)}
            </Text>
          )}
          {item.distance !== undefined && (
            <Text style={styles.vetDistance}>
              📍 {item.distance.toFixed(1)} km away
            </Text>
          )}
        </View>
      </View>

      <View style={styles.vetActions}>
        <Button
          title="Call Now"
          onPress={() => handleCall(item.phone)}
          style={styles.callButton}
          icon={<Text>📞</Text>}
        />
        <Button
          title="Directions"
          variant="outline"
          onPress={() => handleDirections(item)}
          style={styles.directionButton}
          icon={<Text>🗺️</Text>}
        />
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <View style={styles.emergencyBanner}>
          <Text style={styles.emergencyIcon}>🚨</Text>
          <Text style={styles.emergencyTitle}>Emergency?</Text>
          <Text style={styles.emergencyText}>
            If your pet is in immediate danger, call the nearest 24/7 emergency vet
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Finding nearby emergency vets...</Text>
        </View>
      ) : vets.length === 0 ? (
        <EmptyState
          icon="🏥"
          title="No vets found"
          description="Unable to find emergency vets in your area"
          actionLabel="Retry"
          onAction={getLocationAndVets}
        />
      ) : (
        <FlatList
          data={vets}
          keyExtractor={(item) => item.id}
          renderItem={renderVetCard}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 Save your regular vet's emergency contact for quick access
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
  },
  emergencyBanner: {
    backgroundColor: colors.error + '15',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  emergencyIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  emergencyTitle: {
    ...typography.h2,
    color: colors.error,
  },
  emergencyText: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  list: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  vetCard: {
    marginBottom: spacing.md,
  },
  vetHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  vetIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.error + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  vetEmoji: {
    fontSize: 28,
  },
  vetInfo: {
    flex: 1,
  },
  vetNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  vetName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  badge24h: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  badge24hText: {
    ...typography.caption,
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
  vetAddress: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  vetRating: {
    ...typography.bodySmall,
    color: colors.text,
    marginTop: spacing.xs,
  },
  vetDistance: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  vetActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  callButton: {
    flex: 1,
    backgroundColor: colors.error,
  },
  directionButton: {
    flex: 1,
  },
  footer: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  footerText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
