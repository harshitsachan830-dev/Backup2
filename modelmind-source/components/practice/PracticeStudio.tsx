"use client";

import { useState, useEffect, useMemo } from "react";
import { ArrowRight, Search, Code, CheckCircle2, Copy, Check, Terminal, BookOpen, Calculator, Bug, Sparkles } from "lucide-react";

import OpenJupyterForm from "@/components/notebook/OpenJupyterForm";

interface PracticeQuestion {
  id: string;
  topic: string;
  level: "Basic" | "Medium" | "Advanced";
  type: "Coding" | "Debugging" | "Mathematics" | "Concept" | "Model / Algorithm" | "Real-world ML" | "Architecture";
  title: string;
  question: string;
  starterCode?: string;
  tags?: string[];
  options?: string[];
  correctOption?: number;
  gradingMode?: string;
}

const PRACTICE_AREAS = [
  {
    number: "01",
    title: "Python foundations",
    description: "Functions, loops, collections, algorithms & debugging",
    tone: "purple",
    topics: ["Python", "Python Fundamentals", "Python Functions & OOP", "Python Algorithms"],
  },
  {
    number: "02",
    title: "Data preparation",
    description: "NumPy, Pandas, cleaning, feature pipelines & scaling",
    tone: "blue",
    topics: ["NumPy", "Pandas", "Data Cleaning", "Preprocessing", "Preprocessing & Encoding", "Pipelines & ColumnTransformer"],
  },
  {
    number: "03",
    title: "Machine learning",
    description: "Regression, classification, decision trees, ensembles & clustering",
    tone: "green",
    topics: ["Linear Regression", "Logistic Regression", "Decision Tree", "Random Forest", "Ensemble Learning", "XGBoost", "K-Means", "SVM"],
  },
  {
    number: "04",
    title: "Model evaluation",
    description: "Cross-validation, metrics, tuning, drift & ML deployment",
    tone: "orange",
    topics: ["Cross Validation", "Metrics", "Classification Metrics", "Regression Metrics", "Hyperparameter Tuning", "Model Monitoring / Drift", "ML Deployment"],
  },
];

