# IQ Assessment System - Testing Guide

## Backend Testing

### 1. Run Automated Tests
```bash
cd backend
python test_assessment.py
```

**Expected Output:**
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

### 2. Manual API Testing with cURL

#### Get Questions
```bash
curl -H "Authorization: Bearer <JWT_TOKEN>" \
  http://localhost:5000/api/assessment/test-questions
```

**Expected Response:**
```json
{
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "question": "What comes next...",
      "options": ["24", "32", "20", "28"]
    },
    ...
  ]
}
```

#### Submit Assessment
```bash
curl -X POST \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "child_id": 1,
    "answers": {
      "1": 1,
      "2": 0,
      "3": 2,
      "4": 0,
      "5": 2,
      "6": 1,
      "7": 2,
      "8": 0,
      "9": 2,
      "10": 2
    }
  }' \
  http://localhost:5000/api/assessment/submit
```

**Expected Response:**
```json
{
  "message": "Assessment completed.",
  "assessment_id": 1,
  "iq_score": 100,
  "difficulty_level": "intermediate"
}
```

#### Get Assessment
```bash
curl -H "Authorization: Bearer <JWT_TOKEN>" \
  http://localhost:5000/api/assessment/1
```

**Expected Response:**
```json
{
  "assessment": {
    "id": 1,
    "iq_score": 100,
    "completed_at": "2024-11-12T10:30:00"
  }
}
```

#### Override Difficulty
```bash
curl -X PUT \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"difficulty_level": "advanced"}' \
  http://localhost:5000/api/assessment/1/override-difficulty
```

**Expected Response:**
```json
{
  "message": "Difficulty level updated.",
  "difficulty_level": "advanced"
}
```

## Frontend Testing

### 1. Test Assessment UI
1. Open browser to `http://localhost:5000`
2. Login as guardian
3. Create a child profile (if not exists)
4. Click "Start IQ Assessment" button
5. Answer 10 questions
6. Verify feedback appears after each answer
7. Check that results show IQ score and difficulty level

### 2. Test Guardian Dashboard
1. After assessment completes, verify:
   - Assessment indicator shows ✓ (completed)
   - "Start IQ Assessment" button disappears
   - Difficulty is now set to auto-assigned level

### 3. Test Persistence
1. Complete assessment
2. Logout
3. Login again
4. Verify difficulty level is same as before
5. Verify assessment history is available

### 4. Test Override
1. As guardian, click menu to override difficulty
2. Select different difficulty level
3. Verify activities now use new difficulty
4. Logout and login to verify override persists

## Database Verification

### Check Schema
```sql
DESCRIBE child;
```

**Should include:**
- `iq_score INT`
- `iq_assessed_at TIMESTAMP`
- `iq_override_level ENUM('beginner','intermediate','advanced')`

### Check Assessment Table
```sql
DESCRIBE iq_assessment;
```

**Should show:**
- `id INT AUTO_INCREMENT PRIMARY KEY`
- `child_id INT`
- `iq_score INT`
- `answers TEXT`
- `completed_at TIMESTAMP`

### View Assessment Data
```sql
SELECT c.full_name, c.iq_score, c.learning_level, a.completed_at
FROM child c
LEFT JOIN iq_assessment a ON c.id = a.child_id
ORDER BY a.completed_at DESC;
```

## Integration Tests

### Test 1: End-to-End Assessment Flow
1. Start: Create new child profile
2. Expected: Assessment prompt appears
3. Action: Take assessment (answer 10 questions)
4. Expected: IQ score calculated, difficulty assigned
5. Action: Check child details
6. Expected: `learning_level` updated to match IQ
7. Action: Retake assessment with different answers
8. Expected: IQ score updated, difficulty may change

### Test 2: Cross-Session Persistence
1. Start: Complete assessment for child
2. Note: IQ score and difficulty level
3. Action: Logout
4. Action: Login again
5. Expected: Child shows same IQ score and difficulty
6. Expected: Assessment history available

### Test 3: Guardian Override
1. Start: Child has auto-assigned difficulty
2. Action: Guardian clicks override button
3. Action: Select different difficulty level
4. Expected: `learning_level` updated
5. Expected: `iq_override_level` set to override value
6. Action: Check activities
7. Expected: Activities use overridden difficulty

### Test 4: Multiple Children
1. Start: Guardian with 2 children
2. Action: Complete assessment for child 1
3. Expected: Child 1 has IQ score, child 2 doesn't
4. Action: Complete assessment for child 2 with different score
5. Expected: Each child has own IQ score and difficulty
6. Expected: Activities for each child reflect their difficulty

### Test 5: Assessment Retake
1. Start: Child has existing assessment
2. Expected: "Retake Assessment" button available
3. Action: Retake with better answers
4. Expected: New IQ score calculated
5. Expected: Old assessment preserved in history
6. Expected: New assessment becomes current

### Test 6: Permission Validation
1. Start: Guardian A with child
2. Action: Try to access child's assessment via wrong parent ID
3. Expected: 403 Forbidden error
4. Action: Try to submit assessment for another guardian's child
5. Expected: 403 Forbidden error

