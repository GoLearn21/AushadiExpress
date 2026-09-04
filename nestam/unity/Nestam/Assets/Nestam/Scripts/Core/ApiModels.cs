using System;

namespace Nestam.Core
{
    // ── DTOs mirroring nestam/server JSON. All fields public + [Serializable] for JsonUtility. ──

    [Serializable] public class Localized { public string te; public string en; public string Pick(string lang) => lang == "en" ? en : te; }
    [Serializable] public class Vec3Dto { public float x = 1f; public float y = 1f; public float z = 1f; }
    [Serializable] public class EyesDto { public float size = 0.22f; public float spacing = 0.42f; public float height = 0.12f; public float pupilScale = 0.55f; }
    [Serializable] public class TraitsDto { public float warmth; public float energy; public float curiosity; public float calm; public float drama; }
    [Serializable] public class ChirpDto { public float baseHz = 500f; public string pattern = "bouncy"; }
    [Serializable] public class VoiceDto { public string speaker; public float pace = 1f; }

    [Serializable]
    public class VisualDto
    {
        public string bodyShape = "round";
        public Vec3Dto bodyScale = new Vec3Dto();
        public string baseColor = "#F2B632";
        public string secondaryColor = "#D7263D";
        public string accentColor = "#1B998B";
        public string outlineColor = "#2B1B12";
        public string eyeColor = "#2B1B12";
        public string scleraColor = "#FFFDF7";
        public string blushColor = "#F28C8C";
        public string pattern = "kondapalli";
        public string[] patternColors = new string[0];
        public float smoothness = 0.3f;
        public EyesDto eyes = new EyesDto();
        public string accessory = "none";
        public bool bottu;
        public bool glasses;
        public float mouthWidth = 0.35f;
    }

    [Serializable]
    public class CharacterDto
    {
        public string id;
        public string nameEn;
        public string nameTe;
        public Localized craft;
        public Localized origin;
        public Localized tagline;
        public Localized blurb;
        public TraitsDto traits;
        public string[] interests;
        public VoiceDto voice;
        public VisualDto visual;
        public ChirpDto chirp;
        public Localized[] pokeLines;
    }

    [Serializable] public class PaletteDto { public string id; public Localized name; public string baseColor; public string secondaryColor; public string accentColor; }
    [Serializable] public class OptionsDto { public PaletteDto[] palettes; public string[] accessories; public string[] eyeColors; public string[] speakersV3; public string[] speakersV2; }
    [Serializable] public class CharactersResponse { public CharacterDto[] characters; public OptionsDto options; }

    [Serializable] public class VaakiliDto { public int level = 1; public int points; public int energy; public int muggu = 1; public int tulasi = 1; public int tree; public int birds; public int deepam; }
    [Serializable] public class StreakDto { public int count; public string lastDate; }
    [Serializable] public class AppearanceDto { public string baseColor; public string secondaryColor; public string accentColor; public string eyeColor; public string blushColor; public string accessory; public string speaker; }

    [Serializable]
    public class UserDto
    {
        public string id;
        public string name;
        public string town;
        public string language = "te";
        public string addressStyle = "respectful";
        public string characterId;
        public int memoryCount;
        public VaakiliDto vaakili;
        public StreakDto streak;
        public int totalTurns;
    }

    [Serializable] public class BondDto { public int level; public int points; public int energy; public int streak; public int totalTurns; }
    [Serializable] public class SafetyDto { public bool crisis; public string helpline; }
    [Serializable] public class LatencyDto { public int stt; public int llm; public int tts; public int total; }

    [Serializable]
    public class ReplyDto
    {
        public string id;
        public string sessionId;
        public string transcript;
        public string transcriptLanguage;
        public string text;
        public string textRoman;
        public string emotion = "neutral";
        public string gesture = "none";
        public string audioBase64;
        public string audioMime;
        public int sampleRate;
        public int durationMs;
        public int envelopeHz = 50;
        public float[] envelope = new float[0];
        public string[] memoryUpdates = new string[0];
        public string activityCompleted;
        public BondDto bond;
        public SafetyDto safety;
        public LatencyDto latencyMs;
        public bool thrifty;
        public string provider;
    }

    [Serializable] public class SessionResponse { public string sessionId; public string userId; public CharacterDto character; public UserDto user; public ReplyDto greeting; }
    [Serializable] public class UserResponse { public UserDto user; public CharacterDto character; }

    [Serializable] public class MemoryDto { public string id; public string text; public string category; public string createdAt; public string source; }
    [Serializable] public class MemoriesResponse { public MemoryDto[] memories; }

    [Serializable] public class ActivityDto { public string id; public string kind; public Localized title; public Localized prompt; public int energy; public bool done; }
    [Serializable] public class ActivitiesResponse { public string date; public ActivityDto[] activities; public int energy; }
    [Serializable] public class CompleteActivityResponse { public ActivityDto activity; public VaakiliDto vaakili; }
    [Serializable] public class VaakiliResponse { public VaakiliDto vaakili; public StreakDto streak; }
    [Serializable] public class CareResponse { public bool ok; public string reason; public VaakiliDto vaakili; }

    [Serializable] public class QuizOptionDto { public string id; public Localized text; }
    [Serializable] public class QuizQuestionDto { public string id; public Localized text; public QuizOptionDto[] options; }
    [Serializable] public class QuizResponse { public QuizQuestionDto[] questions; }
    [Serializable] public class MatchScoreDto { public string characterId; public float score; }
    [Serializable] public class MatchResponse { public string characterId; public MatchScoreDto[] scores; public CharacterDto character; }

    [Serializable] public class UsageCallsDto { public int stt; public int tts; public int llm; public int translate; }
    [Serializable] public class UsageDayDto { public string date; public float inr; public float sttSeconds; public float ttsSeconds; public int llmInputTokens; public int llmOutputTokens; public UsageCallsDto calls; }
    [Serializable] public class UsageResponse { public string provider; public UsageDayDto today; public float allTimeInr; public float dailyCapInr; public bool thrifty; }

    [Serializable] public class StatusResponse { public bool ok; public string provider; public string istDate; public string timeOfDay; public bool thrifty; }
    [Serializable] public class ApiErrorBody { public ApiError error; }
    [Serializable] public class ApiError { public string code; public string message; }

    // ── request bodies ──
    [Serializable] public class SessionRequest { public string userId; public string characterId; public string name; public string language; public string addressStyle; public bool silent; }
    [Serializable] public class ChatRequest { public string sessionId; public string text; }
    [Serializable] public class PokeRequest { public string sessionId; }
    [Serializable] public class CareRequest { public string action; }
    [Serializable] public class PatchUserRequest { public string name; public string language; public string addressStyle; public string characterId; public AppearanceDto appearance; }

    /// <summary>JsonUtility cannot serialise dictionaries; quiz answers are sent as a hand-built JSON string.</summary>
    public static class QuizAnswers
    {
        public static string ToJson(System.Collections.Generic.IDictionary<string, string> answers)
        {
            var sb = new System.Text.StringBuilder("{\"answers\":{");
            bool first = true;
            foreach (var kv in answers)
            {
                if (!first) sb.Append(',');
                first = false;
                sb.Append('"').Append(kv.Key).Append("\":\"").Append(kv.Value).Append('"');
            }
            return sb.Append("}}").ToString();
        }
    }
}
