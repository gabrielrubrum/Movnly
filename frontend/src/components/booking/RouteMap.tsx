"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Global icon fix for client-side only
if (typeof window !== "undefined") {
    const L = require("leaflet");
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
}

interface RouteMapProps {
    origin: string;
    destination: string;
    onRouteCalculated?: (distanceInKm: number, duration: string) => void;
}

// Map bounds updater
function BoundsUpdater({ routeCoords }: { routeCoords: [number, number][] }) {
    const map = useMap();
    useEffect(() => {
        if (routeCoords.length > 0 && typeof window !== "undefined") {
            const L = require("leaflet");
            const bounds = L.latLngBounds(routeCoords);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [routeCoords, map]);
    return null;
}

export default function RouteMap({ origin, destination, onRouteCalculated }: RouteMapProps) {
    const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Use refs to avoid calling onRouteCalculated repeatedly if values haven't changed
    const lastCalculatedRef = useRef<{ origin: string; destination: string; }>({ origin: "", destination: "" });
    const onRouteCalculatedRef = useRef(onRouteCalculated);

    useEffect(() => {
        onRouteCalculatedRef.current = onRouteCalculated;
    }, [onRouteCalculated]);

    useEffect(() => {
        if (!origin || !destination) return;

        // Extended coordinate map with localization support
        const COORDINATES_MAP: Record<string, [number, number]> = {
            "Lisbon Airport (LIS)": [38.7755, -9.1353],
            "Aeroporto de Lisboa (LIS)": [38.7755, -9.1353],
            "Lisbon City Centre": [38.7223, -9.1393],
            "Centro de Lisboa": [38.7223, -9.1393],
            "Cascais": [38.6979, -9.4215],
            "Sintra": [38.7984, -9.3882],
            "Belém": [38.6916, -9.2160],
            "Parque das Nações": [38.7672, -9.0941],
            "Setúbal": [38.5244, -8.8931],
            "Algarve": [37.0179, -7.9304],
            "Porto": [41.1579, -8.6291],
            "Óbidos": [39.3621, -9.1571]
        };

        const getCoord = (name: string) => {
            const normalized = name.trim().toLowerCase();
            const entry = Object.entries(COORDINATES_MAP).find(([key]) => key.toLowerCase() === normalized);
            return entry ? entry[1] : null;
        };

        // Don't recalculate if same origin/destination
        if (lastCalculatedRef.current.origin === origin && lastCalculatedRef.current.destination === destination) return;
        lastCalculatedRef.current = { origin, destination };

        const cleanAddress = (addr: string) => {
            return addr.replace(/\s*\([^)]*\)/g, "").trim();
        };

        const fetchRoute = async () => {
            setLoading(true);
            setError(null);
            try {
                let originCoord = getCoord(origin);
                let destCoord = getCoord(destination);

                // 1. Geocode Origin (if not in map)
                if (!originCoord) {
                    const cleanOrigin = cleanAddress(origin);
                    const originRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanOrigin + ", Portugal")}&limit=1`);
                    const originData = await originRes.json();
                    if (originData.length > 0) {
                        originCoord = [parseFloat(originData[0].lat), parseFloat(originData[0].lon)];
                    }
                }

                // 2. Geocode Destination (if not in map)
                if (!destCoord) {
                    const cleanDest = cleanAddress(destination);
                    const destRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanDest + ", Portugal")}&limit=1`);
                    const destData = await destRes.json();
                    if (destData.length > 0) {
                        destCoord = [parseFloat(destData[0].lat), parseFloat(destData[0].lon)];
                    }
                }

                if (!originCoord || !destCoord) {
                    setError("Address not found on map.");
                    setLoading(false);
                    return;
                }

                // 3. Routing via OSRM
                try {
                    const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${originCoord[1]},${originCoord[0]};${destCoord[1]},${destCoord[0]}?overview=full&geometries=geojson`);
                    const routeData = await routeRes.json();

                    if (routeData.code === "Ok") {
                        const route = routeData.routes[0];
                        const coordinates = route.geometry.coordinates;
                        const latLngs: [number, number][] = coordinates.map((c: number[]) => [c[1], c[0]]);
                        setRouteCoords(latLngs);

                        const distanceInKm = route.distance / 1000;
                        const durationInMins = Math.round(route.duration / 60);
                        const durationStr = durationInMins > 60
                            ? `${Math.floor(durationInMins / 60)}h ${durationInMins % 60}min`
                            : `${durationInMins} min`;

                        if (onRouteCalculatedRef.current) {
                            onRouteCalculatedRef.current(distanceInKm, durationStr);
                        }
                        return;
                    }
                } catch (osrmErr) {
                    console.error("OSRM failed, falling back to direct line");
                }

                // Fallback: Direct Line if OSRM fails
                setRouteCoords([originCoord, destCoord]);
                if (onRouteCalculatedRef.current) {
                    onRouteCalculatedRef.current(0, "Direct route");
                }

            } catch (err) {
                setError("Map route service unavailable.");
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchRoute();
        }, 300);

        return () => clearTimeout(timer);
    }, [origin, destination]);

    return (
        <div className="w-full h-[300px] rounded-xl overflow-hidden relative border border-white/[0.08] shadow-2xl">
            {loading && (
                <div className="absolute inset-0 bg-surface-0/50 backdrop-blur-sm z-[400] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Calculating Route</p>
                    </div>
                </div>
            )}

            {error && !loading && (
                <div className="absolute inset-0 bg-surface-0/80 z-[400] flex items-center justify-center p-4 text-center">
                    <p className="text-sm text-red-400 font-medium">{error}</p>
                </div>
            )}

            <MapContainer
                center={routeCoords.length > 0 ? routeCoords[0] : [38.7223, -9.1393]}
                zoom={routeCoords.length > 0 ? 10 : 12}
                scrollWheelZoom={false}
                className="w-full h-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                {routeCoords.length > 0 && (
                    <>
                        <Polyline
                            positions={routeCoords}
                            pathOptions={{
                                color: '#818cf8',
                                weight: 6,
                                opacity: 0.9,
                                lineCap: 'round',
                                lineJoin: 'round'
                            }}
                        />
                        <Marker position={routeCoords[0]} />
                        <Marker position={routeCoords[routeCoords.length - 1]} />
                        <BoundsUpdater routeCoords={routeCoords} />
                    </>
                )}
            </MapContainer>
        </div>
    );
}
