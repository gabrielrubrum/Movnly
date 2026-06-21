import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/lib/auth";
import { disconnectSocket } from "@/lib/socket";
import { colors, spacing } from "@/lib/theme";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function DriverSettings() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const handleLogout = async () => {
    disconnectSocket();
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.badge}>Motorista MOVNLY</Text>
      </Card>
      <View style={{ marginTop: spacing.lg }}>
        <Button title="Terminar sessão" onPress={handleLogout} variant="danger" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface0, padding: spacing.lg },
  name: { fontSize: 20, fontWeight: "800", color: colors.text },
  email: { color: colors.textMuted, marginTop: 4 },
  badge: { color: colors.gold, fontSize: 11, fontWeight: "700", textTransform: "uppercase", marginTop: 12, letterSpacing: 1 },
});
