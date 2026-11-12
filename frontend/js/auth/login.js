// Authentication with real backend API integration
const Auth = {
  token: () => localStorage.getItem("autilearn_token"),
  setToken: (t) => localStorage.setItem("autilearn_token", t),
  
  session() {
    try {
      return JSON.parse(localStorage.getItem("autilearn_session"));
    } catch {
      return null;
    }
  },
  
  logout() {
    localStorage.removeItem("autilearn_token");
    localStorage.removeItem("autilearn_session");
  },
  
  async submit(mode, email, password, role, profile = {}) {
    email = email.trim().toLowerCase();
    
    if (mode === "register") {
      // REGISTER: POST to backend API
      const response = await Api.post("/api/auth/register", {
        full_name: profile.fullName || "",
        email: email,
        password: password,
        role: role
      });
      
      // Store token and session
      Auth.setToken(response.access_token);
      localStorage.setItem("autilearn_session", JSON.stringify({
        user_id: response.user.id,
        full_name: response.user.full_name,
        email: response.user.email,
        role: response.user.role
      }));
      
      // Initialize context
      if (!window.AUTILEARN_CONTEXT) {
        window.AUTILEARN_CONTEXT = { user_id: response.user.id, role: response.user.role, child_id: null, activity_start_time: null, duration: 0 };
      } else {
        window.AUTILEARN_CONTEXT.user_id = response.user.id;
        window.AUTILEARN_CONTEXT.role = response.user.role;
      }
      
      return role;
    } else {
      // LOGIN: POST to backend API
      const response = await Api.post("/api/auth/login", {
        email: email,
        password: password,
        role: role
      });
      
      // Store token and session
      Auth.setToken(response.access_token);
      localStorage.setItem("autilearn_session", JSON.stringify({
        user_id: response.user.id,
        full_name: response.user.full_name,
        email: response.user.email,
        role: response.user.role
      }));
      
      // Initialize context
      if (!window.AUTILEARN_CONTEXT) {
        window.AUTILEARN_CONTEXT = { user_id: response.user.id, role: response.user.role, child_id: null, activity_start_time: null, duration: 0 };
      } else {
        window.AUTILEARN_CONTEXT.user_id = response.user.id;
        window.AUTILEARN_CONTEXT.role = response.user.role;
      }
      
      return role;
    }
  },
};

