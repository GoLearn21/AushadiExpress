using System;
using UnityEngine;

namespace Nestam.Character
{
    /// <summary>
    /// Tap/poke detection on the Bomma's collider using the legacy Input API (touch is
    /// mirrored to mouse on mobile). Also feeds eye-tracking with the pointer position.
    /// </summary>
    public class BommaTouch : MonoBehaviour
    {
        /// <summary>Set by the UI layer so taps on UI Toolkit panels don't poke the Bomma.</summary>
        public static Func<Vector2, bool> IsPointerOverUI;

        public Camera Camera;
        public BommaController Controller;
        public float DragLookRadius = 300f;

        private float _lastPoke;

        private void Update()
        {
            if (Controller == null) return;
            var cam = Camera != null ? Camera : UnityEngine.Camera.main;
            if (cam == null) return;

            bool pressed = Input.GetMouseButton(0);
            Vector2 pos = Input.mousePosition;
            if (pressed && !(IsPointerOverUI != null && IsPointerOverUI(pos))) Controller.SetLookScreenPoint(pos);
            else Controller.SetLookScreenPoint(null);

            if (!Input.GetMouseButtonDown(0)) return;
            if (IsPointerOverUI != null && IsPointerOverUI(pos)) return;
            if (Time.unscaledTime - _lastPoke < 0.35f) return;
            var ray = cam.ScreenPointToRay(pos);
            if (Physics.Raycast(ray, out var hit, 50f) && hit.collider != null && hit.collider.transform.IsChildOf(Controller.transform))
            {
                _lastPoke = Time.unscaledTime;
                Controller.Poke();
            }
        }
    }
}
