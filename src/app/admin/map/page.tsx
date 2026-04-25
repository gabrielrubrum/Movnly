import React from "react";
import { LocateFixed, Map as MapIcon, Crosshair, Radar, Signal } from "lucide-react";

export default function LiveMapPage() {
    return (
        <div className="relative w-full h-[calc(100vh-80px)] overflow-hidden rounded-[2rem] border border-white/[0.05] bg-[#050505] shadow-[0_0_80px_rgba(0,0,0,0.8)]">

            {/* Background Radar Simulation */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-[800px] h-[800px] rounded-full border border-emerald-500/30 absolute" />
                <div className="w-[600px] h-[600px] rounded-full border border-emerald-500/20 absolute" />
                <div className="w-[400px] h-[400px] rounded-full border border-emerald-500/10 absolute" />
                <div className="w-[200px] h-[200px] rounded-full border border-emerald-500/5 absolute bg-emerald-500/[0.02]" />
                {/* Radar Sweep */}
                <div className="absolute inset-0 w-full h-full animate-[spin_4s_linear_infinite]" style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(16, 185, 129, 0.4) 100%)', borderRadius: '50%' }}></div>
            </div>

            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

            {/* Floating UI Elements */}
            <div className="absolute top-8 left-8 right-8 flex items-start justify-between pointer-events-none">

                <div className="bg-surface-1/80 backdrop-blur-2xl border border-white/10 p-5 rounded-[1.5rem] shadow-2xl max-w-sm pointer-events-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                            <Radar className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-white tracking-tight">Live Network</h1>
                            <div className="flex items-center gap-1.5 text-xs text-emerald-400/80 font-bold uppercase tracking-widest mt-0.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-glow" /> Encrypted link
                            </div>
                        </div>
                    </div>
                    <p className="text-sm text-white/40 leading-relaxed mb-4">Monitoring completely active assets in real-time. Signals routed via Lisbon central dispatch server.</p>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-black/50 border border-white/5 p-3 rounded-xl text-center">
                            <span className="block text-2xl font-black text-white">24</span>
                            <span className="text-[0.6rem] text-white/30 uppercase font-bold tracking-widest">Active Units</span>
                        </div>
                        <div className="bg-black/50 border border-white/5 p-3 rounded-xl text-center">
                            <span className="block text-2xl font-black text-white">8</span>
                            <span className="text-[0.6rem] text-white/30 uppercase font-bold tracking-widest">In Transit</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 pointer-events-auto">
                    <button className="w-12 h-12 bg-surface-1/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors shadow-2xl">
                        <LocateFixed className="w-5 h-5" />
                    </button>
                    <button className="w-12 h-12 bg-surface-1/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors shadow-2xl">
                        <MapIcon className="w-5 h-5" />
                    </button>
                    <button className="w-12 h-12 bg-surface-1/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors shadow-2xl">
                        <Crosshair className="w-5 h-5" />
                    </button>
                </div>

            </div>

            {/* Simulated Vehicles on map */}
            <div className="absolute top-[40%] left-[30%]">
                <div className="relative flex items-center justify-center">
                    <span className="absolute flex h-10 w-10">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20"></span>
                    </span>
                    <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#050505] shadow-[0_0_15px_rgba(16,185,129,0.8)] relative z-10" />
                    <div className="absolute top-6 bg-surface-1/90 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-xl whitespace-nowrap">
                        João Petrol <span className="text-white/30 font-normal ml-1">• 45 km/h</span>
                    </div>
                </div>
            </div>

            <div className="absolute top-[60%] left-[60%]">
                <div className="relative flex items-center justify-center">
                    <span className="absolute flex h-10 w-10">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20" style={{ animationDelay: '1s' }}></span>
                    </span>
                    <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#050505] shadow-[0_0_15px_rgba(16,185,129,0.8)] relative z-10" />
                    <div className="absolute top-6 bg-surface-1/90 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-xl whitespace-nowrap">
                        Carlos Silva <span className="text-white/30 font-normal ml-1">• 120 km/h</span>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl backdrop-blur-md flex items-center gap-2">
                <Signal className="w-4 h-4 text-amber-500 animate-pulse" />
                <span className="text-amber-500 text-xs font-black uppercase tracking-widest">GPS Telemetry Mode</span>
            </div>

        </div>
    );
}
