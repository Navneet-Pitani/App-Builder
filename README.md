#App Builder — AI-Powered Web App Generator

App Builder is an experimental AI-driven web application generatorthat converts natural-language prompts into working frontend projects using HTML, CSS, and JavaScript.

It uses a **multi-agent architecture** (Planner → Architect → Coder) to:
- understand the user’s intent,
- design a structured project plan,
- and generate real, runnable code files.

This project focuses on **code correctness, file-level generation, and execution**, not just text output.


Features

- 🔹 Generate complete frontend apps from plain English prompts  
- 🔹 Multi-agent reasoning pipeline (Planner, Architect, Coder)  
- 🔹 Structured output enforced via schemas (Pydantic)  
- 🔹 File-system aware code generation (HTML / CSS / JS)  
- 🔹 Apps run directly in the browser via a local server  
- 🔹 Designed for extensibility (future backend / frameworks)


## Architecture Overview
User Prompt
↓
Planner Agent → Project Plan (structured)
↓
Architect Agent → File-wise implementation steps
↓
Coder Agent → Writes actual source files

Each agent has a **strict responsibility** and operates with **clear constraints**, which helps reduce hallucinations and improves the quality of generated applications.

---

## Project Output

Each generated app typically contains:
- `index.html` — UI structure
- `style.css` — Styling and layout
- `script.js` — Application logic and interactivity

The generated apps are **immediately runnable** via the local server.

---

## Running Generated Apps

Generated applications must be opened through the local server to ensure JavaScript and CSS load correctly.

Example:http://127.0.0.1:8000/jobs/<job_id>/index.html

Opening the HTML file directly (`file://`) may cause scripts or styles to fail to load.

---

##  Example Generated App

### Calculator App
- Clickable numeric buttons  
- Arithmetic operations (+ − × ÷)  
- Keyboard input support  
- Clear and reset functionality  
- Responsive layout  

<!-- SCREENSHOT: Calculator App UI -->
<!-- Add screenshot here -->

---

## Current Limitations

- Frontend-only applications (no backend generation yet)
- Vanilla HTML/CSS/JS only (no React/Vue)
- No guard conditions for partial generation
- Requires local server to run apps correctly

These limitations are **intentional design choices** to keep the system predictable and debuggable.

---

## Planned Improvements

- Better prompt-to-schema alignment  
- More robust Todo / form-based apps  
- Optional framework support (React, etc.)  
- Improved regeneration and iteration flow  
- UI for browsing generated projects  

---

## Screenshots

<!-- SCREENSHOT: App Builder UI -->
<!-- Add screenshot here -->
<img width="522" height="713" alt="image" src="https://github.com/user-attachments/assets/bf7192dd-492d-4683-b0a3-f87b3763fb9f" />


---

## Author

**Navneet Pitani**  
Computer Science Student  
Exploring AI-assisted software engineering and agentic systems

---



