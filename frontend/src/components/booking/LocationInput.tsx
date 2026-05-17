"use client";

import React, { useState, useEffect, useMemo } from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useJsApiLoader } from "@react-google-maps/api";
import { toast } from "sonner";

interface LocationInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    variant?: "standalone" | "embedded";
}

type Library = "core" | "maps" | "places" | "geocoding" | "routes" | "marker" | "geometry" | "elevation" | "streetView" | "journeySharing" | "drawing" | "visualization";
const libraries: Library[] = ["places"];

export function LocationInput({ value, onChange, placeholder, variant = "standalone" }: LocationInputProps) {
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries,
    });

    const handleCurrentLocation = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if ("geolocation" in navigator) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const data = await res.json();
                        if (data.display_name) {
                            onChange(data.display_name);
                        } else {
                            onChange(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                        }
                    } catch (err) {
                        onChange(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                    } finally {
                        setLoading(false);
                    }
                },
                (error) => {
                    let msg = "Não foi possível obter sua localização.";
                    if (error.code === 1) msg = "Permissão de localização negada.";
                    else if (error.code === 2) msg = "Localização indisponível.";
                    else if (error.code === 3) msg = "Tempo esgotado ao obter localização.";
                    
                    toast.error("Erro de Localização", {
                        description: msg
                    });
                    console.warn("Geolocation error:", error.message || error);
                    setLoading(false);
                }
            );
        }
    };

    if (!mounted) {
        return (
            <div className={cn(
                "w-full bg-white/[0.01] border border-white/[0.08] rounded-2xl flex items-center px-6 text-white/10 font-medium text-sm transition-all",
                variant === "embedded" ? "h-full border-none px-0" : "h-[72px]"
            )}>
                {placeholder}
            </div>
        );
    }

    const hasApiKey = !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!hasApiKey || !isLoaded) {
        return (
            <div className="relative group w-full flex items-center h-full">
                <input
                    className={cn(
                        "bg-transparent text-lg text-white font-bold outline-none w-full placeholder:text-white/20 font-sans tracking-tight truncate h-full",
                        variant === "standalone" && "nx-input h-[72px] px-8 bg-white/[0.01] border border-white/[0.08] rounded-2xl focus:border-brand-gold/40"
                    )}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
                <button
                    type="button"
                    onClick={handleCurrentLocation}
                    disabled={loading}
                    className={cn(
                        "absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white/20 hover:text-brand-gold transition-all z-20",
                        variant === "standalone" && "right-6"
                    )}
                >
                    <div className={cn(loading && "animate-spin")}>
                        <MapPin className="w-4 h-4" />
                    </div>
                </button>
            </div>
        );
    }

    return (
        <div className="relative group w-full">
            <GooglePlacesAutocomplete
                selectProps={{
                    value: value ? { label: value, value: value } : null,
                    onChange: (val: any) => {
                        if (val) onChange(val.label);
                    },
                    placeholder: placeholder,
                    styles: {
                        control: (provided: any) => ({
                            ...provided,
                            backgroundColor: variant === "embedded" ? "transparent" : "rgba(255, 255, 255, 0.01)",
                            border: variant === "embedded" ? "none" : "1px solid rgba(255, 255, 255, 0.08)",
                            borderRadius: variant === "embedded" ? "0" : "16px",
                            height: variant === "embedded" ? "100%" : "72px",
                            paddingLeft: variant === "embedded" ? "0" : "24px",
                            color: "white",
                            fontSize: "1.125rem",
                            fontWeight: "700",
                            boxShadow: "none",
                            "&:hover": {
                                border: variant === "embedded" ? "none" : "1px solid rgba(255, 255, 255, 0.2)",
                            },
                        }),
                        input: (provided: any) => ({
                            ...provided,
                            color: "white",
                        }),
                        singleValue: (provided: any) => ({
                            ...provided,
                            color: "white",
                        }),
                        placeholder: (provided: any) => ({
                            ...provided,
                            color: "rgba(255, 255, 255, 0.1)",
                        }),
                        menu: (provided: any) => ({
                            ...provided,
                            backgroundColor: "#0A0A0F",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: "16px",
                            padding: "8px",
                            zIndex: 1000,
                            boxShadow: "0 40px 80px rgba(0,0,0,0.8)",
                        }),
                        option: (provided: any, state: any) => ({
                            ...provided,
                            backgroundColor: state.isFocused ? "rgba(255, 255, 255, 0.05)" : "transparent",
                            color: state.isFocused ? "white" : "rgba(255, 255, 255, 0.4)",
                            borderRadius: "8px",
                            padding: "12px 16px",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: "pointer",
                            "&:active": {
                                backgroundColor: "#D4AF37",
                                color: "black",
                            },
                        }),
                    },
                }}
                autocompletionRequest={{
                    componentRestrictions: { country: ["pt"] }
                }}
            />
            {/* Current Location Trigger */}
            <button
                type="button"
                onClick={handleCurrentLocation}
                disabled={loading}
                className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white/20 hover:text-brand-gold transition-all z-20",
                    variant === "standalone" && "right-6"
                )}
                title="Usar minha localização atual"
            >
                <div className={cn(loading && "animate-spin")}>
                    <MapPin className="w-4 h-4" />
                </div>
            </button>
        </div>
    );
}
