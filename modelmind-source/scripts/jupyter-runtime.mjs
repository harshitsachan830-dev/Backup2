import { createServer } from "node:net";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

export async function findManagedJupyterPort(runtimeDirectory, isRunning) {
  let files;
  try {
    files = await readdir(runtimeDirectory);
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    throw error;
  }

  for (const file of files) {
    if (!/^jpserver-\d+\.json$/.test(file)) {
      continue;
    }

    let metadata;
    try {
      metadata = JSON.parse(await readFile(join(runtimeDirectory, file), "utf8"));
    } catch (error) {
      if (error instanceof SyntaxError || error.code === "ENOENT") {
        continue;
      }
      throw error;
    }
    const port = Number(metadata.port);
    let hostname;
    try {
      hostname = new URL(metadata.url).hostname;
    } catch {
      continue;
    }
    if (
      Number.isInteger(port) &&
      port > 0 &&
      port <= 65535 &&
      ["127.0.0.1", "localhost", "::1"].includes(hostname) &&
      await isRunning(port)
    ) {
      return port;
    }
  }

  return null;
}

export function findAvailablePort(preferredPort, maximumPort = 65535) {
  return new Promise((resolvePort, rejectPort) => {
    const server = createServer();
    server.once("error", error => {
      if (error.code === "EADDRINUSE" && preferredPort < maximumPort) {
        resolvePort(findAvailablePort(preferredPort + 1, maximumPort));
      } else {
        rejectPort(error);
      }
    });
    server.listen({ host: "127.0.0.1", port: preferredPort, exclusive: true }, () => {
      server.close(error => {
        if (error) {
          rejectPort(error);
        } else {
          resolvePort(preferredPort);
        }
      });
    });
  });
}
