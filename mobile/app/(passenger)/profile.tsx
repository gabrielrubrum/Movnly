import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/lib/auth";
import { disconnectSocket } from "@/lib/socket";
import { colors, spacing } from "@/lib/theme";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function PassengerProfile() {
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
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.role}>{user?.role}</Text>
      </Card>

      <View style={{ marginTop: spacing.lg }}>
        <Button title="Terminar sessão" onPress={handleLogout} variant="danger" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface0, padding: spacing.lg },
  avatar: { width: 64, height: 64, borderRadius: 20, backgroundColor: colors.goldMuted, alignItems: "center", justifyContent: "center", marginBottom: spacing.md },
  avatarText: { fontSize: 28, fontWeight: "900", color: colors.gold },
  name: { fontSize: 20, fontWeight: "800", color: colors.text },
  email: { color: colors.textMuted, marginTop: 4 },
  role: { color: colors.gold, fontSize: 11, fontWeight: "700", textTransform: "uppercase", marginTop: 8, letterSpacing: 1 },
});
