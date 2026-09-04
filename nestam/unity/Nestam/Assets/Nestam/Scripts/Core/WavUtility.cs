using System;
using System.IO;
using UnityEngine;

namespace Nestam.Core
{
    /// <summary>PCM16 WAV encode/decode for mic uploads and TTS playback (no external deps).</summary>
    public static class WavUtility
    {
        public static byte[] FromSamples(float[] samples, int sampleRate, int channels = 1)
        {
            using (var ms = new MemoryStream(44 + samples.Length * 2))
            using (var w = new BinaryWriter(ms))
            {
                int dataLen = samples.Length * 2;
                w.Write(System.Text.Encoding.ASCII.GetBytes("RIFF"));
                w.Write(36 + dataLen);
                w.Write(System.Text.Encoding.ASCII.GetBytes("WAVE"));
                w.Write(System.Text.Encoding.ASCII.GetBytes("fmt "));
                w.Write(16);
                w.Write((short)1);
                w.Write((short)channels);
                w.Write(sampleRate);
                w.Write(sampleRate * channels * 2);
                w.Write((short)(channels * 2));
                w.Write((short)16);
                w.Write(System.Text.Encoding.ASCII.GetBytes("data"));
                w.Write(dataLen);
                for (int i = 0; i < samples.Length; i++)
                {
                    float s = Mathf.Clamp(samples[i], -1f, 1f);
                    w.Write((short)(s < 0 ? s * 32768f : s * 32767f));
                }
                return ms.ToArray();
            }
        }

        public static AudioClip ToAudioClip(byte[] wav, string name = "tts")
        {
            if (wav == null || wav.Length < 44) return null;
            int channels = BitConverter.ToInt16(wav, 22);
            int sampleRate = BitConverter.ToInt32(wav, 24);
            int bits = BitConverter.ToInt16(wav, 34);
            // find the data chunk (fmt chunk may be longer than 16 bytes)
            int pos = 12;
            int dataStart = -1, dataLen = 0;
            while (pos + 8 <= wav.Length)
            {
                string id = System.Text.Encoding.ASCII.GetString(wav, pos, 4);
                int size = BitConverter.ToInt32(wav, pos + 4);
                if (id == "data") { dataStart = pos + 8; dataLen = Math.Min(size, wav.Length - dataStart); break; }
                pos += 8 + size + (size & 1);
            }
            if (dataStart < 0) return null;
            int bytesPer = bits / 8;
            int frames = dataLen / (bytesPer * channels);
            var samples = new float[frames];
            for (int i = 0; i < frames; i++)
            {
                float acc = 0f;
                for (int c = 0; c < channels; c++)
                {
                    int p = dataStart + (i * channels + c) * bytesPer;
                    if (bits == 16) acc += BitConverter.ToInt16(wav, p) / 32768f;
                    else if (bits == 8) acc += (wav[p] - 128) / 128f;
                    else if (bits == 32) acc += BitConverter.ToInt32(wav, p) / 2147483648f;
                }
                samples[i] = acc / channels;
            }
            var clip = AudioClip.Create(name, frames, 1, sampleRate, false);
            clip.SetData(samples, 0);
            return clip;
        }
    }
}
