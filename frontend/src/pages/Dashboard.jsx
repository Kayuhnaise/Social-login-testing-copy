import React, { useEffect, useState } from "react";
import "./Dashboard.css";

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [text, setText] = useState("");
  const [operation, setOperation] = useState("sentiment");
  const [result, setResult] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);

  /* -----------------------------
     LOAD USER FROM BACKEND
  ------------------------------ */
  const loadUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        credentials: "include",
      });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error("Error loading user:", err);
    }
  };

  /* -----------------------------
     LOAD ANALYSES HISTORY
  ------------------------------ */
  const loadAnalyses = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/analyses`, {
        credentials: "include",
      });
      if (!res.ok) {
        console.error("Failed to load analyses");
        return;
      }
      const data = await res.json();
      setAnalyses(data);
    } catch (err) {
      console.error("Error loading analyses:", err);
    }
  };

  useEffect(() => {
    loadUser();
    loadAnalyses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -----------------------------
     RUN NLP ANALYSIS
  ------------------------------ */
  const runAnalysis = async () => {
    if (!text.trim()) {
      alert("Please enter some text to analyze.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/analyses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ inputText: text, operation }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Analysis failed");
        setLoading(false);
        return;
      }

      // data = { id, inputText, operation, result, createdAt }
      setResult(data.result);
      setAnalyses((prev) => [data, ...prev]);
    } catch (err) {
      console.error("Error running analysis:", err);
      alert("Error running analysis.");
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
     DELETE ANALYSIS FROM HISTORY
  ------------------------------ */
  const deleteAnalysis = async (id) => {
    try {
      await fetch(`${API_BASE}/api/analyses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Error deleting analysis:", err);
    }
  };

  /* -----------------------------
     LOGOUT
  ------------------------------ */
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: "GET",
        credentials: "include",
      });
    } catch (err) {
      console.error("Error logging out:", err);
    } finally {
      window.location.href = "/login";
    }
  };

  /* -----------------------------
     RENDER UI
  ------------------------------ */
  return (
    <div className="page">
      {/* -------- AVATAR HEADER -------- */}
      <div className="dash-header-avatar">
        <h1>NLP Dashboard</h1>

        {user && (
          <div className="user-info">
            <img
              src={user.photo || "https://via.placeholder.com/80"}
              alt="avatar"
              className="avatar-img"
            />
            <span className="user-name">{user.displayName}</span>
          </div>
        )}
      </div>

      {/* LOGOUT BUTTON */}
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>

      {/* TEXT INPUT + OPERATION CHOOSER */}
      <div className="section nlp-input">
        <h2>Analyze Text</h2>
        <textarea
          className="nlp-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="Paste or type text to analyze (reviews, feedback, emails, etc.)"
        />

        <div className="nlp-toolbar">
          <label>
            Operation:&nbsp;
            <select
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
            >
              <option value="sentiment">Sentiment</option>
              <option value="summary">Summarization</option>
              <option value="keywords">Keywords</option>
              <option value="entities">Entities</option>
              <option value="classify">Classification</option>
              <option value="chat">Chat</option>
            </select>
          </label>

          <button onClick={runAnalysis} disabled={loading}>
            {loading ? "Analyzing..." : "Run Analysis"}
          </button>
        </div>
      </div>

      {/* RESULT PANEL */}
      <div className="section nlp-result">
        <h2>Result</h2>
        {result ? (
          <pre className="nlp-result-pre">
            {JSON.stringify(result, null, 2)}
          </pre>
        ) : (
          <p>No result yet. Run an analysis to see output here.</p>
        )}
      </div>

      {/* HISTORY PANEL */}
      <div className="section nlp-history">
        <h2>History</h2>
        {analyses.length === 0 ? (
          <p>No analyses yet.</p>
        ) : (
          <ul className="analysis-list">
            {analyses.map((a) => (
              <li key={a.id} className="analysis-card">
                <div className="analysis-header">
                  <strong>{a.operation.toUpperCase()}</strong>
                  <span className="analysis-time">
                    {new Date(a.createdAt).toLocaleString()}
                  </span>
                  <button
                    className="analysis-delete"
                    onClick={() => deleteAnalysis(a.id)}
                  >
                    Delete
                  </button>
                </div>

                <details>
                  <summary>Input text</summary>
                  <p>{a.inputText}</p>
                </details>

                <details>
                  <summary>Result</summary>
                  <pre className="nlp-result-pre">
                    {JSON.stringify(a.result, null, 2)}
                  </pre>
                </details>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
