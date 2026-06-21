import { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useStripe } from "@stripe/stripe-react-native";
import api from "@/lib/api";
import { colors, spacing } from "@/lib/theme";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function PaymentScreen() {
  const { bookingId, amount } = useLocalSearchParams<{ bookingId: string; amount: string }>();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!bookingId) return;
    setLoading(true);
    try {
      const pickup = new Date();
      const { data } = await api.post("/payments/create-intent", {
        bookingId,
        email: "guest@movnly.com",
        name: "MOVNLY Guest",
        date: pickup.toISOString().split("T")[0],
        time: pickup.toTimeString().slice(0, 5),
      });

      if (data.mock) {
        Alert.alert("Pagamento simulado", "Modo mock ativo — viagem confirmada.");
        router.back();
        return;
      }

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: data.clientSecret,
        merchantDisplayName: "MOVNLY",
        returnURL: "movnly://payment-return",
      });
      if (initError) throw initError;

      const { error: presentError } = await presentPaymentSheet();
      if (presentError) throw presentError;

      Alert.alert("Sucesso", "Pagamento confirmado!");
      router.replace("/(passenger)/bookings");
    } catch (e: any) {
      Alert.alert("Erro", e?.message || "Falha no pagamento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.title}>Pagamento seguro</Text>
        <Text style={styles.amount}>€{amount || "—"}</Text>
        <Text style={styles.desc}>PASSO 2 DE 2 · Stripe · 3D Secure automático</Text>
      </Card>
      <View style={{ marginTop: spacing.lg }}>
        <Button title="Pagar transfer com cartão" onPress={handlePay} loading={loading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface0, padding: spacing.lg },
  title: { color: colors.textMuted, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 },
  amount: { color: colors.gold, fontSize: 40, fontWeight: "900", marginTop: 8 },
  desc: { color: colors.textDim, fontSize: 13, marginTop: 8 },
});
