import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL;

function CraneDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [crane, setCrane] = useState(null);
  const [originalCrane, setOriginalCrane] = useState(null);
  const [history, setHistory] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);

  /* ================= LOAD CRANE + HISTORY ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const craneRes = await fetch(`${API}/crane/${id}`);
        const craneData = await craneRes.json();

        const formatted = {
          ...craneData,
          safetyChecks: craneData.safetyChecks || {},
          brakeChecks: craneData.brakeChecks || {}
        };

        setCrane(formatted);
        setOriginalCrane(formatted);

        const historyRes = await fetch(`${API}/crane-history/${id}`);
        const historyData = await historyRes.json();
        setHistory(Array.isArray(historyData) ? historyData : []);
      } catch {
        alert("Failed to load crane ❌");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleBasicChange = useCallback((field, value) => {
    setCrane(prev => ({ ...prev, [field]: value }));
  }, []);

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
    try {
      setSaving(true);

      await fetch(`${API}/crane/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...crane,
          lastUpdatedBy: "Maintenance Team",
          lastUpdatedAt: new Date()
        })
      });

      alert("Crane updated successfully ✅");
      setOriginalCrane(crane);
      setEditMode(false);

      const historyRes = await fetch(`${API}/crane-history/${id}`);
      const historyData = await historyRes.json();
      setHistory(Array.isArray(historyData) ? historyData : []);

    } catch {
      alert("Update failed ❌");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setCrane(originalCrane);
    setEditMode(false);
  };

  if (loading) return <p style={{ padding: "20px" }}>Loading...</p>;
  if (!crane) return <p style={{ padding: "20px" }}>Crane not found ❌</p>;

  const layoutGrid = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "30px",
    marginTop: "30px"
  };

  const backgrounds = {
    basic: "linear-gradient(135deg,#667eea,#764ba2)",
    safety: "linear-gradient(135deg,#11998e,#38ef7d)",
    brake: "linear-gradient(135deg,#ff512f,#dd2476)"
  };

  const getCardStyle = card => ({
    background: backgrounds[card],
    padding: "25px",
    borderRadius: "20px",
    minHeight: "420px",
    transition: "all 0.3s ease",
    transform:
      hoveredCard === card
        ? "translateY(-10px) scale(1.03)"
        : "translateY(0)",
    boxShadow:
      hoveredCard === card
        ? "0 25px 50px rgba(0,0,0,0.35)"
        : "0 12px 30px rgba(0,0,0,0.2)",
    cursor: "pointer"
  });

  const rowColors = [
    "#b71c1c","#0d47a1","#1b5e20","#4a148c",
    "#e65100","#004d40","#880e4f","#263238"
  ];

  const itemStyle = {
    marginBottom: "14px",
    paddingBottom: "8px",
    borderBottom: "1px solid rgba(255,255,255,0.3)"
  };

  return (
    <div style={{
      minHeight: "100vh",
      padding: "40px",
      background: "linear-gradient(135deg,#1f4037,#99f2c8)"
    }}>
      <button onClick={() => navigate(-1)}>⬅ Back</button>

      <h2 style={{ color: "#ffffff" }}>
        {crane.plant} - {crane.craneNo}
      </h2>

      {!editMode && (
        <button
          onClick={() => setEditMode(true)}
          style={{
            background: "linear-gradient(45deg,#ff6a00,#ee0979)",
            color: "#fff",
            border: "none",
            padding: "10px 16px",
            borderRadius: "10px",
            marginTop: "10px"
          }}
        >
          ✏ Edit Crane
        </button>
      )}

      <div style={layoutGrid}>
        {/* BASIC */}
        <div
          style={getCardStyle("basic")}
          onMouseEnter={() => setHoveredCard("basic")}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <h3 style={{ color: "#fff" }}>Basic Information</h3>
          {["serialNo","make","capacityTon","kw","location"].map((field,index)=>(
            <div key={field} style={itemStyle}>
              <div style={{ color: rowColors[index], fontWeight: "bold" }}>
                {field}
              </div>
              {editMode ? (
                <input
                  value={crane[field] || ""}
                  onChange={e => handleBasicChange(field, e.target.value)}
                  style={{ width: "100%" }}
                />
              ) : (
                <div style={{ color: rowColors[index+1] }}>
                  {crane[field]}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* SAFETY */}
        <div
          style={getCardStyle("safety")}
          onMouseEnter={() => setHoveredCard("safety")}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <h3 style={{ color: "#fff" }}>Safety Checks</h3>
          {Object.entries(crane.safetyChecks).map(([key,value],index)=>(
            <div key={key} style={itemStyle}>
              <div style={{ color: rowColors[index], fontWeight: "bold" }}>
                {key}
              </div>
              {editMode ? (
                <select
                  value={value}
                  onChange={e => handleSafetyChange(key, e.target.value)}
                  style={{ width: "100%" }}
                >
                  <option value="OK">OK</option>
                  <option value="Not OK">Not OK</option>
                </select>
              ) : (
                <div style={{ color: rowColors[index+1] }}>
                  {value}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* BRAKE */}
        <div
          style={getCardStyle("brake")}
          onMouseEnter={() => setHoveredCard("brake")}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <h3 style={{ color: "#fff" }}>Brake Checks</h3>
          {Object.entries(crane.brakeChecks).map(([key,value],index)=>(
            <div key={key} style={itemStyle}>
              <div style={{ color: rowColors[index], fontWeight: "bold" }}>
                {key}
              </div>
              {editMode ? (
                <select
                  value={value}
                  onChange={e => handleBrakeChange(key, e.target.value)}
                  style={{ width: "100%" }}
                >
                  <option value="Within Limit">Within Limit</option>
                  <option value="Outside Limit">Outside Limit</option>
                </select>
              ) : (
                <div style={{ color: rowColors[index+1] }}>
                  {value}
                </div>
              )}
            </div>
          ))}

          {editMode && (
            <div style={{ marginTop: "20px" }}>
              <button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "💾 Save"}
              </button>
              <button onClick={handleCancel} style={{ marginLeft: "10px" }}>
                ❌ Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= HISTORY UPGRADED ================= */}
      <div style={{ marginTop: "60px" }}>
        <h2 style={{ color: "#ffffff" }}>🕒 Crane Update History</h2>

        {history.length === 0 && (
          <p style={{ color: "#fff" }}>No history available</p>
        )}

        {history.map((h,index)=>(
          <div key={index} style={{
            background: "#ffffff",
            padding: "20px",
            borderRadius: "15px",
            marginTop: "15px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.2)"
          }}>
            <div><b>Date:</b> {new Date(h.updatedAt).toLocaleString()}</div>
            <div><b>Checked By:</b> {h.updatedBy}</div>

            <div><b> Crane Hooter:</b> {h.oldData?.safetyChecks?.craneHooter}</div>
            <div><b> MH Limit:</b> {h.oldData?.safetyChecks?.mhUpDownLimitSwitch}</div>
            <div><b> AH Limit:</b> {h.oldData?.safetyChecks?.ahUpDownLimitSwitch}</div>
            <div><b> Cross Travel Limit:</b> {h.oldData?.safetyChecks?.crossTravelLimitSwitch}</div>
            <div><b> Long Travel Limit:</b> {h.oldData?.safetyChecks?.longTravelLimitSwitch}</div>

            <hr />

            <div><b> Main Hoist Brake:</b> {h.oldData?.brakeChecks?.mainHoistBrakeGap}</div>
            <div><b> Aux Hoist Brake:</b> {h.oldData?.brakeChecks?.auxHoistBrakeGap}</div>
            <div><b> Cross Travel Brake:</b> {h.oldData?.brakeChecks?.crossTravelBrakeGap}</div>
            <div><b>Long Travel Brake:</b> {h.oldData?.brakeChecks?.longTravelBrakeGap}</div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default CraneDetail;