"use client";

import { useState } from "react";
import { Bell, Check, Trash2, MessageSquare, Clock } from "lucide-react";
import { useNotificationStore } from "@/lib/notification-store";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function NotificationBell() {
    const [open, setOpen] = useState(false);
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotificationStore();

    const count = unreadCount();

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="relative w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] flex items-center justify-center transition-all group">
                    <Bell className={cn("w-5 h-5 text-white/70 transition-colors", count > 0 && "text-brand-gold")} />
                    {count > 0 && (
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)] border border-[#0A0A0C]" />
                    )}
                </button>
            </PopoverTrigger>
            
            <PopoverContent 
                align="end" 
                sideOffset={16}
                className="w-80 md:w-96 bg-[#0A0A0C]/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl p-0 overflow-hidden z-[100] outline-none"
            >
                <div className="p-5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <div>
                        <h3 className="text-white font-bold tracking-wide uppercase text-sm">Notificações</h3>
                        <p className="text-[10px] text-brand-gold uppercase tracking-widest font-black mt-1">
                            {count} não lidas
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={markAllAsRead}
                            disabled={count === 0}
                            className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-colors disabled:opacity-30"
                            title="Marcar todas como lidas"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={clearAll}
                            disabled={notifications.length === 0}
                            className="p-2 rounded-xl hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors disabled:opacity-30"
                            title="Limpar todas"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                    <AnimatePresence>
                        {notifications.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                className="py-12 text-center text-white/30"
                            >
                                <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                <p className="text-xs uppercase tracking-widest font-bold">Nenhuma notificação</p>
                            </motion.div>
                        ) : (
                            notifications.map((notif) => (
                                <motion.div
                                    key={notif.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="mb-1"
                                >
                                    <Link 
                                        href={notif.type === 'chat' ? `/dashboard/chat` : `/dashboard/bookings`}
                                        onClick={() => {
                                            markAsRead(notif.id);
                                            setOpen(false);
                                        }}
                                        className={cn(
                                            "flex items-start gap-4 p-3 rounded-2xl transition-all relative overflow-hidden group",
                                            notif.read ? "hover:bg-white/[0.02]" : "bg-brand-gold/5 hover:bg-brand-gold/10"
                                        )}
                                    >
                                        {!notif.read && (
                                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand-gold" />
                                        )}
                                        
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                                            notif.read ? "bg-white/5 border-white/5 text-white/40" : "bg-brand-gold/10 border-brand-gold/20 text-brand-gold"
                                        )}>
                                            {notif.type === 'chat' ? <MessageSquare className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <h4 className={cn("text-xs font-bold uppercase tracking-wide truncate", notif.read ? "text-white/60" : "text-white")}>
                                                {notif.title}
                                            </h4>
                                            <p className={cn("text-sm mt-0.5 line-clamp-2", notif.read ? "text-white/40 font-light" : "text-white/80 font-normal")}>
                                                {notif.message}
                                            </p>
                                            <p className="text-[9px] text-white/30 uppercase tracking-widest mt-2 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: ptBR })}
                                            </p>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </PopoverContent>
        </Popover>
    );
}
