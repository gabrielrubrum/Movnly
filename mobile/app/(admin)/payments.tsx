import { View, Text, StyleSheet } from "react-native";
import { colors, spacing } from "@/lib/theme";
import { Card } from "@/components/ui/Card";

export default function AdminPayments() {
  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.title}>Pagamentos</Text>
        <Text style={styles.desc}>Reconciliação Stripe e transferências — /admin/payments no site.</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface0, padding: spacing.lg },
  title: { fontSize: 18, fontWeight: "800", color: colors.text },
  desc: { color: colors.textMuted, marginTop: 8 },
});
