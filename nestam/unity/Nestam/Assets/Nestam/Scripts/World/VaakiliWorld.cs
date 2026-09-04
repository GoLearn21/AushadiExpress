using System.Collections.Generic;
using UnityEngine;
using Nestam.Core;
using Nestam.Character;

namespace Nestam.World
{
    /// <summary>
    /// The Vaakili (వాకిలి): an Andhra front porch and courtyard built from primitives.
    /// Grows with the user's bond — more muggu rings, a taller tulasi, a fruiting mango tree,
    /// sparrows and deepam lamps — the way Tolan's barren planet becomes lush.
    /// </summary>
    public class VaakiliWorld : MonoBehaviour
    {
        private Material _template;
        private Renderer _mugguQuad;
        private Texture2D _mugguTex;
        private Transform _tulasi;
        private Transform _treeTrunk, _treeCanopy;
        private readonly List<Transform> _fruits = new List<Transform>();
        private readonly List<Transform> _birds = new List<Transform>();
        private readonly List<Transform> _lamps = new List<Transform>();
        private Material _fruitMat, _birdMat, _lampMat, _flameMat, _leafMat;
        private int _currentMuggu = -1;
        private float _t;

        public static VaakiliWorld Build(Transform parent)
        {
            var go = new GameObject("Vaakili");
            if (parent != null) go.transform.SetParent(parent, false);
            var w = go.AddComponent<VaakiliWorld>();
            w.Construct();
            return w;
        }

        private Material Mat(string hex, float smooth = 0.2f)
        {
            var m = new Material(_template);
            var c = ColorUtil.Hex(hex);
            if (m.HasProperty("_Color")) m.SetColor("_Color", c);
            if (m.HasProperty("_BaseColor")) m.SetColor("_BaseColor", c);
            if (m.HasProperty("_Glossiness")) m.SetFloat("_Glossiness", smooth);
            if (m.HasProperty("_Smoothness")) m.SetFloat("_Smoothness", smooth);
            return m;
        }

        private GameObject P(PrimitiveType t, string name, Vector3 pos, Vector3 scale, Material mat, Transform parent = null)
        {
            return BommaBuilder.Primitive(t, name, parent != null ? parent : transform, pos, scale, mat);
        }

