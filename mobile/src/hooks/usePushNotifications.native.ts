import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import api from "@/lib/api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function registerForPush(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return null;

  const tokenData = await Notifications.getExpoPushTokenAsync();
  return tokenData.data;
}

export function usePushNotifications(active: boolean) {
  const registered = useRef(false);

  useEffect(() => {
    if (!active || registered.current) return;

    (async () => {
      const token = await registerForPush();
      if (!token) return;

      try {
        await api.post("/auth/push-token", {
          token,
          platform: Platform.OS,
        });
        registered.current = true;
      } catch {
        // retry on next mount
      }
    })();
  }, [active]);
}
