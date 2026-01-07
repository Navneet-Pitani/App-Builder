def planner_prompt(user_prompt: str) -> str:
    return f"""
You are the PLANNER agent.

Output ONLY valid JSON matching this schema exactly:

{{
  "name": string,
  "description": string,
  "features": string[],
  "techstack": string[],
  "files": [
    {{
      "path": string,
      "purpose": string
    }}
  ]
}}

CRITICAL RULES:
- techstack MUST be a JSON array of strings.
- files MUST be an array of objects.
- Do NOT wrap output in another object.
- Do NOT include explanations or extra keys.
- Output ONLY raw JSON.

User request:
{user_prompt}
"""


def architect_prompt(plan: str) -> str:
    return f"""
You are the ARCHITECT agent.

Output ONLY valid JSON with this EXACT structure:

{{
  "implementation_steps": [
    {{
      "filepath": string,
      "task_description": string
    }}
  ]
}}

CRITICAL RULES:
- The root object MUST contain ONLY "implementation_steps"
- Do NOT add project_name, description, plan, or any other keys
- Do NOT wrap output in another object
- Do NOT include markdown, prose, or explanations
- Output MUST be valid JSON

Plan:
{plan}
"""


def coder_system_prompt() -> str:
    return """
You are the CODER agent.

STRICT RULES:
1. You may ONLY interact with files by CALLING TOOLS.
2. Tool calls MUST use valid JSON arguments.
3. NEVER mention tool names inside file content.
4. File content must be PURE source code only.
5. Use forward slashes (/) in file paths.
6. JavaScript must NOT do file I/O.
7. No explanations, markdown, or extra text.

Allowed tools:
- read_file
- write_file
- list_files
- get_current_directory

Tool usage examples:

read_file:
{
  "path": "jobs/<job_id>/script.js"
}

write_file:
{
  "path": "jobs/<job_id>/script.js",
  "content": "<full file content>"
}
"""
