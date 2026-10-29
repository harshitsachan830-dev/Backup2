"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Maximize2, Minimize2, RotateCw, X } from "lucide-react";
import { visualizations } from "@/lib/visualizations";
import type { VisualizationItem } from "@/lib/visualizations";

const trustedVisualizationUrls = new Set(
  visualizations.flatMap((visualization) => visualization.href ? [new URL(visualization.href).href] : []),
);

function getTrustedVisualizationUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && trustedVisualizationUrls.has(url.href) ? url.href : null;
  } catch {
    return null;
  }
}

interface EmbeddedLabViewerProps {
  lab: VisualizationItem | null;
  onClose: () => void;
}

export default function EmbeddedLabViewer({
  lab,
  onClose,
}: EmbeddedLabViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    if (lab) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lab, onClose]);

  if (!lab) {
    return null;
  }

  const trustedUrl = lab.href ? getTrustedVisualizationUrl(lab.href) : null;

  return (
    <div
      className={`mm-lab-overlay ${isFullscreen ? "fullscreen" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={lab.name}
    >
      <div className="mm-lab-container">
        <header className="mm-lab-header">
          <div className="mm-lab-header-left">
            <button
              type="button"
              className="mm-lab-back-btn"
              onClick={onClose}
              title="Close lab and return to ModelMind"
            >
              <ArrowLeft size={16} />
              <span>Back to ModelMind</span>
            </button>
            <div className="mm-lab-divider" aria-hidden="true" />
            <div className="mm-lab-title-group">
              <span className="mm-lab-badge">MODEL MIND VIEWER</span>
              <h2 className="mm-lab-title">{lab.name}</h2>
            </div>
          </div>

          <div className="mm-lab-header-right">
            <button
              type="button"
              className="mm-lab-icon-btn"
              onClick={() => setIframeKey((prev) => prev + 1)}
              title="Reload lab"
            >
              <RotateCw size={15} />
            </button>
            <button
              type="button"
              className="mm-lab-icon-btn"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
            <button
              type="button"
              className="mm-lab-close-btn"
              onClick={onClose}
              title="Close lab"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="mm-lab-body">
          {trustedUrl ? (
            <iframe
              key={iframeKey}
              src={trustedUrl}
              title={lab.name}
              className="mm-lab-iframe"
              sandbox="allow-forms allow-scripts allow-same-origin allow-downloads allow-pointer-lock allow-presentation"
              referrerPolicy="no-referrer"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          ) : (
            <div className="mm-lab-guard-message" role="alert">
              <strong>Visualization blocked</strong>
              <span>This destination is not on ModelMind’s trusted visualization list.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
