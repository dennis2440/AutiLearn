// DEMO auth (accounts in localStorage, SHA-256 hashed). To go live, replace Auth.submit with
// Api.post("/api/auth/login" | "/api/auth/register", {username, password, role}) and store the JWT.
// NOTE: the Flask User model currently uses email; add a `username` column (or send email).
const Auth = {
  async hash(s) {
    if (!window.crypto?.subtle) return "x" + btoa(unescape(encodeURIComponent(s)));
    const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
    return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
  },
  users() { try { return JSON.parse(localStorage.getItem("autilearn_users")) || {}; } catch { return {}; } },
  session() { try { return JSON.parse(localStorage.getItem("autilearn_session")); } catch { return null; } },
  logout() { localStorage.removeItem("autilearn_session"); },
  async submit(mode, u, p, role) {
    u = u.trim().toLowerCase();
    const us = Auth.users(), h = await Auth.hash(p);
    if (mode === "register") {
      if (us[u]) throw Error("That username is already taken.");
      us[u] = { h, role };
      localStorage.setItem("autilearn_users", JSON.stringify(us));
    } else {
      const a = us[u];
      if (!a || a.h !== h) throw Error("Wrong username or password.");
      if (a.role !== role) throw Error(`This is a ${a.role} account. Switch the role above.`);
    }
    localStorage.setItem("autilearn_session", JSON.stringify({ u, role }));
    return role; // "guardian" | "tutor" -> doubles as the dashboard view name
  },
};

Views.login = (el) => {
  el.innerHTML = `<form class="auth" novalidate>
    <h2>Welcome to AutiLearn 💙</h2><p>Calm, playful learning for every child.</p>
    <div class="seg" role="radiogroup" aria-label="Sign in or create account">
      <label><input type="radio" name="mode" value="login" checked><span>Sign in</span></label>
      <label><input type="radio" name="mode" value="register"><span>Create account</span></label></div>
    <label>Username<input id="u" autocomplete="username" autocapitalize="none" required minlength="3"></label>
    <label>Password<input id="p" type="password" autocomplete="current-password" required minlength="6"></label>
    <fieldset class="seg"><legend>I am a…</legend>
      <label><input type="radio" name="role" value="guardian" checked><span>👨‍👩‍👧 Guardian</span></label>
      <label><input type="radio" name="role" value="tutor"><span>📋 Tutor</span></label></fieldset>
    <p id="err" role="alert"></p>
    <button class="card ok" id="go" style="width:100%;min-height:56px">Sign in</button></form>`;
  const f = el.querySelector("form"), v = n => f.querySelector(`[name=${n}]:checked`).value;
  f.onchange = () => (f.querySelector("#go").textContent = v("mode") === "login" ? "Sign in" : "Create account");
  f.onsubmit = async (e) => {
    e.preventDefault();
    const u = f.querySelector("#u").value, p = f.querySelector("#p").value, err = f.querySelector("#err");
    if (u.trim().length < 3 || p.length < 6) return (err.textContent = "Username needs 3+ characters and password 6+.");
    try { go(await Auth.submit(v("mode"), u, p, v("role"))); } catch (x) { err.textContent = x.message; }
  };
};
