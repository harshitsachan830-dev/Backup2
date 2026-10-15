import { access, readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  findAvailablePort,
  findManagedJupyterPort,
} from "./jupyter-runtime.mjs";

const appDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryDirectory = resolve(appDirectory, "..");
const backendDirectory = resolve(appDirectory, "backend");
const virtualEnvironmentDirectory = resolve(
  process.env.MODELMIND_VENV_DIR ?? resolve(repositoryDirectory, ".venv"),
);
const apiPort = Number(process.env.MODELMIND_API_PORT ?? "8000");
if (!Number.isInteger(apiPort) || apiPort < 1 || apiPort > 65535) {
  throw new Error("MODELMIND_API_PORT must be a valid TCP port.");
}
const apiUrl = `http://127.0.0.1:${apiPort}`;
const jupyterUrl =
  process.env.NEXT_PUBLIC_JUPYTER_URL ?? "http://127.0.0.1:8899";
const jupyterAddress = new URL(jupyterUrl);
const isLocalJupyter = ["127.0.0.1", "localhost"].includes(
  jupyterAddress.hostname,
);
const requestedJupyterPort = Number(jupyterAddress.port || "8899");
const mode = process.argv[2] ?? "dev";
const runWebsite = mode !== "companion";
let jupyterPort = requestedJupyterPort;
const jupyterRuntimeDirectory = process.env.JUPYTER_RUNTIME_DIR;
const platformScript =
  process.platform === "win32"
    ? resolve(repositoryDirectory, "scripts", "start-platform.ps1")
    : resolve(repositoryDirectory, "scripts", "start-platform.sh");
const pythonExecutable =
  process.platform === "win32"
    ? resolve(virtualEnvironmentDirectory, "Scripts", "python.exe")
    : resolve(virtualEnvironmentDirectory, "bin", "python");
