import { useState } from "react";
import { ScrollView, Text, StyleSheet, Alert, View } from "react-native";
import { useRouter } from "expo-router";
import api from "@/lib/api";
import { colors, spacing } from "@/lib/theme";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function PartnerNewBooking() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    from: "Aeroporto de Lisboa (LIS)",
    to: "",
    pickupTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    category: "comfort",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    passengers: "1",
    flightNumber: "",
    notes: "",
  });

  const submit = async () => {
    if (!form.to || !form.guestName || !form.guestEmail) {
      Alert.alert("Campos obrigatórios", "Destino, nome e email do convidado.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/partners/bookings", {
        ...form,
        passengers: parseInt(form.passengers, 10),
        pickupTime: new Date(form.pickupTime).toISOString(),
      });
      Alert.alert("Sucesso", "Reserva criada para o convidado.");
      router.back();
    } catch {
      Alert.alert("Erro", "Não foi possível criar a reserva.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Nova reserva para convidado</Text>
      <Text style={styles.label}>Origem</Text>
      <Input value={form.from} onChangeText={(v) => setForm({ ...form, from: v })} />
      <Text style={styles.label}>Destino</Text>
      <Input value={form.to} onChangeText={(v) => setForm({ ...form, to: v })} />
      <Text style={styles.label}>Data e hora</Text>
      <Input value={form.pickupTime} onChangeText={(v) => setForm({ ...form, pickupTime: v })} />
      <Text style={styles.label}>Nome do convidado</Text>
      <Input value={form.guestName} onChangeText={(v) => setForm({ ...form, guestName: v })} />
      <Text style={styles.label}>Email</Text>
      <Input value={form.guestEmail} onChangeText={(v) => setForm({ ...form, guestEmail: v })} autoCapitalize="none" />
      <Text style={styles.label}>Telefone</Text>
      <Input value={form.guestPhone} onChangeText={(v) => setForm({ ...form, guestPhone: v })} />
      <View style={{ marginTop: spacing.lg }}>
        <Button title="Criar reserva" onPress={submit} loading={loading} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface0 },
  content: { padding: spacing.lg },
  title: { fontSize: 22, fontWeight: "800", color: colors.text, marginBottom: spacing.lg },
  label: { color: colors.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginTop: spacing.md, marginBottom: 4 },
});
