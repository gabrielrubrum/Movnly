import { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { useBookings } from "@/hooks/useBookings";
import { BookingCard } from "@/components/BookingCard";
import { colors, spacing } from "@/lib/theme";

export default function PassengerBookings() {
  const { bookings, loading, fetchMyBookings } = useBookings();

  useEffect(() => {
    fetchMyBookings();
  }, [fetchMyBookings]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchMyBookings} tintColor={colors.gold} />}
    >
      <Text style={styles.title}>As suas viagens</Text>
      {bookings.length === 0 && !loading ? (
        <Text style={styles.empty}>Nenhuma viagem encontrada.</Text>
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
