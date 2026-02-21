import React from 'react';
import { Music, Utensils, Cpu, Moon, Sun, Compass, PlusCircle, XCircle, BookOpen, Users, Dumbbell, ShieldAlert, ShoppingBag, ShieldCheck, Search } from 'lucide-react';

interface SidebarProps {
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    isDarkMode: boolean;
    onToggleTheme: () => void;
    isSelectingLocation: boolean;
    onToggleSelectLocation: () => void;
    activeUserCount: number;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    recentActivity: any[];
    currentUser: { name: string, email: string } | null;
    onLogout: () => void;
}

const categories = [
    { id: 'all', name: 'Discover All', icon: Compass },
    { id: 'Food', name: 'Food & Drink', icon: Utensils },
    { id: 'Study', name: 'Study Groups', icon: BookOpen },
    { id: 'Social', name: 'Social & Meet', icon: Users },
    { id: 'Tech', name: 'Technology', icon: Cpu },
    { id: 'Music', name: 'Music & Arts', icon: Music },
    { id: 'Sports', name: 'Sports & Gym', icon: Dumbbell },
    { id: 'Safety', name: 'Campus Safety', icon: ShieldAlert },
    { id: 'Sale', name: 'Sale & Free', icon: ShoppingBag },
];

const Sidebar: React.FC<SidebarProps> = ({
    selectedCategory,
    onCategoryChange,
    isDarkMode,
    onToggleTheme,
    isSelectingLocation,
    onToggleSelectLocation,
    activeUserCount,
    searchQuery,
    onSearchChange,
    recentActivity,
    currentUser,
    onLogout
}) => {
    return (
        <div className="w-full h-full glass-morphism p-4 md:p-6 flex flex-col gap-6 md:gap-8 rounded-2xl md:rounded-3xl transition-all duration-700 relative border border-white/10 shadow-2xl overflow-hidden">
            {/* Branding - Static */}
            <div className="relative z-10 shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:rotate-6 transition-transform">
                            <img src="/logo.svg" alt="UniSpot Logo" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                        </div>
                        <h1 className="text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent uppercase">
                            UNISPOT
                        </h1>
                    </div>
                    <button
                        onClick={onToggleTheme}
                        className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-foreground/5 dark:bg-white/5 flex items-center justify-center text-foreground hover:text-primary transition-all duration-500 border border-white/5 hover:border-primary/20 shadow-sm"
                    >
                        {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                </div>
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                        <div className="relative group/profile cursor-pointer" onClick={onLogout}>
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-primary/20 group-hover/profile:bg-red-500 transition-colors">
                                {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="absolute left-full ml-3 opacity-0 group-hover/profile:opacity-100 transition-opacity bg-foreground text-background text-[8px] font-black px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                                LOGOUT {currentUser?.name?.split(' ')[0].toUpperCase()}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-[10px] font-black uppercase tracking-tight text-foreground/80 leading-none mb-1">{currentUser?.name || 'Authorized Student'}</p>
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                                </span>
                                <p className="text-[8px] font-bold uppercase tracking-widest text-foreground/40">
                                    York U Verified
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/5 border border-primary/10">
                        <div className="w-1 h-1 rounded-full bg-primary animate-pulse"></div>
                        <span className="text-[9px] font-black text-primary uppercase">{activeUserCount} Active</span>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="px-1 shrink-0 relative">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search Reality..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-background/50 transition-all placeholder:text-foreground/20"
                    />
                </div>
            </div>

            {/* Post Event Primary Action - Static */}
            <div className="px-1 shrink-0">
                <button
                    onClick={onToggleSelectLocation}
                    className={`w-full flex items-center justify-center gap-3 py-4 md:py-5 rounded-2xl font-bold uppercase tracking-wider text-sm transition-all shadow-xl relative overflow-hidden group active:scale-[0.97] ${isSelectingLocation
                        ? 'bg-red-500 text-white shadow-red-500/30'
                        : 'bg-primary text-white shadow-primary/30 hover:shadow-primary/50'
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
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
                {/* Navigation */}
                <div className="flex flex-col gap-4 relative z-10 overflow-hidden">
                    <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-foreground/40 px-2 shrink-0">Filter Reality</p>
                    <div className="space-y-2">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            const active = selectedCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => onCategoryChange(cat.id)}
                                    className={`w-full flex items-center gap-4 px-4 md:px-5 py-4 rounded-2xl transition-all duration-700 group relative overflow-hidden active:scale-[0.98] ${active
                                        ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-xl shadow-primary/20 scale-[1.02] z-20'
                                        : 'text-foreground/40 hover:text-foreground hover:bg-foreground/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 md:w-5 md:h-5 transition-all duration-500 group-hover:rotate-6 ${active ? 'text-white scale-110' : 'text-primary'}`} />
                                    <span className={`font-bold tracking-tight text-sm uppercase ${active ? 'italic' : ''}`}>{cat.name}</span>
                                    {active && (
                                        <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1)] animate-pulse"></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Activity Mini-Feed */}
                <div className="space-y-4 pb-4">
                    <div className="space-y-3">
                        {recentActivity.length > 0 && recentActivity.slice(0, 3).map((act, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-foreground/[0.02] border border-foreground/5 animate-in slide-in-from-left-2 duration-500">
                                <div className={`p-1.5 rounded-lg ${act.type === 'new' ? 'bg-primary/20 text-primary' : 'bg-green-500/20 text-green-500'}`}>
                                    {act.type === 'new' ? <PlusCircle className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] font-black uppercase tracking-tighter text-foreground/80 truncate leading-tight">{act.title}</p>
                                    <p className="text-[8px] font-bold uppercase text-foreground/30 tracking-tight">
                                        {act.type === 'new' ? 'Signal Dropped' : `Vouch from ${act.userName || 'Student'}`}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Status - Static */}
            <div className="relative z-10 pt-6 border-t border-foreground/5 shrink-0">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-primary via-primary-dark to-accent text-white shadow-xl shadow-primary/20 overflow-hidden group relative">
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
