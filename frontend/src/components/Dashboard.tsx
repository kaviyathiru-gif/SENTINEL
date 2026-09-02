import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, TrendingUp, Globe, Shield } from 'lucide-react';
import type { SecurityEvent, SystemHealth } from '../types';

interface DashboardProps {
  events: SecurityEvent[];
  systemHealth: SystemHealth;
  threatCount: number;
}

const threatData = [
  { name: 'Brute Force', value: 245 },
  { name: 'Malware', value: 189 },
  { name: 'Port Scan', value: 156 },
  { name: 'DoS', value: 98 },
  { name: 'SQL Injection', value: 67 }
];

const complianceData = [
  { name: 'GDPR', value: 92 },
  { name: 'HIPAA', value: 88 },
  { name: 'ISO', value: 95 },
  { name: 'SOC 2', value: 85 }
];

const eventTypeData = [
  { time: '00:00', alerts: 12, warnings: 8 },
  { time: '04:00', alerts: 15, warnings: 11 },
  { time: '08:00', alerts: 22, warnings: 14 },
  { time: '12:00', alerts: 18, warnings: 12 },
  { time: '16:00', alerts: 25, warnings: 16 },
  { time: '20:00', alerts: 20, warnings: 13 }
];

export function Dashboard({ events, systemHealth, threatCount }: DashboardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cybersecurity Dashboard</h1>
          <p className="text-gray-400 mt-1">Live Network Security Status</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Admin: J. Dee</p>
          <p className="text-xs text-gray-600">Last updated: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="Active Threats"
          value={threatCount.toLocaleString()}
          subtext="24h detection"
          icon="🔴"
          trend="+12%"
        />
        <MetricCard
          label="System Uptime"
          value={systemHealth.uptime}
          subtext="99.9% reliability"
          icon="✅"
          trend="+0.1%"
        />
        <MetricCard
          label="CPU Usage"
          value={`${systemHealth.cpuUsage}%`}
          subtext="normal load"
          icon="⚡"
          trend="-5%"
        />
        <MetricCard
          label="Memory"
          value={`${systemHealth.memoryUsage}%`}
          subtext="allocated"
          icon="🧠"
          trend="+2%"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Global Threat Map */}
        <div className="col-span-1 bg-slate-900 border border-purple-500/20 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-400" />
              Global Threat Map
            </h2>
            <select className="bg-slate-800 border border-purple-500/20 rounded px-2 py-1 text-xs text-gray-300">
              <option>Active Threats</option>
              <option>Critical Only</option>
              <option>All Events</option>
            </select>
          </div>
          <div className="h-40 bg-gradient-to-b from-slate-800 to-slate-900 rounded border border-purple-500/10 flex items-center justify-center mb-4">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-2 relative">
                {/* World map background */}
                <div className="absolute inset-0 bg-slate-700 rounded-lg opacity-20" />
                {/* Threat indicators */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-pink-500 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.5, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.25
                    }}
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            <p>Active Threats: <span className="text-pink-400 font-semibold">{threatCount.toLocaleString()}</span></p>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="col-span-1 bg-slate-900 border border-purple-500/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            System Health Overview
          </h2>
          <div className="space-y-4">
            <HealthMetric label="CPU" value={systemHealth.cpuUsage} />
            <HealthMetric label="Memory" value={systemHealth.memoryUsage} />
            <HealthMetric label="Network" value={75} />
          </div>
          <div className="mt-6 pt-4 border-t border-purple-500/10 text-sm">
            <p className="text-gray-400">System Uptime</p>
            <p className="text-lg font-semibold text-green-400">99.9%</p>
          </div>
        </div>

        {/* Recent Events */}
        <div className="col-span-1 bg-slate-900 border border-purple-500/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-purple-400" />
            Recent Security Events
          </h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {events.slice(0, 6).map((event, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-2 bg-slate-800/50 rounded border-l-2 border-pink-500 text-xs"
              >
                <p className="text-pink-400 font-semibold">{event.type}</p>
                <p className="text-gray-400 text-[10px] mt-1">{event.source}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Threat Types Chart */}
        <div className="bg-slate-900 border border-purple-500/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Top Attacked Countries</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={threatData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 85, 247, 0.1)" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(168, 85, 247, 0.3)'
                }}
                labelStyle={{ color: '#d1d5db' }}
              />
              <Bar dataKey="value" fill="#a855f7" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Compliance Scorecard */}
        <div className="bg-slate-900 border border-purple-500/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Compliance Scorecard</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={complianceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                <Cell fill="#a855f7" />
                <Cell fill="#ec4899" />
                <Cell fill="#06b6d4" />
                <Cell fill="#f59e0b" />
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(168, 85, 247, 0.3)'
                }}
                labelStyle={{ color: '#d1d5db' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Event Timeline */}
      <div className="bg-slate-900 border border-purple-500/20 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          Event Timeline (24h)
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={eventTypeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 85, 247, 0.1)" />
            <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(168, 85, 247, 0.3)'
              }}
              labelStyle={{ color: '#d1d5db' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="alerts"
              stroke="#a855f7"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
            />
            <Line
              type="monotone"
              dataKey="warnings"
              stroke="#ec4899"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MetricCard({ label, value, subtext, icon, trend }: any) {
  return (
    <motion.div
      className="bg-slate-900 border border-purple-500/20 rounded-lg p-4 hover:border-purple-500/40 transition"
      whileHover={{ translateY: -2 }}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs text-green-400">{trend}</span>
      </div>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{subtext}</p>
    </motion.div>
  );
}

function HealthMetric({ label, value }: any) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-purple-400 font-semibold">{value}%</span>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
