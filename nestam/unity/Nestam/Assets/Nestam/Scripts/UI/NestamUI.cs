using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.TextCore.Text;
using UnityEngine.UIElements;
using Nestam.App;
using Nestam.Core;
using Nestam.Character;

namespace Nestam.UI
{
    /// <summary>
    /// The whole interface, built in code with UI Toolkit (Unity 6's Advanced Text Generator
    /// shapes Telugu correctly — enable it under Project Settings ▸ UI Toolkit).
    /// Screens: onboarding (quiz → match → profile), home (bubble + hold-to-talk), bottom
    /// sheet tabs (బొమ్మలు / జ్ఞాపకాలు / వాకిలి) and settings.
    /// </summary>
    [RequireComponent(typeof(UIDocument))]
    public class NestamUI : MonoBehaviour
    {
        public NestamApp App;
        public bool IsTextFocused { get; private set; }

        // palette (matches the web console)
        static readonly Color Ink = Hex("#2B1B12"), Muted = Hex("#7A6656"), Cream = Hex("#FBF3E4"), Card = Hex("#FFFFFF"), Line = Hex("#EAD9C2"), Accent = Hex("#D7263D"), Teal = Hex("#1B998B"), Gold = Hex("#F2B632"), Sand = Hex("#F1E6D3");

        private UIDocument _doc;
        private VisualElement _root, _onboarding, _home, _sheet, _settings, _obBody;
        private Label _status, _bubble, _bubbleRoman, _bubbleMeta, _transcript, _bond, _pttLabel;
        private VisualElement _ptt, _textRow, _sheetBody, _tabBar;
        private TextField _textField;
        private readonly Dictionary<string, string> _quizAnswers = new Dictionary<string, string>();
        private int _quizIndex;
        private string _pendingCharacterId;
        private string _activeTab = "";

        private string Lang => App != null ? App.Language : NestamConfig.Language;
        private string L(string te, string en) => Lang == "en" ? en : te;

        private void Awake()
        {
            _doc = GetComponent<UIDocument>();
            if (_doc.panelSettings == null) _doc.panelSettings = Resources.Load<PanelSettings>("Nestam/NestamPanelSettings");
        }

        private void OnEnable()
        {
            Build();
            BommaTouch.IsPointerOverUI = ScreenPointOverUI;
        }

        private void OnDisable() { BommaTouch.IsPointerOverUI = null; }

        private bool ScreenPointOverUI(Vector2 screen)
        {
            var panel = _root?.panel;
            if (panel == null) return false;
            var p = RuntimePanelUtils.ScreenToPanel(panel, new Vector2(screen.x, Screen.height - screen.y));
            return panel.Pick(p) != null;
        }

        // ── construction ──────────────────────────────────────────────────────
        private void Build()
        {
            _root = _doc.rootVisualElement;
            _root.Clear();
            _root.style.flexGrow = 1;
            _root.pickingMode = PickingMode.Ignore;
            var fa = Resources.Load<FontAsset>("Nestam/Fonts/NotoSansTelugu");
            if (fa != null) _root.style.unityFontDefinition = new StyleFontDefinition(FontDefinition.FromSDFFont(fa));
            else
            {
                var f = Resources.Load<Font>("Nestam/Fonts/NotoSansTelugu-Regular");
                if (f == null) f = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
                if (f != null) _root.style.unityFontDefinition = new StyleFontDefinition(FontDefinition.FromFont(f));
                Debug.LogWarning("[Nestam] Telugu font not installed — run Nestam ▸ 2. Install Telugu Font for correct script rendering.");
            }
            _root.style.color = Ink;

            // status strip (top)
            _status = Lbl("", 12, false, Muted);
            _status.style.position = Position.Absolute; _status.style.top = 44; _status.style.left = 16; _status.style.right = 16;
            _status.style.unityTextAlign = TextAnchor.MiddleCenter;
            _root.Add(_status);

            BuildHome();
            BuildOnboarding();
            BuildSettings();
            ShowScreen(null);
        }

