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
        <div className="w-full h-full glass-morphism p-6 md:p-8 flex flex-col gap-8 md:gap-10 rounded-[2.5rem] md:rounded-[3rem] transition-all duration-700 overflow-y-auto relative border border-white/10 shadow-2xl">
            {/* Branding */}
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(79,70,229,0.4)] group-hover:rotate-6 transition-transform overflow-hidden">
                        <img src="/logo.svg" alt="UniSpot Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent italic uppercase">
                        UNISPOT
                    </h1>
                </div>
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                        <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-foreground/40 italic">York U Live Feed</p>
                    </div>
                </div>
            </div>

            {/* Post Event Primary Action */}
            <button
                onClick={onToggleSelectLocation}
                className={`w-full flex items-center justify-center gap-3 py-5 md:py-6 rounded-2xl md:rounded-[2rem] font-black italic tracking-tight transition-all shadow-2xl relative overflow-hidden group ${isSelectingLocation
                    ? 'bg-red-500 text-white shadow-red-500/30'
                    : 'bg-primary text-white shadow-primary/30 hover:scale-[1.02] active:scale-95'
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
            <div className="flex flex-col gap-4 md:gap-6 relative z-10 flex-1">
                <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-foreground/20 px-2 italic">Filter Reality</p>
                <div className="space-y-2 md:space-y-3">
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        const active = selectedCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => onCategoryChange(cat.id)}
                                className={`w-full flex items-center gap-4 px-5 md:px-6 py-4 md:py-5 rounded-xl md:rounded-2xl transition-all duration-500 group relative overflow-hidden ${active
                                    ? 'sidebar-item-active shadow-primary/40'
                                    : 'text-foreground/40 hover:text-foreground hover:bg-foreground/5 dark:hover:bg-white/5'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 md:w-5 md:h-5 transition-transform duration-500 group-hover:scale-110 ${active ? 'text-white' : 'text-primary'}`} />
                                <span className="font-black tracking-tight text-sm md:text-lg italic">{cat.name}</span>
                                {active && (
                                    <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-sm shadow-white/50"></div>
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
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-widest italic opacity-60">Verified Mode</span>
                    </div>
                    <button
                        onClick={onToggleTheme}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-[1.25rem] bg-foreground/5 dark:bg-white/5 flex items-center justify-center text-foreground hover:text-primary transition-all duration-500 border border-transparent hover:border-primary/30 shadow-sm"
                    >
                        {isDarkMode ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
                    </button>
                </div>

                <div className="p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-primary via-primary-dark to-accent text-white shadow-2xl shadow-primary/30 overflow-hidden group relative">
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 md:w-24 md:h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                    <h4 className="font-black text-xs md:text-sm uppercase tracking-tighter italic mb-1">Stay Safe, Lions.</h4>
                    <p className="text-[10px] md:text-xs text-white/60 leading-relaxed font-bold italic">
                        Report real events only. <br />Your rep depends on it.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
