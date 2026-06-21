import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import { disconnectSocket } from "@/lib/socket";
import { colors, spacing } from "@/lib/theme";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function PartnerSettings() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const [org, setOrg] = useState("");

  useEffect(() => {
    api.get("/partners/profile").then(({ data }) => setOrg(data.organization));
  }, []);

  const handleLogout = async () => {
    disconnectSocket();
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.org}>{org || "Parceiro MOVNLY"}</Text>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </Card>
      <View style={{ marginTop: spacing.lg }}>
        <Button title="Terminar sessão" onPress={handleLogout} variant="danger" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface0, padding: spacing.lg },
  org: { fontSize: 18, fontWeight: "800", color: colors.purple },
  name: { color: colors.text, marginTop: 8, fontWeight: "600" },
  email: { color: colors.textMuted, marginTop: 4 },
});