        private void BuildHome()
        {
            _home = new VisualElement { pickingMode = PickingMode.Ignore };
            Fill(_home);
            _home.style.flexDirection = FlexDirection.Column;
            _home.style.justifyContent = Justify.SpaceBetween;

            // top bar: bond + settings
            var top = Row(); top.style.marginTop = 64; top.style.marginLeft = 16; top.style.marginRight = 16; top.style.justifyContent = Justify.SpaceBetween;
            _bond = Lbl("", 13, true, Ink); Chip(_bond, Hex("#FFF2C2"));
            var gear = Btn("⚙", () => ShowSettings(null), false); gear.style.width = 44; gear.style.height = 44; Radius(gear, 22);
            top.Add(_bond); top.Add(gear);
            _home.Add(top);

            // bubble
            var mid = new VisualElement { pickingMode = PickingMode.Ignore }; mid.style.flexGrow = 1; mid.style.justifyContent = Justify.FlexStart; mid.style.alignItems = Align.Center; mid.style.paddingTop = 12;
            var bubble = Col(); bubble.style.backgroundColor = Card; bubble.style.maxWidth = Length.Percent(86); Radius(bubble, 18); Pad(bubble, 10, 16, 10, 16); Border(bubble, Line, 2);
            _bubble = Lbl("", 18, false, Ink); _bubble.style.whiteSpace = WhiteSpace.Normal; _bubble.style.unityTextAlign = TextAnchor.MiddleCenter;
            _bubbleRoman = Lbl("", 12, false, Muted); _bubbleRoman.style.whiteSpace = WhiteSpace.Normal; _bubbleRoman.style.unityTextAlign = TextAnchor.MiddleCenter;
            _bubbleMeta = Lbl("", 11, false, Teal); _bubbleMeta.style.whiteSpace = WhiteSpace.Normal; _bubbleMeta.style.unityTextAlign = TextAnchor.MiddleCenter;
            bubble.Add(_bubble); bubble.Add(_bubbleRoman); bubble.Add(_bubbleMeta);
            bubble.style.display = DisplayStyle.None;
            _bubble.RegisterValueChangedCallback(_ => bubble.style.display = string.IsNullOrEmpty(_bubble.text) ? DisplayStyle.None : DisplayStyle.Flex);
            mid.Add(bubble);
            _bubble.userData = bubble;
            _home.Add(mid);

            // transcript chip (what the user said)
            _transcript = Lbl("", 13, false, Color.white); Chip(_transcript, Ink); _transcript.style.alignSelf = Align.FlexEnd; _transcript.style.marginRight = 16; _transcript.style.maxWidth = Length.Percent(70); _transcript.style.whiteSpace = WhiteSpace.Normal; _transcript.style.display = DisplayStyle.None;
            _home.Add(_transcript);

            // bottom: PTT + text + tabs
            var bottom = Col(); bottom.style.backgroundColor = new Color(1f, 1f, 1f, 0.92f); Pad(bottom, 12, 16, 16, 16); RadiusTop(bottom, 24);
            _ptt = new VisualElement(); _ptt.style.height = 72; _ptt.style.backgroundColor = Accent; Radius(_ptt, 36); _ptt.style.justifyContent = Justify.Center; _ptt.style.alignItems = Align.Center;
            _pttLabel = Lbl(L("నొక్కి పట్టి మాట్లాడండి", "Hold to talk"), 18, true, Color.white); _pttLabel.pickingMode = PickingMode.Ignore;
            _ptt.Add(_pttLabel);
            _ptt.RegisterCallback<PointerDownEvent>(e => { _ptt.CapturePointer(e.pointerId); App?.BeginTalk(); });
            _ptt.RegisterCallback<PointerUpEvent>(e => { _ptt.ReleasePointer(e.pointerId); App?.EndTalk(); });
            _ptt.RegisterCallback<PointerCancelEvent>(e => { _ptt.ReleasePointer(e.pointerId); App?.EndTalk(); });
            _ptt.RegisterCallback<PointerCaptureOutEvent>(_ => App?.EndTalk());
            bottom.Add(_ptt);

            _textRow = Row(); _textRow.style.marginTop = 10;
            _textField = new TextField(); _textField.style.flexGrow = 1; _textField.style.height = 44; _textField.style.fontSize = 15; Radius(_textField, 12);
            _textField.RegisterCallback<FocusInEvent>(_ => IsTextFocused = true);
            _textField.RegisterCallback<FocusOutEvent>(_ => IsTextFocused = false);
            _textField.RegisterCallback<KeyDownEvent>(e => { if (e.keyCode == KeyCode.Return || e.keyCode == KeyCode.KeypadEnter) SubmitText(); });
            var send = Btn(L("పంపు", "Send"), SubmitText, true); send.style.marginLeft = 8; send.style.height = 44;
            _textRow.Add(_textField); _textRow.Add(send);
            bottom.Add(_textRow);

            _tabBar = Row(); _tabBar.style.marginTop = 10; _tabBar.style.justifyContent = Justify.SpaceAround;
            foreach (var t in new[] { ("bommalu", "బొమ్మలు", "Bommalu"), ("memories", "జ్ఞాపకాలు", "Memories"), ("vaakili", "వాకిలి", "Vaakili") })
            {
                var id = t.Item1;
                var b = Btn(L(t.Item2, t.Item3), () => ToggleTab(id), false); b.style.flexGrow = 1; b.style.marginLeft = 3; b.style.marginRight = 3; b.name = "tab-" + id;
                _tabBar.Add(b);
            }
            bottom.Add(_tabBar);

            _sheetBody = new ScrollView(ScrollViewMode.Vertical); _sheetBody.style.maxHeight = 380; _sheetBody.style.marginTop = 8; _sheetBody.style.display = DisplayStyle.None;
            bottom.Add(_sheetBody);
            _home.Add(bottom);
            _root.Add(_home);
        }

