"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Database, Search, Sparkles, X } from "lucide-react";

import ProjectsWorkspace from "@/components/projects/ProjectsWorkspace";
import DocumentationLibrary from "@/components/documentation/DocumentationLibrary";
import OpenJupyterForm from "@/components/notebook/OpenJupyterForm";
import EmbeddedLabViewer from "@/components/visualization/EmbeddedLabViewer";
import { visualizations } from "@/lib/visualizations";
import type { VisualizationItem } from "@/lib/visualizations";
import type { Workspace } from "./Sidebar";

const ROADMAP_URL =
  "https://modelmind-personalized.divyanshmaheshwari617.workers.dev/";
const VIDEOGPT_URL = "https://video-analysis-amber-pi.vercel.app/";
const PRACTICE_REPOSITORY_URL =
  "https://github.com/divyanshmaheshwari617-cell/ModelMind_more_practise";
const PRACTICE_APP_URL = process.env.NEXT_PUBLIC_PRACTICE_APP_URL?.trim();

const datasetFilters = ["All", "Classification", "Regression", "Clustering", "Time series"] as const;

const datasets = [
  {
    name: "Iris",
    description: "A small, clean first dataset for learning classification and plotting class boundaries.",
    tasks: ["Classification"],
    level: "Beginner",
    source: "UCI Repository",
    href: "https://archive.ics.uci.edu/dataset/53/iris",
  },
  {
    name: "Titanic: Machine Learning from Disaster",
    description: "Predict passenger survival from a mix of numeric and categorical features.",
    tasks: ["Classification"],
    level: "Beginner",
    source: "Kaggle",
    href: "https://www.kaggle.com/competitions/titanic",
  },
  {
    name: "Breast Cancer Wisconsin (Diagnostic)",
    description: "Binary classification from numeric measurements; a useful model comparison dataset.",
    tasks: ["Classification"],
    level: "Beginner",
    source: "UCI Repository",
    href: "https://archive.ics.uci.edu/dataset/17/breast+cancer+wisconsin+diagnostic",
  },
  {
    name: "Adult Census Income",
    description: "Predict an income category from census features; includes categorical fields and missing values.",
    tasks: ["Classification"],
    level: "Practice preprocessing",
    source: "UCI Repository",
    href: "https://archive.ics.uci.edu/dataset/2/adult",
  },
  {
    name: "Bank Marketing",
    description: "Predict whether a client subscribes to a term deposit after a marketing campaign.",
    tasks: ["Classification"],
    level: "Practice preprocessing",
    source: "UCI Repository",
    href: "https://archive.ics.uci.edu/dataset/222/bank+marketing",
  },
  {
    name: "Credit Approval",
    description: "A compact classification dataset with mixed feature types and missing values.",
    tasks: ["Classification"],
    level: "Practice preprocessing",
    source: "UCI Repository",
    href: "https://archive.ics.uci.edu/dataset/27/credit+approval",
  },
  {
    name: "Heart Disease",
    description: "A classic classification exercise with mixed features and missing values.",
    tasks: ["Classification"],
    level: "Practice preprocessing",
    source: "UCI Repository",
    href: "https://archive.ics.uci.edu/dataset/45/heart+disease",
  },
  {
    name: "Student Performance",
    description: "Explore student records and predict final grades as a regression or classification task.",
    tasks: ["Classification", "Regression"],
    level: "Beginner",
    source: "UCI Repository",
    href: "https://archive.ics.uci.edu/dataset/320/student+performance",
  },
  {
    name: "Wine Quality",
    description: "Estimate wine quality from lab measurements; try both score prediction and quality groups.",
    tasks: ["Classification", "Regression"],
    level: "Beginner",
    source: "UCI Repository",
    href: "https://archive.ics.uci.edu/dataset/186/wine+quality",
  },
  {
    name: "California Housing",
    description: "A classic regression dataset for estimating district-level home values from census features.",
    tasks: ["Regression"],
    level: "Beginner",
    source: "scikit-learn",
    href: "https://scikit-learn.org/stable/modules/generated/sklearn.datasets.fetch_california_housing.html",
  },
  {
    name: "Bike Sharing",
    description: "Predict bike rental counts from weather, season, and calendar features.",
    tasks: ["Regression", "Time series"],
    level: "Intermediate",
    source: "UCI Repository",
    href: "https://archive.ics.uci.edu/dataset/275/bike+sharing+dataset",
  },
  {
    name: "Online Retail",
    description: "Analyze more than 500,000 transactions for customer grouping and retail patterns.",
    tasks: ["Clustering", "Time series"],
    level: "Intermediate",
    source: "UCI Repository",
    href: "https://archive.ics.uci.edu/dataset/352/online+retail",
  },
];

