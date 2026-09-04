using System;
using System.Collections.Generic;
using UnityEngine;
using Nestam.Core;

namespace Nestam.Character
{
    public enum BommaState { Idle, Listening, Thinking, Speaking }

    /// <summary>
    /// Brings a procedurally built Bomma to life: breathing, blinking, eye tracking, emotions,
    /// gestures, squash-and-stretch pokes and envelope-driven lip-sync — the Tolan feel.
    /// </summary>
    public class BommaController : MonoBehaviour
    {
        private struct Pose
        {
            public float Brow, Lid, Smile, EyeScale, Blush;
            public Pose(float brow, float lid, float smile, float eyeScale, float blush) { Brow = brow; Lid = lid; Smile = smile; EyeScale = eyeScale; Blush = blush; }
            public static Pose Lerp(Pose a, Pose b, float t) => new Pose(Mathf.Lerp(a.Brow, b.Brow, t), Mathf.Lerp(a.Lid, b.Lid, t), Mathf.Lerp(a.Smile, b.Smile, t), Mathf.Lerp(a.EyeScale, b.EyeScale, t), Mathf.Lerp(a.Blush, b.Blush, t));
        }

        private static readonly Dictionary<string, Pose> Poses = new Dictionary<string, Pose>
        {
            { "neutral", new Pose(0f, 0f, 0.35f, 1f, 0.3f) },
            { "happy", new Pose(0.1f, 0.15f, 0.9f, 1.05f, 0.6f) },
            { "excited", new Pose(0.3f, -0.1f, 1f, 1.2f, 0.7f) },
            { "laughing", new Pose(0.2f, 0.55f, 1f, 1f, 0.8f) },
            { "curious", new Pose(0.35f, -0.05f, 0.3f, 1.15f, 0.3f) },
            { "thinking", new Pose(0.2f, 0.25f, 0.1f, 0.95f, 0.2f) },
            { "caring", new Pose(-0.15f, 0.2f, 0.45f, 1f, 0.5f) },
            { "sad", new Pose(-0.35f, 0.35f, -0.5f, 0.95f, 0.2f) },
            { "surprised", new Pose(0.5f, -0.2f, 0f, 1.3f, 0.4f) },
            { "sleepy", new Pose(-0.05f, 0.65f, 0.2f, 0.9f, 0.2f) },
            { "calm", new Pose(0f, 0.3f, 0.4f, 0.95f, 0.3f) },
            { "proud", new Pose(0.15f, 0.2f, 0.7f, 1f, 0.5f) },
            { "shy", new Pose(-0.1f, 0.3f, 0.5f, 0.9f, 0.95f) },
        };

        public BommaRig Rig { get; private set; }
        public VisualDto Visual { get; private set; }
        public BommaState State { get; private set; } = BommaState.Idle;
        public string Emotion { get; private set; } = "neutral";

        [Tooltip("Provides the lip-sync value while a reply plays.")] public AudioPlayback Playback;
        public BommaChirps Chirps;
        public Camera LookCamera;
        public float IdleChirpMinSeconds = 14f;
        public float IdleChirpMaxSeconds = 30f;

        public event Action Poked;

        private Pose _pose, _target;
        private float _t, _blink, _nextBlink, _nextChirp;
        private Vector2 _look, _lookTarget;
        private bool _hasPointerLook;
        private Vector2 _pointerLook;
        private float _mouth;
        private Spring _sx, _sy;
        private string _gesture;
        private float _gestureT;
        private float _lastSmile = -99f, _lastOpen = -99f;
        private Vector3 _basePos;
        private float _lean;

        public void Initialize(BommaRig rig, VisualDto visual)
        {
            Rig = rig;
            Visual = visual;
            _pose = _target = Poses["neutral"];
            _sx = new Spring(1f);
            _sy = new Spring(1f);
            _nextBlink = UnityEngine.Random.Range(2f, 5f);
            _nextChirp = UnityEngine.Random.Range(IdleChirpMinSeconds, IdleChirpMaxSeconds);
            _basePos = transform.localPosition;
        }

        // ── public API ────────────────────────────────────────────────────────
        public void SetEmotion(string emotion)
        {
            if (string.IsNullOrEmpty(emotion) || !Poses.ContainsKey(emotion)) emotion = "neutral";
            Emotion = emotion;
            _target = Poses[emotion];
        }

