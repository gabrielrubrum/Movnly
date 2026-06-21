import { View, Text, StyleSheet } from "react-native";
import { colors, spacing } from "@/lib/theme";
import { Card } from "@/components/ui/Card";

export default function DriverRatings() {
  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.title}>Avaliações</Text>
        <Text style={styles.rating}>4.9 ★</Text>
        <Text style={styles.desc}>Feedback dos passageiros — igual a /motorista/avaliacoes no site.</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface0, padding: spacing.lg },
  title: { color: colors.text, fontSize: 18, fontWeight: "800" },
  rating: { color: colors.gold, fontSize: 36, fontWeight: "900", marginTop: 8 },
  desc: { color: colors.textMuted, marginTop: 8 },
});
