import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import colors from '@/constants/colors';

export function BackButton() {
  return (
    <Pressable style={styles.button} onPress={() => router.back()}>
      <ChevronLeft size={28} color={colors.text.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 4,
  },
});