## Performance Testing

### Load Testing
```bash
# Install Apache Bench if not available
ab -n 100 -c 10 \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  http://localhost:5000/api/assessment/test-questions
```

**Expected:**
- Response time < 200ms
- No errors
- Database handles load

### Stress Testing
- Submit 50 assessments concurrently
- Verify all complete successfully
- Check database for data integrity

## Error Scenario Testing

### Scenario 1: Missing Questions
- Submit assessment with only 5 answers
- Expected: 400 Bad Request with message "All 10 questions must be answered"

### Scenario 2: Invalid Answer Index
- Submit assessment with answer index 999
- Expected: 400 Bad Request with message "Invalid answer index"

### Scenario 3: Invalid Child ID
- Submit assessment for non-existent child
- Expected: 403 Forbidden

### Scenario 4: Unauthorized Access
- Try to access without JWT token
- Expected: 401 Unauthorized

### Scenario 5: Ownership Violation
- Guardian A tries to access Guardian B's child assessment
- Expected: 403 Forbidden

## Checklist Before Deployment

### Code Quality
- [ ] All backend tests passing
- [ ] No Python syntax errors
- [ ] No JavaScript syntax errors
- [ ] Code follows project style
- [ ] Comments are clear and accurate

### Database
- [ ] Migration script tested
- [ ] New tables created
- [ ] New columns added
- [ ] Existing data migrated correctly
- [ ] Backup created

### Frontend
- [ ] Assessment view renders correctly
- [ ] All questions display properly
- [ ] Feedback system works
- [ ] Results display correctly
- [ ] Guardian dashboard updated

### Integration
- [ ] API endpoints tested
- [ ] Database connectivity verified
- [ ] Authentication working
- [ ] Authorization working
- [ ] Error handling working

### Security
- [ ] Input validation working
- [ ] SQL injection prevention verified
- [ ] CORS configured correctly
- [ ] JWT validation working
- [ ] Role-based access control verified

### Performance
- [ ] Load test successful
- [ ] Response times acceptable
- [ ] Database queries optimized
- [ ] No memory leaks
- [ ] Concurrent requests handled

### User Experience
- [ ] Assessment is clear and easy
- [ ] Feedback is helpful
- [ ] Results are understandable
- [ ] Guardian controls work
- [ ] Error messages are helpful

### Documentation
- [ ] API documentation updated
- [ ] Database schema documented
- [ ] Frontend components documented
- [ ] User guide written
- [ ] Deployment guide written

## Debugging Tips

### Backend Debugging
1. Check Python syntax:
   ```bash
   python -m py_compile routes/assessment.py
   ```

2. Test imports:
   ```bash
   python -c "from services.iq_assessment import *; print('OK')"
   ```

3. Enable debug logging:
   ```python
   import logging
   logging.basicConfig(level=logging.DEBUG)
   ```

4. Database connection:
   ```bash
   python -c "from db import check_connection; print(check_connection())"
   ```

### Frontend Debugging
1. Open browser console (F12)
2. Check for JavaScript errors
3. Monitor network tab for API calls
4. Check localStorage for Store data
5. Verify JWT token in Authorization header

### Database Debugging
1. Check MySQL connection:
   ```bash
   mysql -h 127.0.0.1 -u root -p autilearn
   ```

2. Verify tables created:
   ```sql
   SHOW TABLES;
   ```

3. Check schema:
   ```sql
   DESCRIBE child;
   DESCRIBE iq_assessment;
   ```

## Expected Output Examples

### Successful Assessment Submission
```json
{
  "message": "Assessment completed.",
  "assessment_id": 1,
  "iq_score": 85,
  "difficulty_level": "intermediate"
}
```

### Successful Override
```json
{
  "message": "Difficulty level updated.",
  "difficulty_level": "advanced"
}
```

### Assessment History
```json
{
  "assessments": [
    {
      "id": 2,
      "iq_score": 95,
      "completed_at": "2024-11-13T15:30:00"
    },
    {
      "id": 1,
      "iq_score": 85,
      "completed_at": "2024-11-12T10:30:00"
    }
  ]
}
```

## Support & Troubleshooting

### Common Issues

1. **"Child profile not found"**
   - Check child_id is correct
   - Verify guardian owns the child
   - Check JWT token includes correct user_id

2. **"Assessment already exists"** (if you added this check)
   - Expected behavior - child already completed assessment
   - Use retake endpoint to take again

3. **API returns 500**
   - Check Python server logs
   - Verify database connection
   - Check SQL syntax in routes

4. **Frontend shows no questions**
   - Check API is returning questions
   - Verify JWT token valid
   - Check browser console for errors

5. **Difficulty not persisting**
   - Check database update successful
   - Verify learning_level column exists
   - Check frontend fetches updated value

### Contact & Support
For issues, check:
1. Logs in backend terminal
2. Browser console (F12)
3. Database for data integrity
4. This testing guide for expected behavior
