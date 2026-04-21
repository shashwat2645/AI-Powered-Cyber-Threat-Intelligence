import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { dashboardAPI } from '../services/api';
import { onThreatCountUpdate } from '../services/socket';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liveCount, setLiveCount] = useState(0);

  useEffect(() => {
    fetchStats();
    
    onThreatCountUpdate(({ count }) => {
      setLiveCount(count);
    });
  }, []);

  const fetchStats = async () => {
    try {
      const res = await dashboardAPI.getStats();
      setStats(res.data);
    } catch (err) {
      setError('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  const chartData = stats?.recent_threats?.map((t, i) => ({
    name: new Date(t.detected_at).toLocaleDateString(),
    threats: stats.recent_threats.slice(0, i + 1).length,
    phishing: stats.recent_phishing.filter(p => new Date(p.detected_at) <= new Date(t.detected_at)).length
  })) || [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Threats</p>
              <p className="text-3xl font-bold text-gray-800">{liveCount || stats?.threats?.total || 0}</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-green-600">LIVE</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <p className="text-gray-500 text-sm">Phishing Detected</p>
          <p className="text-3xl font-bold text-red-600">{stats?.threats?.phishing_count || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <p className="text-gray-500 text-sm">Today's Threats</p>
          <p className="text-3xl font-bold text-yellow-600">{stats?.threats?.today || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <p className="text-gray-500 text-sm">Anomalies Today</p>
          <p className="text-3xl font-bold text-purple-600">{stats?.anomalies?.today || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Threats Over Time</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="threats"
                name="Total Threats"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
              />
              <Line
                type="monotone"
                dataKey="phishing"
                name="Phishing"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Threats</h2>
          <div className="space-y-3">
            {stats?.recent_threats?.slice(0, 5).map((threat) => (
              <div key={threat.id} className="flex justify-between items-center border-b border-gray-100 pb-2">
                <div>
                  <p className="font-medium text-gray-800 truncate w-48">{threat.url || threat.ip_address || threat.type}</p>
                  <p className="text-sm text-gray-500">{new Date(threat.detected_at).toLocaleString()}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${
                  threat.severity === 'critical' ? 'bg-red-100 text-red-700' :
                  threat.severity === 'high' ? 'bg-red-100 text-red-700' :
                  threat.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {threat.severity}
                </span>
              </div>
            )) || <p className="text-gray-500">No recent threats</p>}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Severity Breakdown</h2>
          <div className="space-y-3">
            {stats?.threats?.severity_breakdown?.map((item) => (
              <div key={item.severity} className="flex justify-between items-center">
                <span className="capitalize text-gray-700">{item.severity}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className={`h-2 rounded ${
                        item.severity === 'critical' || item.severity === 'high' ? 'bg-red-500' :
                        item.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(item.count / (stats?.threats?.total || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">{item.count}</span>
                </div>
              </div>
            )) || <p className="text-gray-500">No data available</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;