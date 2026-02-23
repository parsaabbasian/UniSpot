import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    ShieldCheck,
    ShieldAlert,
    Trash2,
    CheckCircle,
    XCircle,
    LogOut,
    ArrowLeft,
    RefreshCw,
    User,
    Mail,
    Clock,
    Search,
    Filter,
    BarChart3,
    Activity,
    MapPin,
    AlertCircle,
    Sun,
    Moon
} from 'lucide-react';
import type { Event } from '../types';

interface AdminDashboardProps {
    onBack: () => void;
    isDarkMode: boolean;
    onToggleTheme: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack, isDarkMode, onToggleTheme }) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'pending' | 'approved'>('all');

    const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin';

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
            const response = await axios.get(`${apiUrl}/api/admin/events`);
            setEvents(response.data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch admin events:', err);
            setError('Failed to sync with central intelligence.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchEvents();
        }
    }, [isAuthenticated]);

    // Derived Statistics
    const stats = useMemo(() => {
        const total = events.length;
        const pending = events.filter(e => !e.is_approved).length;
        const approved = events.filter(e => e.is_approved).length;
        const totalVotes = events.reduce((sum, e) => sum + (e.verified_count || 0), 0);

        return { total, pending, approved, totalVotes };
    }, [events]);

    // Filtering Logic
    const filteredEvents = useMemo(() => {
        return events.filter(e => {
            const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (e.creator_name && e.creator_name.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesFilter = filterType === 'all' ||
                (filterType === 'pending' && !e.is_approved) ||
                (filterType === 'approved' && e.is_approved);

            return matchesSearch && matchesFilter;
        });
    }, [events, searchQuery, filterType]);

    const handleToggleApproval = async (id: number) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
            await axios.post(`${apiUrl}/api/admin/events/${id}/approve`);
            setEvents(events.map(e => e.id === id ? { ...e, is_approved: !e.is_approved } : e));
        } catch (err) {
            console.error('Failed to toggle approval:', err);
        }
    };

    const handleDeleteEvent = async (id: number) => {
        if (!window.confirm('Are you sure you want to terminate this signal? This action cannot be undone.')) return;

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
            await axios.delete(`${apiUrl}/api/admin/events/${id}`);
            setEvents(events.filter(e => e.id !== id));
        } catch (err) {
            console.error('Failed to delete event:', err);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
        } else {
            setError('ACCESS DENIED: Invalid Security Key');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-4 font-['Outfit']">
                {/* Background Decor */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] animate-pulse"></div>
                </div>

                <div className="w-full max-w-md relative">
                    <div className="glass-morphism rounded-[2.5rem] p-10 border border-border shadow-2xl relative z-10 overflow-hidden">
                        <div className="flex flex-col items-center mb-10">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mb-6 shadow-xl ring-4 ring-white/5">
                                <ShieldCheck className="w-10 h-10 text-white" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase italic">UniSpot Core</h1>
                            <p className="text-primary text-[10px] font-black uppercase tracking-[0.5em] mt-3 opacity-60">Authentication Protocol</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 ml-1">Command Passkey</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        autoFocus
                                        required
                                        placeholder="••••••••••••"
                                        className="w-full bg-foreground/5 border border-border rounded-2xl px-6 py-5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground font-black tracking-widest text-center text-xl placeholder:text-foreground/10"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-[10px] font-black uppercase tracking-widest animate-shake">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary-dark text-white font-black py-5 rounded-2xl transition-all shadow-xl active:scale-[0.98] uppercase tracking-[0.2em] italic text-sm group"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    Authorization Grant <Activity className="w-4 h-4 group-hover:animate-spin" />
                                </span>
                            </button>
                        </form>

                        <button
                            onClick={onBack}
                            className="w-full mt-8 py-3 text-foreground/30 hover:text-foreground font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 transition-all hover:bg-foreground/5 rounded-xl border border-transparent hover:border-border"
                        >
                            <ArrowLeft className="w-3 h-3" /> System Retreat
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-background text-foreground font-['Outfit'] flex flex-col overflow-hidden">
            {/* Glossy Top Bar */}
            <header className="h-20 glass-morphism border-b border-border px-8 flex items-center justify-between shrink-0 z-50">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={onBack}>
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-[-10deg] transition-all">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black italic uppercase tracking-tighter leading-none">Command Center</h1>
                            <p className="text-[9px] font-black text-primary uppercase tracking-[0.4em] mt-1 opacity-70">UniSpot Intelligence v2.0</p>
                        </div>
                    </div>

                    <nav className="hidden lg:flex items-center gap-1 bg-foreground/5 p-1 rounded-xl border border-border">
                        <button
                            onClick={() => setFilterType('all')}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'all' ? 'bg-primary text-white shadow-lg' : 'text-foreground/40 hover:text-foreground'}`}
                        >
                            All Logs
                        </button>
                        <button
                            onClick={() => setFilterType('pending')}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'pending' ? 'bg-amber-500 text-white shadow-lg' : 'text-foreground/40 hover:text-foreground'}`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setFilterType('approved')}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'approved' ? 'bg-green-500 text-white shadow-lg' : 'text-foreground/40 hover:text-foreground'}`}
                        >
                            Cleared
                        </button>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative hidden md:block group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search frequencies..."
                            className="bg-foreground/5 border border-border rounded-xl px-12 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all w-64 placeholder:text-foreground/10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={onToggleTheme}
                        className="p-3 bg-foreground/5 hover:bg-foreground/10 rounded-xl transition-all border border-border text-foreground/40 hover:text-primary"
                    >
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    <button
                        onClick={fetchEvents}
                        className="p-3 bg-foreground/5 hover:bg-foreground/10 rounded-xl transition-all border border-border text-foreground/40 hover:text-primary"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>

                    <div className="h-8 w-px bg-border mx-2"></div>

                    <button
                        onClick={() => setIsAuthenticated(false)}
                        className="p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-500 transition-all hover:scale-105 active:scale-95"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Statistics */}
                <aside className="w-80 border-r border-border p-8 flex flex-col gap-8 bg-foreground/[0.01] shrink-0 overflow-y-auto hidden xl:flex">
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 mb-6 flex items-center gap-2"><BarChart3 className="w-3 h-3" /> Intelligence Oversight</h3>
                        <div className="grid gap-4">
                            <div className="bg-foreground/5 border border-border p-6 rounded-3xl relative overflow-hidden group hover:bg-foreground/[0.08] transition-all">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform text-primary">
                                    <Activity className="w-12 h-12" />
                                </div>
                                <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest block mb-1">Total Signals</span>
                                <span className="text-4xl font-black italic tracking-tighter text-foreground">{stats.total}</span>
                            </div>

                            <div className="bg-foreground/5 border border-border p-6 rounded-3xl relative overflow-hidden group hover:bg-foreground/[0.08] transition-all">
                                <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest block mb-1">Pending Approval</span>
                                <span className="text-4xl font-black italic tracking-tighter text-amber-500">{stats.pending}</span>
                            </div>

                            <div className="bg-foreground/5 border border-border p-6 rounded-3xl relative overflow-hidden group hover:bg-foreground/[0.08] transition-all">
                                <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest block mb-1">Verified Couriers</span>
                                <span className="text-4xl font-black italic tracking-tighter text-primary">{stats.totalVotes}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto">
                        <div className="bg-primary/10 border border-primary/20 p-6 rounded-3xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-primary rounded-lg shadow-lg">
                                    <ShieldCheck className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest">Protocol Active</span>
                            </div>
                            <p className="text-[10px] leading-relaxed text-foreground/40 font-bold uppercase tracking-tight">System is synchronized with the live York U signal network. Monitoring all active frequencies.</p>
                        </div>
                    </div>
                </aside>

                {/* Main Content Pane */}
                <section className="flex-1 flex flex-col p-8 gap-6 overflow-hidden bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.03)_0%,transparent_100%)]">
                    <div className="flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Signal Log</h2>
                            <div className="h-6 w-px bg-border"></div>
                            <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">{filteredEvents.length} Matching Records</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-foreground/20 tracking-widest mr-2">Sort by</span>
                            <select className="bg-foreground/5 border border-border rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer hover:bg-foreground/10 transition-all">
                                <option>Recent Sequence</option>
                                <option>Highest Impact</option>
                                <option>Expiring Soon</option>
                            </select>
                        </div>
                    </div>

                    {/* Desktop Intelligence Table */}
                    <div className="flex-1 glass-morphism rounded-[2.5rem] border border-border overflow-hidden flex flex-col shadow-2xl relative">
                        {/* Interactive Table Header */}
                        <div className="grid grid-cols-[1fr_140px_180px_120px_180px] gap-8 px-10 py-6 border-b border-border bg-foreground/[0.03] relative z-10 shrink-0">
                            <div className="flex items-center gap-2 group cursor-pointer text-foreground/40 hover:text-foreground transition-colors">
                                <Activity className="w-3 h-3" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Signal Insight</span>
                            </div>
                            <div className="flex items-center gap-2 text-foreground/40">
                                <Filter className="w-3 h-3" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Category</span>
                            </div>
                            <div className="flex items-center gap-2 text-foreground/40">
                                <User className="w-3 h-3" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Source Identity</span>
                            </div>
                            <div className="flex items-center gap-2 text-foreground/40">
                                <ShieldAlert className="w-3 h-3" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Status</span>
                            </div>
                            <div className="flex items-center justify-end gap-2 text-foreground/40">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Countermeasures</span>
                            </div>
                        </div>

                        {/* List Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
                            {loading ? (
                                <div className="h-full flex flex-col items-center justify-center gap-6 opacity-40">
                                    <div className="relative">
                                        <RefreshCw className="w-12 h-12 text-primary animate-spin" />
                                        <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse"></div>
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Quantum Sync in Progress...</p>
                                </div>
                            ) : filteredEvents.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center gap-4 opacity-20">
                                    <ShieldAlert className="w-16 h-16" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">No matching frequencies detected</p>
                                </div>
                            ) : (
                                filteredEvents.map(event => (
                                    <div
                                        key={event.id}
                                        className={`grid grid-cols-[1fr_140px_180px_120px_180px] gap-8 px-6 py-4 rounded-3xl border transition-all duration-300 items-center group
                                            ${event.is_approved
                                                ? 'bg-foreground/[0.01] border-border hover:bg-foreground/[0.04] hover:shadow-xl'
                                                : 'bg-amber-500/[0.03] border-amber-500/10 hover:bg-amber-500/[0.06] hover:border-amber-500/20 hover:shadow-[0_10px_30px_rgba(245,158,11,0.05)]'}
                                        `}
                                    >
                                        {/* Insight */}
                                        <div className="flex flex-col min-w-0">
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-black italic uppercase text-lg tracking-tighter text-foreground group-hover:text-primary transition-colors truncate">{event.title}</h4>
                                                {!event.is_approved && (
                                                    <span className="px-2 py-0.5 bg-amber-500 text-[8px] font-black rounded text-black uppercase tracking-widest animate-pulse">Pending</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="flex items-center gap-1.5 text-foreground/30 text-[10px] font-bold">
                                                    <MapPin className="w-3 h-3 text-primary" />
                                                    York U Keele
                                                </div>
                                                <div className="flex items-center gap-1.5 text-foreground/30 text-[10px] font-bold">
                                                    <Clock className="w-3 h-3 text-primary" />
                                                    End {new Date(event.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Category */}
                                        <div>
                                            <span className="px-4 py-1.5 bg-foreground/5 text-foreground/70 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border border-border group-hover:bg-primary/20 group-hover:text-primary group-hover:border-primary/20 transition-all">
                                                {event.category}
                                            </span>
                                        </div>

                                        {/* Source Identification */}
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-foreground/5 flex items-center justify-center text-primary border border-border">
                                                    <User className="w-3 h-3" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-tight text-foreground/70">{event.creator_name || 'Anonymous Core'}</span>
                                            </div>
                                            {event.creator_email && (
                                                <div className="flex items-center gap-2 opacity-30 group-hover:opacity-60 transition-opacity">
                                                    <Mail className="w-3 h-3" />
                                                    <span className="text-[9px] font-medium lowercase truncate max-w-[120px]">{event.creator_email}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Intelligence Status */}
                                        <div>
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${event.is_approved ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'} animate-pulse`}></div>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${event.is_approved ? 'text-green-500' : 'text-amber-500'}`}>
                                                        {event.is_approved ? 'Live' : 'Intercepted'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-foreground/20 group-hover:text-primary/60 transition-colors">
                                                    <ShieldCheck className="w-3 h-3" />
                                                    <span className="text-[10px] font-black">{event.verified_count || 0} Pouches</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Admin Controls */}
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => handleToggleApproval(event.id)}
                                                className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all border shadow-lg active:scale-90
                                                    ${event.is_approved
                                                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500 hover:text-white'
                                                        : 'bg-green-500 shadow-[0_10px_20px_rgba(34,197,94,0.3)] text-white border-green-500/50 hover:scale-105'}`}
                                                title={event.is_approved ? 'Suspend Frequency' : 'Authorize Signal'}
                                            >
                                                {event.is_approved ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                            </button>

                                            <button
                                                onClick={() => handleDeleteEvent(event.id)}
                                                className="h-12 w-12 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl flex items-center justify-center transition-all hover:bg-red-500 hover:text-white hover:shadow-[0_10px_20px_rgba(239,68,68,0.3)] active:scale-90"
                                                title="Terminate Signal"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AdminDashboard;