        private void Construct()
        {
            _template = BommaBuilder.TemplateMaterial();
            // courtyard floor (cow-dung washed earth tone)
            P(PrimitiveType.Plane, "Courtyard", new Vector3(0f, 0f, 0.5f), new Vector3(1.6f, 1f, 1.2f), Mat("#B98A5D", 0.05f));
            // muggu quad
            var quad = GameObject.CreatePrimitive(PrimitiveType.Quad);
            quad.name = "Muggu";
            Destroy(quad.GetComponent<Collider>());
            quad.transform.SetParent(transform, false);
            quad.transform.localPosition = new Vector3(0f, 0.012f, -0.35f);
            quad.transform.localRotation = Quaternion.Euler(90f, 0f, 0f);
            quad.transform.localScale = new Vector3(2.6f, 2.6f, 1f);
            _mugguQuad = quad.GetComponent<Renderer>();
            _mugguQuad.sharedMaterial = MakeTransparent(Mat("#FFFFFF", 0.1f));
            // house: wall, door, pillars, roof beam
            P(PrimitiveType.Cube, "Wall", new Vector3(0f, 1.5f, 3.2f), new Vector3(9f, 3f, 0.3f), Mat("#F6E3C3", 0.1f));
            P(PrimitiveType.Cube, "Door", new Vector3(0f, 0.95f, 3.0f), new Vector3(1.1f, 1.9f, 0.1f), Mat("#6D3B1F", 0.3f));
            P(PrimitiveType.Cube, "DoorFrame", new Vector3(0f, 1.95f, 3.02f), new Vector3(1.4f, 0.12f, 0.12f), Mat("#C7623A", 0.3f));
            var pillar = Mat("#9C4A2B", 0.25f);
            P(PrimitiveType.Cylinder, "PillarL", new Vector3(-2.4f, 1.5f, 2.2f), new Vector3(0.28f, 1.5f, 0.28f), pillar);
            P(PrimitiveType.Cylinder, "PillarR", new Vector3(2.4f, 1.5f, 2.2f), new Vector3(0.28f, 1.5f, 0.28f), pillar);
            P(PrimitiveType.Cube, "RoofBeam", new Vector3(0f, 3.05f, 2.4f), new Vector3(9f, 0.3f, 1.8f), Mat("#C7623A", 0.2f));
            P(PrimitiveType.Cube, "Step", new Vector3(0f, 0.08f, 2.6f), new Vector3(3.2f, 0.16f, 0.8f), Mat("#A0522D", 0.1f));
            // mango-leaf toranam under the beam
            _leafMat = Mat("#4C9A2A", 0.3f);
            var leafDark = Mat("#3D7D22", 0.3f);
            for (int i = 0; i < 15; i++)
            {
                var leaf = P(PrimitiveType.Sphere, "Toranam", new Vector3(-3.5f + i * 0.5f, 2.78f, 2.1f), new Vector3(0.14f, 0.28f, 0.05f), i % 2 == 0 ? _leafMat : leafDark);
                leaf.transform.localRotation = Quaternion.Euler(0f, 0f, (i % 2 == 0 ? 8f : -8f));
            }
            // tulasi kota
            P(PrimitiveType.Cube, "TulasiKota", new Vector3(-1.9f, 0.3f, 0.4f), new Vector3(0.45f, 0.6f, 0.45f), Mat("#B6552F", 0.15f));
            P(PrimitiveType.Cube, "TulasiKotaTop", new Vector3(-1.9f, 0.62f, 0.4f), new Vector3(0.55f, 0.06f, 0.55f), Mat("#8D3A1E", 0.15f));
            _tulasi = P(PrimitiveType.Sphere, "Tulasi", new Vector3(-1.9f, 0.85f, 0.4f), new Vector3(0.25f, 0.3f, 0.25f), Mat("#2E7D32", 0.25f)).transform;
            // mango tree (hidden until the bond grows)
            _treeTrunk = P(PrimitiveType.Cylinder, "Trunk", new Vector3(2.5f, 0.6f, 1.2f), new Vector3(0.18f, 0.6f, 0.18f), Mat("#5D4037", 0.1f)).transform;
            _treeCanopy = P(PrimitiveType.Sphere, "Canopy", new Vector3(2.5f, 1.5f, 1.2f), new Vector3(1.2f, 1.0f, 1.2f), Mat("#3F8F3A", 0.2f)).transform;
            _fruitMat = Mat("#F9C846", 0.5f);
            _birdMat = Mat("#4E342E", 0.2f);
            _lampMat = Mat("#B5651D", 0.3f);
            _flameMat = Mat("#FFB300", 0.9f);
            if (_flameMat.HasProperty("_EmissionColor")) { _flameMat.EnableKeyword("_EMISSION"); _flameMat.SetColor("_EmissionColor", new Color(1f, 0.55f, 0.1f) * 1.5f); }
            Apply(new VaakiliDto());
        }

