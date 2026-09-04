# 05 · Unity setup — build the Tolan-style app

## Requirements
- Unity Hub with **Unity 6000.0 LTS** (any 6000.0.x patch; the project pins 6000.0.58f1 and
  will offer to upgrade). Built-in render pipeline, legacy Input Manager (already configured in
  `ProjectSettings.asset`).
- Android: Android Build Support + SDK/NDK/OpenJDK modules. iOS: macOS + Xcode 15+.
- The Nestam server running somewhere reachable (defaults to `http://localhost:4020`).

## First run (5 minutes)
1. **Unity Hub → Add → `nestam/unity/Nestam`** and open it. Unity generates `Library/` and
   `.meta` files (commit the `.meta` files afterwards so GUIDs stay stable).
2. **Nestam ▸ 1. Build Main Scene** — creates `Assets/Nestam/Scenes/Main.unity` with camera,
   sun, `NestamApp` (API client, mic, playback, chirps, touch, sky) and the UI Toolkit document;
   also creates `Resources/Nestam/BommaStandard.mat` (so the Standard shader ships in builds), a
   `PanelSettings` asset and a runtime theme, and enables the **Advanced Text Generator**.
   If the console warns it could not enable it: *Edit ▸ Project Settings ▸ UI Toolkit ▸ Enable
   Advanced Text Generator* — this is what makes Telugu conjuncts render correctly.
3. **Nestam ▸ 2. Install Telugu Font** — downloads Noto Sans Telugu (OFL) into
   `Assets/Nestam/Resources/Nestam/Fonts` and creates the TextCore font asset. Offline? Drop
   `NotoSansTelugu-Regular.ttf` in that folder and run the menu again.
4. **Play.** Hold **SPACE** (or the red button) and speak; release to send. Tap the Bomma to
   poke it. The bottom tabs open the companion switcher, memories and the Vaakili.
5. To point a device build at your machine: Settings (⚙) → Server URL → `http://<your-LAN-IP>:4020`.
   `insecureHttpOption` is already set to allow plain HTTP for development; use HTTPS in production.

## Building
- **Nestam ▸ 3. Build Android APK** → `Builds/Android/Nestam.apk` (IL2CPP, ARM64+ARMv7,
  minSdk 24; `RECORD_AUDIO` is added automatically because the app uses `Microphone`).
- **Nestam ▸ 3b. Build iOS Xcode Project** → `Builds/iOS` (microphone usage description is
  pre-filled in Player Settings).
- **Nestam ▸ 3c. Build Desktop** for quick testing without a device.

## How the character is built (no art assets)
`BommaBuilder.Build(visual)` consumes the `visual` block the server sends for a character:
- body shape → `MeshUtil.ShapedSphere` with a per-latitude radius profile (egg, pear, tall…),
  scaled by `bodyScale`, textured by `ProceduralTextures.Body` (Kondapalli bands, Etikoppaka
  rings, Kalamkari vines, mango blush, chilli gloss, Gangireddu cloth);
- eyes: sclera, pupil (tracks the finger/camera), two highlights, a body-coloured lid that
  slides down for emotions, a brow capsule; cheeks; optional glasses and bottu;
- mouth: an interior sphere that opens with the audio envelope and a ribbon mesh whose curve is
  the smile (regenerated only when it changes);
- accessories: jasmine garland, topi, turban, leaf, chilli stem, horns with bells.
`BommaController` runs the pose/gesture/blink/breath/spring update loop; `BommaChirps` makes the
sounds; `BommaTouch` raycasts pokes and ignores taps that land on UI Toolkit elements.

Want authored art later? Keep `BommaController`'s public API (`SetEmotion`, `PlayGesture`,
`SetState`, `Poke`, `Playback.Mouth`) and swap the rig for blend-shape meshes.

## Troubleshooting
| Symptom | Fix |
|---|---|
| Boxes/wrong shapes for Telugu text | Run *Nestam ▸ 2* and enable Advanced Text Generator |
| "server unreachable" | Start `nestam/server` (`npm run dev`), check the URL in Settings; on Android emulator use `http://10.0.2.2:4020` |
| Pink materials | You switched to URP; assign a URP Lit material to `Resources/Nestam/BommaStandard.mat` |
| No microphone in Editor on macOS | Grant Unity Hub/Editor microphone permission in System Settings |
| Audio plays but mouth barely moves | The server envelope is present; check `AudioPlayback.Mouth` in the inspector; peak-normalised envelopes need non-silent audio |
| Nothing pokes | The UI panel covers the area — the top status/bond row is pickable; tap the body itself |

## Running the C# syntax check outside Unity
`python3 nestam/scripts/check-unity-syntax.py` (needs `pip install tree-sitter tree-sitter-c-sharp`).
It cannot type-check against UnityEngine, so the first import into Unity is the real compile.
