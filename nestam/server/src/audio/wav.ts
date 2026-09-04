/**
 * WAV helpers: parse/build PCM WAV, compute lip-sync amplitude envelopes,
 * concatenate clips, and synthesise "bomma-speak" (used by the offline mock
 * provider and for procedural chirps).
 */

export interface WavData {
  sampleRate: number;
  channels: number;
  bitsPerSample: number;
  /** Mono float samples in [-1, 1]. */
  samples: Float32Array;
  durationMs: number;
}

export function isWav(buf: Buffer): boolean {
  return buf.length >= 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WAVE";
}

/** Parses PCM (8/16/24/32-bit int) or 32-bit float WAV into mono float samples. */
export function parseWav(buf: Buffer): WavData {
  if (!isWav(buf)) throw new Error("Not a RIFF/WAVE buffer");
  let offset = 12;
  let fmt: { audioFormat: number; channels: number; sampleRate: number; bitsPerSample: number } | null = null;
  let dataStart = -1;
  let dataLen = 0;
  while (offset + 8 <= buf.length) {
    const id = buf.toString("ascii", offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    const body = offset + 8;
    if (id === "fmt ") {
      let audioFormat = buf.readUInt16LE(body);
      const channels = buf.readUInt16LE(body + 2);
      const sampleRate = buf.readUInt32LE(body + 4);
      const bitsPerSample = buf.readUInt16LE(body + 14);
      if (audioFormat === 0xfffe && size >= 26) audioFormat = buf.readUInt16LE(body + 24); // WAVE_FORMAT_EXTENSIBLE sub-format
      fmt = { audioFormat, channels, sampleRate, bitsPerSample };
    } else if (id === "data") {
      dataStart = body;
      dataLen = Math.min(size, buf.length - body);
      break;
    }
    offset = body + size + (size % 2);
  }
  if (!fmt || dataStart < 0) throw new Error("WAV missing fmt or data chunk");
  const { channels, sampleRate, bitsPerSample, audioFormat } = fmt;
  const bytesPerSample = bitsPerSample / 8;
  const frameCount = Math.floor(dataLen / (bytesPerSample * channels));
  const samples = new Float32Array(frameCount);
  for (let i = 0; i < frameCount; i++) {
    let acc = 0;
    for (let c = 0; c < channels; c++) {
      const p = dataStart + (i * channels + c) * bytesPerSample;
      let v: number;
      if (audioFormat === 3 && bitsPerSample === 32) v = buf.readFloatLE(p);
      else if (bitsPerSample === 16) v = buf.readInt16LE(p) / 32768;
      else if (bitsPerSample === 8) v = (buf.readUInt8(p) - 128) / 128;
      else if (bitsPerSample === 24) v = ((buf[p] | (buf[p + 1] << 8) | (buf[p + 2] << 16)) << 8 >> 8) / 8388608;
      else if (bitsPerSample === 32) v = buf.readInt32LE(p) / 2147483648;
      else throw new Error(`Unsupported WAV bit depth ${bitsPerSample}`);
      acc += v;
    }
    samples[i] = acc / channels;
  }
  return { sampleRate, channels, bitsPerSample, samples, durationMs: Math.round((frameCount / sampleRate) * 1000) };
}

/** Builds a 16-bit PCM mono WAV buffer from float samples. */
export function buildWav(samples: Float32Array, sampleRate: number): Buffer {
  const dataLen = samples.length * 2;
  const buf = Buffer.alloc(44 + dataLen);
  buf.write("RIFF", 0, "ascii");
  buf.writeUInt32LE(36 + dataLen, 4);
  buf.write("WAVE", 8, "ascii");
  buf.write("fmt ", 12, "ascii");
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36, "ascii");
  buf.writeUInt32LE(dataLen, 40);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(s < 0 ? s * 32768 : s * 32767), 44 + i * 2);
  }
  return buf;
}

/** Duration of a WAV buffer in ms without decoding samples. */
export function wavDurationMs(buf: Buffer): number {
  try {
    return parseWav(buf).durationMs;
  } catch {
    return 0;
  }
}

/**
 * Amplitude envelope for lip-sync: RMS per window at `hz` frames/second,
 * peak-normalised, sqrt-compressed so quiet consonants still move the mouth.
 * Values are rounded to 3 decimals to keep the JSON payload small.
 */
export function computeEnvelope(samples: Float32Array, sampleRate: number, hz = 50): number[] {
  if (samples.length === 0) return [];
  const win = Math.max(1, Math.floor(sampleRate / hz));
  const frames = Math.ceil(samples.length / win);
  const env = new Float32Array(frames);
  let peak = 0;
  for (let f = 0; f < frames; f++) {
    const start = f * win;
    const end = Math.min(samples.length, start + win);
    let sum = 0;
    for (let i = start; i < end; i++) sum += samples[i] * samples[i];
    const rms = Math.sqrt(sum / Math.max(1, end - start));
    env[f] = rms;
    if (rms > peak) peak = rms;
  }
  if (peak <= 1e-6) return Array.from(env, () => 0);
  const out: number[] = new Array(frames);
  for (let f = 0; f < frames; f++) {
    const n = Math.sqrt(env[f] / peak); // compress
    // light smoothing with previous frame for less jitter
    const prev = f > 0 ? out[f - 1] : n;
    out[f] = Math.round((prev * 0.35 + n * 0.65) * 1000) / 1000;
  }
  return out;
}

