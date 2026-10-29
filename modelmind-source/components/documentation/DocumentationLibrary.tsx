"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, BookOpen, Search, X } from "lucide-react";

import { visualizations } from "@/lib/visualizations";

const mlResources = [
  {
    title: "Machine Learning Crash Course",
    source: "Google for Developers",
    description: "A practical introduction with interactive lessons, exercises, and model concepts.",
    href: "https://developers.google.com/machine-learning/crash-course",
    icon: "✦",
  },
  {
    title: "scikit-learn: Getting started",
    source: "scikit-learn",
    description: "Build a first model and learn preprocessing, pipelines, cross-validation, and prediction.",
    href: "https://scikit-learn.org/stable/getting_started.html",
    icon: "◈",
  },
  {
    title: "Prepare your data",
    source: "scikit-learn User Guide",
    description: "Learn scaling, encoding, imputation, feature extraction, and preprocessing pipelines.",
    href: "https://scikit-learn.org/stable/modules/preprocessing.html",
    icon: "⌁",
  },
  {
    title: "Evaluate models",
    source: "scikit-learn User Guide",
    description: "Understand classification and regression metrics, scoring, and model evaluation.",
    href: "https://scikit-learn.org/stable/modules/model_evaluation.html",
    icon: "◫",
  },
  {
    title: "Cross-validation",
    source: "scikit-learn User Guide",
    description: "Estimate how well a model generalizes with train/test splits and cross-validation.",
    href: "https://scikit-learn.org/stable/modules/cross_validation.html",
    icon: "⟳",
  },
  {
    title: "pandas tutorials",
    source: "pandas",
    description: "Read tables, select columns, clean data, summarize values, and work with time series.",
    href: "https://pandas.pydata.org/docs/getting_started/intro_tutorials/index.html",
    icon: "▦",
  },
  {
    title: "NumPy quickstart",
    source: "NumPy",
    description: "Get comfortable with arrays, shapes, axes, and the core numerical building blocks.",
    href: "https://numpy.org/doc/stable/user/quickstart.html",
    icon: "∑",
  },
  {
    title: "Matplotlib tutorials",
    source: "Matplotlib",
    description: "Learn to create, customize, and combine charts for exploring data and model behavior.",
    href: "https://matplotlib.org/stable/tutorials/index.html",
    icon: "▥",
  },
];

const visualizationFilters = ["All visualizations", ...new Set(visualizations.map((item) => item.category))];

export default function DocumentationLibrary() {
  const [activeFilter, setActiveFilter] = useState("All visualizations");
  const [search, setSearch] = useState("");

  const visibleVisualizations = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return visualizations.filter((item) => {
      const matchesCategory = activeFilter === "All visualizations" || item.category === activeFilter;
      const matchesSearch = !query || `${item.name} ${item.category} ${item.description}`.toLocaleLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeFilter, search]);
  const filterCounts = useMemo(() => Object.fromEntries(
    visualizationFilters.map((filter) => [
      filter,
      filter === "All visualizations"
        ? visualizations.length
        : visualizations.filter((item) => item.category === filter).length,
    ]),
  ) as Record<string, number>, []);

  return (
    <main className="referencePage">
      <section className="referencePanel documentationWorkspace">
        <header className="documentationHeading">
          <span className="referenceHeadingIcon" aria-hidden="true"><BookOpen size={25} /></span>
          <div>
            <h1>Machine Learning Documentation</h1>
            <p>Trusted learning resources and official concept guides for every ModelMind visualization.</p>
          </div>
          <span className="documentationCount">{visualizations.length} visualization guides</span>
        </header>

        <section className="documentationSection" aria-labelledby="ml-foundations-heading">
          <div className="documentationSectionHeading">
            <div>
              <h2 id="ml-foundations-heading">ML foundations</h2>
              <p>Start with data, model building, and evaluation.</p>
            </div>
          </div>
          <div className="mlResourceGrid">
            {mlResources.map((resource) => (
              <a className="mlResourceCard" href={resource.href} key={resource.title} rel="noopener noreferrer" target="_blank">
                <span className="mlResourceIcon" aria-hidden="true">{resource.icon}</span>
                <span className="mlResourceCopy">
                  <small>{resource.source}</small>
                  <strong>{resource.title}</strong>
                  <span>{resource.description}</span>
                </span>
              <span className="documentationArrow" aria-hidden="true"><ArrowUpRight size={18} /></span>
              </a>
            ))}
          </div>
        </section>

        <section className="documentationSection" aria-labelledby="visualization-guides-heading">
          <div className="documentationSectionHeading documentationVisualizationHeading">
            <div>
              <h2 id="visualization-guides-heading">Visualization guides</h2>
              <p>Each guide matches a visualization available in ModelMind.</p>
            </div>
            <div className="documentationSearch">
              <Search size={17} aria-hidden="true" />
              <input aria-label="Search visualization guides" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search algorithms" type="search" />
              {search && <button type="button" aria-label="Clear search" onClick={() => setSearch("")}><X size={15} /></button>}
            </div>
          </div>
          <div className="documentationFilters" role="group" aria-label="Filter visualizations by category">
            {visualizationFilters.map((filter) => (
              <button
                aria-pressed={activeFilter === filter}
                className={activeFilter === filter ? "active" : ""}
                key={filter}
                onClick={() => setActiveFilter(filter)}
                type="button"
              >
                {filter}<span>{filterCounts[filter]}</span>
              </button>
            ))}
          </div>
          <div className="documentationResults" aria-live="polite">
            <strong>{visibleVisualizations.length} {visibleVisualizations.length === 1 ? "guide" : "guides"}</strong>
            <span>{activeFilter === "All visualizations" ? "Browse every ModelMind visualization" : activeFilter}</span>
          </div>
          {visibleVisualizations.length > 0 ? (
            <div className="visualizationGuideGrid">
              {visibleVisualizations.map((item) => (
                <article className="visualizationGuideCard" key={item.name}>
                  <span className="visualizationGuideCategory">{item.category}</span>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <div>
                    <a href={item.docsHref} rel="noopener noreferrer" target="_blank">Read concept guide <ArrowUpRight size={14} aria-hidden="true" /></a>
                    {item.href && <a href={item.href} rel="noopener noreferrer" target="_blank">Open visualizer <ArrowUpRight size={14} aria-hidden="true" /></a>}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="documentationNoResults">
              <strong>No visualization guides found</strong>
              <span>Try a different search or category.</span>
              <button type="button" onClick={() => { setSearch(""); setActiveFilter("All visualizations"); }}>Clear filters</button>
            </div>
          )}
          <p className="documentationNote">Concept guides open the official library or algorithm documentation. Visualization links open the matching ModelMind tool in a new tab.</p>
        </section>
      </section>
    </main>
  );
}
