"use client";

import { useAuthStore } from "@/lib/auth-store";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";
import { Loader2, ShieldAlert } from "lucide-react";

interface RoleGuardProps {
    children: ReactNode;
    allowedRoles: string[];
    redirectTo?: string;
}

export function RoleGuard({ children, allowedRoles, redirectTo = "/login" }: RoleGuardProps) {
    const { user, token } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        // 1. Check Autentication
        if (!token || !user) {
            router.push(`${redirectTo}?redirect=${pathname}`);
            return;
        }

        // 2. Check Authorization (Strict Fortress Logic)
        if (!allowedRoles.includes(user.role)) {
            // Unauthorized access attempt - Hard redirect to their respective dashboard or generic error
            const target = user.role === 'DRIVER' ? '/driver' : '/dashboard';
            router.push(target);
            return;
        }

        setIsAuthorized(true);
    }, [user, token, router, pathname, allowedRoles, redirectTo]);

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center p-6 text-center">
                <div className="relative mb-8">
                    <Loader2 className="w-16 h-16 text-brand-gold animate-spin opacity-20" />
                    <ShieldAlert className="absolute inset-0 m-auto w-6 h-6 text-brand-gold animate-pulse" />
                </div>
                <h2 className="text-white text-xl font-bold uppercase tracking-[0.3em] mb-2 font-sans italic">Autenticação Segura</h2>
                <p className="text-white/20 text-[10px] uppercase tracking-[0.5em] font-black">Protocolo de Acesso NexRice Private</p>
            </div>
        );
    }

    return <>{children}</>;
}
