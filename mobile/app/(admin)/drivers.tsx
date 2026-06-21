import { View, Text, StyleSheet } from "react-native";
import { colors, spacing } from "@/lib/theme";
import { Card } from "@/components/ui/Card";

export default function AdminDrivers() {
  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.title}>Motoristas</Text>
        <Text style={styles.desc}>Gestão de frota e chauffeurs — /admin/drivers no site.</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface0, padding: spacing.lg },
  title: { fontSize: 18, fontWeight: "800", color: colors.text },
  desc: { color: colors.textMuted, marginTop: 8 },
});
