"""
IQ Assessment Service
Handles IQ test questions, scoring, and difficulty mapping based on global IQ standards.
"""

# IQ Test Questions (10 questions - mix of multiple choice and true/false)
IQ_QUESTIONS = [
    {
        "id": 1,
        "type": "multiple_choice",
        "question": "What comes next in the sequence? 2, 4, 8, 16, ?",
        "options": ["24", "32", "20", "28"],
        "correct_index": 1,  # 32
        "difficulty": "easy"
    },
    {
        "id": 2,
        "type": "true_false",
        "question": "True or False: A square has 4 equal sides.",
        "options": ["True", "False"],
        "correct_index": 0,  # True
        "difficulty": "easy"
    },
    {
        "id": 3,
        "type": "multiple_choice",
        "question": "If a train travels 60 km/h for 2 hours, how far does it go?",
        "options": ["30 km", "60 km", "120 km", "180 km"],
        "correct_index": 2,  # 120 km
        "difficulty": "medium"
    },
    {
        "id": 4,
        "type": "true_false",
        "question": "True or False: An octopus has 8 legs.",
        "options": ["True", "False"],
        "correct_index": 0,  # True
        "difficulty": "easy"
    },
    {
        "id": 5,
        "type": "multiple_choice",
        "question": "What is the missing number? 5, 10, 20, 40, ?",
        "options": ["50", "60", "80", "90"],
        "correct_index": 2,  # 80
        "difficulty": "medium"
    },
    {
        "id": 6,
        "type": "true_false",
        "question": "True or False: The capital of France is London.",
        "options": ["True", "False"],
        "correct_index": 1,  # False
        "difficulty": "easy"
    },
    {
        "id": 7,
        "type": "multiple_choice",
        "question": "What is 15% of 200?",
        "options": ["20", "25", "30", "35"],
        "correct_index": 2,  # 30
        "difficulty": "medium"
    },
    {
        "id": 8,
        "type": "true_false",
        "question": "True or False: Water boils at 100°C at sea level.",
        "options": ["True", "False"],
        "correct_index": 0,  # True
        "difficulty": "medium"
    },
    {
        "id": 9,
        "type": "multiple_choice",
        "question": "If you have 3 apples and your friend gives you 5 more, then you give away 2, how many do you have?",
        "options": ["4", "5", "6", "8"],
        "correct_index": 2,  # 6
        "difficulty": "easy"
    },
    {
        "id": 10,
        "type": "multiple_choice",
        "question": "What is 2^5 (2 to the power of 5)?",
        "options": ["10", "25", "32", "64"],
        "correct_index": 2,  # 32
        "difficulty": "hard"
    }
]

def get_test_questions():
    """Return all IQ test questions (without answers)."""
    return [
        {
            "id": q["id"],
            "type": q["type"],
            "question": q["question"],
            "options": q["options"]
        }
        for q in IQ_QUESTIONS
    ]

def calculate_iq_score(answers):
    """
    Calculate IQ score based on answers.
    
    Parameters:
    - answers: dict with question_id as key and selected_index as value
      Example: {1: 1, 2: 0, 3: 2, ...}
    
    Returns:
    - iq_score (int): Score between 40-160 based on global IQ standards
    """
    if not answers or len(answers) != len(IQ_QUESTIONS):
        return None
    
    correct_count = 0
    for question in IQ_QUESTIONS:
        q_id = question["id"]
        if q_id in answers:
            if answers[q_id] == question["correct_index"]:
                correct_count += 1
    
    # Map correct answers to IQ score
    # 0 correct = 40 (very low)
    # 5 correct = 100 (average)
    # 10 correct = 160 (very high)
    # Using linear scaling: IQ = 40 + (correct_count / 10) * 120
    iq_score = 40 + (correct_count / 10) * 120
    return int(iq_score)

def map_iq_to_difficulty(iq_score):
    """
    Map IQ score to difficulty level based on global IQ standards.
    
    IQ Distribution:
    - Below 70: Beginner
    - 70-100: Medium
    - Above 100: Advanced
    
    Returns:
    - difficulty_level (str): 'beginner', 'intermediate', or 'advanced'
    """
    if iq_score < 70:
        return "beginner"
    elif iq_score <= 100:
        return "intermediate"
    else:
        return "advanced"

def validate_assessment_answers(answers):
    """
    Validate that all required questions are answered correctly.
    
    Parameters:
    - answers: dict with question_id as key and selected_index as value
    
    Returns:
    - (is_valid, error_message)
    """
    if not isinstance(answers, dict):
        return False, "Answers must be a dictionary."
    
    if len(answers) != len(IQ_QUESTIONS):
        return False, f"All {len(IQ_QUESTIONS)} questions must be answered."
    
    for q_id, selected_index in answers.items():
        if not isinstance(q_id, int) or not isinstance(selected_index, int):
            return False, "Question IDs and answer indices must be integers."
        
        question = next((q for q in IQ_QUESTIONS if q["id"] == q_id), None)
        if not question:
            return False, f"Invalid question ID: {q_id}."
        
        if selected_index < 0 or selected_index >= len(question["options"]):
            return False, f"Invalid answer index for question {q_id}."
    
    return True, ""
