import React from 'react';
import { Music, Utensils, Cpu, Ticket, Moon, Sun, MapPin, Compass, ShieldCheck, PlusCircle, XCircle } from 'lucide-react';

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
        <div className="w-full h-full glass-morphism p-6 md:p-8 flex flex-col gap-6 md:gap-10 rounded-[2rem] md:rounded-[2.5rem] transition-all duration-500 overflow-y-auto relative">
            {/* Branding */}
            <div className="relative z-10 pt-12 md:pt-0">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                        <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent italic">
                        UNISPOT
                    </h1>
                </div>
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-foreground/40">York U Live</p>
                    </div>
                </div>
            </div>

            {/* Post Event Primary Action */}
            <button
                onClick={onToggleSelectLocation}
                className={`w-full flex items-center justify-center gap-3 py-5 md:py-6 rounded-2xl md:rounded-3xl font-black italic tracking-tight transition-all shadow-2xl relative overflow-hidden group ${isSelectingLocation
                    ? 'bg-red-500 text-white shadow-red-500/20'
                    : 'bg-primary text-white shadow-primary/30 hover:scale-[1.02] md:hover:scale-105 active:scale-95'
                    }`}
            >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                {isSelectingLocation ? (
                    <>
                        <XCircle className="w-5 h-5 md:w-6 md:h-6 z-10" />
                        <span className="relative z-10 text-sm md:text-base">Cancel Posting</span>
                    </>
                ) : (
                    <>
                        <PlusCircle className="w-5 h-5 md:w-6 md:h-6 z-10" />
                        <span className="relative z-10 text-sm md:text-base">Post an Event</span>
                    </>
                )}
            </button>

            {/* Navigation */}
            <div className="flex flex-col gap-3 md:gap-4 relative z-10 flex-1">
                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20 px-1">Navigation</p>
                <div className="space-y-1 md:space-y-2">
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        const active = selectedCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => onCategoryChange(cat.id)}
                                className={`w-full flex items-center gap-4 px-4 md:px-5 py-3.5 md:py-4 rounded-xl md:rounded-2xl transition-all duration-300 group ${active
                                    ? 'sidebar-item-active'
                                    : 'text-foreground/50 hover:text-foreground hover:bg-foreground/5 dark:hover:bg-white/5'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-white' : 'text-primary'}`} />
                                <span className="font-bold tracking-tight text-sm md:text-base">{cat.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col gap-4 md:gap-6 relative z-10 mt-auto">
                <div className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-2 md:gap-3 text-secondary">
                        <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" />
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-widest italic">Verified</span>
                    </div>
                    <button
                        onClick={onToggleTheme}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-foreground/5 dark:bg-white/5 flex items-center justify-center text-foreground hover:text-primary transition-all duration-300 border border-transparent hover:border-primary/20"
                    >
                        {isDarkMode ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
                    </button>
                </div>

                <div className="p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] bg-gradient-to-br from-primary to-[#6366f1] text-white shadow-xl shadow-primary/20 overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                    <h4 className="font-bold text-xs md:text-sm uppercase tracking-tighter italic">Lions Community</h4>
                    <p className="text-[9px] md:text-[10px] text-white/70 mt-1 leading-relaxed font-medium">
                        Help your fellow lions. <br />Post real events, stay safe.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
