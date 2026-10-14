import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  findAvailablePort,
  findManagedJupyterPort,
} from "./jupyter-runtime.mjs";

test("ignores unrelated Jupyter metadata and reuses a live managed server", async () => {
  const runtimeDirectory = await mkdtemp(
    path.join(os.tmpdir(), "modelmind-jupyter-runtime-"),
  );
  try {
    await writeFile(
      path.join(runtimeDirectory, "jpserver-123.json"),
      JSON.stringify({
        url: "http://127.0.0.1:8899/",
        port: 8899,
      }),
    );
    await writeFile(
      path.join(runtimeDirectory, "jpserver-456.json"),
      JSON.stringify({
        url: "http://0.0.0.0:8900/",
        port: 8900,
      }),
    );

    const port = await findManagedJupyterPort(
      runtimeDirectory,
      async candidate => candidate === 8899,
    );
    assert.equal(port, 8899);
  } finally {
    await rm(runtimeDirectory, { recursive: true, force: true });
  }
});

test("returns no managed Jupyter server when metadata is absent", async () => {
  const runtimeDirectory = await mkdtemp(
    path.join(os.tmpdir(), "modelmind-jupyter-runtime-"),
  );
  try {
    assert.equal(
      await findManagedJupyterPort(runtimeDirectory, async () => true),
      null,
    );
  } finally {
    await rm(runtimeDirectory, { recursive: true, force: true });
  }
});

test("selects a free port instead of adopting another service", async () => {
  const blocker = createServer();
  await new Promise((resolveListen, rejectListen) => {
    blocker.once("error", rejectListen);
    blocker.listen({ host: "127.0.0.1", port: 0 }, resolveListen);
  });
  const occupiedPort = blocker.address().port;

  try {
    assert.equal(
      await findAvailablePort(occupiedPort, occupiedPort + 1),
      occupiedPort + 1,
    );
  } finally {
    await new Promise((resolveClose, rejectClose) => {
      blocker.close(error => (error ? rejectClose(error) : resolveClose()));
    });
  }
});
