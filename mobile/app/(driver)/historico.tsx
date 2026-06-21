import { useEffect } from "react";
import { ScrollView, Text, StyleSheet, RefreshControl } from "react-native";
import { useBookings } from "@/hooks/useBookings";
import { BookingCard } from "@/components/BookingCard";
import { colors, spacing } from "@/lib/theme";

export default function DriverHistory() {
  const { bookings, loading, fetchDriverBookings } = useBookings();
  const done = bookings.filter((b) => b.status === "completed");

  useEffect(() => {
    fetchDriverBookings();
  }, [fetchDriverBookings]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDriverBookings} tintColor={colors.gold} />}
    >
      <Text style={styles.title}>Arquivo de viagens</Text>
      {done.length === 0 ? <Text style={styles.empty}>Sem viagens concluídas.</Text> : done.map((b) => <BookingCard key={b.id} booking={b} />)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface0 },
  content: { padding: spacing.lg },
  title: { fontSize: 22, fontWeight: "800", color: colors.text, marginBottom: spacing.md },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: 40 },
});
