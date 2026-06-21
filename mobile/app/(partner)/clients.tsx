import { useEffect, useState } from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import api from "@/lib/api";
import { colors, spacing } from "@/lib/theme";
import { Card } from "@/components/ui/Card";

interface Client {
  name: string;
  email: string;
  totalBookings: number;
  totalSpent: number;
}

export default function PartnerClients() {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    api.get("/partners/clients").then(({ data }) => setClients(data));
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Clientes</Text>
      {clients.length === 0 ? (
        <Text style={styles.empty}>Sem clientes registados.</Text>
      ) : (
        clients.map((c) => (
          <Card key={c.email} style={{ marginBottom: spacing.sm }}>
            <Text style={styles.name}>{c.name}</Text>
            <Text style={styles.email}>{c.email}</Text>
            <Text style={styles.meta}>{c.totalBookings} viagens · €{c.totalSpent.toFixed(2)}</Text>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface0 },
  content: { padding: spacing.lg },
  title: { fontSize: 22, fontWeight: "800", color: colors.text, marginBottom: spacing.md },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: 40 },
  name: { fontSize: 16, fontWeight: "700", color: colors.text },
  email: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  meta: { color: colors.purple, fontSize: 12, marginTop: 8, fontWeight: "600" },
});
