import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { ScrollView, Text, StyleSheet, View } from "react-native";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";
import { BookingCard } from "@/components/BookingCard";
import type { Booking, BookingStatus } from "@/lib/types";
import { colors, spacing } from "@/lib/theme";

function mapPartnerBooking(b: any): Booking {
  const d = new Date(b.pickupTime);
  return {
    id: b.id,
    reference: b.id.slice(0, 8),
    status: (b.status?.toLowerCase() || "pending") as BookingStatus,
    category: b.category,
    origin: b.from,
    destination: b.to,
    pickupDate: d.toISOString().split("T")[0],
    pickupTime: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    totalPrice: b.price || 0,
    currency: "EUR",
    passenger: b.passengerData,
  };
}

export default function PartnerBookings() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    api.get("/partners/bookings").then(({ data }) => setBookings(data.map(mapPartnerBooking)));
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Reservas do parceiro</Text>
      <View style={{ marginBottom: spacing.md }}>
        <Button title="+ Nova reserva para convidado" onPress={() => router.push("/(partner)/nova-reserva")} />
      </View>
      {bookings.length === 0 ? (
        <Text style={styles.empty}>Nenhuma reserva criada ainda.</Text>
      ) : (
        bookings.map((b) => <BookingCard key={b.id} booking={b} />)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface0 },
  content: { padding: spacing.lg },
  title: { fontSize: 22, fontWeight: "800", color: colors.text, marginBottom: spacing.md },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: 40 },
});