/** Concatenates mono WAVs (resampling any clip whose rate differs from the first). */
export function concatWavs(buffers: Buffer[], gapMs = 120): Buffer {
  const parsed = buffers.map(parseWav);
  const rate = parsed[0]?.sampleRate ?? 22050;
  const gap = Math.floor((gapMs / 1000) * rate);
  let total = 0;
  const parts = parsed.map((p) => (p.sampleRate === rate ? p.samples : resample(p.samples, p.sampleRate, rate)));
  for (const p of parts) total += p.length + gap;
  const out = new Float32Array(Math.max(0, total - gap));
  let pos = 0;
  parts.forEach((p, idx) => {
    out.set(p, pos);
    pos += p.length + (idx < parts.length - 1 ? gap : 0);
  });
  return buildWav(out, rate);
}

export function resample(samples: Float32Array, from: number, to: number): Float32Array {
  if (from === to) return samples;
  const ratio = from / to;
  const outLen = Math.floor(samples.length / ratio);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const src = i * ratio;
    const i0 = Math.floor(src);
    const i1 = Math.min(samples.length - 1, i0 + 1);
    const t = src - i0;
    out[i] = samples[i0] * (1 - t) + samples[i1] * t;
  }
  return out;
}

export function silence(ms: number, sampleRate: number): Buffer {
  return buildWav(new Float32Array(Math.floor((ms / 1000) * sampleRate)), sampleRate);
}

export interface SpeakLikeOptions {
  sampleRate?: number;
  /** Fundamental frequency in Hz (Bujji ~ 330, Gangi ~ 160). */
  baseHz?: number;
  /** Pitch excursion multiplier for expressiveness (0.05 – 0.5). */
  span?: number;
  /** Syllables per second. */
  rate?: number;
  seed?: number;
}

const VOWELS = /[aeiouAEIOUఅ-ఔా-ౌ]/;

/**
 * Synthesises expressive gibberish ("bomma-speak") shaped by the text: one
 * tone burst per syllable, pauses at punctuation, pitch contour rising on
 * questions. Used by the offline mock provider so the full voice loop,
 * lip-sync and UI can be exercised with zero API credits.
 */
export function synthesizeSpeechLike(text: string, opts: SpeakLikeOptions = {}): Buffer {
  const sampleRate = opts.sampleRate ?? 22050;
  const baseHz = opts.baseHz ?? 300;
  const span = opts.span ?? 0.25;
  const rate = opts.rate ?? 7;
  let seed = (opts.seed ?? 12345) >>> 0;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  type Unit = { kind: "syl"; len: number; pitch: number } | { kind: "gap"; len: number };
  const units: Unit[] = [];
  const words = text.split(/\s+/).filter(Boolean);
  const isQuestion = /[?？]/.test(text);
  for (const word of words) {
    const clean = word.replace(/[^\p{L}\p{M}]/gu, "");
    const sylCount = Math.max(1, Math.min(6, (clean.match(VOWELS) ?? []).length || Math.ceil(clean.length / 3)));
    for (let s = 0; s < sylCount; s++) {
      const pos = units.length / Math.max(1, words.length * 2.5);
      const contour = isQuestion ? pos * 0.6 : -pos * 0.25;
      units.push({ kind: "syl", len: (0.6 + rnd() * 0.8) / rate, pitch: baseHz * (1 + span * (rnd() - 0.5) * 2 + contour * span) });
    }
    if (/[,;:،]/.test(word)) units.push({ kind: "gap", len: 0.12 });
    else if (/[.!?।]/.test(word)) units.push({ kind: "gap", len: 0.28 });
    else units.push({ kind: "gap", len: 0.03 + rnd() * 0.03 });
  }
  const totalSec = units.reduce((a, u) => a + u.len, 0) + 0.1;
  const out = new Float32Array(Math.ceil(totalSec * sampleRate));
  let cursor = 0;
  let phase = 0;
  for (const u of units) {
    const n = Math.floor(u.len * sampleRate);
    if (u.kind === "gap") {
      cursor += n;
      continue;
    }
    const attack = Math.floor(0.015 * sampleRate);
    const release = Math.floor(0.04 * sampleRate);
    for (let i = 0; i < n && cursor + i < out.length; i++) {
      const t = i / sampleRate;
      const vib = 1 + 0.02 * Math.sin(2 * Math.PI * 5.5 * t);
      const f = u.pitch * vib;
      phase += (2 * Math.PI * f) / sampleRate;
      // soft formant-ish timbre: fundamental + 2 harmonics, gentle
      const v = Math.sin(phase) * 0.6 + Math.sin(phase * 2) * 0.25 + Math.sin(phase * 3) * 0.1;
      let env = 1;
      if (i < attack) env = i / attack;
      else if (i > n - release) env = Math.max(0, (n - i) / release);
      out[cursor + i] = v * env * 0.5;
    }
    cursor += n;
  }
  return buildWav(out, sampleRate);
}
