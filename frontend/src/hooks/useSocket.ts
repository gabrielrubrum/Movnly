"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function useSocket() {
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!socket) {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
            // Se estivermos usando o proxy do Nginx (porta 80), conectamos à raiz para bater no location /socket.io/
            const socketUrl = apiUrl.replace(/\/api$/, "");
            socket = io(socketUrl, {
                path: "/socket.io/",
                transports: ["websocket", "polling"]
            });
        }

        socket.on("connect", () => setConnected(true));
        socket.on("disconnect", () => setConnected(false));

        return () => {
            // Optional: clean up only if needed
            // socket?.disconnect(); 
        };
    }, []);

    return { socket, connected };
}
