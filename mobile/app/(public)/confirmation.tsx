import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, spacing } from "@/lib/theme";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useBookingStore } from "@/lib/booking-store";

export default function ConfirmationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const reset = useBookingStore((s) => s.reset);

  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.badge}>CONFIRMADO</Text>
        <Text style={styles.title}>Transfer reservado!</Text>
        <Text style={styles.desc}>Receberá confirmação por email. O motorista será atribuído após o pagamento.</Text>
        {id ? <Text style={styles.ref}>Ref: {id.slice(0, 8).toUpperCase()}</Text> : null}
      </Card>
      <View style={styles.actions}>
        <Button
          title="Nova reserva"
          onPress={() => {
            reset();
            router.replace("/(public)/book");
          }}
        />
        <Button title="Voltar ao início" variant="ghost" onPress={() => router.replace("/(public)" as any)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface0, padding: spacing.lg, justifyContent: "center" },
  badge: { color: colors.emerald, fontSize: 11, fontWeight: "800", letterSpacing: 2 },
  title: { color: colors.text, fontSize: 28, fontWeight: "900", marginTop: 8 },
  desc: { color: colors.textMuted, marginTop: 8, lineHeight: 22 },
  ref: { color: colors.gold, marginTop: spacing.md, fontWeight: "700" },
  actions: { marginTop: spacing.lg, gap: spacing.sm },
});
