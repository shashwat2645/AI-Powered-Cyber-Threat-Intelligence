import React, { useState } from 'react';
import { threatsAPI } from '../services/api';

function ThreatScanner() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await threatsAPI.scan(url);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Scan failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setUrl('');
    setResult(null);
    setError('');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Threat Scanner</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <form onSubmit={handleScan}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Enter URL to Scan
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !url}
              className="bg-primary hover:bg-slate-800 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {loading ? 'Scanning...' : 'Scan URL'}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {result && (
        <>
          <div className={`rounded-lg shadow p-6 mb-6 ${
            result.ml_result?.is_phishing 
              ? 'bg-red-50 border-l-4 border-red-500' 
              : 'bg-green-50 border-l-4 border-green-500'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {result.ml_result?.is_phishing ? 'Phishing Detected' : 'URL is Safe'}
                </h2>
                <p className="text-gray-600">{url}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Confidence</p>
                <p className={`text-2xl font-bold ${
                  result.ml_result?.confidence > 0.8 ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {Math.round(result.ml_result?.confidence * 100)}%
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Threat Details:</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">{result.threat?.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Severity</p>
                  <span className={`px-2 py-1 text-xs rounded ${
                    result.threat?.severity === 'critical' ? 'bg-red-100 text-red-700' :
                    result.threat?.severity === 'high' ? 'bg-red-100 text-red-700' :
                    result.threat?.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {result.threat?.severity}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                    {result.threat?.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Source</p>
                  <p className="font-medium">{result.threat?.source}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Feature Analysis</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Feature</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Value</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Risk Indicator</th>
                  </tr>
                </thead>
                <tbody>
                  {result.ml_result?.features && Object.entries(result.ml_result.features).map(([key, value]) => (
                    <tr key={key} className="border-t border-gray-100">
                      <td className="px-4 py-2 text-sm text-gray-700 capitalize">
                        {key.replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">{String(value)}</td>
                      <td className="px-4 py-2">
                        {key.includes('ip') && value === 1 && (
                          <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">High Risk</span>
                        )}
                        {key.includes('domain') && value > 365 && (
                          <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">Low Risk</span>
                        )}
                        {key.includes('domain') && value > 0 && value <= 30 && (
                          <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">New Domain</span>
                        )}
                        {(!key.includes('ip') && !key.includes('domain')) && (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ThreatScanner;