const roadmaps = [
  {
    name: "College & Exams",
    description:
      "Master ML fundamentals, practical coding and the concepts commonly required in coursework and examinations.",
    count: "50+ topics",
    icon: "◫",
    color: "blue",
  },
  {
    name: "ML Engineer",
    description:
      "Build practical skills in preprocessing, modeling, evaluation, pipelines and end-to-end ML workflows.",
    count: "60+ topics",
    icon: "♧",
    color: "purple",
  },
  {
    name: "Data Scientist",
    description:
      "Develop statistics, EDA, feature engineering, machine learning and data-driven problem-solving skills.",
    count: "55+ topics",
    icon: "▥",
    color: "orange",
  },
  {
    name: "Data Analyst",
    description:
      "Focus on Python, NumPy, Pandas, cleaning, EDA, visualization and statistical analysis.",
    count: "45+ topics",
    icon: "▤",
    color: "blue",
  },
  {
    name: "AI Engineer",
    description:
      "Build strong machine-learning foundations before progressing into broader AI systems.",
    count: "50+ topics",
    icon: "✦",
    color: "yellow",
  },
  {
    name: "Deep Learning",
    description:
      "Build the Python, mathematics and ML foundations required before studying neural networks deeply.",
    count: "45+ topics",
    icon: "✣",
    color: "green",
  },
  {
    name: "Placement Preparation",
    description:
      "Strengthen ML theory, implementation, interview concepts, evaluation and project confidence.",
    count: "65+ topics",
    icon: "▱",
    color: "pink",
  },
  {
    name: "Hackathon",
    description:
      "Prioritize practical preprocessing, model building, evaluation and rapid end-to-end experimentation.",
    count: "40+ topics",
    icon: "⚡",
    color: "orange",
  },
  {
    name: "Build Projects",
    description:
      "Learn concepts through practical workflows and progressively more complete machine-learning projects.",
    count: "50+ topics",
    icon: "⬡",
    color: "lime",
  },
  {
    name: "Custom Goal",
    description:
      "Describe your own objective and let ModelMind personalize the learning path around it.",
    count: "Personalized",
    icon: "◎",
    color: "purple",
  },
];

interface PortalSectionsProps {
  section:
    | "Dashboard"
    | "Roadmap"
    | "Notebook"
    | "Visualizations"
    | "VideoGPT"
    | "Practice"
    | "Datasets"
    | "Projects"
    | "Community"
    | "Documentation";
  onWorkspaceChange: (workspace: Workspace) => void;
  userEmail: string;
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function ExternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

function SectionHeading({
  icon,
  title,
  description,
  tone,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  tone: string;
  action?: React.ReactNode;
}) {
  return (
    <header className={`referenceHeading ${tone}`}>
      <span className="referenceHeadingIcon" aria-hidden="true">
        {icon}
      </span>
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && <div className="referenceHeadingAction">{action}</div>}
    </header>
  );
}