        /// <summary>Applies the server's vaakili state (levels 0..n per element).</summary>
        public void Apply(VaakiliDto v)
        {
            if (v == null) return;
            if (v.muggu != _currentMuggu)
            {
                _currentMuggu = v.muggu;
                if (_mugguTex != null) Destroy(_mugguTex);
                _mugguTex = MugguTexture.Generate(Mathf.Max(1, v.muggu));
                _mugguQuad.sharedMaterial.mainTexture = _mugguTex;
            }
            float tul = 0.18f + Mathf.Clamp(v.tulasi, 1, 6) * 0.06f;
            _tulasi.localScale = new Vector3(tul, tul * 1.25f, tul);
            _tulasi.localPosition = new Vector3(-1.9f, 0.65f + tul * 0.6f, 0.4f);
            bool hasTree = v.tree > 0;
            _treeTrunk.gameObject.SetActive(hasTree);
            _treeCanopy.gameObject.SetActive(hasTree);
            if (hasTree)
            {
                float h = 0.5f + v.tree * 0.18f;
                _treeTrunk.localScale = new Vector3(0.14f + v.tree * 0.015f, h, 0.14f + v.tree * 0.015f);
                _treeTrunk.localPosition = new Vector3(2.5f, h, 1.2f);
                float canopy = 0.8f + v.tree * 0.18f;
                _treeCanopy.localScale = new Vector3(canopy, canopy * 0.85f, canopy);
                _treeCanopy.localPosition = new Vector3(2.5f, h * 2f + canopy * 0.3f, 1.2f);
            }
            SyncCount(_fruits, hasTree ? v.tree : 0, i => P(PrimitiveType.Sphere, "Mango", Vector3.zero, new Vector3(0.09f, 0.13f, 0.09f), _fruitMat, _treeCanopy).transform);
            for (int i = 0; i < _fruits.Count; i++)
            {
                float a = i * 1.7f;
                _fruits[i].localPosition = new Vector3(Mathf.Cos(a) * 0.42f, -0.25f - (i % 3) * 0.12f, Mathf.Sin(a) * 0.42f);
                _fruits[i].localScale = new Vector3(0.09f, 0.13f, 0.09f);
            }
            SyncCount(_birds, v.birds, i => P(PrimitiveType.Sphere, "Sparrow", Vector3.zero, new Vector3(0.12f, 0.1f, 0.16f), _birdMat).transform);
            SyncCount(_lamps, v.deepam, i =>
            {
                var lamp = P(PrimitiveType.Cylinder, "Deepam", new Vector3(-1.5f + i * 0.6f, 0.2f, 2.35f), new Vector3(0.14f, 0.03f, 0.14f), _lampMat);
                var flame = P(PrimitiveType.Sphere, "Flame", new Vector3(0f, 1.6f, 0f), new Vector3(0.45f, 1.6f, 0.45f), _flameMat, lamp.transform);
                if (i < 2)
                {
                    var light = flame.AddComponent<Light>();
                    light.type = LightType.Point; light.color = new Color(1f, 0.7f, 0.3f); light.range = 2.5f; light.intensity = 1.2f;
                }
                return lamp.transform;
            });
        }

        private void SyncCount(List<Transform> list, int count, System.Func<int, Transform> make)
        {
            while (list.Count < count) list.Add(make(list.Count));
            while (list.Count > count) { var last = list[list.Count - 1]; list.RemoveAt(list.Count - 1); if (last != null) Destroy(last.gameObject); }
        }

        private void Update()
        {
            _t += Time.deltaTime;
            for (int i = 0; i < _birds.Count; i++)
            {
                float a = _t * 0.35f + i * 1.3f;
                _birds[i].localPosition = new Vector3(Mathf.Cos(a) * (1.8f + i * 0.2f), 2.2f + Mathf.Sin(_t * 2f + i) * 0.15f, 0.8f + Mathf.Sin(a) * 1.2f);
                _birds[i].localRotation = Quaternion.Euler(0f, -a * Mathf.Rad2Deg + 90f, 0f);
            }
            for (int i = 0; i < _lamps.Count; i++)
            {
                var flame = _lamps[i].GetChild(0);
                float f = 1f + Mathf.Sin(_t * 9f + i * 2f) * 0.12f;
                flame.localScale = new Vector3(0.45f * f, 1.6f / f, 0.45f * f);
            }
        }

        private static Material MakeTransparent(Material m)
        {
            // Built-in Standard shader "Fade" mode
            if (m.HasProperty("_Mode")) m.SetFloat("_Mode", 2f);
            m.SetInt("_SrcBlend", (int)UnityEngine.Rendering.BlendMode.SrcAlpha);
            m.SetInt("_DstBlend", (int)UnityEngine.Rendering.BlendMode.OneMinusSrcAlpha);
            m.SetInt("_ZWrite", 0);
            m.DisableKeyword("_ALPHATEST_ON");
            m.EnableKeyword("_ALPHABLEND_ON");
            m.DisableKeyword("_ALPHAPREMULTIPLY_ON");
            if (m.HasProperty("_Surface")) m.SetFloat("_Surface", 1f); // URP fallback
            m.renderQueue = 3000;
            return m;
        }
    }
}
