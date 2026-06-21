import { useEffect, useState } from "react";
import { ScrollView, Text, StyleSheet, View } from "react-native";
import api from "@/lib/api";
import { colors, spacing } from "@/lib/theme";
import { Card } from "@/components/ui/Card";

interface Commission {
  id: string;
  amount: number;
  rate: number;
  status: string;
  createdAt: string;
}

export default function PartnerCommissions() {
  const [commissions, setCommissions] = useState<Commission[]>([]);

  useEffect(() => {
    api.get("/partners/commissions").then(({ data }) => setCommissions(data));
  }, []);

  const total = commissions.reduce((s, c) => s + c.amount, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={{ alignItems: "center", marginBottom: spacing.lg }}>
        <Text style={styles.totalLabel}>Total comissões</Text>
        <Text style={styles.total}>€{total.toFixed(2)}</Text>
      </Card>

      {commissions.map((c) => (
        <Card key={c.id} style={{ marginBottom: spacing.sm }}>
          <View style={styles.row}>
            <Text style={styles.amount}>€{c.amount.toFixed(2)}</Text>
            <Text style={[styles.status, c.status === "paid" ? styles.paid : styles.pending]}>
              {c.status === "paid" ? "Pago" : "Pendente"}
            </Text>
          </View>
          <Text style={styles.meta}>{c.rate}% · {new Date(c.createdAt).toLocaleDateString("pt-PT")}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface0 },
  content: { padding: spacing.lg },
  totalLabel: { color: colors.textMuted, fontSize: 12 },
  total: { color: colors.gold, fontSize: 36, fontWeight: "900", marginTop: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  amount: { fontSize: 18, fontWeight: "700", color: colors.text },
  status: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  paid: { color: colors.emerald },
  pending: { color: colors.amber },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: 6 },
});
