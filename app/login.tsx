import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  StyleSheet,
  Platform,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Input } from '@/components';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { role } = useLocalSearchParams<{ role: string }>();
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      setLoading(true);
      await login(email, password, (role as 'client' | 'coach') || 'client');
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>
            Log in as {role === 'client' ? 'Client' : 'Coach'}
          </Text>

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="your@email.com"
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />

          <Pressable>
            <Text style={styles.forgotPassword}>Forgot password?</Text>
          </Pressable>

          <Button
            title="LOG IN"
            onPress={handleLogin}
            loading={loading}
            disabled={!email || !password}
            style={styles.button}
          />

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don&apos;t have an account? </Text>
            <Pressable
              onPress={() =>
                router.push({ pathname: '/register', params: { role } })
              }
            >
              <Text style={styles.signupLink}>Sign up</Text>
            </Pressable>
          </View>

          <View style={styles.testCredentials}>
            <Text style={styles.testTitle}>Test Credentials:</Text>
            <Text style={styles.testText}>
              {role === 'coach'
                ? 'Email: coach@test.com\nPassword: coach123'
                : 'Email: client@test.com\nPassword: client123'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.dark,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: spacing.screen,
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.size.h1,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  forgotPassword: {
    fontSize: typography.size.small,
    color: colors.accent.primary,
    textAlign: 'right',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  button: {
    marginTop: spacing.md,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  signupText: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
  },
  signupLink: {
    fontSize: typography.size.small,
    color: colors.accent.primary,
    fontWeight: typography.weight.semibold,
  },
  testCredentials: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.bg.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accent.primary,
  },
  testTitle: {
    fontSize: typography.size.small,
    color: colors.accent.primary,
    fontWeight: typography.weight.semibold,
    marginBottom: spacing.xs,
  },
  testText: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
