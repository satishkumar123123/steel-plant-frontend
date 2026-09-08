import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VibrationHistoryTabs from "../components/VibrationHistoryTabs";
import "./MotorDetail.css";
const API = process.env.REACT_APP_API_URL;

function MotorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [motor, setMotor] = useState(null);
  const [error, setError] = useState("");

  const [showChangeForm, setShowChangeForm] = useState(false);
  const [newSerial, setNewSerial] = useState("");
  const [newRpm, setNewRpm] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const [showVibrationForm, setShowVibrationForm] = useState(false);
  const [vibrationValue, setVibrationValue] = useState("");
  const [testDate, setTestDate] = useState("");
  const [testedBy, setTestedBy] = useState("");
  const [remark, setRemark] = useState("");
  const [vibrationHistory, setVibrationHistory] = useState([]);
  const [vibrationError, setVibrationError] = useState("");
  const [vibrationLoading, setVibrationLoading] = useState(false);
  const [vibrationSaving, setVibrationSaving] = useState(false);

  const [motorHistory, setMotorHistory] = useState([]);

  /* GREASING (CRM ONLY) */
  const [showGreasingForm, setShowGreasingForm] = useState(false);
  const [greasingDate, setGreasingDate] = useState("");
  const [greaseType, setGreaseType] = useState("");
  const [greasedBy, setGreasedBy] = useState("");
  const [greasingRemark, setGreasingRemark] = useState("");
  const [greasingHistory, setGreasingHistory] = useState([]);

  /* LOAD FUNCTIONS */
  const loadMotor = useCallback(async () => {
    const res = await fetch(`${API}/motors/${id}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.message || "Motor not found");
      return;
    }
    setMotor(data);
  }, [id]);

  const loadVibrationHistory = useCallback(async () => {
    setVibrationLoading(true); setVibrationError("");
    try {
      const res = await fetch(`${API}/vibration-test/${id}`);
      if (!res.ok) throw new Error("Could not load vibration history. Please reload.");
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Invalid vibration history");
      setVibrationHistory(data);
    } catch (error) {
      setVibrationHistory([]); setVibrationError(error.message);
    } finally { setVibrationLoading(false); }
  }, [id]);

  const loadMotorHistory = useCallback(async () => {
    const res = await fetch(`${API}/motor-history/${id}`);
    const data = await res.json();
    setMotorHistory(Array.isArray(data) ? data : []);
  }, [id]);

  const loadGreasingHistory = useCallback(async () => {
    const res = await fetch(`${API}/greasing/${id}`);
    const data = await res.json();
    setGreasingHistory(Array.isArray(data) ? data : []);
  }, [id]);

  useEffect(() => {
    loadMotor();
    loadVibrationHistory();
    loadMotorHistory();
    loadGreasingHistory();
  }, [loadMotor, loadVibrationHistory, loadMotorHistory, loadGreasingHistory]);

  /* CHANGE MOTOR */
  const handleChangeMotor = async () => {
    if (!newSerial || !newRpm || !reason) {
      alert("Fill all fields");
      return;
    }

    setLoading(true);

    await fetch(`${API}/change-motor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        motorId: motor._id,
        newSerialNo: newSerial,
        newRpm: Number(newRpm),
        reason,
      }),
    });

    await loadMotor();
    await loadMotorHistory();

    setShowChangeForm(false);
    setNewSerial("");
    setNewRpm("");
    setReason("");
    setLoading(false);

    alert("Motor changed successfully ✅");
  };

  /* SAVE VIBRATION */
  const saveVibration = async () => {
    if (vibrationSaving) return;
    if (String(vibrationValue).trim() === "" || !Number.isFinite(Number(vibrationValue)) ||
        Number(vibrationValue) < 0 || !testDate || !Number.isFinite(Date.parse(testDate))) {
      alert("Enter a valid non-negative vibration value and test date");
      return;
    }
    setVibrationSaving(true);
    try {
      const res = await fetch(`${API}/vibration-test`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motorId: motor._id, vibrationValue: Number(vibrationValue), testDate, testedBy, remark })
      });
      if (!res.ok) throw new Error("Vibration could not be saved. Please try again.");
      setShowVibrationForm(false);
      setVibrationValue(""); setTestDate(""); setTestedBy(""); setRemark("");
      await loadVibrationHistory();
      alert("Vibration saved ✅");
    } catch (error) { alert(error.message); }
    finally { setVibrationSaving(false); }
  };

  /* SAVE GREASING */
  const saveGreasing = async () => {
    if (!greasingDate || !greaseType) {
      alert("Enter greasing date and grease type");
      return;
    }

    await fetch(`${API}/greasing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        motorId: motor._id,
        greasingDate,
        greaseType,
        greasedBy,
        remark: greasingRemark,
      }),
    });

    await loadGreasingHistory();

    setShowGreasingForm(false);
    setGreasingDate("");
    setGreaseType("");
    setGreasedBy("");
    setGreasingRemark("");

    alert("Greasing saved ✅");
  };

  if (error) return <div className="md-page"><div className="md-state"><h2>Unable to load motor</h2><p>{error}</p><button className="md-button" onClick={() => navigate("/")}>← Back to dashboard</button></div></div>;
  if (!motor) return <div className="md-page"><div className="md-state" role="status">Loading motor details…</div></div>;

  const status = String(motor.status || "Unknown");
  const statusTone = /^(running|ok)$/i.test(status) ? "good" : /^(stopped|breakdown)$/i.test(status) ? "bad" : "neutral";
  const fields = [
    ["Production line", motor.plant, "blue"], ["Serial number", motor.serialNo, "purple"],
    ["Speed · RPM", motor.rpm, "orange"], ["Status", status, statusTone],
    ["Area / Location", motor.area || motor.location, "teal"],
    ["Motor / Position", motor.motorName || motor.name || motor.position, "pink"]
  ];
  const dateText = value => value && Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <main className="md-page">
      <div className="md-shell">
        <nav className="md-nav">
          <button className="md-back" onClick={() => navigate("/")}>← Dashboard</button>
          <span>Wider Electrical <span className="md-nav-dot">/</span> Motor Details</span>
        </nav>
        <header className="md-hero">
          <div>
            <div className="md-eyebrow">⚙ EQUIPMENT MAINTENANCE</div>
            <h1><span>Motor</span> <span>Details</span></h1>
            <p>{motor.plant || "Plant"} · {motor.motorName || motor.name || motor.position || "Motor"}{motor.area ? " · " + motor.area : ""}</p>
          </div>
          <div className="md-hero-badge"><span className={"md-status md-status-" + statusTone}>{status}</span><small>Recorded motor status</small></div>
        </header>

        <section className="md-overview" aria-label="Current motor">
          {fields.map(([label, value, tone]) => <div className={"md-stat md-tone-" + tone} key={label}>
            <span>{label}</span><strong>{value ?? "—"}</strong>
          </div>)}
        </section>

        <div className="md-section-heading"><div><span className="md-kicker">MAINTENANCE DESK</span><h2>Keep every update in one place</h2></div><span className="md-subtle">Choose an action below</span></div>
        <section className="md-actions" aria-label="Maintenance actions">
          <article className="md-action md-change">
            <div className="md-action-top"><span className="md-icon">↻</span><span className="md-action-tag">REPLACEMENT</span></div>
            <h3>Change <span>Motor</span></h3><p>Record the new serial, speed and replacement reason.</p>
            <button className="md-button" aria-expanded={showChangeForm} aria-controls="md-change-form" onClick={() => setShowChangeForm(!showChangeForm)}>{showChangeForm ? "− Close form" : "+ Change Motor"}</button>
            {showChangeForm && <div className="md-form" id="md-change-form">
              <label>New serial number<input placeholder="Enter new serial" value={newSerial} onChange={e => setNewSerial(e.target.value)} /></label>
              <label>New RPM<input placeholder="Enter speed" value={newRpm} onChange={e => setNewRpm(e.target.value)} /></label>
              <label>Replacement reason<input placeholder="Why was the motor changed?" value={reason} onChange={e => setReason(e.target.value)} /></label>
              <button className="md-button md-save" onClick={handleChangeMotor} disabled={loading}>{loading ? "Saving…" : "Save replacement"}</button>
            </div>}
          </article>
          <article className="md-action md-grease">
            <div className="md-action-top"><span className="md-icon">◈</span><span className="md-action-tag">LUBRICATION</span></div>
            <h3>Add <span>Greasing</span></h3><p>Log lubrication work, grease type and technician details.</p>
            <button className="md-button" aria-expanded={showGreasingForm} aria-controls="md-grease-form" onClick={() => setShowGreasingForm(!showGreasingForm)}>{showGreasingForm ? "− Close form" : "+ Add Greasing"}</button>
            {showGreasingForm && <div className="md-form" id="md-grease-form">
              <label>Greasing date<input type="date" value={greasingDate} onChange={e => setGreasingDate(e.target.value)} /></label>
              <label>Grease type<input placeholder="Enter grease type" value={greaseType} onChange={e => setGreaseType(e.target.value)} /></label>
              <label>Greased by<input placeholder="Technician name" value={greasedBy} onChange={e => setGreasedBy(e.target.value)} /></label>
              <label>Remark<input placeholder="Additional notes" value={greasingRemark} onChange={e => setGreasingRemark(e.target.value)} /></label>
              <button className="md-button md-save" onClick={saveGreasing}>Save greasing</button>
            </div>}
          </article>
          <article className="md-action md-vibration">
            <div className="md-action-top"><span className="md-icon">∿</span><span className="md-action-tag">CONDITION MONITORING</span></div>
            <h3>Vibration <span>Test</span></h3><p>Add a reading and explore its trend in history and charts.</p>
            <button className="md-button" aria-expanded={showVibrationForm} aria-controls="md-vibration-form" onClick={() => setShowVibrationForm(!showVibrationForm)}>{showVibrationForm ? "− Close form" : "+ Add Vibration Test"}</button>
            {showVibrationForm && <div className="md-form" id="md-vibration-form">
              <label>Vibration · mm/s<input type="number" min="0" step="any" placeholder="e.g. 2.5" value={vibrationValue} onChange={e => setVibrationValue(e.target.value)} /></label>
              <label>Test date<input type="date" value={testDate} onChange={e => setTestDate(e.target.value)} /></label>
              <label>Tested by<input placeholder="Technician name" value={testedBy} onChange={e => setTestedBy(e.target.value)} /></label>
              <label>Remark<input placeholder="Additional notes" value={remark} onChange={e => setRemark(e.target.value)} /></label>
              <button className="md-button md-save" onClick={saveVibration} disabled={vibrationSaving}>{vibrationSaving ? "Saving…" : "Save vibration"}</button>
            </div>}
          </article>
        </section>

        <div className="md-section-heading"><div><span className="md-kicker">EQUIPMENT TIMELINE</span><h2>Maintenance history</h2></div></div>
        <section className="md-history-section md-history-change">
          <div className="md-history-heading"><h3>↻ Motor Change History</h3><span>{motorHistory.length} records</span></div>
          {motorHistory.length === 0 ? <p className="md-empty">No motor replacement recorded yet.</p> :
            <div className="md-history-grid">{motorHistory.map((h,i) => <article className={"md-record md-record-" + i % 6} key={h._id || i}>
              <div className="md-record-date"><span>REPLACEMENT</span><time>{dateText(h.changeDate)}</time></div>
              <dl><div><dt>Old serial</dt><dd>{h.oldSerialNo || "—"}</dd></div><div><dt>Old RPM</dt><dd>{h.oldRpm ?? "—"}</dd></div><div><dt>Reason</dt><dd>{h.reason || "—"}</dd></div></dl>
            </article>)}</div>}
        </section>
        <section className="md-history-section md-history-grease">
          <div className="md-history-heading"><h3>◈ Greasing History</h3><span>{greasingHistory.length} records</span></div>
          {greasingHistory.length === 0 ? <p className="md-empty">No greasing activity recorded yet.</p> :
            <div className="md-history-grid">{greasingHistory.map((g,i) => <article className={"md-record md-record-" + (i + 2) % 6} key={g._id || i}>
              <div className="md-record-date"><span>LUBRICATION</span><time>{dateText(g.greasingDate)}</time></div>
              <dl><div><dt>Grease type</dt><dd>{g.greaseType || "—"}</dd></div><div><dt>Greased by</dt><dd>{g.greasedBy || "—"}</dd></div>{g.remark && <div><dt>Remark</dt><dd>{g.remark}</dd></div>}</dl>
            </article>)}</div>}
        </section>
        <section className="md-history-section md-history-vibration">
          <VibrationHistoryTabs key={id} records={vibrationHistory} loading={vibrationLoading} error={vibrationError}>
            {vibrationHistory.length === 0 ? <p className="md-empty">No vibration tests recorded yet.</p> :
              <div className="md-history-grid">{vibrationHistory.map((v,i) => <article className={"md-record md-record-" + (i + 1) % 6} key={v._id || i}>
                <div className="md-record-date"><span>VIBRATION TEST</span><time>{dateText(v.testDate)}</time></div>
                <div className="md-reading">{v.vibrationValue} <small>mm/s</small></div>
                <dl><div><dt>Tested by</dt><dd>{v.testedBy || "N/A"}</dd></div>{v.remark && <div><dt>Remark</dt><dd>{v.remark}</dd></div>}</dl>
              </article>)}</div>}
          </VibrationHistoryTabs>
        </section>
      </div>
    </main>
  );
}

export default MotorDetail;
