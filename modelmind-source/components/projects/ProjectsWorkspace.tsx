"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

type ProjectStatus = "Planning" | "In progress" | "Completed";
type ProjectFilter = "All projects" | ProjectStatus;

const projectStatuses: ProjectStatus[] = ["Planning", "In progress", "Completed"];
const projectFilters: ProjectFilter[] = ["All projects", ...projectStatuses];

interface ProjectRecord {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  project_data: {
    description?: string;
    status?: ProjectStatus;
    [key: string]: unknown;
  } | null;
}

interface ProjectDraft {
  name: string;
  description: string;
  status: ProjectStatus;
}

async function responseError(response: Response, fallback: string) {
  const result = (await response.json().catch(() => ({}))) as { error?: string };
  return new Error(result.error ?? fallback);
}

async function queryProjects(): Promise<ProjectRecord[]> {
  const response = await fetch("/api/projects", { cache: "no-store" });
  if (!response.ok) {
    throw await responseError(response, "Could not load projects.");
  }
  const result = (await response.json()) as { projects?: ProjectRecord[] };
  return result.projects ?? [];
}

function projectStatus(project: ProjectRecord): ProjectStatus {
  return projectStatuses.includes(project.project_data?.status as ProjectStatus)
    ? project.project_data!.status as ProjectStatus
    : "Planning";
}

