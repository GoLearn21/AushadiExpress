using System.Collections.Generic;
using UnityEngine;
using Nestam.Core;

namespace Nestam.Character
{
    /// <summary>References to the procedurally built parts of a Bomma, driven by BommaController.</summary>
    public class BommaRig
    {
        public Transform Root;
        public Transform Body;
        public Renderer BodyRenderer;
        public Transform[] EyeRoots = new Transform[2];
        public Transform[] Pupils = new Transform[2];
        public Transform[] Highlights = new Transform[2];
        public Transform[] Lids = new Transform[2];
        public Transform[] Brows = new Transform[2];
        public Transform[] Cheeks = new Transform[2];
        public Renderer[] CheekRenderers = new Renderer[2];
        public Transform MouthInner;
        public Transform Tongue;
        public MeshFilter Smile;
        public Transform Accessories;
        public SphereCollider Collider;
        public float Radius;
        public float EyeSize;
        public Vector3 EyeBasePos0, EyeBasePos1;
        public Vector3 LidBase0, LidBase1;
        public Vector3 MouthPos;
        public Vector3 BodyScale;
        public readonly List<Material> Materials = new List<Material>();
        public readonly List<Texture2D> Textures = new List<Texture2D>();
        public readonly List<Mesh> Meshes = new List<Mesh>();
    }

    /// <summary>
    /// Builds a Bomma entirely from primitives + procedural meshes/textures described by a VisualDto,
    /// so the same server roster drives Unity, the web console and future clients.
    /// </summary>
    public static class BommaBuilder
    {
        public const float BaseRadius = 0.5f;

        public static Material TemplateMaterial()
        {
            var res = Resources.Load<Material>("Nestam/BommaStandard");
            if (res != null) return res;
            var shader = Shader.Find("Standard") ?? Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Diffuse");
            return new Material(shader);
        }

