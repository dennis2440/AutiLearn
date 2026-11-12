"""
Test script for IQ Assessment system
Validates scoring logic, difficulty mapping, and edge cases
"""

from services.iq_assessment import (
    get_test_questions,
    calculate_iq_score,
    map_iq_to_difficulty,
    validate_assessment_answers,
    IQ_QUESTIONS
)

def test_get_questions():
    """Test that questions are returned without answers"""
    questions = get_test_questions()
    assert len(questions) == 10, "Should return 10 questions"
    for q in questions:
        assert "id" in q, "Each question should have id"
        assert "question" in q, "Each question should have text"
        assert "options" in q, "Each question should have options"
        assert "type" in q, "Each question should have type"
        assert "correct_index" not in q, "Should not include correct answers"
    print("✓ test_get_questions PASSED")

def test_iq_scoring():
    """Test IQ score calculation"""
    # All correct = 160
    all_correct = {q["id"]: q["correct_index"] for q in IQ_QUESTIONS}
    assert calculate_iq_score(all_correct) == 160, "10/10 correct = 160 IQ"
    
    # All wrong = 40
    all_wrong = {q["id"]: (q["correct_index"] + 1) % len(q["options"]) for q in IQ_QUESTIONS}
    assert calculate_iq_score(all_wrong) == 40, "0/10 correct = 40 IQ"
    
    # 5 correct = 100
    half_correct = {}
    for i, q in enumerate(IQ_QUESTIONS):
        if i < 5:
            half_correct[q["id"]] = q["correct_index"]
        else:
            half_correct[q["id"]] = (q["correct_index"] + 1) % len(q["options"])
    assert calculate_iq_score(half_correct) == 100, "5/10 correct = 100 IQ"
    
    print("✓ test_iq_scoring PASSED")

def test_difficulty_mapping():
    """Test IQ to difficulty mapping"""
    # Low IQ = Beginner
    assert map_iq_to_difficulty(50) == "beginner", "IQ 50 = beginner"
    assert map_iq_to_difficulty(69) == "beginner", "IQ 69 = beginner"
    
    # Mid IQ = Intermediate
    assert map_iq_to_difficulty(70) == "intermediate", "IQ 70 = intermediate"
    assert map_iq_to_difficulty(100) == "intermediate", "IQ 100 = intermediate"
    
    # High IQ = Advanced
    assert map_iq_to_difficulty(101) == "advanced", "IQ 101 = advanced"
    assert map_iq_to_difficulty(160) == "advanced", "IQ 160 = advanced"
    
    print("✓ test_difficulty_mapping PASSED")

def test_answer_validation():
    """Test answer validation"""
    # Valid: all questions answered
    valid_answers = {q["id"]: q["correct_index"] for q in IQ_QUESTIONS}
    is_valid, msg = validate_assessment_answers(valid_answers)
    assert is_valid, f"Valid answers should pass: {msg}"
    
    # Invalid: missing questions
    incomplete = {1: 0, 2: 1}
    is_valid, msg = validate_assessment_answers(incomplete)
    assert not is_valid, "Incomplete answers should fail"
    
    # Invalid: wrong type
    is_valid, msg = validate_assessment_answers("not a dict")
    assert not is_valid, "Non-dict input should fail"
    
    # Invalid: invalid question ID
    bad_id = {q["id"]: q["correct_index"] for q in IQ_QUESTIONS}
    bad_id[999] = 0
    is_valid, msg = validate_assessment_answers(bad_id)
    assert not is_valid, "Invalid question ID should fail"
    
    # Invalid: out of range answer index
    bad_index = {q["id"]: q["correct_index"] for q in IQ_QUESTIONS}
    bad_index[1] = 999
    is_valid, msg = validate_assessment_answers(bad_index)
    assert not is_valid, "Out of range answer should fail"
    
    print("✓ test_answer_validation PASSED")

def test_edge_cases():
    """Test edge cases"""
    # Empty answers
    is_valid, msg = validate_assessment_answers({})
    assert not is_valid, "Empty answers should fail"
    
    # None answers
    is_valid, msg = validate_assessment_answers(None)
    assert not is_valid, "None answers should fail"
    
    # Borderline IQ scores
    assert map_iq_to_difficulty(69) == "beginner"
    assert map_iq_to_difficulty(70) == "intermediate"
    assert map_iq_to_difficulty(100) == "intermediate"
    assert map_iq_to_difficulty(101) == "advanced"
    
    print("✓ test_edge_cases PASSED")

def test_question_variety():
    """Verify question diversity"""
    questions = get_test_questions()
    
    # Check mix of types
    types = [q["type"] for q in questions]
    assert "multiple_choice" in types, "Should have multiple choice questions"
    assert "true_false" in types, "Should have true/false questions"
    
    # Check all options present
    for q in questions:
        assert len(q["options"]) >= 2, f"Question {q['id']} should have at least 2 options"
        assert len(q["options"]) <= 4, f"Question {q['id']} should have max 4 options"
    
    print("✓ test_question_variety PASSED")

if __name__ == "__main__":
    print("\n=== Running IQ Assessment Tests ===\n")
    
    try:
        test_get_questions()
        test_iq_scoring()
        test_difficulty_mapping()
        test_answer_validation()
        test_edge_cases()
        test_question_variety()
        
        print("\n=== All Tests PASSED ✓ ===\n")
    except AssertionError as e:
        print(f"\n✗ TEST FAILED: {e}\n")
        exit(1)
    except Exception as e:
        print(f"\n✗ ERROR: {e}\n")
        exit(1)
