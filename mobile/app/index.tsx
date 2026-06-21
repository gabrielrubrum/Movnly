import { Redirect } from "expo-router";
import { useAuthStore, getRoleHome } from "@/lib/auth";

export default function Index() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);

  if (!hydrated) return null;

  if (!token || !user) {
    return <Redirect href={"/(public)" as any} />;
  }

  return <Redirect href={getRoleHome(user.role) as any} />;
}
