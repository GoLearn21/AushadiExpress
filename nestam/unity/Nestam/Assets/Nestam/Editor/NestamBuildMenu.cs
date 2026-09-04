using System.IO;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEngine;

namespace Nestam.EditorTools
{
    /// <summary>Nestam ▸ 3. Build … — one-click Android APK / iOS Xcode project.</summary>
    public static class NestamBuildMenu
    {
        private const string ScenePath = "Assets/Nestam/Scenes/Main.unity";

        [MenuItem("Nestam/3. Build Android APK", priority = 10)]
        public static void BuildAndroid()
        {
            Directory.CreateDirectory("Builds/Android");
            PlayerSettings.SetScriptingBackend(NamedBuildTarget.Android, ScriptingImplementation.IL2CPP);
            PlayerSettings.Android.targetArchitectures = AndroidArchitecture.ARM64 | AndroidArchitecture.ARMv7;
            PlayerSettings.Android.minSdkVersion = AndroidSdkVersions.AndroidApiLevel24;
            Run(BuildTarget.Android, "Builds/Android/Nestam.apk");
        }

        [MenuItem("Nestam/3b. Build iOS Xcode Project", priority = 11)]
        public static void BuildIos()
        {
            Directory.CreateDirectory("Builds/iOS");
            PlayerSettings.iOS.targetOSVersionString = "15.0";
            Run(BuildTarget.iOS, "Builds/iOS");
        }

        [MenuItem("Nestam/3c. Build Desktop (for testing)", priority = 12)]
        public static void BuildDesktop()
        {
            Directory.CreateDirectory("Builds/Desktop");
#if UNITY_EDITOR_OSX
            Run(BuildTarget.StandaloneOSX, "Builds/Desktop/Nestam.app");
#elif UNITY_EDITOR_LINUX
            Run(BuildTarget.StandaloneLinux64, "Builds/Desktop/Nestam.x86_64");
#else
            Run(BuildTarget.StandaloneWindows64, "Builds/Desktop/Nestam.exe");
#endif
        }

        private static void Run(BuildTarget target, string output)
        {
            if (!File.Exists(ScenePath)) { Debug.LogError("[Nestam] Build the main scene first (Nestam ▸ 1)."); return; }
            var options = new BuildPlayerOptions { scenes = new[] { ScenePath }, locationPathName = output, target = target, options = BuildOptions.None };
            BuildReport report = BuildPipeline.BuildPlayer(options);
            if (report.summary.result == BuildResult.Succeeded) Debug.Log($"[Nestam] Build succeeded: {output} ({report.summary.totalSize / (1024 * 1024)} MB)");
            else Debug.LogError("[Nestam] Build failed: " + report.summary.result);
        }
    }
}