        private void BuildOnboarding()
        {
            _onboarding = Col(); Fill(_onboarding); _onboarding.style.backgroundColor = new Color(0.98f, 0.95f, 0.89f, 0.96f); _onboarding.style.justifyContent = Justify.FlexEnd;
            _obBody = Col(); Pad(_obBody, 20, 20, 28, 20); _obBody.style.backgroundColor = Card; RadiusTop(_obBody, 28); _obBody.style.maxHeight = Length.Percent(78);
            _onboarding.Add(_obBody);
            _root.Add(_onboarding);
        }

        private void BuildSettings()
        {
            _settings = Col(); Fill(_settings); _settings.style.backgroundColor = new Color(0.98f, 0.95f, 0.89f, 0.98f); _settings.style.justifyContent = Justify.FlexEnd;
            _root.Add(_settings);
        }

        // ── screens ───────────────────────────────────────────────────────────
        private void ShowScreen(VisualElement screen)
        {
            foreach (var s in new[] { _home, _onboarding, _settings }) if (s != null) s.style.display = s == screen ? DisplayStyle.Flex : DisplayStyle.None;
        }

        public void ShowHome() { ShowScreen(_home); RefreshLabels(); }

        public void ShowOnboarding() { ShowScreen(_onboarding); ObWelcome(); }

        public void ShowSettings(string message)
        {
            _settings.Clear();
            var body = Col(); Pad(body, 20, 20, 28, 20); body.style.backgroundColor = Card; RadiusTop(body, 28);
            body.Add(Lbl(L("సెట్టింగ్స్", "Settings"), 22, true, Ink));
            if (!string.IsNullOrEmpty(message)) { var m = Lbl(message, 13, false, Accent); m.style.whiteSpace = WhiteSpace.Normal; body.Add(m); }
            body.Add(Lbl("Server URL", 12, false, Muted));
            var url = new TextField { value = NestamConfig.ServerUrl }; url.style.height = 40; body.Add(url);
            body.Add(Lbl(L("మీ పేరు", "Your name"), 12, false, Muted));
            var name = new TextField { value = App != null && App.User != null && !string.IsNullOrEmpty(App.User.name) ? App.User.name : NestamConfig.UserName }; name.style.height = 40; body.Add(name);
            string lang = Lang, style = App != null && App.User != null ? App.User.addressStyle : NestamConfig.AddressStyle;
            body.Add(Lbl(L("భాష", "Language"), 12, false, Muted));
            body.Add(Segmented(new[] { ("te", "తెలుగు"), ("mixed", "Telugu + English"), ("en", "English") }, lang, v => lang = v));
            body.Add(Lbl(L("సంబోధన", "How should your Bomma address you?"), 12, false, Muted));
            body.Add(Segmented(new[] { ("respectful", "మీరు (respectful)"), ("casual", "నువ్వు (casual)") }, style, v => style = v));
            var usage = Lbl("", 11, false, Muted); usage.style.whiteSpace = WhiteSpace.Normal; body.Add(usage);
            App?.RefreshUsage(u => usage.text = (u.provider == "mock" ? "Mock provider — nothing billed." : "Sarvam") + $"  ·  today ≈ ₹{u.today.inr:0.00} / cap ₹{u.dailyCapInr:0}  ·  calls stt {u.today.calls.stt} tts {u.today.calls.tts} llm {u.today.calls.llm}" + (u.thrifty ? "  ·  THRIFTY MODE (no audio)" : ""));
            var row = Row(); row.style.marginTop = 12; row.style.justifyContent = Justify.SpaceBetween;
            var reset = Btn(L("కొత్తగా మొదలు", "Start over"), () => { App?.ResetProfile(); }, false);
            var save = Btn(L("సేవ్", "Save"), () => App?.SaveSettings(url.value, name.value, lang, style), true);
            var back = Btn(L("వెనక్కి", "Back"), ShowHome, false);
            row.Add(reset); row.Add(back); row.Add(save);
            body.Add(row);
            _settings.Add(body);
            ShowScreen(_settings);
        }

