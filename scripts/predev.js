/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync } = require("child_process");

function cleanPort() {
  try {
    if (process.platform === "win32") {
      const output = execSync("netstat -ano", { encoding: "utf8" });
      const lines = output.split("\n");
      const pidsToKill = new Set();

      for (const line of lines) {
        if (line.includes(":3000") && line.includes("LISTENING")) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && pid !== "0" && Number(pid) !== process.pid) {
            pidsToKill.add(pid);
          }
        }
      }

      for (const pid of pidsToKill) {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
          console.log(`[predev] Cleared lingering process on port 3000 (PID ${pid})`);
        } catch {
          // ignore
        }
      }
    }
  } catch {
    // ignore
  }
}

cleanPort();
