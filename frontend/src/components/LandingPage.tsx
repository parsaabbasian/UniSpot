import React, { useEffect } from 'react';
import { ShieldCheck, ArrowRight, MapPin, Users, Star, Layout, Globe, Smartphone, Coffee } from 'lucide-react';

interface LandingPageProps {
    onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
    useEffect(() => {
        // Reset body style for scrolling
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
        return () => {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        };
    }, []);

    return (
        <div className="w-full bg-[#030303] text-white selection:bg-primary/30 font-sans relative overflow-x-hidden scroll-smooth">
            {/* Dynamic Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[70%] bg-primary/20 blur-[180px] rounded-full animate-pulse opacity-50"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-secondary/10 blur-[180px] rounded-full animate-pulse opacity-30"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 contrast-125 mix-blend-overlay"></div>
            </div>

            {/* Modern Floating Navbar */}
            <div className="fixed top-6 left-0 w-full flex justify-center z-[100] px-6">
                <nav className="w-full max-w-5xl px-6 md:px-8 py-4 flex justify-between items-center backdrop-blur-2xl bg-white/[0.03] border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 hover:border-primary/30 group">
                    <div className="flex items-center gap-3 md:gap-4 cursor-pointer">
                        <div className="w-10 h-10 md:w-11 md:h-11 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                            <MapPin className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <span className="text-xl md:text-2xl font-black tracking-tighter italic bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent uppercase">UNISPOT</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-white/40">
                        <a href="#features" className="hover:text-primary transition-colors">Features</a>
                        <a href="#community" className="hover:text-primary transition-colors">Community</a>
                        <a href="#access" className="hover:text-primary transition-colors">Access</a>
                    </div>

                    <button
                        onClick={onEnter}
                        className="group px-6 md:px-8 py-2.5 md:py-3 bg-white text-black rounded-full text-[10px] md:text-xs font-black uppercase tracking-tighter transition-all hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:shadow-primary/20"
                    >
                        <span className="flex items-center gap-2">
                            Launch <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>
                </nav>
            </div>

            {/* Main Content Sections */}
            <main className="relative z-10">

                {/* Hero Section */}
                <section className="min-h-screen flex flex-col items-center justify-center pt-32 px-6 text-center">
                    <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-white/5 border border-white/10 rounded-full text-primary text-[10px] md:text-xs font-black uppercase tracking-[0.4em] mb-10 md:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <Globe className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin-slow" /> Live @ York University
                    </div>

                    <h1 className="text-[10vw] md:text-[6.5vw] font-black tracking-tight mb-8 md:mb-10 leading-[0.9] italic uppercase select-none">
                        CAMPUS <br />
                        <span className="text-primary italic relative">
                            UNCENSORED.
                            <span className="absolute -bottom-1 md:-bottom-2 left-0 w-full h-1 bg-primary/30 blur-sm rounded-full"></span>
                        </span>
                    </h1>

                    <p className="max-w-3xl text-white/50 text-sm md:text-lg font-medium leading-relaxed mb-12 md:mb-16 px-4 md:px-0">
                        The first community-powered live engine for York Lions. Every event, <br className="hidden md:block" /> every update, verified in real-time by your peers.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto px-6 sm:px-0">
                        <button
                            onClick={onEnter}
                            className="group relative px-10 md:px-16 py-5 md:py-7 bg-primary text-white rounded-[1.5rem] md:rounded-[2rem] text-base md:text-xl font-black italic tracking-tighter overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(79,70,229,0.3)]"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                            <span className="relative flex items-center justify-center gap-4">
                                Explore the Map <Layout className="w-5 h-5 md:w-6 md:h-6" />
                            </span>
                        </button>
                    </div>
                </section>

                {/* Feature Highlights */}
                <section id="features" className="max-w-full px-6 md:px-20 py-32 md:py-48 border-y border-white/5 bg-white/[0.01] relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-16 md:mb-20 text-center md:text-left">
                            <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase mb-6 leading-none">Designed for <br />the modern Lion.</h2>
                            <div className="w-16 md:w-20 h-1 md:h-1.5 bg-primary mx-auto md:mx-0"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                            <div className="p-10 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] bg-white/[0.04] border border-white/5 hover:border-primary/50 transition-all duration-700 group relative overflow-hidden">
                                <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-2xl md:rounded-3xl flex items-center justify-center mb-8 md:mb-10 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                                    <Smartphone className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                                </div>
                                <h3 className="font-black text-2xl md:text-3xl mb-4 md:mb-6 italic uppercase leading-none">Instant <br />Alerts.</h3>
                                <p className="text-white/40 text-base md:text-lg font-medium leading-relaxed italic">Real-time alerts on food, events, and campus safety—at your fingertips.</p>
                            </div>

                            <div className="p-10 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] bg-white/[0.04] border border-white/5 hover:border-secondary/50 transition-all duration-700 group relative overflow-hidden">
                                <div className="absolute -right-4 -top-4 w-32 h-32 bg-secondary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-secondary/10 rounded-2xl md:rounded-3xl flex items-center justify-center mb-8 md:mb-10 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                                    <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-secondary" />
                                </div>
                                <h3 className="font-black text-2xl md:text-3xl mb-4 md:mb-6 italic uppercase leading-none">GPS <br />Verified.</h3>
                                <p className="text-white/40 text-base md:text-lg font-medium leading-relaxed italic">GPS-locked posts ensure only real events make it to the community pack.</p>
                            </div>

                            <div className="p-10 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] bg-white/[0.04] border border-white/5 hover:border-white/20 transition-all duration-700 group relative overflow-hidden">
                                <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-2xl md:rounded-3xl flex items-center justify-center mb-8 md:mb-10 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                                    <Coffee className="w-8 h-8 md:w-10 md:h-10 text-white" />
                                </div>
                                <h3 className="font-black text-2xl md:text-3xl mb-4 md:mb-6 italic uppercase leading-none">Campus <br />Perks.</h3>
                                <p className="text-white/40 text-base md:text-lg font-medium leading-relaxed italic">From free food to study spots, find out where the action is before anyone else.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Community Proof Section */}
                <section id="community" className="py-48 md:py-64 flex flex-col items-center justify-center px-6 relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-primary/5 rounded-full blur-[100px] -skew-y-12"></div>
                    <Users className="w-16 h-16 md:w-24 md:h-24 text-primary/40 mb-10 md:mb-12 animate-bounce" />
                    <h2 className="text-5xl md:text-[6.5vw] font-black italic tracking-tighter uppercase mb-12 md:mb-16 text-center leading-[0.9]">JOIN THE <br />PACK.</h2>
                    <div className="flex flex-wrap gap-4 md:gap-8 justify-center max-w-5xl px-6 md:px-0 text-white/20 text-lg md:text-4xl font-black italic uppercase italic">
                        <span className="hover:text-white transition-colors">Scott Library</span>
                        <span className="text-primary/50 text-xl md:text-4xl">•</span>
                        <span className="hover:text-white transition-colors">Vari Hall</span>
                        <span className="text-primary/50 text-xl md:text-4xl">•</span>
                        <span className="hover:text-white transition-colors">The Village</span>
                        <span className="text-primary/50 text-xl md:text-4xl">•</span>
                        <span className="hover:text-white transition-colors">Lassonde</span>
                        <span className="text-primary/50 text-xl md:text-4xl">•</span>
                        <span className="hover:text-white transition-colors">Stong College</span>
                    </div>
                </section>

