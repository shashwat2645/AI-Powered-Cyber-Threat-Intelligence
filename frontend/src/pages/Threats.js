import React, { useEffect, useState } from 'react';
import api from '../services/api';

function Threats() {
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchThreats();
  }, []);

  const fetchThreats = async () => {
    try {
      const res = await api.get('/threats');
      setThreats(res.data);
    } catch (error) {
      console.error('Failed to fetch threats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this threat?')) return;
    try {
      await api.delete(`/threats/${id}`);
      fetchThreats();
    } catch (error) {
      console.error('Failed to delete threat:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="page-title">Threats</h1>
      <div className="card">
        {threats.length === 0 ? (
          <p>No threats found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Severity</th>
                <th>Type</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {threats.map((threat) => (
                <tr key={threat.id}>
                  <td>{threat.id}</td>
                  <td>{threat.title}</td>
                  <td className={`threat-${threat.severity?.toLowerCase()}`}>{threat.severity}</td>
                  <td>{threat.type}</td>
                  <td>{new Date(threat.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn" onClick={() => handleDelete(threat.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Threats;