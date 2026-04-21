import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

let socket = null;

export const connectSocket = () => {
  if (socket?.connected) return socket;
  
  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    autoConnect: true
  });
  
  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });
  
  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });
  
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });
  
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const onNewThreat = (callback) => {
  if (socket) {
    socket.on('new-threat', callback);
  }
};

export const onThreatCountUpdate = (callback) => {
  if (socket) {
    socket.on('threat-count-update', callback);
  }
};

export const onAnomalyAlert = (callback) => {
  if (socket) {
    socket.on('anomaly-alert', callback);
  }
};

export const removeNewThreatListener = () => {
  if (socket) {
    socket.off('new-threat');
  }
};

export const removeThreatCountListener = () => {
  if (socket) {
    socket.off('threat-count-update');
  }
};

export const removeAnomalyListener = () => {
  if (socket) {
    socket.off('anomaly-alert');
  }
};

export default { connectSocket, disconnectSocket, getSocket, onNewThreat, onThreatCountUpdate, onAnomalyAlert };