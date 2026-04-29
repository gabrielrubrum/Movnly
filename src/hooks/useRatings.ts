"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

export interface Rating {
    id: string;
    score: number;
    comment: string | null;
    createdAt: string;
    booking: {
        from: string;
        to: string;
        pickupTime: string;
        passenger: { name: string };
    };
}

export interface RatingsData {
    avg: number;
    total: number;
    distribution: { score: number; count: number }[];
    ratings: Rating[];
}

export function useRatings() {
    const [data, setData] = useState<RatingsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/ratings/driver/me")
            .then(res => setData(res.data))
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, []);

    return { data, loading };
}
