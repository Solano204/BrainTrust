---
name: analyze-ai
description: >
  Inspect the BrainTrust AI detection module. Shows provider status, recent analysis results,
  failure rates, and helps debug Gemini API issues.
---

# Skill: Analyze AI Detection

When the user runs `/analyze-ai`, ask:
1. What to inspect? (config / recent-results / failures / debug)

## Configuration check

Read relevant env/config and report:
- `AI_PROVIDER` — which provider is active? (`GoogleGeminiAIProvider` / `MockPythonAIDetectionProvider`)
- `TEXT_EXTRACTION_PROVIDER` — `MockTextExtractionProvider` in dev, real in prod
- `AI_MODEL_DEFAULT_TYPE` — `ENSEMBLE` / `GEMINI_FLASH` / etc.
- `AI_ANALYSIS_MIN_TEXT_LENGTH` — default 50 chars
- `GOOGLE_AI_API_KEY` — is it set? (print "SET" or "MISSING", never the value)

Key files:
```
aidetectition/src/main/java/com/braintrust/aidetectition/
  application/services/AnalysisApplicationService.java
  infraestructure/.../GoogleGeminiAIProvider.java
  infraestructure/.../MockTextExtractionProvider.java
```

## Recent analysis results

Check the log for recent AI analysis completions:
```bash
Select-String -Path ./logs/braintrust-api.log -Pattern "Analysis complete" | Select-Object -Last 20
```
Format: `id={} durationMs={} aiProbability={}% model={} likelyAi={}`

Report:
- Average duration (ms)
- Percentage flagged as likely AI
- Any failures

## Failure analysis
```bash
Select-String -Path ./logs/braintrust-api-error.log -Pattern "Analysis failed"
```

Common failure causes:
| Error | Cause | Fix |
|-------|-------|-----|
| `429 Too Many Requests` | Gemini rate limit hit | Back off, check `AI_RATE_LIMIT` config |
| `400 Bad Request` | Text too short or malformed | Check `AI_ANALYSIS_MIN_TEXT_LENGTH` |
| `ConnectException` | No network to Gemini | Check prod network egress rules |
| `NullPointerException` in extractor | PDF corrupt or empty | Check uploaded file |

## Debug mode

To test the AI pipeline with a specific text:
1. Set `AI_PROVIDER=MockPythonAIDetectionProvider` in dev
2. Submit a DIGITAL-format assignment with a PDF
3. Watch logs for `triggerAIAnalysisAsync` and `Analysis complete`

## Architecture reminder
```
SubmissionApplicationService
  -> SubmissionAIAnalysisHelper (@Async)
     -> AnalysisApplicationService
        -> GoogleGeminiAIProvider
           -> Gemini Flash API
```
All async via `@Async("virtualTaskExecutor")` — check VirtualThreadConfiguration if async stops working.
