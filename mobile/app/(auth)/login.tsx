import { useState } from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import api from "@/lib/api";
import { useAuthStore, getRoleHome } from "@/lib/auth";
import { connectSocket } from "@/lib/socket";
import { DEMO_ACCOUNTS } from "@/lib/demo-accounts";
import { colors, spacing } from "@/lib/theme";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export default function LoginScreen() {
  usePushNotifications(true);
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const doLogin = async (loginEmail: string, loginPassword: string) => {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email: loginEmail, password: loginPassword });
      await setAuth(data.user, data.access_token);
      connectSocket(data.access_token);
      router.replace(getRoleHome(data.user.role) as any);
    } catch {
      setError("Credenciais inválidas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => doLogin(email, password);

  const handleDemo = (account: (typeof DEMO_ACCOUNTS)[keyof typeof DEMO_ACCOUNTS]) => {
    setEmail(account.email);
    setPassword(account.password);
    doLogin(account.email, account.password);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>MOVNLY</Text>
        <Text style={styles.subtitle}>Private Chauffeur · Lisboa & Cascais</Text>
        <Text style={styles.tagline}>Comprar transfer sem conta · Painéis para todos os perfis</Text>

        <View style={styles.form}>
          <Input placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ marginTop: spacing.sm }} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={{ marginTop: spacing.md }}>
            <Button title="Entrar" onPress={handleLogin} loading={loading} />
          </View>
        </View>

        <Text style={styles.demoTitle}>Acesso rápido (demo)</Text>
        <Pressable onPress={() => router.replace("/(public)/book")} style={styles.guestLink}>
          <Text style={styles.guestLinkText}>Reservar transfer sem login →</Text>
        </Pressable>

        <View style={styles.demoGrid}>
          {Object.values(DEMO_ACCOUNTS).map((account) => (
            <Pressable
              key={account.email}
              onPress={() => handleDemo(account)}
              disabled={loading}
              style={({ pressed }) => [styles.demoCard, pressed && styles.demoCardPressed]}
            >
              <Text style={styles.demoLabel}>{account.label}</Text>
              <Text style={styles.demoDesc}>{account.description}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface0 },
  content: { flexGrow: 1, justifyContent: "center", padding: spacing.lg, paddingVertical: spacing.xl },
  logo: { fontSize: 36, fontWeight: "900", color: colors.gold, textAlign: "center", letterSpacing: 4 },
  subtitle: { color: colors.textMuted, textAlign: "center", marginTop: spacing.sm, fontSize: 13 },
  tagline: { color: colors.textDim, textAlign: "center", marginTop: 6, fontSize: 12 },
  form: { marginTop: spacing.xl },
  error: { color: colors.red, fontSize: 13, marginTop: spacing.sm },
  demoTitle: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xl,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  demoGrid: { marginTop: spacing.md, gap: spacing.sm },
  demoCard: {
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
  },
  demoCardPressed: { opacity: 0.75, borderColor: colors.goldMuted },
  demoLabel: { color: colors.gold, fontSize: 15, fontWeight: "800" },
  demoDesc: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  guestLink: { marginTop: spacing.lg, alignItems: "center" },
  guestLinkText: { color: colors.gold, fontSize: 14, fontWeight: "700" },
});
