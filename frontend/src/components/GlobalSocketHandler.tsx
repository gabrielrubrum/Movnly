"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/lib/auth-store";
import { useNotificationStore, Notification } from "@/lib/notification-store";
import { toast } from "sonner";
import { MessageSquare, Bell, Car } from "lucide-react";
import React from "react";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002';

export function GlobalSocketHandler() {
    const { user, token } = useAuthStore();
    const { addNotification } = useNotificationStore();
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!user || !token) return;

        const socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log("[GlobalSocket] Connected");
            socket.emit('join_user_room', { userId: user.id });
        });

        socket.on('new_notification', (notification: Omit<Notification, 'read'>) => {
            addNotification(notification);

            // Display Toast
            toast.custom((t) => (
                <div className="flex items-start gap-4 p-4 bg-[#0A0A0C] border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden group w-80">
                    <div className="absolute inset-0 bg-brand-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold shrink-0">
                        {notification.type === 'chat' ? <MessageSquare className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-black uppercase tracking-widest text-brand-gold truncate">
                            {notification.title}
                        </p>
                        <p className="text-sm text-white/80 font-light mt-1 line-clamp-2">
                            {notification.message}
                        </p>
                    </div>
                </div>
            ), {
                duration: 5000,
                position: "top-right",
            });
        });

        socket.on('new_ride_available', (booking: any) => {
            if (user.role === 'DRIVER' || user.role === 'ADMIN') {
                toast.custom((t) => (
                    <div className="flex items-start gap-4 p-4 bg-[#0A0A0C] border border-brand-gold/30 rounded-2xl shadow-[0_0_40px_rgba(212,175,55,0.2)] relative overflow-hidden group w-80 cursor-pointer" onClick={() => window.location.href = '/motorista'}>
                        <div className="absolute inset-0 bg-brand-gold/10 opacity-50 group-hover:opacity-100 transition-opacity animate-pulse" />
                        <div className="w-10 h-10 rounded-xl bg-brand-gold border border-brand-gold/20 flex items-center justify-center text-black shrink-0 relative z-10">
                            <Car className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0 relative z-10">
                            <p className="text-xs font-black uppercase tracking-widest text-brand-gold truncate">
                                Nova Missão Disponível!
                            </p>
                            <p className="text-sm text-white/80 font-light mt-1">
                                {booking.from?.split(',')[0]} → {booking.to?.split(',')[0]}
                            </p>
                        </div>
                    </div>
                ), {
                    duration: 10000,
                    position: "top-right",
                });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [user, token, addNotification]);

    // Return null since it's a logical invisible component
    return null;
}
