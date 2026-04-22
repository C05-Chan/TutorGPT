import requests
import os

from behaviour import TUTOR_PROMPT

def call_ai(prompt):
    token = os.getenv("GITHUB_API_KEY")

    url = "https://models.inference.ai.azure.com/chat/completions"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    body = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": TUTOR_PROMPT},
            {"role": "user", "content": prompt}
        ],
        "n": 1
    }

    response = requests.post(url, headers=headers, json=body)
    data = response.json()

    return data["choices"][0]["message"]["content"]