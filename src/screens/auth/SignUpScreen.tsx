import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { CloudBackground, Button, Input } from '../../components';
import { colors, spacing, typography } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

type Props = {
  navigation: StackNavigationProp<any>;
};

export function SignUpScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const { signUp, loading } = useAuthStore();

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;

    const result = await signUp(email, password, name);
    if (result.error) {
      Alert.alert('Sign Up Failed', result.error);
    } else {
      Alert.alert(
        'Account Created!',
        'Please check your email to verify your account.',
        [{ text: 'OK', onPress: () => navigation.navigate('SignIn') }]
      );
    }
  };

  return (
    <CloudBackground>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Text style={styles.backIcon}>←</Text>
              </TouchableOpacity>
              <Text style={styles.emoji}>🐾</Text>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Join PetPalooza and start caring for your pets better
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Full Name"
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                autoCapitalize="words"
                autoComplete="name"
                error={errors.name}
              />

              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={errors.email}
              />

              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                error={errors.password}
                hint="At least 8 characters"
                rightIcon={<Text>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />

              <Input
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                error={errors.confirmPassword}
              />

              <Button
                title="Create Account"
                onPress={handleSignUp}
                loading={loading}
                size="lg"
                style={styles.button}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.terms}>
              By creating an account, you agree to our Terms of Service and
              Privacy Policy
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </CloudBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  backIcon: {
    fontSize: 28,
    color: colors.text,
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  button: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  footerLink: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  terms: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
});