        public void PlayGesture(string gesture)
        {
            if (string.IsNullOrEmpty(gesture) || gesture == "none") return;
            _gesture = gesture;
            _gestureT = 0f;
            if (gesture == "bounce" || gesture == "dance") Kick(0.25f);
            if (gesture == "stretch") Kick(-0.12f);
        }

        public void SetState(BommaState state)
        {
            State = state;
            switch (state)
            {
                case BommaState.Listening: SetEmotion("curious"); _lean = 1f; Chirps?.Blip(); break;
                case BommaState.Thinking: SetEmotion("thinking"); _lean = 0f; Chirps?.Hum(); break;
                case BommaState.Speaking: _lean = 0f; break;
                default: _lean = 0f; break;
            }
        }

        /// <summary>Squash & stretch impulse (positive = bounce).</summary>
        public void Kick(float strength)
        {
            _sy.Kick(-strength * 6f);
            _sx.Kick(strength * 4f);
        }

        public void Poke()
        {
            Kick(0.35f);
            PlayGesture("wiggle");
            SetEmotion("laughing");
            Chirps?.PlayChirp();
            Poked?.Invoke();
        }

        /// <summary>Make the eyes follow a screen point (finger/mouse); pass null to release.</summary>
        public void SetLookScreenPoint(Vector2? screenPoint)
        {
            if (screenPoint == null || LookCamera == null) { _hasPointerLook = false; return; }
            var sp = screenPoint.Value;
            _pointerLook = new Vector2(Mathf.Clamp((sp.x / Screen.width) * 2f - 1f, -1f, 1f), Mathf.Clamp((sp.y / Screen.height) * 2f - 1f, -1f, 1f));
            _hasPointerLook = true;
        }

        // ── update loop ───────────────────────────────────────────────────────
        private void Update()
        {
            if (Rig == null) return;
            float dt = Mathf.Min(0.05f, Time.deltaTime);
            _t += dt;

            _pose = Pose.Lerp(_pose, _target, 1f - Mathf.Pow(0.001f, dt));

            // blinking
            _nextBlink -= dt;
            if (_nextBlink <= 0f) { _blink = 1f; _nextBlink = UnityEngine.Random.Range(2.5f, 6f); }
            _blink = Mathf.Max(0f, _blink - dt * 7f);

            // eye direction
            if (State == BommaState.Thinking) _lookTarget = new Vector2(Mathf.Sin(_t * 2.3f) * 0.5f, 0.55f);
            else if (_hasPointerLook) _lookTarget = _pointerLook;
            else _lookTarget = CameraLook() + new Vector2(Mathf.Sin(_t * 0.4f) * 0.12f, Mathf.Cos(_t * 0.3f) * 0.08f);
            _look = Vector2.Lerp(_look, _lookTarget, 1f - Mathf.Pow(0.002f, dt));

            // mouth
            float targetMouth = Playback != null && Playback.IsSpeaking ? Playback.Mouth : 0f;
            _mouth = Mathf.Lerp(_mouth, targetMouth, 1f - Mathf.Pow(0.0001f, dt));
            if (State == BommaState.Speaking && Playback != null && !Playback.IsSpeaking) State = BommaState.Idle;

            // springs + gesture timers
            _sx.Step(dt); _sy.Step(dt);
            if (_gesture != null) { _gestureT += dt; if (_gestureT > 1.4f) _gesture = null; }

            // idle chirps
            if (State == BommaState.Idle)
            {
                _nextChirp -= dt;
                if (_nextChirp <= 0f) { Chirps?.PlayChirp(0.5f); PlayGesture(UnityEngine.Random.value < 0.5f ? "wiggle" : "nod"); _nextChirp = UnityEngine.Random.Range(IdleChirpMinSeconds, IdleChirpMaxSeconds); }
            }

            ApplyPose();
            ApplyBody();
        }

        private Vector2 CameraLook()
        {
            if (LookCamera == null) return Vector2.zero;
            var local = transform.InverseTransformPoint(LookCamera.transform.position);
            return new Vector2(Mathf.Clamp(local.x / 2.5f, -0.6f, 0.6f), Mathf.Clamp(local.y / 2.5f, -0.5f, 0.5f));
        }

