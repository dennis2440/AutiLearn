// IQ Assessment View - First time learner onboarding
const ASSESSMENT_CONFIG = {
  totalQuestions: 10,
  questionWaitTime: 3000 // Time to show feedback before moving to next question
};

Views.assessment = async (el, childId) => {
  let currentQuestion = 0;
  let userAnswers = {};
  let isSubmitting = false;
  let assessmentStartTime = Date.now();

  // Fetch test questions from backend
  let questions = [];
  try {
    const response = await Api.get("/api/assessment/test-questions");
    questions = response.questions || [];
  } catch (e) {
    console.error("Failed to fetch assessment questions:", e.message);
    toast("Error loading assessment. Please try again.");
    return go("guardian");
  }

  if (questions.length === 0) {
    toast("No assessment questions available.");
    return go("guardian");
  }

  const renderQuestion = () => {
    const q = questions[currentQuestion];
    const progress = Math.round((currentQuestion / questions.length) * 100);

    el.innerHTML = `
      <section style="max-width:600px;margin:0 auto;padding:20px">
        <div style="margin-bottom:20px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <h2 style="margin:0">Assessment</h2>
            <span style="font-size:1.2rem;font-weight:bold">${currentQuestion + 1}/${questions.length}</span>
          </div>
          <div style="width:100%;height:8px;background:#e0e0e0;border-radius:4px;overflow:hidden">
            <div style="width:${progress}%;height:100%;background:#4CAF50;transition:width 0.3s ease"></div>
          </div>
        </div>

        <div style="background:#f9f9f9;padding:24px;border-radius:12px;margin-bottom:24px">
          <h3 style="margin:0 0 20px 0;font-size:1.3rem;color:#333">${q.question}</h3>
          
          <div id="options" style="display:flex;flex-direction:column;gap:12px">
            ${q.options.map((opt, idx) => `
              <button 
                class="option-btn" 
                data-index="${idx}"
                style="padding:16px;border:2px solid #ddd;background:#fff;border-radius:8px;cursor:pointer;font-size:1rem;text-align:left;transition:all 0.2s ease;font-weight:500"
              >
                ${q.type === "true_false" ? "" : `${String.fromCharCode(65 + idx)}. `}${opt}
              </button>
            `).join("")}
          </div>
        </div>

        <div style="text-align:center;color:#666;font-size:0.9rem">
          <p>📌 Read carefully and select your answer</p>
        </div>
      </section>
    `;

    // Attach event listeners to options
    el.querySelectorAll(".option-btn").forEach(btn => {
      btn.onclick = (e) => {
        const selectedIndex = parseInt(e.currentTarget.dataset.index);
        selectAnswer(selectedIndex);
      };
    });
  };

  const selectAnswer = (selectedIndex) => {
    const q = questions[currentQuestion];
    userAnswers[q.id] = selectedIndex;

    // Show feedback
    const optionBtns = el.querySelectorAll(".option-btn");
    const isCorrect = selectedIndex === q.correct_index;

    optionBtns.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.correct_index) {
        btn.style.background = "#4CAF50";
        btn.style.borderColor = "#4CAF50";
        btn.style.color = "#fff";
      } else if (idx === selectedIndex && !isCorrect) {
        btn.style.background = "#f44336";
        btn.style.borderColor = "#f44336";
        btn.style.color = "#fff";
      }
    });

    // Show feedback message
    const feedbackDiv = document.createElement("div");
    feedbackDiv.style.cssText = `
      position:absolute;
      top:50%;
      left:50%;
      transform:translate(-50%, -50%);
      background:${isCorrect ? "#4CAF50" : "#f44336"};
      color:white;
      padding:20px 40px;
      border-radius:8px;
      font-size:1.2rem;
      font-weight:bold;
      z-index:1000;
    `;
    feedbackDiv.textContent = isCorrect ? "✓ Correct!" : "✗ Not quite right";
    document.body.appendChild(feedbackDiv);

    // Move to next question or submit
    setTimeout(() => {
      feedbackDiv.remove();
      if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        renderQuestion();
      } else {
        submitAssessment();
      }
    }, ASSESSMENT_CONFIG.questionWaitTime);
  };

  const submitAssessment = async () => {
    if (isSubmitting) return;
    isSubmitting = true;

    el.innerHTML = `
      <section style="max-width:600px;margin:0 auto;padding:40px 20px;text-align:center">
        <div style="font-size:3rem;margin-bottom:20px">⏳</div>
        <h2>Calculating your results...</h2>
        <p style="color:#666">Processing your assessment answers...</p>
      </section>
    `;

    try {
      const response = await Api.post("/api/assessment/submit", {
        child_id: childId,
        answers: userAnswers
      });

      const { iq_score, difficulty_level } = response;

      // Show results
      showResults(iq_score, difficulty_level);
    } catch (e) {
      console.error("Assessment submission failed:", e.message);
      toast("Error submitting assessment. Please try again.");
      go("guardian");
    }
  };

  const showResults = (iqScore, difficultyLevel) => {
    const difficultyMap = {
      beginner: { icon: "🎈", label: "Beginner", color: "#4CAF50", description: "Great start! We'll begin with foundational concepts." },
      intermediate: { icon: "🚀", label: "Intermediate", color: "#2196F3", description: "You're ready for a balanced challenge!" },
      advanced: { icon: "⭐", label: "Advanced", color: "#FF9800", description: "Excellent! We'll provide challenging tasks." }
    };

    const levelInfo = difficultyMap[difficultyLevel];

    el.innerHTML = `
      <section style="max-width:600px;margin:0 auto;padding:40px 20px;text-align:center">
        <div style="font-size:2rem;margin-bottom:20px">${levelInfo.icon}</div>
        <h2 style="margin-bottom:10px">Assessment Complete!</h2>
        
        <div style="background:linear-gradient(120deg, ${levelInfo.color}33, ${levelInfo.color}11);padding:30px;border-radius:12px;margin:30px 0;border:2px solid ${levelInfo.color}">
          <div style="font-size:3rem;font-weight:bold;color:${levelInfo.color};margin-bottom:10px">${iqScore}</div>
          <div style="font-size:1.5rem;font-weight:bold;color:${levelInfo.color};margin-bottom:15px">IQ Score</div>
          <div style="font-size:1.3rem;font-weight:bold;margin-bottom:10px">${levelInfo.label} Level</div>
          <p style="color:#666;margin:10px 0">${levelInfo.description}</p>
        </div>

        <div style="background:#f5f5f5;padding:20px;border-radius:8px;margin:20px 0">
          <p style="margin:0;color:#666">Your difficulty level has been automatically set. You can retake this assessment or ask your guardian to adjust it anytime.</p>
        </div>

        <button class="card ok" style="width:100%;min-height:50px;margin-top:20px" onclick="handleAssessmentComplete('${difficultyLevel}')">
          Continue Learning 🎓
        </button>
      </section>
    `;
  };

  // Initial render
  renderQuestion();
};

function handleAssessmentComplete(difficultyLevel) {
  Store.s.difficulty = {
    beginner: 1,
    intermediate: 2,
    advanced: 3
  }[difficultyLevel];
  Store.save();
  go("guardian");
}
