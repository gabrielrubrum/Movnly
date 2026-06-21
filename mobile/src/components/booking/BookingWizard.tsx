import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import { useBookingStore } from "@/lib/booking-store";
import { BOOKING_STEPS, EXTRAS, VEHICLE_CATEGORIES } from "@/lib/constants";
import { colors, spacing } from "@/lib/theme";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CartSummary } from "./CartSummary";

let useStripeHook: any = () => ({ initPaymentSheet: async () => ({}), presentPaymentSheet: async () => ({}) });
if (Platform.OS !== "web") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    useStripeHook = require("@stripe/stripe-react-native").useStripe;
  } catch {
    /* expo web */
  }
}

export function BookingWizard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const step = useBookingStore((s) => s.step);
  const form = useBookingStore((s) => s.form);
  const updateForm = useBookingStore((s) => s.updateForm);
  const setStep = useBookingStore((s) => s.setStep);
  const setPayment = useBookingStore((s) => s.setPayment);
  const bookingId = useBookingStore((s) => s.bookingId);
  const paymentError = useBookingStore((s) => s.paymentError);
  const { total } = useBookingStore((s) => s.getTotals());
  const { initPaymentSheet, presentPaymentSheet } = useStripeHook();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      updateForm({ name: user.name || "", email: user.email || "" });
    }
  }, [user, updateForm]);

  const initPaymentIntent = async () => {
    setPayment({ paymentError: null });
    setLoading(true);
    try {
      const { data } = await api.post("/payments/create-intent", {
        ...form,
        origin: form.origin,
        destination: form.destination,
        amount: total,
        bookingId: bookingId || undefined,
      });
      setPayment({ clientSecret: data.clientSecret, bookingId: data.bookingId });
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setPayment({
        paymentError: Array.isArray(msg) ? msg.join(" ") : msg || "Erro ao preparar pagamento",
        clientSecret: null,
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const pay = async () => {
    const data = await initPaymentIntent();
    if (!data) return;

    if (data.mock) {
      Alert.alert("Reserva confirmada", "Pagamento simulado — transfer reservado com sucesso!");
      router.replace({ pathname: "/(public)/confirmation", params: { id: data.bookingId } });
      return;
    }

    if (Platform.OS === "web") {
      Alert.alert("Use o telemóvel", "Pagamento completo com cartão no app nativo (Expo Go / build EAS).");
      return;
    }

    const { error: initError } = await initPaymentSheet({
      paymentIntentClientSecret: data.clientSecret,
      merchantDisplayName: "MOVNLY",
      returnURL: "movnly://payment-return",
    });
    if (initError) {
      Alert.alert("Erro", initError.message);
      return;
    }
    const { error: presentError } = await presentPaymentSheet();
    if (presentError) {
      Alert.alert("Erro", presentError.message);
      return;
    }
    Alert.alert("Sucesso", "Transfer pago e confirmado!");
    router.replace({ pathname: "/(public)/confirmation", params: { id: data.bookingId } });
  };

  const toggleExtra = (id: string) => {
    const next = form.extras.includes(id) ? form.extras.filter((x) => x !== id) : [...form.extras, id];
    updateForm({ extras: next });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Text style={styles.stepTitle}>Trajeto</Text>
            <Text style={styles.label}>Tipo</Text>
            <View style={styles.row}>
              {(["oneway", "roundtrip"] as const).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => updateForm({ tripType: t })}
                  style={[styles.chip, form.tripType === t && styles.chipActive]}
                >
                  <Text style={[styles.chipText, form.tripType === t && styles.chipTextActive]}>
                    {t === "oneway" ? "Ida" : "Ida e volta"}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.label}>Origem</Text>
            <Input value={form.origin} onChangeText={(v) => updateForm({ origin: v })} />
            <Text style={styles.label}>Destino</Text>
            <Input value={form.destination} onChangeText={(v) => updateForm({ destination: v })} />
            <Text style={styles.label}>Data</Text>
            <Input value={form.date} onChangeText={(v) => updateForm({ date: v })} placeholder="AAAA-MM-DD" />
            <Text style={styles.label}>Hora</Text>
            <Input value={form.time} onChangeText={(v) => updateForm({ time: v })} placeholder="10:00" />
            <Text style={styles.label}>Passageiros / Bagagem</Text>
            <View style={styles.row}>
              <Input
                value={String(form.passengers)}
                onChangeText={(v) => updateForm({ passengers: parseInt(v, 10) || 1 })}
                keyboardType="number-pad"
                style={{ flex: 1 }}
              />
              <Input
                value={String(form.luggage)}
                onChangeText={(v) => updateForm({ luggage: parseInt(v, 10) || 0 })}
                keyboardType="number-pad"
                style={{ flex: 1 }}
              />
            </View>
            <Text style={styles.label}>Voo (opcional)</Text>
            <Input value={form.flightNumber} onChangeText={(v) => updateForm({ flightNumber: v })} placeholder="TP1234" />
          </>
        );
      case 2:
        return (
          <>
            <Text style={styles.stepTitle}>Escolha o veículo</Text>
            {VEHICLE_CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => updateForm({ category: cat.id })}
                style={[styles.vehicleCard, form.category === cat.id && styles.vehicleActive]}
              >
                <Text style={styles.vehicleName}>{cat.name}</Text>
                <Text style={styles.vehicleMeta}>Até {cat.passengers} px · desde €{cat.basePrice}</Text>
              </Pressable>
            ))}
          </>
        );
      case 3:
        return (
          <>
            <Text style={styles.stepTitle}>Opcionais</Text>
            {EXTRAS.map((extra) => {
              const active = form.extras.includes(extra.id);
              return (
                <Pressable
                  key={extra.id}
                  onPress={() => toggleExtra(extra.id)}
                  style={[styles.extraCard, active && styles.extraActive]}
                >
                  <Text style={styles.extraName}>{extra.name}</Text>
                  <Text style={styles.extraPrice}>{extra.price === 0 ? "Incluído" : `€${extra.price}`}</Text>
                </Pressable>
              );
            })}
          </>
        );
      case 4:
        return (
          <>
            <Text style={styles.stepTitle}>Os seus dados</Text>
            <Text style={styles.label}>Nome</Text>
            <Input value={form.name} onChangeText={(v) => updateForm({ name: v })} />
            <Text style={styles.label}>Email</Text>
            <Input value={form.email} onChangeText={(v) => updateForm({ email: v })} autoCapitalize="none" keyboardType="email-address" />
            <Text style={styles.label}>Telefone</Text>
            <Input value={form.phone} onChangeText={(v) => updateForm({ phone: v })} keyboardType="phone-pad" />
            <Text style={styles.label}>Notas</Text>
            <Input value={form.notes} onChangeText={(v) => updateForm({ notes: v })} placeholder="Instruções para o motorista" />
          </>
        );
      case 5:
        return (
          <>
            <Text style={styles.stepTitle}>Pagamento seguro</Text>
            <Text style={styles.payAmount}>€{total.toFixed(2)}</Text>
            <Text style={styles.payDesc}>Stripe · 3D Secure · Preço fixo garantido</Text>
            {paymentError ? <Text style={styles.error}>{paymentError}</Text> : null}
          </>
        );
      default:
        return null;
    }
  };

  const canNext = () => {
    if (step === 1) return form.origin && form.destination && form.date && form.time;
    if (step === 4) return form.name && form.email;
    return true;
  };

  const onNext = () => {
    if (!canNext()) {
      Alert.alert("Campos em falta", "Preencha os dados obrigatórios.");
      return;
    }
    if (step < 5) setStep(step + 1);
    else pay();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.progress}>
        {BOOKING_STEPS.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => s.id < step && setStep(s.id)}
            style={[styles.dot, step >= s.id && styles.dotActive]}
          >
            <Text style={[styles.dotText, step >= s.id && styles.dotTextActive]}>{s.id}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.progressLabel}>{BOOKING_STEPS[step - 1]?.label}</Text>

      {renderStep()}
      <CartSummary />

      <View style={styles.actions}>
        {step > 1 ? (
          <View style={{ flex: 1 }}>
            <Button title="Voltar" variant="ghost" onPress={() => setStep(step - 1)} />
          </View>
        ) : null}
        <View style={{ flex: 2 }}>
          <Button
            title={step === 5 ? "Pagar transfer" : "Continuar"}
            onPress={onNext}
            loading={loading}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface0 },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 3 },
  progress: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface2,
  },
  dotActive: { borderColor: colors.gold, backgroundColor: colors.goldMuted },
  dotText: { color: colors.textDim, fontWeight: "800", fontSize: 12 },
  dotTextActive: { color: colors.gold },
  progressLabel: { color: colors.textMuted, fontSize: 12, marginBottom: spacing.lg, textTransform: "uppercase", letterSpacing: 1 },
  stepTitle: { fontSize: 22, fontWeight: "800", color: colors.text, marginBottom: spacing.md },
  label: { color: colors.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginTop: spacing.sm, marginBottom: 4 },
  row: { flexDirection: "row", gap: spacing.sm },
  chip: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  chipActive: { borderColor: colors.gold, backgroundColor: colors.goldMuted },
  chipText: { color: colors.textMuted, fontWeight: "700" },
  chipTextActive: { color: colors.gold },
  vehicleCard: { padding: spacing.md, borderRadius: 14, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm, backgroundColor: colors.surface2 },
  vehicleActive: { borderColor: colors.gold, backgroundColor: colors.goldMuted },
  vehicleName: { color: colors.text, fontSize: 16, fontWeight: "800" },
  vehicleMeta: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  extraCard: { flexDirection: "row", justifyContent: "space-between", padding: spacing.md, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  extraActive: { borderColor: colors.gold, backgroundColor: colors.goldMuted },
  extraName: { color: colors.text, fontWeight: "600" },
  extraPrice: { color: colors.gold, fontWeight: "700" },
  payAmount: { color: colors.gold, fontSize: 42, fontWeight: "900", textAlign: "center", marginTop: spacing.md },
  payDesc: { color: colors.textMuted, textAlign: "center", marginTop: 8 },
  error: { color: colors.red, marginTop: spacing.md, textAlign: "center" },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg },
});