        private void ApplyPose()
        {
            float R = Rig.Radius, eye = Rig.EyeSize;
            float open = 1f - Mathf.Max(_blink, 0f);
            for (int i = 0; i < 2; i++)
            {
                float side = i == 0 ? -1f : 1f;
                var root = Rig.EyeRoots[i];
                root.localScale = new Vector3(_pose.EyeScale, _pose.EyeScale * Mathf.Max(0.06f, open), _pose.EyeScale);
                var lidBase = i == 0 ? Rig.LidBase0 : Rig.LidBase1;
                Rig.Lids[i].localPosition = lidBase + Vector3.down * Mathf.Clamp(_pose.Lid, 0f, 0.95f) * eye * 0.95f;
                Rig.Pupils[i].localPosition = new Vector3(_look.x * eye * 0.28f, _look.y * eye * 0.22f, -eye * 0.2f);
                var brow = Rig.Brows[i];
                brow.localPosition = new Vector3(0f, eye * (0.95f + _pose.Brow * 0.35f), -eye * 0.15f);
                brow.localRotation = Quaternion.Euler(0f, 0f, 90f + side * _pose.Brow * -18f);
                float blushScale = 0.55f + _pose.Blush * 0.7f;
                Rig.Cheeks[i].localScale = new Vector3(eye * 0.55f * blushScale, eye * 0.3f * blushScale, eye * 0.15f);
            }
            // mouth: interior opens with the envelope; smile ribbon follows emotion
            float openAmt = _mouth;
            Rig.MouthInner.localScale = new Vector3(Visual.mouthWidth * R * (1.1f - openAmt * 0.15f), 0.01f + openAmt * R * 0.24f, R * 0.18f);
            Rig.Tongue.gameObject.SetActive(openAmt > 0.25f);
            if (Mathf.Abs(_pose.Smile - _lastSmile) > 0.015f || Mathf.Abs(openAmt - _lastOpen) > 0.03f)
            {
                _lastSmile = _pose.Smile; _lastOpen = openAmt;
                MeshUtil.Ribbon(Rig.Smile.sharedMesh, Visual.mouthWidth * R * 1.6f * (1f - openAmt * 0.15f), _pose.Smile * R * 0.11f + openAmt * R * 0.06f, R * 0.035f);
            }
            Rig.Smile.transform.localPosition = Rig.MouthPos + new Vector3(0f, -openAmt * R * 0.05f, -0.012f);
        }

        private void ApplyBody()
        {
            float breathe = 1f + Mathf.Sin(_t * 1.6f) * 0.015f;
            Vector3 offset = Vector3.zero;
            float rot = Mathf.Sin(_t * 0.8f) * 0.6f;
            if (_gesture != null)
            {
                float t = _gestureT, e = Mathf.Exp(-t * 2.2f), R = Rig.Radius;
                switch (_gesture)
                {
                    case "nod": offset.y = Mathf.Sin(t * 12f) * R * 0.12f * e; break;
                    case "shake": offset.x = Mathf.Sin(t * 14f) * R * 0.16f * e; break;
                    case "wiggle": rot += Mathf.Sin(t * 16f) * 7f * e; break;
                    case "bounce": offset.y = Mathf.Abs(Mathf.Sin(t * 8f)) * R * 0.45f * e; break;
                    case "dance": offset.x = Mathf.Sin(t * 8f) * R * 0.2f * e; offset.y = Mathf.Abs(Mathf.Sin(t * 8f)) * R * 0.3f * e; rot += Mathf.Sin(t * 8f) * 6f * e; break;
                    case "lean_in": offset.z = -R * 0.18f * (1f - e); break;
                    case "look_away": rot += 5f * (1f - e); break;
                    case "stretch": offset.y = R * 0.12f * (1f - e); break;
                }
            }
            offset.z += -_lean * Rig.Radius * 0.12f;
            transform.localPosition = _basePos + offset;
            transform.localRotation = Quaternion.Euler(0f, 0f, rot);
            transform.localScale = new Vector3(_sx.Value * breathe, _sy.Value * (2f - breathe), _sx.Value * breathe);
        }

        private void OnDestroy()
        {
            BommaBuilder.Dispose(Rig);
            Rig = null;
        }
    }
}