        // ── onboarding steps ──────────────────────────────────────────────────
        private void ObWelcome()
        {
            _obBody.Clear();
            _obBody.Add(Lbl("నేస్తం", 40, true, Accent));
            _obBody.Add(Lbl(L("మీ తెలుగు నేస్తం. ఆంధ్రప్రదేశ్ బొమ్మలు మీతో మాట్లాడతాయి, గుర్తుపెట్టుకుంటాయి, పెరుగుతాయి.", "Your Telugu best friend. Living toys from Andhra Pradesh that talk, remember and grow with you."), 15, false, Muted, wrap: true));
            var quiz = Btn(L("నా బొమ్మను కనుక్కోండి · Quiz", "Find my Bomma · quiz"), ObQuiz, true); quiz.style.marginTop = 16; quiz.style.height = 52;
            var browse = Btn(L("బొమ్మలన్నీ చూడండి", "Browse all Bommalu"), ObPicker, false); browse.style.marginTop = 8; browse.style.height = 48;
            _obBody.Add(quiz); _obBody.Add(browse);
        }

        private void ObQuiz()
        {
            _quizAnswers.Clear(); _quizIndex = 0;
            if (App == null || App.Quiz == null || App.Quiz.Length == 0) { ObPicker(); return; }
            ObQuizQuestion();
        }

        private void ObQuizQuestion()
        {
            _obBody.Clear();
            var q = App.Quiz[_quizIndex];
            _obBody.Add(Lbl($"{_quizIndex + 1} / {App.Quiz.Length}", 12, false, Muted));
            _obBody.Add(Lbl(q.text.Pick(Lang), 20, true, Ink, wrap: true));
            foreach (var o in q.options)
            {
                var opt = o;
                var b = Btn(opt.text.Pick(Lang), () =>
                {
                    _quizAnswers[q.id] = opt.id;
                    _quizIndex++;
                    if (_quizIndex < App.Quiz.Length) ObQuizQuestion();
                    else App.MatchQuiz(_quizAnswers, ObMatch);
                }, false);
                b.style.marginTop = 8; b.style.height = 48; b.style.unityTextAlign = TextAnchor.MiddleLeft;
                _obBody.Add(b);
            }
        }

        private void ObMatch(MatchResponse m)
        {
            _obBody.Clear();
            var c = m.character;
            App.ShowBomma(c);
            _obBody.Add(Lbl(L("మీ నేస్తం:", "Your Bomma:"), 13, false, Muted));
            _obBody.Add(Lbl($"{c.nameTe} · {c.nameEn}", 30, true, Accent));
            _obBody.Add(Lbl(c.tagline.Pick(Lang) + "  —  " + c.craft.Pick(Lang), 14, true, Teal, wrap: true));
            _obBody.Add(Lbl(c.blurb.Pick(Lang), 14, false, Ink, wrap: true));
            _obBody.Add(Lbl($"{Mathf.RoundToInt(m.scores[0].score * 100)}% match", 12, false, Muted));
            var choose = Btn(L("ఇదే నా నేస్తం", "This is my friend"), () => ObProfile(c.id), true); choose.style.marginTop = 12; choose.style.height = 52;
            var others = Btn(L("వేరే బొమ్మలు చూడు", "See the others"), ObPicker, false); others.style.marginTop = 8;
            _obBody.Add(choose); _obBody.Add(others);
        }

