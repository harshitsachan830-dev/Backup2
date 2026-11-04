"use client";

import { useMemo, useState } from "react";
import { VisualizationIllustration } from "@/components/layout/PortalSections";
import EmbeddedLabViewer from "@/components/visualization/EmbeddedLabViewer";
import type { VisualizationItem } from "@/lib/visualizations";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

// ── Broad ML Groupings for Clean Classification ─────────────────────────────
interface GroupDefinition {
  id: string;
  title: string;
  shortLabel: string;
  emoji: string;
  description: string;
  matchCategories: string[];
}

const GROUPS: GroupDefinition[] = [
  {
    id: "classification",
    title: "Classification Models",
    shortLabel: "Classification",
    emoji: "🏷️",
    description: "Discrete class boundaries, probability scoring & decision rules.",
    matchCategories: ["Classification"],
  },
  {
    id: "regression",
    title: "Regression Models",
    shortLabel: "Regression",
    emoji: "📈",
    description: "Continuous numerical estimation and linear & non-linear curves.",
    matchCategories: ["Regression"],
  },
  {
    id: "ensemble",
    title: "Ensemble & Boosting",
    shortLabel: "Ensemble & Boosting",
    emoji: "🌲",
    description: "Bagging, boosting, voting, and stacked multi-model learners.",
    matchCategories: ["Ensemble", "Boosting"],
  },
  {
    id: "clustering",
    title: "Clustering & PCA",
    shortLabel: "Clustering & PCA",
    emoji: "🔵",
    description: "Unsupervised cluster grouping and dimensionality reduction.",
    matchCategories: ["Clustering", "Dimensionality reduction"],
  },
  {
    id: "deep-learning",
    title: "Deep Learning",
    shortLabel: "Deep Learning",
    emoji: "🧠",
    description: "Feedforward artificial neural nets and multi-layer perceptrons.",
    matchCategories: ["Deep learning"],
  },
  {
    id: "optimization",
    title: "Optimization & Fitting",
    shortLabel: "Optimization & Fitting",
    emoji: "🎯",
    description: "Gradient descent learning and parameter regularization.",
    matchCategories: ["Optimization", "Model fitting"],
  },
];

// Helper to get category tag tone
function getCategoryTone(category: string): string {
  const c = category.toLowerCase();
  if (c.includes("regression")) return "tone-blue";
  if (c.includes("classification")) return "tone-emerald";
  if (c.includes("boosting")) return "tone-amber";
  if (c.includes("ensemble")) return "tone-violet";
  if (c.includes("deep") || c.includes("neural")) return "tone-fuchsia";
  if (c.includes("cluster") || c.includes("dimension")) return "tone-cyan";
  return "tone-slate";
}

interface AllVisualizationsGridProps {
  items: VisualizationItem[];
}

