import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import EventForm from './components/EventForm';
import LandingPage from './components/LandingPage';
import axios from 'axios';
import { Menu, X } from 'lucide-react';

import type { Event } from './types';

function App() {
  const [showMap, setShowMap] = useState(() => window.location.hash === '#map');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [pendingEventCoords, setPendingEventCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeUserCount, setActiveUserCount] = useState(0);

  useEffect(() => {
    const handleHashChange = () => {
      setShowMap(window.location.hash === '#map');
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
          setEvents(prev => [message.data, ...prev]);
        } else if (message.action === 'verify_event') {
          setEvents(prev => prev.map(e =>
            e.id === message.data.id ? { ...e, verified_count: message.data.verified_count } : e
          ));
        } else if (message.action === 'user_count') {
          setActiveUserCount(message.data.count);
        }
      };

      socket.onclose = () => {
        setTimeout(connectWS, 3000); // Reconnect after 3s
      };
    };

    connectWS();
    return () => socket?.close();
  }, [fetchEvents]);

  const handleMapClick = (lat: number, lng: number) => {
    if (isSelectingLocation) {
      setPendingEventCoords({ lat, lng });
      setIsSelectingLocation(false);
    }
  };

  const filteredEvents = selectedCategory === 'all'
    ? events
    : events.filter(e => e.category === selectedCategory);

  if (!showMap) {
    return <LandingPage onEnter={() => { window.location.hash = 'map'; }} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-background md:p-3 lg:p-4 gap-3 md:gap-4 overflow-hidden animate-in fade-in zoom-in-95 duration-700">
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

      {/* Sidebar - Desktop: fixed width, Mobile: absolute overlay */}
      <div className={`
        fixed inset-y-0 left-0 z-[66] md:relative md:inset-auto md:z-auto transition-all duration-500 ease-in-out
        ${isSidebarOpen ? 'translate-x-0 w-[85%] sm:w-80 p-4' : '-translate-x-full md:translate-x-0 md:w-80 lg:w-96 p-0'}
        bg-background/95 md:bg-transparent backdrop-blur-2xl md:backdrop-blur-none
      `}>
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
        />
      </div>

      <main className="flex-1 h-full relative p-2 md:p-0">
        <MapView
          events={filteredEvents}
          onMapClick={handleMapClick}
          onVerify={fetchEvents}
          isDarkMode={isDarkMode}
          isSelectingLocation={isSelectingLocation}
        />

        {isSelectingLocation && (
          <div className="fixed md:absolute top-24 md:top-10 left-1/2 -translate-x-1/2 z-[45] bg-primary/95 backdrop-blur-xl px-6 py-3 rounded-full shadow-[0_20px_40px_rgba(79,70,229,0.3)] text-white font-bold flex items-center gap-3 animate-in slide-in-from-top-6 duration-700 border border-white/20 text-[10px] md:text-sm whitespace-nowrap group tracking-wider">
            <div className="w-2 h-2 bg-white rounded-full animate-ping shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
            TAP ANYWHERE TO MARK EVENT
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
            onCreated={fetchEvents}
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
