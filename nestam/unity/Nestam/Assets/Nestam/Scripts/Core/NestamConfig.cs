using UnityEngine;

namespace Nestam.Core
{
    /// <summary>
    /// Runtime configuration. Server URL can be overridden at runtime (Settings screen)
    /// and is persisted in PlayerPrefs so testers can point a build at a dev machine.
    /// </summary>
    public static class NestamConfig
    {
        public const string DefaultServerUrl = "http://localhost:4020";
        public const string PrefServerUrl = "nestam.serverUrl";
        public const string PrefUserId = "nestam.userId";
        public const string PrefCharacterId = "nestam.characterId";
        public const string PrefOnboarded = "nestam.onboarded";
        public const string PrefLanguage = "nestam.language";
        public const string PrefAddressStyle = "nestam.addressStyle";
        public const string PrefUserName = "nestam.userName";

        public const int MicSampleRate = 16000;   // Saaras works best at 16 kHz
        public const int MicMaxSeconds = 30;      // Sarvam REST STT limit is ~30 s
        public const float MinUtteranceSeconds = 0.35f;

        public static string ServerUrl
        {
            get => PlayerPrefs.GetString(PrefServerUrl, DefaultServerUrl).TrimEnd('/');
            set { PlayerPrefs.SetString(PrefServerUrl, value.Trim()); PlayerPrefs.Save(); }
        }

        public static string UserId
        {
            get => PlayerPrefs.GetString(PrefUserId, "");
            set { PlayerPrefs.SetString(PrefUserId, value); PlayerPrefs.Save(); }
        }

        public static string CharacterId
        {
            get => PlayerPrefs.GetString(PrefCharacterId, "bujji");
            set { PlayerPrefs.SetString(PrefCharacterId, value); PlayerPrefs.Save(); }
        }

        public static bool Onboarded
        {
            get => PlayerPrefs.GetInt(PrefOnboarded, 0) == 1;
            set { PlayerPrefs.SetInt(PrefOnboarded, value ? 1 : 0); PlayerPrefs.Save(); }
        }

        public static string Language
        {
            get => PlayerPrefs.GetString(PrefLanguage, "te");
            set { PlayerPrefs.SetString(PrefLanguage, value); PlayerPrefs.Save(); }
        }

        public static string AddressStyle
        {
            get => PlayerPrefs.GetString(PrefAddressStyle, "respectful");
            set { PlayerPrefs.SetString(PrefAddressStyle, value); PlayerPrefs.Save(); }
        }

        public static string UserName
        {
            get => PlayerPrefs.GetString(PrefUserName, "");
            set { PlayerPrefs.SetString(PrefUserName, value); PlayerPrefs.Save(); }
        }
    }
}
