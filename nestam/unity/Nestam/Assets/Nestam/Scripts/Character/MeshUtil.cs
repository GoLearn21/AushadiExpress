using System;
using System.Collections.Generic;
using UnityEngine;

namespace Nestam.Character
{
    /// <summary>Procedural mesh generators for the Bommalu (no imported models needed).</summary>
    public static class MeshUtil
    {
        /// <summary>
        /// UV sphere whose radius is modulated per latitude by <paramref name="radiusAt"/>(t) where
        /// t = 0 at the bottom and 1 at the top. Used for round/egg/pear/oblong toy bodies.
        /// </summary>
        public static Mesh ShapedSphere(Func<float, float> radiusAt, int segments = 40, int rings = 28)
        {
            var verts = new List<Vector3>();
            var norms = new List<Vector3>();
            var uvs = new List<Vector2>();
            var tris = new List<int>();
            for (int r = 0; r <= rings; r++)
            {
                float v = (float)r / rings;               // 0 bottom .. 1 top
                float lat = Mathf.PI * (v - 0.5f);        // -90 .. +90 deg
                float rad = radiusAt(v);
                float y = Mathf.Sin(lat) * rad;
                float ringR = Mathf.Cos(lat) * rad;
                for (int s = 0; s <= segments; s++)
                {
                    float u = (float)s / segments;
                    float lon = u * Mathf.PI * 2f;
                    var p = new Vector3(Mathf.Cos(lon) * ringR, y, Mathf.Sin(lon) * ringR);
                    verts.Add(p);
                    norms.Add(p.sqrMagnitude > 1e-6f ? p.normalized : Vector3.up);
                    uvs.Add(new Vector2(u, v));
                }
            }
            int stride = segments + 1;
            for (int r = 0; r < rings; r++)
            {
                for (int s = 0; s < segments; s++)
                {
                    int a = r * stride + s;
                    int b = a + stride;
                    tris.Add(a); tris.Add(b); tris.Add(a + 1);
                    tris.Add(a + 1); tris.Add(b); tris.Add(b + 1);
                }
            }
            var mesh = new Mesh { name = "BommaBody" };
            mesh.SetVertices(verts);
            mesh.SetNormals(norms);
            mesh.SetUVs(0, uvs);
            mesh.SetTriangles(tris, 0);
            mesh.RecalculateNormals();
            mesh.RecalculateBounds();
            return mesh;
        }

        /// <summary>Radius profile for each body shape (t: 0 bottom → 1 top).</summary>
        public static Func<float, float> ProfileFor(string shape)
        {
            switch (shape)
            {
                case "egg": return t => 1f - 0.10f * (t - 0.5f) * 2f;                       // narrower top
                case "pear": return t => 1f + 0.18f * (0.5f - t) * 2f;                      // wider bottom
                case "tall": return t => 1f + 0.05f * Mathf.Sin(t * Mathf.PI);              // chilli: slight belly
                case "oblong": return t => 1f + 0.08f * (0.5f - t) * 2f;                    // mango: heavier bottom
                case "flat": return t => 1f;                                                 // puppet: scaled in z by builder
                case "broad": return t => 1f + 0.06f * Mathf.Sin(t * Mathf.PI);             // bull: barrel
                default: return t => 1f;                                                     // round
            }
        }

