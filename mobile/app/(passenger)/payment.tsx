import { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import api from "@/lib/api";
import { colors, spacing } from "@/lib/theme";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function PaymentScreen() {
  const { bookingId, amount } = useLocalSearchParams<{ bookingId: string; amount: string }>();
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

      Alert.alert(
        "Use o telemóvel",
        "Pagamento Stripe nativo só funciona no app iOS/Android. Use Expo Go ou um build EAS."
      );
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
        <Text style={styles.desc}>Pré-visualização web — pagamento completo no telemóvel</Text>
      </Card>
      <View style={{ marginTop: spacing.lg }}>
        <Button title="Simular pagamento" onPress={handlePay} loading={loading} />
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
