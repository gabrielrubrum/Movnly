import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/lib/auth";
import { colors, spacing } from "@/lib/theme";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function AdminSettings() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await logout();
    router.replace("/(public)" as any);
  };

  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.title}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.role}>Admin · {user?.role}</Text>
      </Card>
      <View style={{ marginTop: spacing.lg }}>
        <Button title="Sair" variant="danger" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface0, padding: spacing.lg },
  title: { fontSize: 20, fontWeight: "800", color: colors.text },
  email: { color: colors.textMuted, marginTop: 4 },
  role: { color: colors.gold, marginTop: 8, fontWeight: "700" },
});
