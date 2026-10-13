"use client";

const JUPYTER_URL = (
  process.env.NEXT_PUBLIC_JUPYTER_URL || "http://127.0.0.1:8899"
).replace(/\/+$/, "");

export default function APIKeyWorkspace() {
  return (
    <main className="portalPage jupyterWorkspace">
      <section className="portalHero">
        <span className="portalEyebrow">GEMINI FOR MODELMIND AI</span>
        <h1>Connect your Gemini API key.</h1>
        <p>
          Save your key in this computer&apos;s credential store to use Gemini
          in the JupyterLab AI Chatbot and Error Assistant. The key is not
          stored in your browser or notebook files.
        </p>
        <a href={`${JUPYTER_URL}/lab/`} target="_blank" rel="noreferrer">
          Open JupyterLab to configure your key <span aria-hidden="true">↗</span>
        </a>
        <p className="jupyterLocalAddress">
          In JupyterLab, open the <strong>API Key</strong> tab in the right
          sidebar, paste your key, and choose <strong>Save key</strong>. Start
          JupyterLab with the ModelMind launcher to open its secure session
          automatically.
        </p>
      </section>

      <section className="jupyterNotebooks">
        <div className="portalSectionHeading">
          <span className="portalEyebrow">GET A GEMINI API KEY</span>
          <h2>Need a key?</h2>
          <p>
            Create one in Google AI Studio, then return here and save it in the
            JupyterLab API Key panel.
          </p>
          <a
            className="portalTextButton"
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
          >
            Open Google AI Studio <span aria-hidden="true">↗</span>
          </a>
        </div>
        <p className="jupyterLocalAddress">
          Use only a Jupyter server you trust. Gemini sends the code and error
          context you choose to share to Google. Gemini error-fix suggestions
          also require cloud fallback to be enabled on the Jupyter server and
          your <strong>Allow Gemini use</strong> opt-in in Error Assistant.
          Ollama remains local.
        </p>
      </section>
    </main>
  );
}
