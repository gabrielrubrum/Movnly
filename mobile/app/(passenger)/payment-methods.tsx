import { View, Text, StyleSheet } from "react-native";
import { colors, spacing } from "@/lib/theme";
import { Card } from "@/components/ui/Card";

export default function PassengerPaymentMethods() {
  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.title}>Faturas & Pagamentos</Text>
        <Text style={styles.desc}>Gerir cartões guardados e histórico de faturas — igual a /dashboard/payment no site.</Text>
        <Text style={styles.hint}>Pagamento do transfer é feito no wizard de reserva (passo 5).</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface0, padding: spacing.lg },
  title: { color: colors.text, fontSize: 18, fontWeight: "800" },
  desc: { color: colors.textMuted, marginTop: 8, lineHeight: 20 },
  hint: { color: colors.gold, marginTop: spacing.md, fontSize: 12 },
});
