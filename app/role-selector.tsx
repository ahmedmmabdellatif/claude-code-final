import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { Card } from '@/components';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';

export default function RoleSelectorScreen() {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.emoji}>🎯</Text>
        <Text style={styles.title}>I am a...</Text>

        <Card
          onPress={() => router.push({ pathname: '/login', params: { role: 'client' } })}
          style={styles.card}
        >
          <Text style={styles.cardEmoji}>🧍</Text>
          <Text style={styles.cardTitle}>Client</Text>
          <Text style={styles.cardDescription}>
            Track workouts, meals, and progress
          </Text>
        </Card>

        <Card
          onPress={() => router.push({ pathname: '/login', params: { role: 'coach' } })}
          style={styles.card}
        >
          <Text style={styles.cardEmoji}>🧑‍🏫</Text>
          <Text style={styles.cardTitle}>Coach</Text>
          <Text style={styles.cardDescription}>
            Manage clients and create plans
          </Text>
        </Card>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.dark,
    padding: spacing.screen,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.size.h1,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xl,
  },
  card: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  cardDescription: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
