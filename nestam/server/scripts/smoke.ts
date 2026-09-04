/**
 * End-to-end smoke test against a running server (mock or real Sarvam key):
 *   npm run smoke            → http://localhost:4020
 *   NESTAM_URL=https://… npm run smoke
 */
import { synthesizeSpeechLike } from "../src/audio/wav.js";

const base = (process.env.NESTAM_URL ?? "http://localhost:4020").replace(/\/$/, "");

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(base + path, init);
  const body = (await res.json()) as T;
  if (!res.ok) throw new Error(`${path} -> ${res.status}: ${JSON.stringify(body)}`);
  return body;
}

async function main() {
  const status = await json<{ provider: string }>("/api/status");
  console.log("status:", status);
  const session = await json<{ sessionId: string; userId: string; greeting: { text: string; durationMs: number; latencyMs: unknown } }>("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ characterId: "bujji", name: "Ravi", language: "te", addressStyle: "casual" }),
  });
  console.log("greeting:", session.greeting.text, session.greeting.latencyMs);

  const chat = await json<{ text: string; emotion: string; latencyMs: unknown; memoryUpdates: string[] }>("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId: session.sessionId, text: "నా పేరు రవి. నాకు గోంగూర పచ్చడి అంటే చాలా ఇష్టం." }),
  });
  console.log("chat:", chat.text, chat.emotion, chat.latencyMs, chat.memoryUpdates);

  // voice: send a synthetic wav (real STT will hear tones; mock returns a canned utterance)
  const wav = synthesizeSpeechLike("నువ్వు ఎలా ఉన్నావ్?", { sampleRate: 16000, baseHz: 220 });
  const form = new FormData();
  form.append("sessionId", session.sessionId);
  form.append("audio", new Blob([new Uint8Array(wav)], { type: "audio/wav" }), "utterance.wav");
  const voice = await json<{ transcript: string; text: string; emotion: string; durationMs: number; envelope: number[]; latencyMs: unknown }>("/api/voice", { method: "POST", body: form });
  console.log("voice:", { transcript: voice.transcript, reply: voice.text, emotion: voice.emotion, audioMs: voice.durationMs, envelopeFrames: voice.envelope.length, latency: voice.latencyMs });

  const poke = await json<{ text: string }>("/api/poke", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: session.sessionId }) });
  console.log("poke:", poke.text);

  const acts = await json<{ activities: Array<{ id: string; title: { en: string } }>; energy: number }>(`/api/users/${session.userId}/activities`);
  console.log("activities:", acts.activities.map((a) => a.title.en), "energy", acts.energy);
  const done = await json<{ vaakili: { energy: number } }>(`/api/users/${session.userId}/activities/${acts.activities[0].id}/complete`, { method: "POST" });
  const care = await json<{ ok: boolean; vaakili: { level: number; muggu: number } }>(`/api/users/${session.userId}/vaakili/care`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "muggu" }) });
  console.log("vaakili:", done.vaakili.energy, care);
  console.log("usage:", await json("/api/usage"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
