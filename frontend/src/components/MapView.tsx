import React, { useState, useRef, useEffect } from 'react';
import Map, { Source, Layer, NavigationControl, Popup, Marker } from 'react-map-gl/mapbox';
import mapboxgl from 'mapbox-gl';
import type { GeoJSONSource } from 'mapbox-gl';
import { ShieldCheck, Tag, Plus, Check, Flame, TrendingUp, Navigation, Clock, LocateFixed, Layers, Music, Utensils, Cpu, Zap, BookOpen, Users, Dumbbell, ShieldAlert, ShoppingBag, X } from 'lucide-react';
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
    const [routeData, setRouteData] = useState<any>(null);
    const [userLocation, setUserLocation] = useState<{ lng: number, lat: number } | null>(null);
    const [walkingInfo, setWalkingInfo] = useState<{ distance: number, duration: number } | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const mapRef = useRef<any>(null);

    // Watch user location for live walking distances
    useEffect(() => {
        if (!navigator.geolocation) return;

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                setUserLocation({
                    lng: pos.coords.longitude,
                    lat: pos.coords.latitude
                });
            },
            (err) => console.warn('Location watch error:', err),
            { enableHighAccuracy: true, maximumAge: 10000 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // Fetch walking info when popup opens or user location changes
    useEffect(() => {
        if (!popupInfo || !userLocation) {
            setWalkingInfo(null);
            return;
        }

        const getWalkingInfo = async () => {
            try {
                const response = await fetch(
                    `https://api.mapbox.com/directions/v5/mapbox/walking/${userLocation.lng},${userLocation.lat};${popupInfo.lng},${popupInfo.lat}?access_token=${MAPBOX_TOKEN}`
                );
                const data = await response.json();
                if (data.routes && data.routes[0]) {
                    setWalkingInfo({
                        distance: data.routes[0].distance,
                        duration: data.routes[0].duration
                    });
                }
            } catch (error) {
                console.error('Failed to fetch walking info:', error);
            }
        };

        getWalkingInfo();
    }, [popupInfo, userLocation]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

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

    // Calculate time left helper
    const getTimeStatus = (startTimeStr: string, durationHours: number) => {
        const start = new Date(startTimeStr);
        const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
        const diffMs = end.getTime() - currentTime.getTime();

        if (diffMs <= 0) return { text: 'Ended', active: false, urgent: false };

        const totalSeconds = Math.floor(diffMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const isUrgent = hours === 0 && minutes <= 30;

        // Pad with zeros
        const hDisp = hours > 0 ? `${hours}H ` : '';
        const mDisp = `${minutes.toString().padStart(2, '0')}M `;
        const sDisp = `${seconds.toString().padStart(2, '0')}S`;

        return {
            text: `${hDisp}${mDisp}${sDisp} LEFT`,
            active: true,
            urgent: isUrgent
        };
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

    const clusterLayer: any = {
        id: 'clusters',
        type: 'circle',
        source: 'events',
        filter: ['has', 'point_count'],
        paint: {
            'circle-color': ['step', ['get', 'point_count'], '#6366F1', 5, '#4F46E5', 15, '#3730A3'],
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

    // We removed unclusteredPointLayer because we will render rich HTML Markers instead.

    const handleMapClick = (event: any) => {
        // If we are in selecting mode, prioritize that over EVERYTHING
        if (isSelectingLocation) {
            onMapClick(event.lngLat.lat, event.lngLat.lng);
            return;
        }

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
                setPopupInfo((prev: any) => ({ ...prev, verified_count: (prev.verified_count || 0) + 1 }));
            }
        } catch (error) {
            console.error('Failed to verify:', error);
        }
    };

    const handleGetDirections = async (e: React.MouseEvent, destLat: number, destLng: number) => {
        e.stopPropagation();

        // Get user location if not already available
        let startLng = userLocation?.lng;
        let startLat = userLocation?.lat;

        if (!startLng || !startLat) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const { longitude, latitude } = position.coords;
                    setUserLocation({ lng: longitude, lat: latitude });
                    fetchRoute(longitude, latitude, destLng, destLat);
                });
            }
            return;
        }

        fetchRoute(startLng, startLat, destLng, destLat);
    };

    const fetchRoute = async (startLng: number, startLat: number, destLng: number, destLat: number) => {
        try {
            const query = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/walking/${startLng},${startLat};${destLng},${destLat}?steps=true&geometries=geojson&access_token=${MAPBOX_TOKEN}`
            );
            const json = await query.json();
            const data = json.routes[0];
            const route = data.geometry.coordinates;

            setRouteData({
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: route
                }
            });

            setPopupInfo(null); // Close popup when directions start

            // Fit map to route
            if (mapRef.current) {
                const coordinates = route;
                const bounds = coordinates.reduce((acc: any, coord: any) => {
                    return acc.extend(coord);
                }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

                mapRef.current.fitBounds(bounds, { padding: 50 });
            }
        } catch (error) {
            console.error('Failed to fetch route:', error);
        }
    };

    const hasVoted = popupInfo ? votedEvents.includes(popupInfo.id) : false;
    const isPopular = popupInfo ? popupInfo.verified_count >= 10 : false;
    const timeStatus = popupInfo ? getTimeStatus(popupInfo.start_time, popupInfo.duration_hours || 2) : null;

    // Helper for category icons
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Food': return <Utensils className="w-4 h-4" />;
            case 'Study': return <BookOpen className="w-4 h-4" />;
            case 'Social': return <Users className="w-4 h-4" />;
            case 'Tech': return <Cpu className="w-4 h-4" />;
            case 'Music': return <Music className="w-4 h-4" />;
            case 'Sports': return <Dumbbell className="w-4 h-4" />;
            case 'Safety': return <ShieldAlert className="w-4 h-4" />;
            case 'Sale': return <ShoppingBag className="w-4 h-4" />;
            default: return <Tag className="w-4 h-4" />;
        }
    };

    return (
        <div className={`w-full h-full relative overflow-hidden rounded-2xl md:rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/10 bg-background/20 font-sans transition-all duration-700 ease-in-out ${isSelectingLocation ? 'ring-8 ring-primary/20 ring-inset cursor-crosshair' : ''}`}>
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
                </Source>

                {routeData && (
                    <Source id="routeSource" type="geojson" data={routeData}>
                        <Layer
                            id="routeLayer"
                            type="line"
                            layout={{
                                'line-join': 'round',
                                'line-cap': 'round'
                            }}
                            paint={{
                                'line-color': '#6366F1',
                                'line-width': 6,
                                'line-opacity': 0.8
                            }}
                        />
                    </Source>
                )}

                {events.map((event) => {
                    const isHot = event.verified_count >= 10;
                    const catColor = categoryColors[event.category] || '#6366f1';

                    return (
                        <Marker
                            key={`marker-${event.id}`}
                            longitude={event.lng}
                            latitude={event.lat}
                            anchor="bottom"
                            onClick={e => {
                                if (isSelectingLocation) return;
                                e.originalEvent.stopPropagation();
                                setPopupInfo(event);
                            }}
                        >
                            <div className={`relative cursor-pointer group animate-in fade-in zoom-in duration-500`} style={{ zIndex: popupInfo?.id === event.id ? 50 : 1 }}>
                                {isHot && (
                                    <div className="absolute -inset-2 bg-primary rounded-full blur animate-pulse opacity-40"></div>
                                )}
                                <div className="absolute -inset-1 bg-white rounded-full blur-sm opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                <div
                                    className={`relative w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white border-2 border-white shadow-xl transition-all duration-300 transform group-hover:-translate-y-2 group-hover:scale-110 ${isHot ? 'animate-bounce' : ''}`}
                                    style={{ backgroundColor: catColor, boxShadow: `0 10px 25px -5px ${catColor}` }}
                                >
                                    {getCategoryIcon(event.category)}
                                    {isHot && (
                                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-accent text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-white shadow-sm flex items-center gap-0.5">
                                            <Flame className="w-2 h-2" /> HOT
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-black/30 blur-sm rounded-full group-hover:w-5 group-hover:bg-black/40 transition-all duration-300"></div>
                            </div>
                        </Marker>
                    );
                })}

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
                                }, (err) => {
                                    console.error('Map Geo Error:', err);
                                }, {
                                    enableHighAccuracy: true,
                                    timeout: 8000,
                                    maximumAge: 0
                                });
                            }
                        }}
                        className="w-12 h-12 glass-morphism rounded-full flex items-center justify-center text-foreground shadow-xl border border-white/20 hover:scale-105 active:scale-95 transition-all bg-background/80 backdrop-blur-md"
                        title="Locate Me"
                    >
                        <LocateFixed className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setMapStyleOverlay(prev => prev === 'streets' ? 'satellite' : 'streets')}
                        className={`w-12 h-12 glass-morphism rounded-full flex items-center justify-center shadow-xl border border-white/20 hover:scale-105 active:scale-95 transition-all backdrop-blur-md ${mapStyleOverlay === 'satellite' ? 'bg-primary text-white border-primary/50 shadow-primary/30' : 'bg-background/80 text-foreground'}`}
                        title="Toggle Satellite View"
                    >
                        <Layers className="w-5 h-5" />
                    </button>
                </div>

                {/* Route Info Overlay */}
                {routeData && walkingInfo && (
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-[320px] glass-morphism p-5 rounded-[2rem] border border-primary/30 shadow-[0_20px_50px_rgba(79,70,229,0.3)] animate-in slide-in-from-bottom-5 duration-700">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/20 rounded-xl">
                                    <Navigation className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Heading To Event</p>
                                    <p className="text-sm font-black italic uppercase tracking-tight text-foreground">{Math.round(walkingInfo.duration / 60)} Min Walk</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setRouteData(null)}
                                className="p-2 hover:bg-white/5 rounded-full transition-colors text-foreground/40 hover:text-foreground"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="w-full h-1 bg-foreground/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary animate-pulse" style={{ width: '100%' }}></div>
                        </div>
                        <p className="text-[9px] font-bold text-foreground/40 mt-3 text-center uppercase tracking-[0.2em]">{Math.round(walkingInfo.distance)} Meters Remaining</p>
                    </div>
                )}

                {events.length === 0 && !isSelectingLocation && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center bg-background/60 backdrop-blur-3xl p-8 md:p-10 rounded-[2rem] border border-white/10 shadow-2xl w-[85%] max-w-[340px] animate-in zoom-in-90 duration-1000">
                        <img src="/logo.svg" alt="UniSpot Empty" className="w-14 h-14 md:w-20 md:h-20 mx-auto mb-6 animate-bounce drop-shadow-[0_0_20px_rgba(255,45,85,0.4)]" />
                        <h3 className="text-2xl md:text-3xl font-black mb-4 italic uppercase tracking-tighter bg-gradient-to-r from-primary via-primary-dark to-secondary bg-clip-text text-transparent">Nothing here yet!</h3>
                        <p className="text-foreground/50 text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] leading-relaxed">Click <span className="text-primary italic">"Drop a Mark"</span> in the sidebar to ignite the map.</p>
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
                                <div className="absolute top-3 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-primary to-accent rounded-full text-[8px] md:text-[10px] font-black text-white shadow-lg animate-pulse">
                                    <Flame className="w-2.5 h-3 md:w-3.5 md:h-4" /> HOT SPOT
                                </div>
                            )}

                            <div className="absolute top-0 left-0 w-full h-1 md:h-1.5 bg-gradient-to-r from-primary via-secondary to-accent"></div>

                            <div className="flex items-start justify-between mb-3 md:mb-4 mt-2">
                                <h3 className="font-black text-lg md:text-2xl leading-tight dark:text-white max-w-[75%] italic line-clamp-2">{popupInfo.title}</h3>
                                <div className="flex flex-col items-end gap-1">
                                    {(popupInfo.verified_count >= 5) && !isPopular && (
                                        <ShieldCheck className="w-5 h-5 md:w-7 md:h-7 text-green-500 shrink-0 ml-2" />
                                    )}
                                </div>
                            </div>

                            {/* Live Timer & Walking Time */}
                            <div className="flex flex-col gap-2 mb-3">
                                {timeStatus && timeStatus.active && (
                                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest border tabular-nums ${timeStatus.urgent ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                        {timeStatus.urgent ? <Zap className="w-3.5 h-3.5 flex-shrink-0" /> : <Clock className="w-3.5 h-3.5 flex-shrink-0" />}
                                        <span className="flex-1">{timeStatus.text}</span>
                                        <div className="flex items-center gap-1.5 opacity-80">
                                            <span className="relative flex h-1.5 w-1.5">
                                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${timeStatus.urgent ? 'bg-red-400' : 'bg-primary'}`}></span>
                                                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${timeStatus.urgent ? 'bg-red-500' : 'bg-primary'}`}></span>
                                            </span>
                                            <span className="text-[8px] md:text-[9px]">LIVE</span>
                                        </div>
                                    </div>
                                )}

                                {walkingInfo && (
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/10 text-secondary border border-secondary/20 text-[10px] md:text-xs font-black uppercase tracking-widest">
                                        <Navigation className="w-3.5 h-3.5" />
                                        <span>{Math.round(walkingInfo.duration / 60)} MIN WALK</span>
                                        <span className="mx-1 opacity-30">•</span>
                                        <span>{walkingInfo.distance > 1000 ? `${(walkingInfo.distance / 1000).toFixed(1)}KM` : `${Math.round(walkingInfo.distance)}M`}</span>
                                    </div>
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
                                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] md:text-[11px] font-black uppercase shadow-lg ${isPopular ? 'bg-primary/20 text-primary border border-primary/20 shadow-primary/10' : 'bg-green-500/20 text-green-500 border border-green-500/20 shadow-green-500/10'
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
                                    className="px-4 md:px-5 py-3 md:py-4 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl md:rounded-2xl transition-all shadow-sm border border-primary/10 active:scale-[0.98] flex items-center gap-2 group"
                                    title="Get Directions"
                                >
                                    <Navigation className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:rotate-12" />
                                    <span className="text-[10px] md:text-xs font-black uppercase">Go</span>
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
