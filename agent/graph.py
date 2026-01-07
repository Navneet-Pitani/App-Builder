import os
from dotenv import load_dotenv

from langchain_groq.chat_models import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

from langgraph.constants import END
from langgraph.graph import StateGraph
from langgraph.prebuilt import create_react_agent

from agent.prompts import (
    planner_prompt,
    architect_prompt,
    coder_system_prompt,
)
from agent.states import Plan, TaskPlan, CoderState
from agent.tools import read_file, write_file, list_files, get_current_directory

from core.state_store import JOB_STATUS


# -------------------------------------------------------------------
# Environment setup
# -------------------------------------------------------------------
load_dotenv()
os.environ["LANGCHAIN_TRACING_V2"] = "false"
os.environ["LANGCHAIN_VERBOSE"] = "false"


# -------------------------------------------------------------------
# LLMs
# -------------------------------------------------------------------
planner_llm = ChatGroq(model="openai/gpt-oss-120b")
architect_llm = ChatGroq(model="openai/gpt-oss-120b")
coder_llm = ChatGroq(model="openai/gpt-oss-120b")


# -------------------------------------------------------------------
# Planner Agent (NO TOOLS)
# -------------------------------------------------------------------
def planner_agent(state: dict) -> dict:
    job_id = state["job_id"]
    JOB_STATUS[job_id] = "Planning"

    response = planner_llm.invoke(
        planner_prompt(state["user_prompt"])
    )

    # IMPORTANT: parse manually, no tool calling
    raw = response.content

    # If model returned a JSON string, parse it
    if isinstance(raw, str):
        import json
        raw = json.loads(raw)

    # If model wrapped output like { "Plan": {...} }
    if isinstance(raw, dict) and "Plan" in raw:
        raw = raw["Plan"]

    plan = Plan.model_validate(raw)

    return {
        "plan": plan,
        "job_id": job_id,
        "output_dir": state["output_dir"]
    }


# -------------------------------------------------------------------
# Architect Agent (NO TOOLS — CRITICAL FIX)
# -------------------------------------------------------------------
def architect_agent(state: dict) -> dict:
    job_id = state["job_id"]
    JOB_STATUS[job_id] = "Architecting"

    response = architect_llm.invoke(
        architect_prompt(state["plan"].model_dump_json())
    )

    task_plan = TaskPlan.model_validate_json(response.content)
    task_plan.plan = state["plan"]

    return {
        "task_plan": task_plan,
        "job_id": job_id,
        "output_dir": state["output_dir"]
    }



# -------------------------------------------------------------------
# Coder Agent (TOOLS ALLOWED)
# -------------------------------------------------------------------
def coder_agent(state: dict) -> dict:
    job_id = state["job_id"]
    output_dir = state["output_dir"]

    os.makedirs(output_dir, exist_ok=True)

    task_plan: TaskPlan = state["task_plan"]
    steps = task_plan.implementation_steps

    coder_state: CoderState = state.get("coder_state")
    if coder_state is None:
        coder_state = CoderState(
            task_plan=task_plan,
            current_step_idx=0
        )

    # DONE condition
    if coder_state.current_step_idx >= len(steps):
        JOB_STATUS[job_id] = "DONE"
        return {
            "status": "DONE",
        "coder_state": coder_state,
        "task_plan": task_plan,   # ← REQUIRED
        "job_id": job_id,
        "output_dir": output_dir
        }

    # Progress update
    JOB_STATUS[job_id] = (
        f"Coding step {coder_state.current_step_idx + 1} / {len(steps)}"
    )

    current_task = steps[coder_state.current_step_idx]
    full_path = os.path.join(output_dir, current_task.filepath)

    existing_content = read_file.invoke({"path": full_path})


    react_agent = create_react_agent(
        coder_llm,
        tools=[
            read_file,
            write_file,
            list_files,
            get_current_directory
        ]
    )

    react_agent.invoke({
        "messages": [
            {
                "role": "system",
                "content": coder_system_prompt()
            },
            {
                "role": "user",
                "content": (
                    f"Task:\n{current_task.task_description}\n\n"
                    f"File path:\n{full_path}\n\n"
                    f"Existing content:\n{existing_content}\n\n"
                    "Write the FULL file content using write_file."
                )
            }
        ]
    })

    coder_state.current_step_idx += 1

    return {
        "coder_state": coder_state,
        "task_plan": task_plan,  # ← REQUIRED
        "job_id": job_id,
        "output_dir": output_dir
    }


# -------------------------------------------------------------------
# LangGraph wiring
# -------------------------------------------------------------------
graph = StateGraph(dict)

graph.add_node("planner", planner_agent)
graph.add_node("architect", architect_agent)
graph.add_node("coder", coder_agent)

graph.add_edge("planner", "architect")
graph.add_edge("architect", "coder")

graph.add_conditional_edges(
    "coder",
    lambda s: "END" if s.get("status") == "DONE" else "coder",
    {"END": END, "coder": "coder"}
)

graph.set_entry_point("planner")

agent = graph.compile()
