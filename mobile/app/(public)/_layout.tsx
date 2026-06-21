import { Stack } from "expo-router";
import { colors } from "@/lib/theme";

export default function PublicLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface0 },
        headerTintColor: colors.gold,
        headerTitleStyle: { fontWeight: "800" },
        contentStyle: { backgroundColor: colors.surface0 },
      }}
    >
      <Stack.Screen name="index" options={{ title: "MOVNLY" }} />
      <Stack.Screen name="book" options={{ title: "Reservar transfer" }} />
      <Stack.Screen name="confirmation" options={{ title: "Confirmação", headerShown: false }} />
      <Stack.Screen name="panels" options={{ title: "Entrar nos painéis" }} />
    </Stack>
  );
}
