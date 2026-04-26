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
    const [status, setStatus] = useState<"loading" | "authorized" | "unauthorized">("loading");

    useEffect(() => {
        // Aguardar hidratação do zustand (localStorage)
        const timer = setTimeout(() => {
            if (!token || !user) {
                router.push(`${redirectTo}?redirect=${encodeURIComponent(pathname)}`);
                setStatus("unauthorized");
                return;
            }

            if (!allowedRoles.includes(user.role)) {
                const roleRedirects: Record<string, string> = {
                    'DRIVER': '/motorista',
                    'PASSENGER': '/dashboard',
                    'ADMIN': '/admin',
                    'MANAGER': '/admin',
                    'OPERATOR': '/admin',
                    'ACCOUNTANT': '/admin',
                };
                router.push(roleRedirects[user.role] || '/dashboard');
                setStatus("unauthorized");
                return;
            }

            setStatus("authorized");
        }, 50); // pequeno delay para garantir hidratação

        return () => clearTimeout(timer);
    }, [user, token, router, pathname, allowedRoles, redirectTo]);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center">
                <div className="relative mb-6">
                    <Loader2 className="w-12 h-12 text-brand-gold animate-spin opacity-20" />
                    <ShieldAlert className="absolute inset-0 m-auto w-5 h-5 text-brand-gold animate-pulse" />
                </div>
                <p className="text-white/20 text-[10px] uppercase tracking-[0.5em] font-black">A verificar acesso...</p>
            </div>
        );
    }

    if (status === "unauthorized") return null;

    return <>{children}</>;
}
