import os
import json
from openai import OpenAI
from google import genai
from google.genai import types

from behaviour import TUTOR_PROMPT


def build_system_prompt(subject, level, response_length):
    return TUTOR_PROMPT.format(
        subject=subject,
        level=level,
        response_length=response_length
    )


def call_github_model(full_prompt, subject, level, response_length):
    token = os.environ["GITHUB_API_TOKEN"]
    endpoint = "https://models.github.ai/inference"
    model_name = "openai/gpt-4o-mini"

    client = OpenAI(
        base_url=endpoint,
        api_key=token,
    )

    system_prompt = build_system_prompt(subject, level, response_length)

    response = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": full_prompt}
        ],
        temperature=1.0,
        top_p=1.0,
        max_tokens=1000,
        model=model_name
    )

    finish_reason = response.choices[0].finish_reason
    if finish_reason == "length":
        print("[AI] Warning: GitHub response was cut off at token limit.")

    return response.choices[0].message.content


def call_gemini_model(full_prompt, subject, level, response_length):
    api_key = os.environ["GEMINI_API_KEY"]
    client = genai.Client(api_key=api_key)

    system_prompt = build_system_prompt(subject, level, response_length)

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=full_prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_prompt
        )
    )
    return response.text


def call_ai(full_prompt, subject, level, response_length='Medium'):
#     Tries GitHub (gpt-4o-mini) first.
#     Falls back to Gemini (gemini-2.5-flash) if GitHub fails or hits rate/token limits.

    try:
        print("[AI] Trying GitHub model...")
        return call_github_model(full_prompt, subject, level, response_length)

    except Exception as e:
        error_msg = str(e).lower()
        if "rate" in error_msg or "429" in error_msg or "quota" in error_msg or "limit" in error_msg:
            print(f"[AI] GitHub rate limit hit — switching to Gemini. ({e})")
        else:
            print(f"[AI] GitHub model failed — switching to Gemini. ({e})")

    print("[AI] Using Gemini fallback...")
    return call_gemini_model(full_prompt, subject, level, response_length)