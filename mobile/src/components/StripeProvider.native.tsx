import React, { useEffect, useState } from "react";
import { StripeProvider as RNStripeProvider } from "@stripe/stripe-react-native";
import api from "@/lib/api";

const FALLBACK_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

export function StripeProvider({ children }: { children: React.ReactNode }) {
  const [publishableKey, setPublishableKey] = useState(FALLBACK_KEY);

  useEffect(() => {
    api.get("/payments/config")
      .then(({ data }) => {
        if (data.publishableKey) setPublishableKey(data.publishableKey);
      })
      .catch(() => {});
  }, []);

  const key = publishableKey || FALLBACK_KEY;
  if (!key) return <>{children}</>;

  return (
    <RNStripeProvider
      publishableKey={key}
      merchantIdentifier="merchant.com.movnly.app"
    >
      {children as React.ReactElement}
    </RNStripeProvider>
  );
}
