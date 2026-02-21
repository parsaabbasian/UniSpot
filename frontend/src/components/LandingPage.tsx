import React, { useEffect, useState } from 'react';
import { ShieldCheck, Users, Globe, X, MapPin, Zap, Target, Rocket, Cpu } from 'lucide-react';

interface LandingPageProps {
    onEnter: () => void;
    isDarkMode: boolean;
    onToggleTheme: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter, isDarkMode, onToggleTheme }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [showLocationGuide, setShowLocationGuide] = useState(false);

    const handleLaunch = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(() => {
                onEnter();
            }, (err) => {
                console.warn('Location Error:', err);
                if (err.code === 1) { // PERMISSION_DENIED
                    setShowLocationGuide(true);
                } else {
                    onEnter();
                }
            }, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            });
        } else {
            onEnter();
        }
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
        <div className={`w-full min-h-screen transition-colors duration-700 ${isDarkMode ? 'bg-[#030303] text-white' : 'bg-[#fafafa] text-[#1a1a1a]'} selection:bg-primary/30 font-sans relative overflow-x-hidden scroll-smooth text-left`}>
            {/* Location Permission Denied Guide Overlay */}
            {showLocationGuide && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl p-6 animate-in fade-in duration-500">
                    <div className="max-w-md w-full glass-morphism p-10 rounded-[3rem] border border-white/20 shadow-[0_0_100px_rgba(79,70,229,0.2)] text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-accent"></div>
                        <button
                            onClick={() => { setShowLocationGuide(false); onEnter(); }}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all text-white/40 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                            <MapPin className="w-10 h-10 text-primary animate-bounce" />
                        </div>

                        <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4 text-white">Location Blocked</h2>
                        <p className="text-white/60 text-sm font-medium leading-relaxed mb-10">
                            Safari on iOS requires you to manually allow location access for verified campus posting.
                        </p>

                        <div className="space-y-6 text-left mb-10 mx-auto max-w-[280px]">
                            {[
                                { step: '1', text: 'Tap the (AA) or "Website Settings" icon in Safari bar' },
                                { step: '2', text: 'Go to Website Settings' },
                                { step: '3', text: 'Set Location to "Ask" or "Allow"' },
                            ].map((s) => (
                                <div key={s.step} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-black shadow-lg shadow-primary/30 text-white shrink-0">{s.step}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">{s.text}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-black py-6 rounded-[2rem] transition-all shadow-xl shadow-primary/40 active:scale-95 text-xs uppercase tracking-widest"
                        >
                            Refreshed Settings? Try Again
                        </button>
                    </div>
                </div>
            )}

            {/* Dynamic Background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className={`absolute top-[-10%] left-[-10%] w-[80%] h-[70%] blur-[180px] rounded-full animate-pulse transition-all duration-[3000ms] ${isDarkMode ? 'bg-primary/10 opacity-40' : 'bg-primary/5 opacity-60'}`}></div>
                <div className={`absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] blur-[120px] rounded-full animate-pulse transition-all duration-[4000ms] ${isDarkMode ? 'bg-secondary/15 opacity-30' : 'bg-secondary/10 opacity-40'}`}></div>
                <div className={`absolute inset-0 opacity-10 contrast-125 mix-blend-overlay ${isDarkMode ? 'bg-[url("https://grainy-gradients.vercel.app/noise.svg")]' : 'bg-[url("https://grainy-gradients.vercel.app/noise.svg")] grayscale invert'}`}></div>

                {/* Visual Grid Layer */}
                <div className={`absolute inset-0 opacity-[0.03] ${isDarkMode ? 'bg-[radial-gradient(#ffffff_2px,transparent_2px)]' : 'bg-[radial-gradient(#000000_2px,transparent_2px)]'} [background-size:60px_60px]`}></div>
            </div>

            {/* Modern Floating Navbar */}
            <div className={`fixed top-6 left-0 w-full flex justify-center z-[100] px-6 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-32 opacity-0 pointer-events-none'}`}>
                <nav className={`w-full max-w-5xl px-6 md:px-10 py-4 flex justify-between items-center backdrop-blur-3xl border transition-all duration-500 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] group ${isDarkMode ? 'bg-white/[0.03] border-white/10 hover:border-primary/40' : 'bg-black/[0.02] border-black/5 hover:border-primary/30'}`}>
                    <div className="flex items-center gap-4 cursor-pointer">
                        <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.2)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 overflow-hidden bg-primary p-2">
                            <img src="/logo.svg" alt="UniSpot Logo" className="w-full h-full object-contain brightness-0 invert" />
                        </div>
                        <span className="text-xl md:text-2xl font-black tracking-tighter italic bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent uppercase">UNISPOT</span>
                    </div>

                    <div className="flex items-center gap-3 md:gap-6">
                        {/* Theme Toggle Button */}
                        <button
                            onClick={onToggleTheme}
                            className={`p-3 rounded-2xl transition-all duration-500 active:scale-90 border ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-yellow-400' : 'bg-black/5 border-black/10 hover:bg-black/10 text-primary'}`}
                        >
                            {isDarkMode ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                            )}
                        </button>

                        <button
                            onClick={handleLaunch}
                            className={`hidden sm:flex group relative px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl overflow-hidden ${isDarkMode ? 'bg-white text-black hover:shadow-primary/20' : 'bg-primary text-white hover:shadow-primary/40'}`}
                        >
                            <span className="flex items-center gap-2 relative z-10 transition-colors group-hover:translate-x-1">
                                Launch <Rocket className="w-4 h-4" />
                            </span>
                        </button>
                    </div>
                </nav>
            </div>

            {/* Main Content Sections */}
            <main className="relative z-10">
                {/* Hero Section */}
                <section className="min-h-screen flex flex-col items-center justify-center pt-32 px-6 text-center">
                    <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-[0.5em] mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 border ${isDarkMode ? 'bg-white/5 border-white/10 text-primary shadow-[0_0_20px_rgba(79,70,229,0.1)]' : 'bg-primary/5 border-primary/20 text-primary shadow-sm'}`}>
                        <Globe className="w-4 h-4 animate-spin-slow" /> LIVE CAMPUS FEED
                    </div>

                    <div className="relative group max-w-6xl">
                        <div className={`absolute inset-0 blur-[120px] transition-all duration-1000 ${isDarkMode ? 'bg-primary/20 group-hover:bg-primary/30' : 'bg-primary/10 group-hover:bg-primary/15'}`}></div>
                        <h1 className={`text-[12vw] md:text-[8vw] font-black tracking-tighter mb-10 leading-[0.85] italic uppercase select-none relative z-10 antialiased ${isDarkMode ? 'text-white' : 'text-black'}`}>
                            COMMAND THE<br />
                            <span className="text-primary italic relative inline-block">
                                CAMPUS
                                <span className={`absolute -bottom-2 md:-bottom-4 left-0 w-full h-1.5 md:h-2 rounded-full blur-sm ${isDarkMode ? 'bg-primary/40' : 'bg-primary/30'}`}></span>
                            </span>.
                        </h1>
                        {/* Subtle Horizontal Scan/Tech Line */}
                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent shadow-[0_0_20px_rgba(79,70,229,0.4)] animate-scan z-20 pointer-events-none opacity-20"></div>
                    </div>

                    <p className={`max-w-xl text-sm md:text-lg font-black uppercase tracking-[0.2em] mb-16 px-6 transition-colors duration-1000 ${isDarkMode ? 'text-white/40' : 'text-black/30'}`}>
                        The definitive real-time resource for York University. <br className="hidden md:block" /> Discover, verify, and broadcast updates instantly.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-8 w-full sm:w-auto px-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                        <button
                            onClick={handleLaunch}
                            className={`group relative px-12 md:px-20 py-6 md:py-8 rounded-[2.5rem] text-lg md:text-2xl font-black italic tracking-tighter overflow-hidden transition-all hover:scale-[1.05] active:scale-[0.98] shadow-2xl ${isDarkMode ? 'bg-primary text-white shadow-primary/30' : 'bg-primary text-white shadow-primary/40'}`}
                        >
                            <div className="absolute inset-x-0 bottom-0 h-0 bg-white/20 group-hover:h-full transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]"></div>
                            <span className="relative flex items-center justify-center gap-5 uppercase">
                                INITIALIZE SYSTEM <Cpu className="w-6 h-6 md:w-8 md:h-8" />
                            </span>
                        </button>
                    </div>

                    <div className={`mt-16 flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest opacity-30 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className={`w-10 h-10 rounded-full border-4 ${isDarkMode ? 'border-primary/10 bg-white/10' : 'border-primary/10 bg-black/10'} flex items-center justify-center backdrop-blur-sm`}>
                                    <Users className="w-4 h-4" />
                                </div>
                            ))}
                        </div>
                        2,400+ ACTIVE USERS
                    </div>
                </section>

                {/* How it Works / Logic */}
                <section id="how-it-works" className={`py-32 md:py-48 relative overflow-hidden px-6 text-center`}>
                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {[
                                { icon: Target, title: 'SCAN', desc: 'Live geospatial tracking.', step: '01' },
                                { icon: ShieldCheck, title: 'PROOF', desc: 'Crowdsourced consensus.', step: '02' },
                                { icon: Zap, title: 'SIGNAL', desc: 'Instant data deployment.', step: '03' }
                            ].map((s, i) => (
                                <div key={i} className="flex flex-col items-center group">
                                    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8 transition-all duration-500 shadow-xl ${isDarkMode ? 'bg-white/5 text-primary border border-white/10 group-hover:bg-primary group-hover:text-white' : 'bg-black/5 text-primary border border-black/5 group-hover:bg-primary group-hover:text-white'}`}>
                                        <s.icon className="w-10 h-10" />
                                    </div>
                                    <h3 className="font-black text-2xl mb-4 italic uppercase tracking-tighter">{s.title}</h3>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <footer className={`py-20 flex flex-col items-center gap-6 transition-opacity duration-1000 ${isDarkMode ? 'opacity-20' : 'opacity-30'}`}>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-primary p-1.5 min-w-[24px]">
                            <img src="/logo.svg" alt="UniSpot Logo" className="w-full h-full object-contain brightness-0 invert" />
                        </div>
                        <span className="text-sm font-black italic tracking-tighter uppercase">UNISPOT v1.2</span>
                    </div>
                    <p className="text-[8px] font-black uppercase tracking-[0.5em]">YORK UNIVERSITY • LIONS ONLY</p>
                </footer>
            </main>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(2deg); }
                }
                .animate-float {
                    animation: float 8s ease-in-out infinite;
                }
                .animate-scan {
                    animation: scan 4s linear infinite;
                }
                @keyframes scan {
                    0% { transform: translateY(-100%) opacity(0); }
                    50% { opacity(0.5); }
                    100% { transform: translateY(500%) opacity(0); }
                }
            `}</style>
        </div>
    );
};

export default LandingPage;
