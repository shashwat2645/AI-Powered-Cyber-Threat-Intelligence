let io = null;

module.exports = (socketIO) => {
  io = socketIO;
  
  return {
    emitNewThreat: (threat) => {
      if (io) {
        io.emit('new-threat', {
          id: threat.id,
          type: threat.type,
          severity: threat.severity,
          url: threat.url,
          ip_address: threat.ip_address,
          source: threat.source,
          detected_at: threat.detected_at,
          message: `New ${threat.severity} severity ${threat.type} threat detected`
        });
        console.log(`Emitted new-threat event for threat ID: ${threat.id}`);
      }
    },
    
    emitThreatCountUpdate: (count) => {
      if (io) {
        io.emit('threat-count-update', { count });
      }
    },
    
    emitAnomalyAlert: (data) => {
      if (io) {
        io.emit('anomaly-alert', {
          user_id: data.user_id,
          ip_address: data.ip_address,
          risk_score: data.risk_score,
          timestamp: new Date().toISOString(),
          message: `Suspicious login attempt detected from ${data.ip_address}`
        });
        console.log(`Emitted anomaly-alert for user: ${data.user_id}`);
      }
    },
    
    emitScanComplete: (result) => {
      if (io) {
        io.emit('scan-complete', result);
      }
    }
  };
};

module.exports.getIO = () => io;