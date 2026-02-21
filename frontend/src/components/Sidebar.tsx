import React from 'react';
import { Music, Utensils, Cpu, Ticket, Moon, Sun, Compass, ShieldCheck, PlusCircle, XCircle } from 'lucide-react';

interface SidebarProps {
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    isDarkMode: boolean;
    onToggleTheme: () => void;
    isSelectingLocation: boolean;
    onToggleSelectLocation: () => void;
}

const categories = [
    { id: 'all', name: 'Discover All', icon: Compass },
    { id: 'Tech', name: 'Technology', icon: Cpu },
    { id: 'Music', name: 'Music & Art', icon: Music },
    { id: 'Food', name: 'Food & Drink', icon: Utensils },
    { id: 'Entertainment', name: 'Entertainment', icon: Ticket },
];

const Sidebar: React.FC<SidebarProps> = ({
    selectedCategory,
    onCategoryChange,
    isDarkMode,
    onToggleTheme,
    isSelectingLocation,
    onToggleSelectLocation
}) => {
    return (
        <div className="w-full h-full glass-morphism p-6 md:p-8 flex flex-col gap-6 md:gap-8 rounded-2xl md:rounded-3xl transition-all duration-700 overflow-y-auto relative border border-white/10 shadow-2xl">
            {/* Branding */}
            <div className="relative z-10 mb-2">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:rotate-6 transition-transform">
                        <img src="/logo.svg" alt="UniSpot Logo" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
                    </div>
                    <h1 className="text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent uppercase">
                        UNISPOT
                    </h1>
                </div>
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-foreground/50">York U Live Feed</p>
                    </div>
                </div>
            </div>

            {/* Post Event Primary Action */}
            <button
                onClick={onToggleSelectLocation}
                className={`w-full flex items-center justify-center gap-3 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold uppercase tracking-wider text-sm transition-all shadow-xl relative overflow-hidden group ${isSelectingLocation
                    ? 'bg-red-500 text-white shadow-red-500/30 hover:scale-[1.02]'
                    : 'bg-primary text-white shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-95'
                    }`}
            >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                {isSelectingLocation ? (
                    <>
                        <XCircle className="w-5 h-5 md:w-6 md:h-6 z-10" />
                        <span className="relative z-10 text-sm md:text-base">Cancel Placement</span>
                    </>
                ) : (
                    <>
                        <PlusCircle className="w-5 h-5 md:w-6 md:h-6 z-10" />
                        <span className="relative z-10 text-sm md:text-base">Drop a Mark</span>
                    </>
                )}
            </button>

            {/* Navigation */}
            <div className="flex flex-col gap-3 md:gap-4 relative z-10 flex-1">
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-foreground/40 px-1">Filter Reality</p>
                <div className="space-y-1.5 md:space-y-2">
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        const active = selectedCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => onCategoryChange(cat.id)}
                                className={`w-full flex items-center gap-4 px-4 md:px-5 py-3.5 md:py-4 rounded-xl transition-all duration-300 group relative overflow-hidden ${active
                                    ? 'bg-primary/90 text-white shadow-lg shadow-primary/30'
                                    : 'text-foreground/50 hover:text-foreground hover:bg-foreground/5 dark:hover:bg-white/5'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-white' : 'text-primary'}`} />
                                <span className="font-bold tracking-tight text-sm uppercase">{cat.name}</span>
                                {active && (
                                    <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col gap-6 md:gap-8 relative z-10 mt-auto pt-6 border-t border-foreground/5">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3 text-secondary group cursor-help">
                        <ShieldCheck className="w-6 h-6 md:w-7 md:h-7 opacity-70 group-hover:opacity-100 transition-opacity" />
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-60">Verified Mode</span>
                    </div>
                    <button
                        onClick={onToggleTheme}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-[1.25rem] bg-foreground/5 dark:bg-white/5 flex items-center justify-center text-foreground hover:text-primary transition-all duration-500 border border-transparent hover:border-primary/30 shadow-sm"
                    >
                        {isDarkMode ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
                    </button>
                </div>

                <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-primary via-primary-dark to-accent text-white shadow-xl shadow-primary/20 overflow-hidden group relative">
                    <div className="absolute -right-4 -bottom-4 w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-1000"></div>
                    <h4 className="font-bold text-xs md:text-sm uppercase tracking-tight mb-1">Stay Safe, Lions.</h4>
                    <p className="text-[10px] text-white/70 leading-relaxed font-medium">
                        Report real events only. <br />Your rep depends on it.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
