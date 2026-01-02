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

export function SignInScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { signIn, loading } = useAuthStore();

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validate()) return;

    const result = await signIn(email, password);
    if (result.error) {
      Alert.alert('Sign In Failed', result.error);
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
              <Text style={styles.title}>Welcome back!</Text>
              <Text style={styles.subtitle}>
                Sign in to continue managing your pets
              </Text>
            </View>

            <View style={styles.form}>
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
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                error={errors.password}
                rightIcon={<Text>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />

              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>

              <Button
                title="Sign In"
                onPress={handleSignIn}
                loading={loading}
                size="lg"
                style={styles.button}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.footerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
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
    marginTop: spacing.xl,
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
    fontSize: 56,
    marginBottom: spacing.md,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    ...typography.bodySmall,
    color: colors.primary,
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
});
