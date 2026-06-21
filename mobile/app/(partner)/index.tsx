import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import api from "@/lib/api";
import type { PartnerDashboard } from "@/lib/types";
import { colors, spacing } from "@/lib/theme";
import { Card } from "@/components/ui/Card";

export default function PartnerDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<PartnerDashboard | null>(null);

  useEffect(() => {
    api.get("/partners/dashboard").then(({ data }) => setStats(data));
  }, []);

  const items = [
    { label: "Reservas", value: String(stats?.bookingsThisMonth ?? 0) },
    { label: "Receita", value: `€${(stats?.revenueGenerated ?? 0).toFixed(0)}` },
    { label: "Comissões", value: `€${(stats?.commissionsEarned ?? 0).toFixed(0)}` },
    { label: "Convidados", value: String(stats?.guestsServed ?? 0) },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.org}>{stats?.organization || "Parceiro MOVNLY"}</Text>
      <Text style={styles.subtitle}>Painel de parceiros · {stats?.type || "hotel"}</Text>

      <View style={styles.grid}>
        {items.map((item) => (
          <Card key={item.label} style={styles.statCard}>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </Card>
        ))}
      </View>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={styles.commissionTitle}>Ações rápidas</Text>
        <Pressable onPress={() => router.push("/(partner)/nova-reserva")}>
          <Text style={styles.actionLink}>+ Nova reserva para convidado</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/(partner)/relatorios")}>
          <Text style={styles.actionLink}>Ver relatórios</Text>
        </Pressable>
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={styles.commissionTitle}>Comissão mensal</Text>
        <Text style={styles.commissionAmount}>€{(stats?.commissionsEarned ?? 0).toFixed(2)}</Text>
        <Text style={styles.commissionRate}>Taxa: {stats?.commissionRate ?? 10}% por reserva</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface0 },
  content: { padding: spacing.lg },
  org: { fontSize: 24, fontWeight: "800", color: colors.text },
  subtitle: { color: colors.textMuted, marginTop: 4, textTransform: "capitalize" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.lg },
  statCard: { width: "48%", alignItems: "center", paddingVertical: spacing.md },
  statValue: { fontSize: 22, fontWeight: "900", color: colors.text },
  statLabel: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  commissionTitle: { color: colors.textMuted, fontSize: 12 },
  commissionAmount: { color: colors.gold, fontSize: 32, fontWeight: "900", marginTop: 4 },
  commissionRate: { color: colors.textDim, fontSize: 12, marginTop: 4 },
  actionLink: { color: colors.purple, fontSize: 14, fontWeight: "700", marginTop: 8 },
});