        private void ObPicker()
        {
            _obBody.Clear();
            _obBody.Add(Lbl(L("బొమ్మలు", "The Bommalu"), 24, true, Ink));
            var sv = new ScrollView(ScrollViewMode.Vertical); sv.style.maxHeight = 420;
            foreach (var c in App.Characters)
            {
                var ch = c;
                var card = Col(); card.style.backgroundColor = Hex("#FFFDF8"); Border(card, Line, 2); Radius(card, 16); Pad(card, 10, 12, 10, 12); card.style.marginTop = 8;
                var head = Row(); head.style.justifyContent = Justify.SpaceBetween;
                head.Add(Lbl($"{ch.nameTe} · {ch.nameEn}", 18, true, Ink));
                var sw = new VisualElement(); sw.style.width = 24; sw.style.height = 24; Radius(sw, 12); sw.style.backgroundColor = Hex(ch.visual.baseColor); Border(sw, Hex(ch.visual.secondaryColor), 3);
                head.Add(sw);
                card.Add(head);
                card.Add(Lbl(ch.craft.Pick(Lang) + " · " + ch.tagline.Pick(Lang), 12, false, Teal, wrap: true));
                card.Add(Lbl(ch.blurb.Pick(Lang), 13, false, Muted, wrap: true));
                card.RegisterCallback<ClickEvent>(_ => { App.ShowBomma(ch); ObProfile(ch.id); });
                sv.Add(card);
            }
            _obBody.Add(sv);
            var back = Btn(L("వెనక్కి", "Back"), ObWelcome, false); back.style.marginTop = 8;
            _obBody.Add(back);
        }

        private void ObProfile(string characterId)
        {
            _pendingCharacterId = characterId;
            _obBody.Clear();
            _obBody.Add(Lbl(L("మీ గురించి", "About you"), 24, true, Ink));
            _obBody.Add(Lbl(L("మీ పేరు", "Your name"), 12, false, Muted));
            var name = new TextField { value = NestamConfig.UserName }; name.style.height = 44; name.style.fontSize = 16;
            name.RegisterCallback<FocusInEvent>(_ => IsTextFocused = true); name.RegisterCallback<FocusOutEvent>(_ => IsTextFocused = false);
            _obBody.Add(name);
            string lang = NestamConfig.Language, style = NestamConfig.AddressStyle;
            _obBody.Add(Lbl(L("భాష", "Language"), 12, false, Muted));
            _obBody.Add(Segmented(new[] { ("te", "తెలుగు"), ("mixed", "Telugu + English"), ("en", "English") }, lang, v => lang = v));
            _obBody.Add(Lbl(L("బొమ్మ మిమ్మల్ని ఎలా పిలవాలి?", "How should your Bomma address you?"), 12, false, Muted));
            _obBody.Add(Segmented(new[] { ("respectful", "మీరు · respectful"), ("casual", "నువ్వు · casual") }, style, v => style = v));
            var go = Btn(L("మొదలుపెడదాం!", "Let's begin!"), () => App.FinishOnboarding(_pendingCharacterId, name.value, lang, style), true); go.style.marginTop = 16; go.style.height = 52;
            _obBody.Add(go);
        }

        // ── home: replies, state ──────────────────────────────────────────────
        public void ShowReply(ReplyDto r)
        {
            var bubble = _bubble.userData as VisualElement;
            _bubble.text = r.text ?? "";
            _bubbleRoman.text = r.textRoman ?? "";
            _bubbleRoman.style.display = string.IsNullOrEmpty(r.textRoman) ? DisplayStyle.None : DisplayStyle.Flex;
            string meta = "";
            if (r.safety != null && r.safety.crisis) meta = "💛 " + r.safety.helpline;
            else if (r.memoryUpdates != null && r.memoryUpdates.Length > 0) meta = L("గుర్తుపెట్టుకున్నా: ", "remembered: ") + string.Join(" · ", r.memoryUpdates);
            else if (r.thrifty) meta = L("(ఈరోజు వాయిస్ బడ్జెట్ అయిపోయింది — టెక్స్ట్ మాత్రమే)", "(daily voice budget reached — text only)");
            _bubbleMeta.text = meta;
            _bubbleMeta.style.display = string.IsNullOrEmpty(meta) ? DisplayStyle.None : DisplayStyle.Flex;
            if (bubble != null) bubble.style.display = string.IsNullOrEmpty(_bubble.text) ? DisplayStyle.None : DisplayStyle.Flex;
            if (!string.IsNullOrEmpty(r.transcript)) { _transcript.text = r.transcript; _transcript.style.display = DisplayStyle.Flex; }
            if (r.latencyMs != null) SetStatus($"stt {r.latencyMs.stt} · llm {r.latencyMs.llm} · tts {r.latencyMs.tts} ms · {r.provider}");
        }

        public void SetStatus(string s) { if (_status != null) _status.text = s ?? ""; }

        public void SetBusy(bool busy)
        {
            if (_ptt == null) return;
            _ptt.style.backgroundColor = busy ? Muted : Accent;
            _pttLabel.text = busy ? L("ఆలోచిస్తోంది…", "Thinking…") : L("నొక్కి పట్టి మాట్లాడండి", "Hold to talk");
        }