function projectDescription(project: ProjectRecord) {
  return typeof project.project_data?.description === "string"
    ? project.project_data.description
    : "";
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function ProjectsWorkspace() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [projectName, setProjectName] = useState("");
  const [projectDescriptionDraft, setProjectDescriptionDraft] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<ProjectFilter>("All projects");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ProjectDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyProjectId, setBusyProjectId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    void queryProjects()
      .then((rows) => {
        if (active) setProjects(rows);
      })
      .catch((loadError: unknown) => {
        if (active) setError(`Could not load projects: ${loadError instanceof Error ? loadError.message : "Please try again."}`);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return projects.filter((project) => {
      const matchesQuery = !query || `${project.name} ${projectDescription(project)}`.toLocaleLowerCase().includes(query);
      const matchesStatus = activeFilter === "All projects" || projectStatus(project) === activeFilter;
      return matchesQuery && matchesStatus;
    });
  }, [activeFilter, projects, search]);

  const counts = useMemo(() => ({
    total: projects.length,
    active: projects.filter((project) => projectStatus(project) === "In progress").length,
    completed: projects.filter((project) => projectStatus(project) === "Completed").length,
  }), [projects]);

  async function refreshProjects() {
    const rows = await queryProjects();
    setProjects(rows);
  }

  async function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = projectName.trim();
    if (!name) return;

    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, description: projectDescriptionDraft.trim() }),
      });
      if (!response.ok) throw await responseError(response, "Request failed.");
      setProjectName("");
      setProjectDescriptionDraft("");
      await refreshProjects();
      setNotice("Project created.");
    } catch (createError) {
      setError(`Could not create this project: ${createError instanceof Error ? createError.message : "Please try again."}`);
    } finally {
      setSaving(false);
    }
  }

  function beginEdit(project: ProjectRecord) {
    setEditingId(project.id);
    setEditDraft({
      name: project.name,
      description: projectDescription(project),
      status: projectStatus(project),
    });
    setError("");
    setNotice("");
  }

  async function updateProject(projectId: string, updates: Partial<ProjectDraft>) {
    setBusyProjectId(projectId);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw await responseError(response, "Request failed.");
      const result = (await response.json()) as { project: ProjectRecord };
      setProjects((current) => current.map((project) => project.id === projectId ? result.project : project));
      setNotice("Project updated.");
      return true;
    } catch (updateError) {
      setError(`Could not update this project: ${updateError instanceof Error ? updateError.message : "Please try again."}`);
      return false;
    } finally {
      setBusyProjectId(null);
    }
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId || !editDraft) return;
    const saved = await updateProject(editingId, {
      name: editDraft.name.trim(),
      description: editDraft.description.trim(),
      status: editDraft.status,
    });
    if (saved) {
      setEditingId(null);
      setEditDraft(null);
    }
  }

  async function changeStatus(project: ProjectRecord, status: ProjectStatus) {
    await updateProject(project.id, { status });
  }

  async function deleteProject(project: ProjectRecord) {
    if (!window.confirm(`Delete “${project.name}”? This removes the project record from your account.`)) return;
    setBusyProjectId(project.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(project.id)}`, { method: "DELETE" });
      if (!response.ok) throw await responseError(response, "Request failed.");
      setProjects((current) => current.filter((row) => row.id !== project.id));
      if (editingId === project.id) {
        setEditingId(null);
        setEditDraft(null);
      }
      setNotice("Project deleted.");
    } catch (deleteError) {
      setError(`Could not delete this project: ${deleteError instanceof Error ? deleteError.message : "Please try again."}`);
    } finally {
      setBusyProjectId(null);
    }
  }

  return (
    <main className="referencePage">
      <section className="referencePanel projectsWorkspace">
        <header className="projectsHeading">
          <div>
            <span className="referenceHeadingIcon" aria-hidden="true">▱</span>
            <div>
              <h1>Your projects</h1>
              <p>Plan experiments, track progress, and keep your work organized.</p>
            </div>
          </div>
          <span className="projectsPrivacy">Private to your account</span>
        </header>

        <div className="projectStats" aria-label="Project summary">
          <div><strong>{counts.total}</strong><span>Total projects</span></div>
          <div><strong>{counts.active}</strong><span>In progress</span></div>
          <div><strong>{counts.completed}</strong><span>Completed</span></div>
        </div>

        <form className="projectsCreateForm" onSubmit={createProject}>
          <div className="projectCreateFields">
            <label className="srOnly" htmlFor="new-project-name">Project name</label>
            <input
              id="new-project-name"
              maxLength={120}
              required
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="For example, Customer Churn Analysis"
            />
            <label className="srOnly" htmlFor="new-project-description">Project goal (optional)</label>
            <input
              id="new-project-description"
              maxLength={1000}
              value={projectDescriptionDraft}
              onChange={(event) => setProjectDescriptionDraft(event.target.value)}
              placeholder="What are you trying to learn or build? (optional)"
            />
          </div>
          <button type="submit" disabled={saving || !projectName.trim()}>
            {saving ? "Creating…" : "Create project"}
          </button>
        </form>

        {error && <p className="projectsMessage projectsError" role="alert">{error}</p>}
        {notice && !error && <p className="projectsMessage projectsSuccess" role="status">{notice}</p>}

        <div className="projectsToolbar">
          <div className="projectsSearchWrap">
            <label className="srOnly" htmlFor="project-search">Search projects</label>
            <span aria-hidden="true">⌕</span>
            <input
              id="project-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search projects"
            />
          </div>
          <div className="projectFilters" role="group" aria-label="Filter projects by status">
            {projectFilters.map((filter) => (
              <button
                aria-pressed={activeFilter === filter}
                className={activeFilter === filter ? "active" : ""}
                key={filter}
                onClick={() => setActiveFilter(filter)}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="projectsMessage" role="status">Loading your projects…</p>
        ) : projects.length === 0 ? (
          <div className="projectsEmptyState">
            <span aria-hidden="true">✦</span>
            <h2>Start your first project</h2>
            <p>Add a name and optional goal above. You can update its status as your work moves forward.</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="projectsEmptyState projectsNoResults">
            <span aria-hidden="true">⌕</span>
            <h2>No matching projects</h2>
            <p>Try a different search or choose another status filter.</p>
            <button type="button" onClick={() => { setSearch(""); setActiveFilter("All projects"); }}>Clear filters</button>
          </div>
        ) : (
          <ul className="projectsList">
            {filteredProjects.map((project) => {
              const status = projectStatus(project);
              const isBusy = busyProjectId === project.id;
              const isEditing = editingId === project.id;
              return (
                <li className="projectCard" key={project.id}>
                  <span className="projectListIcon" aria-hidden="true">▱</span>
                  <div className="projectCardMain">
                    <div className="projectCardHeading">
                      <div>
                        <strong>{project.name}</strong>
                        <small>Created {formatDate(project.created_at)} · Updated {formatDate(project.updated_at)}</small>
                      </div>
                      <label className={`projectStatus projectStatus${status.replaceAll(" ", "")}`}>
                        <span className="srOnly">Status for {project.name}</span>
                        <select
                          aria-label={`Status for ${project.name}`}
                          disabled={isBusy}
                          value={status}
                          onChange={(event) => void changeStatus(project, event.target.value as ProjectStatus)}
                        >
                          {projectStatuses.map((item) => <option key={item}>{item}</option>)}
                        </select>
                      </label>
                    </div>
                    {projectDescription(project) && <p className="projectCardDescription">{projectDescription(project)}</p>}
                    <div className="projectCardActions">
                      <button type="button" disabled={isBusy} onClick={() => isEditing ? (setEditingId(null), setEditDraft(null)) : beginEdit(project)}>
                        {isEditing ? "Cancel edit" : "Edit details"}
                      </button>
                      <button className="projectDeleteButton" type="button" disabled={isBusy} onClick={() => void deleteProject(project)}>
                        {isBusy ? "Saving…" : "Delete"}
                      </button>
                    </div>
                    {isEditing && editDraft && (
                      <form className="projectEditForm" onSubmit={saveEdit}>
                        <label>
                          Project name
                          <input maxLength={120} required value={editDraft.name} onChange={(event) => setEditDraft({ ...editDraft, name: event.target.value })} />
                        </label>
                        <label>
                          Project goal
                          <textarea maxLength={1000} rows={3} value={editDraft.description} onChange={(event) => setEditDraft({ ...editDraft, description: event.target.value })} />
                        </label>
                        <label>
                          Status
                          <select value={editDraft.status} onChange={(event) => setEditDraft({ ...editDraft, status: event.target.value as ProjectStatus })}>
                            {projectStatuses.map((item) => <option key={item}>{item}</option>)}
                          </select>
                        </label>
                        <button type="submit" disabled={isBusy || !editDraft.name.trim()}>{isBusy ? "Saving…" : "Save changes"}</button>
                      </form>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <p className="projectsFootnote">
          Project names, goals, and status are stored in your ModelMind account. Notebook files and runtime are not cloud-synced yet.
        </p>
      </section>
    </main>
  );
}
