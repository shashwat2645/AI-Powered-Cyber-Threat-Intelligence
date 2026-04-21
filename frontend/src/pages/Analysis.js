import React, { useState } from 'react';
import api from '../services/api';

function Analysis() {
  const [indicator, setIndicator] = useState({ type: 'ip', value: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/analysis/analyze', indicator);
      setResult(res.data);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Threat Analysis</h1>
      <div className="card">
        <h3>Analyze Indicator</h3>
        <form onSubmit={handleAnalyze}>
          <div className="form-group">
            <label>Indicator Type</label>
            <select value={indicator.type} onChange={(e) => setIndicator({ ...indicator, type: e.target.value })}>
              <option value="ip">IP Address</option>
              <option value="domain">Domain</option>
              <option value="url">URL</option>
              <option value="file_hash">File Hash</option>
            </select>
          </div>
          <div className="form-group">
            <label>Indicator Value</label>
            <input type="text" value={indicator.value} onChange={(e) => setIndicator({ ...indicator, value: e.target.value })} placeholder="Enter indicator..." required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Analyzing...' : 'Analyze'}</button>
        </form>
      </div>
      {result && (
        <div className="card">
          <h3>Analysis Result</h3>
          <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default Analysis;