function NotebookPreview() {
  const files = [
    "notebook.ipynb",
    "data.csv",
    "model.py",
    "visualization.ipynb",
    "requirements.txt",
  ];

  return (
    <div className="referenceNotebookEditor" aria-label="Notebook preview">
      <div className="referenceNotebookMenu">
        <span>File</span><span>Edit</span><span>View</span><span>Run</span>
        <span>Kernel</span><span>Help</span>
        <span className="referenceRunAll">▶ Run All</span>
        <span className="referenceKernel">Python 3⌄</span>
      </div>
      <div className="referenceNotebookBody">
        <div className="referenceFiles" aria-label="Notebook files">
          {files.map((file, index) => (
            <span className={index === 0 ? "selected" : ""} key={file}>
              <span aria-hidden="true">♧</span>{file}
            </span>
          ))}
        </div>
        <div className="referenceCode">
          <div className="referenceCodeLine"><i>1</i><code><b>import</b> pandas <b>as</b> pd</code></div>
          <div className="referenceCodeLine"><i>2</i><code><b>import</b> matplotlib.pyplot <b>as</b> plt</code></div>
          <div className="referenceCodeLine referenceCodeBlank"><i>3</i><code /></div>
          <div className="referenceCodeLine"><i>4</i><code><em># Load dataset</em></code></div>
          <div className="referenceCodeLine"><i>5</i><code>df = pd.read_csv(<em>&apos;data.csv&apos;</em>)</code></div>
          <div className="referenceCodeLine"><i>6</i><code>df.head()</code></div>
          <div className="referenceDataTable">
            <table>
              <thead><tr><th></th><th>age</th><th>salary</th><th>experience</th><th>department</th></tr></thead>
              <tbody>
                <tr><td>0</td><td>25</td><td>50000</td><td>2</td><td>IT</td></tr>
                <tr><td>1</td><td>28</td><td>62000</td><td>5</td><td>HR</td></tr>
                <tr><td>2</td><td>32</td><td>75000</td><td>8</td><td>Marketing</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VisualizationIllustration({ kind }: { kind: string }) {
  if (kind === "tree") {
    return (
      <svg className="referenceVisualizationArt" viewBox="0 0 100 82" aria-hidden="true">
        <g className="treeBranches"><path d="M50 17 29 39M50 17l21 22M29 39 17 62M29 39l12 23M71 39 59 62M71 39l12 23" /></g>
        <rect x="42" y="8" width="16" height="13" rx="4" className="treeRoot" />
        <rect x="21" y="33" width="16" height="13" rx="4" className="treeNode" />
        <rect x="63" y="33" width="16" height="13" rx="4" className="treeRoot" />
        <circle cx="17" cy="66" r="6" className="treeNode" />
        <circle cx="41" cy="66" r="6" className="treeLeaf" />
        <circle cx="59" cy="66" r="6" className="treeNode" />
        <circle cx="83" cy="66" r="6" className="treeLeaf" />
      </svg>
    );
  }
  if (kind === "bars") {
    return (
      <svg className="referenceVisualizationArt" viewBox="0 0 110 82" aria-hidden="true">
        <text x="31" y="11">Feature Importance</text>
        {[70, 53, 39, 29, 20, 13].map((width, index) => (
          <g key={width}><text x="0" y={23 + index * 9}>feature{index + 1}</text><rect x="35" y={15 + index * 9} width={width} height="7" rx="1" /></g>
        ))}
      </svg>
    );
  }
  if (kind === "lines") {
    return (
      <svg className="referenceVisualizationArt" viewBox="0 0 110 82" aria-hidden="true">
        <path className="chartAxis" d="M8 8v62h94" />
        <path className="chartRed" d="M12 65c22-3 28-14 44-22s25-19 43-32" />
        <path className="chartBlue" d="M12 68c22-2 32-8 48-16s22-13 39-20" />
      </svg>
    );
  }
  if (kind === "network") {
    return (
      <svg className="referenceVisualizationArt" viewBox="0 0 110 82" aria-hidden="true">
        <g className="networkEdges">
          <path d="M14 22 43 13M14 22 43 39M14 22 43 64M14 41 43 13M14 41 43 39M14 41 43 64M14 60 43 13M14 60 43 39M14 60 43 64M43 13 72 22M43 13 72 60M43 39 72 22M43 39 72 60M43 64 72 22M43 64 72 60M72 22 98 41M72 60 98 41" />
        </g>
        {[ [14,22],[14,41],[14,60],[43,13],[43,39],[43,64],[72,22],[72,60],[98,41] ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.5" />
        ))}
      </svg>
    );
  }
  const clusters = kind === "clusters"
    ? [[26, 45, "#3b82f6"], [53, 25, "#ef4444"], [80, 47, "#16a36a"]]
    : [[28, 42, "#8b5cf6"], [72, 26, "#16a36a"]];
  return (
    <svg className="referenceVisualizationArt" viewBox="0 0 110 82" aria-hidden="true">
      <path className="chartAxis" d="M8 8v62h94" />
      {clusters.flatMap(([cx, cy, color], clusterIndex) =>
        Array.from({ length: kind === "clusters" ? 11 : 15 }, (_, pointIndex) => {
          const angle = pointIndex * 2.4 + clusterIndex;
          const spread = 4 + (pointIndex % 4) * 2.6;
          const pointX = Math.round((Number(cx) + Math.cos(angle) * spread) * 1000) / 1000;
          const pointY = Math.round((Number(cy) + Math.sin(angle) * spread) * 1000) / 1000;
          return <circle key={`${clusterIndex}-${pointIndex}`} cx={pointX} cy={pointY} r="1.8" fill={color as string} />;
        }),
      )}
    </svg>
  );
}

export default function PortalSections({
  section,
  onWorkspaceChange,
  userEmail,
}: PortalSectionsProps) {
  const [activeLab, setActiveLab] = useState<VisualizationItem | null>(null);
  if (section === "Roadmap") {
    return (
      <main className="referencePage">
        <section className="referencePanel referenceRoadmap">
          <SectionHeading
            tone="roadmap"
            icon="◴"
            title="Roadmaps"
            description="Structured learning paths to master in-demand skills from basics to advanced."
            action={<ExternalLink className="referenceViewAll" href={ROADMAP_URL}>View All <ArrowIcon /></ExternalLink>}
          />
          <div className="referenceRoadmapGrid">
            {roadmaps.map((roadmap) => (
              <ExternalLink className={`referenceRoadmapCard ${roadmap.color}`} href={ROADMAP_URL} key={roadmap.name}>
                <span className="referenceRoadmapIcon" aria-hidden="true">{roadmap.icon}</span>
                <span className="referenceRoadmapCopy"><strong>{roadmap.name}</strong><small>{roadmap.description}</small></span>
                <span className="referenceRoadmapFooter"><small>{roadmap.count}</small><i aria-hidden="true"><ArrowIcon /></i></span>
              </ExternalLink>
            ))}
          </div>
        </section>
      </main>
    );
  }

  if (section === "Notebook") {
    return (
      <main className="referencePage">
        <section className="referencePanel referenceNotebook">
          <SectionHeading
            tone="notebook"
            icon={<span className="referenceCodeIcon">&lt;/&gt;</span>}
            title="Notebook"
            description="Write, run and experiment with Python right in your browser."
            action={
              <div className="referenceNotebookActions">
                <OpenJupyterForm
                  className="referencePrimaryLink"
                  notebookType="modelmind"
                >
                  Open ModelMind Notebook <ArrowIcon />
                </OpenJupyterForm>
                <OpenJupyterForm
                  className="referenceSecondaryLink"
                  notebookType="trainer"
                >
                  User&apos;s Notebook <ArrowIcon />
                </OpenJupyterForm>
                <OpenJupyterForm
                  className="referenceSecondaryLink referencePlainNotebookLink"
                  notebookType="plain"
                >
                  ModelMind Notebook · Plain mode <ArrowIcon />
                </OpenJupyterForm>
              </div>
            }
          />
          <div className="referenceNotebookGrid">
            <NotebookPreview />
            <div className="referenceNotebookFeatures">
              <div><span className="featureCube">⬡</span><span><strong>Pre-installed Libraries</strong><small>Pandas, NumPy, Matplotlib, Scikit-learn and more.</small></span></div>
              <div><span className="featureUpload">↑</span><span><strong>Upload Your Data</strong><small>Work with your own datasets instantly.</small></span></div>
              <div><span className="featureShare">↗</span><span><strong>Save &amp; Share Notebooks</strong><small>Keep your work and share with others.</small></span></div>
              <div><span className="featureAssistant">✦</span><span><strong>AI Error Assistant</strong><small>Get instant help for errors and explanations.</small></span></div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (section === "VideoGPT") {
    return <VideoGPT />;
  }

  if (section === "Practice") {
    return <PracticeWorkspace />;
  }

  if (section === "Visualizations") {
    return (
      <main className="referencePage">
        <section className="referencePanel referenceVisualizations">
          <SectionHeading
            tone="visualizations"
            icon={<span className="referenceBarsIcon">▮</span>}
            title="Visualizations"
            description="Explore interactive visualizations for popular machine learning algorithms."
            action={<a className="referenceViewAll" href="/visualizations">View All <ArrowIcon /></a>}
          />
          <div className="referenceVisualizationGrid">
            {visualizations.slice(0, 7).map((item) =>
              item.href ? (
                <button
                  type="button"
                  className="referenceVisualizationCard"
                  key={item.name}
                  onClick={() => setActiveLab(item)}
                  style={{ textAlign: "left", cursor: "pointer", border: "none", font: "inherit", padding: 0, background: "transparent" }}
                >
                  <strong>{item.name}</strong>
                  <VisualizationIllustration kind={item.kind} />
                  <i aria-hidden="true"><ArrowIcon /></i>
                </button>
              ) : (
                <div
                  aria-disabled="true"
                  className="referenceVisualizationCard referenceVisualizationUnavailable"
                  key={item.name}
                >
                  <strong>{item.name}</strong>
                  <VisualizationIllustration kind={item.kind} />
                  <span>Coming soon</span>
                </div>
              ),
            )}
          </div>
        </section>
        <EmbeddedLabViewer lab={activeLab} onClose={() => setActiveLab(null)} />
      </main>
    );
  }

  if (section === "Projects") {
    return <ProjectsWorkspace />;
  }

  if (section === "Datasets") {
    return <DatasetLibrary />;
  }

  if (section === "Documentation") {
    return <DocumentationLibrary />;
  }

  if (section === "Community") {
    const descriptions: Record<string, string> = {
      Community: "Connect with other learners and share what you build.",
    };
    return (
      <main className="referencePage">
        <section className="referencePanel referenceComingSoon">
          <span className="referenceComingSoonIcon">✦</span>
          <h1>{section}</h1>
          <p>{descriptions[section]}</p>
        </section>
      </main>
    );
  }

  return (
    <DashboardHome
      onWorkspaceChange={onWorkspaceChange}
      userEmail={userEmail}
    />
  );
}

function DatasetLibrary() {
  const [activeFilter, setActiveFilter] = useState<(typeof datasetFilters)[number]>("All");
  const [query, setQuery] = useState("");
  const counts = useMemo(() => Object.fromEntries(
    datasetFilters.map((filter) => [
      filter,
      filter === "All" ? datasets.length : datasets.filter((dataset) => dataset.tasks.includes(filter)).length,
    ]),
  ) as Record<(typeof datasetFilters)[number], number>, []);
  const visibleDatasets = datasets.filter((dataset) => {
    const matchesFilter = activeFilter === "All" || dataset.tasks.includes(activeFilter);
    const searchable = `${dataset.name} ${dataset.description} ${dataset.source} ${dataset.level} ${dataset.tasks.join(" ")}`.toLowerCase();
    return matchesFilter && searchable.includes(query.trim().toLowerCase());
  });

  return (
    <main className="referencePage">
      <section className="referencePanel referenceDatasets">
        <SectionHeading
          tone="datasets"
          icon="◫"
          title="Dataset Library"
          description="Start a ModelMind project with trusted datasets for common machine-learning tasks."
          action={
            <ExternalLink className="datasetBrowseLink" href="https://archive.ics.uci.edu/datasets">
              Browse UCI datasets <ArrowIcon />
            </ExternalLink>
          }
        />
        <div className="datasetIntro">
          <div className="datasetIntroCopy">
            <span><Sparkles size={15} /> A good dataset makes a great first project</span>
            <p>Choose a learning goal, explore a trusted source, then bring the downloaded file into your notebook.</p>
          </div>
          <div className="datasetStats" aria-label="Dataset library summary">
            <div><strong>{datasets.length}</strong><span>curated datasets</span></div>
            <div><strong>{datasetFilters.length - 1}</strong><span>ML task types</span></div>
            <div><strong>{new Set(datasets.map((dataset) => dataset.source)).size}</strong><span>trusted sources</span></div>
          </div>
        </div>
        <div className="datasetToolbar">
          <div className="datasetFilters" role="group" aria-label="Filter datasets by task">
            {datasetFilters.map((filter) => (
              <button
                aria-pressed={activeFilter === filter}
                className={activeFilter === filter ? "active" : ""}
                key={filter}
                onClick={() => setActiveFilter(filter)}
                type="button"
              >
                {filter}<span>{counts[filter]}</span>
              </button>
            ))}
          </div>
          <div className="datasetSearch">
            <Search size={16} aria-hidden="true" />
            <input
              aria-label="Search datasets by name, task, or source"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search datasets, tasks, or sources"
              type="search"
              value={query}
            />
            {query && <button type="button" aria-label="Clear search" onClick={() => setQuery("")}><X size={14} /></button>}
          </div>
        </div>
        <div className="datasetResultHeading" aria-live="polite">
          <strong>{visibleDatasets.length} {visibleDatasets.length === 1 ? "dataset" : "datasets"}</strong>
          <span>{activeFilter === "All" ? "Explore the collection" : `${activeFilter} projects`}</span>
        </div>
        {visibleDatasets.length ? <div className="datasetGrid">
          {visibleDatasets.map((dataset) => (
            <ExternalLink className="datasetCard" href={dataset.href} key={dataset.name}>
              <span className="datasetCardTop">
                <span className={`datasetGlyph ${dataset.tasks[0].toLowerCase().replace(" ", "-")}`}><Database size={19} aria-hidden="true" /></span>
                <span className="datasetSource">{dataset.source}</span>
                <span className="datasetArrow" aria-hidden="true"><ArrowUpRight size={16} /></span>
              </span>
              <strong>{dataset.name}</strong>
              <small>{dataset.description}</small>
              <span className="datasetTags">
                {dataset.tasks.map((task) => <span key={task}>{task}</span>)}
                <span>{dataset.level}</span>
              </span>
              <span className="datasetCardAction">Explore dataset <ArrowUpRight size={14} aria-hidden="true" /></span>
            </ExternalLink>
          ))}
        </div> : <div className="datasetEmptyState">
          <span><Search size={21} aria-hidden="true" /></span>
          <strong>No datasets match your search</strong>
          <p>Try another name, task, or source, or clear your filters to see the full collection.</p>
          <button type="button" onClick={() => { setQuery(""); setActiveFilter("All"); }}>Clear search and filters</button>
        </div>}
        <p className="datasetLibraryNote">
          <Database size={14} aria-hidden="true" /> Links open the provider’s dataset page so you can review details and download files. Kaggle may require an account. Upload downloaded CSV files in your notebook.
        </p>
      </section>
    </main>
  );
}

function VideoGPT() {
  const features = [
    { icon: "▤", title: "Full Summary", description: "Get a clear summary of the complete video.", tone: "summary" },
    { icon: "◷", title: "Ask by Timestamp", description: "Jump to the moment behind your question.", tone: "timestamp" },
    { icon: "✦", title: "Key Concepts", description: "Pull out important ideas and formulas.", tone: "concepts" },
    { icon: "✓", title: "Generate Quiz", description: "Practice with questions based on the video.", tone: "quiz" },
    { icon: "▧", title: "Smart Notes", description: "Review chapter-by-chapter study notes.", tone: "notes" },
  ];
  const sections = ["Dashboard", "My Videos", "AI Chat", "Notes & Summaries", "Quizzes", "Flashcards", "Mind Maps", "Bookmarks", "Analytics"];

  return (
    <main className="referencePage">
      <section className="referencePanel referenceVideo">
        <SectionHeading
          tone="video"
          icon="▶"
          title="VideoGPT"
          description="Learn from YouTube videos with summaries, timestamped answers, quizzes, and study notes."
          action={<ExternalLink className="referenceViewAll" href={VIDEOGPT_URL}>Open VideoGPT <ArrowIcon /></ExternalLink>}
        />
        <div className="referenceVideoWorkspace" aria-label="Preview of the VideoGPT learning dashboard">
          <aside className="referenceVideoSidebar" aria-label="VideoGPT navigation preview">
            <div className="referenceVideoBrand"><span>▶</span><div><strong>VideoGPT</strong><small>Understand. Learn. Master.</small></div></div>
            <nav>
              {sections.map((section, index) => (
                <div className={index === 0 ? "active" : ""} key={section}>
                  <span aria-hidden="true">{["⌂", "▣", "▱", "▤", "☷", "▧", "⌘", "♧", "▥"][index]}</span>{section}
                </div>
              ))}
            </nav>
            <div className="referenceVideoProfile"><span>H</span><div><strong>Your learning space</strong><small>Videos, notes & progress</small></div></div>
          </aside>

          <div className="referenceVideoMain">
            <div className="referenceVideoWelcome"><small>YOUR VIDEO LEARNING WORKSPACE</small><h2>What do you want to learn today?</h2></div>
            <div className="referenceVideoAnalyze">
              <strong><span aria-hidden="true">＋</span> Paste a YouTube link to get started</strong>
              <div className="referenceVideoUrlBar"><span>↗</span><span>Paste a YouTube video URL</span><ExternalLink href={VIDEOGPT_URL}>Analyze video <ArrowIcon /></ExternalLink></div>
              <div className="referenceVideoExamples"><span>Try these examples</span><div><b>🚀 System Design</b><b>🐍 Python</b><b>🧠 Machine Learning</b></div></div>
            </div>
            <div className="referenceVideoFeatures" aria-label="VideoGPT learning tools">
              {features.map((feature) => (
                <article className={`referenceVideoFeature ${feature.tone}`} key={feature.title}>
                  <span aria-hidden="true">{feature.icon}</span><strong>{feature.title}</strong><small>{feature.description}</small><i aria-hidden="true">→</i>
                </article>
              ))}
            </div>
            <div className="referenceVideoBottom">
              <div className="referenceVideoTopics">
                <div><strong>Learn from videos you choose</strong><small>Paste a link to turn a lesson, talk, or tutorial into a study session.</small></div>
                <div className="referenceVideoTopicTiles"><span>VIDEO SUMMARY</span><span>KEY TAKEAWAYS</span><span>STUDY NOTES</span></div>
              </div>
              <div className="referenceVideoStudyCard"><span aria-hidden="true">✦</span><strong>Keep learning in one place</strong><small>Revisit videos, ask follow-up questions, and review what you learned.</small><ExternalLink href={VIDEOGPT_URL}>Explore VideoGPT <ArrowIcon /></ExternalLink></div>
            </div>
          </div>

          <aside className="referenceVideoRightRail" aria-label="VideoGPT feature overview">
            <div className="referenceVideoOverview"><strong>🎯 Your Learning Overview</strong><div><span><b>▣</b><strong>Video library</strong><small>Keep analyzed videos together</small></span><span><b>◌</b><strong>Ask questions</strong><small>Get answers from a video</small></span><span><b>✓</b><strong>Practice</strong><small>Quizzes and flashcards</small></span><span><b>▤</b><strong>Review</strong><small>Notes and key moments</small></span></div></div>
            <div className="referenceVideoContinue"><strong>Continue Learning</strong><div className="referenceVideoProgressArt"><span>▶</span><i><b /></i></div><small>Your video, notes, and progress stay together.</small><ExternalLink href={VIDEOGPT_URL}>Open your workspace <ArrowIcon /></ExternalLink></div>
            <div className="referenceVideoAsk"><strong>🔥 Ask anything</strong><small>Ask about a moment, a concept, or a detail from the video.</small><div><span>What happened at this point?</span><b>→</b></div></div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function PracticeWorkspace() {
  const practiceTopics = [
    { name: "Python foundations", detail: "Functions, loops, collections, debugging", tone: "purple" },
    { name: "Data preparation", detail: "NumPy, Pandas, missing values, feature pipelines", tone: "blue" },
    { name: "Machine learning", detail: "Regression, classification, trees, clustering", tone: "green" },
    { name: "Model evaluation", detail: "Metrics, validation, tuning, responsible deployment", tone: "orange" },
  ];

  return (
    <main className="referencePage">
      <section className="referencePanel referencePractice">
        <SectionHeading
          tone="practice"
          icon="✎"
          title="Practice Studio"
          description="Build confidence with guided Python, data science, and machine-learning questions."
          action={
            <ExternalLink className="referenceViewAll" href={PRACTICE_APP_URL || PRACTICE_REPOSITORY_URL}>
              {PRACTICE_APP_URL ? "Start practicing" : "View practice project"} <ArrowIcon />
            </ExternalLink>
          }
        />

        <div className="practiceIntro">
          <div>
            <span className="practiceEyebrow">LEARN BY DOING</span>
            <h2>One question at a time. Real progress at your pace.</h2>
            <p>
              The separate ModelMind practice project contains 417 questions across programming, data analysis, and machine learning. Choose a topic, try a problem, then move up in difficulty.
            </p>
          </div>
          <div className="practiceMetrics" aria-label="Practice question bank facts">
            <div><strong>417</strong><span>questions in the practice project</span></div>
            <div><strong>14</strong><span>coding questions with automated tests</span></div>
          </div>
        </div>

        <div className="practiceTopicGrid">
          {practiceTopics.map((topic, index) => (
            <article className={`practiceTopicCard ${topic.tone}`} key={topic.name}>
              <span className="practiceTopicNumber">0{index + 1}</span>
              <div><h3>{topic.name}</h3><p>{topic.detail}</p></div>
              <span className="practiceTopicArrow" aria-hidden="true"><ArrowIcon /></span>
            </article>
          ))}
        </div>

        <div className="practiceNextStep">
          <div>
            <span className="practiceEyebrow">YOUR WORKSPACE</span>
            <h2>Want to solve a question in Jupyter?</h2>
            <p>Open a plain notebook for coding practice. It hides ModelMind AI and ML Studio tools for that notebook.</p>
          </div>
          <OpenJupyterForm className="practiceNotebookButton" notebookType="plain">
            Open ModelMind Notebook · Plain mode <ArrowIcon />
          </OpenJupyterForm>
        </div>

        {!PRACTICE_APP_URL && (
          <p className="practiceConnectionNote" role="note">
            The practice repository has no published app URL yet. The project link above opens its source; set <code>NEXT_PUBLIC_PRACTICE_APP_URL</code> after deploying the practice app to make this a direct launch button.
          </p>
        )}
        <p className="practiceSafetyNote">
          Automated code evaluation is currently local-development only in the practice project. Its README warns that the runner is not isolated for public internet use; only 14 coding questions have tests today, while other questions are self-practice.
        </p>
      </section>
    </main>
  );
}

function DashboardHome({
  onWorkspaceChange,
  userEmail,
}: {
  onWorkspaceChange: (workspace: Workspace) => void;
  userEmail: string;
}) {
  const firstName = userEmail.split("@")[0]?.split(/[._-]/)[0] || "Learner";
  const displayName =
    firstName.charAt(0).toUpperCase() + firstName.slice(1);

  return (
    <main className="referencePage referenceHome referenceDashboardHome">
      <header className="homeWelcome">
        <div>
          <h1>Welcome back, <span>{displayName}</span> <span aria-hidden="true">👋</span></h1>
          <p>Your AI learning workspace is ready. Keep your momentum going.</p>
        </div>
        <div className="homeWelcomeActions">
          <span className="homeDate"><span aria-hidden="true">✦</span>YOUR WORKSPACE</span>
          <button type="button" onClick={() => onWorkspaceChange("Notebook")}>
            <span aria-hidden="true">＋</span> New Project
          </button>
        </div>
      </header>

      <section className="homeMetricGrid" aria-label="Your learning workspace">
        <button type="button" onClick={() => onWorkspaceChange("Roadmap")}>
          <span className="homeMetricIcon metricPurple">♧</span>
          <span><strong>Learning paths</strong><b>{roadmaps.length}</b><small>Guided roadmaps to explore</small></span>
          <span className="metricArrow">›</span>
        </button>
        <button type="button" onClick={() => onWorkspaceChange("Notebook")}>
          <span className="homeMetricIcon metricOrange">▤</span>
          <span><strong>Datasets</strong><b>Ready for yours</b><small>Upload data in your notebook</small></span>
          <span className="metricArrow">›</span>
        </button>
        <button type="button" onClick={() => onWorkspaceChange("Visualizations")}>
          <span className="homeMetricIcon metricGreen">▥</span>
          <span><strong>Visualizations</strong><b>7 featured labs</b><small>Explore popular algorithms</small></span>
          <span className="metricArrow">›</span>
        </button>
        <button type="button" onClick={() => onWorkspaceChange("Notebook")}>
          <span className="homeMetricIcon metricBlue">▱</span>
          <span><strong>Projects</strong><b>Your next idea</b><small>Start building in a notebook</small></span>
          <span className="metricArrow">›</span>
        </button>
      </section>

      <section className="homeMiddleGrid">
        <div className="homeContentCard homeRecentCard">
          <HomeSectionHeading icon="◷" title="Suggested next steps" action="Explore" onClick={() => onWorkspaceChange("Roadmap")} />
          <div className="homeRecentList">
            <button type="button" onClick={() => onWorkspaceChange("Roadmap")}>
              <span className="recentIcon recentPurple">◫</span>
              <span className="recentCopy"><strong>Machine Learning Roadmap</strong><small>Recommended path · Learn at your pace</small></span>
              <span className="recentAction">Continue <ArrowIcon /></span>
            </button>
            <button type="button" onClick={() => onWorkspaceChange("Notebook")}>
              <span className="recentIcon recentOrange">▤</span>
              <span className="recentCopy"><strong>Start a notebook</strong><small>Write and run your first Python cells</small></span>
              <span className="recentAction">Open <ArrowIcon /></span>
            </button>
            <button type="button" onClick={() => onWorkspaceChange("Visualizations")}>
              <span className="recentIcon recentGreen">⬡</span>
              <span className="recentCopy"><strong>Explore model visualizations</strong><small>PCA · Clustering · Decision trees</small></span>
              <span className="recentStatus"><i /> Ready</span>
              <span className="recentAction">Open <ArrowIcon /></span>
            </button>
          </div>
        </div>

        <div className="homeContentCard homeQuickCard">
          <HomeSectionHeading icon="ϟ" title="Quick launch" action="View all" onClick={() => onWorkspaceChange("Notebook")} />
          <div className="quickLaunchGrid">
            <QuickLaunch icon="</>" tone="purple" title="Open Notebook" description="Write, run and experiment with Python." onClick={() => onWorkspaceChange("Notebook")} />
            <QuickLaunch icon="♧" tone="orange" title="Explore Algorithms" description="Visualize popular ML algorithms." onClick={() => onWorkspaceChange("Visualizations")} />
            <QuickLaunch icon="▤" tone="green" title="Browse Datasets" description="Bring your own data to a notebook." onClick={() => onWorkspaceChange("Notebook")} />
            <QuickLaunch icon="▷" tone="purple" title="Ask VideoGPT" description="Turn questions into clear explanations." onClick={() => onWorkspaceChange("VideoGPT")} />
          </div>
        </div>
      </section>

      <section className="homeBottomGrid">
        <div className="homeContentCard homeExploreCard">
          <HomeSectionHeading icon="▥" title="Explore visualizations" description="Interactive visualizations for popular machine-learning algorithms." action="View all" onClick={() => onWorkspaceChange("Visualizations")} />
          <div className="homeVisualizationGrid">
            {visualizations.filter((item): item is typeof item & { href: string } => Boolean(item.href)).slice(0, 4).map((item) => (
              <ExternalLink className="homeVisualizationTile" href={item.href} key={item.name}>
                <strong>{item.name}</strong>
                <VisualizationIllustration kind={item.kind} />
                <i aria-hidden="true"><ArrowIcon /></i>
              </ExternalLink>
            ))}
          </div>
        </div>
        <div className="homeContentCard homeVideoCard">
          <HomeSectionHeading icon="▶" title="VideoGPT spotlight" action="View all" onClick={() => onWorkspaceChange("VideoGPT")} />
          <div className="videoSpotlight">
            <div className="videoSpotlightCopy">
              <strong>Make complex AI concepts click.</strong>
              <p>Get clear, visual explanations with VideoGPT.</p>
              <div><span>Explain PCA in 60 seconds</span><span>How does a decision tree work?</span></div>
              <ExternalLink href={VIDEOGPT_URL}>Try VideoGPT <ArrowIcon /></ExternalLink>
            </div>
            <ExternalLink className="videoSpotlightScreen" href={VIDEOGPT_URL} aria-label="Open VideoGPT">
              <span>▶</span><i>✦</i>
            </ExternalLink>
          </div>
        </div>
      </section>

      <section className="homeContentCard homeLearningPaths">
        <HomeSectionHeading icon="♧" title="Choose your learning path" description="Explore a guided roadmap and find your next topic." action="All roadmaps" onClick={() => onWorkspaceChange("Roadmap")} />
        <div className="homeLearningPathGrid">
          {roadmaps.slice(0, 4).map((roadmap) => (
            <button type="button" key={roadmap.name} onClick={() => onWorkspaceChange("Roadmap")}>
              <span className={`learningPathIcon ${roadmap.color}`}>{roadmap.icon}</span>
              <span className="learningPathCopy">
                <strong>{roadmap.name}</strong>
                <small>{roadmap.description}</small>
                <b>{roadmap.count}</b>
              </span>
              <span className="metricArrow" aria-hidden="true">›</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

function HomeSectionHeading({
  icon,
  title,
  description,
  action,
  onClick,
}: {
  icon: string;
  title: string;
  description?: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <header className="homeSectionHeading">
      <span aria-hidden="true">{icon}</span>
      <div><h2>{title}</h2>{description && <p>{description}</p>}</div>
      <button type="button" onClick={onClick}>{action}<ArrowIcon /></button>
    </header>
  );
}

function QuickLaunch({
  icon,
  tone,
  title,
  description,
  onClick,
}: {
  icon: string;
  tone: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button className="quickLaunchTile" type="button" onClick={onClick}>
      <span className={`quickLaunchIcon ${tone}`}>{icon}</span>
      <span><strong>{title}</strong><small>{description}</small></span>
      <span className="quickLaunchArrow">›</span>
    </button>
  );
}
