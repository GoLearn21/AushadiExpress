using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Nestam.Core;
using Nestam.Character;
using Nestam.UI;
using Nestam.World;

namespace Nestam.App
{
    /// <summary>
    /// Orchestrates the whole Tolan-style loop on device:
    /// onboarding → session → hold-to-talk → server (Sarvam STT/LLM/TTS) → animated, speaking Bomma.
    /// </summary>
    public class NestamApp : MonoBehaviour
    {
        [Header("Scene")]
        public Camera Camera;
        public Light Sun;
        public Transform BommaAnchor;

        [Header("Components")]
        public NestamUI UI;
        public MicRecorder Mic;
        public AudioPlayback Playback;
        public BommaChirps Chirps;
        public BommaTouch Touch;

        public CharacterDto[] Characters { get; private set; }
        public OptionsDto Options { get; private set; }
        public QuizQuestionDto[] Quiz { get; private set; }
        public CharacterDto Character { get; private set; }
        public UserDto User { get; private set; }
        public string SessionId { get; private set; }
        public string UserId { get; private set; }
        public bool Busy { get; private set; }
        public bool Recording { get; private set; }
        public bool ServerOk { get; private set; }
        public string Language => User != null && !string.IsNullOrEmpty(User.language) ? User.language : NestamConfig.Language;

        private BommaController _bomma;
        private VaakiliWorld _world;
        private float _lastPokeReply = -10f;
        private NestamApi Api => NestamApi.Instance;

        private void Awake()
        {
            if (NestamApi.Instance == null && GetComponent<NestamApi>() == null) gameObject.AddComponent<NestamApi>();
        }

        private IEnumerator Start()
        {
            if (Playback != null) Playback.OnFinished += () => { if (_bomma != null && _bomma.State == BommaState.Speaking) _bomma.SetState(BommaState.Idle); };
            if (Mic != null) Mic.OnMaxLengthReached += EndTalk;
            _world = VaakiliWorld.Build(null);
            if (UI != null) UI.App = this;
            yield return Boot();
        }

        public IEnumerator Boot()
        {
            ServerOk = false;
            UI?.SetStatus("connecting…");
            yield return Api.GetStatus(s => { ServerOk = s.ok; UI?.SetStatus(s.provider == "mock" ? "mock mode (no Sarvam key on server)" : "Sarvam · " + s.timeOfDay); }, e => UI?.SetStatus("server unreachable: " + e));
            if (!ServerOk)
            {
                ShowBomma(FallbackCharacter());
                UI?.ShowSettings("Cannot reach " + NestamConfig.ServerUrl + ". Start nestam/server and set the URL below.");
                yield break;
            }
            yield return Api.GetCharacters(r => { Characters = r.characters; Options = r.options; }, e => UI?.SetStatus(e));
            yield return Api.GetQuiz(q => Quiz = q.questions, _ => { });
            if (Characters == null || Characters.Length == 0) { ShowBomma(FallbackCharacter()); yield break; }
            if (!NestamConfig.Onboarded)
            {
                ShowBomma(FindCharacter(NestamConfig.CharacterId));
                UI?.ShowOnboarding();
            }
            else yield return CreateSession(NestamConfig.CharacterId, false, null);
        }

        // ── characters & sessions ─────────────────────────────────────────────
        public CharacterDto FindCharacter(string id)
        {
            if (Characters != null) foreach (var c in Characters) if (c.id == id) return c;
            return Characters != null && Characters.Length > 0 ? Characters[0] : FallbackCharacter();
        }

        private static CharacterDto FallbackCharacter() => new CharacterDto { id = "bujji", nameEn = "Bujji", nameTe = "బుజ్జి", visual = new VisualDto(), chirp = new ChirpDto(), voice = new VoiceDto { speaker = "kavitha" }, craft = new Localized { te = "కొండపల్లి బొమ్మ", en = "Kondapalli toy" }, tagline = new Localized { te = "మీ బుజ్జి నేస్తం", en = "Your little best friend" }, blurb = new Localized { te = "", en = "" }, pokeLines = new Localized[0], interests = new string[0], traits = new TraitsDto() };