                {/* Final CTA */}
                <section id="access" className="py-32 md:py-48 px-6 text-center max-w-[100vw]">
                    <div className="max-w-5xl mx-auto p-12 md:p-24 rounded-[3rem] md:rounded-[4.5rem] bg-gradient-to-br from-primary via-primary-dark to-accent shadow-[0_40px_100px_rgba(79,70,229,0.5)] border border-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <Star className="w-12 h-12 md:w-16 md:h-16 text-white mx-auto mb-8 md:mb-10 animate-spin-slow" />
                        <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-10 md:mb-12 uppercase leading-[0.9]">Ready for the <br />real York experience?</h2>
                        <button
                            onClick={onEnter}
                            className="w-full sm:w-auto px-12 md:px-20 py-6 md:py-8 bg-white text-black rounded-full text-lg md:text-2xl font-black italic uppercase hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.2)]"
                        >
                            Enter Platform
                        </button>
                    </div>

                    <footer className="mt-32 md:mt-48 pb-12 flex flex-col items-center gap-6 opacity-30">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 md:w-8 md:h-8 bg-white rounded-lg flex items-center justify-center">
                                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-black" />
                            </div>
                            <span className="text-base md:text-lg font-black italic tracking-tighter">UNISPOT V1.0</span>
                        </div>
                        <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.6em] text-center px-6">Built for the Lions of York University</p>
                    </footer>
                </section>
            </main>
        </div>
    );
};

export default LandingPage;
