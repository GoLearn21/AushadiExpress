using System;
using UnityEngine;

namespace Nestam.Core
{
    /// <summary>
    /// Push-to-talk microphone capture. Records at 16 kHz mono (best for Saaras),
    /// trims leading/trailing silence and returns PCM16 WAV bytes.
    /// </summary>
    public class MicRecorder : MonoBehaviour
    {
        public bool IsRecording { get; private set; }
        public float Level { get; private set; } // 0..1 live RMS for the UI meter

        private AudioClip _clip;
        private string _device;
        private float _startTime;

        public bool HasMicrophone => Microphone.devices.Length > 0;

        public bool StartRecording()
        {
            if (IsRecording) return true;
            if (!HasMicrophone) { Debug.LogWarning("[Nestam] No microphone device"); return false; }
            _device = Microphone.devices[0];
            _clip = Microphone.Start(_device, false, NestamConfig.MicMaxSeconds, NestamConfig.MicSampleRate);
            _startTime = Time.realtimeSinceStartup;
            IsRecording = _clip != null;
            return IsRecording;
        }

        /// <summary>Stops and returns WAV bytes, or null if the utterance is too short/silent.</summary>
        public byte[] StopRecording()
        {
            if (!IsRecording) return null;
            int position = Microphone.GetPosition(_device);
            Microphone.End(_device);
            IsRecording = false;
            if (_clip == null || position <= 0) return null;
            var samples = new float[position];
            _clip.GetData(samples, 0);
            Destroy(_clip);
            _clip = null;
            samples = Trim(samples, NestamConfig.MicSampleRate);
            if (samples.Length < NestamConfig.MinUtteranceSeconds * NestamConfig.MicSampleRate) return null;
            return WavUtility.FromSamples(samples, NestamConfig.MicSampleRate);
        }

        private void Update()
        {
            if (!IsRecording || _clip == null) { Level = Mathf.Lerp(Level, 0f, Time.deltaTime * 8f); return; }
            int pos = Microphone.GetPosition(_device);
            int win = 1024;
            if (pos < win) return;
            var buf = new float[win];
            _clip.GetData(buf, pos - win);
            float sum = 0f;
            for (int i = 0; i < win; i++) sum += buf[i] * buf[i];
            Level = Mathf.Clamp01(Mathf.Sqrt(sum / win) * 6f);
            if (Time.realtimeSinceStartup - _startTime > NestamConfig.MicMaxSeconds - 0.5f) OnMaxLengthReached?.Invoke();
        }

        public event Action OnMaxLengthReached;

        private static float[] Trim(float[] s, int rate, float threshold = 0.012f, float padSec = 0.12f)
        {
            int start = 0, end = s.Length - 1;
            while (start < s.Length && Mathf.Abs(s[start]) < threshold) start++;
            while (end > start && Mathf.Abs(s[end]) < threshold) end--;
            int pad = Mathf.RoundToInt(padSec * rate);
            start = Mathf.Max(0, start - pad);
            end = Mathf.Min(s.Length - 1, end + pad);
            if (end <= start) return new float[0];
            var outp = new float[end - start + 1];
            Array.Copy(s, start, outp, 0, outp.Length);
            return outp;
        }
    }
}
