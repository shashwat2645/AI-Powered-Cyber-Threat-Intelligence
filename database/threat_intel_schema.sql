-- Cyber Threat Intelligence Platform Schema

CREATE DATABASE IF NOT EXISTS threat_intel;
USE threat_intel;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'analyst', 'viewer') DEFAULT 'viewer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    failed_login_attempts INT DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    INDEX idx_users_email (email),
    INDEX idx_users_username (username)
) ENGINE=InnoDB;

-- Threats table
CREATE TABLE threats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('malware', 'phishing', 'ddos', 'intrusion', 'ransomware', 'botnet', 'other') NOT NULL,
    url VARCHAR(2000),
    ip_address VARCHAR(45),
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('open', 'investigating', 'mitigated', 'resolved', 'false_positive') DEFAULT 'open',
    source VARCHAR(255),
    reported_by INT,
    FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_threats_type (type),
    INDEX idx_threats_severity (severity),
    INDEX idx_threats_status (status),
    INDEX idx_threats_detected_at (detected_at)
) ENGINE=InnoDB;

-- Login attempts table
CREATE TABLE login_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    ip_address VARCHAR(45) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT FALSE,
    flagged BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_login_user_id (user_id),
    INDEX idx_login_timestamp (timestamp),
    INDEX idx_login_flagged (flagged)
) ENGINE=InnoDB;

-- Phishing reports table
CREATE TABLE phishing_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(2000) NOT NULL,
    features_json JSON NOT NULL,
    prediction ENUM('benign', 'phishing', 'suspicious') NOT NULL,
    confidence_score DECIMAL(5,4) NOT NULL,
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reported_by INT,
    threat_id INT,
    FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (threat_id) REFERENCES threats(id) ON DELETE SET NULL,
    INDEX idx_phishing_url (url(500)),
    INDEX idx_phishing_prediction (prediction)
) ENGINE=InnoDB;