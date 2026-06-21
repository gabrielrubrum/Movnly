import { useEffect, useRef } from "react";
import * as Location from "expo-location";
import api from "@/lib/api";

const INTERVAL_MS = 15000;

export function useDriverLocation(enabled: boolean) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    let cancelled = false;

    const sendLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted" || cancelled) return;

        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        await api.patch("/driver/location", {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      } catch {
        // silent — location optional
      }
    };

    sendLocation();
    timerRef.current = setInterval(sendLocation, INTERVAL_MS);

    return () => {
      cancelled = true;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [enabled]);
}