        /// <summary>Torus (used for glasses rims, turban band, bells).</summary>
        public static Mesh Torus(float radius, float tube, int segments = 32, int sides = 12)
        {
            var verts = new List<Vector3>();
            var norms = new List<Vector3>();
            var uvs = new List<Vector2>();
            var tris = new List<int>();
            for (int i = 0; i <= segments; i++)
            {
                float u = (float)i / segments * Mathf.PI * 2f;
                var center = new Vector3(Mathf.Cos(u) * radius, 0f, Mathf.Sin(u) * radius);
                var tangentOut = new Vector3(Mathf.Cos(u), 0f, Mathf.Sin(u));
                for (int j = 0; j <= sides; j++)
                {
                    float v = (float)j / sides * Mathf.PI * 2f;
                    var n = tangentOut * Mathf.Cos(v) + Vector3.up * Mathf.Sin(v);
                    verts.Add(center + n * tube);
                    norms.Add(n);
                    uvs.Add(new Vector2((float)i / segments, (float)j / sides));
                }
            }
            int stride = sides + 1;
            for (int i = 0; i < segments; i++)
                for (int j = 0; j < sides; j++)
                {
                    int a = i * stride + j, b = a + stride;
                    tris.Add(a); tris.Add(a + 1); tris.Add(b);
                    tris.Add(a + 1); tris.Add(b + 1); tris.Add(b);
                }
            var mesh = new Mesh { name = "Torus" };
            mesh.SetVertices(verts); mesh.SetNormals(norms); mesh.SetUVs(0, uvs); mesh.SetTriangles(tris, 0);
            mesh.RecalculateBounds();
            return mesh;
        }

        /// <summary>
        /// Flat ribbon along a quadratic curve in the XY plane: the smile line. Regenerated
        /// when the smile value changes (cheap: 2*(segments+1) verts).
        /// </summary>
        public static void Ribbon(Mesh mesh, float width, float curve, float thickness, int segments = 24)
        {
            var verts = new Vector3[(segments + 1) * 2];
            var uvs = new Vector2[verts.Length];
            var tris = new int[segments * 6];
            for (int i = 0; i <= segments; i++)
            {
                float t = (float)i / segments;
                float x = (t - 0.5f) * width;
                float y = -curve * (1f - Mathf.Pow((t - 0.5f) * 2f, 2f));   // parabola: smile (curve>0) or frown
                float taper = thickness * (0.55f + 0.45f * Mathf.Sin(t * Mathf.PI));
                verts[i * 2] = new Vector3(x, y - taper * 0.5f, 0f);
                verts[i * 2 + 1] = new Vector3(x, y + taper * 0.5f, 0f);
                uvs[i * 2] = new Vector2(t, 0f);
                uvs[i * 2 + 1] = new Vector2(t, 1f);
                if (i < segments)
                {
                    int a = i * 2;
                    tris[i * 6] = a; tris[i * 6 + 1] = a + 1; tris[i * 6 + 2] = a + 2;
                    tris[i * 6 + 3] = a + 1; tris[i * 6 + 4] = a + 3; tris[i * 6 + 5] = a + 2;
                }
            }
            mesh.Clear();
            mesh.vertices = verts;
            mesh.uv = uvs;
            mesh.triangles = tris;
            var normals = new Vector3[verts.Length];
            for (int i = 0; i < normals.Length; i++) normals[i] = Vector3.back;
            mesh.normals = normals;
            mesh.RecalculateBounds();
        }

        /// <summary>Simple cone (horns, chilli stem tip).</summary>
        public static Mesh Cone(float radius, float height, int segments = 20)
        {
            var verts = new List<Vector3> { new Vector3(0f, height, 0f) };
            var tris = new List<int>();
            for (int i = 0; i <= segments; i++)
            {
                float a = (float)i / segments * Mathf.PI * 2f;
                verts.Add(new Vector3(Mathf.Cos(a) * radius, 0f, Mathf.Sin(a) * radius));
            }
            int baseCenter = verts.Count;
            verts.Add(Vector3.zero);
            for (int i = 1; i <= segments; i++)
            {
                tris.Add(0); tris.Add(i + 1); tris.Add(i);
                tris.Add(baseCenter); tris.Add(i); tris.Add(i + 1);
            }
            var mesh = new Mesh { name = "Cone" };
            mesh.SetVertices(verts); mesh.SetTriangles(tris, 0);
            mesh.RecalculateNormals(); mesh.RecalculateBounds();
            return mesh;
        }
    }
}
