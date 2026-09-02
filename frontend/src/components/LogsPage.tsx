import { useState } from 'react';
import type { SecurityEvent } from '../types';

export function LogsPage({ events }: { events: SecurityEvent[] }) {
  const [filter, setFilter] = useState('all');

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.severity === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Security Logs</h1>
        <select 
          value={filter} 
          onChange={e => setFilter(e.target.value)}
          className="bg-slate-800 border border-purple-500/20 rounded px-3 py-2 text-sm text-gray-300"
        >
          <option value="all">All Events</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="bg-slate-900 border border-purple-500/20 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 border-b border-purple-500/20">
            <tr>
              <th className="px-6 py-3 text-left text-gray-400 font-semibold">Timestamp</th>
              <th className="px-6 py-3 text-left text-gray-400 font-semibold">Type</th>
              <th className="px-6 py-3 text-left text-gray-400 font-semibold">Source</th>
              <th className="px-6 py-3 text-left text-gray-400 font-semibold">Destination</th>
              <th className="px-6 py-3 text-left text-gray-400 font-semibold">Severity</th>
              <th className="px-6 py-3 text-left text-gray-400 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-500/10">
            {filteredEvents.slice(0, 20).map((event, idx) => (
              <tr key={idx} className="hover:bg-slate-800/50 transition">
                <td className="px-6 py-3 text-gray-300 text-xs">
                  {new Date(event.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-3">
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                    {event.type}
                  </span>
                </td>
                <td className="px-6 py-3 text-gray-400 font-mono text-xs">{event.source}</td>
                <td className="px-6 py-3 text-gray-400 font-mono text-xs">{event.destination}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    event.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                    event.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    event.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {event.severity.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                    Blocked
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-gray-500 text-sm">
        Showing {Math.min(filteredEvents.length, 20)} of {filteredEvents.length} events
      </p>
    </div>
  );
}
