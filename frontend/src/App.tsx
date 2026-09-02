import { useState, useEffect } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { Dashboard } from './components/Dashboard';
import { AnalyticsPage } from './components/AnalyticsPage';
import { LogsPage } from './components/LogsPage';
import { SettingsPage } from './components/SettingsPage';
import { useWebSocket } from './hooks/useWebSocket';
import type { SecurityEvent, SystemHealth } from './types';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentPage, setCurrentPage] = useState<'home' | 'analytics' | 'logs' | 'settings'>('home');
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    cpuUsage: 0,
    memoryUsage: 0,
    networkUsage: 0,
    uptime: '99.9%'
  });

  const { connected, threatCount } = useWebSocket((data) => {
    if (data.type === 'event') {
      setEvents(prev => [data.payload, ...prev].slice(0, 50));
    } else if (data.type === 'health') {
      setSystemHealth(data.payload);
    }
  });

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-purple-500/20 p-6">
        <div className="flex items-center gap-2 mb-12">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white">S</span>
          </div>
          <span className="text-xl font-bold">Sentinel</span>
        </div>

        <nav className="space-y-4">
          {[
            { id: 'home', label: 'Home', icon: '🏠' },
            { id: 'analytics', label: 'Analytics', icon: '📊' },
            { id: 'logs', label: 'Logs', icon: '📋' },
            { id: 'settings', label: 'Settings', icon: '⚙️' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id as any)}
              className={`w-full text-left px-4 py-2 rounded-lg transition ${
                currentPage === item.id
                  ? 'bg-purple-500/20 text-purple-300 border-l-2 border-purple-500'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-slate-800'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-12 pt-6 border-t border-purple-500/10">
          <div className="text-xs text-gray-500 mb-2">Status</div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-400">{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {currentPage === 'home' && (
            <Dashboard events={events} systemHealth={systemHealth} threatCount={threatCount} />
          )}
          {currentPage === 'analytics' && <AnalyticsPage events={events} />}
          {currentPage === 'logs' && <LogsPage events={events} />}
          {currentPage === 'settings' && <SettingsPage />}
        </div>
      </main>
    </div>
  );
}
