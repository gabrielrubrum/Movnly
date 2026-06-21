import { ScrollView, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { DEMO_ACCOUNTS } from "@/lib/demo-accounts";
import { colors, spacing } from "@/lib/theme";
import { Card } from "@/components/ui/Card";

const PANELS = [
  { role: "passenger", title: "Passageiro", path: "/(auth)/login", desc: "Dashboard, viagens, faturas, perfil" },
  { role: "driver", title: "Motorista", path: "/(auth)/login", desc: "Painel, viagens, ganhos, avaliações" },
  { role: "partner", title: "Parceiro", path: "/(auth)/login", desc: "Reservas, clientes, comissões, relatórios" },
  { role: "admin", title: "Admin", path: "/(auth)/login", desc: "Operações, reservas, motoristas, pagamentos" },
] as const;

export default function PanelsScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Painéis MOVNLY</Text>
      <Text style={styles.subtitle}>Igual ao site — cada perfil tem o seu portal</Text>

      {PANELS.map((panel) => {
        const demo = DEMO_ACCOUNTS[panel.role as keyof typeof DEMO_ACCOUNTS];
        return (
          <Pressable key={panel.role} onPress={() => router.push(panel.path as any)}>
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>{panel.title}</Text>
              <Text style={styles.cardDesc}>{panel.desc}</Text>
              {demo ? (
                <Text style={styles.demo}>Demo: {demo.email}</Text>
              ) : (
                <Text style={styles.demo}>Demo: admin@movnly.com</Text>
              )}
            </Card>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface0 },
  content: { padding: spacing.lg },
  title: { fontSize: 24, fontWeight: "900", color: colors.text },
  subtitle: { color: colors.textMuted, marginTop: 4, marginBottom: spacing.lg },
  card: { marginBottom: spacing.sm },
  cardTitle: { color: colors.gold, fontSize: 16, fontWeight: "800" },
  cardDesc: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  demo: { color: colors.textDim, fontSize: 11, marginTop: 8 },
});
