const btn = document.getElementById("generateBtn");
const promptBox = document.getElementById("prompt");
const statusDiv = document.getElementById("status");
const downloadLink = document.getElementById("downloadLink");

let pollInterval = null;

btn.addEventListener("click", async () => {
  const prompt = promptBox.value.trim();

  if (!prompt) {
    alert("Please enter a project description.");
    return;
  }

  // Reset UI
  btn.disabled = true;
  statusDiv.textContent = "⏳ Starting job...";
  downloadLink.style.display = "none";

  try {
    // --------------------------------------------------
    // 1️⃣ Start job
    // --------------------------------------------------
    const response = await fetch("http://127.0.0.1:8000/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: prompt,
        recursion_limit: 100
      })
    });

    if (!response.ok) {
      throw new Error("Failed to start job");
    }

    const data = await response.json();
    const jobId = data.job_id;

    if (!jobId) {
      throw new Error("No job_id returned from server");
    }

    // --------------------------------------------------
    // 2️⃣ Poll job status
    // --------------------------------------------------
    pollInterval = setInterval(async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/status/${jobId}`
        );
        const statusData = await res.json();

        // Safe status rendering (no undefined)
        const statusText = statusData.status || "Starting...";
        statusDiv.textContent = "⚙ " + statusText;

        // Job completed
        if (statusText === "DONE") {
          clearInterval(pollInterval);
          statusDiv.textContent = "✅ Project ready!";

          downloadLink.href =
            `http://127.0.0.1:8000/download/${jobId}`;
          downloadLink.style.display = "block";

          btn.disabled = false;
        }

        // Job failed
        if (statusText === "FAILED") {
          clearInterval(pollInterval);
          statusDiv.textContent = "❌ Generation failed.";
          btn.disabled = false;
        }

      } catch (pollError) {
        console.error("Polling error:", pollError);
        statusDiv.textContent = "⚠ Lost connection...";
      }
    }, 2000);

  } catch (err) {
    console.error(err);
    statusDiv.textContent = "❌ Error starting job.";
    btn.disabled = false;
  }
});
