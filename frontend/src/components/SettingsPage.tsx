import { useState } from 'react';

export function SettingsPage() {
  const [settings, setSettings] = useState({
    dashboardName: 'Sentinel-SecOps',
    theme: 'dark',
    emailAlerts: true,
    smsAlerts: false,
    siemIntegration: true,
    autoLogoff: true,
    logoffTimeout: '30 min',
    dataRetention: '90 Days',
    backupFrequency: 'Daily'
  });

  const handleToggle = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">System Settings</h1>

      <div className="grid grid-cols-2 gap-6">
        {/* General */}
        <div className="bg-slate-900 border border-purple-500/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">General</h2>
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm">Dashboard Name</label>
              <input
                type="text"
                value={settings.dashboardName}
                className="w-full mt-1 bg-slate-800 border border-purple-500/20 rounded px-3 py-2 text-sm text-gray-300"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm">Theme</label>
              <select className="w-full mt-1 bg-slate-800 border border-purple-500/20 rounded px-3 py-2 text-sm text-gray-300">
                <option>Dark</option>
                <option>Light</option>
              </select>
            </div>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded px-4 py-2 text-sm font-semibold transition">
              Save Changes
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-slate-900 border border-purple-500/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-gray-400 text-sm">Email Alerts</label>
              <button
                onClick={() => handleToggle('emailAlerts')}
                className={`px-3 py-1 rounded text-xs font-semibold transition ${
                  settings.emailAlerts 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-slate-700 text-gray-400'
                }`}
              >
                {settings.emailAlerts ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-gray-400 text-sm">SMS Alerts</label>
              <button
                onClick={() => handleToggle('smsAlerts')}
                className={`px-3 py-1 rounded text-xs font-semibold transition ${
                  settings.smsAlerts 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-slate-700 text-gray-400'
                }`}
              >
                {settings.smsAlerts ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-gray-400 text-sm">SIEM Integration</label>
              <button
                onClick={() => handleToggle('siemIntegration')}
                className={`px-3 py-1 rounded text-xs font-semibold transition ${
                  settings.siemIntegration 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-slate-700 text-gray-400'
                }`}
              >
                {settings.siemIntegration ? 'Configured' : 'Not Configured'}
              </button>
            </div>
          </div>
        </div>

        {/* API & Integrations */}
        <div className="bg-slate-900 border border-purple-500/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">API & Integrations</h2>
          <div className="space-y-3">
            <div>
              <label className="text-gray-400 text-xs">Azure Sentinel</label>
              <p className="text-purple-400 text-sm font-semibold">Connected</p>
            </div>
            <div>
              <label className="text-gray-400 text-xs">Splunk</label>
              <p className="text-purple-400 text-sm font-semibold">Configured</p>
            </div>
            <div>
              <label className="text-gray-400 text-xs">API Key</label>
              <p className="text-gray-500 text-xs font-mono">••••••••••••••••••••••••••••</p>
              <button className="mt-2 text-purple-400 hover:text-purple-300 text-xs font-semibold">
                Regenerate
              </button>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-slate-900 border border-purple-500/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Data Management</h2>
          <div className="space-y-3">
            <div>
              <label className="text-gray-400 text-sm">Data Retention Period</label>
              <select className="w-full mt-1 bg-slate-800 border border-purple-500/20 rounded px-3 py-2 text-sm text-gray-300">
                <option>90 Days</option>
                <option>180 Days</option>
                <option>1 Year</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Backup Frequency</label>
              <select className="w-full mt-1 bg-slate-800 border border-purple-500/20 rounded px-3 py-2 text-sm text-gray-300">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
            <button className="w-full text-red-400 hover:text-red-300 text-sm font-semibold border border-red-500/20 rounded px-4 py-2 transition">
              Clear Audit Logs
            </button>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-slate-900 border border-purple-500/20 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Security</h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="text-gray-400 text-sm">Password Policy</label>
            <p className="text-purple-400 text-sm font-semibold mt-1">
              <a href="#" className="hover:underline">Configure</a>
            </p>
          </div>
          <div>
            <label className="text-gray-400 text-sm">2FA Settings</label>
            <p className="text-purple-400 text-sm font-semibold mt-1">Configured</p>
          </div>
          <div>
            <label className="text-gray-400 text-sm">Role Management</label>
            <div className="mt-2 space-y-1 text-xs">
              <p className="text-gray-400">Admin</p>
              <p className="text-gray-400">Analyst</p>
              <p className="text-gray-400">Auditor</p>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-slate-900 border border-purple-500/20 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Audit Logs</h2>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {[
            { user: 'Admin', action: 'Dashboard Accessed', time: '2024-05-15 12:23:88' },
            { user: 'Analyst', action: 'Report Generated', time: '2024-05-15 12:22:19' },
            { user: 'Analyst', action: 'Settings Modified', time: '2024-05-15 12:10:11' },
            { user: 'Auditor', action: 'Logs Reviewed', time: '2024-05-15 10:20:15' }
          ].map((log, idx) => (
            <div key={idx} className="flex justify-between text-xs p-2 bg-slate-800/50 rounded border-l-2 border-purple-500">
              <span className="text-gray-400">{log.user}</span>
              <span className="text-purple-400">{log.action}</span>
              <span className="text-gray-500">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
