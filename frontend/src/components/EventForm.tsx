import React, { useState } from 'react';
import { X, Clock, Tag, MapPin, AlignLeft, ShieldCheck, AlertCircle, ChevronDown, Check } from 'lucide-react';

interface EventFormProps {
    lat: number;
    lng: number;
    onClose: () => void;
    onCreated: () => void;
}

const YORK_U_COORDS = { lat: 43.7735, lng: -79.5019 };
const MAX_DISTANCE_KM = 2.5; // Allow posting within 2.5km of campus centre

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

const EventForm: React.FC<EventFormProps> = ({ lat, lng, onClose, onCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Tech');
    const [durationHours, setDurationHours] = useState(2);
    const [durationMinutes, setDurationMinutes] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isDurationOpen, setIsDurationOpen] = useState(false);

    const categories = ['Tech', 'Music', 'Food', 'Entertainment'];
    const hourOptions = [0, 1, 2, 3, 4, 6, 8, 12];
    const minuteOptions = [0, 15, 30, 45];

    const checkLocationAndSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsVerifying(true);
        setLocationError(null);

        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser.");
            setIsVerifying(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                const distance = calculateDistance(userLat, userLng, YORK_U_COORDS.lat, YORK_U_COORDS.lng);

                if (distance > MAX_DISTANCE_KM) {
                    setLocationError(`You appear to be too far from York U (${distance.toFixed(1)}km away). You must be on campus to post.`);
                    setIsVerifying(false);
                } else {
                    await handleSubmit();
                }
            },
            () => {
                setLocationError("Please enable location access to verify you are at York U.");
                setIsVerifying(false);
            },
            { enableHighAccuracy: true }
        );
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
            const response = await fetch(`${apiUrl}/api/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    category,
                    lat,
                    lng,
                    duration_hours: durationHours + (durationMinutes / 60),
                }),
            });
            if (response.ok) {
                onCreated();
                onClose();
            }
        } catch (error) {
            console.error('Failed to create event:', error);
        } finally {
            setSubmitting(false);
            setIsVerifying(false);
        }
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300 font-sans">
            <div className="w-full max-w-md glass-morphism rounded-[2.5rem] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh] border border-white/20 before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-br before:from-primary/20 before:via-transparent before:to-secondary/20 before:rounded-[2.5rem] before:animate-spin-slow">
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 p-2 rounded-xl bg-white/5 hover:bg-white/20 transition-all text-foreground/40 hover:text-foreground hover:rotate-90 active:scale-90"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-4 mb-8 transition-opacity duration-300" style={{ opacity: isDurationOpen ? 0 : 1 }}>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                        <ShieldCheck className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tighter text-foreground italic uppercase">Post to UniSpot</h2>
                        <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">GPS Verification Required</p>
                    </div>
                </div>

                <form onSubmit={checkLocationAndSubmit} className="flex flex-col gap-6 relative">
                    <div className={`space-y-6 transition-all duration-500 ${isDurationOpen ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-1 flex items-center gap-2 group-focus-within:text-primary transition-colors">
                                <Tag className="w-3 h-3" /> Event Title
                            </label>
                            <input
                                autoFocus
                                required
                                placeholder="What's happening?"
                                className="w-full bg-black/20 dark:bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-foreground/20 text-foreground font-black italic shadow-inner"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-1 flex items-center gap-2 group-focus-within:text-primary transition-colors">
                                <AlignLeft className="w-3 h-3" /> Description
                            </label>
                            <textarea
                                placeholder="Add some details..."
                                rows={3}
                                className="w-full bg-black/20 dark:bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-foreground/20 text-foreground resize-none font-medium shadow-inner"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 relative">
                        <div className={`space-y-2 relative transition-all duration-500 ${isDurationOpen ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
                            <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-1 flex items-center gap-2">
                                <Tag className="w-3 h-3" /> Category
                            </label>
                            <div
                                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                className="w-full bg-black/40 dark:bg-white/5 border border-white/10 rounded-2xl px-6 py-4 flex items-center justify-between cursor-pointer group hover:border-primary/50 transition-all shadow-inner"
                            >
                                <span className="text-sm font-black italic uppercase text-foreground">{category}</span>
                                <ChevronDown className={`w-4 h-4 text-primary transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                            </div>

                            {isCategoryOpen && (
                                <>
                                    <div className="fixed inset-0 z-[60]" onClick={() => setIsCategoryOpen(false)} />
                                    <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#12121a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-2 overflow-hidden z-[70] animate-in fade-in slide-in-from-top-2 duration-200">
                                        {categories.map((cat) => (
                                            <div
                                                key={cat}
                                                onClick={() => {
                                                    setCategory(cat);
                                                    setIsCategoryOpen(false);
                                                }}
                                                className={`px-6 py-3 text-xs font-black uppercase italic cursor-pointer flex items-center justify-between transition-all ${category === cat ? 'bg-primary text-white' : 'text-foreground/70 hover:bg-white/5 hover:text-white'}`}
                                            >
                                                {cat}
                                                {category === cat && <Check className="w-3 h-3" />}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="space-y-2 relative">
                            <label className={`text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-1 flex items-center gap-2 transition-all duration-500 ${isDurationOpen ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                                <Clock className="w-3 h-3" /> Duration
                            </label>
                            <div
                                onClick={() => setIsDurationOpen(!isDurationOpen)}
                                className="w-full bg-black/40 dark:bg-white/5 border border-white/10 rounded-2xl px-6 py-4 flex items-center justify-between cursor-pointer group hover:border-primary/50 transition-all shadow-inner"
                            >
                                <span className="text-sm font-black italic uppercase text-foreground">
                                    {durationHours}h {durationMinutes}m
                                </span>
                                <ChevronDown className={`w-4 h-4 text-primary transition-transform duration-300 ${isDurationOpen ? 'rotate-180' : ''}`} />
                            </div>

                            {isDurationOpen && (
                                <>
                                    <div className="fixed inset-0 z-[60]" onClick={() => setIsDurationOpen(false)} />
                                    <div className="absolute inset-0 bg-[#0a0a0f] z-[70] flex flex-col p-8 md:p-12 animate-in fade-in zoom-in-95 duration-500 rounded-[2.5rem] mt-[-2px] ml-[-2px] mr-[-2px] mb-[-2px] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)]">
                                        <div className="flex items-center justify-between mb-8 md:mb-12">
                                            <div>
                                                <h3 className="text-2xl md:text-3xl font-black italic uppercase text-white tracking-widest leading-none mb-1">Set Duration</h3>
                                                <p className="text-[10px] md:text-xs text-primary font-black uppercase tracking-[0.5em] opacity-80 italic">Broadcast Timeline</p>
                                            </div>
                                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-primary/20 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                                                <Clock className="w-7 h-7 md:w-8 md:h-8 text-primary animate-pulse" />
                                            </div>
                                        </div>

                                        <div className="flex-1 flex flex-col justify-center gap-10 md:gap-16">
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-4 mb-2">
                                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                                                    <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-foreground/40 italic">Hours Selection</p>
                                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                                                </div>
                                                <div className="grid grid-cols-4 gap-3 md:gap-4">
                                                    {hourOptions.map((h) => (
                                                        <div
                                                            key={h}
                                                            onClick={() => setDurationHours(h)}
                                                            className={`py-4 md:py-5 rounded-2xl text-center text-xs md:text-sm font-black tracking-tighter transition-all cursor-pointer ${durationHours === h ? 'bg-primary text-white shadow-[0_0_40px_rgba(99,102,241,0.6)] scale-110 active:scale-95 border border-white/20' : 'bg-white/5 text-foreground/30 border border-white/5 hover:bg-white/10 hover:text-white'}`}
                                                        >
                                                            {h}H
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="flex items-center gap-4 mb-2">
                                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                                                    <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-foreground/40 italic">Minutes Selection</p>
                                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                                                </div>
                                                <div className="grid grid-cols-4 gap-3 md:gap-4">
                                                    {minuteOptions.map((m) => (
                                                        <div
                                                            key={m}
                                                            onClick={() => setDurationMinutes(m)}
                                                            className={`py-4 md:py-5 rounded-2xl text-center text-xs md:text-sm font-black tracking-tighter transition-all cursor-pointer ${durationMinutes === m ? 'bg-primary text-white shadow-[0_0_40px_rgba(99,102,241,0.6)] scale-110 active:scale-95 border border-white/20' : 'bg-white/5 text-foreground/30 border border-white/5 hover:bg-white/10 hover:text-white'}`}
                                                        >
                                                            {m}M
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-10">
                                            <button
                                                type="button"
                                                onClick={() => setIsDurationOpen(false)}
                                                className="w-full py-6 md:py-8 bg-gradient-to-r from-primary via-indigo-600 to-accent text-white font-black uppercase italic rounded-3xl transition-all shadow-[0_20px_50px_rgba(99,102,241,0.4)] hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4 text-sm md:text-base border border-white/20 group"
                                            >
                                                <Check className="w-6 h-6 group-hover:scale-125 transition-transform" />
                                                Lock Event Timeline
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className={`space-y-6 transition-all duration-500 ${isDurationOpen ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
                        {locationError && (
                            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 animate-bounce">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <p className="text-xs font-bold leading-relaxed">{locationError}</p>
                            </div>
                        )}

                        <div className="flex items-center gap-4 p-5 rounded-2xl bg-black/20 dark:bg-white/5 border border-white/10 shadow-inner group overflow-hidden relative">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 blur-2xl group-hover:bg-primary/20 transition-colors"></div>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                                <MapPin className="w-5 h-5 text-white animate-bounce" />
                            </div>
                            <div className="text-xs relative z-10">
                                <p className="text-primary uppercase font-black tracking-widest">Locked Location</p>
                                <p className="text-foreground/80 font-black italic">{lat.toFixed(5)}, {lng.toFixed(5)}</p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || isVerifying}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-black py-5 rounded-[2rem] transition-all shadow-xl shadow-primary/30 disabled:opacity-50 mt-2 active:scale-95 flex items-center justify-center gap-2"
                        >
                            {isVerifying ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Checking Campus Location...
                                </>
                            ) : submitting ? (
                                'Synchronizing...'
                            ) : (
                                'Authorize & Post'
                            )}
                        </button>
                        <p className="text-[10px] text-center text-foreground/30 font-bold uppercase tracking-widest">Only York U students can post</p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EventForm;
