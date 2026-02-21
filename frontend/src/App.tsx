import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import EventForm from './components/EventForm';
import LandingPage from './components/LandingPage';
import axios from 'axios';
import { Menu, X } from 'lucide-react';

import type { Event } from './types';

function App() {
  const [showMap, setShowMap] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [pendingEventCoords, setPendingEventCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        { id: 1, title: 'York U Hackathon', description: 'Main Student Centre', category: 'Tech', lat: 43.7735, lng: -79.5019, verified_count: 10 },
        { id: 2, title: 'Coffee Chat @ Vari Hall', description: 'Free coffee for students', category: 'Food', lat: 43.7740, lng: -79.5035, verified_count: 3 },
      ]);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
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
    return <LandingPage onEnter={() => setShowMap(true)} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-background md:p-4 gap-4 overflow-hidden animate-in fade-in zoom-in-95 duration-700">
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-6 left-6 z-[60] p-3 glass-morphism rounded-2xl text-foreground shadow-xl border border-white/10"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar - Desktop: fixed width, Mobile: absolute overlay */}
      <div className={`
        fixed inset-0 z-50 md:relative md:inset-auto md:z-auto transition-transform duration-500 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        md:w-80 w-full p-4 md:p-0 bg-background/80 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none
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
          <div className="fixed md:absolute top-24 md:top-8 left-1/2 -translate-x-1/2 z-[45] bg-primary px-6 md:px-8 py-3 md:py-4 rounded-3xl shadow-2xl text-white font-black italic flex items-center gap-4 animate-in slide-in-from-top-4 duration-500 border border-white/20 text-sm md:text-base whitespace-nowrap">
            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            Select event location
            <button
              onClick={() => setIsSelectingLocation(false)}
              className="ml-2 bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-all"
            >
              <SidebarX className="w-4 h-4" />
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

// Simple internal icon for the cancel button
const SidebarX = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default App;
