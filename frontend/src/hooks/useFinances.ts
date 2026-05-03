"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

export interface DriverFinances {
    availableBalance: number;
    pendingBalance: number;
    totalEarnings: number;
    totalRevenue: number;
    transactionCount: number;
}

export interface AdminFinances {
    totalRevenue: number;
    totalDriverPayouts: number;
    platformProfit: number;
    ownerShare: number;
    partnerAShare: number;
    partnerBShare: number;
    rideCount: number;
    averageTicket: number;
}

export function useFinances() {
    const [driverStats, setDriverStats] = useState<DriverFinances | null>(null);
    const [adminStats, setAdminStats] = useState<AdminFinances | null>(null);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const user = useAuthStore.getState().user;
            if (!user) {
                setLoading(false);
                return;
            }

            if (user.role === 'DRIVER') {
                const res = await api.get(`/payments/stats/driver`);
                setDriverStats(res.data);
            } else if (user.role === 'ADMIN') {
                const res = await api.get(`/payments/stats/admin`);
                setAdminStats(res.data);
            }
        } catch (err: any) {
            console.error("Failed to load financial stats:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
        const interval = setInterval(refresh, 60000); // Atualiza a cada minuto
        return () => clearInterval(interval);
    }, [refresh]);

    const requestPayout = async () => {
        try {
            const res = await api.post(`/payouts/request`);
            await refresh();
            return { success: true, ...res.data };
        } catch (err: any) {
            console.error("Payout request failed:", err);
            // Global interceptor handles the toast, but we return failure for local UI logic
            return { 
                success: false, 
                message: err.response?.data?.message || "Erro ao processar saque" 
            };
        }
    };

    return {
        driverStats,
        adminStats,
        loading,
        refresh,
        requestPayout
    };
}
