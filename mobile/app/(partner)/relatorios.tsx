import { View, Text, StyleSheet } from "react-native";
import { colors, spacing } from "@/lib/theme";
import { Card } from "@/components/ui/Card";

export default function PartnerReports() {
  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.title}>Relatórios</Text>
        <Text style={styles.desc}>Exportação de reservas, receita e comissões — igual a /parceiros/relatorios no site.</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface0, padding: spacing.lg },
  title: { color: colors.text, fontSize: 18, fontWeight: "800" },
  desc: { color: colors.textMuted, marginTop: 8, lineHeight: 20 },
});
