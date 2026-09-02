import { BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { SecurityEvent } from '../types';

const performanceData = [
  { hour: '0', latency: 45, threats: 12 },
  { hour: '4', latency: 52, threats: 8 },
  { hour: '8', latency: 48, threats: 22 },
  { hour: '12', latency: 61, threats: 15 },
  { hour: '16', latency: 55, threats: 28 },
  { hour: '20', latency: 49, threats: 18 }
];

const mlMetrics = [
  { name: 'Accuracy', value: 98.5, target: 95 },
  { name: 'Precision', value: 96.2, target: 90 },
  { name: 'Recall', value: 94.1, target: 85 },
  { name: 'F1-Score', value: 95.1, target: 88 }
];

export function AnalyticsPage({ events }: { events: SecurityEvent[] }) {
  const eventTypes = events.reduce((acc: Record<string, number>, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {});

  const eventTypeData = Object.entries(eventTypes).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics & Insights</h1>

      {/* ML Model Performance */}
      <div className="grid grid-cols-4 gap-4">
        {mlMetrics.map(metric => (
          <div key={metric.name} className="bg-slate-900 border border-purple-500/20 rounded-lg p-4">
            <p className="text-gray-400 text-sm">{metric.name}</p>
            <p className="text-2xl font-bold text-purple-400 mt-2">{metric.value}%</p>
            <p className="text-xs text-gray-500 mt-1">Target: {metric.target}%</p>
            <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{ width: `${(metric.value / 100) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-purple-500/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Response Latency (ms)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 85, 247, 0.1)" />
              <XAxis dataKey="hour" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(168, 85, 247, 0.3)'
                }}
                labelStyle={{ color: '#d1d5db' }}
              />
              <Line
                type="monotone"
                dataKey="latency"
                stroke="#3b82f6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 border border-purple-500/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Threat Detection Rate</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 85, 247, 0.1)" />
              <XAxis dataKey="hour" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(168, 85, 247, 0.3)'
                }}
                labelStyle={{ color: '#d1d5db' }}
              />
              <Bar dataKey="threats" fill="#a855f7" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Event Distribution */}
      <div className="bg-slate-900 border border-purple-500/20 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Event Type Distribution</h2>
        <div className="grid grid-cols-5 gap-4">
          {eventTypeData.slice(0, 5).map(item => (
            <div key={item.name} className="bg-slate-800/50 rounded p-3 text-center">
              <p className="text-xs text-gray-400 mb-2">{item.name}</p>
              <p className="text-2xl font-bold text-purple-400">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
