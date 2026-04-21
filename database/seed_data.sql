-- Seed data for testing

USE threat_intel;

-- Insert sample users (password: password123)
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@threatintel.local', '$2a$10$XK1h3dK2vT5yW9jNnqMxQu3bV0PQG8.H5z5x5x5x5x5x5x5x5x5x', 'Admin User', 'admin'),
('analyst@threatintel.local', '$2a$10$XK1h3dK2vT5yW9jNnqMxQu3bV0PQG8.H5z5x5x5x5x5x5x5x5x5x', 'Security Analyst', 'analyst'),
('viewer@threatintel.local', '$2a$10$XK1h3dK2vT5yW9jNnqMxQu3bV0PQG8.H5z5x5x5x5x5x5x5x5x5x', 'Viewer User', 'viewer');

-- Insert sample threats
INSERT INTO threats (title, description, severity, type, source, status, created_by) VALUES
('Suspicious Login Attempt', 'Multiple failed login attempts detected from unknown IP', 'high', 'intrusion', 'SIEM', 'investigating', 1),
('Malware Detection', 'Suspected malware file detected on endpoint', 'critical', 'malware', 'EDR', 'open', 1),
('Phishing Campaign', 'Phishing emails targeting organization employees', 'medium', 'phishing', 'Email Gateway', 'open', 2),
('DDoS Attack', 'Large scale DDoS attack on web servers', 'critical', 'ddos', 'Network', 'mitigated', 1),
('Data Exfiltration', 'Suspicious data transfer detected', 'high', 'exfiltration', 'DLP', 'investigating', 2);

-- Insert sample indicators
INSERT INTO indicators (type, value, description, threat_score, classification) VALUES
('ip', '192.168.1.100', 'Internal suspicious IP', 0.85, 'malicious'),
('ip', '10.0.0.50', 'Known malicious IP', 0.95, 'malicious'),
('domain', 'malicious-site.com', 'Suspected phishing domain', 0.78, 'suspicious'),
('domain', 'safe-domain.com', 'Known safe domain', 0.01, 'benign'),
('url', 'http://malicious-site.com/payload', 'Malicious URL', 0.92, 'malicious'),
('file_hash', 'a1b2c3d4e5f6', 'Suspicious file hash', 0.88, 'malicious'),
('ip', '8.8.8.8', 'Public DNS server', 0.05, 'benign');

-- Insert sample analyses
INSERT INTO analyses (indicator_id, analysis_type, result, threat_score, confidence, ml_model_version, performed_by) VALUES
(1, 'ip_reputation', '{"country": "US", "is_proxy": true}', 0.85, 0.92, 'v1.0.0', 2),
(2, 'ip_reputation', '{"country": "CN", "is_proxy": false}', 0.95, 0.88, 'v1.0.0', 2),
(3, 'domain_analysis', '{"registrar": "GoDaddy", "age_days": 30}', 0.78, 0.75, 'v1.0.0', 2);

-- Insert sample alerts
INSERT INTO alerts (threat_id, indicator_id, alert_type, message, severity, acknowledged_by) VALUES
(1, 1, 'login_failure', 'Multiple failed login attempts detected', 'high', 2),
(2, 2, 'malware_detected', 'Malware signature matched', 'critical', 1),
(3, 3, 'phishing_detected', 'Phishing domain identified', 'medium', NULL);

-- Insert sample threat feeds
INSERT INTO threat_feeds (name, source_url, feed_type) VALUES
('AlienVault OTX', 'https://otx.alienvault.com/api', 'iocs'),
('ThreatFox', 'https://threatfox-api.abuse.ch', 'malware'),
('Abuse.ch URLhaus', 'https://urlhaus-api.abuse.ch', 'urls');