        /// <summary>(Re)builds the 3D Bomma from a character's resolved visual block.</summary>
        public void ShowBomma(CharacterDto c)
        {
            if (c == null) return;
            if (_bomma != null) { _bomma.Poked -= OnPoked; Destroy(_bomma.gameObject); _bomma = null; }
            Character = c;
            _bomma = BommaBuilder.Build(c.visual ?? new VisualDto(), BommaAnchor);
            if (BommaAnchor == null) _bomma.transform.position = new Vector3(0f, 0.62f, 0f);
            _bomma.Playback = Playback;
            _bomma.Chirps = Chirps;
            _bomma.LookCamera = Camera != null ? Camera : UnityEngine.Camera.main;
            if (Chirps != null && c.chirp != null) Chirps.Configure(c.chirp.baseHz, c.chirp.pattern);
            if (Touch != null) { Touch.Controller = _bomma; Touch.Camera = _bomma.LookCamera; }
            _bomma.Poked += OnPoked;
            _bomma.PlayGesture("bounce");
            UI?.OnCharacterChanged(c);
        }

        public IEnumerator CreateSession(string characterId, bool silent, SessionRequest overrides)
        {
            SetBusy(true);
            var req = overrides ?? new SessionRequest();
            req.userId = NestamConfig.UserId;
            req.characterId = characterId;
            if (string.IsNullOrEmpty(req.name)) req.name = NestamConfig.UserName;
            if (string.IsNullOrEmpty(req.language)) req.language = NestamConfig.Language;
            if (string.IsNullOrEmpty(req.addressStyle)) req.addressStyle = NestamConfig.AddressStyle;
            req.silent = silent;
            SessionResponse res = null;
            string error = null;
            yield return Api.CreateSession(req, r => res = r, e => error = e);
            SetBusy(false);
            if (res == null) { UI?.SetStatus("session failed: " + error); yield break; }
            SessionId = res.sessionId;
            UserId = res.userId;
            NestamConfig.UserId = res.userId;
            NestamConfig.CharacterId = res.character.id;
            User = res.user;
            ShowBomma(res.character);
            _world?.Apply(res.user.vaakili);
            UI?.OnUserChanged(res.user);
            UI?.ShowHome();
            if (res.greeting != null) Present(res.greeting);
        }

        public void SwitchCharacter(string id)
        {
            if (Busy) return;
            NestamConfig.CharacterId = id;
            StartCoroutine(CreateSession(id, false, null));
        }

        public void FinishOnboarding(string characterId, string name, string language, string addressStyle)
        {
            NestamConfig.CharacterId = characterId;
            NestamConfig.UserName = name ?? "";
            NestamConfig.Language = language;
            NestamConfig.AddressStyle = addressStyle;
            NestamConfig.Onboarded = true;
            StartCoroutine(CreateSession(characterId, false, new SessionRequest { name = name, language = language, addressStyle = addressStyle }));
        }

        public void MatchQuiz(Dictionary<string, string> answers, Action<MatchResponse> done)
        {
            StartCoroutine(Api.Match(answers, done, e => UI?.SetStatus(e)));
        }

        // ── conversation ──────────────────────────────────────────────────────
        public void BeginTalk()
        {
            if (Busy || Recording || Mic == null || string.IsNullOrEmpty(SessionId)) return;
            Playback?.Stop();
            if (!Mic.StartRecording()) { UI?.SetStatus("microphone unavailable"); return; }
            Recording = true;
            _bomma?.SetState(BommaState.Listening);
            UI?.SetRecording(true);
        }

        public void EndTalk()
        {
            if (!Recording) return;
            Recording = false;
            UI?.SetRecording(false);
            var wav = Mic.StopRecording();
            if (wav == null) { _bomma?.SetState(BommaState.Idle); _bomma?.SetEmotion("curious"); return; }
            StartCoroutine(SendVoice(wav));
        }

        private IEnumerator SendVoice(byte[] wav)
        {
            SetBusy(true);
            _bomma?.SetState(BommaState.Thinking);
            yield return Api.Voice(SessionId, wav, Present, e => { UI?.SetStatus(e); _bomma?.SetEmotion("sad"); _bomma?.SetState(BommaState.Idle); });
            SetBusy(false);
        }

        public void SendText(string text)
        {
            if (Busy || string.IsNullOrWhiteSpace(text) || string.IsNullOrEmpty(SessionId)) return;
            StartCoroutine(SendTextRoutine(text.Trim()));
        }

        private IEnumerator SendTextRoutine(string text)
        {
            SetBusy(true);
            Playback?.Stop();
            _bomma?.SetState(BommaState.Thinking);
            yield return Api.Chat(SessionId, text, Present, e => { UI?.SetStatus(e); _bomma?.SetEmotion("sad"); _bomma?.SetState(BommaState.Idle); });
            SetBusy(false);
        }

