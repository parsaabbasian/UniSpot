// UniSpot - Campus Intelligence App
import { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import EventForm from './components/EventForm';
import LandingPage from './components/LandingPage';
import EventDetailOverlay from './components/EventDetailOverlay';
import AdminDashboard from './components/AdminDashboard';
import axios from 'axios';
import { Menu, X, Plus, Check } from 'lucide-react';

import type { Event } from './types';

function App() {
  const parseHash = () => {
    const hash = window.location.hash;
    const isMap = hash.startsWith('#map');
    const isAdmin = hash.startsWith('#admin');
    let eventId = null;

    if (hash.includes('?event=')) {
      const parts = hash.split('?event=');
      eventId = parseInt(parts[1], 10);
    }

    return { isMap, isAdmin, eventId };
  };

  const [showMap, setShowMap] = useState(() => parseHash().isMap);
  const [showAdmin, setShowAdmin] = useState(() => parseHash().isAdmin);
  const [deepLinkedEventId, setDeepLinkedEventId] = useState<number | null>(() => parseHash().eventId);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [selectedDetailEvent, setSelectedDetailEvent] = useState<Event | null>(null);
  const [currentUser, setCurrentUser] = useState<{ name: string, email: string } | null>(() => {
    const saved = localStorage.getItem('unispot_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [pendingEventCoords, setPendingEventCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeUserCount, setActiveUserCount] = useState(0);
  const [notification, setNotification] = useState<{ type: 'new' | 'verify' | 'delete' | 'error', title: string, category: string, userName?: string } | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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

  useEffect(() => {
    const handleHashChange = () => {
      const { isMap, isAdmin, eventId } = parseHash();
      setShowMap(isMap);
      setShowAdmin(isAdmin);
      if (eventId !== null) {
        setDeepLinkedEventId(eventId);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (searchQuery && isSelectingLocation) {
      setIsSelectingLocation(false);
    }
  }, [searchQuery, isSelectingLocation]);

  const fetchEvents = useCallback(async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
      const response = await axios.get(`${apiUrl}/api/events`, {
        params: {
          lat: 43.7735,
          lng: -79.5019,
          radius: 5000
        }
      });
      setEvents(response.data);

      // Handle initial deep linking after events are fetched
      if (deepLinkedEventId) {
        const event = (response.data as Event[]).find(e => e.id === deepLinkedEventId);
        if (event) {
          setSelectedDetailEvent(event);
          setDeepLinkedEventId(null); // Clear it so it doesn't reopen unexpectedly
        }
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
      // Fallback mock data
      setEvents([
        { id: 1, title: 'York U Hackathon', description: 'Main Student Centre', category: 'Tech', lat: 43.7735, lng: -79.5019, verified_count: 10, start_time: new Date().toISOString(), end_time: new Date(Date.now() + 7200000).toISOString() },
        { id: 2, title: 'Coffee Chat @ Vari Hall', description: 'Free coffee for students', category: 'Food', lat: 43.7740, lng: -79.5035, verified_count: 3, start_time: new Date().toISOString(), end_time: new Date(Date.now() + 7200000).toISOString() },
      ]);
    }
  }, []);

  useEffect(() => {
    fetchEvents();

    // WebSocket for real-time updates
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
    const wsUrl = apiUrl.replace(/^http/, 'ws') + '/ws';

    let socket: WebSocket;
    const connectWS = () => {
      socket = new WebSocket(wsUrl);

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.action === 'new_event') {
          setEvents(prev => {
            if (prev.find(e => e.id === message.data.id)) return prev;
            return [message.data, ...prev];
          });
          setNotification({ type: 'new', title: message.data.title, category: message.data.category });
          setRecentActivity(prev => [{ type: 'new', title: message.data.title, id: message.data.id }, ...prev].slice(0, 10));
          setTimeout(() => setNotification(null), 5000);
        } else if (message.action === 'verify_event') {
          setEvents(prev => {
            const updated = prev.map(e =>
              e.id === message.data.id
                ? {
                  ...e,
                  verified_count: message.data.verified_count,
                  verifiers: [...(e.verifiers || []), message.data.user_name]
                }
                : e
            );
            const event = prev.find(e => e.id === message.data.id);
            if (event && message.data.verified_count > event.verified_count) {
              setNotification({
                type: 'verify',
                title: event.title,
                category: event.category,
                userName: message.data.user_name
              });
              setRecentActivity(prev => [{
                type: 'verify',
                title: event.title,
                id: event.id,
                userName: message.data.user_name
              }, ...prev].slice(0, 10));
              setTimeout(() => setNotification(null), 3000);
            }
            return updated;
          });
        } else if (message.action === 'update_event') {
          // Supabase direct edit — patch the event in-place
          setEvents(prev => prev.map(e => {
            if (e.id === message.data.id) {
              return {
                ...e,
                title: message.data.title ?? e.title,
                description: message.data.description ?? e.description,
                category: message.data.category ?? e.category,
                verified_count: message.data.verified_count ?? e.verified_count,
                start_time: message.data.start_time ?? e.start_time,
                end_time: message.data.end_time ?? e.end_time,
              };
            }
            return e;
          }));
          const updated = events.find(e => e.id === message.data.id);
          if (updated) {
            setNotification({ type: 'verify', title: message.data.title ?? updated.title, category: message.data.category ?? updated.category });
            setTimeout(() => setNotification(null), 3000);
          }
        } else if (message.action === 'user_count') {
          setActiveUserCount(message.data.count);
        } else if (message.action === 'delete_event') {
          setEvents(prev => {
            const eventToRemove = prev.find(e => e.id === message.data.id);
            if (eventToRemove) {
              setNotification({ type: 'delete', title: eventToRemove.title, category: eventToRemove.category });
              setTimeout(() => setNotification(null), 3000);
            }
            return prev.filter(e => e.id !== message.data.id);
          });
        }
      };

      socket.onerror = (err) => {
        console.warn('WebSocket error:', err);
      };

      socket.onclose = () => {
        // Exponential backoff: 2s, 4s, 8s ... up to 30s max
        const delay = Math.min(2000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectAttempts.current += 1;
        console.log(`WS closed. Reconnecting in ${delay / 1000}s (attempt ${reconnectAttempts.current})`);
        reconnectTimer.current = setTimeout(connectWS, delay);
      };
    };

    connectWS();

    // Reconnect immediately when the tab becomes visible again
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && socket?.readyState !== WebSocket.OPEN) {
        clearTimeout(reconnectTimer.current);
        reconnectAttempts.current = 0;
        connectWS();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      socket?.close();
      clearTimeout(reconnectTimer.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchEvents]);

  const handleMapClick = (lat: number, lng: number) => {
    if (isSelectingLocation) {
      // York U Keele Campus Center
      const YORK_U_COORDS = { lat: 43.7735, lng: -79.5019 };
      const distance = calculateDistance(lat, lng, YORK_U_COORDS.lat, YORK_U_COORDS.lng);

      // Check if within 2.5km (roughly campus area + immediate surroundings)
      if (distance > 2.5) {
        setNotification({
          type: 'error' as any,
          title: 'Outside Campus Boundary',
          category: 'Location Restricted'
        });
        setTimeout(() => setNotification(null), 4000);
        return;
      }

      setPendingEventCoords({ lat, lng });
      setIsSelectingLocation(false);
    }
  };

  const handleVerifyEvent = async (id: number) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
      await axios.post(`${apiUrl}/api/events/${id}/verify`, {
        user_name: currentUser?.name,
        user_email: currentUser?.email
      });

      // Update local state immediately
      setEvents(prev => prev.map(e =>
        e.id === id ? {
          ...e,
          verified_count: e.verified_count + 1,
          verifiers: [...(e.verifiers || []), currentUser?.name || 'Student']
        } : e
      ));

      // Update selected detail event if open
      if (selectedDetailEvent?.id === id) {
        setSelectedDetailEvent(prev => prev ? {
          ...prev,
          verified_count: prev.verified_count + 1,
          verifiers: [...(prev.verifiers || []), currentUser?.name || 'Student']
        } : null);
      }

      // Record vote
      const savedVotes = JSON.parse(localStorage.getItem('unispot_votes') || '[]');
      if (!savedVotes.includes(id)) {
        const newVotes = [...savedVotes, id];
        localStorage.setItem('unispot_votes', JSON.stringify(newVotes));
      }

      fetchEvents();
    } catch (error) {
      console.error('Failed to verify:', error);
    }
  };

  // Watch for deep-linked event even if it arrives via WebSocket or late fetch
  useEffect(() => {
    if (deepLinkedEventId && events.length > 0) {
      const event = events.find(e => e.id === deepLinkedEventId);
      if (event) {
        setSelectedDetailEvent(event);
        setDeepLinkedEventId(null);
      }
    }
  }, [deepLinkedEventId, events]);

  const filteredEvents = events.filter(e => {
    const matchesCategory = selectedCategory === 'all' || e.category === selectedCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = e.title.toLowerCase().includes(searchLower) ||
      e.description.toLowerCase().includes(searchLower) ||
      e.category.toLowerCase().includes(searchLower) ||
      (e.creator_name && e.creator_name.toLowerCase().includes(searchLower));
    return matchesCategory && matchesSearch;
  });

  if (showAdmin) {
    return (
      <AdminDashboard
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onBack={() => {
          window.location.hash = 'map';
        }}
      />
    );
  }

  if (!showMap || !currentUser) {
    return (
      <LandingPage
        onEnter={(userData) => {
          setCurrentUser(userData);
          localStorage.setItem('unispot_user', JSON.stringify(userData));
          window.location.hash = 'map';
        }}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-background md:p-3 lg:p-4 gap-3 md:gap-4 overflow-hidden animate-in fade-in zoom-in-95 duration-700">
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-5 left-5 z-[70] p-4 glass-morphism rounded-2xl text-foreground shadow-2xl border border-white/20 active:scale-90 transition-transform flex items-center justify-center"
      >
        {isSidebarOpen ? <X className="w-5 h-5 md:w-6 md:h-6" /> : <Menu className="w-5 h-5 md:w-6 md:h-6" />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[65] animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop: fixed width or fully collapsed, Mobile: absolute overlay */}
      <div className={`
        fixed inset-y-0 left-0 z-[66] md:relative md:inset-auto md:z-auto transition-all duration-500 ease-in-out overflow-hidden
        ${isSidebarOpen ? 'translate-x-0 w-[85%] sm:w-80 p-4' : '-translate-x-full md:translate-x-0 md:p-0'}
        ${isSidebarCollapsed ? 'md:w-0' : 'md:w-64 lg:w-80'}
        bg-background/95 md:bg-transparent backdrop-blur-2xl md:backdrop-blur-none
      `}>
        <div className={`transition-all duration-500 ${isSidebarCollapsed ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 scale-100'} h-full`}>
          <Sidebar
            selectedCategory={selectedCategory}
            onCategoryChange={(cat) => {
              setSelectedCategory(cat);
              setIsSidebarOpen(false);
            }}
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode(!isDarkMode)}
            isSelectingLocation={isSelectingLocation}
            onToggleSelectLocation={() => {
              onToggleSelectLocation();
              setIsSidebarOpen(false);
            }}
            activeUserCount={activeUserCount}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            recentActivity={recentActivity}
            currentUser={currentUser}
            onLogout={() => {
              setCurrentUser(null);
              localStorage.removeItem('unispot_user');
              window.location.hash = '';
            }}
          />
        </div>
      </div>

      <main className="flex-1 h-full relative p-2 md:p-0">
        {/* Desktop Sidebar Collapse Toggle — floats on map left edge */}
        <button
          onClick={() => setIsSidebarCollapsed(c => !c)}
          className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-[60] w-6 h-14 items-center justify-center glass-morphism rounded-full border border-white/20 shadow-xl text-foreground/40 hover:text-primary transition-all duration-300 hover:scale-105"
          title={isSidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`w-3 h-3 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <MapView
          events={filteredEvents}
          onMapClick={handleMapClick}
          onVerify={fetchEvents}
          onViewDetails={(event) => setSelectedDetailEvent(event)}
          isDarkMode={isDarkMode}
          isSelectingLocation={isSelectingLocation}
          sidebarCollapsed={isSidebarCollapsed}
          searchQuery={searchQuery}
          flyToEvent={selectedDetailEvent}
        />

        {isSelectingLocation && (
          <div className="fixed md:absolute top-24 md:top-10 left-1/2 -translate-x-1/2 z-[45] bg-primary/95 backdrop-blur-xl px-6 py-3 rounded-full shadow-[0_20px_40px_rgba(79,70,229,0.3)] text-white font-bold flex items-center gap-3 animate-in slide-in-from-top-6 duration-700 border border-white/20 text-[10px] md:text-sm whitespace-nowrap group tracking-wider">
            <div className="w-2 h-2 bg-white rounded-full animate-ping shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
            TAP ANYWHERE WITHIN YORK U TO DROP PIN
            <button
              onClick={() => setIsSelectingLocation(false)}
              className="ml-4 bg-white/20 hover:bg-white/40 p-2 rounded-full transition-all hover:rotate-90"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {pendingEventCoords && (
          <EventForm
            lat={pendingEventCoords.lat}
            lng={pendingEventCoords.lng}
            onClose={() => setPendingEventCoords(null)}
            onCreated={() => {
              fetchEvents();
              setSelectedCategory('all');
            }}
            currentUser={currentUser}
          />
        )}
        {notification && (
          <div className={`fixed top-24 md:top-10 right-5 z-[100] bg-background/80 backdrop-blur-3xl border border-white/20 p-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-10 duration-500 overflow-hidden min-w-[240px] ${notification.type === 'error' ? 'ring-2 ring-red-500/50' : ''}`}>
            <div className={`absolute top-0 left-0 w-1.5 h-full ${notification.type === 'new' ? 'bg-primary' :
              notification.type === 'verify' ? 'bg-green-500' : notification.type === 'error' ? 'bg-red-500' : 'bg-red-500'
              }`}></div>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl scale-90 ${notification.type === 'new' ? 'bg-primary/20 text-primary' :
                notification.type === 'verify' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                }`}>
                {notification.type === 'new' ? <Plus className="w-4 h-4" /> :
                  notification.type === 'verify' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </div>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${notification.type === 'new' ? 'text-primary' :
                  notification.type === 'verify' ? 'text-green-500' : 'text-red-500'
                  }`}>
                  {notification.type === 'new' ? 'New Event Found' :
                    notification.type === 'verify' ? 'Event Verified' :
                      notification.type === 'error' ? 'Boundary Error' : 'Event Removed'}
                </p>
                <h4 className="text-sm font-black text-foreground italic line-clamp-1 uppercase tracking-tighter">{notification.title}</h4>
                {notification.userName && (
                  <p className="text-[8px] font-black text-primary uppercase tracking-widest mt-0.5">Verified by {notification.userName}</p>
                )}
                <p className="text-[9px] text-foreground/40 font-bold uppercase mt-0.5 tracking-wider">{notification.category}</p>
              </div>
            </div>
            {notification.type === 'error' && (
              <div className="mt-2 text-[9px] font-bold text-red-500/80 uppercase tracking-tighter">
                You can only drop marks within the York University campus region.
              </div>
            )}
          </div>
        )}

        {selectedDetailEvent && (
          <EventDetailOverlay
            event={selectedDetailEvent}
            onClose={() => setSelectedDetailEvent(null)}
            onVerify={handleVerifyEvent}
            hasVoted={JSON.parse(localStorage.getItem('unispot_votes') || '[]').includes(selectedDetailEvent.id)}
          />
        )}
      </main>
    </div>
  );

  function onToggleSelectLocation() {
    setIsSelectingLocation(!isSelectingLocation);
  }
}

export default App;
