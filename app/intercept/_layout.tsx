import { Stack } from "expo-router";

export default function InterceptLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F9F7F2' } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="prayer-card" />
      <Stack.Screen name="reflection" />
      <Stack.Screen name="unlock" />
    </Stack>
  );
}