export default function AllVisualizationsGrid({
  items,
}: AllVisualizationsGridProps) {
  const [activeLab, setActiveLab] = useState<VisualizationItem | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grouped" | "grid">("grouped");

  // Search filter
  const query = searchQuery.trim().toLowerCase();
  const searchFiltered = useMemo(() => {
    if (!query) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
  }, [items, query]);

  // Active group items
  const activeGroup = GROUPS.find((g) => g.id === selectedGroupId) || null;
  const filteredItems = useMemo(() => {
    if (!activeGroup) return searchFiltered;
    return searchFiltered.filter((item) =>
      activeGroup.matchCategories.includes(item.category)
    );
  }, [searchFiltered, activeGroup]);

  // Categorized bucket structure
  const categorizedSections = useMemo(() => {
    return GROUPS.map((group) => {
      const groupItems = searchFiltered.filter((item) =>
        group.matchCategories.includes(item.category)
      );
      return {
        ...group,
        items: groupItems,
      };
    }).filter((section) => section.items.length > 0);
  }, [searchFiltered]);

  const renderCard = (visualization: VisualizationItem) => {
    const tone = getCategoryTone(visualization.category);
    const content = (
      <>
        {/* Top Header: Badge FIRST, then Title for perfect horizontal alignment */}
        <div className="allVisualizationCardTop">
          <span className={`allVisualizationCardTag ${tone}`}>
            {visualization.category}
          </span>
          <strong title={visualization.name} className="allVisualizationCardTitle">
            {visualization.name}
          </strong>
        </div>

        {/* Center: Illustration */}
        <VisualizationIllustration kind={visualization.kind} />

        {/* Bottom: Action Arrow */}
        {visualization.href ? (
          <i aria-hidden="true">
            <ArrowIcon />
          </i>
        ) : (
          <span className="allVisualizationComingSoon">Coming soon</span>
        )}
      </>
    );

    return visualization.href ? (
      <button
        type="button"
        className="referenceVisualizationCard allVisualizationItem"
        key={visualization.name}
        onClick={() => setActiveLab(visualization)}
        style={{
          textAlign: "left",
          cursor: "pointer",
          border: "none",
          font: "inherit",
        }}
      >
        {content}
      </button>
    ) : (
      <div
        aria-disabled="true"
        className="referenceVisualizationCard referenceVisualizationUnavailable allVisualizationItem"
        key={visualization.name}
      >
        {content}
      </div>
    );
  };

  return (
    <div className="allVisualizationsWrapper">
      {/* ── Polished Unified Control Bar ── */}
      <div className="allVisualizationsControlHub">
        <div className="allVisualizationsToolbar">
          <div className="allVisualizationsSearchWrap">
            <span className="allVisualizationsSearchIcon" aria-hidden="true">
              🔍
            </span>
            <input
              type="search"
              className="allVisualizationsSearchInput"
              placeholder="Search algorithms, models, or topics (e.g. Tree, Boosting, Regression)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="allVisualizationsClearSearch"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="allVisualizationsViewToggle" role="group" aria-label="View layout">
            <button
              type="button"
              className={`allVisualizationsViewBtn${viewMode === "grouped" ? " active" : ""}`}
              onClick={() => setViewMode("grouped")}
              title="Classified by ML domain"
            >
              Categorized
            </button>
            <button
              type="button"
              className={`allVisualizationsViewBtn${viewMode === "grid" ? " active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Single compact grid"
            >
              Compact Grid
            </button>
          </div>
        </div>

        {/* ── Category Filter Pills (Smooth 1-line layout) ── */}
        <div
          className="allVisualizationsFilterRow"
          role="tablist"
          aria-label="Filter models by classification"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedGroupId === null}
            className={`allVisualizationsFilterBtn${selectedGroupId === null ? " active" : ""}`}
            onClick={() => setSelectedGroupId(null)}
          >
            <span className="allVisualizationsFilterEmoji" aria-hidden="true">
              🌐
            </span>
            All
            <span className="allVisualizationsFilterCount">{items.length}</span>
          </button>

          {GROUPS.map((group) => {
            const isActive = selectedGroupId === group.id;
            const count = items.filter((v) =>
              group.matchCategories.includes(v.category)
            ).length;
            return (
              <button
                key={group.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`allVisualizationsFilterBtn${isActive ? " active" : ""}`}
                onClick={() => setSelectedGroupId(isActive ? null : group.id)}
              >
                <span className="allVisualizationsFilterEmoji" aria-hidden="true">
                  {group.emoji}
                </span>
                {group.shortLabel}
                <span className="allVisualizationsFilterCount">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content Presentation ── */}
      {selectedGroupId !== null || viewMode === "grid" ? (
        // Flat Grid (either compact mode or single category selected)
        <div className="allVisualizationsSectionGroup">
          {activeGroup && (
            <header className="allVisualizationsSectionHeader">
              <div className="allVisualizationsSectionTitleWrap">
                <span className="allVisualizationsSectionEmoji" aria-hidden="true">
                  {activeGroup.emoji}
                </span>
                <div>
                  <h2 className="allVisualizationsSectionTitle">{activeGroup.title}</h2>
                  <p className="allVisualizationsSectionDesc">{activeGroup.description}</p>
                </div>
              </div>
              <span className="allVisualizationsSectionCount">
                {filteredItems.length} {filteredItems.length === 1 ? "model" : "models"}
              </span>
            </header>
          )}

          <section
            className="allVisualizationsGrid"
            aria-label="Filtered ModelMind visualizations"
          >
            {filteredItems.length === 0 ? (
              <div className="allVisualizationsEmpty">
                <p>No machine-learning visualizations matched your search.</p>
                <button
                  type="button"
                  className="allVisualizationsResetBtn"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedGroupId(null);
                  }}
                >
                  Reset filters
                </button>
              </div>
            ) : (
              filteredItems.map(renderCard)
            )}
          </section>
        </div>
      ) : (
        // Categorized By Domain (Default & Educational View)
        <div className="allVisualizationsSections">
          {categorizedSections.length === 0 ? (
            <div className="allVisualizationsEmpty">
              <p>No machine-learning visualizations matched your search.</p>
              <button
                type="button"
                className="allVisualizationsResetBtn"
                onClick={() => setSearchQuery("")}
              >
                Reset search
              </button>
            </div>
          ) : (
            categorizedSections.map((section) => (
              <section key={section.id} className="allVisualizationsSectionGroup">
                <header className="allVisualizationsSectionHeader">
                  <div className="allVisualizationsSectionTitleWrap">
                    <span className="allVisualizationsSectionEmoji" aria-hidden="true">
                      {section.emoji}
                    </span>
                    <div>
                      <h2 className="allVisualizationsSectionTitle">{section.title}</h2>
                      <p className="allVisualizationsSectionDesc">{section.description}</p>
                    </div>
                  </div>
                  <span className="allVisualizationsSectionCount">
                    {section.items.length} {section.items.length === 1 ? "model" : "models"}
                  </span>
                </header>

                <div className="allVisualizationsGrid">
                  {section.items.map(renderCard)}
                </div>
              </section>
            ))
          )}
        </div>
      )}

      {/* ── Interactive Modal Lab Viewer ── */}
      <EmbeddedLabViewer
        lab={activeLab}
        onClose={() => setActiveLab(null)}
      />
    </div>
  );
}
