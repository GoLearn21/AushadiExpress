using System.IO;
using UnityEditor;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.TextCore.Text;

namespace Nestam.EditorTools
{
    /// <summary>
    /// Nestam ▸ 2. Install Telugu Font — downloads Noto Sans Telugu (SIL Open Font License)
    /// into Resources and creates a TextCore FontAsset for UI Toolkit. Keeps binaries out of git.
    /// </summary>
    public static class NestamFontInstaller
    {
        private const string FontsDir = "Assets/Nestam/Resources/Nestam/Fonts";
        private const string TtfPath = FontsDir + "/NotoSansTelugu-Regular.ttf";
        private const string AssetPath = FontsDir + "/NotoSansTelugu.asset";
        private static readonly string[] Urls =
        {
            "https://raw.githubusercontent.com/notofonts/noto-fonts/main/hinted/ttf/NotoSansTelugu/NotoSansTelugu-Regular.ttf",
            "https://github.com/notofonts/noto-fonts/raw/main/unhinted/ttf/NotoSansTelugu/NotoSansTelugu-Regular.ttf",
            "https://github.com/google/fonts/raw/main/ofl/notosanstelugu/NotoSansTelugu%5Bwdth%2Cwght%5D.ttf",
        };

        [MenuItem("Nestam/2. Install Telugu Font (download Noto Sans Telugu)", priority = 2)]
        public static void Install()
        {
            Directory.CreateDirectory(FontsDir);
            if (!File.Exists(TtfPath))
            {
                bool ok = false;
                foreach (var url in Urls)
                {
                    EditorUtility.DisplayProgressBar("Nestam", "Downloading Noto Sans Telugu…", 0.3f);
                    using (var req = UnityWebRequest.Get(url))
                    {
                        var op = req.SendWebRequest();
                        while (!op.isDone) System.Threading.Thread.Sleep(50);
                        if (req.result == UnityWebRequest.Result.Success && req.downloadHandler.data.Length > 50000)
                        {
                            File.WriteAllBytes(TtfPath, req.downloadHandler.data);
                            ok = true;
                            break;
                        }
                        Debug.LogWarning("[Nestam] font download failed from " + url + ": " + req.error);
                    }
                }
                EditorUtility.ClearProgressBar();
                if (!ok)
                {
                    Debug.LogError("[Nestam] Could not download the font. Download NotoSansTelugu-Regular.ttf manually into " + FontsDir + " and run this menu again.");
                    return;
                }
                AssetDatabase.ImportAsset(TtfPath, ImportAssetOptions.ForceUpdate);
            }
            var font = AssetDatabase.LoadAssetAtPath<Font>(TtfPath);
            if (font == null) { Debug.LogError("[Nestam] Font import failed."); return; }
            if (AssetDatabase.LoadAssetAtPath<FontAsset>(AssetPath) == null)
            {
                var fa = FontAsset.CreateFontAsset(font);
                fa.name = "NotoSansTelugu";
                AssetDatabase.CreateAsset(fa, AssetPath);
                if (fa.material != null) { fa.material.name = "NotoSansTelugu Material"; AssetDatabase.AddObjectToAsset(fa.material, fa); }
                if (fa.atlasTexture != null) { fa.atlasTexture.name = "NotoSansTelugu Atlas"; AssetDatabase.AddObjectToAsset(fa.atlasTexture, fa); }
                AssetDatabase.SaveAssets();
            }
            AssetDatabase.Refresh();
            Debug.Log("[Nestam] Telugu font ready at " + AssetPath + " (loaded at runtime via Resources).");
        }
    }
}