        public void SetRecording(bool rec)
        {
            if (_ptt == null) return;
            _ptt.style.backgroundColor = rec ? Teal : Accent;
            _pttLabel.text = rec ? L("వింటున్నా… వదిలేయండి", "Listening… release to send") : L("నొక్కి పట్టి మాట్లాడండి", "Hold to talk");
        }

        public void OnCharacterChanged(CharacterDto c) { if (_activeTab == "bommalu") RenderBommaluTab(); }

        public void OnUserChanged(UserDto u)
        {
            if (u == null || u.vaakili == null) return;
            _bond.text = $"⭐ {u.vaakili.level}   ⚡ {u.vaakili.energy}   🔥 {u.streak.count}";
            RefreshLabels();
        }

        public void OnBondChanged(BondDto b) { if (b != null) _bond.text = $"⭐ {b.level}   ⚡ {b.energy}   🔥 {b.streak}"; }

        private void RefreshLabels()
        {
            if (_pttLabel != null && App != null && !App.Busy && !App.Recording) _pttLabel.text = L("నొక్కి పట్టి మాట్లాడండి", "Hold to talk");
        }

        private void SubmitText()
        {
            var t = _textField.value;
            if (string.IsNullOrWhiteSpace(t)) return;
            _textField.value = "";
            App?.SendText(t);
        }

        // ── bottom sheet tabs ─────────────────────────────────────────────────
        private void ToggleTab(string id)
        {
            if (_activeTab == id) { _activeTab = ""; _sheetBody.style.display = DisplayStyle.None; return; }
            _activeTab = id;
            _sheetBody.style.display = DisplayStyle.Flex;
            foreach (var child in _tabBar.Children()) child.style.backgroundColor = child.name == "tab-" + id ? Ink : Sand;
            foreach (var child in _tabBar.Children()) ((Button)child).style.color = child.name == "tab-" + id ? Color.white : Ink;
            switch (id)
            {
                case "bommalu": RenderBommaluTab(); break;
                case "memories": RenderMemoriesTab(); break;
                case "vaakili": RenderVaakiliTab(); break;
            }
        }

        private void RenderBommaluTab()
        {
            _sheetBody.Clear();
            if (App?.Characters == null) return;
            var row = Row(); row.style.flexWrap = Wrap.Wrap; row.style.justifyContent = Justify.SpaceBetween;
            foreach (var c in App.Characters)
            {
                var ch = c;
                bool active = App.Character != null && App.Character.id == ch.id;
                var card = Col(); card.style.width = Length.Percent(31); card.style.marginBottom = 8; card.style.alignItems = Align.Center; Pad(card, 8, 4, 8, 4); Radius(card, 14);
                card.style.backgroundColor = active ? Hex("#FFF2F0") : Hex("#FFFDF8"); Border(card, active ? Accent : Line, 2);
                var sw = new VisualElement(); sw.style.width = 40; sw.style.height = 40; Radius(sw, 20); sw.style.backgroundColor = Hex(ch.visual.baseColor); Border(sw, Hex(ch.visual.outlineColor), 3);
                card.Add(sw);
                card.Add(Lbl(ch.nameTe, 14, true, Ink));
                card.Add(Lbl(ch.nameEn, 11, false, Muted));
                card.RegisterCallback<ClickEvent>(_ => App.SwitchCharacter(ch.id));
                row.Add(card);
            }
            _sheetBody.Add(row);
            // quick customise: palettes + accessories + voice
            if (App.Options != null)
            {
                _sheetBody.Add(Lbl(L("అలంకరణ", "Customise"), 12, true, Muted));
                var pal = Row(); pal.style.flexWrap = Wrap.Wrap;
                foreach (var p in App.Options.palettes)
                {
                    var pp = p;
                    var sw = new VisualElement(); sw.style.width = 34; sw.style.height = 34; sw.style.marginRight = 6; sw.style.marginBottom = 6; Radius(sw, 10); sw.style.backgroundColor = Hex(pp.baseColor); Border(sw, Hex(pp.secondaryColor), 4);
                    sw.RegisterCallback<ClickEvent>(_ => App.ApplyAppearance(new AppearanceDto { baseColor = pp.baseColor, secondaryColor = pp.secondaryColor, accentColor = pp.accentColor }));
                    pal.Add(sw);
                }
                _sheetBody.Add(pal);
                var acc = Row(); acc.style.flexWrap = Wrap.Wrap;
                foreach (var a in App.Options.accessories)
                {
                    var aa = a;
                    var b = Btn(aa, () => App.ApplyAppearance(new AppearanceDto { accessory = aa }), false); b.style.marginRight = 4; b.style.marginBottom = 4; b.style.fontSize = 12;
                    acc.Add(b);
                }
                _sheetBody.Add(acc);
                var voices = Row(); voices.style.flexWrap = Wrap.Wrap;
                foreach (var s in App.Options.speakersV3)
                {
                    var sp = s;
                    var b = Btn("🎙 " + sp, () => App.ApplyAppearance(new AppearanceDto { speaker = sp }), false); b.style.marginRight = 4; b.style.marginBottom = 4; b.style.fontSize = 12;
                    voices.Add(b);
                }
                _sheetBody.Add(voices);
            }
        }

