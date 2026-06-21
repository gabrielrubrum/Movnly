import { ScrollView, Text, StyleSheet, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { BookingEngine } from "@/components/booking/BookingEngine";
import { MAIN_ROUTES } from "@/lib/constants";
import { useBookingStore } from "@/lib/booking-store";
import { colors, spacing } from "@/lib/theme";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function PublicHome() {
  const router = useRouter();
  const prefillRoute = useBookingStore((s) => s.prefillRoute);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.logo}>MOVNLY</Text>
      <Text style={styles.tagline}>Private Chauffeur · Lisboa & Cascais</Text>
      <Text style={styles.desc}>Reserve transfer, pague online e acompanhe a viagem — igual ao site.</Text>

      <BookingEngine />

      <Text style={styles.section}>Rotas populares</Text>
      {MAIN_ROUTES.map((route) => (
        <Card key={`${route.from}-${route.to}`} style={styles.routeCard}>
          <Text style={styles.routeTitle}>{route.from} → {route.to}</Text>
          <Text style={styles.routeMeta}>{route.duration} · desde €{route.price}</Text>
          <View style={{ marginTop: spacing.sm }}>
            <Button
              title="Reservar"
              variant="ghost"
              onPress={() => {
                prefillRoute(route.from, route.to);
                router.push("/(public)/book");
              }}
            />
          </View>
        </Card>
      ))}

      <Card style={styles.panelsCard}>
        <Text style={styles.panelsTitle}>Já tem conta?</Text>
        <Text style={styles.panelsDesc}>Passageiro, motorista, parceiro ou admin — entre no seu painel.</Text>
        <View style={{ marginTop: spacing.md }}>
          <Button title="Entrar nos painéis" onPress={() => router.push("/(public)/panels")} />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface0 },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  logo: { fontSize: 32, fontWeight: "900", color: colors.gold, letterSpacing: 4, textAlign: "center" },
  tagline: { color: colors.textMuted, textAlign: "center", marginTop: 4 },
  desc: { color: colors.textDim, textAlign: "center", marginTop: 8, marginBottom: spacing.lg, lineHeight: 20 },
  section: { color: colors.textMuted, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginTop: spacing.lg, marginBottom: spacing.sm },
  routeCard: { marginBottom: spacing.sm },
  routeTitle: { color: colors.text, fontWeight: "700", fontSize: 14 },
  routeMeta: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  panelsCard: { marginTop: spacing.lg },
  panelsTitle: { color: colors.text, fontSize: 16, fontWeight: "800" },
  panelsDesc: { color: colors.textMuted, fontSize: 13, marginTop: 6 },
});
