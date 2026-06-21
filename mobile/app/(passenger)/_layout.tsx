import { Tabs, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/lib/auth";
import { colors } from "@/lib/theme";

export default function PassengerLayout() {
  const user = useAuthStore((s) => s.user);
  if (user && user.role !== "PASSENGER" && user.role !== "ADMIN") {
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
      <Tabs.Screen name="index" options={{ title: "Início", tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="book" options={{ title: "Reservar", tabBarIcon: ({ color, size }) => <Ionicons name="cart" size={size} color={color} /> }} />
      <Tabs.Screen name="bookings" options={{ title: "Viagens", tabBarIcon: ({ color, size }) => <Ionicons name="car" size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Conta", tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} /> }} />
      <Tabs.Screen name="history" options={{ href: null, title: "Histórico" }} />
      <Tabs.Screen name="chat" options={{ href: null, title: "Mensagens" }} />
      <Tabs.Screen name="payment-methods" options={{ href: null, title: "Pagamentos" }} />
      <Tabs.Screen name="payment" options={{ href: null, title: "Pagamento" }} />
    </Tabs>
  );
}
