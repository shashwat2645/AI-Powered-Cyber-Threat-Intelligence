import React, { useEffect, useState } from 'react';
import { threatsAPI } from '../services/api';

function ThreatLogs() {
  const [threats, setThreats] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ severity: '', status: '', type: '' });

  useEffect(() => {
    fetchThreats();
  }, [pagination.page, filters]);

  const fetchThreats = async () => {
    setLoading(true);
    try {
      const res = await threatsAPI.getAll(pagination.page, pagination.limit, filters);
      setThreats(res.data.threats);
      setPagination(prev => ({ ...prev, ...res.data.pagination }));
    } catch (err) {
      console.error('Failed to fetch threats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Threat Logs</h1>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.severity}
            onChange={(e) => handleFilterChange('severity', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="mitigated">Mitigated</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="phishing">Phishing</option>
            <option value="malware">Malware</option>
            <option value="ddos">DDoS</option>
            <option value="intrusion">Intrusion</option>
            <option value="ransomware">Ransomware</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">URL / IP</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Severity</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Source</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Detected</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : threats.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    No threats found
                  </td>
                </tr>
              ) : (
                threats.map((threat) => (
                  <tr key={threat.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{threat.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 capitalize">{threat.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                      {threat.url || threat.ip_address || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded ${getSeverityColor(threat.severity)}`}>
                        {threat.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{threat.status}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{threat.source}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {new Date(threat.detected_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {threats.length} of {pagination.total} threats
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThreatLogs;