# IQ Assessment System - Quick Start Guide

## 30-Second Overview

The IQ Assessment System automatically determines a child's learning difficulty level (Beginner/Intermediate/Advanced) based on a 10-question test. No more manual selection needed.

## Installation (5 minutes)

### Step 1: Database Migration
```bash
mysql -u root -p autilearn < backend/sql/schema.sql
```

Or manually run the schema update in your MySQL client.

### Step 2: Restart Backend Server
```bash
# Stop the running server, then restart:
cd backend
python app.py
```

### Step 3: Verify Installation
```bash
curl http://localhost:5000/api/health
```

Should return: `{"database": true, "status": "ok"}`

**✅ Installation complete!**

## Testing (2 minutes)

### Run Automated Tests
```bash
cd backend
python test_assessment.py
```

Expected output:
```
=== Running IQ Assessment Tests ===
✓ test_get_questions PASSED
✓ test_iq_scoring PASSED
✓ test_difficulty_mapping PASSED
✓ test_answer_validation PASSED
✓ test_edge_cases PASSED
✓ test_question_variety PASSED
=== All Tests PASSED ✓ ===
```

**✅ Tests passed!**

## First Use (5 minutes)

### Step 1: Login as Guardian
1. Open browser to `http://localhost:5000`
2. Login with guardian credentials

### Step 2: Create Child Profile
1. Click "Create Profile" button
2. Enter child's name, age
3. Click "Create Profile"

### Step 3: Start Assessment
1. New child appears in list
2. You'll see "📝 Start IQ Assessment" button
3. Click the button

### Step 4: Child Takes Test
1. 10 questions appear, one at a time
2. Select answer to each question
3. Get immediate feedback (✓ or ✗)
4. System automatically moves to next question

### Step 5: Results
1. IQ score appears (40-160)
2. Difficulty level assigned automatically
3. Back to dashboard

**✅ First assessment complete!**

### Step 6: Verify Persistence
1. Logout
2. Login again
3. Same child - same difficulty level persists

**✅ Data persists across sessions!**

## API Testing (3 minutes)

### Get Test Questions
```bash
JWT_TOKEN="your_jwt_token_here"

curl -H "Authorization: Bearer $JWT_TOKEN" \
  http://localhost:5000/api/assessment/test-questions
```

### Submit Assessment
```bash
curl -X POST \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "child_id": 1,
    "answers": {
      "1": 1, "2": 0, "3": 2, "4": 0, "5": 2,
      "6": 1, "7": 2, "8": 0, "9": 2, "10": 2
    }
  }' \
  http://localhost:5000/api/assessment/submit
```

Response should include IQ score and difficulty level.

## What Happens Next

### For Guardians
- Dashboard shows assessment status for each child
- Can click "Retake Assessment" to update IQ
- Can click "Override Difficulty" to manually set level
- Activities automatically use assigned difficulty

### For Children
- Activities adjust to assigned difficulty
- More questions/complexity if advanced
- Fewer questions/simpler if beginner
- Progress tracked in activity history

### For Activities
- Difficulty translates to question count:
  - Beginner: 2 questions
  - Intermediate: 3 questions
  - Advanced: 4 questions

## Common Tasks

### Retake Assessment
1. Child profile selected
2. Click "Retake Assessment"
3. Complete 10 questions again
4. New IQ score calculated
5. Difficulty may change

### Override Difficulty
1. Child profile selected
2. Click "Difficulty" section
3. Select new level (Easy/Medium/Hard)
4. Activities immediately use new difficulty

### View Assessment History
```bash
curl -H "Authorization: Bearer $JWT_TOKEN" \
  http://localhost:5000/api/assessment/history/1
```

Shows all past assessments with dates and IQ scores.

## Difficulty Levels Explained

| Level | IQ Range | What It Means |
|-------|----------|--------------|
| 🎈 Beginner | 40-69 | Start with basics, simple tasks |
| 🚀 Intermediate | 70-100 | Balanced challenge, good mix |
| ⭐ Advanced | 101-160 | Push harder, more complex |

## Troubleshooting

### Assessment Button Not Appearing
- Verify child doesn't have `iq_score` in database
- Check browser console for errors
- Refresh page

### Error: "All 10 questions must be answered"
- Make sure all 10 questions were answered
- Check API response for validation errors

### Difficulty Not Saving
- Check database migration completed
- Verify `child.learning_level` column exists
- Check browser console for API errors

### Can't Submit Assessment
- Verify JWT token is valid
- Check child_id in request body
- Verify all answers provided (1-10)

## Files to Know

### If Things Break
1. **Backend**: `backend/routes/assessment.py`
2. **Frontend**: `frontend/js/auth/assessment.js`
3. **Logic**: `backend/services/iq_assessment.py`
4. **Tests**: `backend/test_assessment.py`

### For More Info
1. `IQ_ASSESSMENT_README.md` - Full documentation
2. `TESTING_IQ_ASSESSMENT.md` - Testing procedures
3. `IQ_ASSESSMENT_FILES.md` - File listing

## Key Metrics

| Metric | Value |
|--------|-------|
| **Questions** | 10 |
| **IQ Range** | 40-160 |
| **Difficulty Levels** | 3 |
| **Assessment Time** | ~5 minutes |
| **API Endpoints** | 5 |
| **Database Tables** | 1 new |

## Rollback (Just in Case)

If you need to rollback:

1. **Restore Database**
   ```bash
   mysql -u root -p autilearn < backup.sql
   ```

2. **Restart Server**
   ```bash
   # Restart Flask
   ```

3. **Clear Browser Cache**
   ```
   Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
   ```

## Next Steps

1. ✅ Run backend tests: `python test_assessment.py`
2. ✅ Test end-to-end flow (create child → take assessment)
3. ✅ Verify difficulty persists (logout/login)
4. ✅ Test guardian override
5. ✅ Review documentation for advanced features
6. ✅ Monitor usage and collect feedback

## Support

**Something not working?**
1. Check `TESTING_IQ_ASSESSMENT.md` troubleshooting section
2. Review backend logs
3. Check browser console (F12)
4. Verify database schema: `DESCRIBE child;`

**Want more details?**
- Read `IQ_ASSESSMENT_README.md` for complete documentation
- Review source code comments
- Check `TESTING_IQ_ASSESSMENT.md` for testing procedures

---

**Estimated Total Setup Time**: 15-20 minutes
**Status**: Ready to deploy! 🚀