        public static BommaController Build(VisualDto v, Transform parent = null)
        {
            var rig = new BommaRig();
            var root = new GameObject("Bomma");
            if (parent != null) root.transform.SetParent(parent, false);
            rig.Root = root.transform;
            rig.Radius = BaseRadius;
            rig.BodyScale = new Vector3(Mathf.Max(0.3f, v.bodyScale.x), Mathf.Max(0.3f, v.bodyScale.y), Mathf.Max(0.3f, v.bodyScale.z));
            var template = TemplateMaterial();

            // ── body ──
            var bodyGo = new GameObject("Body");
            bodyGo.transform.SetParent(root.transform, false);
            bodyGo.transform.localScale = rig.BodyScale;
            var mesh = MeshUtil.ShapedSphere(t => MeshUtil.ProfileFor(v.bodyShape)(t) * BaseRadius);
            rig.Meshes.Add(mesh);
            bodyGo.AddComponent<MeshFilter>().sharedMesh = mesh;
            var bodyMr = bodyGo.AddComponent<MeshRenderer>();
            var bodyTex = ProceduralTextures.Body(v);
            rig.Textures.Add(bodyTex);
            var bodyMat = MakeMaterial(template, Color.white, v.smoothness, rig);
            bodyMat.mainTexture = bodyTex;
            bodyMr.sharedMaterial = bodyMat;
            rig.Body = bodyGo.transform;
            rig.BodyRenderer = bodyMr;

            // collider for pokes (on the root so it follows squash & gestures)
            var col = root.AddComponent<SphereCollider>();
            col.radius = BaseRadius * Mathf.Max(rig.BodyScale.x, rig.BodyScale.y) * 1.05f;
            col.center = Vector3.zero;
            rig.Collider = col;

            // ── face geometry ──
            float R = BaseRadius;
            float eyeSize = v.eyes.size * R * 2.0f;
            rig.EyeSize = eyeSize;
            float ex = v.eyes.spacing * R * 1.35f * rig.BodyScale.x;
            float ey = v.eyes.height * R * 1.5f * rig.BodyScale.y + R * 0.05f;
            float ez = -R * 0.80f * rig.BodyScale.z;
            Color baseCol = ColorUtil.Hex(v.baseColor);
            Color outline = ColorUtil.Hex(v.outlineColor);
            var scleraMat = MakeMaterial(template, ColorUtil.Hex(v.scleraColor), 0.6f, rig);
            var pupilMat = MakeMaterial(template, ColorUtil.Hex(v.eyeColor), 0.8f, rig);
            var whiteMat = MakeMaterial(template, Color.white, 0.9f, rig);
            var lidMat = MakeMaterial(template, ColorUtil.Darken(baseCol, 0.05f), v.smoothness, rig);
            var browMat = MakeMaterial(template, outline, 0.2f, rig);
            var blushMat = MakeMaterial(template, ColorUtil.Hex(v.blushColor), 0.3f, rig);
            var mouthMat = MakeMaterial(template, ColorUtil.Hex("#4A1C1C"), 0.2f, rig);
            var tongueMat = MakeMaterial(template, ColorUtil.Hex("#E57373"), 0.5f, rig);

            for (int i = 0; i < 2; i++)
            {
                float side = i == 0 ? -1f : 1f;
                var eyeRoot = new GameObject(i == 0 ? "EyeL" : "EyeR").transform;
                eyeRoot.SetParent(root.transform, false);
                var basePos = new Vector3(side * ex, ey, ez);
                eyeRoot.localPosition = basePos;
                if (i == 0) rig.EyeBasePos0 = basePos; else rig.EyeBasePos1 = basePos;
                rig.EyeRoots[i] = eyeRoot;

                var sclera = Primitive(PrimitiveType.Sphere, "Sclera", eyeRoot, Vector3.zero, new Vector3(eyeSize, eyeSize, eyeSize * 0.55f), scleraMat);
                sclera.name = "Sclera";
                var pupil = Primitive(PrimitiveType.Sphere, "Pupil", eyeRoot, new Vector3(0f, 0f, -eyeSize * 0.2f), Vector3.one * eyeSize * v.eyes.pupilScale, pupilMat);
                rig.Pupils[i] = pupil.transform;
                var hl = Primitive(PrimitiveType.Sphere, "Highlight", pupil.transform, new Vector3(-0.28f, 0.3f, -0.42f), Vector3.one * 0.32f, whiteMat);
                rig.Highlights[i] = hl.transform;
                var lidPos = new Vector3(0f, eyeSize * 1.05f, 0.02f);
                var lid = Primitive(PrimitiveType.Sphere, "Lid", eyeRoot, lidPos, new Vector3(eyeSize * 1.12f, eyeSize * 1.0f, eyeSize * 0.62f), lidMat);
                rig.Lids[i] = lid.transform;
                if (i == 0) rig.LidBase0 = lidPos; else rig.LidBase1 = lidPos;
                var brow = Primitive(PrimitiveType.Capsule, "Brow", eyeRoot, new Vector3(0f, eyeSize * 0.95f, -eyeSize * 0.15f), new Vector3(eyeSize * 0.09f, eyeSize * 0.42f, eyeSize * 0.09f), browMat);
                brow.transform.localRotation = Quaternion.Euler(0f, 0f, 90f);
                rig.Brows[i] = brow.transform;

                var cheek = Primitive(PrimitiveType.Sphere, "Cheek", root.transform, new Vector3(side * ex * 1.25f, ey - eyeSize * 0.95f, ez * 1.02f), new Vector3(eyeSize * 0.55f, eyeSize * 0.3f, eyeSize * 0.15f), blushMat);
                rig.Cheeks[i] = cheek.transform;
                rig.CheekRenderers[i] = cheek.GetComponent<Renderer>();
            }

            // glasses (Chitti)
            if (v.glasses)
            {
                var torus = MeshUtil.Torus(eyeSize * 0.62f, eyeSize * 0.05f);
                rig.Meshes.Add(torus);
                for (int i = 0; i < 2; i++)
                {
                    var rim = new GameObject("GlassRim");
                    rim.transform.SetParent(rig.EyeRoots[i], false);
                    rim.transform.localPosition = new Vector3(0f, 0f, -eyeSize * 0.32f);
                    rim.transform.localRotation = Quaternion.Euler(90f, 0f, 0f);
                    rim.AddComponent<MeshFilter>().sharedMesh = torus;
                    rim.AddComponent<MeshRenderer>().sharedMaterial = browMat;
                }
                var bridge = Primitive(PrimitiveType.Cylinder, "GlassBridge", root.transform, new Vector3(0f, ey, ez - eyeSize * 0.3f), new Vector3(eyeSize * 0.06f, ex - eyeSize * 0.6f, eyeSize * 0.06f), browMat);
                bridge.transform.localRotation = Quaternion.Euler(0f, 0f, 90f);
            }

            // bottu
            if (v.bottu)
            {
                var bottuMat = MakeMaterial(template, ColorUtil.Hex("#C2185B"), 0.4f, rig);
                Primitive(PrimitiveType.Sphere, "Bottu", root.transform, new Vector3(0f, ey + eyeSize * 1.45f, ez * 0.97f - 0.01f), new Vector3(R * 0.11f, R * 0.11f, R * 0.05f), bottuMat);
            }

            // ── mouth ──
            float my = ey - eyeSize * 1.35f;
            rig.MouthPos = new Vector3(0f, my, ez * 1.05f);
            var inner = Primitive(PrimitiveType.Sphere, "MouthInner", root.transform, rig.MouthPos, new Vector3(v.mouthWidth * R * 1.1f, 0.01f, R * 0.18f), mouthMat);
            rig.MouthInner = inner.transform;
            var tongue = Primitive(PrimitiveType.Sphere, "Tongue", inner.transform, new Vector3(0f, -0.35f, -0.2f), new Vector3(0.5f, 0.35f, 0.5f), tongueMat);
            rig.Tongue = tongue.transform;
            var smileGo = new GameObject("Smile");
            smileGo.transform.SetParent(root.transform, false);
            smileGo.transform.localPosition = rig.MouthPos + new Vector3(0f, 0f, -0.012f);
            var smileMesh = new Mesh { name = "Smile" };
            rig.Meshes.Add(smileMesh);
            MeshUtil.Ribbon(smileMesh, v.mouthWidth * R * 1.6f, 0.02f, R * 0.035f);
            rig.Smile = smileGo.AddComponent<MeshFilter>();
            rig.Smile.sharedMesh = smileMesh;
            smileGo.AddComponent<MeshRenderer>().sharedMaterial = browMat;

            // ── accessory ──
            var acc = new GameObject("Accessories").transform;
            acc.SetParent(root.transform, false);
            rig.Accessories = acc;
            float top = R * rig.BodyScale.y * (v.bodyShape == "egg" ? 1.06f : 1f);
            BuildAccessory(v, rig, acc, top, template);

            var controller = root.AddComponent<BommaController>();
            controller.Initialize(rig, v);
            return controller;
        }

