import { Tabs, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/lib/auth";
import { colors } from "@/lib/theme";

const ADMIN_ROLES = ["ADMIN", "MANAGER", "OPERATOR", "ACCOUNTANT"];

export default function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  if (user && !ADMIN_ROLES.includes(user.role)) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface0 },
        headerTintColor: colors.gold,
        tabBarStyle: { backgroundColor: colors.surface1, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Ops", tabBarIcon: ({ color, size }) => <Ionicons name="pulse" size={size} color={color} /> }} />
      <Tabs.Screen name="bookings" options={{ title: "Reservas", tabBarIcon: ({ color, size }) => <Ionicons name="list" size={size} color={color} /> }} />
      <Tabs.Screen name="drivers" options={{ title: "Motoristas", tabBarIcon: ({ color, size }) => <Ionicons name="car-sport" size={size} color={color} /> }} />
      <Tabs.Screen name="payments" options={{ title: "Pagamentos", tabBarIcon: ({ color, size }) => <Ionicons name="card" size={size} color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: "Conta", tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} /> }} />
    </Tabs>
  );
}
