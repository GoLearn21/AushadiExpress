import { describe, expect, it } from "vitest";
import { cleanSpeech, guessEmotion, parseReply } from "../src/conversation/emotion.js";

describe("parseReply", () => {
  it("parses well-formed JSON", () => {
    const r = parseReply(JSON.stringify({ reply: "హాయ్ నేస్తం!", reply_roman: "haay nestam!", emotion: "happy", gesture: "bounce", memory_notes: ["User's name is Ravi"], activity_completed: null }));
    expect(r.reply).toBe("హాయ్ నేస్తం!");
    expect(r.emotion).toBe("happy");
    expect(r.gesture).toBe("bounce");
    expect(r.memoryNotes).toEqual(["User's name is Ravi"]);
    expect(r.salvaged).toBe(false);
  });

  it("parses fenced JSON with reasoning noise around it", () => {
    const raw = "<think>hmm</think> Sure:\n```json\n{\"reply\": \"అవునా!\", \"emotion\": \"curious\", \"gesture\": \"lean_in\", \"memory_notes\": []}\n```";
    const r = parseReply(raw);
    expect(r.reply).toBe("అవునా!");
    expect(r.emotion).toBe("curious");
    expect(r.salvaged).toBe(false);
  });

  it("falls back to enums and keyword emotion on bad values", () => {
    const r = parseReply(JSON.stringify({ reply: "నెమ్మదిగా ఊపిరి తీసుకుందాం.", emotion: "zen", gesture: "moonwalk", memory_notes: "nope" }));
    expect(r.emotion).toBe("calm");
    expect(r.gesture).toBe("none");
    expect(r.memoryNotes).toEqual([]);
  });

  it("salvages plain text with a leading tag", () => {
    const r = parseReply("[caring] అయ్యో, ఏమైంది? నేను ఇక్కడే ఉన్నాను.");
    expect(r.salvaged).toBe(true);
    expect(r.emotion).toBe("caring");
    expect(r.reply.startsWith("అయ్యో")).toBe(true);
  });
});

describe("cleanSpeech", () => {
  it("strips markdown, emojis and caps length at a sentence boundary", () => {
    const long = "**బాగుంది** 😀 " + "ఇది ఒక వాక్యం. ".repeat(60);
    const out = cleanSpeech(long, 120);
    expect(out).not.toContain("*");
    expect(out).not.toContain("😀");
    expect(out.length).toBeLessThanOrEqual(121);
    expect(out.endsWith(".")).toBe(true);
  });

  it("guesses emotions from Telugu keywords", () => {
    expect(guessEmotion("లెట్స్ గో! అదిరింది!")).toBe("excited");
    expect(guessEmotion("శుభ రాత్రి, పడుకోండి")).toBe("sleepy");
    expect(guessEmotion("ok")).toBe("neutral");
  });
});
