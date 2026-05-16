"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Search, User, MapPin, Calendar, Clock, ChevronRight, MessageSquare, Wifi, WifiOff, Car, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useBookings } from "@/hooks/useBookings";
import { useChat } from "@/hooks/useChat";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Componente para a Janela de Chat Ativa
const ChatWindow = ({ booking, user }: { booking: any, user: any }) => {
    const { messages, sendMessage, connected } = useChat(booking.id);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            sendMessage(newMessage);
            setNewMessage("");
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#07070A] border border-white/5 rounded-[32px] overflow-hidden relative shadow-2xl">
            {/* Cabeçalho */}
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-white/[0.03] to-transparent backdrop-blur-xl flex items-center justify-between z-20">
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-gold/20 to-black border border-brand-gold/30 flex items-center justify-center text-brand-gold shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                            <User className="w-7 h-7" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#07070A] shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    </div>
                    <div>
                        <h3 className="text-white font-black tracking-widest uppercase text-sm">
                            {user?.role === 'PASSENGER' ? booking.driver?.name || "Motorista (Aguardando)" : booking.passenger?.name}
                        </h3>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mt-1 flex items-center gap-2">
                            Ref: {booking.reference}
                            <ShieldCheck className="w-3 h-3 text-brand-gold/70" />
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    {connected ? (
                        <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] font-black text-brand-gold bg-brand-gold/5 border border-brand-gold/20 px-4 py-2 rounded-xl shadow-inner">
                            <Wifi className="w-3 h-3" /> Conectado
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] font-black text-red-500 bg-red-500/5 border border-red-500/20 px-4 py-2 rounded-xl shadow-inner">
                            <WifiOff className="w-3 h-3" /> Offline
                        </div>
                    )}
                </div>
            </div>

            {/* Contexto da Viagem */}
            <div className="px-8 py-4 bg-black/40 border-b border-white/5 flex items-center gap-6 text-[10px] text-white/50 uppercase tracking-[0.15em] font-black shadow-inner z-10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/5 via-transparent to-transparent opacity-50" />
                <div className="flex items-center gap-3 relative z-10 w-1/3">
                    <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                        <MapPin className="w-3 h-3 text-brand-gold" />
                    </div>
                    <span className="truncate">{booking.origin}</span>
                </div>
                
                <div className="flex-1 flex items-center justify-center relative z-10">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <Car className="w-4 h-4 text-white/30 absolute bg-black px-1" />
                </div>

                <div className="flex items-center gap-3 relative z-10 w-1/3 justify-end">
                    <span className="truncate text-right">{booking.destination}</span>
                    <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                        <MapPin className="w-3 h-3 text-brand-gold" />
                    </div>
                </div>
            </div>

            {/* Messages Area - Dark Glass Theme */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-[#030303] relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 relative z-10">
                        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                            <MessageSquare className="w-10 h-10 text-brand-gold" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-center">
                            Inicie a conversa<br/><span className="text-[10px] text-white/40 font-normal tracking-widest mt-2 block">Toda comunicação é criptografada e salva.</span>
                        </p>
                    </div>
                ) : (
                    messages.map((msg, i) => {
                        const isMe = msg.senderId === user?.id;
                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                key={msg.id || i}
                                className={cn(
                                    "flex relative z-10",
                                    isMe ? "justify-end" : "justify-start"
                                )}
                            >
                                <div className={cn(
                                    "max-w-[75%] rounded-[24px] p-5 relative group backdrop-blur-md shadow-lg",
                                    isMe 
                                        ? "bg-gradient-to-br from-brand-gold to-[#a6862c] text-black rounded-tr-sm border border-brand-gold/50 shadow-[0_4px_20px_-5px_rgba(212,175,55,0.3)]" 
                                        : "bg-white/[0.05] text-white rounded-tl-sm border border-white/10"
                                )}>
                                    <p className={cn(
                                        "text-[13px] leading-relaxed", 
                                        isMe ? "font-bold tracking-wide" : "font-light tracking-wide text-white/90"
                                    )}>
                                        {msg.content}
                                    </p>
                                    <span className={cn(
                                        "text-[9px] uppercase tracking-[0.2em] absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-all duration-300 font-black",
                                        isMe ? "right-2 text-white/30" : "left-2 text-white/30"
                                    )}>
                                        {msg.createdAt ? format(new Date(msg.createdAt), "HH:mm") : "Agora"}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })
                )}
                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Área de Mensagem */}
            <div className="p-6 bg-[#07070A] border-t border-white/5 z-20 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.5)]">
                <form onSubmit={handleSend} className="flex items-center gap-4 relative max-w-4xl mx-auto">
                    <div className="flex-1 relative group">
                        <div className="absolute inset-0 bg-brand-gold/20 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Escreva sua mensagem..."
                            className="w-full relative bg-[#0A0A0C] border border-white/10 rounded-full pl-8 pr-16 py-5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand-gold/50 transition-all shadow-inner font-light tracking-wide"
                            disabled={!connected}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || !connected}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-brand-gold to-[#a6862c] flex items-center justify-center text-black disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                    >
                        <Send className="w-5 h-5 ml-0.5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default function ChatPage() {
    const { user } = useAuthStore();
    const { bookings, loading } = useBookings();
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Filter to only show bookings that make sense to chat about
    const chatableBookings = bookings.filter(b => 
        b.reference.toLowerCase().includes(searchQuery.toLowerCase()) || 
        b.origin.toLowerCase().includes(searchQuery.toLowerCase()) || 
        b.destination.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedBooking = bookings.find(b => b.id === selectedBookingId);

    // Auto-select first booking if none selected
    useEffect(() => {
        if (!selectedBookingId && chatableBookings.length > 0) {
            setSelectedBookingId(chatableBookings[0].id);
        }
    }, [chatableBookings, selectedBookingId]);

    return (
        <div className="h-[calc(100vh-6rem)] lg:h-[calc(100vh-8rem)] flex flex-col">
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-[0.25em] text-white flex items-center gap-4">
                    <MessageSquare className="w-8 h-8 text-brand-gold" />
                    Central de Mensagens
                </h1>
                <p className="text-xs md:text-sm text-white/40 font-light mt-3 tracking-widest uppercase">
                    Chat Seguro MOVNLY
                </p>
            </div>

            <div className="flex-1 flex gap-8 h-full min-h-0">
                {/* Lista de Reservas */}
                <div className="hidden lg:flex w-[380px] flex-col bg-[#07070A] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl relative">
                    {/* Subtle glow effect */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-brand-gold/5 blur-[50px] rounded-full pointer-events-none" />
                    
                    <div className="p-6 border-b border-white/5 bg-white/[0.01] relative z-10">
                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-brand-gold transition-colors" />
                            <input 
                                type="text"
                                placeholder="BUSCAR RESERVA..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#0A0A0C] border border-white/10 rounded-full pl-12 pr-6 py-4 text-[10px] uppercase tracking-widest font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-brand-gold/40 transition-all shadow-inner"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar relative z-10">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-40">
                                <div className="w-6 h-6 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mb-4" />
                                <div className="text-white/30 text-[10px] uppercase tracking-[0.3em] font-black">Carregando</div>
                            </div>
                        ) : chatableBookings.length === 0 ? (
                            <div className="text-center text-white/20 text-[10px] mt-10 uppercase tracking-[0.3em] font-black">Nenhuma reserva</div>
                        ) : (
                            chatableBookings.map(booking => (
                                <button
                                    key={booking.id}
                                    onClick={() => setSelectedBookingId(booking.id)}
                                    className={cn(
                                        "w-full text-left p-5 rounded-[24px] transition-all duration-500 border relative overflow-hidden group",
                                        selectedBookingId === booking.id
                                            ? "bg-brand-gold/5 border-brand-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.05)]"
                                            : "bg-[#0A0A0C] border-white/5 hover:bg-white/[0.03] hover:border-white/10"
                                    )}
                                >
                                    {selectedBookingId === booking.id && (
                                        <motion.div layoutId="activeChatIndicator" className="absolute left-0 top-1/4 bottom-1/4 w-1.5 rounded-r-full bg-brand-gold shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
                                    )}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                                                selectedBookingId === booking.id ? "bg-brand-gold/20 text-brand-gold" : "bg-white/5 text-white/30 group-hover:text-white/50"
                                            )}>
                                                <Car className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-[0.2em] block",
                                                    selectedBookingId === booking.id ? "text-brand-gold" : "text-white/60 group-hover:text-white/80"
                                                )}>
                                                    Ref: {booking.reference}
                                                </span>
                                                <span className="text-[9px] text-white/30 uppercase tracking-widest mt-0.5 block">
                                                    {booking.pickupDate} • {booking.pickupTime}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight className={cn(
                                            "w-4 h-4 transition-all duration-300",
                                            selectedBookingId === booking.id ? "text-brand-gold translate-x-1" : "text-white/10 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2"
                                        )} />
                                    </div>
                                    <div className="flex items-center gap-3 text-[11px] text-white/50 font-medium truncate uppercase tracking-widest">
                                        <span className="truncate max-w-[120px]">{booking.origin}</span>
                                        <div className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
                                        <span className="truncate max-w-[120px]">{booking.destination}</span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Pane - Chat Window */}
                <div className="w-full lg:flex-1 h-full">
                    {selectedBooking ? (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedBooking.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="h-full"
                            >
                                <ChatWindow booking={selectedBooking} user={user} />
                            </motion.div>
                        </AnimatePresence>
                    ) : (
                        <div className="h-full bg-[#07070A] border border-white/5 rounded-[32px] flex flex-col items-center justify-center opacity-40 shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />
                            <div className="w-32 h-32 rounded-full border border-white/5 flex items-center justify-center mb-8 relative z-10">
                                <div className="absolute inset-0 bg-brand-gold/10 blur-2xl rounded-full" />
                                <MessageSquare className="w-12 h-12 text-white/20" />
                            </div>
                            <p className="text-sm font-black tracking-[0.4em] uppercase text-white/60 relative z-10">Selecione uma reserva</p>
                            <p className="text-[10px] font-light tracking-widest text-white/30 mt-4 relative z-10">Para acessar o canal de mensagens</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