async function ensurePythonEnvironment() {
  try {
    await access(pythonExecutable);
    return;
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  console.log("Preparing the local Python environment for ModelMind services.");
  const setupEnvironment = {
    ...process.env,
    MODELMIND_JUPYTER_PORT: String(jupyterPort),
    MODELMIND_SETUP_ONLY: "1",
  };
  if (process.platform === "win32") {
    await runCommand(
      "powershell.exe",
      [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        platformScript,
        "-Port",
        String(jupyterPort),
        "-SetupOnly",
      ],
      { cwd: repositoryDirectory, env: setupEnvironment },
    );
  } else {
    await runCommand("bash", [platformScript], {
      cwd: repositoryDirectory,
      env: { ...setupEnvironment, PORT: String(jupyterPort) },
    });
  }
  await access(pythonExecutable);
}

function runCommand(command, args, options) {
  return new Promise((resolveCommand, rejectCommand) => {
    const child = spawn(command, args, { stdio: "inherit", ...options });
    child.once("error", rejectCommand);
    child.once("close", (code, signal) => {
      if (code === 0) {
        resolveCommand();
      } else {
        rejectCommand(
          new Error(
            `${command} setup exited ${
              signal ? `after ${signal}` : `with code ${code}`
            }.`,
          ),
        );
      }
    });
  });
}

async function isJupyterRunning() {
  return isJupyterPortRunning(jupyterPort);
}

async function isJupyterPortRunning(port) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api`, {
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

async function isBackendRunning() {
  try {
    const response = await fetch(`${apiUrl}/health`, {
      signal: AbortSignal.timeout(1500),
    });
    if (!response.ok) {
      return false;
    }

    const body = await response.json();
    if (body?.status !== "healthy") {
      return false;
    }
    if (body.jupyter_port !== jupyterPort) {
      throw new Error(
        "A different or older ModelMind companion is already using the local API. Stop its Terminal window, then restart ModelMind.",
      );
    }
    return true;
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

async function waitForService(name, isRunning, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isRunning()) {
      return;
    }
    await new Promise(resolveDelay => setTimeout(resolveDelay, 1000));
  }
  throw new Error(`${name} did not become ready before the startup timeout.`);
}

async function readLocalOriginSetting() {
  if (process.env.MODELMIND_WEB_ORIGINS) {
    return process.env.MODELMIND_WEB_ORIGINS;
  }

  try {
    const envFile = await readFile(
      resolve(repositoryDirectory, ".env"),
      "utf8",
    );
    for (const line of envFile.split(/\r?\n/)) {
      const match = line.match(/^\s*MODELMIND_WEB_ORIGINS\s*=\s*(.*?)\s*$/);
      if (!match) {
        continue;
      }
      const value = match[1].replace(/^(['"])(.*)\1$/, "$2").trim();
      if (value) {
        return value;
      }
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
  return undefined;
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
  } else {
    const managedPort = jupyterRuntimeDirectory
      ? await findManagedJupyterPort(
          jupyterRuntimeDirectory,
          isJupyterPortRunning,
        )
      : null;
    if (managedPort !== null) {
      jupyterPort = managedPort;
      console.log(`Using the ModelMind Jupyter server at http://127.0.0.1:${jupyterPort}.`);
    } else {
      jupyterPort = await findAvailablePort(
        requestedJupyterPort,
        Math.min(requestedJupyterPort + 100, 65535),
      );
      const managedJupyterUrl = `http://127.0.0.1:${jupyterPort}`;
      console.log(`Starting ModelMind JupyterLab at ${managedJupyterUrl}.`);
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
          {
            cwd: repositoryDirectory,
            env: {
              ...process.env,
              JUPYTER_RUNTIME_DIR: jupyterRuntimeDirectory,
              MODELMIND_JUPYTER_PORT: String(jupyterPort),
            },
          },
        );
      } else {
        startChild("bash", [platformScript], {
          cwd: repositoryDirectory,
          env: {
            ...process.env,
            JUPYTER_RUNTIME_DIR: jupyterRuntimeDirectory,
            MODELMIND_JUPYTER_PORT: String(jupyterPort),
            PORT: String(jupyterPort),
          },
        });
      }
      await waitForService("JupyterLab", isJupyterRunning, 10 * 60 * 1000);
    }
  }

  if (await isBackendRunning()) {
    console.log(`Using the existing local ModelMind API at ${apiUrl}.`);
  } else {
    await ensurePythonEnvironment();
    const localOrigins = await readLocalOriginSetting();
    console.log(`Starting the local ModelMind API at ${apiUrl}.`);
    startChild(
      pythonExecutable,
      [
        "-m",
        "uvicorn",
        "main:app",
        "--host",
        "127.0.0.1",
        "--port",
        String(apiPort),
      ],
      {
        cwd: backendDirectory,
        env: {
          ...process.env,
          ...(localOrigins ? { MODELMIND_WEB_ORIGINS: localOrigins } : {}),
          MODELMIND_API_PORT: String(apiPort),
          MODELMIND_JUPYTER_PORT: String(jupyterPort),
        },
      },
    );
    await waitForService("ModelMind API", isBackendRunning, 60 * 1000);
  }

  if (runWebsite) {
    const nextCli = resolve(
      appDirectory,
      "node_modules",
      "next",
      "dist",
      "bin",
      "next",
    );
    startChild(process.execPath, [nextCli, mode], {
      cwd: appDirectory,
    });
  } else {
    const launchUrl = `${apiUrl}/jupyter/open`;
    console.log("\n=======================================================");
    console.log(" ModelMind Notebook services are ready!");
    console.log(` Direct Notebook launch URL: ${launchUrl}`);
    console.log(` Local API URL:              ${apiUrl}`);
    console.log(" Keep this window open while working with notebooks.");
    console.log("=======================================================\n");
    console.log(" Navigate to the ModelMind dashboard and click 'Open Notebook' to work with notebooks.\n");
  }
} catch (error) {
  console.error("Could not start the local ModelMind services:", error);
  stop(1);
}
