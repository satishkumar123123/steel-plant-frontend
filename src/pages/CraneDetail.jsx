import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL;

// 1️⃣ चाबियाँ (Keys) पहले से तय की गईं ताकि डेटा न होने पर भी इनपुट्स दिखें
const SAFETY_KEYS = [
  "craneHooter",
  "mhUpDownLimitSwitch",
  "ahUpDownLimitSwitch",
  "crossTravelLimitSwitch",
  "longTravelLimitSwitch"
];

const BRAKE_KEYS = [
  "mainHoistBrakeGap",
  "auxHoistBrakeGap",
  "crossTravelBrakeGap",
  "longTravelBrakeGap"
];

// 🎨 हिस्ट्री कार्ड्स के लिए 6 वाइब्रेंट कलर्स का एरे
const historyColors = [
  "#1e3a8a", // 🟦 Dark Blue
  "#b91c1c", // 🟥 Red
  "#047857", // 🟩 Green
  "#b45309", // 🟨 Amber/Yellow
  "#6d28d9", // 🟪 Purple
  "#c2410c"  // 🟧 Orange
];

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

  if (loading) return <p style={{ padding: "20px", color: "#fff" }}>Loading...</p>;
  if (!crane) return <p style={{ padding: "20px", color: "#fff" }}>Crane not found ❌</p>;

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
    transform: hoveredCard === card ? "translateY(-10px) scale(1.02)" : "translateY(0)",
    boxShadow: hoveredCard === card ? "0 25px 50px rgba(0,0,0,0.3)" : "0 12px 30px rgba(0,0,0,0.15)",
    color: "#ffffff"
  });

  const itemStyle = {
    marginBottom: "14px",
    paddingBottom: "8px",
    borderBottom: "1px solid rgba(255,255,255,0.2)"
  };

  const labelStyle = {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "bold",
    marginBottom: "4px"
  };

  const inputStyle = {
    width: "100%",
    padding: "6px 10px",
    borderRadius: "6px",
    border: "1px solid rgba(255,255,255,0.5)",
    background: "rgba(255,255,255,0.2)",
    color: "#fff",
    outline: "none"
  };

  return (
    <div style={{
      minHeight: "100vh",
      padding: "40px",
      background: "linear-gradient(135deg,#1f4037,#99f2c8)",
      fontFamily: "system-ui, sans-serif"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}
        >
          ⬅ Back
        </button>

        <div>
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
                onClick={handleCancel}
                style={{ background: "#d32f2f", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}
              >
                ❌ Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <h2 style={{ color: "#ffffff", marginTop: "20px", fontSize: "28px" }}>
        {crane.plant} - {crane.craneNo}
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px", marginTop: "30px" }}>
        
        {/* BASIC INFORMATION */}
        <div
          style={getCardStyle("basic")}
          onMouseEnter={() => setHoveredCard("basic")}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <h3 style={{ marginTop: 0, marginBottom: "20px", borderBottom: "2px solid #fff", paddingBottom: "5px" }}>Basic Information</h3>
          {["serialNo", "make", "capacityTon", "kw", "location"].map((field) => (
            <div key={field} style={itemStyle}>
              <div style={labelStyle}>{field}</div>
              {editMode ? (
                <input
                  value={crane[field] || ""}
                  onChange={e => handleBasicChange(field, e.target.value)}
                  style={inputStyle}
                />
              ) : (
                <div style={{ fontSize: "16px", fontWeight: "500" }}>{crane[field] || "—"}</div>
              )}
            </div>
          ))}
        </div>

        {/* SAFETY CHECKS */}
        <div
          style={getCardStyle("safety")}
          onMouseEnter={() => setHoveredCard("safety")}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <h3 style={{ marginTop: 0, marginBottom: "20px", borderBottom: "2px solid #fff", paddingBottom: "5px" }}>Safety Checks</h3>
          {SAFETY_KEYS.map((key) => {
            const value = crane.safetyChecks[key] || "OK";
            return (
              <div key={key} style={itemStyle}>
                <div style={labelStyle}>{key}</div>
                {editMode ? (
                  <select
                    value={value}
                    onChange={e => handleSafetyChange(key, e.target.value)}
                    style={{ ...inputStyle, color: "#000", background: "#fff" }}
                  >
                    <option value="OK">OK</option>
                    <option value="Not OK">Not OK</option>
                  </select>
                ) : (
                  <div style={{ fontSize: "16px", fontWeight: "500" }}>{value}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* BRAKE CHECKS */}
        <div
          style={getCardStyle("brake")}
          onMouseEnter={() => setHoveredCard("brake")}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <h3 style={{ marginTop: 0, marginBottom: "20px", borderBottom: "2px solid #fff", paddingBottom: "5px" }}>Brake Checks</h3>
          {BRAKE_KEYS.map((key) => {
            const value = crane.brakeChecks[key] || "Within Limit";
            return (
              <div key={key} style={itemStyle}>
                <div style={labelStyle}>{key}</div>
                {editMode ? (
                  <select
                    value={value}
                    onChange={e => handleBrakeChange(key, e.target.value)}
                    style={{ ...inputStyle, color: "#000", background: "#fff" }}
                  >
                    <option value="Within Limit">Within Limit</option>
                    <option value="Outside Limit">Outside Limit</option>
                  </select>
                ) : (
                  <div style={{ fontSize: "16px", fontWeight: "500" }}>{value}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= 🕒 HISTORY SECTION UPGRADED ================= */}
      <div style={{ marginTop: "60px" }}>
        <h2 style={{ color: "#ffffff", borderBottom: "2px solid rgba(255,255,255,0.3)", paddingBottom: "10px", marginBottom: "20px" }}>
          🕒 Crane Update History
        </h2>

        {history.length === 0 ? (
          <p style={{ color: "#fff" }}>No history available</p>
        ) : (
          /* 2️⃣ रेस्पॉन्सिव ग्रिड: डेस्कटॉप पे 6, लैपटॉप पे 4, मोबाइल पे 1 */
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(calc(100% / 6 - 20px), 1fr))",
            gap: "20px",
            // रिस्पॉन्सिवनेस के लिए छोटा सा हैक: अगर स्क्रीन बहुत छोटी हो तो 100% विड्थ पर आ जाए
            style: {
              "@media (max-width: 1200px)": { gridTemplateColumns: "repeat(auto-fill, minmax(calc(100% / 4 - 20px), 1fr))" },
              "@media (max-width: 600px)": { gridTemplateColumns: "1fr" }
            }
          }}
          // शुद्ध इनलाइन रेस्पॉन्सिव अप्रोच (बेस्ट प्रैक्टिस फॉर विदाउट मीडिया क्वेरी फाइल)
          ref={(el) => {
            if (el) {
              const width = window.innerWidth;
              if (width < 600) {
                el.style.gridTemplateColumns = "1fr";
              } else if (width < 1300) {
                el.style.gridTemplateColumns = "repeat(auto-fill, minmax(22%, 1fr))"; // ~4 per row
              } else {
                el.style.gridTemplateColumns = "repeat(auto-fill, minmax(15%, 1fr))"; // ~6 per row
              }
            }
          }}
          >
            {history.map((h, index) => (
              /* 3️⃣ हर कार्ड का बैकग्राउंड कलर और टेक्स्ट वाइट सेट किया */
              <div 
                key={index} 
                style={{
                  background: historyColors[index % 6],
                  color: "white",
                  padding: "15px",
                  borderRadius: "12px",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
                  fontSize: "13px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: "5px", marginBottom: "10px" }}>
                    <div style={{ fontSize: "11px", opacity: 0.8 }}>{new Date(h.updatedAt).toLocaleDateString()}</div>
                    <div style={{ fontWeight: "bold", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      👤 {h.updatedBy || "Team"}
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: "10px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "bold", display: "block", color: "rgba(255,255,255,0.7)" }}>SAFETY</span>
                    <div>Hooter: {h.oldData?.safetyChecks?.craneHooter || "—"}</div>
                    <div>MH Limit: {h.oldData?.safetyChecks?.mhUpDownLimitSwitch || "—"}</div>
                    <div>AH Limit: {h.oldData?.safetyChecks?.ahUpDownLimitSwitch || "—"}</div>
                  </div>

                  <div>
                    <span style={{ fontSize: "11px", fontWeight: "bold", display: "block", color: "rgba(255,255,255,0.7)" }}>BRAKES</span>
                    <div>Main: {h.oldData?.brakeChecks?.mainHoistBrakeGap || "—"}</div>
                    <div>Aux: {h.oldData?.brakeChecks?.auxHoistBrakeGap || "—"}</div>
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