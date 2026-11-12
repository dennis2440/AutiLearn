# Database Migration - IQ Assessment System

Your application is running but the database schema needs to be updated to support the IQ Assessment feature.

## Quick Fix (Choose One)

### Option 1: Using MySQL Client (Recommended)

```bash
mysql -u root -p autilearn < backend/migrate_iq_assessment.sql
```

Then enter your MySQL password when prompted.

### Option 2: Using MySQL CLI Directly

1. Open MySQL command line:
```bash
mysql -u root -p
```

2. Select the database:
```sql
USE autilearn;
```

3. Run the migration:
```sql
ALTER TABLE child ADD COLUMN IF NOT EXISTS iq_score INT NULL;
ALTER TABLE child ADD COLUMN IF NOT EXISTS iq_assessed_at TIMESTAMP NULL;
ALTER TABLE child ADD COLUMN IF NOT EXISTS iq_override_level ENUM('beginner','intermediate','advanced') NULL;

CREATE TABLE IF NOT EXISTS iq_assessment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    child_id INT NOT NULL,
    iq_score INT NOT NULL,
    answers TEXT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assessment_child FOREIGN KEY (child_id) REFERENCES child(id) ON DELETE CASCADE,
    INDEX idx_assessment_child (child_id)
);
```

4. Verify success:
```sql
SHOW COLUMNS FROM child;
SHOW TABLES LIKE 'iq_assessment';
```

You should see:
- `iq_score` column (INT)
- `iq_assessed_at` column (TIMESTAMP)
- `iq_override_level` column (ENUM)
- `iq_assessment` table

### Option 3: Using MySQL Workbench

1. Open MySQL Workbench
2. Select your connection
3. Open `backend/migrate_iq_assessment.sql`
4. Execute the script (⚡ button)

## After Migration

1. **Restart Flask server**
```bash
# Stop the running server (Ctrl+C)
# Then restart:
cd backend
python app.py
```

2. **Refresh your browser**
- Clear cache: `Ctrl+Shift+Delete`
- Reload page: `F5`

3. **Test the application**
- Login to guardian dashboard
- Try adding a new learner
- The errors should be gone!

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | API working perfectly |
| 422 | Missing JWT token or invalid role |
| 500 | Database column not found (needs migration) |

## If You Get Errors

### Error: "Unknown column 'iq_score'"
→ You haven't run the migration yet. See "Quick Fix" above.

### Error: "Access denied for user"
→ Check your MySQL credentials (root password)

### Error: "Unknown database 'autilearn'"
→ Create database first:
```bash
mysql -u root -p -e "CREATE DATABASE autilearn CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p autilearn < backend/sql/schema.sql
mysql -u root -p autilearn < backend/migrate_iq_assessment.sql
```

## Verification

After migration, run this command to confirm:

```bash
mysql -u root -p -e "USE autilearn; DESCRIBE child; SHOW TABLES LIKE 'iq_assessment';"
```

Should show all the new columns and table.

---

**Need help?** The error message in the logs will tell you exactly what's wrong. Common issues are fixed above.
