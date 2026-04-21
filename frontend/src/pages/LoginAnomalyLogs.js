import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../services/api';

function LoginAnomalyLogs() {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const fetchAnomalies = async () => {
    setLoading(true);
    try {
      const res = await dashboardAPI.getStats();
      setAnomalies(res.data.anomalies?.recent_flagged || []);
    } catch (err) {
      console.error('Failed to fetch anomalies:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Login Anomaly Logs</h1>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <p className="text-gray-600">
          This page shows flagged login attempts detected as anomalous by the ML model.
          These attempts may indicate brute force attacks or unauthorized access attempts.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : anomalies.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No anomalous login attempts detected
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">User ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">IP Address</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Timestamp</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {anomalies.map((attempt) => (
                  <tr key={attempt.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{attempt.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{attempt.user_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <span className="font-mono text-sm">{attempt.ip_address}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {new Date(attempt.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded ${
                        attempt.flagged
                          ? 'bg-red-100 text-red-700'
                          : attempt.success
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {attempt.flagged ? 'Flagged' : attempt.success ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {attempt.flagged && (
                        <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 font-semibold">
                          High
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Total flagged attempts: {anomalies.length}
          </p>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Detection Features</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-500">Time of Day</p>
            <p className="font-medium">Login during unusual hours</p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-500">Failed Attempts</p>
            <p className="font-medium">Multiple failed logins</p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-500">IP Reputation</p>
            <p className="font-medium">Suspicious IP address</p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-500">Geolocation Change</p>
            <p className="font-medium">Login from different country</p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-500">Device Change</p>
            <p className="font-medium">Unknown device detected</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginAnomalyLogs;