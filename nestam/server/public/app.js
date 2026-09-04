/* Nestam dev console — exercises the same API the Unity app uses. */
(function () {
  const $ = (id) => document.getElementById(id);
  const api = {
    async get(p) { const r = await fetch(p); if (!r.ok) throw new Error(`${p} ${r.status}`); return r.json(); },
    async post(p, body) { const r = await fetch(p, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {}) }); const j = await r.json(); if (!r.ok) throw new Error(j.error?.message || `${p} ${r.status}`); return j; },
    async patch(p, body) { const r = await fetch(p, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {}) }); return r.json(); },
    async del(p) { const r = await fetch(p, { method: "DELETE" }); return r.json(); },
    async form(p, fd) { const r = await fetch(p, { method: "POST", body: fd }); const j = await r.json(); if (!r.ok) throw new Error(j.error?.message || `${p} ${r.status}`); return j; },
  };

  const state = { characters: [], options: null, character: null, userId: localStorage.getItem("nestam.userId") || null, sessionId: null, user: null, busy: false, audioCtx: null, currentAudio: null, quizAnswers: {} };
  const stage = $("stage");
  let bomma = null;
  const miniBommas = [];

  // ── boot ─────────────────────────────────────────────────────────────────
  async function boot() {
    try {
      const status = await api.get("/api/status");
      $("status").textContent = status.provider === "mock" ? "MOCK mode — no SARVAM_API_KEY, offline bomma-speak" : `Sarvam · ${status.models.stt} · ${status.models.tts} · ${status.models.chat}`;
      $("status").classList.toggle("mock", status.provider === "mock");
      const data = await api.get("/api/characters");
      state.characters = data.characters; state.options = data.options;
      renderCards(); renderCustomise();
      const saved = localStorage.getItem("nestam.characterId");
      state.character = state.characters.find((c) => c.id === saved) || state.characters[0];
      bomma = new Bomma2D(stage, state.character.visual, { scene: true });
      stage.addEventListener("pointerdown", onPoke);
      await startSession();
      renderCards();
    } catch (err) { $("status").textContent = "server unreachable: " + err.message; }
  }

  async function startSession(extra = {}) {
    const body = Object.assign({ userId: state.userId || undefined, characterId: state.character.id, name: $("userName").value || undefined, language: $("language").value, addressStyle: $("addressStyle").value }, extra);
    const res = await api.post("/api/session", body);
    state.sessionId = res.sessionId; state.userId = res.userId; state.user = res.user; state.character = res.character;
    localStorage.setItem("nestam.userId", res.userId); localStorage.setItem("nestam.characterId", res.character.id);
    if (res.user.name && !$("userName").value) $("userName").value = res.user.name;
    $("language").value = res.user.language; $("addressStyle").value = res.user.addressStyle;
    bomma.setVisual(res.character.visual); bomma.setVaakili(res.user.vaakili);
    syncCustomiseControls();
    if (res.greeting) await present(res.greeting);
    refreshPanels();
  }

  // ── presenting a reply: bubble + audio + lip-sync + emotion ───────────────
  async function present(reply) {
    if (reply.transcript) { $("transcript").textContent = reply.transcript; $("transcript").hidden = false; }
    const bubble = $("bubble");
    bubble.innerHTML = "";
    bubble.append(document.createTextNode(reply.text));
    if (reply.textRoman) { const s = document.createElement("small"); s.textContent = reply.textRoman; bubble.append(s); }
    if (reply.safety && reply.safety.crisis) { const s = document.createElement("small"); s.textContent = "💛 " + reply.safety.helpline; bubble.append(s); }
    if (reply.memoryUpdates && reply.memoryUpdates.length) { const s = document.createElement("small"); s.textContent = "remembered: " + reply.memoryUpdates.join(" · "); bubble.append(s); }
    bubble.hidden = false;
    $("latency").textContent = `stt ${reply.latencyMs.stt}ms · llm ${reply.latencyMs.llm}ms · tts ${reply.latencyMs.tts}ms · ${reply.provider}${reply.thrifty ? " · thrifty (no audio)" : ""}`;
    bomma.setEmotion(reply.emotion); bomma.playGesture(reply.gesture);
    if (reply.bond) bomma.setVaakili(Object.assign({}, bomma.vaakili, { level: reply.bond.level }));
    if (reply.audioBase64) {
      if (state.currentAudio) { state.currentAudio.pause(); }
      const audio = new Audio("data:" + reply.audioMime + ";base64," + reply.audioBase64);
      state.currentAudio = audio;
      bomma.speak(audio, reply.envelope, reply.envelopeHz);
      try { await audio.play(); } catch (e) { console.warn("autoplay blocked", e); bomma.setState("idle"); }
    }
  }

  function setBusy(b) { state.busy = b; $("ptt").classList.toggle("busy", b); if (b) bomma.setState("thinking"); }

  // ── text ─────────────────────────────────────────────────────────────────
  $("textForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = $("textInput").value.trim();
    if (!text || state.busy) return;
    $("textInput").value = "";
    setBusy(true);
    try { const reply = await api.post("/api/chat", { sessionId: state.sessionId, text }); await present(reply); refreshPanels(); }
    catch (err) { $("bubble").textContent = "⚠️ " + err.message; $("bubble").hidden = false; }
    finally { setBusy(false); }
  });

  // ── push-to-talk (MediaRecorder → webm/opus → /api/voice) ────────────────
  let recorder = null, chunks = [];
  async function startRecording() {
    if (state.busy || recorder) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
      const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"].find((m) => MediaRecorder.isTypeSupported(m)) || "";
      recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunks = [];
      recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        recorder = null;
        if (blob.size < 1500) { bomma.setState("idle"); return; }
        setBusy(true);
        try {
          const fd = new FormData();
          fd.append("sessionId", state.sessionId);
          fd.append("audio", blob, "utterance." + (blob.type.includes("ogg") ? "ogg" : blob.type.includes("mp4") ? "m4a" : "webm"));
          const reply = await api.form("/api/voice", fd);
          await present(reply); refreshPanels();
        } catch (err) { $("bubble").textContent = "⚠️ " + err.message; $("bubble").hidden = false; }
        finally { setBusy(false); }
      };
      recorder.start();
      $("ptt").classList.add("recording");
      bomma.setState("listening");
      if (state.currentAudio) state.currentAudio.pause();
    } catch (err) { $("bubble").textContent = "🎙️ microphone unavailable: " + err.message; $("bubble").hidden = false; }
  }
  function stopRecording() { if (recorder && recorder.state === "recording") recorder.stop(); $("ptt").classList.remove("recording"); }
  const ptt = $("ptt");
  ptt.addEventListener("pointerdown", (e) => { e.preventDefault(); ptt.setPointerCapture(e.pointerId); startRecording(); });
  ptt.addEventListener("pointerup", stopRecording);
  ptt.addEventListener("pointercancel", stopRecording);
  window.addEventListener("keydown", (e) => { if (e.code === "Space" && e.target === document.body && !e.repeat) { e.preventDefault(); startRecording(); } });
  window.addEventListener("keyup", (e) => { if (e.code === "Space" && e.target === document.body) stopRecording(); });

  // ── poke ─────────────────────────────────────────────────────────────────
  let lastPoke = 0;
  async function onPoke() {
    if (!bomma || state.busy) return;
    bomma.poke();
    if (!state.audioCtx) state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    bommaChirp(state.audioCtx, state.character.chirp.baseHz, state.character.chirp.pattern);
    if (Date.now() - lastPoke < 2500) return; // chirp only; don't spam TTS
    lastPoke = Date.now();
    try { const reply = await api.post("/api/poke", { sessionId: state.sessionId }); await present(reply); } catch (e) { console.warn(e); }
  }

  // ── character cards ──────────────────────────────────────────────────────
  function renderCards() {
    const el = $("cards"); el.innerHTML = ""; miniBommas.forEach((m) => m.stop()); miniBommas.length = 0;
    for (const c of state.characters) {
      const card = document.createElement("div"); card.className = "card" + (state.character && c.id === state.character.id ? " active" : "");
      const cv = document.createElement("canvas"); cv.width = 144; cv.height = 144;
      card.append(cv);
      const b = document.createElement("b"); b.textContent = `${c.nameTe} · ${c.nameEn}`; card.append(b);
      const s = document.createElement("small"); s.textContent = c.craft.en; card.append(s);
      card.addEventListener("click", async () => { state.character = c; bomma.setVisual(c.visual); await startSession({ characterId: c.id }); renderCards(); });
      el.append(card);
      miniBommas.push(new Bomma2D(cv, c.visual, { scene: false, scale: 1.25 }));
    }
  }

  // ── customise ────────────────────────────────────────────────────────────
  function renderCustomise() {
    const pal = $("palettes"); pal.innerHTML = "";
    for (const p of state.options.palettes) {
      const sw = document.createElement("div"); sw.className = "swatch"; sw.title = `${p.name.te} · ${p.name.en}`;
      sw.style.background = `linear-gradient(135deg, ${p.baseColor} 50%, ${p.secondaryColor} 50%)`;
      sw.addEventListener("click", () => applyAppearance({ baseColor: p.baseColor, secondaryColor: p.secondaryColor, accentColor: p.accentColor }));
      pal.append(sw);
    }
    const acc = $("accessory"); acc.innerHTML = "";
    for (const a of state.options.accessories) { const o = document.createElement("option"); o.value = a; o.textContent = a; acc.append(o); }
    acc.addEventListener("change", () => applyAppearance({ accessory: acc.value }));
    $("bottu").addEventListener("change", () => applyAppearance({ bottu: $("bottu").checked }));
    $("glasses").addEventListener("change", () => applyAppearance({ glasses: $("glasses").checked }));
    const sp = $("speaker"); sp.innerHTML = "";
    for (const s of state.options.speakersV3) { const o = document.createElement("option"); o.value = s; o.textContent = s; sp.append(o); }
    sp.addEventListener("change", () => applyAppearance({ speaker: sp.value }));
    $("resetLook").addEventListener("click", async () => { const r = await api.patch(`/api/users/${state.userId}`, { resetAppearance: true }); state.character = r.character; bomma.setVisual(r.character.visual); syncCustomiseControls(); });
  }
  function syncCustomiseControls() {
    if (!state.character) return;
    const v = state.character.visual;
    $("accessory").value = v.accessory; $("bottu").checked = !!v.bottu; $("glasses").checked = !!v.glasses; $("speaker").value = state.character.voice.speaker;
  }
  async function applyAppearance(patch) {
    const r = await api.patch(`/api/users/${state.userId}`, { appearance: patch });
    state.character = r.character; bomma.setVisual(r.character.visual);
  }

  // ── panels: memories, activities, vaakili, usage ─────────────────────────
  async function refreshPanels() {
    if (!state.userId) return;
    try {
      const [mem, acts, vk, usage] = await Promise.all([api.get(`/api/users/${state.userId}/memories`), api.get(`/api/users/${state.userId}/activities`), api.get(`/api/users/${state.userId}/vaakili`), api.get("/api/usage")]);
      const ml = $("memories"); ml.innerHTML = "";
      for (const m of mem.memories) {
        const li = document.createElement("li");
        const span = document.createElement("span"); const cat = document.createElement("span"); cat.className = "cat"; cat.textContent = m.category; span.append(cat, document.createTextNode(m.text)); li.append(span);
        const x = document.createElement("button"); x.textContent = "×"; x.addEventListener("click", async () => { await api.del(`/api/users/${state.userId}/memories/${m.id}`); refreshPanels(); }); li.append(x);
        ml.append(li);
      }
      const al = $("activities"); al.innerHTML = "";
      for (const a of acts.activities) {
        const li = document.createElement("li"); li.className = a.done ? "done" : "";
        const t = document.createElement("span"); t.textContent = `${a.title.te} (+${a.energy})`; t.title = a.prompt.te; li.append(t);
        if (!a.done) { const b = document.createElement("button"); b.textContent = "done"; b.addEventListener("click", async () => { await api.post(`/api/users/${state.userId}/activities/${a.id}/complete`); refreshPanels(); }); li.append(b); }
        al.append(li);
      }
      const v = vk.vaakili; bomma.setVaakili(v);
      $("bond").innerHTML = `<b>అనుబంధం · bond level ${v.level}</b> — ${v.points} points · ⚡ ${v.energy} utsaaham · 🔥 ${vk.streak.count}-day streak<br><small>ముగ్గు ${v.muggu} · తులసి ${v.tulasi} · చెట్టు ${v.tree} · పిచ్చుకలు ${v.birds} · దీపాలు ${v.deepam}</small>`;
      const care = $("care"); care.innerHTML = "";
      for (const [action, spec] of Object.entries(vk.actions)) {
        const b = document.createElement("button"); b.textContent = `${spec.title.te} (−${spec.cost}⚡)`;
        b.addEventListener("click", async () => { const r = await fetch(`/api/users/${state.userId}/vaakili/care`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) }); const j = await r.json(); if (!j.ok) { $("bubble").textContent = j.reason === "not_enough_energy" ? "ఉత్సాహం సరిపోలేదు — ఒక పని పూర్తి చేయండి!" : j.reason; $("bubble").hidden = false; } else { bomma.playGesture("bounce"); } refreshPanels(); });
        care.append(b);
      }
      $("usage").textContent = JSON.stringify(usage, null, 2);
    } catch (err) { console.warn("panel refresh failed", err); }
  }

  // ── tabs ─────────────────────────────────────────────────────────────────
  document.querySelectorAll(".tabs button").forEach((b) => b.addEventListener("click", () => {
    document.querySelectorAll(".tabs button").forEach((x) => x.classList.toggle("active", x === b));
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.id === "tab-" + b.dataset.tab));
  }));
  ["userName", "language", "addressStyle"].forEach((id) => $(id).addEventListener("change", async () => { if (state.userId) { await api.patch(`/api/users/${state.userId}`, { name: $("userName").value || undefined, language: $("language").value, addressStyle: $("addressStyle").value }); } }));

  // ── onboarding quiz ──────────────────────────────────────────────────────
  $("quizBtn").addEventListener("click", async () => {
    const { questions } = await api.get("/api/onboarding/quiz");
    const body = $("quizBody"); body.innerHTML = ""; state.quizAnswers = {};
    for (const q of questions) {
      const d = document.createElement("div"); d.className = "q";
      const p = document.createElement("p"); p.textContent = `${q.text.te} · ${q.text.en}`; d.append(p);
      for (const o of q.options) { const l = document.createElement("label"); const i = document.createElement("input"); i.type = "radio"; i.name = q.id; i.value = o.id; i.addEventListener("change", () => (state.quizAnswers[q.id] = o.id)); l.append(i, document.createTextNode(` ${o.text.te} · ${o.text.en}`)); d.append(l); }
      body.append(d);
    }
    $("quiz").showModal();
  });
  $("quizCancel").addEventListener("click", () => $("quiz").close());
  $("quizForm").addEventListener("submit", async (e) => {
    e.preventDefault(); $("quiz").close();
    const r = await api.post("/api/onboarding/match", { answers: state.quizAnswers });
    state.character = r.character; bomma.setVisual(r.character.visual);
    await startSession({ characterId: r.characterId }); renderCards();
    $("bubble").textContent = `${r.character.nameTe} మీ నేస్తం! (${Math.round(r.scores[0].score * 100)}% match)`; $("bubble").hidden = false;
  });

  boot();
})();
