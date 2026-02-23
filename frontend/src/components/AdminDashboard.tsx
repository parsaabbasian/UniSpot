import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, ShieldAlert, Trash2, CheckCircle, XCircle, LogOut, ArrowLeft, RefreshCw, User, Mail, Clock } from 'lucide-react';
import type { Event } from '../types';

interface AdminDashboardProps {
    onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Show error if exists
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);
    const [password, setPassword] = useState('');

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
            alert('Access Denied: Invalid Credentials');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-4">
                <div className="w-full max-w-md glass-morphism rounded-[2.5rem] p-10 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-500">
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 shadow-xl shadow-primary/20 border border-primary/20">
                            <ShieldCheck className="w-10 h-10 text-primary animate-pulse" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tighter text-foreground italic uppercase">Command Center</h1>
                        <p className="text-primary text-[10px] font-black uppercase tracking-[0.4em] mt-2">Authorized Access Only</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Admin Key</label>
                            <input
                                type="password"
                                autoFocus
                                required
                                placeholder="Enter credentials..."
                                className="w-full bg-foreground/5 border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-foreground font-black italic tracking-widest text-center"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary-dark text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-primary/20 active:scale-95 uppercase tracking-widest italic"
                        >
                            Establish Link
                        </button>
                    </form>

                    <button
                        onClick={onBack}
                        className="w-full mt-6 py-4 text-foreground/30 hover:text-foreground font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                    >
                        <ArrowLeft className="w-3 h-3" /> Return to Map Reality
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col font-sans overflow-hidden">
            {/* Admin Header */}
            <header className="h-24 glass-morphism border-b border-white/5 px-8 flex items-center justify-between shrink-0 relative z-20">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black italic uppercase tracking-tighter text-foreground">UniSpot Admin</h1>
                            <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em] leading-none">Command & Control Interface</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={fetchEvents}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-foreground/60 hover:text-primary border border-white/5"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => setIsAuthenticated(false)}
                        className="flex items-center gap-2 px-5 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-red-500 hover:text-white"
                    >
                        <LogOut className="w-4 h-4" /> Terminate Session
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden p-8 flex flex-col gap-8 relative">
                <div className="flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-foreground/40 mb-1">Signal Monitoring</h2>
                        <div className="flex items-center gap-4">
                            <span className="text-4xl font-black italic uppercase tracking-tighter text-foreground">
                                {events.length} Active Feeds
                            </span>
                            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-[9px] font-black tracking-widest uppercase animate-pulse">
                                Live Connection
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="px-6 py-4 glass-morphism rounded-3xl border border-white/5 flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Verified Signals</span>
                            <span className="text-2xl font-black text-primary">{events.reduce((sum, e) => sum + (e.verified_count || 0), 0)}</span>
                        </div>
                        <div className="px-6 py-4 glass-morphism rounded-3xl border border-white/5 flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Pending Approval</span>
                            <span className="text-2xl font-black text-amber-500">{events.filter(e => !e.is_approved).length}</span>
                        </div>
                    </div>
                </div>

                {/* Table Container */}
                <div className="flex-1 overflow-hidden glass-morphism rounded-[2rem] border border-white/10 flex flex-col shadow-2xl relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-secondary animate-pulse opacity-50"></div>

                    {/* Table Header */}
                    <div className="grid grid-cols-[1fr_120px_180px_120px_150px_180px] gap-6 px-10 py-6 border-b border-white/5 bg-white/[0.02]">
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 italic">Event Insight</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 italic">Category</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 italic">Signal Source</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 italic">Status</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 italic">Intelligence</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 italic text-right">Countermeasures</span>
                    </div>

                    {/* Table Body */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center gap-4 opacity-50">
                                <RefreshCw className="w-10 h-10 text-primary animate-spin" />
                                <p className="text-[10px] font-black uppercase tracking-[0.5em]">Synchronizing Intelligence...</p>
                            </div>
                        ) : events.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center gap-4 opacity-30">
                                <ShieldAlert className="w-12 h-12" />
                                <p className="text-[10px] font-black uppercase tracking-[0.5em]">No signals currently active</p>
                            </div>
                        ) : (
                            events.map(event => (
                                <div
                                    key={event.id}
                                    className={`grid grid-cols-[1fr_120px_180px_120px_150px_180px] gap-6 px-4 py-3 rounded-[1.5rem] border transition-all duration-300 items-center group
                                        ${event.is_approved ? 'bg-white/[0.01] border-white/[0.03] hover:bg-white/[0.03]' : 'bg-red-500/[0.03] border-red-500/10 hover:bg-red-500/[0.05]'}
                                    `}
                                >
                                    {/* Insight */}
                                    <div className="flex flex-col min-w-0 pr-4">
                                        <h4 className="font-black italic uppercase text-foreground leading-tight truncate">{event.title}</h4>
                                        <p className="text-[9px] text-foreground/40 truncate mt-1">{event.description || 'No additional intelligence provided.'}</p>
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[9px] font-black uppercase tracking-widest border border-primary/10">
                                            {event.category}
                                        </span>
                                    </div>

                                    {/* Source */}
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-foreground/60">
                                            <User className="w-3 h-3 text-primary" />
                                            <span className="text-[9px] font-black uppercase tracking-tight">{event.creator_name || 'Anonymous Signal'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-foreground/30">
                                            <Mail className="w-3 h-3" />
                                            <span className="text-[8px] font-bold lowercase truncate max-w-[120px]">{event.creator_email || 'Hidden Source'}</span>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div>
                                        {event.is_approved ? (
                                            <div className="flex items-center gap-2 text-green-500">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                                <span className="text-[9px] font-black uppercase tracking-widest">Active</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-red-500">
                                                <ShieldAlert className="w-3 h-3" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Compromised</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Intelligence */}
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-foreground/40">
                                            <ShieldCheck className="w-3 h-3" />
                                            <span className="text-[9px] font-bold uppercase tracking-widest">{event.verified_count} Vouches</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-foreground/40">
                                            <Clock className="w-3 h-3" />
                                            <span className="text-[8px] font-bold uppercase tracking-tight">Ends {new Date(event.end_time).toLocaleTimeString()}</span>
                                        </div>
                                    </div>

                                    {/* Countermeasures */}
                                    <div className="flex items-center justify-end gap-2 pr-2">
                                        <button
                                            onClick={() => handleToggleApproval(event.id)}
                                            className={`p-3 rounded-xl transition-all border ${event.is_approved
                                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500 hover:text-white'
                                                : 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500 hover:text-white'}`}
                                            title={event.is_approved ? 'Suspend Signal' : 'Authorize Signal'}
                                        >
                                            {event.is_approved ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteEvent(event.id)}
                                            className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl transition-all hover:bg-red-500 hover:text-white"
                                            title="Terminate Signal"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
