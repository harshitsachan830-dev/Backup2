"use client";

const JUPYTER_URL = (
  process.env.NEXT_PUBLIC_JUPYTER_URL || "http://127.0.0.1:8899"
).replace(/\/+$/, "");

const notebooks = [
  { name: "Untitled1.ipynb", description: "56 cells" },
  { name: "Untitled.ipynb", description: "23 cells" },
  { name: "Untitled2.ipynb", description: "12 cells" },
  { name: "Untitled3.ipynb", description: "6 cells" },
];

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
        <a href={`${JUPYTER_URL}/lab/`} target="_blank" rel="noreferrer">
          Open ModelMind JupyterLab <span aria-hidden="true">↗</span>
        </a>
        <p className="jupyterLocalAddress">
          Local server: <code>{JUPYTER_URL}</code>
        </p>
      </section>

      <section className="jupyterNotebooks">
        <div className="portalSectionHeading">
          <span className="portalEyebrow">SAVED ON THIS COMPUTER</span>
          <h2>Open one of your existing notebooks</h2>
          <p>
            JupyterLab starts with ModelMind and opens an authenticated browser
            session automatically. Keep that browser session open while using
            these notebook links.
          </p>
        </div>
        <div className="jupyterNotebookList">
          {notebooks.map(notebook => (
            <a
              className="jupyterNotebookRow"
              href={`${JUPYTER_URL}/lab/tree/${encodeURIComponent(notebook.name)}`}
              key={notebook.name}
              target="_blank"
              rel="noreferrer"
            >
              <span className="jupyterNotebookIcon" aria-hidden="true">
                ▣
              </span>
              <span className="jupyterNotebookName">
                <strong>{notebook.name}</strong>
                <small>{notebook.description} · Jupyter Notebook</small>
              </span>
              <span className="jupyterNotebookOpen">Open ↗</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