        private static void BuildAccessory(VisualDto v, BommaRig rig, Transform acc, float top, Material template)
        {
            float R = BaseRadius;
            Color accent = ColorUtil.Hex(v.accentColor);
            Color secondary = ColorUtil.Hex(v.secondaryColor);
            Color outline = ColorUtil.Hex(v.outlineColor);
            switch (v.accessory)
            {
                case "jasmine":
                {
                    var white = MakeMaterial(template, Color.white, 0.5f, rig);
                    var green = MakeMaterial(template, ColorUtil.Hex("#3E8914"), 0.3f, rig);
                    for (int i = -4; i <= 4; i++)
                    {
                        float a = i * 0.28f;
                        var pos = new Vector3(Mathf.Sin(a) * R * 0.9f * rig.BodyScale.x, top - Mathf.Abs(i) * R * 0.045f, -Mathf.Cos(a) * R * 0.45f * rig.BodyScale.z);
                        Primitive(PrimitiveType.Sphere, "Malle", acc, pos, Vector3.one * R * 0.16f, white);
                        if (i % 2 == 0) Primitive(PrimitiveType.Sphere, "Leaf", acc, pos + new Vector3(0f, R * 0.07f, 0.02f), new Vector3(R * 0.08f, R * 0.04f, R * 0.12f), green);
                    }
                    break;
                }
                case "topi":
                {
                    var capMat = MakeMaterial(template, accent, 0.85f, rig);
                    var bandMat = MakeMaterial(template, secondary, 0.85f, rig);
                    var cap = Primitive(PrimitiveType.Cylinder, "Topi", acc, new Vector3(0f, top + R * 0.18f, 0f), new Vector3(R * 0.95f, R * 0.22f, R * 0.95f), capMat);
                    cap.transform.localRotation = Quaternion.Euler(0f, 0f, 4f);
                    var band = Primitive(PrimitiveType.Cylinder, "TopiBand", acc, new Vector3(0f, top + R * 0.02f, 0f), new Vector3(R * 1.05f, R * 0.06f, R * 1.05f), bandMat);
                    band.transform.localRotation = Quaternion.Euler(0f, 0f, 4f);
                    Primitive(PrimitiveType.Sphere, "TopiKnob", acc, new Vector3(0f, top + R * 0.45f, 0f), Vector3.one * R * 0.14f, bandMat);
                    break;
                }
                case "turban":
                {
                    var tMat = MakeMaterial(template, accent, 0.4f, rig);
                    var kMat = MakeMaterial(template, secondary, 0.4f, rig);
                    Primitive(PrimitiveType.Sphere, "Turban", acc, new Vector3(0f, top + R * 0.02f, 0f), new Vector3(R * 1.35f, R * 0.6f, R * 1.15f), tMat);
                    Primitive(PrimitiveType.Sphere, "TurbanKnot", acc, new Vector3(R * 0.35f, top + R * 0.42f, -R * 0.1f), new Vector3(R * 0.35f, R * 0.5f, R * 0.35f), kMat);
                    var torus = MeshUtil.Torus(R * 0.62f, R * 0.06f);
                    rig.Meshes.Add(torus);
                    var ring = new GameObject("TurbanBand");
                    ring.transform.SetParent(acc, false);
                    ring.transform.localPosition = new Vector3(0f, top + R * 0.08f, 0f);
                    ring.AddComponent<MeshFilter>().sharedMesh = torus;
                    ring.AddComponent<MeshRenderer>().sharedMaterial = kMat;
                    break;
                }
                case "leaf":
                {
                    var stemMat = MakeMaterial(template, ColorUtil.Hex("#5D4037"), 0.2f, rig);
                    var leafMat = MakeMaterial(template, accent, 0.35f, rig);
                    var stem = Primitive(PrimitiveType.Cylinder, "Stem", acc, new Vector3(0f, top + R * 0.16f, 0f), new Vector3(R * 0.08f, R * 0.18f, R * 0.08f), stemMat);
                    stem.transform.localRotation = Quaternion.Euler(0f, 0f, -12f);
                    var leaf = Primitive(PrimitiveType.Sphere, "Leaf", acc, new Vector3(R * 0.42f, top + R * 0.28f, 0f), new Vector3(R * 0.85f, R * 0.09f, R * 0.32f), leafMat);
                    leaf.transform.localRotation = Quaternion.Euler(0f, 0f, 22f);
                    break;
                }
                case "stem":
                {
                    var calyx = MakeMaterial(template, accent, 0.5f, rig);
                    Primitive(PrimitiveType.Sphere, "Calyx", acc, new Vector3(0f, top, 0f), new Vector3(R * 0.95f * rig.BodyScale.x, R * 0.25f, R * 0.95f * rig.BodyScale.z), calyx);
                    var stem = Primitive(PrimitiveType.Cylinder, "ChilliStem", acc, new Vector3(R * 0.12f, top + R * 0.35f, 0f), new Vector3(R * 0.12f, R * 0.35f, R * 0.12f), calyx);
                    stem.transform.localRotation = Quaternion.Euler(0f, 0f, -25f);
                    break;
                }
                case "horns":
                {
                    var hornMat = MakeMaterial(template, accent, 0.7f, rig);
                    var clothMat = MakeMaterial(template, secondary, 0.3f, rig);
                    var bellMat = MakeMaterial(template, ColorUtil.Hex("#FFD54F"), 0.95f, rig);
                    var cone = MeshUtil.Cone(R * 0.13f, R * 0.75f);
                    rig.Meshes.Add(cone);
                    for (int i = 0; i < 2; i++)
                    {
                        float side = i == 0 ? -1f : 1f;
                        var horn = new GameObject("Horn");
                        horn.transform.SetParent(acc, false);
                        horn.transform.localPosition = new Vector3(side * R * 0.55f * rig.BodyScale.x, top - R * 0.05f, 0f);
                        horn.transform.localRotation = Quaternion.Euler(0f, 0f, side * -28f);
                        horn.AddComponent<MeshFilter>().sharedMesh = cone;
                        horn.AddComponent<MeshRenderer>().sharedMaterial = hornMat;
                        Primitive(PrimitiveType.Sphere, "HornTip", acc, horn.transform.localPosition + new Vector3(side * R * 0.35f, R * 0.68f, 0f), Vector3.one * R * 0.1f, bellMat);
                    }
                    Primitive(PrimitiveType.Sphere, "HeadCloth", acc, new Vector3(0f, top + R * 0.02f, 0f), new Vector3(R * 1.0f * rig.BodyScale.x, R * 0.22f, R * 0.9f * rig.BodyScale.z), clothMat);
                    for (int i = -2; i <= 2; i++) Primitive(PrimitiveType.Sphere, "Bell", acc, new Vector3(i * R * 0.22f, top + R * 0.02f, -R * 0.55f * rig.BodyScale.z), Vector3.one * R * 0.08f, bellMat);
                    break;
                }
                default:
                    break;
            }
            if (v.accessory != "none")
            {
                // tiny outline-coloured "seam" ring where the accessory meets the body
                var seamMat = MakeMaterial(template, outline, 0.2f, rig);
                Primitive(PrimitiveType.Cylinder, "Seam", acc, new Vector3(0f, top - R * 0.03f, 0f), new Vector3(R * 0.3f, R * 0.01f, R * 0.3f), seamMat);
            }
        }