        private void RenderMemoriesTab()
        {
            _sheetBody.Clear();
            _sheetBody.Add(Lbl(L("మీ బొమ్మ గుర్తుపెట్టుకున్నవి", "What your Bomma remembers"), 12, false, Muted));
            App?.RefreshMemories(RenderMemories);
        }

        private void RenderMemories(MemoryDto[] memories)
        {
            if (_activeTab != "memories") return;
            _sheetBody.Clear();
            if (memories == null || memories.Length == 0) { _sheetBody.Add(Lbl(L("ఇంకా ఏమీ లేదు — మాట్లాడండి!", "Nothing yet — start talking!"), 14, false, Muted)); return; }
            foreach (var m in memories)
            {
                var mm = m;
                var row = Row(); row.style.justifyContent = Justify.SpaceBetween; row.style.alignItems = Align.Center; row.style.backgroundColor = Hex("#FFFAF0"); Border(row, Line, 1); Radius(row, 12); Pad(row, 8, 10, 8, 10); row.style.marginBottom = 6;
                var text = Lbl($"[{mm.category}] {mm.text}", 13, false, Ink, wrap: true); text.style.flexGrow = 1; text.style.flexShrink = 1;
                var del = Btn("×", () => App.DeleteMemory(mm.id, RenderMemories), false); del.style.width = 34; del.style.height = 34;
                row.Add(text); row.Add(del);
                _sheetBody.Add(row);
            }
        }

        private void RenderVaakiliTab()
        {
            _sheetBody.Clear();
            var info = Lbl("", 13, true, Ink, wrap: true); Chip(info, Hex("#FFF2C2")); _sheetBody.Add(info);
            _sheetBody.Add(Lbl(L("ఈరోజు పనులు", "Today's activities"), 12, true, Muted));
            var acts = Col(); _sheetBody.Add(acts);
            _sheetBody.Add(Lbl(L("వాకిలిని చూసుకోండి", "Care for your yard"), 12, true, Muted));
            var care = Row(); care.style.flexWrap = Wrap.Wrap; _sheetBody.Add(care);
            App?.RefreshVaakili(v =>
            {
                info.text = L($"అనుబంధం స్థాయి {v.vaakili.level} · {v.vaakili.points} పాయింట్లు · ⚡ {v.vaakili.energy} ఉత్సాహం · 🔥 {v.streak.count} రోజులు", $"Bond level {v.vaakili.level} · {v.vaakili.points} points · ⚡ {v.vaakili.energy} energy · 🔥 {v.streak.count}-day streak");
                care.Clear();
                foreach (var a in new[] { ("muggu", "ముగ్గు", "Draw a muggu", 1), ("tulasi", "తులసికి నీళ్ళు", "Water the tulasi", 1), ("tree", "మామిడి చెట్టు", "Grow the mango tree", 2), ("birds", "పిచ్చుకలకు గింజలు", "Feed the sparrows", 1), ("deepam", "దీపం", "Light a deepam", 1) })
                {
                    var act = a;
                    var b = Btn($"{L(act.Item2, act.Item3)} (−{act.Item4}⚡)", () => App.Care(act.Item1, r => { if (!r.ok) SetStatus(r.reason == "not_enough_energy" ? L("ఉత్సాహం సరిపోలేదు — ఒక పని పూర్తి చేయండి!", "Not enough energy — complete an activity!") : r.reason); RenderVaakiliTab(); }), false);
                    b.style.backgroundColor = Gold; b.style.color = Ink; b.style.marginRight = 6; b.style.marginBottom = 6; b.style.fontSize = 13;
                    care.Add(b);
                }
            });
            App?.RefreshActivities(r =>
            {
                acts.Clear();
                foreach (var a in r.activities)
                {
                    var act = a;
                    var row = Row(); row.style.justifyContent = Justify.SpaceBetween; row.style.alignItems = Align.Center; row.style.backgroundColor = Hex("#FFFAF0"); Border(row, Line, 1); Radius(row, 12); Pad(row, 8, 10, 8, 10); row.style.marginBottom = 6; row.style.opacity = act.done ? 0.55f : 1f;
                    var col = Col(); col.style.flexGrow = 1; col.style.flexShrink = 1;
                    col.Add(Lbl($"{act.title.Pick(Lang)} (+{act.energy}⚡)", 14, true, Ink, wrap: true));
                    col.Add(Lbl(act.prompt.Pick(Lang), 12, false, Muted, wrap: true));
                    row.Add(col);
                    if (!act.done) { var d = Btn(L("అయింది", "Done"), () => App.CompleteActivity(act.id, _ => RenderVaakiliTab()), true); d.style.backgroundColor = Teal; row.Add(d); }
                    acts.Add(row);
                }
            });
        }

