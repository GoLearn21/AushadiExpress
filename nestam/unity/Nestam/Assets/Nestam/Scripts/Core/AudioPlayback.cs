using System;
using UnityEngine;

namespace Nestam.Core
{
    /// <summary>
    /// Plays a reply's WAV and exposes the lip-sync value: the server-computed
    /// amplitude envelope sampled at the playhead (falls back to live RMS).
    /// </summary>
    [RequireComponent(typeof(AudioSource))]
    public class AudioPlayback : MonoBehaviour
    {
        public float Mouth { get; private set; }          // 0..1 smoothed
        public bool IsSpeaking => _source != null && _source.isPlaying;
        public event Action OnFinished;

        private AudioSource _source;
        private float[] _envelope = Array.Empty<float>();
        private int _envelopeHz = 50;
        private bool _wasPlaying;
        private readonly float[] _rms = new float[256];

        private void Awake()
        {
            _source = GetComponent<AudioSource>();
            _source.playOnAwake = false;
            _source.spatialBlend = 0f;
        }

        public void Play(ReplyDto reply)
        {
            if (reply == null || string.IsNullOrEmpty(reply.audioBase64)) return;
            byte[] wav;
            try { wav = Convert.FromBase64String(reply.audioBase64); }
            catch (Exception e) { Debug.LogWarning("[Nestam] bad audio payload: " + e.Message); return; }
            var clip = WavUtility.ToAudioClip(wav, reply.id ?? "reply");
            if (clip == null) return;
            Play(clip, reply.envelope, reply.envelopeHz);
        }

        public void Play(AudioClip clip, float[] envelope, int envelopeHz)
        {
            Stop();
            _envelope = envelope ?? Array.Empty<float>();
            _envelopeHz = envelopeHz > 0 ? envelopeHz : 50;
            _source.clip = clip;
            _source.Play();
            _wasPlaying = true;
        }

        public void Stop()
        {
            if (_source.isPlaying) _source.Stop();
            if (_source.clip != null) { Destroy(_source.clip); _source.clip = null; }
            _wasPlaying = false;
            Mouth = 0f;
        }

        private void Update()
        {
            float target = 0f;
            if (_source.isPlaying)
            {
                if (_envelope.Length > 0)
                {
                    int idx = Mathf.Clamp(Mathf.FloorToInt(_source.time * _envelopeHz), 0, _envelope.Length - 1);
                    target = _envelope[idx];
                }
                else
                {
                    _source.GetOutputData(_rms, 0);
                    float sum = 0f;
                    for (int i = 0; i < _rms.Length; i++) sum += _rms[i] * _rms[i];
                    target = Mathf.Clamp01(Mathf.Sqrt(sum / _rms.Length) * 4f);
                }
            }
            Mouth = Mathf.Lerp(Mouth, target, 1f - Mathf.Pow(0.0001f, Time.deltaTime));
            if (_wasPlaying && !_source.isPlaying)
            {
                _wasPlaying = false;
                OnFinished?.Invoke();
            }
        }
    }
}
