import { useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { LOCATIONS } from "@/lib/constants";
import { useBookingStore } from "@/lib/booking-store";
import { colors, spacing } from "@/lib/theme";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function BookingEngine() {
  const router = useRouter();
  const prefillRoute = useBookingStore((s) => s.prefillRoute);
  const updateForm = useBookingStore((s) => s.updateForm);
  const setStep = useBookingStore((s) => s.setStep);

  const [origin, setOrigin] = useState("Aeroporto de Lisboa (LIS)");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [passengers, setPassengers] = useState("2");

  const search = () => {
    if (!destination.trim() || !date.trim()) {
      Alert.alert("Campos obrigatórios", "Indique destino e data para reservar o transfer.");
      return;
    }
    updateForm({
      origin,
      destination,
      date,
      time,
      passengers: parseInt(passengers, 10) || 2,
    });
    setStep(1);
    router.push("/(public)/book");
  };

  const quickRoute = (from: string, to: string) => {
    prefillRoute(from, to);
    router.push("/(public)/book");
  };

  return (
    <Card style={styles.card}>
      <Text style={styles.badge}>RESERVAR TRANSFER</Text>
      <Text style={styles.title}>Para onde vamos?</Text>

      <Text style={styles.label}>Origem</Text>
      <Input value={origin} onChangeText={setOrigin} />
      <View style={styles.chips}>
        {LOCATIONS.slice(0, 4).map((loc) => (
          <Pressable key={loc} onPress={() => setOrigin(loc)} style={styles.chip}>
            <Text style={styles.chipText}>{loc.split(" ")[0]}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Destino</Text>
      <Input value={destination} onChangeText={setDestination} placeholder="Hotel, morada, cidade..." />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Data</Text>
          <Input value={date} onChangeText={setDate} placeholder="AAAA-MM-DD" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Hora</Text>
          <Input value={time} onChangeText={setTime} placeholder="10:00" />
        </View>
      </View>

      <Text style={styles.label}>Passageiros</Text>
      <Input value={passengers} onChangeText={setPassengers} keyboardType="number-pad" />

      <View style={{ marginTop: spacing.md }}>
        <Button title="Ver preços e reservar" onPress={search} />
      </View>

      <Text style={styles.quickLabel}>Rotas rápidas</Text>
      <View style={styles.quickRow}>
        <Pressable onPress={() => quickRoute("Aeroporto de Lisboa (LIS)", "Centro de Lisboa")} style={styles.quickChip}>
          <Text style={styles.quickText}>LIS → Lisboa</Text>
        </Pressable>
        <Pressable onPress={() => quickRoute("Aeroporto de Lisboa (LIS)", "Cascais")} style={styles.quickChip}>
          <Text style={styles.quickText}>LIS → Cascais</Text>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { borderColor: colors.goldMuted },
  badge: { color: colors.gold, fontSize: 10, fontWeight: "800", letterSpacing: 2 },
  title: { fontSize: 22, fontWeight: "800", color: colors.text, marginTop: 6, marginBottom: spacing.md },
  label: { color: colors.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginTop: spacing.sm, marginBottom: 4 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.surface3, borderWidth: 1, borderColor: colors.border },
  chipText: { color: colors.textMuted, fontSize: 11 },
  row: { flexDirection: "row", gap: spacing.sm },
  quickLabel: { color: colors.textDim, fontSize: 11, marginTop: spacing.md },
  quickRow: { flexDirection: "row", gap: spacing.sm, marginTop: 6 },
  quickChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  quickText: { color: colors.textMuted, fontSize: 12 },
});
