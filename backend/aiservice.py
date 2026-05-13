#############################################################
#                                                           #
#       This file is to call the AI via the API keys        #
#                                                           #
#############################################################

import os
import json
from openai import OpenAI
from google import genai
from google.genai import types
from behaviour import TUTOR_PROMPT

def build_system_prompt(subject, level, response_length):
#################################################################################################
#                                                                                               #
#       Builds the system prompt to provide context and rules for the behaviour of the AI       #
#                                                                                               #
#################################################################################################
    built_system_prompt = TUTOR_PROMPT.replace("{subject}", subject).replace("{level}", level).replace("{response_length}", response_length) # this formats the TUTOR_PROMPT in behaviour.py
    
    return built_system_prompt

def call_github_model(full_prompt, subject, level, response_length):
##############################################################################################################################
#                                                                                                                            #
#       This send a prompt and receives a response from the github model which uses OpenAI gpt-4o-mini. Main AI model.       #
#                                                                                                                            #
##############################################################################################################################

    token = os.environ["GITHUB_API_TOKEN"] # gets the API token from an environment variable
    endpoint = "https://models.github.ai/inference" # where request is sent to
    model_name = "openai/gpt-4o-mini"

    client = OpenAI( # creates a connection to the AI service and get a response
        base_url = endpoint,
        api_key = token,
    )

    system_prompt = build_system_prompt(subject, level, response_length)

    response = client.chat.completions.create(  #this sends request to the model
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": full_prompt}
        ],
        
        # the below variables are settings for the AI
        temperature = 0.3, # this controls the answer type. 0.3 means its more focused and consistent with the answers which is easier to follow the system_prompt.
        top_p = 1.0, # no restriction on the word pool
        max_tokens = 1000, # maximum length of response
        model = model_name
    )

    stopped_reason = response.choices[0].finish_reason # this checks why the AI stopped
    
    if stopped_reason == 'length': # checks if the response hit the max token limit
        print("[AI] Warning: GitHub response was cut off at token limit.") 
        
    return response.choices[0].message.content

def call_gemini_model(full_prompt, subject, level, response_length):
#################################################################################################################################
#                                                                                                                               #
#       This send a prompt and receives a response from the google model which uses gemini-2.5-flash. Secondary AI model.       #
#                                                                                                                               #
#################################################################################################################################

    api_key = os.environ["GEMINI_API_KEY"] # gets the API key from an environment variable
    client = genai.Client(api_key=api_key)

    system_prompt = build_system_prompt(subject, level, response_length)

    response = client.models.generate_content( # creates a connection to the AI service and get a response
        model = "gemini-2.5-flash",
        contents = full_prompt,
        config = types.GenerateContentConfig( #configures the rules and settings of the AI
            system_instruction = system_prompt 
        )
    )
    
    if not response.text: #if the AI can not generate a response, this prevents a crash
        print("[AI] Warning: No response from Gemini")
        return "Error: No response"

    return response.text

def call_ai(full_prompt, subject, level, response_length = 'Medium'):
##################################################################################################
#                                                                                                #
#       This calls the AI modules:                                                               #
#           - Tries GitHub (gpt-4o-mini) first.                                                  #
#           - Falls back to Gemini (gemini-2.5-flash) if GitHub fails or hits rate/token limits. #
#                                                                                                #
##################################################################################################
    try: # tries calling Github model
        print("[AI] Trying GitHub model...")
        return call_github_model(full_prompt, subject, level, response_length) # if it works it calls the github model
    except Exception: # catches any error
        print("[AI] GitHub failed — switching to Gemini.")

    
    try: # tries calling Gemini fallback
        print("[AI] Trying Gemini fallback...")
        return call_gemini_model(full_prompt, subject, level, response_length) # if it works it calls the gemini model
    except Exception: # catches any error
        print("[AI] Gemini also failed")
        return "The AI is currently unavailable. Please try again in a moment."
    
