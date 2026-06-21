import { View, Text, StyleSheet } from "react-native";
import { colors, spacing } from "@/lib/theme";
import { Card } from "@/components/ui/Card";

export default function PassengerChat() {
  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.title}>Mensagens</Text>
        <Text style={styles.desc}>Chat com o motorista durante a viagem ativa — igual ao dashboard web.</Text>
        <Text style={styles.hint}>Disponível quando tiver uma viagem em curso.</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface0, padding: spacing.lg },
  title: { color: colors.text, fontSize: 18, fontWeight: "800" },
  desc: { color: colors.textMuted, marginTop: 8, lineHeight: 20 },
  hint: { color: colors.textDim, marginTop: spacing.md, fontSize: 12 },
});
