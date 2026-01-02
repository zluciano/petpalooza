import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { CloudBackground, Button } from '../../components';
import { colors, spacing, typography } from '../../constants/theme';

type Props = {
  navigation: StackNavigationProp<any>;
};

export function WelcomeScreen({ navigation }: Props) {
  return (
    <CloudBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.emoji}>🐾</Text>
            <Text style={styles.title}>PetPalooza</Text>
            <Text style={styles.subtitle}>
              Your complete pet care companion
            </Text>
          </View>

          <View style={styles.features}>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>📋</Text>
              <Text style={styles.featureText}>Track health records</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🏥</Text>
              <Text style={styles.featureText}>Schedule vet visits</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>💊</Text>
              <Text style={styles.featureText}>Medication reminders</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🍽️</Text>
              <Text style={styles.featureText}>Diet tracking</Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Get Started"
            onPress={() => navigation.navigate('SignUp')}
            size="lg"
            style={styles.button}
          />
          <Button
            title="I already have an account"
            onPress={() => navigation.navigate('SignIn')}
            variant="ghost"
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    </CloudBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  emoji: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  features: {
    gap: spacing.md,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.md,
  },
  featureIcon: {
    fontSize: 28,
  },
  featureText: {
    ...typography.body,
    color: colors.text,
  },
  actions: {
    gap: spacing.sm,
  },
  button: {
    width: '100%',
  },
});
