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
        <div className="w-full bg-[#050505] text-white selection:bg-primary/30 font-sans relative overflow-x-hidden">
            {/* Dynamic Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/10 blur-[150px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-secondary/5 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 contrast-120"></div>
            </div>

            {/* Modern Fixed Navbar */}
            <nav className="fixed top-0 left-0 w-full p-6 md:p-10 flex justify-between items-center z-[100] transition-all duration-300 backdrop-blur-md bg-black/10 border-b border-white/5">
                <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.3)] transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                        <MapPin className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-3xl font-black tracking-tighter italic">UNISPOT</span>
                </div>
                <button
                    onClick={onEnter}
                    className="group px-10 py-4 bg-white text-black rounded-full text-sm font-black uppercase tracking-tighter transition-all hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
                >
                    <span className="flex items-center gap-3">
                        Launch Platform <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                </button>
            </nav>

            {/* Main Content Sections */}
            <main className="relative z-10">

                {/* Hero Section */}
                <section className="min-h-screen flex flex-col items-center justify-center pt-32 px-6 text-center">
                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-primary text-xs font-black uppercase tracking-[0.3em] mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <Globe className="w-4 h-4" /> Live @ York University
                    </div>

                    <h1 className="text-[14vw] md:text-[9vw] font-black tracking-tighter mb-10 leading-[0.8] italic uppercase">
                        CAMPUS <br />
                        <span className="text-primary italic animate-pulse">UNCENSORED.</span>
                    </h1>

                    <p className="max-w-3xl text-white/40 text-xl md:text-3xl font-medium leading-relaxed mb-20 px-4">
                        The first community-powered live engine for York Lions. Every event, every update, verified in real-time.
                    </p>

                    <div className="flex flex-col md:flex-row gap-6">
                        <button
                            onClick={onEnter}
                            className="group relative px-20 py-8 bg-primary text-white rounded-[2.5rem] text-2xl font-black italic tracking-tighter overflow-hidden transition-all hover:scale-110 active:scale-95 shadow-[0_20px_60px_rgba(79,70,229,0.4)]"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                            <span className="relative flex items-center gap-4">
                                Explore the Map <Layout className="w-7 h-7" />
                            </span>
                        </button>
                    </div>
                </section>

                {/* Feature Highlights: Horizontal Scrolling-feel Grid */}
                <section className="max-w-full px-6 md:px-20 py-40 border-y border-white/10 bg-white/[0.01]">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-24">
                            <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mb-6">Designed for <br />the modern Lion.</h2>
                            <div className="w-24 h-2 bg-primary"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="p-12 rounded-[3.5rem] bg-white/[0.03] border border-white/5 hover:border-primary/50 transition-all duration-700 group">
                                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                                    <Smartphone className="w-10 h-10 text-primary" />
                                </div>
                                <h3 className="font-black text-4xl mb-6 italic uppercase leading-none">Instant <br />Intelligence.</h3>
                                <p className="text-white/30 text-xl font-medium leading-relaxed italic">Real-time alerts on food, events, and campus safety—pushed to your device instantly.</p>
                            </div>

                            <div className="p-12 rounded-[3.5rem] bg-white/[0.03] border border-white/5 hover:border-secondary/50 transition-all duration-700 group">
                                <div className="w-20 h-20 bg-secondary/10 rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                                    <ShieldCheck className="w-10 h-10 text-secondary" />
                                </div>
                                <h3 className="font-black text-4xl mb-6 italic uppercase leading-none">Zero <br />Bullshit.</h3>
                                <p className="text-white/30 text-xl font-medium leading-relaxed italic">GPS-verified posts and community trust scoring means ghost markers don't stand a chance.</p>
                            </div>

                            <div className="p-12 rounded-[3.5rem] bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all duration-700 group">
                                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                                    <Coffee className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="font-black text-4xl mb-6 italic uppercase leading-none">Free <br />Everything.</h3>
                                <p className="text-white/30 text-xl font-medium leading-relaxed italic">From free pizza at Scott Library to secret study lounges, find it all here first.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Community Proof Section */}
                <section className="py-60 flex flex-col items-center justify-center px-6 relative">
                    <div className="absolute inset-0 bg-primary opacity-5 skew-y-3"></div>
                    <Users className="w-20 h-20 text-primary/40 mb-10" />
                    <h2 className="text-7xl md:text-[8vw] font-black italic tracking-tighter uppercase mb-12 text-center">JOIN THE <br />PACK.</h2>
                    <div className="flex gap-4 md:gap-8 flex-wrap justify-center max-w-4xl text-white/20 text-2xl md:text-5xl font-black italic uppercase">
                        <span>Scott Library</span>
                        <span className="text-primary">•</span>
                        <span>Vari Hall</span>
                        <span className="text-primary">•</span>
                        <span>The Village</span>
                        <span className="text-primary">•</span>
                        <span>Lassonde</span>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-40 px-6 text-center">
                    <div className="max-w-4xl mx-auto p-20 rounded-[4rem] bg-gradient-to-br from-primary to-[#4338ca] shadow-[0_30px_100px_rgba(79,70,229,0.5)]">
                        <Star className="w-16 h-16 text-white mx-auto mb-10 animate-spin-slow" />
                        <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-12 uppercase leading-none">Ready for the <br />real York experience?</h2>
                        <button
                            onClick={onEnter}
                            className="px-16 py-8 bg-white text-black rounded-full text-2xl font-black italic hover:scale-105 active:scale-95 transition-all shadow-2xl"
                        >
                            ACCESS UNISPOT
                        </button>
                    </div>

                    <footer className="mt-40 pb-10 flex flex-col items-center gap-6 opacity-20">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-white rounded-lg"></div>
                            <span className="text-lg font-black italic tracking-tighter">UNISPOT 2024</span>
                        </div>
                        <p className="text-xs font-bold uppercase tracking-[0.5em]">Built for the York Lions community</p>
                    </footer>
                </section>
            </main>
        </div>
    );
};

export default LandingPage;
