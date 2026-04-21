import React, { useEffect, useState } from 'react';
import api from '../services/api';

function Indicators() {
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newIndicator, setNewIndicator] = useState({ type: 'ip', value: '', description: '' });

  useEffect(() => {
    fetchIndicators();
  }, []);

  const fetchIndicators = async () => {
    try {
      const res = await api.get('/indicators');
      setIndicators(res.data);
    } catch (error) {
      console.error('Failed to fetch indicators:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/indicators', newIndicator);
      setNewIndicator({ type: 'ip', value: '', description: '' });
      fetchIndicators();
    } catch (error) {
      console.error('Failed to create indicator:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.delete(`/indicators/${id}`);
      fetchIndicators();
    } catch (error) {
      console.error('Failed to delete indicator:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="page-title">Indicators</h1>
      <div className="card">
        <h3>Add New Indicator</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Type</label>
            <select value={newIndicator.type} onChange={(e) => setNewIndicator({ ...newIndicator, type: e.target.value })}>
              <option value="ip">IP Address</option>
              <option value="domain">Domain</option>
              <option value="url">URL</option>
              <option value="hash">File Hash</option>
            </select>
          </div>
          <div className="form-group">
            <label>Value</label>
            <input type="text" value={newIndicator.value} onChange={(e) => setNewIndicator({ ...newIndicator, value: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={newIndicator.description} onChange={(e) => setNewIndicator({ ...newIndicator, description: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary">Add Indicator</button>
        </form>
      </div>
      <div className="card">
        {indicators.length === 0 ? <p>No indicators found.</p> : (
          <table className="table">
            <thead>
              <tr><th>Type</th><th>Value</th><th>Description</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {indicators.map((ind) => (
                <tr key={ind.id}>
                  <td>{ind.type}</td>
                  <td>{ind.value}</td>
                  <td>{ind.description}</td>
                  <td><button className="btn" onClick={() => handleDelete(ind.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Indicators;