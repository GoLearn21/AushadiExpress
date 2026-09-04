import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { buildWav } from "../src/audio/wav.js";

let app: ReturnType<typeof createApp>["app"];
let store: ReturnType<typeof createApp>["store"];
let dir: string;

beforeAll(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "nestam-test-"));
  ({ app, store } = createApp({ dataDir: dir }));
});

afterAll(() => {
  store.flushSync();
  fs.rmSync(dir, { recursive: true, force: true });
});

describe("api (mock provider)", () => {
  let sessionId = "";
  let userId = "";

  it("reports status in mock mode", async () => {
    const res = await request(app).get("/api/status").expect(200);
    expect(res.body.provider).toBe("mock");
    expect(res.body.ok).toBe(true);
  });

  it("lists six bommalu with visuals and options", async () => {
    const res = await request(app).get("/api/characters").expect(200);
    expect(res.body.characters.length).toBe(6);
    expect(res.body.characters.map((c: { id: string }) => c.id)).toEqual(["bujji", "chitti", "pandu", "mirchi", "tholu", "gangi"]);
    expect(res.body.characters[0].visual.pattern).toBe("kondapalli");
    expect(res.body.options.palettes.length).toBeGreaterThan(3);
  });

  it("serves the onboarding quiz and matches a bomma", async () => {
    const quiz = await request(app).get("/api/onboarding/quiz").expect(200);
    expect(quiz.body.questions.length).toBe(5);
    const match = await request(app).post("/api/onboarding/match").send({ answers: { q1: "c", q2: "c", q3: "a", q4: "c", q5: "c" } }).expect(200);
    expect(match.body.characterId).toBe("mirchi");
    expect(match.body.character.nameTe).toBe("మిర్చి");
  });

  it("creates a session with a spoken greeting", async () => {
    const res = await request(app).post("/api/session").send({ characterId: "bujji", name: "Ravi", language: "te", addressStyle: "casual" }).expect(200);
    sessionId = res.body.sessionId;
    userId = res.body.userId;
    expect(sessionId.startsWith("ses_")).toBe(true);
    expect(res.body.greeting.text).toContain("Ravi");
    expect(res.body.greeting.audioBase64.length).toBeGreaterThan(1000);
    expect(res.body.greeting.envelope.length).toBeGreaterThan(10);
    expect(res.body.greeting.envelopeHz).toBe(50);
    expect(res.body.user.streak.count).toBe(1);
  });

  it("answers a text turn and stores a memory note", async () => {
    const res = await request(app).post("/api/chat").send({ sessionId, text: "నా పేరు రవి, నాకు క్రికెట్ అంటే ఇష్టం" }).expect(200);
    expect(res.body.text.length).toBeGreaterThan(5);
    expect(res.body.emotion).toBe("happy");
    expect(res.body.memoryUpdates.some((m: string) => m.includes("రవి"))).toBe(true);
    expect(res.body.bond.totalTurns).toBe(1);
    const mem = await request(app).get(`/api/users/${userId}/memories`).expect(200);
    expect(mem.body.memories.length).toBeGreaterThanOrEqual(1);
  });

  it("answers a voice turn from a wav upload and from a mock transcript", async () => {
    const wav = buildWav(new Float32Array(16000).map((_, i) => Math.sin(i / 20) * 0.3), 16000);
    const res = await request(app).post("/api/voice").field("sessionId", sessionId).attach("audio", wav, { filename: "u.wav", contentType: "audio/wav" });
    if (res.status !== 200) console.error("voice upload failed:", res.status, res.body);
    expect(res.status).toBe(200);
    expect(res.body.transcript.length).toBeGreaterThan(0);
    expect(res.body.audioBase64.length).toBeGreaterThan(1000);
    expect(res.body.latencyMs.total).toBeGreaterThanOrEqual(0);

    const sad = await request(app).post("/api/voice").field("sessionId", sessionId).field("mockTranscript", "ఈరోజు చాలా బాధగా ఉంది").expect(200);
    expect(sad.body.transcript).toBe("ఈరోజు చాలా బాధగా ఉంది");
    expect(sad.body.emotion).toBe("caring");
    expect(sad.body.gesture).toBe("lean_in");
  });

  it("flags crisis language with a helpline", async () => {
    const res = await request(app).post("/api/chat").send({ sessionId, text: "నాకు బతకాలని లేదు" }).expect(200);
    expect(res.body.safety.crisis).toBe(true);
    expect(res.body.safety.helpline).toContain("14416");
    expect(res.body.emotion).toBe("caring");
  });

  it("pokes with a cached canned line", async () => {
    const a = await request(app).post("/api/poke").send({ sessionId }).expect(200);
    expect(a.body.emotion).toBe("laughing");
    expect(a.body.text.length).toBeGreaterThan(0);
  });

  it("runs the daily activity → energy → vaakili loop", async () => {
    const acts = await request(app).get(`/api/users/${userId}/activities`).expect(200);
    expect(acts.body.activities.length).toBe(3);
    const energyBefore = acts.body.energy;
    const done = await request(app).post(`/api/users/${userId}/activities/${acts.body.activities[0].id}/complete`).expect(200);
    expect(done.body.activity.done).toBe(true);
    expect(done.body.vaakili.energy).toBeGreaterThan(energyBefore);
    const care = await request(app).post(`/api/users/${userId}/vaakili/care`).send({ action: "muggu" }).expect(200);
    expect(care.body.ok).toBe(true);
    expect(care.body.vaakili.muggu).toBe(2);
    await request(app).post(`/api/users/${userId}/vaakili/care`).send({ action: "rocket" }).expect(400);
  });

  it("updates appearance and validates colours", async () => {
    const res = await request(app).patch(`/api/users/${userId}`).send({ appearance: { baseColor: "#123456", accessory: "topi", eyeColor: "not-a-colour", speaker: "kavya" } }).expect(200);
    expect(res.body.character.visual.baseColor).toBe("#123456");
    expect(res.body.character.visual.accessory).toBe("topi");
    expect(res.body.character.visual.eyeColor).toBe("#2B1B12");
    expect(res.body.character.voice.speaker).toBe("kavya");
  });

  it("manages memories manually", async () => {
    const add = await request(app).post(`/api/users/${userId}/memories`).send({ text: "Mother's name is Lakshmi", category: "family" }).expect(200);
    expect(add.body.added.length).toBe(1);
    const id = add.body.added[0].id;
    const del = await request(app).delete(`/api/users/${userId}/memories/${id}`).expect(200);
    expect(del.body.removed).toBe(1);
  });

  it("returns tts audio for a character", async () => {
    const res = await request(app).post("/api/tts").send({ text: "నమస్కారం", characterId: "gangi" }).expect(200);
    expect(res.body.audioBase64.length).toBeGreaterThan(100);
    expect(res.body.envelope.length).toBeGreaterThan(0);
    const wav = await request(app).post("/api/tts?format=wav").send({ text: "నమస్కారం", characterId: "gangi" }).expect(200);
    expect(wav.headers["content-type"]).toContain("audio/wav");
  });

  it("reports usage and errors cleanly", async () => {
    const usage = await request(app).get("/api/usage").expect(200);
    expect(usage.body.provider).toBe("mock");
    expect(usage.body.today.calls.llm).toBeGreaterThan(0);
    await request(app).post("/api/chat").send({ text: "hi" }).expect(400);
    await request(app).post("/api/chat").send({ sessionId: "ses_nope", text: "hi" }).expect(404);
    await request(app).post("/api/voice").field("sessionId", sessionId).expect(400);
  });
});
