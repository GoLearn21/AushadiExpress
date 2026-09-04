using System.IO;
using System.Reflection;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.UIElements;
using Nestam.App;
using Nestam.Character;
using Nestam.Core;
using Nestam.UI;
using Nestam.World;

namespace Nestam.EditorTools
{
    /// <summary>
    /// One-click scene setup: Nestam ▸ 1. Build Main Scene. Creates camera, light, the app
    /// object with every component wired, UI Toolkit document + PanelSettings, and the
    /// Resources material so the Standard shader ships in builds. No hand-edited YAML.
    /// </summary>
    public static class NestamSceneBuilder
    {
        private const string ScenePath = "Assets/Nestam/Scenes/Main.unity";
        private const string ResourcesDir = "Assets/Nestam/Resources/Nestam";

        [MenuItem("Nestam/1. Build Main Scene", priority = 1)]
        public static void BuildScene()
        {
            EnsureResources();
            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

            var camGo = new GameObject("Main Camera");
            camGo.tag = "MainCamera";
            var cam = camGo.AddComponent<Camera>();
            camGo.AddComponent<AudioListener>();
            cam.fieldOfView = 38f;
            cam.nearClipPlane = 0.05f;
            cam.transform.position = new Vector3(0f, 1.05f, -3.4f);
            cam.transform.LookAt(new Vector3(0f, 0.75f, 0f));
            cam.clearFlags = CameraClearFlags.SolidColor;
            cam.backgroundColor = new Color(0.56f, 0.83f, 1f);

            var lightGo = new GameObject("Sun");
            var sun = lightGo.AddComponent<Light>();
            sun.type = LightType.Directional;
            sun.intensity = 1.1f;
            sun.shadows = LightShadows.Soft;
            lightGo.transform.rotation = Quaternion.Euler(50f, -35f, 0f);

            var appGo = new GameObject("NestamApp");
            var app = appGo.AddComponent<NestamApp>();
            appGo.AddComponent<NestamApi>();
            var mic = appGo.AddComponent<MicRecorder>();
            var playback = appGo.AddComponent<AudioPlayback>();
            var chirpsGo = new GameObject("Chirps");
            chirpsGo.transform.SetParent(appGo.transform);
            var chirps = chirpsGo.AddComponent<BommaChirps>();
            var touch = appGo.AddComponent<BommaTouch>();
            var sky = appGo.AddComponent<SkyController>();
            sky.Camera = cam; sky.Sun = sun;

            var anchor = new GameObject("BommaAnchor");
            anchor.transform.position = new Vector3(0f, 0.62f, 0f);

            var uiGo = new GameObject("UI");
            var doc = uiGo.AddComponent<UIDocument>();
            doc.panelSettings = AssetDatabase.LoadAssetAtPath<PanelSettings>(ResourcesDir + "/NestamPanelSettings.asset");
            var ui = uiGo.AddComponent<NestamUI>();
            ui.App = app;

            app.Camera = cam; app.Sun = sun; app.BommaAnchor = anchor.transform;
            app.UI = ui; app.Mic = mic; app.Playback = playback; app.Chirps = chirps; app.Touch = touch;
            touch.Camera = cam;

            Directory.CreateDirectory(Path.GetDirectoryName(ScenePath));
            EditorSceneManager.SaveScene(scene, ScenePath);
            AddSceneToBuild();
            TryEnableAdvancedText();
            Debug.Log("[Nestam] Main scene built at " + ScenePath + ". Press Play (hold SPACE or the button to talk). Server URL defaults to " + NestamConfig.DefaultServerUrl);
        }

        [MenuItem("Nestam/Open Server Docs", priority = 40)]
        public static void OpenDocs() => Application.OpenURL("https://github.com/GoLearn21/AushadiExpress/tree/main/nestam");

        private static void EnsureResources()
        {
            Directory.CreateDirectory(ResourcesDir);
            Directory.CreateDirectory(ResourcesDir + "/Fonts");
            var matPath = ResourcesDir + "/BommaStandard.mat";
            if (AssetDatabase.LoadAssetAtPath<Material>(matPath) == null)
            {
                var shader = Shader.Find("Standard");
                var mat = new Material(shader) { name = "BommaStandard" };
                mat.SetFloat("_Glossiness", 0.3f);
                AssetDatabase.CreateAsset(mat, matPath);
            }
            var psPath = ResourcesDir + "/NestamPanelSettings.asset";
            if (AssetDatabase.LoadAssetAtPath<PanelSettings>(psPath) == null)
            {
                var ps = ScriptableObject.CreateInstance<PanelSettings>();
                ps.scaleMode = PanelScaleMode.ScaleWithScreenSize;
                ps.referenceResolution = new Vector2Int(1080, 1920);
                ps.screenMatchMode = PanelScreenMatchMode.MatchWidthOrHeight;
                ps.match = 0.5f;
                var theme = FindDefaultTheme();
                if (theme != null) ps.themeStyleSheet = theme;
                AssetDatabase.CreateAsset(ps, psPath);
            }
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
        }

        private static ThemeStyleSheet FindDefaultTheme()
        {
            foreach (var guid in AssetDatabase.FindAssets("t:ThemeStyleSheet"))
            {
                var path = AssetDatabase.GUIDToAssetPath(guid);
                if (path.Contains("DefaultRuntimeTheme") || path.Contains("UnityDefaultRuntimeTheme") || path.Contains("NestamTheme")) return AssetDatabase.LoadAssetAtPath<ThemeStyleSheet>(path);
            }
            // A runtime theme file is plain text importing Unity's default theme.
            const string themePath = "Assets/Nestam/Resources/Nestam/NestamTheme.tss";
            File.WriteAllText(themePath, "@import url(\"unity-theme://default\");\n");
            AssetDatabase.ImportAsset(themePath, ImportAssetOptions.ForceUpdate);
            return AssetDatabase.LoadAssetAtPath<ThemeStyleSheet>(themePath);
        }

        private static void AddSceneToBuild()
        {
            var scenes = new System.Collections.Generic.List<EditorBuildSettingsScene>(EditorBuildSettings.scenes);
            if (!scenes.Exists(s => s.path == ScenePath)) scenes.Insert(0, new EditorBuildSettingsScene(ScenePath, true));
            EditorBuildSettings.scenes = scenes.ToArray();
        }

        /// <summary>Turns on UI Toolkit's Advanced Text Generator (HarfBuzz) so Telugu conjuncts render correctly.</summary>
        private static void TryEnableAdvancedText()
        {
            foreach (var asm in System.AppDomain.CurrentDomain.GetAssemblies())
            {
                var t = asm.GetType("UnityEditor.UIElements.UIToolkitProjectSettings");
                if (t == null) continue;
                var prop = t.GetProperty("enableAdvancedText", BindingFlags.Static | BindingFlags.Public | BindingFlags.NonPublic);
                if (prop != null && prop.CanWrite)
                {
                    prop.SetValue(null, true);
                    Debug.Log("[Nestam] Advanced Text Generator enabled (Project Settings ▸ UI Toolkit).");
                    return;
                }
            }
            Debug.LogWarning("[Nestam] Could not toggle Advanced Text Generator automatically. Enable it manually: Edit ▸ Project Settings ▸ UI Toolkit ▸ Enable Advanced Text Generator (needed for Telugu script).");
        }
    }
}
