import { describe, expect, it } from "vitest";
import { buildWav, computeEnvelope, concatWavs, parseWav, synthesizeSpeechLike, isWav, resample } from "../src/audio/wav.js";

describe("wav", () => {
  it("round-trips PCM16 mono", () => {
    const samples = new Float32Array(1000).map((_, i) => Math.sin(i / 10) * 0.5);
    const wav = buildWav(samples, 16000);
    expect(isWav(wav)).toBe(true);
    const parsed = parseWav(wav);
    expect(parsed.sampleRate).toBe(16000);
    expect(parsed.samples.length).toBe(1000);
    expect(parsed.samples[100]).toBeCloseTo(samples[100], 3);
    expect(parsed.durationMs).toBe(63);
  });

  it("computes a normalised envelope at 50 Hz", () => {
    const rate = 22050;
    const samples = new Float32Array(rate); // 1s
    for (let i = 0; i < rate / 2; i++) samples[i] = Math.sin(i / 5) * 0.8; // loud first half, silent second half
    const env = computeEnvelope(samples, rate, 50);
    expect(env.length).toBe(50);
    expect(Math.max(...env)).toBeLessThanOrEqual(1);
    expect(Math.min(...env)).toBeGreaterThanOrEqual(0);
    expect(env[5]).toBeGreaterThan(0.8);
    expect(env[45]).toBeLessThan(0.05);
  });

  it("returns zeros for silence", () => {
    expect(computeEnvelope(new Float32Array(4410), 22050).every((v) => v === 0)).toBe(true);
  });

  it("synthesises bomma-speak shaped by text", () => {
    const short = parseWav(synthesizeSpeechLike("హాయ్!", { sampleRate: 16000 }));
    const long = parseWav(synthesizeSpeechLike("ఈరోజు నా మూడ్ కొంచెం డల్ గా ఉంది, కానీ నువ్వు ఉన్నావ్ కదా?", { sampleRate: 16000 }));
    expect(long.durationMs).toBeGreaterThan(short.durationMs);
    const env = computeEnvelope(long.samples, long.sampleRate);
    expect(env.some((v) => v > 0.5)).toBe(true);
    expect(env.some((v) => v < 0.1)).toBe(true); // pauses between words
  });

  it("concatenates clips with a gap and resamples mismatched rates", () => {
    const a = buildWav(new Float32Array(16000), 16000); // 1s
    const b = buildWav(new Float32Array(22050), 22050); // 1s
    const out = parseWav(concatWavs([a, b], 100));
    expect(out.sampleRate).toBe(16000);
    expect(out.durationMs).toBeGreaterThanOrEqual(2090);
    expect(out.durationMs).toBeLessThanOrEqual(2110);
    expect(resample(new Float32Array(100), 100, 50).length).toBe(50);
  });
});
