import React from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Avatar } from '../components';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { useAuthStore } from '../store/authStore';
import { usePetStore } from '../store/petStore';

export function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const { pets } = usePetStore();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.profileHeader}>
            <Avatar name={user?.name} size={100} />
            <Text style={styles.name}>{user?.name || 'Pet Parent'}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>

          <Card style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{pets.length}</Text>
                <Text style={styles.statLabel}>Pets</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Visits</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Documents</Text>
              </View>
            </View>
          </Card>

          <Text style={styles.sectionTitle}>Settings</Text>

          <Card style={styles.menuCard}>
            <View style={styles.menuItem}>
              <Text style={styles.menuIcon}>👤</Text>
              <Text style={styles.menuText}>Edit Profile</Text>
              <Text style={styles.menuArrow}>›</Text>
            </View>
            <View style={styles.menuDivider} />
            <View style={styles.menuItem}>
              <Text style={styles.menuIcon}>🔔</Text>
              <Text style={styles.menuText}>Notifications</Text>
              <Text style={styles.menuArrow}>›</Text>
            </View>
            <View style={styles.menuDivider} />
            <View style={styles.menuItem}>
              <Text style={styles.menuIcon}>🎨</Text>
              <Text style={styles.menuText}>Appearance</Text>
              <Text style={styles.menuArrow}>›</Text>
            </View>
            <View style={styles.menuDivider} />
            <View style={styles.menuItem}>
              <Text style={styles.menuIcon}>🔒</Text>
              <Text style={styles.menuText}>Privacy</Text>
              <Text style={styles.menuArrow}>›</Text>
            </View>
          </Card>

          <Text style={styles.sectionTitle}>Support</Text>

          <Card style={styles.menuCard}>
            <View style={styles.menuItem}>
              <Text style={styles.menuIcon}>❓</Text>
              <Text style={styles.menuText}>Help Center</Text>
              <Text style={styles.menuArrow}>›</Text>
            </View>
            <View style={styles.menuDivider} />
            <View style={styles.menuItem}>
              <Text style={styles.menuIcon}>💬</Text>
              <Text style={styles.menuText}>Contact Us</Text>
              <Text style={styles.menuArrow}>›</Text>
            </View>
            <View style={styles.menuDivider} />
            <View style={styles.menuItem}>
              <Text style={styles.menuIcon}>⭐</Text>
              <Text style={styles.menuText}>Rate PetPalooza</Text>
              <Text style={styles.menuArrow}>›</Text>
            </View>
          </Card>

          <Button
            title="Sign Out"
            variant="outline"
            onPress={handleSignOut}
            style={styles.signOutButton}
            textStyle={styles.signOutText}
          />

          <Text style={styles.version}>PetPalooza v1.0.0</Text>
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
  content: {
    padding: spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  name: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.md,
  },
  email: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statsCard: {
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...typography.h2,
    color: colors.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  menuCard: {
    marginBottom: spacing.lg,
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  menuText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  menuArrow: {
    ...typography.h3,
    color: colors.textLight,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 52,
  },
  signOutButton: {
    marginTop: spacing.md,
    borderColor: colors.error,
  },
  signOutText: {
    color: colors.error,
  },
  version: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
});
