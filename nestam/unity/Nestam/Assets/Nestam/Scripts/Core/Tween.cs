using UnityEngine;

namespace Nestam.Core
{
    /// <summary>Tiny easing + spring helpers (no DOTween dependency).</summary>
    public static class Ease
    {
        public static float OutBack(float t, float s = 1.70158f) { t -= 1f; return t * t * ((s + 1f) * t + s) + 1f; }
        public static float OutElastic(float t) { if (t <= 0f) return 0f; if (t >= 1f) return 1f; return Mathf.Pow(2f, -10f * t) * Mathf.Sin((t - 0.075f) * (2f * Mathf.PI) / 0.3f) + 1f; }
        public static float InOutSine(float t) => -(Mathf.Cos(Mathf.PI * t) - 1f) / 2f;
        /// <summary>Frame-rate independent exponential smoothing toward a target.</summary>
        public static float Damp(float current, float target, float sharpness, float dt) => Mathf.Lerp(current, target, 1f - Mathf.Exp(-sharpness * dt));
        public static Vector3 Damp(Vector3 current, Vector3 target, float sharpness, float dt) => Vector3.Lerp(current, target, 1f - Mathf.Exp(-sharpness * dt));
    }

    /// <summary>Damped spring on a scalar (used for squash & stretch and pokes).</summary>
    public class Spring
    {
        public float Value;
        public float Velocity;
        public float Stiffness = 90f;
        public float Damping = 9f;
        private readonly float _rest;
        public Spring(float rest) { _rest = rest; Value = rest; }
        public void Kick(float impulse) { Velocity += impulse; }
        public void Step(float dt)
        {
            float accel = -(Value - _rest) * Stiffness - Velocity * Damping;
            Velocity += accel * dt;
            Value += Velocity * dt;
        }
    }

    public static class ColorUtil
    {
        public static Color Hex(string hex, Color fallback)
        {
            if (!string.IsNullOrEmpty(hex) && ColorUtility.TryParseHtmlString(hex, out var c)) return c;
            return fallback;
        }
        public static Color Hex(string hex) => Hex(hex, Color.magenta);
        public static Color Lighten(Color c, float t) => Color.Lerp(c, Color.white, t);
        public static Color Darken(Color c, float t) => Color.Lerp(c, Color.black, t);
    }
}
