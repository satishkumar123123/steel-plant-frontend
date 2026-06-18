import { useNavigate } from "react-router-dom";
import { useState } from "react";

function CCLDashboard() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  const boxStyle = (name, bgColor) => ({
    padding: "40px",
    borderRadius: "16px",
    fontSize: "20px",
    fontWeight: "bold",
    textAlign: "center",
    cursor: "pointer",
    backgroundColor: bgColor,
    transition: "all 0.25s ease",
    boxShadow:
      hovered === name
        ? "0 12px 25px rgba(0,0,0,0.3)"
        : "0 8px 18px rgba(0,0,0,0.2)",
    transform: hovered === name ? "scale(1.04)" : "scale(1)"
  });

  return (
    <div style={{ padding: "40px" }}>
      <button onClick={() => navigate("/")}>⬅ Back</button>

      <h2 style={{ marginTop: "30px" }}>Colour Coating Line</h2>

      <div
        style={{
          marginTop: "40px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "30px"
        }}
      >
        {/* Bridle */}
        <div
          style={boxStyle("bridle", "#ffe0b2")}
          onMouseEnter={() => setHovered("bridle")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => navigate("/ccl/bridles")}
        >
          Bridle
        </div>

        {/* Accumulator */}
        <div
          style={boxStyle("accumulator", "#e1f5fe")}
          onMouseEnter={() => setHovered("accumulator")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => navigate("/ccl/area/Accumulator")}
        >
          Accumulator
        </div>

        {/* Other */}
        <div
          style={boxStyle("other", "#f3e5f5")}
          onMouseEnter={() => setHovered("other")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => navigate("/ccl/area/Other")}
        >
          Other
        </div>

        {/* AC Details */}
        <div
          style={boxStyle("acs", "#dcedc8")}
          onMouseEnter={() => setHovered("acs")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => navigate("/ccl/acs")}
        >
          AC DETAILS
        </div>
      </div>
    </div>
  );
}

export default CCLDashboard;