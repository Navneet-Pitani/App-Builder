from typing import List, Optional
from pydantic import BaseModel

class FileSpec(BaseModel):
    path: str
    purpose: str

class Plan(BaseModel):
    name: str
    description: Optional[str] = None
    features: list[str]
    techstack: list[str]
    files: list[FileSpec]


# --------------------------------------------------
# Architect output
# --------------------------------------------------
class ImplementationStep(BaseModel):
    filepath: str
    task_description: str


class TaskPlan(BaseModel):
    plan: Plan | None = None
    implementation_steps: List[ImplementationStep]


# --------------------------------------------------
# Coder state
# --------------------------------------------------
class CoderState(BaseModel):
    task_plan: TaskPlan
    current_step_idx: int = 0
