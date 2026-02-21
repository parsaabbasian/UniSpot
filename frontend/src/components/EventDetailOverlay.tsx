import React, { useState } from 'react';
import { X, ShieldCheck, Tag, Flame, Share2, AlertTriangle, Check, MapPin, Users, Calendar } from 'lucide-react';
import type { Event } from '../types';

interface EventDetailOverlayProps {
    event: Event;
    onClose: () => void;
    onVerify: (id: number) => void;
    hasVoted: boolean;
}

const EventDetailOverlay: React.FC<EventDetailOverlayProps> = ({ event, onClose, onVerify, hasVoted }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [shareCopied, setShareCopied] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 500);
    };

    const handleShare = () => {
        const url = `${window.location.origin}${window.location.pathname}#map?event=${event.id}`;
        navigator.clipboard.writeText(`Check out this event on UniSpot: ${event.title} - ${url}`);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
    };

    const formatFullDate = (timeStr: string) => {
        const date = new Date(timeStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (timeStr: string) => {
        const date = new Date(timeStr);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const categoryColors: Record<string, string> = {
        'Food': '#F59E0B',      // Amber
        'Study': '#10B981',     // Emerald
        'Social': '#EC4899',    // Pink
        'Tech': '#6366F1',      // Indigo
        'Music': '#8B5CF6',     // Violet
        'Sports': '#EF4444',    // Red
        'Safety': '#F43F5E',    // Rose
        'Sale': '#F97316'       // Orange
    };

    const catColor = categoryColors[event.category] || '#6366f1';

    return (
        <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-end md:pr-6 md:pb-6 pointer-events-none">
            {/* Backdrop for closing */}
            <div
                className={`absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity duration-500 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
                onClick={handleClose}
            />

            {/* Sliding Panel */}
            <div className={`
                relative w-full md:w-[450px] max-h-[90vh] md:h-full bg-background/90 backdrop-blur-3xl 
                rounded-t-[3rem] md:rounded-[3rem] border-t md:border border-white/20 
                shadow-[0_-20px_60px_rgba(0,0,0,0.4)] pointer-events-auto overflow-hidden flex flex-col
                transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
                ${isClosing ? 'translate-y-full md:translate-x-full md:translate-y-0' : 'translate-y-0 md:translate-x-0'}
            `}>

                {/* Header/Banner Image placeholder */}
                <div className="relative h-48 md:h-64 shrink-0 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br opacity-80" style={{ backgroundImage: `linear-gradient(to bottom right, ${catColor}, ${catColor}dd)` }}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="p-8 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                            <Tag className="w-16 h-16 text-white" />
                        </div>
                    </div>

                    {/* Floating Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-6 right-6 p-3 bg-black/20 hover:bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl text-white transition-all hover:scale-110 active:scale-90"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Category Badge */}
                    <div className="absolute bottom-6 left-8 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-xs font-black text-white uppercase tracking-widest">
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'white' }}></div>
                        {event.category}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-8 py-8 md:px-10 space-y-8 custom-scrollbar">

                    {/* Title & Stats */}
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            {event.verified_count >= 10 && (
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">
                                    <Flame className="w-3 h-3" /> TRENDING
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] font-black text-green-500 uppercase tracking-widest">
                                <Users className="w-3 h-3" /> {event.verified_count} ACTIVE
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-foreground leading-[0.9] mb-4">
                            {event.title}
                        </h1>
                        {event.creator_name && (
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">SOURCED BY {event.creator_name}</p>
                        )}
                    </div>

                    {/* Time & Location Grid */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center gap-4 p-5 rounded-[2rem] bg-foreground/5 border border-foreground/5">
                            <div className="p-3 bg-primary/20 rounded-2xl">
                                <Calendar className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Date & Time</p>
                                <p className="text-sm font-bold text-foreground">
                                    {formatFullDate(event.start_time)}
                                </p>
                                <p className="text-sm font-black text-primary italic uppercase tracking-tight">
                                    {formatTime(event.start_time)} — {formatTime(event.end_time)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-5 rounded-[2rem] bg-foreground/5 border border-foreground/5">
                            <div className="p-3 bg-secondary/20 rounded-2xl">
                                <MapPin className="w-6 h-6 text-secondary" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Location</p>
                                <p className="text-sm font-bold text-foreground">York University Campus</p>
                                <p className="text-xs font-bold text-foreground/60">{event.lat.toFixed(4)}, {event.lng.toFixed(4)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground/30">Detailed Information</h3>
                        <div className="p-6 md:p-8 rounded-[2.5rem] bg-foreground/[0.03] border border-foreground/5 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full opacity-20" style={{ backgroundColor: catColor }}></div>
                            <p className="text-lg md:text-xl font-semibold italic text-foreground/80 leading-relaxed font-serif">
                                "{event.description}"
                            </p>
                        </div>
                    </div>

                    {/* Social Verification Section */}
                    <div className="p-8 rounded-[3rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 overflow-hidden relative">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground">Social Proof</h3>
                                <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Community Verification</p>
                            </div>
                            <ShieldCheck className="w-8 h-8 text-primary/40" />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex -space-x-3">
                                    {(event.verifiers || []).slice(0, 5).map((name, i) => (
                                        <div key={i} title={name} className="w-8 h-8 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary">
                                            {name.charAt(0).toUpperCase()}
                                        </div>
                                    ))}
                                    {event.verified_count > 5 && (
                                        <div className="w-8 h-8 rounded-full border-2 border-background bg-primary flex items-center justify-center text-[10px] font-black text-white">
                                            +{event.verified_count - 5}
                                        </div>
                                    )}
                                    {event.verified_count === 0 && (
                                        <div className="w-8 h-8 rounded-full border-2 border-dashed border-foreground/10 flex items-center justify-center text-[10px] font-black text-foreground/20">
                                            ?
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs font-bold text-foreground/60 uppercase tracking-tight">
                                    {event.verified_count === 0 ? 'Be the first to vouch' : `Verified by ${event.verified_count} students`}
                                </p>
                            </div>

                            <button
                                onClick={() => onVerify(event.id)}
                                disabled={hasVoted}
                                className={`w-full flex items-center justify-center gap-3 py-5 rounded-[1.5em] font-black text-sm transition-all shadow-xl active:scale-[0.98] uppercase tracking-[0.15em] ${hasVoted
                                    ? 'bg-green-500/10 text-green-500 cursor-not-allowed border border-green-500/20'
                                    : 'bg-primary text-white hover:bg-primary-dark shadow-primary/30'
                                    }`}
                            >
                                {hasVoted ? <Check className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                                {hasVoted ? 'ALREADY VERIFIED' : 'VOUCH FOR THIS'}
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-4 pb-10">
                        <button
                            onClick={handleShare}
                            className="flex items-center justify-center gap-2 py-5 rounded-[1.5rem] bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-foreground transition-all font-black text-[10px] uppercase tracking-widest active:scale-95"
                        >
                            {shareCopied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                            {shareCopied ? 'COPIED!' : 'SHARE'}
                        </button>
                        <button className="flex items-center justify-center gap-2 py-5 rounded-[1.5rem] bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-red-500/60 hover:text-red-500 transition-all font-black text-[10px] uppercase tracking-widest active:scale-95">
                            <AlertTriangle className="w-4 h-4" />
                            REPORT
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EventDetailOverlay;
