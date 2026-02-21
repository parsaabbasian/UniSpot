import React, { useState } from 'react';
import { X, Clock, Tag, MapPin, AlignLeft, ShieldCheck, AlertCircle } from 'lucide-react';

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
    const [duration, setDuration] = useState(2);
    const [submitting, setSubmitting] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

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
                    duration_hours: duration,
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

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.5)]">
                        <ShieldCheck className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tighter text-foreground italic uppercase">Post to UniSpot</h2>
                        <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">GPS Verification Required</p>
                    </div>
                </div>

                <form onSubmit={checkLocationAndSubmit} className="flex flex-col gap-6">
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-1 flex items-center gap-2 group-focus-within:text-primary transition-colors">
                                <Tag className="w-3 h-3" /> Category
                            </label>
                            <select
                                className="w-full bg-black/20 dark:bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none cursor-pointer text-foreground font-black italic shadow-inner"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="Tech">Tech</option>
                                <option value="Music">Music</option>
                                <option value="Food">Food</option>
                                <option value="Entertainment">Other</option>
                            </select>
                        </div>

                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-1 flex items-center gap-2 group-focus-within:text-primary transition-colors">
                                <Clock className="w-3 h-3" /> Duration
                            </label>
                            <select
                                className="w-full bg-black/20 dark:bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none cursor-pointer text-foreground font-black italic shadow-inner"
                                value={duration}
                                onChange={(e) => setDuration(parseInt(e.target.value))}
                            >
                                <option value={1}>1 Hour</option>
                                <option value={2}>2 Hours</option>
                                <option value={4}>4 Hours</option>
                                <option value={8}>8 Hours</option>
                            </select>
                        </div>
                    </div>

                    {locationError && (
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 animate-bounce">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p className="text-xs font-bold leading-relaxed">{locationError}</p>
                        </div>
                    )}

                    <div className="flex items-center gap-4 p-5 rounded-2xl bg-black/20 dark:bg-white/5 border border-white/10 shadow-inner group overflow-hidden relative">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 blur-2xl group-hover:bg-primary/20 transition-colors"></div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(79,70,229,0.5)]">
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
                </form>
            </div>
        </div>
    );
};

export default EventForm;
