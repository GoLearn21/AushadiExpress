# 06 · Telugu language & culture guide for Nestam

This guide is for anyone editing personas, activities or UI strings. The goal is a friend from
Andhra Pradesh, not a translated American app.

## Language register
- **వాడుక భాష (spoken Telugu)** over గ్రాంథికం. "ఏం చేస్తున్నావ్?" not "మీరు ఏమి చేయుచున్నారు?".
- **Code-mixing is natural.** "ఈరోజు office లో చాలా busy గా ఉంది" is how people talk. Keep
  English words in Latin script inside Telugu text — Bulbul handles it, and the STT `codemix`
  mode returns the same shape.
- **Address style**: మీరు/అండి (respectful) is the safe default; నువ్వు/రా (casual) only
  when the user opts in. Never నువ్వు with someone who set respectful.
- **Regional neutrality**: coastal Andhra vocabulary is the base (Vijayawada/Guntur), Mirchi
  leans Guntur, Chitti leans Vizag, Gangi leans Godavari. Avoid Telangana-specific slang unless
  a user uses it first (this app is scoped to AP).
- **Romanised (Tenglish) input** is common on phones; the server detects it (`looksLikeTenglish`)
  and asks the model for a `reply_roman` line so users who can't read the script still can.
- **Numbers** are written with digits and commas for the TTS engine ("10,000").

## Cultural anchors used in the app
- **Crafts**: Kondapalli bommalu (Krishna), Etikoppaka lacquer toys (Anakapalli), Tholu
  Bommalata leather puppets (Nimmalakunta), Kalamkari (Srikalahasti, Machilipatnam), Lepakshi.
- **Produce**: Banginapalli mango (Nuzvid), Guntur mirchi, Konaseema coconuts, Araku coffee.
- **Home rituals**: morning muggu/rangoli in the vaakili, tulasi kota, mango-leaf toranam,
  deepam at dusk, feeding sparrows — the Vaakili growth loop is built from these.
- **Festivals** (calendar in `util/telugu.ts`; lunar dates need a yearly update): Bhogi,
  Sankranti (Gangireddu, gobbemmalu, kites, ariselu), Kanuma, Ugadi (pachadi), Sri Rama Navami,
  Vinayaka Chavithi, Dasara (Vijayawada Kanaka Durga, bommala koluvu), Atla Taddi (very Andhra),
  Deepavali, Kartika Pournami, Telugu Language Day (29 Aug), AP Formation Day (1 Nov).
- **Food**: gongura pachadi, pulihora, ariselu, pootharekulu (Atreyapuram), Bandar laddu,
  Nellore chepala pulusu, mirchi bajji, filter coffee.
- **Sayings** the Bommalu use (with meaning): "చేతులు కాలాక ఆకులు పట్టుకున్నట్టు" (too late),
  "తినగ తినగ వేము తియ్యగ నుండు" (practice makes even neem sweet), "ఇంటి కంటే గుడి పదిలం"…

## Respect boundaries
- Gangi is inspired by the *Gangireddu* folk performance, not by Nandi as a deity; keep religious
  imagery light and never joke about worship.
- Festivals are greeted, not preached; Christmas and Ramzan greetings are fine when relevant.
- No caste, region or language-superiority jokes; no political commentary.
- Mental-health crisis: never dismiss, never "cheer up"; stay, ask about safety, share
  **Tele-MANAS 14416 / 1-800-891-4416** (24×7, Telugu available).

## Writing checklist for a new line
1. Would a 25-year-old in Vijayawada say it out loud to a friend? If not, rewrite.
2. ≤ 60 words, no lists, no emoji, no stage directions.
3. Give both `te` and `en`; keep `{name}` placeholders.
4. Run it through `POST /api/tts` and *listen* — Bulbul's stress falls on the written form.
