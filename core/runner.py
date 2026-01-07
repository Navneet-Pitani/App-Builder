import os
import uuid
from core.state_store import JOB_STATUS

DEV_MODE = False


def run_agent(user_prompt: str, recursion_limit: int = 30) -> dict:
    job_id = str(uuid.uuid4())
    output_dir = f"jobs/{job_id}"
    os.makedirs(output_dir, exist_ok=True)

    if DEV_MODE:
        JOB_STATUS[job_id] = "DONE"
        with open(f"{output_dir}/index.html", "w") as f:
            f.write("<h1>DEV MODE</h1>")
        return {"job_id": job_id}

    from agent.graph import agent

    JOB_STATUS[job_id] = "Starting"

    agent.invoke(
        {
            "user_prompt": user_prompt,
            "job_id": job_id,
            "output_dir": output_dir
        },
        {"recursion_limit": recursion_limit}
    )

    return {"job_id": job_id}
