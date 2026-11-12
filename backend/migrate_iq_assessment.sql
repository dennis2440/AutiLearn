-- Migration script: Add IQ Assessment columns to child table
-- Run this to add the new columns for the IQ Assessment system

-- Step 1: Add new columns to child table
ALTER TABLE child ADD COLUMN IF NOT EXISTS iq_score INT NULL;
ALTER TABLE child ADD COLUMN IF NOT EXISTS iq_assessed_at TIMESTAMP NULL;
ALTER TABLE child ADD COLUMN IF NOT EXISTS iq_override_level ENUM('beginner','intermediate','advanced') NULL;

-- Step 2: Create iq_assessment table
CREATE TABLE IF NOT EXISTS iq_assessment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    child_id INT NOT NULL,
    iq_score INT NOT NULL,
    answers TEXT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assessment_child FOREIGN KEY (child_id) REFERENCES child(id) ON DELETE CASCADE,
    INDEX idx_assessment_child (child_id)
);

-- Verify the changes
SHOW COLUMNS FROM child;
SHOW TABLES LIKE 'iq_assessment';
