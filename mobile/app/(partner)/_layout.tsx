import { Tabs, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/lib/auth";
import { colors } from "@/lib/theme";

export default function PartnerLayout() {
  const user = useAuthStore((s) => s.user);
  if (user && user.role !== "PARTNER" && user.role !== "ADMIN") {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface0 },
        headerTintColor: colors.purple,
        tabBarStyle: { backgroundColor: colors.surface1, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.purple,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Dashboard", tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} /> }} />
      <Tabs.Screen name="bookings" options={{ title: "Reservas", tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} /> }} />
      <Tabs.Screen name="clients" options={{ title: "Clientes", tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} /> }} />
      <Tabs.Screen name="commissions" options={{ title: "Comissões", tabBarIcon: ({ color, size }) => <Ionicons name="cash" size={size} color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: "Conta", tabBarIcon: ({ color, size }) => <Ionicons name="business" size={size} color={color} /> }} />
      <Tabs.Screen name="nova-reserva" options={{ href: null, title: "Nova reserva" }} />
      <Tabs.Screen name="relatorios" options={{ href: null, title: "Relatórios" }} />
    </Tabs>
  );
}
