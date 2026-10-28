"use client";

import OpenJupyterForm from "@/components/notebook/OpenJupyterForm";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

export default function JupyterWorkspace() {
  return (
    <main className="portalPage jupyterWorkspace">
      <section className="portalHero">
        <span className="portalEyebrow">YOUR LOCAL NOTEBOOK ENVIRONMENT</span>
        <h1>Your notebooks, running in JupyterLab.</h1>
        <p>
          This opens the real local JupyterLab server—not a separate dashboard
          notebook demo. Your ModelMind extension provides Error Assistant,
          AI Chat, preprocessing tools, and ML Studio inside JupyterLab.
        </p>
        <div className="jupyterNotebookActions">
          <OpenJupyterForm
            className="jupyterLaunchButton"
            notebookType="modelmind"
          >
            Open ModelMind Notebook <span aria-hidden="true">↗</span>
          </OpenJupyterForm>
          <OpenJupyterForm
            className="jupyterLaunchButton jupyterTrainerLaunchButton"
            notebookType="trainer"
          >
            User&apos;s Notebook <span aria-hidden="true">↗</span>
          </OpenJupyterForm>
        </div>
        <a
          href="https://github.com/harshitsachan830-dev/Backup2/releases"
          rel="noreferrer"
          target="_blank"
        >
          Download the private Windows/macOS staging installer
        </a>
        <p className="jupyterLocalAddress">
          Local companion: <code>{API_URL}</code>
        </p>
      </section>

      <section className="jupyterNotebooks">
        <div className="portalSectionHeading">
          <span className="portalEyebrow">SAVED ON THIS COMPUTER</span>
          <h2>Your notebooks stay on this computer</h2>
          <p>
            Open JupyterLab to browse and create notebooks in your local
            workspace. Your files are not uploaded to ModelMind or Render.
          </p>
        </div>
        <p className="jupyterLocalAddress">
          If the companion is not running, launch ModelMind from the Start menu
          on Windows or Applications on macOS. Keep its terminal window open
          while using JupyterLab.
        </p>
      </section>
    </main>
  );
}
