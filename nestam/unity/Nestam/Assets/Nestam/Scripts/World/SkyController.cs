using System;
using UnityEngine;

namespace Nestam.World
{
    /// <summary>Time-of-day lighting for the Vaakili using Indian Standard Time.</summary>
    public class SkyController : MonoBehaviour
    {
        public Camera Camera;
        public Light Sun;
        public float RefreshSeconds = 30f;
        private float _next;

        private void Start() => Refresh();

        private void Update()
        {
            _next -= Time.deltaTime;
            if (_next <= 0f) { Refresh(); _next = RefreshSeconds; }
        }

        public static float IstHour()
        {
            var ist = DateTime.UtcNow.AddMinutes(330);
            return ist.Hour + ist.Minute / 60f;
        }

        public void Refresh()
        {
            float h = IstHour();
            Color sky, ambient, sunCol; float sunI, sunAngle;
            if (h < 5f || h >= 19.5f) { sky = Hex("#2A2F55"); ambient = Hex("#55507A"); sunCol = Hex("#9AA5FF"); sunI = 0.35f; sunAngle = 25f; }
            else if (h < 8f) { sky = Hex("#FFC48A"); ambient = Hex("#C9A98A"); sunCol = Hex("#FFD9A3"); sunI = 0.9f; sunAngle = 18f; }
            else if (h < 16.5f) { sky = Hex("#8FD3FF"); ambient = Hex("#BFC9D6"); sunCol = Hex("#FFF6E0"); sunI = 1.15f; sunAngle = 55f; }
            else { sky = Hex("#FFB36B"); ambient = Hex("#C9A48A"); sunCol = Hex("#FFC48A"); sunI = 0.85f; sunAngle = 15f; }
            var cam = Camera != null ? Camera : UnityEngine.Camera.main;
            if (cam != null) { cam.clearFlags = CameraClearFlags.SolidColor; cam.backgroundColor = sky; }
            RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Flat;
            RenderSettings.ambientLight = ambient;
            RenderSettings.fog = true; RenderSettings.fogColor = sky; RenderSettings.fogMode = FogMode.Linear; RenderSettings.fogStartDistance = 8f; RenderSettings.fogEndDistance = 22f;
            if (Sun != null)
            {
                Sun.color = sunCol; Sun.intensity = sunI;
                Sun.transform.rotation = Quaternion.Euler(sunAngle, -35f, 0f);
                Sun.shadows = LightShadows.Soft;
            }
        }

        private static Color Hex(string s) { ColorUtility.TryParseHtmlString(s, out var c); return c; }
    }
}
