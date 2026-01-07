import os
import zipfile
import traceback

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from groq import RateLimitError

from core.runner import run_agent
from core.state_store import JOB_STATUS
from fastapi.staticfiles import StaticFiles



# -------------------------------------------------------------------
# Create FastAPI app FIRST
# -------------------------------------------------------------------
app = FastAPI(
    title="App Builder",
    description="Multi-agent project generation system",
    version="1.0"
)
app.mount("/jobs", StaticFiles(directory="jobs"), name="jobs")


# -------------------------------------------------------------------
# CORS
# -------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------------------------------------
# Request schema
# -------------------------------------------------------------------
class PromptRequest(BaseModel):
    prompt: str
    recursion_limit: int = 30


# -------------------------------------------------------------------
# Health check
# -------------------------------------------------------------------
@app.get("/")
def root():
    return {"message": "App Builder API is running"}


# -------------------------------------------------------------------
# Job status endpoint
# -------------------------------------------------------------------
@app.get("/status/{job_id}")
def get_status(job_id: str):
    if job_id not in JOB_STATUS:
        raise HTTPException(status_code=404, detail="Job not found")

    return {
        "job_id": job_id,
        "status": JOB_STATUS[job_id]
    }


# -------------------------------------------------------------------
# Download generated project
# -------------------------------------------------------------------
@app.get("/download/{job_id}")
def download_project(job_id: str):
    job_dir = f"jobs/{job_id}"

    if not os.path.isdir(job_dir):
        raise HTTPException(status_code=404, detail="Job not found")

    zip_path = f"jobs/{job_id}.zip"

    # Create zip only once
    if not os.path.exists(zip_path):
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
            for root, _, files in os.walk(job_dir):
                for file in files:
                    full_path = os.path.join(root, file)
                    arcname = os.path.relpath(full_path, job_dir)
                    zipf.write(full_path, arcname)

    return FileResponse(
        zip_path,
        media_type="application/zip",
        filename=f"{job_id}.zip"
    )


# -------------------------------------------------------------------
# Generate project
# -------------------------------------------------------------------
@app.post("/generate")
def generate_project(req: PromptRequest):
    try:
        return run_agent(
            user_prompt=req.prompt,
            recursion_limit=req.recursion_limit
        )

    except RateLimitError:
        raise HTTPException(
            status_code=429,
            detail="LLM rate limit reached. Please try again later."
        )

    except Exception as e:
        print("ERROR IN /generate")
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