Views.login = (el) => {
  el.innerHTML = `<form class="auth" novalidate>
    <div style="text-align:center;font-size:3.5rem;line-height:1">🧩</div>
    <h2>Welcome to AutiLearn!</h2>
    <p>A happy place to learn, practise and grow — one little step at a time.</p>
    <div class="seg" role="radiogroup" aria-label="Account action">
      <label><input type="radio" name="mode" value="login" checked><span>Sign in</span></label>
      <label><input type="radio" name="mode" value="register"><span>Create account</span></label>
    </div>

    <section id="profileFields" hidden aria-label="Registration details">
      <h3 class="auth-subtitle">Let's set up your account</h3>
      <div class="auth-fields">
        <label for="fullName">Full name <span class="required">*</span><input id="fullName" name="fullName" autocomplete="name" placeholder="Your full name" required></label>
        <label for="email">Email address <span class="required">*</span><input id="email" name="email" type="email" autocomplete="email" placeholder="name@example.com" required></label>
        <label for="phone">Phone number <span class="required">*</span><input id="phone" name="phone" type="tel" autocomplete="tel" placeholder="e.g. 07XX XXX XXX" required></label>
        <div id="guardianFields">
          <label for="relationship">Your relationship to the learner <span class="required">*</span>
            <select id="relationship" name="relationship" required>
              <option value="">Choose relationship</option><option>Mother</option><option>Father</option><option>Guardian</option><option>Other caregiver</option>
            </select>
          </label>
          <div class="auth-fields two">
            <label for="learnerName">Learner's first name <span class="required">*</span><input id="learnerName" name="learnerName" placeholder="Child's first name" required></label>
            <label for="learnerAge">Learner's age <span class="required">*</span>
            <select id="learnerAge" name="learnerAge" required>
              <option value="">Choose age group</option>
              <option value="2-4">2-4 years</option>
              <option value="5-7">5-7 years</option>
              <option value="8-10">8-10 years</option>
              <option value="11-13">11-13 years</option>
              <option value="14-16">14-16 years</option>
              <option value="17-18">17-18 years</option>
            </select>
            </label>
          </div>
          <label for="learningPreferences">Learning preferences or support notes <span class="optional">(optional)</span>
            <textarea id="learningPreferences" name="learningPreferences" rows="3" placeholder="For example: prefers visual instructions, quiet activities or short learning sessions."></textarea>
          </label>
          <p class="privacy-hint">Please share only information you are comfortable providing. A medical diagnosis is not required.</p>
        </div>
        <div id="teacherFields" hidden>
          <label for="school">School / learning centre <span class="required">*</span><input id="school" name="school" placeholder="Name of school or centre" required></label>
          <label for="position">Your role <span class="required">*</span>
            <select id="position" name="position" required><option value="">Choose your role</option><option>Teacher</option><option>Special needs educator</option><option>Therapist</option><option>School administrator</option><option>Other education professional</option></select>
          </label>
        </div>
      </div>
    </section>

    <label for="emailInput">Email address<input id="emailInput" type="email" autocomplete="email" placeholder="Enter your email" required></label>
    <label for="p">Password<div class="password-wrapper"><input id="p" type="password" autocomplete="current-password" placeholder="Enter your password" required minlength="8"><button type="button" class="pwd-toggle" id="toggleP" aria-label="Show/hide password">👁️</button></div></label>
    <label id="confirmWrap" for="confirmPassword" hidden>Confirm password<div class="password-wrapper"><input id="confirmPassword" type="password" autocomplete="new-password" placeholder="Re-enter your password"><button type="button" class="pwd-toggle" id="toggleConfirm" aria-label="Show/hide password">👁️</button></div></label>
    <fieldset class="seg"><legend id="roleLegend">I am signing in as</legend>
      <label><input type="radio" name="role" value="guardian" checked><span>👨‍👩‍👧 Parent / Guardian</span></label>
      <label><input type="radio" name="role" value="tutor"><span>👩‍🏫 Teacher</span></label>
    </fieldset>
    <label id="consentWrap" class="consent" hidden><input id="consent" type="checkbox"> <span>I agree to the use of these details to create and manage my AutiLearn account. <span class="required">*</span></span></label>
    <p id="err" role="alert" aria-live="polite"></p>
    <button class="card ok" id="go" type="submit" style="width:100%;min-height:58px">Let's go! →</button>
    <small style="text-align:center;color:#7186a1">A calm, supportive learning space for every learner.</small>
  </form>`;

  const f = el.querySelector("form");
  const val = n => f.querySelector(`[name=${n}]:checked`).value;
  const mode = () => val("mode");
  const role = () => val("role");
  const profileFields = f.querySelector("#profileFields");
  const guardianFields = f.querySelector("#guardianFields");
  const teacherFields = f.querySelector("#teacherFields");
  const confirmWrap = f.querySelector("#confirmWrap");
  const consentWrap = f.querySelector("#consentWrap");
  const error = f.querySelector("#err");

  // Password visibility toggles
  const toggleP = f.querySelector("#toggleP");
  const toggleConfirm = f.querySelector("#toggleConfirm");
  const pInput = f.querySelector("#p");
  const confirmInput = f.querySelector("#confirmPassword");
  
  if (toggleP) {
    toggleP.onclick = (e) => {
      e.preventDefault();
      const isPassword = pInput.type === "password";
      pInput.type = isPassword ? "text" : "password";
      toggleP.textContent = isPassword ? "🙈" : "👁️";
    };
  }
  
  if (toggleConfirm) {
    toggleConfirm.onclick = (e) => {
      e.preventDefault();
      const isPassword = confirmInput.type === "password";
      confirmInput.type = isPassword ? "text" : "password";
      toggleConfirm.textContent = isPassword ? "🙈" : "👁️";
    };
  }

  const updateForm = () => {
    const registering = mode() === "register";
    const isGuardian = role() === "guardian";
    profileFields.hidden = !registering;
    confirmWrap.hidden = !registering;
    consentWrap.hidden = !registering;
    guardianFields.hidden = !registering || !isGuardian;
    teacherFields.hidden = !registering || isGuardian;
    f.querySelector("#roleLegend").textContent = registering ? "I am creating an account as" : "I am signing in as";
    f.querySelector("#go").textContent = registering ? "Create my account →" : "Let's go! →";
    ["fullName","email","phone","relationship","learnerName","learnerAge","school","position"].forEach(id => {
      const input = f.querySelector("#"+id);
      if (input) input.required = registering && !input.closest("[hidden]");
    });
    f.querySelector("#confirmPassword").required = registering;
    f.querySelector("#consent").required = registering;
    error.textContent = "";
  };
  f.onchange = updateForm;
  updateForm();

  f.onsubmit = async (e) => {
    e.preventDefault();
    const registering = mode() === "register";
    const email = f.querySelector("#emailInput").value.trim();
    const p = f.querySelector("#p").value;
    
    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return (error.textContent = "Please enter a valid email address.");
    }
    
    if (p.length < (registering ? 8 : 6)) {
      return (error.textContent = registering ? "Your password must contain at least 8 characters." : "Please enter your password.");
    }
    
    if (registering) {
      if (!f.reportValidity()) return;
      if (p !== f.querySelector("#confirmPassword").value) return (error.textContent = "Your passwords do not match. Please try again.");
      if (!f.querySelector("#consent").checked) return (error.textContent = "Please agree before creating your account.");
    }
    
    const accountRole = role();
    const profile = registering ? {
      fullName: f.querySelector("#fullName").value.trim(),
      email: email,
      phone: f.querySelector("#phone").value.trim(),
      ...(accountRole === "guardian" ? {
        relationship: f.querySelector("#relationship").value,
        learnerName: f.querySelector("#learnerName").value.trim(),
        learnerAge: Number(f.querySelector("#learnerAge").value),
        learningPreferences: f.querySelector("#learningPreferences").value.trim()
      } : {
        school: f.querySelector("#school").value.trim(),
        position: f.querySelector("#position").value
      })
    } : {};
    
    try {
      const result = await Auth.submit(mode(), email, p, accountRole, profile);
      go(result);
    } catch (x) {
      console.error("Auth error:", x.message);
      error.textContent = x.message || "An error occurred. Please try again.";
    }
  };
};