export default function PracticeStudio() {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedId, setSelectedId] = useState<string>("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [userCode, setUserCode] = useState("");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    fetch("/modelmind-practice-questions.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load questions");
        return res.json();
      })
      .then((data: PracticeQuestion[]) => {
        setQuestions(data);
        if (data.length > 0) {
          setSelectedId(data[0].id);
          setUserCode(data[0].starterCode || "");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading questions:", err);
        setLoading(false);
      });
  }, []);

  const allTopics = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => {
      if (q.topic) set.add(q.topic);
    });
    return Array.from(set).sort();
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (selectedLevel !== "all" && q.level.toLowerCase() !== selectedLevel.toLowerCase()) {
        return false;
      }
      if (selectedType !== "all" && q.type.toLowerCase() !== selectedType.toLowerCase()) {
        return false;
      }
      if (selectedTopic !== "all") {
        const area = PRACTICE_AREAS.find((a) => a.title.toLowerCase() === selectedTopic.toLowerCase());
        if (area) {
          if (!area.topics.some((t) => q.topic.toLowerCase().includes(t.toLowerCase()))) {
            return false;
          }
        } else if (q.topic.toLowerCase() !== selectedTopic.toLowerCase()) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = q.title.toLowerCase().includes(query);
        const matchesPrompt = q.question.toLowerCase().includes(query);
        const matchesTopic = q.topic.toLowerCase().includes(query);
        const matchesTags = q.tags?.some((t) => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesPrompt && !matchesTopic && !matchesTags) {
          return false;
        }
      }
      return true;
    });
  }, [questions, selectedLevel, selectedType, selectedTopic, searchQuery]);

  const activeQuestion = useMemo(() => {
    return questions.find((q) => q.id === selectedId) || filteredQuestions[0] || questions[0];
  }, [questions, selectedId, filteredQuestions]);

  const handleSelectQuestion = (q: PracticeQuestion) => {
    setSelectedId(q.id);
    setUserCode(q.starterCode || "");
    setSelectedOption(null);
  };

  const handleCopyCode = () => {
    if (activeQuestion?.starterCode) {
      navigator.clipboard.writeText(activeQuestion.starterCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Coding":
        return <Code className="w-3.5 h-3.5" />;
      case "Debugging":
        return <Bug className="w-3.5 h-3.5" />;
      case "Mathematics":
        return <Calculator className="w-3.5 h-3.5" />;
      default:
        return <BookOpen className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="practiceStudio" style={{ display: "grid", gap: "24px" }}>
      {/* Header Banner */}
      <section className="practiceStudioHeader">
        <div>
          <span className="practiceEyebrow">PRACTICE & MASTERY</span>
          <h2>ModelMind Practice Studio</h2>
          <p>
            Master machine learning and data science with {questions.length > 0 ? questions.length.toLocaleString() : "2,251"}{" "}
            curated questions. Solve exercises here or open the dedicated Practice Notebook with built-in Ollama & Gemini AI checking.
          </p>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div className="practiceStudioStats">
            <strong>{questions.length > 0 ? questions.length.toLocaleString() : "2,251"}</strong>
            <span>Guided Questions Across 100+ Topics</span>
          </div>
          <OpenJupyterForm className="practiceLaunchButton" notebookType="practice">
            Open Practice Notebook <ArrowRight aria-hidden="true" />
          </OpenJupyterForm>
        </div>
      </section>

      {/* 4 Topic Quick-Filter Cards */}
      <section className="practiceTopicGrid" aria-label="Practice areas">
        {PRACTICE_AREAS.map((area) => {
          const isSelected = selectedTopic.toLowerCase() === area.title.toLowerCase();
          return (
            <article
              className={`practiceTopicCard ${area.tone}`}
              key={area.number}
              onClick={() => setSelectedTopic(isSelected ? "all" : area.title)}
              style={{
                cursor: "pointer",
                outline: isSelected ? "2px solid #7c3aed" : "none",
                transform: isSelected ? "scale(1.02)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              <span className="practiceTopicNumber">{area.number}</span>
              <span className="practiceTopicArrow" aria-hidden="true">
                <ArrowRight />
              </span>
              <div>
                <h3>{area.title}</h3>
                <p>{area.description}</p>
                <small style={{ color: "#7c3aed", fontWeight: 700, marginTop: "4px", display: "block" }}>
                  {isSelected ? "✓ Active Filter" : "Click to browse area"}
                </small>
              </div>
            </article>
          );
        })}
      </section>

      {/* Interactive Question Explorer & Workbench */}
      <section className="practiceStudioLayout">
        {/* Left Rail: Search & Filter */}
        <aside className="practiceQuestionRail">
          <div className="practiceFilterHeader">
            <strong>Questions ({filteredQuestions.length.toLocaleString()})</strong>
            <span>{selectedTopic !== "all" ? selectedTopic : "All Topics"}</span>
          </div>

          {/* Search Bar */}
          <div className="practiceSearch">
            <Search className="w-4 h-4" />
            <input
              type="text"
              placeholder="Search by title, topic, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "11px" }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Topic Dropdown */}
          <label className="practiceFilterLabel">
            Topic
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
            >
              <option value="all">All Topics ({questions.length.toLocaleString()})</option>
              <optgroup label="Learning Areas">
                {PRACTICE_AREAS.map((area) => (
                  <option key={area.number} value={area.title}>
                    {area.title}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Detailed Topics">
                {allTopics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>

          {/* Level Filter Chips */}
          <div className="practiceFilterLabel">
            Difficulty
            <div className="practiceLevelFilters">
              {["all", "Basic", "Medium", "Advanced"].map((level) => (
                <button
                  type="button"
                  key={level}
                  className={selectedLevel.toLowerCase() === level.toLowerCase() ? "active" : ""}
                  onClick={() => setSelectedLevel(level)}
                >
                  {level === "all" ? "All Levels" : level}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter Chips */}
          <div className="practiceFilterLabel">
            Format
            <div className="practiceLevelFilters">
              {["all", "Coding", "Concept", "Mathematics", "Debugging"].map((t) => (
                <button
                  type="button"
                  key={t}
                  className={selectedType.toLowerCase() === t.toLowerCase() ? "active" : ""}
                  onClick={() => setSelectedType(t)}
                >
                  {t === "all" ? "All Formats" : t}
                </button>
              ))}
            </div>
          </div>

          {/* Question List */}
          <div className="practiceQuestionList">
            {loading ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#888", fontSize: "12px" }}>
                Loading questions bank...
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#888", fontSize: "12px" }}>
                No questions match your filter.
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedTopic("all");
                    setSelectedLevel("all");
                    setSelectedType("all");
                  }}
                  style={{
                    display: "block",
                    margin: "8px auto 0",
                    padding: "4px 8px",
                    background: "#7c3aed",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "10px",
                    cursor: "pointer",
                  }}
                >
                  Reset filters
                </button>
              </div>
            ) : (
              filteredQuestions.map((q, idx) => {
                const isSelected = activeQuestion?.id === q.id;
                return (
                  <button
                    type="button"
                    key={q.id}
                    className={`practiceQuestionItem ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSelectQuestion(q)}
                  >
                    <span className="practiceQuestionNumber">{String(idx + 1).padStart(3, "0")}</span>
                    <div className="practiceQuestionItemBody">
                      <b>{q.title}</b>
                      <small>
                        {q.topic} • {q.level} • {q.type}
                      </small>
                    </div>
                    {isSelected && <CheckCircle2 />}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Workbench: Question Detail & Code Runner */}
        <main className="practiceWorkbench">
          {activeQuestion ? (
            <>
              {/* Question Header & Badges */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                <div className="practiceQuestionMeta">
                  <span style={{ background: "#7c3aed", color: "#fff" }}>{activeQuestion.topic}</span>
                  <span
                    style={{
                      background:
                        activeQuestion.level === "Advanced"
                          ? "#fee2e2"
                          : activeQuestion.level === "Medium"
                          ? "#fef3c7"
                          : "#dcfce7",
                      color:
                        activeQuestion.level === "Advanced"
                          ? "#991b1b"
                          : activeQuestion.level === "Medium"
                          ? "#92400e"
                          : "#166534",
                    }}
                  >
                    {activeQuestion.level}
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    {getTypeIcon(activeQuestion.type)}
                    {activeQuestion.type}
                  </span>
                  {activeQuestion.gradingMode && (
                    <span style={{ color: "#6b7280", background: "#f3f4f6" }}>
                      Mode: {activeQuestion.gradingMode}
                    </span>
                  )}
                </div>

                <OpenJupyterForm className="practiceHeadingLaunch" notebookType="practice">
                  Solve in Notebook <ArrowRight aria-hidden="true" style={{ width: "13px", height: "13px" }} />
                </OpenJupyterForm>
              </div>

              {/* Title & Prompt */}
              <div>
                <h3>{activeQuestion.title}</h3>
                <p className="practicePrompt" style={{ marginTop: "12px" }}>
                  {activeQuestion.question}
                </p>
              </div>

              {/* Tags */}
              {activeQuestion.tags && activeQuestion.tags.length > 0 && (
                <div className="practiceTags">
                  {activeQuestion.tags.map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </div>
              )}

              {/* Multiple Choice Options if applicable */}
              {activeQuestion.options && activeQuestion.options.length > 0 && (
                <fieldset className="practiceAnswerChoices">
                  <legend>Select the correct answer:</legend>
                  {activeQuestion.options.map((opt, optIdx) => {
                    const isPicked = selectedOption === optIdx;
                    return (
                      <label
                        key={optIdx}
                        style={{
                          padding: "10px 14px",
                          borderRadius: "8px",
                          background: isPicked ? "#f3e8ff" : "#fff",
                          border: isPicked ? "1px solid #a855f7" : "1px solid #e5e7eb",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <input
                          type="radio"
                          name="question_choice"
                          checked={isPicked}
                          onChange={() => setSelectedOption(optIdx)}
                        />
                        <span>
                          <strong>{String.fromCharCode(65 + optIdx)}.</strong> {opt}
                        </span>
                      </label>
                    );
                  })}
                </fieldset>
              )}

              {/* Code Editor Area for Coding & Debugging */}
              {activeQuestion.starterCode && (
                <div className="practiceCodeArea">
                  <div>
                    <span>
                      <Terminal className="w-4 h-4" /> Python Solution Editor
                    </span>
                    <button type="button" onClick={handleCopyCode}>
                      {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedCode ? "Copied!" : "Copy Starter"}
                    </button>
                  </div>
                  <textarea
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    placeholder="# Write your Python solution here..."
                    spellCheck={false}
                  />
                </div>
              )}

              {/* AI Guidance Card */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #f5f3ff, #ede9fe)",
                  border: "1px solid #ddd6fe",
                  alignItems: "center",
                }}
              >
                <Sparkles style={{ width: "22px", height: "22px", color: "#7c3aed", flexShrink: 0 }} />
                <div style={{ fontSize: "12px", color: "#5b21b6", lineHeight: 1.5 }}>
                  <strong>AI Teacher Review Available:</strong> Open this question in the dedicated ModelMind Practice Notebook to get instant feedback from Ollama (local) or Google Gemini on your code, logic, edge cases, and algorithmic complexity.
                </div>
              </div>
            </>
          ) : (
            <div style={{ padding: "40px", textAlign: "center", color: "#888" }}>
              Select a question to view details.
            </div>
          )}
        </main>
      </section>
    </div>
  );
}
