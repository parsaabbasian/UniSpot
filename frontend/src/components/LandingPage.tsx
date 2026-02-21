import React, { useEffect, useState } from 'react';
import { ShieldCheck, ArrowRight, Users, Star, Layout, Globe, X, MapPin, Menu, Zap, Target } from 'lucide-react';

interface LandingPageProps {
    onEnter: () => void;
    isDarkMode: boolean;
    onToggleTheme: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter, isDarkMode, onToggleTheme }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    const [showLocationGuide, setShowLocationGuide] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLaunch = () => {
        if (navigator.geolocation) {
            // Explicitly set options for iOS compatibility
            navigator.geolocation.getCurrentPosition(() => {
                onEnter();
            }, (err) => {
                console.warn('Location Error:', err);
                if (err.code === 1) { // PERMISSION_DENIED
                    setShowLocationGuide(true);
                } else {
                    onEnter(); // Still enter even if location fails (timeout/position unavailable)
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
        <div className={`w-full min-h-screen transition-colors duration-700 ${isDarkMode ? 'bg-[#030303] text-white' : 'bg-[#fafafa] text-[#1a1a1a]'} selection:bg-primary/30 font-sans relative overflow-x-hidden scroll-smooth`}>
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

                        <div className="space-y-6 text-left mb-10">
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

                    <div className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.25em] transition-colors">
                        <a href="#how-it-works" className={`${isDarkMode ? 'text-white/40 hover:text-white' : 'text-black/40 hover:text-black'} transition-all`}>Logic</a>
                        <a href="#community" className={`${isDarkMode ? 'text-white/40 hover:text-white' : 'text-black/40 hover:text-black'} transition-all`}>Community</a>
                        <a href="#access" className={`${isDarkMode ? 'text-white/40 hover:text-white' : 'text-black/40 hover:text-black'} transition-all`}>Connect</a>
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
                                Launch <ArrowRight className="w-4 h-4" />
                            </span>
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`lg:hidden p-3 rounded-2xl transition-all border ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'}`}
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </nav>

                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div className={`fixed inset-0 z-[90] lg:hidden animate-in fade-in duration-300 ${isDarkMode ? 'bg-[#030303]/95' : 'bg-[#fafafa]/95'} backdrop-blur-xl flex flex-col items-center justify-center gap-8 p-10`}>
                        <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black italic uppercase tracking-tighter hover:text-primary transition-colors">How it works</a>
                        <a href="#community" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black italic uppercase tracking-tighter hover:text-primary transition-colors">Community</a>
                        <a href="#access" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black italic uppercase tracking-tighter hover:text-primary transition-colors">Connect</a>
                        <button
                            onClick={() => { setIsMenuOpen(false); handleLaunch(); }}
                            className="mt-8 px-12 py-6 bg-primary text-white rounded-full text-xl font-black italic uppercase tracking-widest shadow-2xl"
                        >
                            Get Started
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content Sections */}
            <main className="relative z-10">
                {/* Hero Section */}
                <section className="min-h-screen flex flex-col items-center justify-center pt-32 px-6 text-center">
                    <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-[0.5em] mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 border ${isDarkMode ? 'bg-white/5 border-white/10 text-primary shadow-[0_0_20px_rgba(79,70,229,0.1)]' : 'bg-primary/5 border-primary/20 text-primary shadow-sm'}`}>
                        <Globe className="w-4 h-4 animate-spin-slow" /> York University's Pulse
                    </div>

                    <div className="relative group max-w-6xl">
                        <div className={`absolute inset-0 blur-[120px] transition-all duration-1000 ${isDarkMode ? 'bg-primary/20 group-hover:bg-primary/30' : 'bg-primary/10 group-hover:bg-primary/15'}`}></div>
                        <h1 className={`text-[12vw] md:text-[8vw] font-black tracking-tighter mb-10 leading-[0.85] italic uppercase select-none relative z-10 antialiased ${isDarkMode ? 'text-white' : 'text-black'}`}>
                            UNITE THE<br />
                            <span className="text-primary italic relative inline-block">
                                CAMPUS
                                <span className={`absolute -bottom-2 md:-bottom-4 left-0 w-full h-1.5 md:h-2 rounded-full blur-sm ${isDarkMode ? 'bg-primary/40' : 'bg-primary/30'}`}></span>
                            </span>.
                        </h1>
                        {/* Subtle Horizontal Scan/Tech Line */}
                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent shadow-[0_0_20px_rgba(79,70,229,0.4)] animate-scan z-20 pointer-events-none opacity-20"></div>
                    </div>

                    <p className={`max-w-xl text-sm md:text-lg font-black uppercase tracking-[0.2em] mb-16 px-6 transition-colors duration-1000 ${isDarkMode ? 'text-white/40' : 'text-black/30'}`}>
                        The live pulse of York University. <br className="hidden md:block" /> Discover, verify, and drop updates in real-time.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-8 w-full sm:w-auto px-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                        <button
                            onClick={handleLaunch}
                            className={`group relative px-12 md:px-20 py-6 md:py-8 rounded-[2.5rem] text-lg md:text-2xl font-black italic tracking-tighter overflow-hidden transition-all hover:scale-[1.05] active:scale-[0.98] shadow-2xl ${isDarkMode ? 'bg-primary text-white shadow-primary/30' : 'bg-primary text-white shadow-primary/40'}`}
                        >
                            <div className="absolute inset-x-0 bottom-0 h-0 bg-white/20 group-hover:h-full transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]"></div>
                            <span className="relative flex items-center justify-center gap-5">
                                ENTER ENGINE <Layout className="w-6 h-6 md:w-8 md:h-8" />
                            </span>
                        </button>
                    </div>

                    <div className={`mt-16 flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest opacity-30 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className={`w-10 h-10 rounded-full border-4 ${isDarkMode ? 'border-[#030303] bg-white/10' : 'border-[#fafafa] bg-black/10'} flex items-center justify-center backdrop-blur-sm`}>
                                    <Users className="w-4 h-4" />
                                </div>
                            ))}
                        </div>
                        Join 2,000+ Students
                    </div>
                </section >

                {/* How it Works */}
                < section id="how-it-works" className={`py-40 md:py-60 relative overflow-hidden px-6`}>
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-24">
                            <h2 className="text-[12vw] md:text-8xl font-black italic tracking-tighter uppercase mb-8 leading-[0.8] antialiased">HOW IT WORKS</h2>
                            <p className={`text-base md:text-xl font-bold uppercase tracking-[0.2em] ${isDarkMode ? 'text-primary' : 'text-primary'}`}>The simple campus logic.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { icon: Target, title: 'DISCOVER', desc: 'See live markers on the map.', step: '01' },
                                { icon: ShieldCheck, title: 'VERIFY', desc: 'Confirm markers in real-time.', step: '02' },
                                { icon: Zap, title: 'DROP', desc: 'Pin your own live updates.', step: '03' }
                            ].map((s, i) => (
                                <div key={i} className={`p-10 md:p-14 rounded-[3.5rem] border transition-all duration-500 group relative overflow-hidden flex flex-col items-center text-center ${isDarkMode ? 'bg-white/[0.02] border-white/5 hover:border-primary/40' : 'bg-white border-black/5 hover:border-primary/30 shadow-sm'}`}>
                                    <div className="absolute top-8 right-10 text-6xl md:text-8xl font-black italic opacity-5 transition-opacity group-hover:opacity-10">{s.step}</div>
                                    <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-10 transition-all duration-500 shadow-lg ${isDarkMode ? 'bg-primary/10 text-primary' : 'bg-primary text-white'}`}>
                                        <s.icon className="w-12 h-12" />
                                    </div>
                                    <h3 className="font-black text-4xl mb-6 italic uppercase tracking-tighter">{s.title}</h3>
                                    <p className={`text-sm md:text-base font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section >

                {/* Community Section */}
                < section id="community" className="py-40 md:py-60 flex flex-col items-center justify-center px-6 relative overflow-hidden" >
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] h-[180%] rounded-full blur-[140px] -skew-y-12 transition-all duration-1000 ${isDarkMode ? 'bg-primary/5' : 'bg-primary/[0.03]'}`}></div>
                    <div className={`w-32 h-32 md:w-48 md:h-48 rounded-[3rem] bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-16 shadow-[0_0_80px_rgba(79,70,229,0.3)] rotate-3 animate-pulse`}>
                        <Users className="w-16 h-16 md:w-24 md:h-24 text-white" />
                    </div>
                    <h2 className={`text-[12vw] md:text-[9vw] font-black italic tracking-tighter uppercase mb-16 text-center leading-[0.8] antialiased ${isDarkMode ? 'text-white' : 'text-black'}`}>THE PACK <br />IS WAITING.</h2>
                    <div className="flex flex-wrap gap-6 md:gap-14 justify-center max-w-6xl px-4">
                        {['Scott Library', 'Vari Hall', 'The Village', 'Lassonde', 'Stong College', 'York Lanes'].map((loc, i) => (
                            <div key={i} className="flex items-center gap-6">
                                <span className={`text-xl md:text-5xl font-black italic uppercase transition-all duration-500 hover:scale-110 cursor-default ${isDarkMode ? 'text-white/20 hover:text-primary' : 'text-black/20 hover:text-primary'}`}>{loc}</span>
                                {i < 5 && <span className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-primary/40 animate-pulse"></span>}
                            </div>
                        ))}
                    </div>
                </section >

                {/* Final CTA */}
                < section id="access" className="py-32 md:py-48 px-6 relative overflow-hidden" >
                    <div className={`max-w-6xl mx-auto p-12 md:p-32 rounded-[4rem] border relative overflow-hidden group shadow-2xl transition-all duration-1000 ${isDarkMode ? 'bg-gradient-to-br from-[#111] to-black border-white/5' : 'bg-white border-black/5 shadow-primary/20'}`}>
                        <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] transition-all duration-1000 ${isDarkMode ? 'bg-primary/10 -translate-y-1/2 translate-x-1/2' : 'bg-primary/5 -translate-y-1/2 translate-x-1/2'}`}></div>

                        <div className="relative z-10 text-center flex flex-col items-center">
                            <Star className="w-16 h-16 md:w-24 md:h-24 text-primary mb-12 animate-spin-slow" />
                            <h2 className="text-4xl md:text-7xl font-black italic tracking-tighter mb-12 uppercase leading-[0.9]">READY FOR THE <br />REAL EXPERIENCE?</h2>

                            <button
                                onClick={handleLaunch}
                                className={`w-full sm:w-auto px-16 md:px-24 py-8 md:py-10 rounded-full text-xl md:text-3xl font-black italic uppercase transition-all duration-500 shadow-2xl active:scale-[0.95] ${isDarkMode ? 'bg-white text-black hover:bg-white/90 hover:shadow-white/20' : 'bg-primary text-white hover:bg-primary-dark hover:shadow-primary/40'}`}
                            >
                                START SCANNING
                            </button>

                            <p className={`mt-12 text-sm md:text-lg font-black uppercase tracking-[0.4em] transition-opacity duration-1000 ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>Official Platform v1.2</p>
                        </div>
                    </div>

                    <footer className={`mt-40 md:mt-60 pb-16 flex flex-col items-center gap-10 transition-opacity duration-1000 ${isDarkMode ? 'opacity-30' : 'opacity-50'}`}>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center p-2">
                                <img src="/logo.svg" alt="UniSpot Logo" className="w-full h-full object-contain brightness-0 invert" />
                            </div>
                            <span className="text-xl md:text-2xl font-black italic tracking-tighter uppercase">UNISPOT</span>
                        </div>
                        <div className="flex flex-col items-center gap-4">
                            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.6em] text-center max-w-xs leading-loose">Engineered with precision for the Lions of York University.</p>
                            <div className="flex gap-10 text-[9px] font-black uppercase tracking-[0.2em] mt-4">
                                <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                                <a href="#" className="hover:text-primary transition-colors">Terms</a>
                                <a href="#" className="hover:text-primary transition-colors">Github</a>
                            </div>
                        </div>
                    </footer>
                </section >
            </main >

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
        </div >
    );
};

export default LandingPage;
