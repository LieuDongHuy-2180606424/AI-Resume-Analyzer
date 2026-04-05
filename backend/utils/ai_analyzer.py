import os
import json
import re
from groq import Groq
from typing import Dict, Any
from dotenv import load_dotenv

_ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
_ENV_PATH = os.path.join(_ROOT_DIR, ".env")
load_dotenv(dotenv_path=_ENV_PATH)


def _extract_json(text: str) -> Dict[str, Any]:
    """Robustly extract a JSON object from AI response text."""
    cleaned = re.sub(r"```(?:json)?", "", text).replace("```", "").strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass
    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    return {}


def analyze_resume_with_ai(cv_text: str, jd_text: str, lang: str = "en") -> Dict[str, Any]:
    """Uses Groq AI (LLaMA 3.3 70B) to perform deep semantic analysis."""
    api_key = os.getenv("GROQ_API_KEY")
    print(f"[AI] Groq API key loaded: {'YES' if api_key else 'NO'}, lang={lang}")

    if not api_key:
        return {"error": "Groq API Key missing. Check your .env file."}

    client = Groq(api_key=api_key)

    cv_pruned = cv_text[:8000]
    jd_pruned = jd_text[:4000]

    if lang == "vi":
        language_instruction = "IMPORTANT: You MUST write ALL text values in Vietnamese (Tiếng Việt). This is mandatory. Every string in the JSON response must be in Vietnamese."
    else:
        language_instruction = "Respond entirely in English."

    prompt = f"""You are a senior technical recruiter and career coach.

{language_instruction}

Analyze the Resume (CV) below against the provided Job Description (JD).

=== RESUME ===
{cv_pruned}

=== JOB DESCRIPTION ===
{jd_pruned}

Return ONLY a valid JSON object with these exact keys:
- "score": integer from 0 to 100 representing semantic match percentage
- "analysis_summary": short string (1-2 sentences) summarizing overall compatibility
- "strengths": list of exactly 4 strings describing the candidate's strengths for this role
- "weaknesses": list of exactly 4 strings describing gaps in the CV
- "improvement_advice": list of exactly 4 specific, actionable suggestions to improve the CV for this role
- "skills_categorized": object with exactly these keys:
    - "Technical Skills": list of technical skills found in the CV
    - "Soft Skills": list of soft skills found in the CV
    - "Tools/Others": list of tools, frameworks, or other skills found in the CV
- "resume_optimization": list of 3 objects, each with:
    - "original": a weak or unoptimized sentence found in the CV
    - "optimized": an improved version of that sentence with better keywords/action verbs
    - "why": 1-sentence explanation of why this is better for this JD
- "interview_prep": list of 5 objects, each with:
    - "question": a targeted interview question based on the candidate's gaps or JD requirements
    - "suggested_answer": a high-level guide or sample answer to help the candidate prepare
    - "reason": why this question is highly likely to be asked for this role

{language_instruction}

Output nothing but the raw JSON object. No markdown, no explanation."""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=2048,
        )

        raw_text = response.choices[0].message.content
        print(f"[AI] Raw response preview: {raw_text[:300]}")

        data = _extract_json(raw_text)
        if not data:
            print(f"[AI] ERROR: Could not parse JSON from: {raw_text[:500]}")
            return {"error": "Could not parse AI response as JSON."}

        return data
    except Exception as e:
        print(f"[AI] EXCEPTION: {str(e)}")
        return {"error": str(e)}


def chat_with_ai(cv_text: str, jd_text: str, question: str, history: list = None, lang: str = "en") -> str:
    """Provides interactive interview chat based on CV and JD context."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return "Error: AI API Key missing."

    client = Groq(api_key=api_key)
    cv_pruned = cv_text[:5000] # Smaller context for chat
    jd_pruned = jd_text[:3000]

    language_instruction = "IMPORTANT: Respond entirely in Vietnamese (Tiếng Việt)." if lang == "vi" else "Respond entirely in English."

    system_prompt = f"""You are a professional HR manager and career coach.
{language_instruction}
You have access to the candidate's Resume and the Job Description (JD).
Use this context to answer the candidate's questions about the interview, their fit, or how to handle specific questions.
Be encouraging, professional, and practical.

=== RESUME ===
{cv_pruned}

=== JOB DESCRIPTION ===
{jd_pruned}
"""

    messages = [{"role": "system", "content": system_prompt}]
    
    if history:
        for msg in history[-6:]: # Keep last 3 turns
            messages.append({"role": "user" if msg["role"] == "user" else "assistant", "content": msg["content"]})
            
    messages.append({"role": "user", "content": question})

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Sorry, I encountered an error: {str(e)}"