        // ── element helpers ───────────────────────────────────────────────────
        private static Color Hex(string s) { ColorUtility.TryParseHtmlString(s, out var c); return c; }
        private static void Fill(VisualElement v) { v.style.position = Position.Absolute; v.style.left = 0; v.style.right = 0; v.style.top = 0; v.style.bottom = 0; }
        private static VisualElement Row() { var v = new VisualElement(); v.style.flexDirection = FlexDirection.Row; v.style.alignItems = Align.Center; return v; }
        private static VisualElement Col() { var v = new VisualElement(); v.style.flexDirection = FlexDirection.Column; return v; }
        private static void Radius(VisualElement v, float r) { v.style.borderTopLeftRadius = r; v.style.borderTopRightRadius = r; v.style.borderBottomLeftRadius = r; v.style.borderBottomRightRadius = r; }
        private static void RadiusTop(VisualElement v, float r) { v.style.borderTopLeftRadius = r; v.style.borderTopRightRadius = r; }
        private static void Pad(VisualElement v, float t, float r, float b, float l) { v.style.paddingTop = t; v.style.paddingRight = r; v.style.paddingBottom = b; v.style.paddingLeft = l; }
        private static void Border(VisualElement v, Color c, float w) { v.style.borderTopColor = c; v.style.borderRightColor = c; v.style.borderBottomColor = c; v.style.borderLeftColor = c; v.style.borderTopWidth = w; v.style.borderRightWidth = w; v.style.borderBottomWidth = w; v.style.borderLeftWidth = w; }
        private static void Chip(Label l, Color bg) { l.style.backgroundColor = bg; Radius(l, 12); Pad(l, 6, 12, 6, 12); }

        private static Label Lbl(string text, int size, bool bold, Color color, bool wrap = false)
        {
            var l = new Label(text) { pickingMode = PickingMode.Ignore };
            l.style.fontSize = size; l.style.color = color;
            if (bold) l.style.unityFontStyleAndWeight = FontStyle.Bold;
            if (wrap) l.style.whiteSpace = WhiteSpace.Normal;
            l.style.marginTop = 2; l.style.marginBottom = 2;
            return l;
        }

        private static Button Btn(string text, Action onClick, bool primary)
        {
            var b = new Button(onClick) { text = text };
            b.style.backgroundColor = primary ? Ink : Sand;
            b.style.color = primary ? Color.white : Ink;
            b.style.fontSize = 15; b.style.unityFontStyleAndWeight = FontStyle.Bold;
            b.style.height = 42; Radius(b, 12); Border(b, Color.clear, 0); Pad(b, 6, 14, 6, 14);
            b.style.marginLeft = 0; b.style.marginRight = 0; b.style.marginTop = 4; b.style.marginBottom = 4;
            return b;
        }

        private static VisualElement Segmented((string, string)[] options, string current, Action<string> onPick)
        {
            var row = Row(); row.style.flexWrap = Wrap.Wrap;
            var buttons = new List<Button>();
            foreach (var o in options)
            {
                var opt = o;
                Button b = null;
                b = Btn(opt.Item2, () =>
                {
                    onPick(opt.Item1);
                    foreach (var x in buttons) { x.style.backgroundColor = Sand; x.style.color = Ink; }
                    b.style.backgroundColor = Ink; b.style.color = Color.white;
                }, opt.Item1 == current);
                b.style.marginRight = 6; b.style.fontSize = 13;
                buttons.Add(b);
                row.Add(b);
            }
            return row;
        }
    }
}
