-- Cyber Threat Intelligence Platform Database Schema

CREATE DATABASE IF NOT EXISTS threat_intel;
USE threat_intel;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role ENUM('admin', 'analyst', 'viewer') DEFAULT 'viewer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Threats table
CREATE TABLE IF NOT EXISTS threats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    type VARCHAR(100),
    source VARCHAR(255),
    status ENUM('open', 'investigating', 'mitigated', 'closed') DEFAULT 'open',
    created_by INT,
    assigned_to INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- Indicators table
CREATE TABLE IF NOT EXISTS indicators (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('ip', 'domain', 'url', 'file_hash', 'email') NOT NULL,
    value VARCHAR(1000) NOT NULL,
    description TEXT,
    threat_score DECIMAL(3, 2) DEFAULT 0.00,
    classification ENUM('benign', 'suspicious', 'malicious') DEFAULT 'benign',
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Indicator tag relationship
CREATE TABLE IF NOT EXISTS indicator_tags (
    indicator_id INT,
    tag VARCHAR(100),
    PRIMARY KEY (indicator_id, tag),
    FOREIGN KEY (indicator_id) REFERENCES indicators(id) ON DELETE CASCADE
);

-- Analyses table
CREATE TABLE IF NOT EXISTS analyses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    indicator_id INT,
    analysis_type VARCHAR(100),
    result JSON,
    threat_score DECIMAL(3, 2),
    confidence DECIMAL(3, 2),
    ml_model_version VARCHAR(50),
    performed_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (indicator_id) REFERENCES indicators(id),
    FOREIGN KEY (performed_by) REFERENCES users(id)
);

-- Threat intelligence feeds
CREATE TABLE IF NOT EXISTS threat_feeds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    source_url VARCHAR(500),
    feed_type VARCHAR(100),
    active BOOLEAN DEFAULT TRUE,
    last_fetch TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    threat_id INT,
    indicator_id INT,
    alert_type VARCHAR(100),
    message TEXT,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by INT,
    acknowledged_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (threat_id) REFERENCES threats(id),
    FOREIGN KEY (indicator_id) REFERENCES indicators(id),
    FOREIGN KEY (acknowledged_by) REFERENCES users(id)
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100),
    entity_type VARCHAR(50),
    entity_id INT,
    old_value JSON,
    new_value JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_threats_severity ON threats(severity);
CREATE INDEX idx_threats_status ON threats(status);
CREATE INDEX idx_indicators_type ON indicators(type);
CREATE INDEX idx_indicators_value ON indicators(value);
CREATE INDEX idx_indicators_classification ON indicators(classification);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);