        /// <summary>Shows and speaks a reply: subtitle bubble, emotion, gesture, lip-synced audio.</summary>
        public void Present(ReplyDto r)
        {
            if (r == null) return;
            UI?.ShowReply(r);
            if (_bomma != null)
            {
                _bomma.SetEmotion(r.emotion);
                _bomma.PlayGesture(r.gesture);
            }
            if (!string.IsNullOrEmpty(r.audioBase64) && Playback != null)
            {
                Playback.Play(r);
                _bomma?.SetState(BommaState.Speaking);
            }
            else _bomma?.SetState(BommaState.Idle);
            if (r.bond != null) UI?.OnBondChanged(r.bond);
            if (!string.IsNullOrEmpty(r.activityCompleted)) RefreshVaakili(v => _world?.Apply(v.vaakili));
        }

        private void OnPoked()
        {
            if (Busy || string.IsNullOrEmpty(SessionId) || Time.time - _lastPokeReply < 4f) return;
            _lastPokeReply = Time.time;
            StartCoroutine(Api.Poke(SessionId, Present, _ => { }));
        }

        // ── panels ────────────────────────────────────────────────────────────
        public void RefreshMemories(Action<MemoryDto[]> done) { if (!string.IsNullOrEmpty(UserId)) StartCoroutine(Api.GetMemories(UserId, r => done(r.memories), e => UI?.SetStatus(e))); }
        public void DeleteMemory(string id, Action<MemoryDto[]> done) { StartCoroutine(Api.DeleteMemory(UserId, id, r => done(r.memories), e => UI?.SetStatus(e))); }
        public void RefreshActivities(Action<ActivitiesResponse> done) { if (!string.IsNullOrEmpty(UserId)) StartCoroutine(Api.GetActivities(UserId, done, e => UI?.SetStatus(e))); }
        public void CompleteActivity(string id, Action<CompleteActivityResponse> done) { StartCoroutine(Api.CompleteActivity(UserId, id, r => { _world?.Apply(r.vaakili); _bomma?.PlayGesture("bounce"); _bomma?.SetEmotion("happy"); Chirps?.PlayChirp(); done(r); }, e => UI?.SetStatus(e))); }
        public void RefreshVaakili(Action<VaakiliResponse> done) { if (!string.IsNullOrEmpty(UserId)) StartCoroutine(Api.GetVaakili(UserId, r => { _world?.Apply(r.vaakili); done(r); }, e => UI?.SetStatus(e))); }
        public void Care(string action, Action<CareResponse> done) { StartCoroutine(Api.Care(UserId, action, r => { if (r.ok) { _world?.Apply(r.vaakili); _bomma?.PlayGesture("dance"); _bomma?.SetEmotion("excited"); Chirps?.PlayChirp(); } done(r); }, e => UI?.SetStatus(e))); }
        public void RefreshUsage(Action<UsageResponse> done) { StartCoroutine(Api.GetUsage(done, e => UI?.SetStatus(e))); }

        public void ApplyAppearance(AppearanceDto a)
        {
            if (string.IsNullOrEmpty(UserId)) return;
            StartCoroutine(Api.PatchUser(UserId, new PatchUserRequest { appearance = a }, r => { User = r.user; ShowBomma(r.character); }, e => UI?.SetStatus(e)));
        }

        public void SaveSettings(string serverUrl, string name, string language, string addressStyle)
        {
            bool urlChanged = serverUrl.TrimEnd('/') != NestamConfig.ServerUrl;
            NestamConfig.ServerUrl = serverUrl;
            NestamConfig.UserName = name ?? "";
            NestamConfig.Language = language;
            NestamConfig.AddressStyle = addressStyle;
            if (urlChanged || string.IsNullOrEmpty(SessionId)) { StartCoroutine(Boot()); return; }
            StartCoroutine(Api.PatchUser(UserId, new PatchUserRequest { name = name, language = language, addressStyle = addressStyle }, r => { User = r.user; UI?.OnUserChanged(r.user); UI?.ShowHome(); }, e => UI?.SetStatus(e)));
        }

        public void ResetProfile()
        {
            PlayerPrefs.DeleteKey(NestamConfig.PrefUserId);
            PlayerPrefs.DeleteKey(NestamConfig.PrefOnboarded);
            PlayerPrefs.Save();
            SessionId = null; UserId = null; User = null;
            StartCoroutine(Boot());
        }

        // ── helpers ───────────────────────────────────────────────────────────
        private void SetBusy(bool b) { Busy = b; UI?.SetBusy(b); }

        private void Update()
        {
            // Editor/desktop convenience: hold SPACE to talk.
            if (Input.GetKeyDown(KeyCode.Space) && (UI == null || !UI.IsTextFocused)) BeginTalk();
            if (Input.GetKeyUp(KeyCode.Space)) EndTalk();
        }
    }
}
