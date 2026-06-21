import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Switch, Alert } from "react-native";
import api from "@/lib/api";
import { useBookings } from "@/hooks/useBookings";
import { BookingCard } from "@/components/BookingCard";
import { colors, spacing } from "@/lib/theme";
import { Button } from "@/components/ui/Button";
import { useDriverLocation } from "@/hooks/useDriverLocation";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export default function DriverDashboard() {
  const [online, setOnline] = useState(false);
  const { bookings, fetchDriverBookings, acceptBooking } = useBookings();
  useDriverLocation(online);
  usePushNotifications(online);

  useEffect(() => {
    fetchDriverBookings();
    api.get("/driver/profile").then(({ data }) => {
      setOnline(data?.status === "ONLINE");
    }).catch(() => {});
  }, [fetchDriverBookings]);

  const toggleStatus = async (value: boolean) => {
    const status = value ? "ONLINE" : "OFFLINE";
    await api.patch("/driver/status", { status });
    setOnline(value);
  };

  const available = bookings.filter((b) => !b.driver && b.status === "confirmed");

  const handleAccept = async (id: string) => {
    try {
      await acceptBooking(id);
      Alert.alert("Viagem aceite!");
      fetchDriverBookings();
    } catch {
      Alert.alert("Erro", "Não foi possível aceitar a viagem.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.statusRow}>
        <View>
          <Text style={styles.statusLabel}>Estado</Text>
          <Text style={[styles.statusValue, { color: online ? colors.emerald : colors.textMuted }]}>
            {online ? "Online" : "Offline"}
          </Text>
        </View>
        <Switch value={online} onValueChange={toggleStatus} trackColor={{ true: colors.gold }} />
      </View>

      <Text style={styles.section}>Viagens disponíveis</Text>
      {available.length === 0 ? (
        <Text style={styles.empty}>Sem viagens disponíveis no momento.</Text>
      ) : (
        available.map((b) => (
          <View key={b.id}>
            <BookingCard booking={b} />
            <Button title="Aceitar viagem" onPress={() => handleAccept(b.id)} />
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface0 },
  content: { padding: spacing.lg },
  statusRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg, padding: spacing.md, backgroundColor: colors.surface2, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  statusLabel: { color: colors.textMuted, fontSize: 12 },
  statusValue: { fontSize: 20, fontWeight: "800", marginTop: 2 },
  section: { fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: spacing.md },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: 20 },
});
