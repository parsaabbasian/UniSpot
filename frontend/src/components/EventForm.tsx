import React, { useState } from 'react';
import { X, Clock, Tag, MapPin, AlignLeft, ShieldCheck, AlertCircle, ChevronDown, Check, ChevronUp, Utensils, BookOpen, Users, Cpu, Music, Dumbbell, ShieldAlert, ShoppingBag } from 'lucide-react';

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
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);

    const categories = [
        { id: 'Food', name: 'Food & Drink', icon: Utensils },
        { id: 'Study', name: 'Study Groups', icon: BookOpen },
        { id: 'Social', name: 'Social & Meet', icon: Users },
        { id: 'Tech', name: 'Technology', icon: Cpu },
        { id: 'Music', name: 'Music & Arts', icon: Music },
        { id: 'Sports', name: 'Sports & Gym', icon: Dumbbell },
        { id: 'Safety', name: 'Campus Safety', icon: ShieldAlert },
        { id: 'Sale', name: 'Sale & Free', icon: ShoppingBag },
    ];

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
            (err) => {
                console.error('Geo Error:', err);
                if (err.code === 1) {
                    setLocationError("Location Blocked. Tap (AA) in Safari bar -> Website Settings -> Location -> Set to 'Allow'.");
                } else {
                    setLocationError("Please enable location access in Safari/iOS Settings to verify you are at York U.");
                }
                setIsVerifying(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
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
                setIsSuccess(true);
                onCreated();
                setTimeout(() => {
                    onClose();
                }, 2000);
            } else {
                const data = await response.json();
                setSubmitError(data.error || 'The engine failed to process your mark.');
            }
        } catch (error) {
            console.error('Failed to create event:', error);
            setSubmitError('Connection failure. Is the engine offline?');
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
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ${isSuccess ? 'bg-green-500 shadow-green-500/40 rotate-[360deg]' : 'bg-gradient-to-br from-primary to-accent shadow-primary/40'}`}>
                        {isSuccess ? <Check className="w-8 h-8 text-white" /> : <ShieldCheck className="w-8 h-8 text-white animate-pulse" />}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tighter text-foreground italic uppercase">
                            {isSuccess ? 'Mark Dropped!' : 'Post to UniSpot'}
                        </h2>
                        <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">
                            {isSuccess ? 'Live on the map' : 'GPS Verification Required'}
                        </p>
                    </div>
                </div>

                {isSuccess ? (
                    <div className="py-12 flex flex-col items-center justify-center animate-in zoom-in-90 duration-500">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-green-500 blur-2xl opacity-20 animate-pulse"></div>
                            <Check className="w-20 h-20 text-green-500 relative z-10" />
                        </div>
                        <p className="text-foreground/60 text-sm font-bold uppercase tracking-widest text-center">
                            Verification successful. <br /> Your marking is now active.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={checkLocationAndSubmit} className="flex flex-col gap-6 relative">
                        <div className="space-y-6">
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

                        {/* Selection Group: Category & Duration */}
                        <div className="grid grid-cols-2 gap-4 relative z-20">
                            {/* Category Selector */}
                            <div className="space-y-2 relative">
                                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-1 flex items-center gap-2">
                                    <Tag className="w-3 h-3 text-primary" /> Category
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                    className={`w-full bg-black/40 dark:bg-white/5 border rounded-2xl px-5 py-4 flex items-center justify-between transition-all group ${isCategoryOpen ? 'border-primary shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-white/10 hover:border-white/20'}`}
                                >
                                    <span className="text-sm font-black italic uppercase text-foreground">{category}</span>
                                    <ChevronDown className={`w-4 h-4 text-primary transition-transform duration-500 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isCategoryOpen && (
                                    <>
                                        <div className="fixed inset-0 z-[60]" onClick={() => setIsCategoryOpen(false)} />
                                        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#0d0d12]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] py-3 overflow-hidden z-[70] animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="max-h-60 overflow-y-auto scrollbar-hide">
                                                {categories.map((cat) => (
                                                    <button
                                                        key={cat.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setCategory(cat.id);
                                                            setIsCategoryOpen(false);
                                                        }}
                                                        className={`w-full px-6 py-4 text-[10px] font-black uppercase italic flex items-center justify-between transition-all ${category === cat.id ? 'bg-primary text-white' : 'text-foreground/60 hover:bg-white/5 hover:text-white'}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <cat.icon className={`w-4 h-4 ${category === cat.id ? 'text-white' : 'text-primary'}`} />
                                                            {cat.name}
                                                        </div>
                                                        {category === cat.id && <Check className="w-4 h-4" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Duration Input Field with 'Scroll' Icons */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-1 flex items-center gap-2">
                                    <Clock className="w-3 h-3 text-primary" /> End Time
                                </label>
                                <div className="flex gap-3">
                                    {/* Hours Scroll Selector */}
                                    <div className="flex-1 bg-black/40 dark:bg-white/5 border border-white/10 rounded-2xl p-2 flex flex-col items-center group transition-all hover:border-primary/30">
                                        <button
                                            type="button"
                                            onClick={() => setDurationHours(Math.min(24, durationHours + 1))}
                                            className="w-full py-1 text-foreground/20 hover:text-primary transition-colors flex justify-center"
                                        >
                                            <ChevronUp className="w-4 h-4" />
                                        </button>
                                        <div className="relative flex items-center justify-center w-full py-1">
                                            <input
                                                type="number"
                                                className="w-full bg-transparent border-none text-center text-lg font-black italic text-foreground focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                value={durationHours}
                                                onChange={(e) => setDurationHours(Math.max(0, Math.min(24, parseInt(e.target.value) || 0)))}
                                            />
                                            <span className="absolute right-2 text-[7px] font-black text-foreground/20 pointer-events-none uppercase">HRS</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setDurationHours(Math.max(0, durationHours - 1))}
                                            className="w-full py-1 text-foreground/20 hover:text-primary transition-colors flex justify-center"
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Minutes Scroll Selector */}
                                    <div className="flex-1 bg-black/40 dark:bg-white/5 border border-white/10 rounded-2xl p-2 flex flex-col items-center group transition-all hover:border-primary/30">
                                        <button
                                            type="button"
                                            onClick={() => setDurationMinutes(Math.min(59, durationMinutes + 5))}
                                            className="w-full py-1 text-foreground/20 hover:text-primary transition-colors flex justify-center"
                                        >
                                            <ChevronUp className="w-4 h-4" />
                                        </button>
                                        <div className="relative flex items-center justify-center w-full py-1">
                                            <input
                                                type="number"
                                                className="w-full bg-transparent border-none text-center text-lg font-black italic text-foreground focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                value={durationMinutes}
                                                onChange={(e) => setDurationMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                                            />
                                            <span className="absolute right-2 text-[7px] font-black text-foreground/20 pointer-events-none uppercase">MIN</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setDurationMinutes(Math.max(0, durationMinutes - 5))}
                                            className="w-full py-1 text-foreground/20 hover:text-primary transition-colors flex justify-center"
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 mt-2">
                            {locationError && (
                                <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 animate-bounce">
                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <p className="text-xs font-bold leading-relaxed">{locationError}</p>
                                </div>
                            )}

                            {submitError && (
                                <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500">
                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <p className="text-xs font-bold leading-relaxed">{submitError}</p>
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
                )}
            </div>
        </div>
    );
};

export default EventForm;
