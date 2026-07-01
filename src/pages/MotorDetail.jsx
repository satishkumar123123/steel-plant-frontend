import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
const API = process.env.REACT_APP_API_URL;

// Dynamic Colors Arrays for History Cards
const colors = [
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #ff512f, #dd2476)",
  "linear-gradient(135deg, #11998e, #38ef7d)",
  "linear-gradient(135deg, #ff9800, #ff5722)",
  "linear-gradient(135deg, #00b4db, #0083b0)",
  "linear-gradient(135deg, #8e24aa, #d81b60)"
];

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
    const res = await fetch(`${API}/vibration-test/${id}`);
    const data = await res.json();
    setVibrationHistory(Array.isArray(data) ? data : []);
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
    if (!vibrationValue || !testDate) {
      alert("Enter vibration value and date");
      return;
    }

    await fetch(`${API}/vibration-test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        motorId: motor._id,
        vibrationValue: Number(vibrationValue),
        testDate,
        testedBy,
        remark,
      }),
    });

    await loadVibrationHistory();

    setShowVibrationForm(false);
    setVibrationValue("");
    setTestDate("");
    setTestedBy("");
    setRemark("");

    alert("Vibration saved ✅");
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

  if (error) {
    return (
      <div style={{ padding: "20px" }}>
        <button onClick={() => navigate("/")}>⬅ Back</button>
        <h3 style={{ color: "red" }}>{error}</h3>
      </div>
    );
  }

  if (!motor) return <p style={{ padding: "20px" }}>Loading...</p>;

  // Styles
  const card = {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "15px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
    marginBottom: "25px"
  };

  const btn = (gradient) => ({
    background: gradient,
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px"
  });

  const gridLayout = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "20px",
    marginTop: "15px"
  };

  const historyCard = (index) => ({
    background: colors[index % colors.length],
    padding: "15px",
    borderRadius: "10px",
    color: "white",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
  });

  return (
    <div style={{
      minHeight: "100vh",
      padding: "30px",
      background: "linear-gradient(135deg,#667eea,#764ba2)"
    }}>

      <button onClick={() => navigate("/")}
        style={btn("linear-gradient(45deg,#ff6a00,#ee0979)")}>
        ⬅ Back
      </button>

      {/* CURRENT MOTOR */}
      <div style={{ ...card, borderLeft: "8px solid #00c853", marginTop: "20px" }}>
        <h2 style={{ color: "#2e7d32", marginTop: 0 }}>🟢 Current Motor</h2>
        <p><b>Plant:</b> {motor.plant}</p>
        <p><b>Serial:</b> {motor.serialNo}</p>
        <p><b>RPM:</b> {motor.rpm}</p>
        <p><b>Status:</b> {motor.status}</p>
      </div>

      {/* 1. CHANGE MOTOR SECTION */}
      <div style={card}>
        <button
          onClick={() => setShowChangeForm(!showChangeForm)}
          style={btn("linear-gradient(45deg,#ff512f,#dd2476)")}>
          🔁 Change Motor
        </button>

        {showChangeForm && (
          <div>
            <br />
            <input placeholder="New Serial"
              value={newSerial}
              onChange={(e) => setNewSerial(e.target.value)} />
            <br /><br />
            <input placeholder="New RPM"
              value={newRpm}
              onChange={(e) => setNewRpm(e.target.value)} />
            <br /><br />
            <input placeholder="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)} />
            <br /><br />
            <button
              onClick={handleChangeMotor}
              disabled={loading}
              style={btn("linear-gradient(45deg,#00c853,#43a047)")}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>

      {/* 2. ADD GREASING SECTION */}
      <div style={card}>
        <button
          onClick={() => setShowGreasingForm(!showGreasingForm)}
          style={btn("linear-gradient(45deg,#ff9800,#ff5722)")}>
          🛢 Add Greasing
        </button>

        {showGreasingForm && (
          <div>
            <br />
            <input type="date"
              value={greasingDate}
              onChange={(e) => setGreasingDate(e.target.value)} />
            <br /><br />
            <input placeholder="Grease Type"
              value={greaseType}
              onChange={(e) => setGreaseType(e.target.value)} />
            <br /><br />
            <input placeholder="Greased By"
              value={greasedBy}
              onChange={(e) => setGreasedBy(e.target.value)} />
            <br /><br />
            <input placeholder="Remark"
              value={greasingRemark}
              onChange={(e) => setGreasingRemark(e.target.value)} />
            <br /><br />
            <button
              onClick={saveGreasing}
              style={btn("linear-gradient(45deg,#4caf50,#2e7d32)")}>
              Save Greasing
            </button>
          </div>
        )}
      </div>

      {/* 3. ADD VIBRATION SECTION */}
      <div style={card}>
        <button
          onClick={() => setShowVibrationForm(!showVibrationForm)}
          style={btn("linear-gradient(45deg,#2196f3,#21cbf3)")}>
          📈 Add Vibration Test
        </button>

        {showVibrationForm && (
          <div>
            <br />
            <input type="number" placeholder="Vibration"
              value={vibrationValue}
              onChange={(e) => setVibrationValue(e.target.value)} />
            <br /><br />
            <input type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)} />
            <br /><br />
            <input placeholder="Tested By"
              value={testedBy}
              onChange={(e) => setTestedBy(e.target.value)} />
            <br /><br />
            <input placeholder="Remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)} />
            <br /><br />
            <button
              onClick={saveVibration}
              style={btn("linear-gradient(45deg,#8e24aa,#d81b60)")}>
              Save
            </button>
          </div>
        )}
      </div>

      <hr style={{ margin: "40px 0", border: "1px dashed rgba(255,255,255,0.3)" }} />

      {/* MOTOR CHANGE HISTORY GRID */}
      <div style={card}>
        <h3 style={{ marginTop: 0 }}>🔁 Motor Change History</h3>
        {motorHistory.length === 0 ? (
          <p style={{ color: "#777" }}>No history</p>
        ) : (
          <div style={gridLayout}>
            {motorHistory.map((h, i) => (
              <div key={i} style={historyCard(i)}>
                <p style={{ margin: "0 0 8px 0" }}><b>Old Serial:</b> {h.oldSerialNo}</p>
                <p style={{ margin: "0 0 8px 0" }}><b>Old RPM:</b> {h.oldRpm}</p>
                <p style={{ margin: "0 0 8px 0" }}><b>Reason:</b> {h.reason}</p>
                <p style={{ margin: "0", fontSize: "0.85rem", opacity: 0.9 }}>
                  <b>Date:</b> {new Date(h.changeDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GREASING HISTORY GRID */}
      <div style={card}>
        <h3 style={{ marginTop: 0 }}>🛢 Greasing History</h3>
        {greasingHistory.length === 0 ? (
          <p style={{ color: "#777" }}>No greasing history</p>
        ) : (
          <div style={gridLayout}>
            {greasingHistory.map((g, i) => (
              <div key={i} style={historyCard(i)}>
                <p style={{ margin: "0 0 8px 0" }}><b>Type:</b> {g.greaseType}</p>
                <p style={{ margin: "0 0 8px 0" }}><b>By:</b> {g.greasedBy}</p>
                {g.remark && <p style={{ margin: "0 0 8px 0" }}><b>Rem:</b> {g.remark}</p>}
                <p style={{ margin: "0", fontSize: "0.85rem", opacity: 0.9 }}>
                  <b>Date:</b> {new Date(g.greasingDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* VIBRATION HISTORY GRID */}
      <div style={card}>
        <h3 style={{ marginTop: 0 }}>📊 Vibration History</h3>
        {vibrationHistory.length === 0 ? (
          <p style={{ color: "#777" }}>No vibration history</p>
        ) : (
          <div style={gridLayout}>
            {vibrationHistory.map((v, i) => (
              <div key={i} style={historyCard(i)}>
                <p style={{ margin: "0 0 8px 0", fontSize: "1.2rem" }}><b>{v.vibrationValue} mm/s</b></p>
                <p style={{ margin: "0 0 8px 0" }}><b>By:</b> {v.testedBy || "N/A"}</p>
                {v.remark && <p style={{ margin: "0 0 8px 0" }}><b>Rem:</b> {v.remark}</p>}
                <p style={{ margin: "0", fontSize: "0.85rem", opacity: 0.9 }}>
                  <b>Date:</b> {new Date(v.testDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default MotorDetail;