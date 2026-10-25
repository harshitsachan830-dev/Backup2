"use client";

import { useState } from "react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

export type NotebookType = "modelmind" | "trainer";

export default function OpenJupyterForm({
  children,
  className,
  notebookType = "modelmind",
}: {
  children: React.ReactNode;
  className?: string;
  notebookType?: NotebookType;
}) {
  const [error, setError] = useState("");
  const [opening, setOpening] = useState(false);

  async function openNotebook() {
    setError("");
    const notebookWindow = window.open("about:blank", "_blank");
    if (!notebookWindow) {
      setError("Allow pop-ups for this site, then choose Open Notebook again.");
      return;
    }
    notebookWindow.opener = null;
    setOpening(true);

    try {
      const response = await fetch(`${API_URL}/jupyter/prepare`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ notebook_type: notebookType }),
      });
      const result = (await response.json()) as {
        detail?: string;
        launch_id?: string;
      };
      if (response.ok && result.launch_id) {
        notebookWindow.location.href =
          `${API_URL}/jupyter/open?launch_id=${encodeURIComponent(result.launch_id)}`;
        return;
      }
    } catch {
      // Browsers like Safari block HTTPS-to-HTTP localhost fetch as mixed content.
      // Top-level window navigation is permitted and sends the trusted Referer header.
    }

    try {
      notebookWindow.location.href =
        `${API_URL}/jupyter/open?notebook_type=${notebookType}`;
    } catch (cause) {
      notebookWindow.close();
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not open the local notebook. Check that the companion is running.",
      );
    } finally {
      setOpening(false);
    }
  }

  return (
    <>
      <button
        className={className}
        disabled={opening}
        onClick={openNotebook}
        type="button"
      >
        {opening ? "Connecting..." : children}
      </button>
      {error && (
        <div className="jupyterLaunchError" role="alert" style={{ marginTop: "0.5rem" }}>
          <p>{error}</p>
          <p style={{ marginTop: "0.25rem" }}>
            <a
              href={`${API_URL}/jupyter/open?notebook_type=${notebookType}`}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "underline", color: "inherit", fontWeight: 600 }}
            >
              Open Notebook directly ↗
            </a>
          </p>
        </div>
      )}
    </>
  );
}
