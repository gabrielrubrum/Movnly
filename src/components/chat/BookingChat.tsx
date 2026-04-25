"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { useAuthStore } from "@/lib/auth-store";
import { 
    MessageSquare, Send, X, User, 
    ShieldCheck, Loader2, Smartphone, 
    MoreVertical, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface BookingChatProps {
    bookingId: string;
    isOpen: boolean;
    onClose: () => void;
    title?: string;
}

export function BookingChat({ bookingId, isOpen, onClose, title = "Central de Comunicação" }: BookingChatProps) {
    const { user } = useAuthStore();
    const { messages, sendMessage, connected } = useChat(bookingId);
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (input.trim()) {
            sendMessage(input.trim());
            setInput("");
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-end justify-end pointer-events-none p-0 md:p-8">
                {/* Backdrop overlay (mobile only) */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm lg:hidden pointer-events-auto"
                />

                <motion.div
                    initial={{ opacity: 0, y: 100, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 100, scale: 0.95 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="w-full h-[100dvh] md:h-[700px] md:w-[450px] bg-[#07070A] border-t md:border border-white/10 md:rounded-[40px] shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden pointer-events-auto relative"
                >
                    {/* Header */}
                    <div className="p-6 md:p-8 border-b border-white/5 bg-white/[0.01] flex items-center justify-between relative overflow-hidden">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold relative">
                                <MessageSquare className="w-6 h-6" />
                                {connected && (
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#07070A] animate-pulse" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm uppercase tracking-[0.2em]">{title}</h3>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-3 h-3 text-brand-gold/40" />
                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Canal Criptografado</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-white/20 hover:text-white transition-colors">
                                <Info className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={onClose}
                                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div 
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar scroll-smooth"
                    >
                        {!connected && (
                            <div className="flex items-center justify-center py-10">
                                <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                                    <Loader2 className="w-3 h-3 text-brand-gold animate-spin" />
                                    <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Sincronizando Mensagens...</span>
                                </div>
                            </div>
                        )}

                        {messages.length === 0 && connected && (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                                <Smartphone className="w-12 h-12 lg:mb-2" strokeWidth={1} />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Inicie a conversa com segurança</p>
                            </div>
                        )}

                        {messages.map((msg, i) => {
                            const isMe = msg.senderId === user?.id;
                            return (
                                <motion.div
                                    initial={{ opacity: 0, x: isMe ? 20 : -20, scale: 0.9 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    key={msg.id || i}
                                    className={cn(
                                        "flex flex-col max-w-[85%]",
                                        isMe ? "ml-auto items-end" : "mr-auto items-start"
                                    )}
                                >
                                    <div className="flex items-center gap-2 mb-2 px-1">
                                        <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">
                                            {isMe ? "Você" : msg.sender?.name} • {format(new Date(msg.createdAt), 'HH:mm')}
                                        </span>
                                    </div>
                                    <div className={cn(
                                        "px-5 py-4 rounded-[24px] text-sm leading-relaxed",
                                        isMe 
                                            ? "bg-brand-gold text-black rounded-tr-none shadow-lg font-medium" 
                                            : "bg-white/5 border border-white/10 text-white/60 rounded-tl-none italic font-serif"
                                    )}>
                                        {msg.content}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Input Area */}
                    <div className="p-6 md:p-8 border-t border-white/5 bg-white/[0.01]">
                        <form 
                            onSubmit={handleSend}
                            className="relative flex items-center gap-4 transition-all"
                        >
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Diga algo especial..."
                                className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-6 text-sm text-white focus:outline-none focus:border-brand-gold/40 focus:bg-white/[0.05] transition-all placeholder:text-white/10 shadow-2xl"
                                disabled={!connected}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || !connected}
                                className="w-14 h-14 rounded-2xl bg-brand-gold text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[0_10px_30px_rgba(212,175,55,0.2)] disabled:opacity-20 disabled:scale-100 group"
                            >
                                <Send className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            </button>
                        </form>
                        <div className="mt-6 flex items-center justify-between px-2">
                             <div className="flex items-center gap-2 opacity-20">
                                 <Smartphone className="w-3 h-3" />
                                 <span className="text-[7px] font-black uppercase tracking-widest">Mobile Optimized</span>
                             </div>
                             <p className="text-[7px] font-bold text-white/10 uppercase tracking-[0.3em]">NexRice Security Protocol v2.4</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
