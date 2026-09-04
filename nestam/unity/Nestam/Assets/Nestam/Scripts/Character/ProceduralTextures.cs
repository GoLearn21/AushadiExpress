using UnityEngine;
using Nestam.Core;

namespace Nestam.Character
{
    /// <summary>
    /// Generates the craft pattern textures that make each Bomma recognisably Andhra:
    /// Kondapalli painted bands, Etikoppaka lacquer rings, Kalamkari vines, Gangireddu cloth…
    /// UV: u = around the body, v = 0 bottom → 1 top.
    /// </summary>
    public static class ProceduralTextures
    {
        public static Texture2D Body(VisualDto v, int size = 512)
        {
            var tex = new Texture2D(size, size, TextureFormat.RGBA32, true) { name = "BommaPattern_" + v.pattern, wrapMode = TextureWrapMode.Repeat };
            var px = new Color[size * size];
            Color baseCol = ColorUtil.Hex(v.baseColor);
            Color[] pal = new Color[Mathf.Max(1, v.patternColors.Length)];
            for (int i = 0; i < pal.Length; i++) pal[i] = v.patternColors.Length > 0 ? ColorUtil.Hex(v.patternColors[i]) : baseCol;
            Color outline = ColorUtil.Hex(v.outlineColor);
            Color secondary = ColorUtil.Hex(v.secondaryColor);

            for (int y = 0; y < size; y++)
            {
                float vv = (float)y / size;
                for (int x = 0; x < size; x++)
                {
                    float uu = (float)x / size;
                    Color c = baseCol;
                    switch (v.pattern)
                    {
                        case "etikoppaka-rings":
                        {
                            // glossy lacquer rings, thicker toward the middle
                            float band = Mathf.Repeat(vv * 9f, 1f);
                            int idx = Mathf.FloorToInt(vv * 9f) % pal.Length;
                            if (vv > 0.08f && vv < 0.62f && band < 0.55f) c = pal[idx];
                            if (band > 0.55f && band < 0.62f && vv > 0.08f && vv < 0.62f) c = ColorUtil.Darken(pal[idx], 0.5f);
                            break;
                        }
                        case "kondapalli":
                        {
                            if (vv > 0.30f && vv < 0.40f) c = pal[0 % pal.Length];
                            else if (vv > 0.20f && vv < 0.26f) c = pal[1 % pal.Length];
                            else if (vv > 0.10f && vv < 0.13f) c = outline;
                            // row of painted dots (like the dots on Kondapalli figures)
                            float dotU = Mathf.Repeat(uu * 12f, 1f) - 0.5f, dotV = (vv - 0.165f) / 0.03f;
                            if (dotU * dotU + dotV * dotV < 0.16f) c = outline;
                            break;
                        }
                        case "kalamkari":
                        {
                            // creeping vine: sine stems with leaf blobs and flowers in pen-work colours
                            float stem = Mathf.Abs(Mathf.Sin(uu * Mathf.PI * 4f + vv * 6f) * 0.5f + 0.5f - vv * 1.4f + 0.2f);
                            if (vv < 0.62f && stem < 0.03f) c = outline;
                            float fu = Mathf.Repeat(uu * 4f, 1f) - 0.5f, fv = Mathf.Repeat(vv * 3f + 0.2f, 1f) - 0.5f;
                            float d = fu * fu * 3f + fv * fv * 6f;
                            if (vv < 0.62f && d < 0.05f) c = pal[Mathf.FloorToInt(uu * 4f) % pal.Length];
                            if (vv < 0.62f && d >= 0.05f && d < 0.062f) c = outline;
                            break;
                        }
                        case "mango":
                        {
                            // ripe blush on one side, green-yellow gradient near the stem
                            float blush = Mathf.Clamp01((Mathf.Cos((uu - 0.25f) * Mathf.PI * 2f) * 0.5f + 0.5f) * 1.2f - vv * 0.6f);
                            c = Color.Lerp(baseCol, secondary, blush * 0.8f);
                            if (vv > 0.9f) c = Color.Lerp(c, ColorUtil.Hex(v.accentColor), (vv - 0.9f) * 4f);
                            break;
                        }
                        case "chili":
                        {
                            float shine = Mathf.Pow(Mathf.Clamp01(Mathf.Cos((uu - 0.3f) * Mathf.PI * 2f)), 6f);
                            c = Color.Lerp(baseCol, secondary, Mathf.Clamp01(vv * 0.4f + (uu > 0.5f ? 0.2f : 0f)));
                            c = Color.Lerp(c, Color.white, shine * 0.25f);
                            break;
                        }
                        case "gangireddu-cloth":
                        {
                            // the embroidered cloth thrown over the bull: bands, zigzag and mirror dots
                            if (vv > 0.28f && vv < 0.58f)
                            {
                                int band = Mathf.FloorToInt((vv - 0.28f) / 0.06f);
                                c = pal[band % pal.Length];
                                float zig = Mathf.Abs(Mathf.Repeat(uu * 16f, 1f) - 0.5f) * 2f;
                                if (Mathf.Abs(((vv - 0.28f) / 0.06f) - Mathf.Floor((vv - 0.28f) / 0.06f) - zig * 0.5f - 0.25f) < 0.06f) c = Color.white;
                            }
                            float mu = Mathf.Repeat(uu * 10f, 1f) - 0.5f, mv = (vv - 0.62f) / 0.025f;
                            if (mu * mu * 2f + mv * mv < 0.12f) c = Color.white;
                            break;
                        }
                        default: break;
                    }
                    // subtle wood/lacquer grain
                    float grain = (Mathf.PerlinNoise(uu * 40f, vv * 6f) - 0.5f) * (1f - v.smoothness) * 0.08f;
                    c = new Color(Mathf.Clamp01(c.r + grain), Mathf.Clamp01(c.g + grain), Mathf.Clamp01(c.b + grain), 1f);
                    px[y * size + x] = c;
                }
            }
            tex.SetPixels(px);
            tex.Apply(true);
            return tex;
        }

        /// <summary>Solid colour with a faint gradient for eyes/accessories.</summary>
        public static Texture2D Solid(Color c, int size = 4)
        {
            var tex = new Texture2D(size, size, TextureFormat.RGBA32, false);
            var px = new Color[size * size];
            for (int i = 0; i < px.Length; i++) px[i] = c;
            tex.SetPixels(px); tex.Apply();
            return tex;
        }
    }
}
