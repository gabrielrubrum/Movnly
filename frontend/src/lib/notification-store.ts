import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Notification {
    id: string;
    type: "chat" | "booking" | "system";
    title: string;
    message: string;
    bookingId?: string;
    createdAt: Date | string;
    read: boolean;
}

interface NotificationState {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, "read">) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
    unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set, get) => ({
            notifications: [],
            addNotification: (notification) => set((state) => {
                // Prevent duplicates
                if (state.notifications.some(n => n.id === notification.id)) return state;
                return {
                    notifications: [
                        { ...notification, read: false },
                        ...state.notifications
                    ]
                };
            }),
            markAsRead: (id) => set((state) => ({
                notifications: state.notifications.map((n) =>
                    n.id === id ? { ...n, read: true } : n
                )
            })),
            markAllAsRead: () => set((state) => ({
                notifications: state.notifications.map((n) => ({ ...n, read: true }))
            })),
            clearAll: () => set({ notifications: [] }),
            unreadCount: () => get().notifications.filter(n => !n.read).length
        }),
        {
            name: "movnly-notifications",
        }
    )
);