        public static GameObject Primitive(PrimitiveType type, string name, Transform parent, Vector3 localPos, Vector3 localScale, Material mat)
        {
            var go = GameObject.CreatePrimitive(type);
            go.name = name;
            var c = go.GetComponent<Collider>();
            if (c != null) Object.Destroy(c);
            go.transform.SetParent(parent, false);
            go.transform.localPosition = localPos;
            go.transform.localScale = localScale;
            go.GetComponent<Renderer>().sharedMaterial = mat;
            return go;
        }

        public static Material MakeMaterial(Material template, Color color, float smoothness, BommaRig rig)
        {
            var m = new Material(template);
            if (m.HasProperty("_Color")) m.SetColor("_Color", color);
            if (m.HasProperty("_BaseColor")) m.SetColor("_BaseColor", color);
            if (m.HasProperty("_Glossiness")) m.SetFloat("_Glossiness", smoothness);
            if (m.HasProperty("_Smoothness")) m.SetFloat("_Smoothness", smoothness);
            if (m.HasProperty("_Metallic")) m.SetFloat("_Metallic", 0f);
            rig.Materials.Add(m);
            return m;
        }

        /// <summary>Frees the runtime-created meshes/materials/textures when a Bomma is rebuilt.</summary>
        public static void Dispose(BommaRig rig)
        {
            if (rig == null) return;
            foreach (var m in rig.Materials) if (m != null) Object.Destroy(m);
            foreach (var t in rig.Textures) if (t != null) Object.Destroy(t);
            foreach (var mesh in rig.Meshes) if (mesh != null) Object.Destroy(mesh);
            if (rig.Root != null) Object.Destroy(rig.Root.gameObject);
        }
    }
}
