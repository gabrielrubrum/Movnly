import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/lib/auth";
import { colors, spacing } from "@/lib/theme";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function PassengerHome() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Olá, {user?.name?.split(" ")[0]}</Text>
      <Text style={styles.subtitle}>Dashboard do passageiro</Text>

      <Card style={styles.hero}>
        <Text style={styles.heroBadge}>COMPRAR TRANSFER</Text>
        <Text style={styles.heroTitle}>Wizard completo — igual ao site</Text>
        <Text style={styles.heroDesc}>Trajeto → Veículo → Opcionais → Dados → Pagamento</Text>
        <View style={{ marginTop: spacing.md }}>
          <Button title="Reservar transfer agora" onPress={() => router.push("/(public)/book")} />
        </View>
      </Card>

      <View style={styles.menu}>
        <Button title="Próximas viagens" variant="ghost" onPress={() => router.push("/(passenger)/bookings")} />
        <Button title="Histórico" variant="ghost" onPress={() => router.push("/(passenger)/history")} />
        <Button title="Mensagens" variant="ghost" onPress={() => router.push("/(passenger)/chat")} />
        <Button title="Faturas & Pagamentos" variant="ghost" onPress={() => router.push("/(passenger)/payment-methods")} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface0 },
  content: { padding: spacing.lg },
  greeting: { fontSize: 28, fontWeight: "800", color: colors.text },
  subtitle: { color: colors.textMuted, marginTop: 4 },
  hero: { marginTop: spacing.lg, borderColor: colors.goldMuted },
  heroBadge: { color: colors.gold, fontSize: 10, fontWeight: "800", letterSpacing: 2 },
  heroTitle: { fontSize: 18, fontWeight: "800", color: colors.text, marginTop: 8 },
  heroDesc: { color: colors.textMuted, fontSize: 13, marginTop: 6 },
  menu: { marginTop: spacing.lg, gap: spacing.sm },
});
