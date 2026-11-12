CREATE DATABASE IF NOT EXISTS autilearn CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE autilearn;

CREATE TABLE IF NOT EXISTS parent (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tutor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS child (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NOT NULL,
    tutor_id INT NULL,
    full_name VARCHAR(120) NOT NULL,
    age TINYINT UNSIGNED NOT NULL,
    learning_level ENUM('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_child_parent FOREIGN KEY (parent_id) REFERENCES parent(id) ON DELETE CASCADE,
    CONSTRAINT fk_child_tutor FOREIGN KEY (tutor_id) REFERENCES tutor(id) ON DELETE SET NULL,
    INDEX idx_child_parent (parent_id),
    INDEX idx_child_tutor (tutor_id)
);

CREATE TABLE IF NOT EXISTS history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    child_id INT NOT NULL,
    tutor_id INT NULL,
    activity ENUM('matching','spelling','tracing') NOT NULL,
    score INT UNSIGNED NOT NULL,
    total_questions INT UNSIGNED NOT NULL,
    duration_seconds INT UNSIGNED NOT NULL DEFAULT 0,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_child FOREIGN KEY (child_id) REFERENCES child(id) ON DELETE CASCADE,
    CONSTRAINT fk_history_tutor FOREIGN KEY (tutor_id) REFERENCES tutor(id) ON DELETE SET NULL,
    INDEX idx_history_child_date (child_id, completed_at),
    INDEX idx_history_tutor (tutor_id)
);
