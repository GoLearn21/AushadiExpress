using UnityEngine;

namespace Nestam.World
{
    /// <summary>
    /// Generates a chukkala muggu (dot-grid rangoli) texture. More rings = more elaborate,
    /// mirroring how the Vaakili grows as the friendship deepens (Tolan's planet, Andhra-style).
    /// </summary>
    public static class MugguTexture
    {
        public static Texture2D Generate(int rings, int size = 512)
        {
            rings = Mathf.Clamp(rings, 1, 12);
            var tex = new Texture2D(size, size, TextureFormat.RGBA32, true) { name = "Muggu" + rings, wrapMode = TextureWrapMode.Clamp };
            var px = new Color[size * size];
            for (int i = 0; i < px.Length; i++) px[i] = new Color(1f, 1f, 1f, 0f);
            float c = size * 0.5f;
            float step = size * 0.5f / 13f;
            var white = new Color(1f, 1f, 1f, 0.95f);
            var chalk = new Color(1f, 0.98f, 0.92f, 0.85f);
            for (int r = 1; r <= rings; r++)
            {
                float radius = r * step;
                int n = r * 6;
                Vector2 prev = Vector2.zero;
                for (int k = 0; k <= n; k++)
                {
                    float a = (float)k / n * Mathf.PI * 2f;
                    float wob = 1f + ((k % 2 == 0) ? 0.14f : -0.05f);
                    var p = new Vector2(c + Mathf.Cos(a) * radius * wob, c + Mathf.Sin(a) * radius * wob);
                    if (k > 0) Line(px, size, prev, p, 2.2f, chalk);
                    prev = p;
                    if (k < n) Dot(px, size, new Vector2(c + Mathf.Cos(a) * radius, c + Mathf.Sin(a) * radius), 3.5f, white);
                }
            }
            // centre lotus dot + petals (every muggu starts from the centre)
            Dot(px, size, new Vector2(c, c), 6f, white);
            for (int k = 0; k < 8; k++)
            {
                float a = k / 8f * Mathf.PI * 2f;
                Line(px, size, new Vector2(c, c), new Vector2(c + Mathf.Cos(a) * step * 0.8f, c + Mathf.Sin(a) * step * 0.8f), 2f, chalk);
            }
            tex.SetPixels(px);
            tex.Apply(true);
            return tex;
        }

        private static void Dot(Color[] px, int size, Vector2 p, float rad, Color col)
        {
            int x0 = Mathf.Max(0, (int)(p.x - rad - 1)), x1 = Mathf.Min(size - 1, (int)(p.x + rad + 1));
            int y0 = Mathf.Max(0, (int)(p.y - rad - 1)), y1 = Mathf.Min(size - 1, (int)(p.y + rad + 1));
            for (int y = y0; y <= y1; y++)
                for (int x = x0; x <= x1; x++)
                {
                    float d = Vector2.Distance(new Vector2(x, y), p);
                    if (d <= rad) px[y * size + x] = Blend(px[y * size + x], col, Mathf.Clamp01(rad - d + 0.5f));
                }
        }

        private static void Line(Color[] px, int size, Vector2 a, Vector2 b, float thick, Color col)
        {
            int x0 = Mathf.Max(0, (int)(Mathf.Min(a.x, b.x) - thick - 1)), x1 = Mathf.Min(size - 1, (int)(Mathf.Max(a.x, b.x) + thick + 1));
            int y0 = Mathf.Max(0, (int)(Mathf.Min(a.y, b.y) - thick - 1)), y1 = Mathf.Min(size - 1, (int)(Mathf.Max(a.y, b.y) + thick + 1));
            var ab = b - a;
            float len2 = Mathf.Max(1e-4f, ab.sqrMagnitude);
            for (int y = y0; y <= y1; y++)
                for (int x = x0; x <= x1; x++)
                {
                    var p = new Vector2(x, y);
                    float t = Mathf.Clamp01(Vector2.Dot(p - a, ab) / len2);
                    float d = Vector2.Distance(p, a + ab * t);
                    if (d <= thick) px[y * size + x] = Blend(px[y * size + x], col, Mathf.Clamp01(thick - d + 0.5f));
                }
        }

        private static Color Blend(Color dst, Color src, float a)
        {
            a *= src.a;
            return new Color(Mathf.Lerp(dst.r, src.r, a), Mathf.Lerp(dst.g, src.g, a), Mathf.Lerp(dst.b, src.b, a), Mathf.Max(dst.a, a));
        }
    }
}
