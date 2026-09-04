using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

namespace Nestam.Core
{
    /// <summary>
    /// Coroutine-based HTTP client for the Nestam server (see nestam/server/src/routes/api.ts).
    /// Every call takes an onOk and onError callback so screens can react without async/await.
    /// </summary>
    public class NestamApi : MonoBehaviour
    {
        public static NestamApi Instance { get; private set; }
        public int TimeoutSeconds = 60;

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        private string Url(string path) => NestamConfig.ServerUrl + path;

        // ── endpoints ─────────────────────────────────────────────────────────
        public IEnumerator GetStatus(Action<StatusResponse> ok, Action<string> err) => Send("GET", "/api/status", null, ok, err);
        public IEnumerator GetCharacters(Action<CharactersResponse> ok, Action<string> err) => Send("GET", "/api/characters", null, ok, err);
        public IEnumerator GetQuiz(Action<QuizResponse> ok, Action<string> err) => Send("GET", "/api/onboarding/quiz", null, ok, err);
        public IEnumerator Match(IDictionary<string, string> answers, Action<MatchResponse> ok, Action<string> err) => Send("POST", "/api/onboarding/match", QuizAnswers.ToJson(answers), ok, err);
        public IEnumerator CreateSession(SessionRequest req, Action<SessionResponse> ok, Action<string> err) => Send("POST", "/api/session", JsonUtility.ToJson(req), ok, err);
        public IEnumerator Chat(string sessionId, string text, Action<ReplyDto> ok, Action<string> err) => Send("POST", "/api/chat", JsonUtility.ToJson(new ChatRequest { sessionId = sessionId, text = text }), ok, err);
        public IEnumerator Poke(string sessionId, Action<ReplyDto> ok, Action<string> err) => Send("POST", "/api/poke", JsonUtility.ToJson(new PokeRequest { sessionId = sessionId }), ok, err);
        public IEnumerator GetUser(string userId, Action<UserResponse> ok, Action<string> err) => Send("GET", "/api/users/" + userId, null, ok, err);
        public IEnumerator PatchUser(string userId, PatchUserRequest req, Action<UserResponse> ok, Action<string> err) => Send("PATCH", "/api/users/" + userId, JsonUtility.ToJson(req), ok, err);
        public IEnumerator GetMemories(string userId, Action<MemoriesResponse> ok, Action<string> err) => Send("GET", "/api/users/" + userId + "/memories", null, ok, err);
        public IEnumerator DeleteMemory(string userId, string memoryId, Action<MemoriesResponse> ok, Action<string> err) => Send("DELETE", "/api/users/" + userId + "/memories/" + memoryId, null, ok, err);
        public IEnumerator GetActivities(string userId, Action<ActivitiesResponse> ok, Action<string> err) => Send("GET", "/api/users/" + userId + "/activities", null, ok, err);
        public IEnumerator CompleteActivity(string userId, string activityId, Action<CompleteActivityResponse> ok, Action<string> err) => Send("POST", "/api/users/" + userId + "/activities/" + activityId + "/complete", "{}", ok, err);
        public IEnumerator GetVaakili(string userId, Action<VaakiliResponse> ok, Action<string> err) => Send("GET", "/api/users/" + userId + "/vaakili", null, ok, err);
        public IEnumerator Care(string userId, string action, Action<CareResponse> ok, Action<string> err) => Send("POST", "/api/users/" + userId + "/vaakili/care", JsonUtility.ToJson(new CareRequest { action = action }), ok, err, acceptConflict: true);
        public IEnumerator GetUsage(Action<UsageResponse> ok, Action<string> err) => Send("GET", "/api/usage", null, ok, err);

        /// <summary>Uploads a 16 kHz PCM16 WAV utterance; the server runs STT → LLM → TTS.</summary>
        public IEnumerator Voice(string sessionId, byte[] wav, Action<ReplyDto> ok, Action<string> err)
        {
            var form = new List<IMultipartFormSection>
            {
                new MultipartFormDataSection("sessionId", sessionId),
                new MultipartFormFileSection("audio", wav, "utterance.wav", "audio/wav"),
            };
            using (var req = UnityWebRequest.Post(Url("/api/voice"), form))
            {
                req.timeout = TimeoutSeconds;
                yield return req.SendWebRequest();
                Handle(req, ok, err, false);
            }
        }

        // ── plumbing ──────────────────────────────────────────────────────────
        private IEnumerator Send<T>(string method, string path, string json, Action<T> ok, Action<string> err, bool acceptConflict = false)
        {
            using (var req = new UnityWebRequest(Url(path), method))
            {
                if (json != null)
                {
                    req.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(json));
                    req.SetRequestHeader("Content-Type", "application/json");
                }
                req.downloadHandler = new DownloadHandlerBuffer();
                req.timeout = TimeoutSeconds;
                yield return req.SendWebRequest();
                Handle(req, ok, err, acceptConflict);
            }
        }

        private static void Handle<T>(UnityWebRequest req, Action<T> ok, Action<string> err, bool acceptConflict)
        {
            string body = req.downloadHandler != null ? req.downloadHandler.text : "";
            bool httpOk = req.result == UnityWebRequest.Result.Success || (acceptConflict && req.responseCode == 409);
            if (!httpOk)
            {
                string message = req.error;
                try
                {
                    var parsed = JsonUtility.FromJson<ApiErrorBody>(body);
                    if (parsed != null && parsed.error != null && !string.IsNullOrEmpty(parsed.error.message)) message = parsed.error.message;
                }
                catch { /* keep transport error */ }
                Debug.LogWarning("[Nestam] " + req.method + " " + req.url + " failed: " + message);
                err?.Invoke(message);
                return;
            }
            try
            {
                ok?.Invoke(JsonUtility.FromJson<T>(body));
            }
            catch (Exception e)
            {
                Debug.LogError("[Nestam] JSON parse failed for " + req.url + ": " + e.Message);
                err?.Invoke("Bad response from server");
            }
        }
    }
}
