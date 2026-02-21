import React, { useState, useRef, useEffect } from 'react';
import Map, { Source, Layer, NavigationControl, Popup } from 'react-map-gl/mapbox';
import type { GeoJSONSource } from 'mapbox-gl';
import { ShieldCheck, Tag, Plus, Check, Flame, TrendingUp, Navigation, Clock, LocateFixed, Layers } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Event } from '../types';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'PASTE_YOUR_TOKEN_HERE';

interface MapViewProps {
    events: Event[];
    onMapClick: (lat: number, lng: number) => void;
    onVerify: (id: number) => void;
    isDarkMode: boolean;
    isSelectingLocation: boolean;
}

const MapView: React.FC<MapViewProps> = ({ events, onMapClick, onVerify, isDarkMode, isSelectingLocation }) => {
    const [viewState, setViewState] = useState({
        longitude: -79.5019,
        latitude: 43.7735,
        zoom: 15,
        pitch: 45,
        bearing: -17.6
    });

    const [mapStyleOverlay, setMapStyleOverlay] = useState<'streets' | 'satellite'>('streets');

    const [popupInfo, setPopupInfo] = useState<Event | null>(null);
    const [votedEvents, setVotedEvents] = useState<number[]>([]);
    const mapRef = useRef<any>(null);

    useEffect(() => {
        const savedVotes = localStorage.getItem('unispot_votes');
        if (savedVotes) {
            setVotedEvents(JSON.parse(savedVotes));
        }
    }, []);

    const geojson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: events.map(event => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [event.lng, event.lat] },
            properties: { ...event }
        }))
    };

    const categoryColors: Record<string, string> = {
        'Tech': '#4f46e5',
        'Music': '#ec4899',
        'Food': '#f59e0b',
        'Entertainment': '#10b981'
    };

    const clusterLayer: any = {
        id: 'clusters',
        type: 'circle',
        source: 'events',
        filter: ['has', 'point_count'],
        paint: {
            'circle-color': ['step', ['get', 'point_count'], '#4f46e5', 5, '#4338ca', 15, '#3730a3'],
            'circle-radius': ['step', ['get', 'point_count'], 20, 5, 30, 15, 40],
            'circle-stroke-width': 2,
            'circle-stroke-color': 'rgba(255,255,255,0.3)'
        }
    };

    const clusterCountLayer: any = {
        id: 'cluster-count',
        type: 'symbol',
        source: 'events',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 14
        },
        paint: {
            'text-color': '#ffffff'
        }
    };

    const unclusteredPointLayer: any = {
        id: 'unclustered-point',
        type: 'circle',
        source: 'events',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': [
                'match',
                ['get', 'category'],
                'Tech', '#4f46e5',
                'Music', '#ec4899',
                'Food', '#f59e0b',
                'Entertainment', '#10b981',
                '#6366f1'
            ],
            'circle-radius': [
                'case',
                ['>=', ['get', 'verified_count'], 10], 14,
                9
            ],
            'circle-stroke-width': 3,
            'circle-stroke-color': '#fff'
        }
    };

    const handleMapClick = (event: any) => {
        const feature = event.features?.[0];
        if (feature && feature.layer.id === 'clusters') {
            const clusterId = feature.properties.cluster_id;
            const mapboxSource = mapRef.current?.getSource('events') as GeoJSONSource;

            if (mapboxSource) {
                mapboxSource.getClusterExpansionZoom(clusterId, (err: any, zoom?: number | null) => {
                    if (err || zoom === null || zoom === undefined) return;
                    setViewState({
                        ...viewState,
                        longitude: feature.geometry.coordinates[0],
                        latitude: feature.geometry.coordinates[1],
                        zoom: zoom,
                    });
                });
            }
        } else if (feature && feature.layer.id === 'unclustered-point') {
            setPopupInfo(feature.properties);
        } else {
            if (isSelectingLocation) {
                onMapClick(event.lngLat.lat, event.lngLat.lng);
            }
        }
    };

    const handleVerifyClick = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (votedEvents.includes(id)) return;

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
            await fetch(`${apiUrl}/api/events/${id}/verify`, { method: 'POST' });
            const newVotes = [...votedEvents, id];
            setVotedEvents(newVotes);
            localStorage.setItem('unispot_votes', JSON.stringify(newVotes));
            onVerify(id);
            if (popupInfo && popupInfo.id === id) {
                setPopupInfo({ ...popupInfo, verified_count: (popupInfo.verified_count || 0) + 1 });
            }
        } catch (error) {
            console.error('Failed to verify:', error);
        }
    };

    const handleGetDirections = (e: React.MouseEvent, lat: number, lng: number) => {
        e.stopPropagation();
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    };

    const hasVoted = popupInfo ? votedEvents.includes(popupInfo.id) : false;
    const isPopular = popupInfo ? popupInfo.verified_count >= 10 : false;

    return (
        <div className={`w-full h-full relative overflow-hidden rounded-2xl md:rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/10 bg-background/20 font-sans transition-all duration-300 ${isSelectingLocation ? 'ring-4 ring-primary ring-inset cursor-crosshair' : ''}`}>
            <Map
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                style={{ width: '100%', height: '100%' }}
                mapStyle={
                    mapStyleOverlay === 'satellite'
                        ? "mapbox://styles/mapbox/satellite-streets-v12"
                        : (isDarkMode ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11")
                }
                mapboxAccessToken={MAPBOX_TOKEN}
                interactiveLayerIds={['clusters', 'unclustered-point']}
                onClick={handleMapClick}
                ref={mapRef}
            >
                <Source
                    id="events"
                    type="geojson"
                    data={geojson}
                    cluster={true}
                    clusterMaxZoom={14}
                    clusterRadius={50}
                >
                    <Layer {...clusterLayer} />
                    <Layer {...clusterCountLayer} />
                    <Layer {...unclusteredPointLayer} />
                </Source>

                <NavigationControl position="bottom-right" />

                {/* Map Utilities Navbar */}
                <div className="absolute top-6 right-6 flex flex-col gap-3 z-10">
                    <button
                        onClick={() => {
                            if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition((position) => {
                                    setViewState({
                                        ...viewState,
                                        longitude: position.coords.longitude,
                                        latitude: position.coords.latitude,
                                        zoom: 16,
                                        pitch: 45
                                    });
                                });
                            }
                        }}
                        className="w-12 h-12 glass-morphism rounded-full flex items-center justify-center text-foreground shadow-2xl border border-white/20 hover:scale-105 active:scale-95 transition-all bg-background/80 backdrop-blur-md"
                        title="Locate Me"
                    >
                        <LocateFixed className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setMapStyleOverlay(prev => prev === 'streets' ? 'satellite' : 'streets')}
                        className={`w-12 h-12 glass-morphism rounded-full flex items-center justify-center shadow-2xl border border-white/20 hover:scale-105 active:scale-95 transition-all backdrop-blur-md ${mapStyleOverlay === 'satellite' ? 'bg-primary text-white border-primary/50' : 'bg-background/80 text-foreground'}`}
                        title="Toggle Satellite View"
                    >
                        <Layers className="w-5 h-5" />
                    </button>
                </div>

                {events.length === 0 && !isSelectingLocation && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center bg-background/80 backdrop-blur-xl p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/10 shadow-2xl w-[80%] max-w-[320px]">
                        <img src="/logo.svg" alt="UniSpot Empty" className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 animate-bounce" />
                        <h3 className="text-xl md:text-2xl font-black mb-3 italic uppercase tracking-tighter bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Nothing here yet!</h3>
                        <p className="text-foreground/40 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Click <span className="text-primary italic">"Drop a Mark"</span> in the sidebar to ignite the map.</p>
                    </div>
                )}

                {popupInfo && (
                    <Popup
                        anchor="bottom"
                        longitude={popupInfo.lng}
                        latitude={popupInfo.lat}
                        onClose={() => setPopupInfo(null)}
                        closeButton={false}
                        className="z-50"
                        offset={15}
                    >
                        <div className="p-4 md:p-6 min-w-[260px] max-w-[300px] glass-morphism rounded-[1.5rem] md:rounded-[2.5rem] border border-white/20 overflow-hidden relative shadow-2xl">
                            {isPopular && (
                                <div className="absolute top-3 right-4 flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full text-[8px] md:text-[10px] font-black text-white shadow-lg animate-pulse">
                                    <Flame className="w-2.5 h-2.5 md:w-3 md:h-3" /> HOT SPOT
                                </div>
                            )}

                            <div className="absolute top-0 left-0 w-full h-1 md:h-1.5 bg-gradient-to-r from-primary via-secondary to-accent"></div>

                            <div className="flex items-start justify-between mb-3 md:mb-4 mt-2">
                                <h3 className="font-black text-lg md:text-2xl leading-tight dark:text-white max-w-[75%] italic line-clamp-2">{popupInfo.title}</h3>
                                {(popupInfo.verified_count >= 5) && !isPopular && (
                                    <ShieldCheck className="w-5 h-5 md:w-7 md:h-7 text-green-500 shrink-0 ml-2" />
                                )}
                            </div>

                            {popupInfo.description && (
                                <div className="flex gap-2 mb-4 md:mb-5 bg-foreground/5 p-3 md:p-4 rounded-[1rem] md:rounded-[1.5rem] border border-foreground/5">
                                    <p className="text-xs md:text-sm text-foreground/80 leading-relaxed font-semibold italic line-clamp-3">
                                        "{popupInfo.description}"
                                    </p>
                                </div>
                            )}

                            <div className="flex flex-wrap items-center gap-2 mb-5 md:mb-6">
                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] md:text-[11px] font-black text-white uppercase shadow-lg shadow-black/20" style={{ backgroundColor: categoryColors[popupInfo.category] || '#6366f1' }}>
                                    <Tag className="w-3 h-3" /> {popupInfo.category}
                                </span>
                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground/10 dark:bg-white/10 rounded-full text-[9px] md:text-[11px] font-black text-foreground/70 dark:text-white/70 uppercase border border-foreground/5 dark:border-white/5 shadow-sm">
                                    <Clock className="w-3 h-3" /> {popupInfo.duration_hours || 2}H
                                </span>
                                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] md:text-[11px] font-black uppercase shadow-lg ${isPopular ? 'bg-orange-500/20 text-orange-500 border border-orange-500/20 shadow-orange-500/10' : 'bg-green-500/20 text-green-500 border border-green-500/20 shadow-green-500/10'
                                    }`}>
                                    {isPopular ? <TrendingUp className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                                    {popupInfo.verified_count || 0} VERIFICATIONS
                                </span>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={(e) => handleVerifyClick(e, popupInfo.id)}
                                    disabled={hasVoted}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-sm transition-all shadow-xl active:scale-[0.98] ${hasVoted
                                        ? 'bg-green-500/10 text-green-500 cursor-not-allowed shadow-none border border-green-500/10'
                                        : (isPopular ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/30' : 'bg-primary text-white hover:bg-primary-dark shadow-primary/30')
                                        }`}
                                >
                                    <div className="relative overflow-hidden w-full h-full flex items-center justify-center gap-1.5">
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                        {hasVoted ? <Check className="w-3.5 h-3.5 md:w-4 md:h-4 z-10 relative" /> : <Plus className="w-3.5 h-3.5 md:w-4 md:h-4 z-10 relative" />}
                                        <span className="z-10 relative">{hasVoted ? 'Verified' : 'Verify'}</span>
                                    </div>
                                </button>
                                <button
                                    onClick={(e) => handleGetDirections(e, popupInfo.lat, popupInfo.lng)}
                                    className="px-4 md:px-5 py-3 md:py-4 bg-foreground/5 hover:bg-foreground/10 text-foreground rounded-xl md:rounded-2xl transition-all shadow-sm border border-foreground/5 active:scale-[0.98]"
                                    title="Get Directions"
                                >
                                    <Navigation className="w-4 h-4 md:w-5 md:h-5" />
                                </button>
                            </div>
                        </div>
                    </Popup>
                )}
            </Map>
        </div>
    );
};

export default MapView;
