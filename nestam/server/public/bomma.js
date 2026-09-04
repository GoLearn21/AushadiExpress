/* Bomma2D — canvas renderer for a Nestam Bomma. Mirrors the Unity procedural
 * character: body shape + craft pattern, huge eyes with tracking/blink,
 * lip-synced mouth driven by the server envelope, emotions, gestures, poke. */
(function () {
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  const EMOTION_POSE = {
    neutral: { brow: 0, lid: 0, smile: 0.35, eyeScale: 1, blush: 0.3 },
    happy: { brow: 0.1, lid: 0.15, smile: 0.9, eyeScale: 1.05, blush: 0.6 },
    excited: { brow: 0.3, lid: -0.1, smile: 1, eyeScale: 1.2, blush: 0.7 },
    laughing: { brow: 0.2, lid: 0.55, smile: 1, eyeScale: 1, blush: 0.8 },
    curious: { brow: 0.35, lid: -0.05, smile: 0.3, eyeScale: 1.15, blush: 0.3 },
    thinking: { brow: 0.2, lid: 0.25, smile: 0.1, eyeScale: 0.95, blush: 0.2 },
    caring: { brow: -0.15, lid: 0.2, smile: 0.45, eyeScale: 1, blush: 0.5 },
    sad: { brow: -0.35, lid: 0.35, smile: -0.5, eyeScale: 0.95, blush: 0.2 },
    surprised: { brow: 0.5, lid: -0.2, smile: 0, eyeScale: 1.3, blush: 0.4 },
    sleepy: { brow: -0.05, lid: 0.65, smile: 0.2, eyeScale: 0.9, blush: 0.2 },
    calm: { brow: 0, lid: 0.3, smile: 0.4, eyeScale: 0.95, blush: 0.3 },
    proud: { brow: 0.15, lid: 0.2, smile: 0.7, eyeScale: 1, blush: 0.5 },
    shy: { brow: -0.1, lid: 0.3, smile: 0.5, eyeScale: 0.9, blush: 0.95 },
  };

  class Bomma2D {
    constructor(canvas, visual, opts = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.visual = visual;
      this.opts = Object.assign({ scene: true, scale: 1 }, opts);
      this.t = 0;
      this.emotion = "neutral";
      this.pose = { ...EMOTION_POSE.neutral };
      this.target = { ...EMOTION_POSE.neutral };
      this.mouthOpen = 0;
      this.mouthTarget = 0;
      this.look = { x: 0, y: 0 };
      this.lookTarget = { x: 0, y: 0 };
      this.blink = 0;
      this.nextBlink = 2 + Math.random() * 3;
      this.squash = { x: 1, y: 1, vx: 0, vy: 0 };
      this.gesture = null;
      this.gestureT = 0;
      this.state = "idle"; // idle | listening | thinking | speaking
      this.speaking = null; // {audio, envelope, hz}
      this.vaakili = { level: 1, muggu: 1, tulasi: 1, tree: 0, birds: 0, deepam: 0 };
      this.last = performance.now();
      this._raf = null;
      this.pointer = null;
      canvas.addEventListener("pointermove", (e) => this._pointer(e));
      canvas.addEventListener("pointerleave", () => (this.pointer = null));
      this.start();
    }

    _pointer(e) {
      const r = this.canvas.getBoundingClientRect();
      this.pointer = { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: ((e.clientY - r.top) / r.height) * 2 - 1 };
    }

    setVisual(v) { this.visual = v; }
    setVaakili(v) { if (v) this.vaakili = v; }
    setEmotion(e) { this.emotion = EMOTION_POSE[e] ? e : "neutral"; this.target = { ...EMOTION_POSE[this.emotion] }; }
    setState(s) { this.state = s; if (s === "thinking") this.setEmotion("thinking"); if (s === "listening") this.setEmotion("curious"); }
    playGesture(g) { if (!g || g === "none") return; this.gesture = g; this.gestureT = 0; if (g === "bounce" || g === "dance") this.kick(0.25); }
    kick(strength) { this.squash.vy -= strength * 6; this.squash.vx += strength * 4; }
    poke() { this.kick(0.35); this.playGesture("wiggle"); this.setEmotion("laughing"); }

    /** Drive the mouth from a 50 Hz envelope while `audio` plays. */
    speak(audio, envelope, hz) {
      this.speaking = { audio, envelope: envelope || [], hz: hz || 50 };
      this.state = "speaking";
      const done = () => { if (this.speaking && this.speaking.audio === audio) { this.speaking = null; this.state = "idle"; this.mouthTarget = 0; } };
      audio.addEventListener("ended", done, { once: true });
      audio.addEventListener("pause", done, { once: true });
    }

    start() { if (!this._raf) this._raf = requestAnimationFrame((ts) => this._frame(ts)); }
    stop() { cancelAnimationFrame(this._raf); this._raf = null; }

    _frame(ts) {
      const dt = Math.min(0.05, (ts - this.last) / 1000);
      this.last = ts;
      this.t += dt;
      this._update(dt);
      this._draw();
      this._raf = requestAnimationFrame((t2) => this._frame(t2));
    }

    _update(dt) {
      // pose easing
      for (const k of Object.keys(this.target)) this.pose[k] = lerp(this.pose[k], this.target[k], 1 - Math.pow(0.001, dt));
      // blink
      this.nextBlink -= dt;
      if (this.nextBlink <= 0) { this.blink = 1; this.nextBlink = 2.5 + Math.random() * 3.5; }
      this.blink = Math.max(0, this.blink - dt * 7);
      // eyes: follow pointer, dart when thinking, look up when sleepy
      if (this.state === "thinking") this.lookTarget = { x: Math.sin(this.t * 2.3) * 0.5, y: -0.5 };
      else if (this.pointer) this.lookTarget = { x: clamp(this.pointer.x, -1, 1), y: clamp(this.pointer.y, -1, 1) };
      else this.lookTarget = { x: Math.sin(this.t * 0.4) * 0.15, y: Math.cos(this.t * 0.3) * 0.1 };
      this.look.x = lerp(this.look.x, this.lookTarget.x, 1 - Math.pow(0.002, dt));
      this.look.y = lerp(this.look.y, this.lookTarget.y, 1 - Math.pow(0.002, dt));
      // mouth from envelope
      if (this.speaking) {
        const a = this.speaking.audio;
        const idx = Math.floor(a.currentTime * this.speaking.hz);
        const env = this.speaking.envelope;
        const v = env.length ? (env[Math.min(env.length - 1, idx)] || 0) : 0.5 + 0.5 * Math.sin(this.t * 18);
        this.mouthTarget = a.paused ? 0 : v;
      } else this.mouthTarget = 0;
      this.mouthOpen = lerp(this.mouthOpen, this.mouthTarget, 1 - Math.pow(0.0001, dt));
      // squash & stretch spring
      const s = this.squash;
      const k = 60, d = 7;
      s.vx += (-(s.x - 1) * k - s.vx * d) * dt;
      s.vy += (-(s.y - 1) * k - s.vy * d) * dt;
      s.x += s.vx * dt; s.y += s.vy * dt;
      // gestures
      if (this.gesture) { this.gestureT += dt; if (this.gestureT > 1.4) this.gesture = null; }
    }

    _gestureOffset() {
      if (!this.gesture) return { x: 0, y: 0, rot: 0 };
      const t = this.gestureT, e = Math.exp(-t * 2.2);
      switch (this.gesture) {
        case "nod": return { x: 0, y: Math.sin(t * 12) * 10 * e, rot: 0 };
        case "shake": return { x: Math.sin(t * 14) * 14 * e, y: 0, rot: 0 };
        case "wiggle": return { x: 0, y: 0, rot: Math.sin(t * 16) * 0.12 * e };
        case "bounce": return { x: 0, y: -Math.abs(Math.sin(t * 8)) * 34 * e, rot: 0 };
        case "dance": return { x: Math.sin(t * 8) * 18 * e, y: -Math.abs(Math.sin(t * 8)) * 26 * e, rot: Math.sin(t * 8) * 0.1 * e };
        case "lean_in": return { x: 0, y: 12 * (1 - e), rot: 0 };
        case "look_away": return { x: 0, y: 0, rot: 0.08 * (1 - e) };
        case "stretch": return { x: 0, y: -10 * (1 - e), rot: 0 };
        default: return { x: 0, y: 0, rot: 0 };
      }
    }

    _draw() {
      const ctx = this.ctx, W = this.canvas.width, H = this.canvas.height;
      ctx.clearRect(0, 0, W, H);
      if (this.opts.scene) this._drawScene(ctx, W, H);
      const v = this.visual;
      const base = Math.min(W, H) * 0.19 * this.opts.scale;
      const g = this._gestureOffset();
      const breathe = 1 + Math.sin(this.t * 1.6) * 0.015;
      const cx = W / 2 + g.x, cy = (this.opts.scene ? H * 0.58 : H * 0.55) + g.y;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(g.rot + Math.sin(this.t * 0.8) * 0.01);
      ctx.scale(this.squash.x * breathe * v.bodyScale.x, this.squash.y * (2 - breathe) * v.bodyScale.y);
      // shadow
      ctx.save(); ctx.scale(1, 0.35); ctx.fillStyle = "rgba(43,27,18,0.18)"; ctx.beginPath(); ctx.ellipse(0, base * 3.1, base * 1.1, base * 0.9, 0, 0, TAU); ctx.fill(); ctx.restore();
      this._drawBody(ctx, base);
      this._drawFace(ctx, base);
      this._drawAccessory(ctx, base);
      ctx.restore();
    }

    _bodyPath(ctx, r) {
      const shape = this.visual.bodyShape;
      ctx.beginPath();
      const steps = 64;
      for (let i = 0; i <= steps; i++) {
        const a = (i / steps) * TAU - Math.PI / 2;
        let rr = r;
        const s = Math.sin(a); // -1 top, +1 bottom
        if (shape === "egg") rr = r * (1 - 0.12 * s);
        else if (shape === "pear") rr = r * (1 + 0.2 * s);
        else if (shape === "tall") rr = r * (1 + 0.05 * s);
        else if (shape === "oblong") rr = r * (1 + 0.1 * s);
        else if (shape === "broad") rr = r * (1 + 0.08 * s);
        const sx = shape === "tall" ? 0.72 : shape === "broad" ? 1.25 : shape === "flat" ? 1.05 : shape === "oblong" ? 0.92 : 1;
        const sy = shape === "tall" ? 1.35 : shape === "oblong" ? 1.18 : shape === "egg" ? 1.12 : shape === "broad" ? 0.95 : shape === "flat" ? 1.12 : 1;
        const x = Math.cos(a) * rr * sx, y = Math.sin(a) * rr * sy;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
    }

    _drawBody(ctx, r) {
      const v = this.visual;
      this._bodyPath(ctx, r);
      const grad = ctx.createRadialGradient(-r * 0.35, -r * 0.45, r * 0.1, 0, 0, r * 1.5);
      grad.addColorStop(0, lighten(v.baseColor, 0.18 + v.smoothness * 0.25));
      grad.addColorStop(1, darken(v.baseColor, 0.18));
      ctx.fillStyle = grad; ctx.fill();
      ctx.save(); ctx.clip(); this._drawPattern(ctx, r); ctx.restore();
      this._bodyPath(ctx, r);
      ctx.lineWidth = Math.max(2, r * 0.05); ctx.strokeStyle = v.outlineColor; ctx.stroke();
      if (v.smoothness > 0.6) { // lacquer highlight
        ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.beginPath(); ctx.ellipse(-r * 0.45, -r * 0.55, r * 0.18, r * 0.32, -0.6, 0, TAU); ctx.fill();
      }
    }

    _drawPattern(ctx, r) {
      const v = this.visual, c = v.patternColors || [];
      ctx.globalAlpha = 0.9;
      switch (v.pattern) {
        case "etikoppaka-rings":
          for (let i = 0; i < 7; i++) { ctx.fillStyle = c[i % c.length]; ctx.fillRect(-r * 2, r * (0.15 + i * 0.16), r * 4, r * 0.07); }
          break;
        case "kondapalli":
          ctx.fillStyle = c[0]; ctx.fillRect(-r * 2, r * 0.55, r * 4, r * 0.12);
          ctx.fillStyle = c[1]; ctx.fillRect(-r * 2, r * 0.72, r * 4, r * 0.08);
          for (let i = -3; i <= 3; i++) { ctx.fillStyle = c[3]; ctx.beginPath(); ctx.arc(i * r * 0.28, r * 0.9, r * 0.045, 0, TAU); ctx.fill(); }
          break;
        case "kalamkari":
          ctx.strokeStyle = c[4] || v.outlineColor; ctx.lineWidth = r * 0.03;
          for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-r + i * r * 0.5, r * 1.1); ctx.bezierCurveTo(-r * 0.6 + i * r * 0.5, r * 0.6, -r * 0.2 + i * r * 0.5, r * 0.9, i * r * 0.5 - r * 0.2, r * 0.3); ctx.stroke(); ctx.fillStyle = c[i % c.length]; ctx.beginPath(); ctx.ellipse(i * r * 0.5 - r * 0.2, r * 0.3, r * 0.08, r * 0.14, 0.4, 0, TAU); ctx.fill(); }
          break;
        case "mango":
          ctx.fillStyle = c[1]; ctx.beginPath(); ctx.ellipse(r * 0.35, r * 0.2, r * 0.55, r * 0.9, 0.3, 0, TAU); ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.15)"; ctx.beginPath(); ctx.ellipse(-r * 0.3, -r * 0.4, r * 0.25, r * 0.4, -0.4, 0, TAU); ctx.fill();
          break;
        case "chili":
          ctx.fillStyle = c[1]; ctx.beginPath(); ctx.ellipse(r * 0.25, r * 0.3, r * 0.3, r * 1.1, 0.15, 0, TAU); ctx.fill();
          break;
        case "gangireddu-cloth":
          for (let i = 0; i < 5; i++) { ctx.fillStyle = c[i % c.length]; ctx.fillRect(-r * 2, r * (0.35 + i * 0.13), r * 4, r * 0.11); }
          ctx.fillStyle = "#fff"; for (let i = -4; i <= 4; i++) { ctx.beginPath(); ctx.arc(i * r * 0.25, r * 1.02, r * 0.035, 0, TAU); ctx.fill(); }
          break;
        default: break;
      }
      ctx.globalAlpha = 1;
    }

    _drawFace(ctx, r) {
      const v = this.visual, e = v.eyes, p = this.pose;
      const ex = e.spacing * r * 1.4, ey = (-e.height) * r * 1.6 + r * 0.05;
      const size = e.size * r * 2.2 * p.eyeScale;
      // blush
      ctx.fillStyle = hexToRgba(v.blushColor, 0.35 + p.blush * 0.5);
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * ex * 1.25, ey + size * 0.95, size * 0.45, size * 0.28, 0, 0, TAU); ctx.fill(); }
      for (const s of [-1, 1]) {
        const x = s * ex, y = ey;
        const open = 1 - Math.max(this.blink, clamp(p.lid, 0, 0.95));
        ctx.save(); ctx.translate(x, y);
        // sclera
        ctx.fillStyle = v.scleraColor; ctx.beginPath(); ctx.ellipse(0, 0, size, size * Math.max(0.06, open), 0, 0, TAU); ctx.fill();
        ctx.lineWidth = r * 0.03; ctx.strokeStyle = v.outlineColor; ctx.stroke();
        // pupil
        if (open > 0.15) {
          ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, size, size * open, 0, 0, TAU); ctx.clip();
          const px = this.look.x * size * 0.45, py = this.look.y * size * 0.35;
          ctx.fillStyle = v.eyeColor; ctx.beginPath(); ctx.arc(px, py, size * e.pupilScale, 0, TAU); ctx.fill();
          ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(px - size * 0.2, py - size * 0.22, size * 0.16, 0, TAU); ctx.fill();
          ctx.beginPath(); ctx.arc(px + size * 0.15, py + size * 0.12, size * 0.07, 0, TAU); ctx.fill();
          ctx.restore();
        }
        // brow
        ctx.strokeStyle = v.outlineColor; ctx.lineWidth = r * 0.045; ctx.lineCap = "round";
        const by = -size * (1.15 + p.brow * 0.5), tilt = s * p.brow * -0.5 + (p.brow < 0 ? s * 0.3 : 0);
        ctx.beginPath(); ctx.moveTo(-size * 0.7, by + tilt * size * 0.3); ctx.quadraticCurveTo(0, by - size * 0.15, size * 0.7, by - tilt * size * 0.3); ctx.stroke();
        ctx.restore();
      }
      // glasses
      if (v.glasses) {
        ctx.strokeStyle = v.outlineColor; ctx.lineWidth = r * 0.04;
        for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * ex, ey, size * 1.15, 0, TAU); ctx.stroke(); }
        ctx.beginPath(); ctx.moveTo(-ex + size * 1.15, ey); ctx.lineTo(ex - size * 1.15, ey); ctx.stroke();
      }
      // bottu
      if (v.bottu) { ctx.fillStyle = "#c2185b"; ctx.beginPath(); ctx.arc(0, ey - size * 1.7, r * 0.06, 0, TAU); ctx.fill(); }
      // mouth
      const my = ey + size * 1.55, mw = v.mouthWidth * r * 1.6, open = this.mouthOpen;
      ctx.fillStyle = "#4a1c1c"; ctx.strokeStyle = v.outlineColor; ctx.lineWidth = r * 0.04;
      ctx.beginPath();
      const curve = p.smile * mw * 0.5;
      ctx.moveTo(-mw / 2, my);
      ctx.quadraticCurveTo(0, my + curve + open * r * 0.55, mw / 2, my);
      ctx.quadraticCurveTo(0, my + curve * 0.3 - open * r * 0.08, -mw / 2, my);
      ctx.closePath();
      if (open > 0.06) ctx.fill();
      ctx.beginPath(); ctx.moveTo(-mw / 2, my); ctx.quadraticCurveTo(0, my + curve + open * r * 0.55, mw / 2, my); ctx.stroke();
      if (open > 0.25) { ctx.fillStyle = "#e57373"; ctx.beginPath(); ctx.ellipse(0, my + curve * 0.6 + open * r * 0.3, mw * 0.25, open * r * 0.12, 0, 0, TAU); ctx.fill(); }
    }

    _drawAccessory(ctx, r) {
      const v = this.visual, top = -r * (v.bodyShape === "tall" ? 1.35 : v.bodyShape === "oblong" || v.bodyShape === "egg" || v.bodyShape === "flat" ? 1.12 : v.bodyShape === "broad" ? 0.92 : 1);
      ctx.lineWidth = r * 0.04; ctx.strokeStyle = v.outlineColor;
      switch (v.accessory) {
        case "jasmine": {
          for (let i = -4; i <= 4; i++) { ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(i * r * 0.19, top + r * 0.12 + Math.abs(i) * r * 0.04, r * 0.085, 0, TAU); ctx.fill(); ctx.stroke(); }
          break;
        }
        case "topi": {
          ctx.fillStyle = v.accentColor; ctx.beginPath(); ctx.moveTo(-r * 0.55, top + r * 0.05); ctx.lineTo(r * 0.55, top + r * 0.05); ctx.lineTo(r * 0.4, top - r * 0.45); ctx.lineTo(-r * 0.4, top - r * 0.45); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.fillStyle = v.secondaryColor; ctx.fillRect(-r * 0.55, top - r * 0.05, r * 1.1, r * 0.1);
          break;
        }
        case "turban": {
          ctx.fillStyle = v.accentColor; ctx.beginPath(); ctx.ellipse(0, top + r * 0.05, r * 0.7, r * 0.32, 0, Math.PI, TAU); ctx.fill(); ctx.stroke();
          ctx.fillStyle = v.secondaryColor; ctx.beginPath(); ctx.ellipse(r * 0.25, top - r * 0.2, r * 0.18, r * 0.3, 0.4, 0, TAU); ctx.fill(); ctx.stroke();
          break;
        }
        case "leaf": {
          ctx.strokeStyle = "#5d4037"; ctx.lineWidth = r * 0.07; ctx.beginPath(); ctx.moveTo(0, top + r * 0.05); ctx.lineTo(r * 0.08, top - r * 0.3); ctx.stroke();
          ctx.fillStyle = v.accentColor; ctx.beginPath(); ctx.ellipse(r * 0.4, top - r * 0.25, r * 0.4, r * 0.15, -0.5, 0, TAU); ctx.fill(); ctx.strokeStyle = v.outlineColor; ctx.lineWidth = r * 0.03; ctx.stroke();
          break;
        }
        case "stem": {
          ctx.fillStyle = v.accentColor; ctx.beginPath(); ctx.ellipse(0, top + r * 0.02, r * 0.5, r * 0.16, 0, 0, TAU); ctx.fill(); ctx.stroke();
          ctx.strokeStyle = "#3e8914"; ctx.lineWidth = r * 0.09; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(0, top - r * 0.05); ctx.quadraticCurveTo(r * 0.1, top - r * 0.35, r * 0.3, top - r * 0.45); ctx.stroke();
          break;
        }
        case "horns": {
          ctx.fillStyle = v.accentColor;
          for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * r * 0.55, top + r * 0.15); ctx.quadraticCurveTo(s * r * 0.9, top - r * 0.2, s * r * 0.6, top - r * 0.7); ctx.quadraticCurveTo(s * r * 0.55, top - r * 0.2, s * r * 0.3, top + r * 0.12); ctx.closePath(); ctx.fill(); ctx.stroke(); }
          ctx.fillStyle = v.secondaryColor; ctx.beginPath(); ctx.ellipse(0, top + r * 0.02, r * 0.4, r * 0.14, 0, 0, TAU); ctx.fill(); ctx.stroke();
          for (let i = -2; i <= 2; i++) { ctx.fillStyle = "#ffd54f"; ctx.beginPath(); ctx.arc(i * r * 0.16, top + r * 0.14, r * 0.04, 0, TAU); ctx.fill(); }
          break;
        }
        default: break;
      }
    }

    _drawScene(ctx, W, H) {
      const hour = new Date(Date.now() + 330 * 60000).getUTCHours();
      const night = hour < 5 || hour >= 19;
      const sky = ctx.createLinearGradient(0, 0, 0, H * 0.62);
      if (night) { sky.addColorStop(0, "#1b2140"); sky.addColorStop(1, "#4a3f6b"); }
      else if (hour < 9 || hour >= 17) { sky.addColorStop(0, "#ffb36b"); sky.addColorStop(1, "#ffe1b8"); }
      else { sky.addColorStop(0, "#7ec8f5"); sky.addColorStop(1, "#dff3ff"); }
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      // sun / moon
      ctx.fillStyle = night ? "#f3f0d0" : "#fff3b0"; ctx.beginPath(); ctx.arc(W * 0.82, H * 0.14, W * 0.05, 0, TAU); ctx.fill();
      // house wall + pillars (Andhra front porch)
      ctx.fillStyle = "#f6e3c3"; ctx.fillRect(0, H * 0.28, W, H * 0.34);
      ctx.fillStyle = "#c7623a"; ctx.fillRect(0, H * 0.26, W, H * 0.04);
      ctx.fillStyle = "#9c4a2b"; for (const x of [0.12, 0.88]) ctx.fillRect(W * x - W * 0.02, H * 0.3, W * 0.04, H * 0.32);
      // mango-leaf toranam
      for (let i = 0; i < 14; i++) { ctx.fillStyle = i % 2 ? "#4c9a2a" : "#3d7d22"; ctx.beginPath(); ctx.ellipse(W * (0.08 + i * 0.065), H * 0.31, W * 0.014, H * 0.03, 0, 0, TAU); ctx.fill(); }
      // door
      ctx.fillStyle = "#6d3b1f"; ctx.fillRect(W * 0.42, H * 0.34, W * 0.16, H * 0.28);
      // ground (courtyard)
      const ground = ctx.createLinearGradient(0, H * 0.62, 0, H);
      ground.addColorStop(0, "#b98a5d"); ground.addColorStop(1, "#8d6242");
      ctx.fillStyle = ground; ctx.fillRect(0, H * 0.62, W, H * 0.38);
      // muggu (chukkala muggu) grows with vaakili.muggu
      const rings = Math.min(12, this.vaakili.muggu || 1);
      ctx.save(); ctx.translate(W * 0.5, H * 0.86); ctx.scale(1, 0.38);
      ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 2;
      for (let i = 1; i <= rings; i++) {
        const rr = i * W * 0.03;
        ctx.beginPath();
        for (let k = 0; k <= i * 6; k++) { const a = (k / (i * 6)) * TAU; const wob = 1 + (k % 2 ? 0.12 : -0.05); const x = Math.cos(a) * rr * wob, y = Math.sin(a) * rr * wob; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.closePath(); ctx.stroke();
        for (let k = 0; k < i * 6; k++) { const a = (k / (i * 6)) * TAU; ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(Math.cos(a) * rr, Math.sin(a) * rr, 2.2, 0, TAU); ctx.fill(); }
      }
      ctx.restore();
      // tulasi kota (left) grows with tulasi
      const tul = this.vaakili.tulasi || 1;
      ctx.fillStyle = "#b6552f"; ctx.fillRect(W * 0.17, H * 0.72, W * 0.09, H * 0.12);
      ctx.fillStyle = "#2e7d32"; ctx.beginPath(); ctx.arc(W * 0.215, H * 0.7, W * (0.02 + tul * 0.007), 0, TAU); ctx.fill();
      // mango tree (right) grows with tree
      const tree = this.vaakili.tree || 0;
      if (tree > 0) { ctx.fillStyle = "#5d4037"; ctx.fillRect(W * 0.8, H * 0.5, W * 0.03, H * 0.24); ctx.fillStyle = "#3f8f3a"; ctx.beginPath(); ctx.arc(W * 0.815, H * 0.5, W * (0.05 + tree * 0.012), 0, TAU); ctx.fill(); for (let i = 0; i < tree; i++) { ctx.fillStyle = "#f9c846"; ctx.beginPath(); ctx.ellipse(W * (0.78 + (i % 3) * 0.025), H * (0.5 + Math.floor(i / 3) * 0.03), 4, 6, 0, 0, TAU); ctx.fill(); } }
      // sparrows
      for (let i = 0; i < (this.vaakili.birds || 0); i++) { const x = W * (0.1 + i * 0.1) + Math.sin(this.t * 2 + i) * 6, y = H * 0.2 + Math.cos(this.t * 3 + i) * 4; ctx.strokeStyle = night ? "#ddd" : "#333"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.quadraticCurveTo(x, y - 5, x + 6, y); ctx.stroke(); }
      // deepam lamps on the porch edge
      for (let i = 0; i < (this.vaakili.deepam || 0); i++) { const x = W * (0.3 + i * 0.08), y = H * 0.635; ctx.fillStyle = "#b5651d"; ctx.beginPath(); ctx.ellipse(x, y, 7, 4, 0, 0, TAU); ctx.fill(); ctx.fillStyle = "#ffb300"; ctx.beginPath(); ctx.ellipse(x, y - 8 + Math.sin(this.t * 9 + i) * 1.5, 3, 6, 0, 0, TAU); ctx.fill(); }
    }
  }

  function hexToRgb(hex) { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function hexToRgba(hex, a) { const [r, g, b] = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; }
  function lighten(hex, t) { const [r, g, b] = hexToRgb(hex); return `rgb(${Math.round(lerp(r, 255, t))},${Math.round(lerp(g, 255, t))},${Math.round(lerp(b, 255, t))})`; }
  function darken(hex, t) { const [r, g, b] = hexToRgb(hex); return `rgb(${Math.round(r * (1 - t))},${Math.round(g * (1 - t))},${Math.round(b * (1 - t))})`; }

  /** Procedural "bomma-speak" chirp (WebAudio), mirrors Unity's BommaChirps. */
  function chirp(audioCtx, baseHz, pattern) {
    const now = audioCtx.currentTime;
    const notes = pattern === "quick" ? [1, 1.25, 1.5] : pattern === "slow" ? [1, 0.9] : pattern === "dramatic" ? [1, 1.5, 1.2, 1.8] : pattern === "deep" ? [1, 0.8] : [1, 1.3, 1.1];
    const dur = pattern === "quick" ? 0.08 : pattern === "slow" || pattern === "deep" ? 0.22 : 0.12;
    notes.forEach((n, i) => {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(baseHz * n, now + i * dur);
      o.frequency.exponentialRampToValueAtTime(baseHz * n * 1.15, now + i * dur + dur * 0.8);
      g.gain.setValueAtTime(0.0001, now + i * dur); g.gain.exponentialRampToValueAtTime(0.25, now + i * dur + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, now + i * dur + dur);
      o.connect(g).connect(audioCtx.destination); o.start(now + i * dur); o.stop(now + i * dur + dur + 0.05);
    });
  }

  window.Bomma2D = Bomma2D;
  window.bommaChirp = chirp;
})();
