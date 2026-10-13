import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryDirectory = resolve(appDirectory, "..");
const jupyterUrl =
  process.env.NEXT_PUBLIC_JUPYTER_URL ?? "http://127.0.0.1:8899";
const jupyterAddress = new URL(jupyterUrl);
const isLocalJupyter = ["127.0.0.1", "localhost"].includes(
  jupyterAddress.hostname,
);
const jupyterPort = Number(jupyterAddress.port || "8899");
const platformScript =
  process.platform === "win32"
    ? resolve(repositoryDirectory, "scripts", "start-platform.ps1")
    : resolve(repositoryDirectory, "scripts", "start-platform.sh");

async function isJupyterRunning() {
  try {
    const response = await fetch(`http://127.0.0.1:${jupyterPort}/api`, {
      redirect: "manual",
      signal: AbortSignal.timeout(1500),
    });

    if (response.status === 302) {
      return response.headers.get("location")?.startsWith("/login") ?? false;
    }

    if (response.ok) {
      const body = await response.json();
      return typeof body?.version === "string";
    }

    return response.status === 401;
  } catch (error) {
    if (
      error instanceof TypeError &&
      (error.cause?.code === "ECONNREFUSED" ||
        error.cause?.code === "ECONNRESET")
    ) {
      return false;
    }
    throw error;
  }
}

function startChild(command, args, options) {
  const child = spawn(command, args, { stdio: "inherit", ...options });
  children.add(child);
  child.once("error", error => {
    console.error(`Could not start ${command}:`, error);
    stop(1);
  });
  child.once("close", (code, signal) => {
    children.delete(child);
    if (!stopping) {
      console.error(
        `${command} exited ${signal ? `after ${signal}` : `with code ${code}`}.`,
      );
      stop(code || 1);
    } else if (children.size === 0) {
      process.exit(exitCode);
    }
  });
  return child;
}

const children = new Set();
let stopping = false;
let exitCode = 0;

function stop(code = 0) {
  if (stopping) {
    return;
  }
  stopping = true;
  exitCode = code;
  for (const child of children) {
    child.kill("SIGTERM");
  }
  const forceExit = setTimeout(() => {
    for (const child of children) {
      child.kill("SIGKILL");
    }
    process.exit(exitCode);
  }, 5000);
  forceExit.unref();
}

process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));

try {
  if (!isLocalJupyter) {
    console.log(
      `Using the configured Jupyter server at ${jupyterUrl}; local startup skipped.`,
    );
  } else if (await isJupyterRunning()) {
    console.log(`Using the existing Jupyter server at ${jupyterUrl}.`);
  } else {
    console.log(`Starting JupyterLab at ${jupyterUrl}.`);
    if (process.platform === "win32") {
      startChild(
        "powershell.exe",
        [
          "-NoProfile",
          "-ExecutionPolicy",
          "Bypass",
          "-File",
          platformScript,
          "-Port",
          String(jupyterPort),
        ],
        { cwd: repositoryDirectory },
      );
    } else {
      startChild("bash", [platformScript], {
        cwd: repositoryDirectory,
        env: { ...process.env, PORT: String(jupyterPort) },
      });
    }
  }

  const nextCli = resolve(
    appDirectory,
    "node_modules",
    "next",
    "dist",
    "bin",
    "next",
  );
  startChild(process.execPath, [nextCli, process.argv[2] ?? "dev"], {
    cwd: appDirectory,
  });
} catch (error) {
  console.error("Could not check the local Jupyter server:", error);
  stop(1);
}
