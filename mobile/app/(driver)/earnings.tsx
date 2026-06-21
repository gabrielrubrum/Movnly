import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import api from "@/lib/api";
import { colors, spacing } from "@/lib/theme";
import { Card } from "@/components/ui/Card";

export default function DriverEarnings() {
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });

  useEffect(() => {
    api.get("/payments/stats/driver").then(({ data }) => {
      setStats({
        total: data?.totalEarnings || 0,
        pending: data?.pendingPayouts || 0,
        completed: data?.completedTrips || 0,
      });
    }).catch(() => {});
  }, []);

  return (
    <View style={styles.container}>
      <Card style={styles.mainCard}>
        <Text style={styles.label}>Ganhos totais</Text>
        <Text style={styles.amount}>€{stats.total.toFixed(2)}</Text>
      </Card>

      <View style={styles.row}>
        <Card style={styles.smallCard}>
          <Text style={styles.smallLabel}>Pendente</Text>
          <Text style={styles.smallValue}>€{stats.pending.toFixed(2)}</Text>
        </Card>
        <Card style={styles.smallCard}>
          <Text style={styles.smallLabel}>Viagens</Text>
          <Text style={styles.smallValue}>{stats.completed}</Text>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface0, padding: spacing.lg },
  mainCard: { alignItems: "center", paddingVertical: spacing.xl },
  label: { color: colors.textMuted, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 },
  amount: { color: colors.gold, fontSize: 40, fontWeight: "900", marginTop: spacing.sm },
  row: { flexDirection: "row", gap: spacing.md, marginTop: spacing.md },
  smallCard: { flex: 1, alignItems: "center" },
  smallLabel: { color: colors.textMuted, fontSize: 11 },
  smallValue: { color: colors.text, fontSize: 20, fontWeight: "700", marginTop: 4 },
});
