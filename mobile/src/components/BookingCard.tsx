import { View, Text, StyleSheet } from "react-native";
import { Card } from "./ui/Card";
import { colors } from "@/lib/theme";
import type { Booking } from "@/lib/types";

interface BookingCardProps {
  booking: Booking;
}

const statusColors: Record<string, string> = {
  confirmed: colors.emerald,
  completed: colors.emerald,
  pending: colors.amber,
  in_progress: colors.gold,
  cancelled: colors.red,
};

export function BookingCard({ booking }: BookingCardProps) {
  const statusColor = statusColors[booking.status] || colors.textMuted;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.ref}>#{booking.reference}</Text>
        <View style={[styles.badge, { borderColor: statusColor }]}>
          <Text style={[styles.badgeText, { color: statusColor }]}>{booking.status}</Text>
        </View>
      </View>
      <Text style={styles.route}>{booking.origin}</Text>
      <Text style={styles.arrow}>↓</Text>
      <Text style={styles.route}>{booking.destination}</Text>
      <View style={styles.footer}>
        <Text style={styles.meta}>{booking.pickupDate} · {booking.pickupTime}</Text>
        <Text style={styles.price}>€{booking.totalPrice.toFixed(2)}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  ref: { color: colors.textMuted, fontSize: 12, fontFamily: "monospace" },
  badge: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  route: { color: colors.text, fontSize: 15, fontWeight: "600" },
  arrow: { color: colors.gold, textAlign: "center", marginVertical: 4 },
  footer: { flexDirection: "row", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  meta: { color: colors.textMuted, fontSize: 12 },
  price: { color: colors.gold, fontWeight: "800", fontSize: 16 },
});
