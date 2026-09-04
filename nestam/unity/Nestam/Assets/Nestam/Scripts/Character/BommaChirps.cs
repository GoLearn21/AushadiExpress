using System.Collections.Generic;
using UnityEngine;

namespace Nestam.Character
{
    /// <summary>
    /// Procedural "bomma-speak": short synthesised chirps (Tolan's cute non-verbal sounds),
    /// tuned per character by base pitch and rhythm pattern. Zero audio assets required.
    /// </summary>
    [RequireComponent(typeof(AudioSource))]
    public class BommaChirps : MonoBehaviour
    {
        public float BaseHz = 520f;
        public string Pattern = "bouncy";
        public float Volume = 0.35f;

        private AudioSource _source;
        private readonly Dictionary<string, AudioClip> _cache = new Dictionary<string, AudioClip>();
        private const int Rate = 22050;

        private void Awake()
        {
            _source = GetComponent<AudioSource>();
            _source.playOnAwake = false;
            _source.spatialBlend = 0f;
        }

        public void Configure(float baseHz, string pattern) { BaseHz = baseHz; Pattern = pattern ?? "bouncy"; }

        public void PlayChirp(float volumeScale = 1f)
        {
            float[] notes; float dur;
            switch (Pattern)
            {
                case "quick": notes = new[] { 1f, 1.25f, 1.5f }; dur = 0.08f; break;
                case "slow": notes = new[] { 1f, 0.9f }; dur = 0.22f; break;
                case "dramatic": notes = new[] { 1f, 1.5f, 1.2f, 1.8f }; dur = 0.12f; break;
                case "deep": notes = new[] { 1f, 0.8f }; dur = 0.24f; break;
                default: notes = new[] { 1f, 1.3f, 1.1f }; dur = 0.12f; break;
            }
            Play("chirp", notes, dur, volumeScale);
        }

        /// <summary>Short rising blip when the Bomma starts listening.</summary>
        public void Blip() => Play("blip", new[] { 1.2f, 1.6f }, 0.07f, 0.8f);

        /// <summary>Soft two-tone hum while thinking.</summary>
        public void Hum() => Play("hum", new[] { 0.7f, 0.75f, 0.7f }, 0.18f, 0.5f);

        private void Play(string kind, float[] notes, float noteDur, float volumeScale)
        {
            string key = kind + "|" + Pattern + "|" + Mathf.RoundToInt(BaseHz);
            if (!_cache.TryGetValue(key, out var clip))
            {
                clip = Synthesize(key, notes, noteDur);
                _cache[key] = clip;
            }
            _source.PlayOneShot(clip, Volume * volumeScale);
        }

        private AudioClip Synthesize(string name, float[] notes, float noteDur)
        {
            int perNote = Mathf.RoundToInt(noteDur * Rate);
            var data = new float[perNote * notes.Length + Rate / 20];
            float phase = 0f;
            for (int n = 0; n < notes.Length; n++)
            {
                float f0 = BaseHz * notes[n];
                for (int i = 0; i < perNote; i++)
                {
                    float t = (float)i / perNote;
                    float f = f0 * (1f + 0.15f * t);                                  // upward glide
                    phase += 2f * Mathf.PI * f / Rate;
                    float env = Mathf.Sin(t * Mathf.PI);                              // smooth attack/release
                    float v = Mathf.Sin(phase) * 0.7f + Mathf.Sin(phase * 2f) * 0.2f + Mathf.Sin(phase * 3f) * 0.1f;
                    data[n * perNote + i] = v * env;
                }
            }
            var clip = AudioClip.Create(name, data.Length, 1, Rate, false);
            clip.SetData(data, 0);
            return clip;
        }
    }
}
