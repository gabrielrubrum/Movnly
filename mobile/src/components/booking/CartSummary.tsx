import { View, Text, StyleSheet } from "react-native";
import { useBookingStore } from "@/lib/booking-store";
import { EXTRAS } from "@/lib/constants";
import { colors, spacing } from "@/lib/theme";
import { Card } from "@/components/ui/Card";

export function CartSummary() {
  const form = useBookingStore((s) => s.form);
  const step = useBookingStore((s) => s.step);
  const { total, basePrice, extrasTotal, surcharges } = useBookingStore((s) => s.getTotals());

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Resumo da reserva</Text>
      <Text style={styles.step}>Passo {step} de 5</Text>

      {form.origin ? (
        <View style={styles.row}>
          <Text style={styles.label}>Origem</Text>
          <Text style={styles.value}>{form.origin}</Text>
        </View>
      ) : null}
      {form.destination ? (
        <View style={styles.row}>
          <Text style={styles.label}>Destino</Text>
          <Text style={styles.value}>{form.destination}</Text>
        </View>
      ) : null}
      {form.date ? (
        <View style={styles.row}>
          <Text style={styles.label}>Data</Text>
          <Text style={styles.value}>{form.date} · {form.time}</Text>
        </View>
      ) : null}
      {form.category ? (
        <View style={styles.row}>
          <Text style={styles.label}>Veículo</Text>
          <Text style={styles.value}>{form.category}</Text>
        </View>
      ) : null}

      {form.extras.length > 0 ? (
        <View style={styles.extras}>
          {form.extras.map((id) => {
            const extra = EXTRAS.find((e) => e.id === id);
            if (!extra) return null;
            return (
              <View key={id} style={styles.extraRow}>
                <Text style={styles.extraName}>+ {extra.name}</Text>
                <Text style={styles.extraPrice}>€{extra.price}</Text>
              </View>
            );
          })}
        </View>
      ) : null}

      {surcharges.length > 0 ? (
        <Text style={styles.surcharge}>Ajustes: {surcharges.join(", ")}</Text>
      ) : null}

      <View style={styles.divider} />
      <View style={styles.row}>
        <Text style={styles.label}>Transfer</Text>
        <Text style={styles.value}>€{basePrice.toFixed(2)}</Text>
      </View>
      {extrasTotal > 0 ? (
        <View style={styles.row}>
          <Text style={styles.label}>Opcionais</Text>
          <Text style={styles.value}>€{extrasTotal.toFixed(2)}</Text>
        </View>
      ) : null}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>€{total.toFixed(2)}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: spacing.md },
  title: { color: colors.gold, fontSize: 11, fontWeight: "800", letterSpacing: 2, textTransform: "uppercase" },
  step: { color: colors.textDim, fontSize: 11, marginTop: 4, marginBottom: spacing.sm },
  row: { marginTop: 8 },
  label: { color: colors.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1 },
  value: { color: colors.text, fontSize: 13, marginTop: 2 },
  extras: { marginTop: spacing.sm },
  extraRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  extraName: { color: colors.textMuted, fontSize: 12 },
  extraPrice: { color: colors.text, fontSize: 12 },
  surcharge: { color: colors.amber, fontSize: 11, marginTop: 8 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { color: colors.text, fontSize: 14, fontWeight: "700" },
  totalValue: { color: colors.gold, fontSize: 28, fontWeight: "900" },
});
