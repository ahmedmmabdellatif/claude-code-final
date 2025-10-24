import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="name" />
      <Stack.Screen name="age" />
      <Stack.Screen name="stats" />
      <Stack.Screen name="goal" />
      <Stack.Screen name="experience" />
      <Stack.Screen name="location" />
      <Stack.Screen name="frequency" />
      <Stack.Screen name="injuries" />
      <Stack.Screen name="diet" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}
