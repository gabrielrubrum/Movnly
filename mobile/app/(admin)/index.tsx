import { useEffect, useState } from "react";
import { ScrollView, Text, StyleSheet, View } from "react-native";
import api from "@/lib/api";
import { colors, spacing } from "@/lib/theme";
import { Card } from "@/components/ui/Card";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get("/payments/stats/admin").then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  const items = [
    { label: "Receita", value: `€${stats?.totalRevenue ?? 0}` },
    { label: "Reservas", value: String(stats?.totalBookings ?? "—") },
    { label: "Motoristas", value: String(stats?.activeDrivers ?? "—") },
    { label: "Pendentes", value: String(stats?.pendingPayments ?? "—") },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Operações MOVNLY</Text>
      <Text style={styles.subtitle}>Painel admin — igual ao site /admin</Text>
      <View style={styles.grid}>
        {items.map((item) => (
          <Card key={item.label} style={styles.stat}>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface0 },
  content: { padding: spacing.lg },
  title: { fontSize: 24, fontWeight: "900", color: colors.text },
  subtitle: { color: colors.textMuted, marginTop: 4, marginBottom: spacing.lg },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  stat: { width: "48%", alignItems: "center", paddingVertical: spacing.md },
  statValue: { fontSize: 20, fontWeight: "900", color: colors.gold },
  statLabel: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
});
