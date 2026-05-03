"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/lib/auth-store';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002';

export function useChat(bookingId: string) {
    const { user, token } = useAuthStore();
    const [messages, setMessages] = useState<any[]>([]);
    const [connected, setConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!bookingId || !token) return;

        // Initialize socket
        const socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            setConnected(true);
            socket.emit('join_booking_chat', { bookingId });
            socket.emit('get_chat_history', { bookingId });
        });

        socket.on('disconnect', () => {
            setConnected(false);
        });

        socket.on('chat_history', (history: any[]) => {
            setMessages(history);
        });

        socket.on('new_message', (message: any) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socket.disconnect();
        };
    }, [bookingId, token]);

    const sendMessage = useCallback((content: string) => {
        if (socketRef.current && connected && content.trim() && user) {
            socketRef.current.emit('send_message', {
                bookingId,
                senderId: user.id,
                content,
            });
        }
    }, [bookingId, connected, user]);

    return {
        messages,
        sendMessage,
        connected,
    };
}
