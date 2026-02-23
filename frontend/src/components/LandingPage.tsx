import React, { useEffect, useState } from 'react';
import { ShieldCheck, X, MapPin, User, ArrowRight, CheckCircle2, Navigation } from 'lucide-react';

interface LandingPageProps {
    onEnter: (userData: { name: string, email: string }) => void;
    isDarkMode: boolean;
    onToggleTheme: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter, isDarkMode, onToggleTheme }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [showLocationGuide, setShowLocationGuide] = useState(false);
    const [showAuthForm, setShowAuthForm] = useState(false);
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleLaunch = () => {
        if (!showAuthForm) {
            setShowAuthForm(true);
            return;
        }

        if (!name.trim()) {
            setError('Please enter a nickname to continue');
            return;
        }

        // Simple entry without email verification
        onEnter({
            name: name.trim(),
            email: `${name.trim().toLowerCase().replace(/\s+/g, '')}@student.yorku.ca`
        });
    };

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    useEffect(() => {
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
        return () => {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        };
    }, []);

    return (
        <div className={`w-full min-h-screen transition-colors duration-700 ${isDarkMode ? 'bg-[#030303] text-white' : 'bg-[#fafafa] text-[#0f172a]'} selection:bg-primary/30 font-sans relative overflow-x-hidden scroll-smooth text-left`}>
            {/* Location Permission Denied Guide Overlay */}
            {showLocationGuide && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl p-6 animate-in fade-in duration-500">
                    <div className="max-w-md w-full glass-morphism p-10 rounded-[3rem] border border-white/20 shadow-[0_0_100px_rgba(79,70,229,0.2)] text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-accent"></div>
                        <button
                            onClick={() => { setShowLocationGuide(false); handleLaunch(); }}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all text-white/40 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                            <MapPin className="w-10 h-10 text-primary animate-bounce" />
                        </div>

                        <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-white">Location Blocked</h2>
                        <p className="text-white/70 text-base font-medium leading-relaxed mb-10">
                            Safari on iOS requires you to manually allow location access for verified campus posting.
                        </p>

                        <div className="space-y-4 text-left mb-10 mx-auto max-w-[280px]">
                            {[
                                { step: '1', text: 'Tap the (AA) or "Website Settings" icon in Safari bar' },
                                { step: '2', text: 'Go to Website Settings' },
                                { step: '3', text: 'Set Location to "Ask" or "Allow"' },
                            ].map((s) => (
                                <div key={s.step} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/30 text-white shrink-0">{s.step}</span>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-white/80">{s.text}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-5 rounded-[2rem] transition-all shadow-xl shadow-primary/40 active:scale-95 text-sm"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )}

            {/* Premium Nickname Form Overlay */}
            {showAuthForm && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-2xl p-4 sm:p-6 animate-in fade-in duration-500">
                    <div className="max-w-xl w-full relative group">
                        {/* Animated Glow Backdrop for the card */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-[3.5rem] blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-1000 animate-pulse"></div>

                        <div className="relative glass-morphism p-8 sm:p-12 rounded-[3.5rem] border border-white/10 shadow-2xl text-center overflow-hidden">
                            {/* Decorative Canvas-like background */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

                            <button
                                onClick={() => setShowAuthForm(false)}
                                className="absolute top-8 right-8 p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all text-white/40 hover:text-white z-10"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="relative z-10 text-center">
                                <div className="w-24 h-24 flex items-center justify-center mx-auto mb-8 transition-transform duration-700 hover:rotate-[360deg]">
                                    <img src="/logo.svg" alt="UniSpot" className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
                                </div>

                                <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-white bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                                    Welcome to UniSpot
                                </h2>
                                <p className="text-white/50 text-base sm:text-lg font-medium mb-12 max-w-sm mx-auto leading-relaxed">
                                    Your portal to York University starts here. <br />Enter a nickname to begin.
                                </p>

                                <div className="space-y-6 mb-10 text-left">
                                    <div className="relative group/input">
                                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                                            <User className="w-6 h-6 text-white/20 group-focus-within/input:text-primary transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Choose your handle..."
                                            value={name}
                                            onChange={(e) => {
                                                setName(e.target.value);
                                                setError('');
                                            }}
                                            onKeyDown={(e) => e.key === 'Enter' && handleLaunch()}
                                            className={`w-full bg-white/5 border-[1.5px] rounded-[2rem] py-6 pl-16 pr-6 text-lg font-semibold transition-all placeholder:text-white/10 text-white focus:outline-none focus:bg-white/10 ${error ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-white/5 focus:border-primary/50 focus:ring-4 focus:ring-primary/10'}`}
                                            autoFocus
                                        />
                                        {error && (
                                            <div className="absolute -bottom-7 left-6 animate-in slide-in-from-top-1">
                                                <p className="text-red-400 text-xs font-bold uppercase tracking-widest">{error}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={handleLaunch}
                                    className="w-full relative group/btn overflow-hidden rounded-[2rem]"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent opacity-100 group-hover/btn:scale-110 transition-transform duration-500"></div>
                                    <div className="relative flex items-center justify-center gap-3 bg-primary text-white font-bold py-6 rounded-[2rem] transition-all text-xl uppercase tracking-widest group-hover/btn:bg-transparent">
                                        Enter Reality <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" />
                                    </div>
                                </button>

                                <div className="mt-8 flex items-center justify-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-primary" />
                                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/20 italic">Encrypted Campus Access</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Subtle Dynamic Background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] blur-[160px] rounded-full animate-pulse transition-all duration-[3000ms] ${isDarkMode ? 'bg-primary/10 opacity-40' : 'bg-primary/5 opacity-60'}`}></div>
                <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] blur-[120px] rounded-full animate-pulse transition-all duration-[4000ms] ${isDarkMode ? 'bg-secondary/10 opacity-30' : 'bg-secondary/5 opacity-40'}`}></div>

                {/* Clean Grain Overlay */}
                <div className={`absolute inset-0 opacity-[0.04] mix-blend-overlay ${isDarkMode ? 'bg-white' : 'bg-black'} [mask-image:url("https://grainy-gradients.vercel.app/noise.svg")]`}></div>
            </div>

            {/* Modern Floating Navbar */}
            <div className={`fixed top-6 left-0 w-full flex justify-center z-[100] px-4 sm:px-6 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-32 opacity-0 pointer-events-none'}`}>
                <nav className={`w-full max-w-5xl px-6 md:px-8 py-3.5 flex justify-between items-center backdrop-blur-2xl border transition-all duration-500 rounded-[2rem] shadow-sm ${isDarkMode ? 'bg-white/[0.02] border-white/5 hover:border-white/10' : 'bg-black/[0.01] border-black/5 hover:border-black/10'}`}>
                    <div className="flex items-center gap-3 cursor-pointer">
                        <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-transform hover:scale-110 duration-500">
                            <img src="/logo.svg" alt="UniSpot Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">UniSpot</span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Theme Toggle Button */}
                        <button
                            onClick={onToggleTheme}
                            className={`p-2.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-white/5 text-yellow-400 hover:bg-white/10' : 'bg-black/5 text-primary hover:bg-black/10'}`}
                        >
                            {isDarkMode ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                            )}
                        </button>

                        <button
                            onClick={handleLaunch}
                            className="hidden sm:flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5 shadow-lg bg-primary text-white hover:bg-primary-dark hover:shadow-primary/25"
                        >
                            Get Started <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </nav>
            </div>

            {/* Main Content Sections */}
            <main className="relative z-10 pt-32 pb-20">
                {/* Hero Section */}
                <section className="min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6 text-center max-w-5xl mx-auto">

                    <div className={`inline-flex items-center gap-2.5 px-5 py-2 rounded-full text-xs font-semibold tracking-wide mb-10 transition-all border shadow-sm ${isDarkMode ? 'bg-white/5 border-white/10 text-primary hover:bg-white/10' : 'bg-primary/5 border-primary/20 text-primary hover:bg-primary/10'}`}>
                        <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </div>
                        Real-time Campus Network
                    </div>

                    <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] font-black tracking-tighter mb-8 leading-[0.9] sm:leading-[0.85] relative z-10 transition-transform duration-1000">
                        Discover your <br className="hidden sm:block" />
                        <span className="relative inline-block mt-4 sm:mt-6">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-accent animate-pulse">entire campus.</span>
                            <span className="absolute -bottom-4 left-0 w-full h-4 bg-primary/20 blur-3xl rounded-full"></span>
                        </span>
                    </h1>

                    <p className={`max-w-2xl text-lg sm:text-xl md:text-2xl font-medium tracking-wide leading-relaxed mb-12 sm:mb-16 ${isDarkMode ? 'text-white/60' : 'text-slate-600'}`}>
                        The definitive real-time map for York University. Discover events, verify safety, and connect instantly.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto mt-4">
                        <button
                            onClick={handleLaunch}
                            className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 md:py-5 rounded-full text-lg font-bold transition-all hover:scale-[1.03] active:scale-[0.98] shadow-xl bg-primary text-white hover:bg-primary-dark shadow-primary/30"
                        >
                            Explore the Map <MapPin className="w-5 h-5" />
                        </button>
                    </div>

                </section>

                {/* Features Highlights */}
                <section id="features" className="py-24 sm:py-32 px-4 sm:px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16 md:mb-24">
                            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">Designed for real student life.</h2>
                            <p className={`text-lg transition-colors ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>Everything you need to navigate York U with confidence.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                            {[
                                { icon: Navigation, title: 'Discover', desc: 'See events, study groups, and free food exactly where they are happening, live on the map.' },
                                { icon: ShieldCheck, title: 'Verified', desc: 'Every mark is verified by the student community, ensuring you only see what\'s real.' },
                                { icon: CheckCircle2, title: 'Share', desc: 'Find something interesting? Drop a pin and instantly notify others around campus.' }
                            ].map((s, i) => (
                                <div key={i} className={`flex flex-col text-left p-8 md:p-10 rounded-3xl transition-all duration-300 hover:-translate-y-2 border ${isDarkMode ? 'bg-white/[0.02] border-white/5 hover:border-primary/20' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50 hover:border-primary/20'}`}>
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-primary/10 text-primary">
                                        <s.icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="font-bold text-2xl mb-4 tracking-tight">{s.title}</h3>
                                    <p className={`text-base font-medium leading-relaxed ${isDarkMode ? 'text-white/60' : 'text-slate-600'}`}>{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <footer className={`mt-20 pt-10 border-t pb-8 px-6 text-center ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                    <div className="flex flex-col sm:flex-row items-center justify-between max-w-5xl mx-auto gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center">
                                <img src="/logo.svg" alt="UniSpot Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className={`text-sm font-bold tracking-tight ${isDarkMode ? 'text-white/90' : 'text-slate-800'}`}>UniSpot</span>
                        </div>
                        <div className="flex flex-col items-center sm:items-end gap-1">
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
                                © {new Date().getFullYear()} York University Students.
                            </p>
                            <a
                                href="https://yorkunispot.vercel.app"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-primary ${isDarkMode ? 'text-white/20' : 'text-slate-400'}`}
                            >
                                yorkunispot.vercel.app
                            </a>
                        </div>
                    </div>
                </footer>
            </main>

        </div>
    );
};

export default LandingPage;
