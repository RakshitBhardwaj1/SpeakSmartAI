# SECURITY HARDENING DOC - PART 2
## XSS + PROMPT INJECTION PROTECTION

Project: SpeakSmartAI  
Goal: Prevent malicious input from breaking UI or manipulating AI output.

## 0. Why this matters

Current attack surfaces:
- user-generated content shown in UI (feedback, graph labels)
- untrusted speech-derived text sent into AI prompts

Required outcome:
- no raw script execution in frontend rendering
- AI prompt remains instruction-safe against user injection
- output is validated before acceptance

## 1. XSS protection applied

### Frontend rendering controls

Implemented in:
- `app/dashboard/interview/[interview]/feedback/page.jsx`

Defenses:
- dynamic text is rendered as plain text (no raw HTML rendering)
- dynamic feedback text is stripped of HTML tags before formatting
- dynamic graph labels are normalized to safe characters

Rule enforced:
- no `dangerouslySetInnerHTML` for user/AI-controlled content

### Backend output safety

Implemented in:
- `speech-analysis-api/app/services/prompt_security.py`
- `speech-analysis-api/app/services/llm_feedback.py`

Defenses:
- model output is escaped before returning to clients
- oversized output is truncated to safe max length

## 2. Prompt injection protection applied

Implemented in:
- `speech-analysis-api/app/services/prompt_security.py`
- `speech-analysis-api/app/services/llm_feedback.py`
- `app/dashboard/interview/[interview]/start_Interview/_components/SpeechRecognition.jsx`

Defenses:
- input length limit for prompt-bound user text
- blocked suspicious phrases (`ignore previous`, role prefixes)
- strict prompt framing with quoted user blocks
- explicit model instruction: do not follow user instructions
- structured output validation for AI JSON feedback in frontend

## 3. Validation tests added

Backend test file:
- `speech-analysis-api/tests/test_prompt_security.py`

Coverage:
- prompt injection pattern is rejected
- oversized prompt input is rejected
- display text is HTML-escaped

## 4. Success criteria

Protection is valid when:
- script tags are never executed from dynamic feedback content
- prompt-injection phrases are blocked before model call
- AI output is validated and rejected if malformed
- input size limits are consistently enforced

## 5. Implementation notes

- user input is treated as untrusted data at all layers
- AI output is not trusted by default
- frontend and backend both apply defensive checks
