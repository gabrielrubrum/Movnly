import { useEffect } from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import { useBookings } from "@/hooks/useBookings";
import { BookingCard } from "@/components/BookingCard";
import { colors, spacing } from "@/lib/theme";

export default function AdminBookings() {
  const { bookings, loading, fetchAllBookings } = useBookings();

  useEffect(() => {
    fetchAllBookings();
  }, [fetchAllBookings]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Todas as reservas</Text>
      {bookings.length === 0 && !loading ? (
        <Text style={styles.empty}>Sem reservas ou sem permissão.</Text>
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
