import React, { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { connectSocket, disconnectSocket, onNewThreat, onThreatCountUpdate, onAnomalyAlert, removeNewThreatListener, removeThreatCountListener, removeAnomalyListener } from '../services/socket';

const SocketProvider = ({ children }) => {
  const [threatCount, setThreatCount] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    connectSocket();
    setConnected(true);

    onNewThreat((threat) => {
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } ${threat.severity === 'critical' ? 'bg-red-600' : 'bg-yellow-500'} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-semibold">New {threat.severity.toUpperCase()} Threat!</p>
            <p className="text-sm">{threat.type} - {threat.url || threat.ip_address}</p>
          </div>
        </div>
      ), {
        duration: 5000,
        position: 'top-right'
      });
    });

    onThreatCountUpdate(({ count }) => {
      setThreatCount(count);
    }));

    onAnomalyAlert((alert) => {
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } bg-purple-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-semibold">Suspicious Login!</p>
            <p className="text-sm">IP: {alert.ip_address} (Risk: {(alert.risk_score * 100).toFixed(0)}%)</p>
          </div>
        </div>
      ), {
        duration: 5000,
        position: 'top-right'
      });
    });

    return () => {
      removeNewThreatListener();
      removeThreatCountListener();
      removeAnomalyListener();
      disconnectSocket();
    };
  }, []);

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: '',
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '14px',
            borderRadius: '8px',
            padding: '12px'
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff'
            }
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff'
            }
          }
        }}
      />
      {children}
    </>
  );
};

export { SocketProvider, threatCount };
export default SocketProvider;