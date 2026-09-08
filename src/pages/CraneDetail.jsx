import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

import CraneAnalytics from "../components/CraneAnalytics";
import { SAFETY_KEYS, BRAKE_KEYS, checkLabel, inspectionIssues } from "../utils/craneData";

import "./CraneDetail.css";

const API = process.env.REACT_APP_API_URL;

function CheckBadge({ value }) {
  const faulty = value === "Not OK" || value === "Outside Limit";
  const good = value === "OK" || value === "Within Limit";
  return <span style={{ display: "inline-block", padding: "3px 8px", borderRadius: "6px",
    background: faulty ? "#fee2e2" : good ? "#dcfce7" : "#e5e7eb",
    color: faulty ? "#991b1b" : good ? "#166534" : "#374151", fontWeight: 700 }}>{value || "—"}</span>;
}

function CraneDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [crane, setCrane] = useState(null);
  const [originalCrane, setOriginalCrane] = useState(null);
  const [history, setHistory] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [inspectorName, setInspectorName] = useState("");
  const [remark, setRemark] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [resolutionDrafts, setResolutionDrafts] = useState({});
  const [resolving, setResolving] = useState(null);
  const [historyError, setHistoryError] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const openIssues = history.flatMap(record => inspectionIssues(record)
    .filter(issue => issue.status !== "Resolved").map(issue => ({ ...issue, record })));

  const resolveIssue = async (record, issue) => {
    const draftKey = record._id + ":" + issue.issueKey;
    const draft = resolutionDrafts[draftKey] || {};
    if (!draft.resolvedBy?.trim() || !draft.resolutionAction?.trim()) {
      alert("Enter resolved by and repair action");
      return;
    }
    if (resolving) return;
    setResolving(draftKey);
    try {
      const response = await fetch(`${API}/crane-history/${record._id}/issues/${issue.issueKey}/resolve`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft)
      });
      const updated = await response.json();
      if (!response.ok) throw new Error(updated.message || "Could not resolve issue");
      setHistory(prev => prev.map(row => row._id === updated._id ? updated : row));
      setResolutionDrafts(prev => { const next = { ...prev }; delete next[draftKey]; return next; });
    } catch (error) {
      alert(error.message);
    } finally {
      setResolving(null);
    }
  };

  /* ================= LOAD CRANE + HISTORY ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const craneRes = await fetch(`${API}/crane/${id}`);
        const craneData = await craneRes.json();
        if (!craneRes.ok) throw new Error("Failed to load crane");

        const formatted = {
          ...craneData,
          safetyChecks: craneData.safetyChecks || {},
          brakeChecks: craneData.brakeChecks || {}
        };

        setCrane(formatted);
        setOriginalCrane(formatted);

        const historyRes = await fetch(`${API}/crane-history/${id}`);
        if (!historyRes.ok) throw new Error("History unavailable");
        const historyData = await historyRes.json();
        if (!Array.isArray(historyData)) throw new Error("Invalid history");
        setHistory(historyData);
        setHistoryError("");
      } catch {
        setHistoryError("Records could not be fully loaded. Reload before relying on the open issue list.");
        alert("Failed to load crane or history ❌");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSafetyChange = useCallback((field, value) => {
    setCrane(prev => ({
      ...prev,
      safetyChecks: { ...prev.safetyChecks, [field]: value }
    }));
  }, []);

  const handleBrakeChange = useCallback((field, value) => {
    setCrane(prev => ({
      ...prev,
      brakeChecks: { ...prev.brakeChecks, [field]: value }
    }));
  }, []);

  const handleSave = async () => {
    if (saving) return;
    if (!inspectorName.trim()) { alert("Enter inspector name"); return; }
    setSaving(true);
    try {
      const response = await fetch(`${API}/crane/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          safetyChecks: Object.fromEntries(SAFETY_KEYS.map(key => [key, crane.safetyChecks[key] || "OK"])),
          brakeChecks: Object.fromEntries(BRAKE_KEYS.map(key => [key, crane.brakeChecks[key] || "Within Limit"])),
          lastUpdatedBy: inspectorName.trim(),
          inspectorName: inspectorName.trim(), remark, actionTaken
        })
      });
      const savedCrane = await response.json();
      if (!response.ok) throw new Error(savedCrane.message || "Inspection save failed");
      setCrane(savedCrane);
      setOriginalCrane(savedCrane);
      setEditMode(false);
      setRemark("");
      setActionTaken("");
      try {
        const historyRes = await fetch(`${API}/crane-history/${id}`);
        if (!historyRes.ok) throw new Error("History unavailable");
        const historyData = await historyRes.json();
        if (!Array.isArray(historyData)) throw new Error("Invalid history response");
        setHistory(historyData);
        setHistoryError("");
        alert("Inspection saved to history ✅");
      } catch {
        setHistoryError("History refresh failed. Reload to see the latest open faults.");
        alert("Inspection saved, but history could not refresh. Reload the page to view it.");
      }
    } catch (error) {
      alert(error.message || "Update failed ❌");
    } finally {
      setSaving(false);
    }
  };

  const exportCraneReport = async () => {
    if (reportLoading) return;
    setReportLoading(true);
    try {
      const responses = await Promise.all([fetch(`${API}/crane/${id}`), fetch(`${API}/crane-history/${id}`)]);
      if (responses.some(response => !response.ok)) throw new Error("Could not load complete crane report data. Please retry.");
      const [savedCrane, savedHistory] = await Promise.all(responses.map(response => response.json()));
      if (!savedCrane._id || !Array.isArray(savedHistory)) throw new Error("Invalid crane report data");
      const { downloadCraneReport } = await import("../utils/craneReport");
      await downloadCraneReport({ crane: savedCrane, history: savedHistory });
    } catch (error) { alert(error.message || "Report download failed"); }
    finally { setReportLoading(false); }
  };

  const handleCancel = () => {
    setCrane(originalCrane);
    setEditMode(false);
  };

  if (loading) return <p style={{ padding: "20px", color: "#475569" }}>Loading...</p>;
  if (!crane) return <p style={{ padding: "20px", color: "#475569" }}>Crane not found ❌</p>;

  const itemStyle = { marginBottom: "12px", padding: "13px", borderRadius: "12px", background: "rgba(255,255,255,.8)", border: "1px solid rgba(148,163,184,.18)" };
  const labelStyle = { fontSize: "12px", color: "inherit", fontWeight: 750, marginBottom: "8px" };
  const inputStyle = { width: "100%", padding: "10px", borderRadius: "9px", border: "1px solid #cbd5e1", boxSizing: "border-box" };

  return (
    <div className="crane-detail">
      <div className="cd-toolbar">
        <button 
          onClick={() => navigate(-1)} 
          style={{ padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}
        >
          ⬅ Back
        </button>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button className="ca-report-button" onClick={exportCraneReport} disabled={reportLoading || saving || !!resolving}>{reportLoading ? "Preparing PDF…" : "↓ Download Crane Report"}</button>
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              style={{
                background: "linear-gradient(45deg,#ff6a00,#ee0979)",
                color: "#fff",
                border: "none",
                padding: "10px 20px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              ✏ Edit Crane
            </button>
          ) : (
            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                onClick={handleSave} 
                disabled={saving}
                style={{ background: "#2e7d32", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}
              >
                {saving ? "Saving..." : "💾 Save"}
              </button>
              <button 
                disabled={saving}
                onClick={handleCancel}
                style={{ background: "#d32f2f", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}
              >
                ❌ Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <header className="cd-hero">
        <div><span className="cd-eyebrow">WIDER ELECTRICAL · CRANE MANAGEMENT</span>
          <h1>{crane.plant} <span>/</span> {crane.craneNo}</h1>
          <p>Inspection records, safety checks &amp; maintenance insights</p>
          <div className="cd-hero-tags"><span>⌖ {crane.location || "Location not recorded"}</span><span>Serial · {crane.serialNo || "—"}</span><span>Capacity · {crane.capacityTon ?? "—"} T</span></div>
        </div>
        <div className="cd-mode"><span className="cd-mode-icon" aria-hidden="true">◎</span><strong>{editMode ? "Inspection in progress" : "Crane Details"}</strong><small>{editMode ? "Review checks before saving" : "Equipment & inspection overview"}</small></div>
      </header>

      <CraneAnalytics history={history} error={historyError} />

      {editMode && (
        <div className="cd-notes">
          <h3 style={{ margin: 0 }}>Inspection Notes</h3>
          <label>Inspector name *
            <input value={inspectorName} maxLength={120} disabled={saving} onChange={e => setInspectorName(e.target.value)}
              style={{ display: "block", width: "100%", boxSizing: "border-box", padding: "10px" }} />
          </label>
          <label>Remark / problem observed
            <textarea value={remark} maxLength={2000} disabled={saving} onChange={e => setRemark(e.target.value)}
              style={{ display: "block", width: "100%", boxSizing: "border-box", padding: "10px" }} />
          </label>
          <label>Action taken
            <textarea value={actionTaken} maxLength={2000} disabled={saving} onChange={e => setActionTaken(e.target.value)}
              style={{ display: "block", width: "100%", boxSizing: "border-box", padding: "10px" }} />
          </label>
          <small>Faults remain Open until the repair is recorded using Mark Resolved.</small>
        </div>
      )}

      {crane.checksAreDefaults && (
        <p className="cd-default-notice">
          Next inspection defaults: OK / Within Limit. Saved inspection results are shown in history below.
        </p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: "30px", marginTop: "30px" }}>
        
        {/* BASIC INFORMATION - Uneditable & Uppercase Labels */}
        <div
          className="cd-equipment-card cd-basic"
        >
          <h3 style={{ marginTop: 0, marginBottom: "20px", borderBottom: "2px solid #fff", paddingBottom: "5px" }}>Basic Information</h3>
          {["serialNo", "make", "capacityTon", "kw", "location"].map((field) => (
            <div key={field} style={itemStyle}>
              <div style={labelStyle}>{{serialNo: "Serial Number", make: "Manufacturer", capacityTon: "Capacity (tonnes)", kw: "Power (kW)", location: "Location"}[field]}</div>
              <div style={{ fontSize: "16px", fontWeight: "500" }}>
                {crane[field] ?? "—"}
              </div>
            </div>
          ))}
        </div>

        {/* SAFETY CHECKS - Editable & Uppercase Labels */}
        <div
          className="cd-equipment-card cd-safety"
        >
          <h3 style={{ marginTop: 0, marginBottom: "20px", borderBottom: "2px solid #fff", paddingBottom: "5px" }}>Safety Checks</h3>
          {SAFETY_KEYS.map((key) => {
            const value = crane.safetyChecks[key] || "OK";
            return (
              <div key={key} style={itemStyle}>
                <div style={labelStyle}>{checkLabel(key)}</div>
                {editMode ? (
                  <select
                    value={value}
                    disabled={saving}
                    onChange={e => handleSafetyChange(key, e.target.value)}
                    style={{ ...inputStyle, color: "#000", background: "#fff" }}
                  >
                    <option value="OK">OK</option>
                    <option value="Not OK">Not OK</option>
                  </select>
                ) : (
                  <CheckBadge value={value} />
                )}
              </div>
            );
          })}
        </div>

        {/* BRAKE CHECKS - Editable & Uppercase Labels */}
        <div
          className="cd-equipment-card cd-brake"
        >
          <h3 style={{ marginTop: 0, marginBottom: "20px", borderBottom: "2px solid #fff", paddingBottom: "5px" }}>Brake Checks</h3>
          {BRAKE_KEYS.map((key) => {
            const value = crane.brakeChecks[key] || "Within Limit";
            return (
              <div key={key} style={itemStyle}>
                <div style={labelStyle}>{checkLabel(key)}</div>
                {editMode ? (
                  <select
                    value={value}
                    disabled={saving}
                    onChange={e => handleBrakeChange(key, e.target.value)}
                    style={{ ...inputStyle, color: "#000", background: "#fff" }}
                  >
                    <option value="Within Limit">Within Limit</option>
                    <option value="Outside Limit">Outside Limit</option>
                  </select>
                ) : (
                  <CheckBadge value={value} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <section className="cd-faults">
        <h2 style={{ color: "#9a3412" }}>Open Faults ({openIssues.length})</h2>
        <p>These faults remain open even when the next inspection defaults show OK / Within Limit.</p>
        {historyError && <p role="alert" style={{ color: "#b91c1c" }}>{historyError}</p>}
        {!historyError && openIssues.length === 0 && <p>No open faults in recorded inspections.</p>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "16px" }}>
          {openIssues.map(({ record, ...issue }) => {
            const draftKey = record._id + ":" + issue.issueKey;
            const draft = resolutionDrafts[draftKey] || {};
            const changeDraft = (field, value) => setResolutionDrafts(prev => ({
              ...prev, [draftKey]: { ...prev[draftKey], [field]: value }
            }));
            return (
              <div key={draftKey} className="cd-fault-card">
                <strong>{checkLabel(issue.key)}</strong> <CheckBadge value={issue.value} />
                <p style={{ color: "#991b1b", fontWeight: 700 }}>Open</p>
                <p>{new Date(record.updatedAt).toLocaleString()} · {record.inspectorName || record.updatedBy}</p>
                {record.remark && <p>Remark: {record.remark}</p>}
                {record.actionTaken && <p>Inspection action: {record.actionTaken}</p>}
                <label>Resolved by
                  <input value={draft.resolvedBy || ""} maxLength={120} disabled={!!resolving}
                    onChange={e => changeDraft("resolvedBy", e.target.value)} style={{ display: "block", width: "100%", boxSizing: "border-box", padding: "8px" }} />
                </label>
                <label>Repair action
                  <textarea value={draft.resolutionAction || ""} maxLength={2000} disabled={!!resolving}
                    onChange={e => changeDraft("resolutionAction", e.target.value)} style={{ display: "block", width: "100%", boxSizing: "border-box", padding: "8px" }} />
                </label>
                <button disabled={!!resolving} onClick={() => resolveIssue(record, issue)}
                  style={{ marginTop: "10px", padding: "10px", background: "#166534", color: "#fff", border: 0, borderRadius: "6px" }}>
                  {resolving === draftKey ? "Saving..." : "Mark Resolved"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= 🕒 HISTORY SECTION ================= */}
      <div className="cd-history">
        <h2>
          🕒 Crane Inspection History
        </h2>

        {history.length === 0 ? (
          <p className="cd-empty">No history available. Saved inspections will appear here.</p>
        ) : (
          <div className="cd-history-grid">
            {history.map((h, index) => (
              <div key={h._id || index} className={`cd-history-card cd-history-tone-${index % 6}`}>
                <div>
                  <div style={{ borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: "5px", marginBottom: "10px" }}>
                    <div style={{ fontSize: "11px", opacity: 0.8 }}>{new Date(h.updatedAt).toLocaleString()}</div>
                    <div style={{ fontWeight: "bold", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      👤 {h.updatedBy || "Team"}
                      <div>{h.recordType === "inspection" ? "Saved inspection" : "Previous record"}</div>
                    </div>
                  </div>
                  
                  {h.remark && <p style={{ overflowWrap: "anywhere" }}>Remark: {h.remark}</p>}
                  {h.actionTaken && <p style={{ overflowWrap: "anywhere" }}>Action taken: {h.actionTaken}</p>}
                  {inspectionIssues(h).map(issue => (
                    <div key={issue.issueKey} style={{ marginBottom: "10px", padding: "8px", borderRadius: "6px",
                      background: issue.status === "Resolved" ? "#dcfce7" : "#fee2e2", color: "#111827", overflowWrap: "anywhere" }}>
                      <strong>{checkLabel(issue.key)} — {issue.status}</strong>
                      {issue.status === "Resolved" && <>
                        <div>By: {issue.resolvedBy}</div>
                        <div>{new Date(issue.resolvedAt).toLocaleString()}</div>
                        <div>Repair: {issue.resolutionAction}</div>
                      </>}
                    </div>
                  ))}
                  <div style={{ marginBottom: "10px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "bold", display: "block", color: "#475569" }}>SAFETY</span>
                    {SAFETY_KEYS.map(key => (
                      <div key={key} style={{ marginTop: "6px", overflowWrap: "anywhere" }}>
                        {checkLabel(key)}: <CheckBadge value={(h.inspectionData || h.oldData)?.safetyChecks?.[key]} />
                      </div>
                    ))}
                  </div>

                  <div>
                    <span style={{ fontSize: "11px", fontWeight: "bold", display: "block", color: "#475569" }}>BRAKES</span>
                    {BRAKE_KEYS.map(key => (
                      <div key={key} style={{ marginTop: "6px", overflowWrap: "anywhere" }}>
                        {checkLabel(key)}: <CheckBadge value={(h.inspectionData || h.oldData)?.brakeChecks?.[key]} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CraneDetail;
