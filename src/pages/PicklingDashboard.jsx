import { useNavigate } from "react-router-dom";
import { useState } from "react";

function PicklingDashboard() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  const boxStyle = (name, bgColor) => ({
    padding: "40px",
    borderRadius: "16px",
    fontSize: "22px",
    fontWeight: "bold",
    textAlign: "center",
    cursor: "pointer",
    backgroundColor: bgColor,
    transition: "all 0.25s ease",
    boxShadow:
      hovered === name
        ? "0 12px 25px rgba(0,0,0,0.3)"
        : "0 8px 18px rgba(0,0,0,0.2)",
    transform: hovered === name ? "scale(1.05)" : "scale(1)"
  });

  return (
    <div style={{ padding: "40px" }}>
      <button onClick={() => navigate("/")}>⬅ Back</button>

      <h2 style={{ marginTop: "30px" }}>Pickling Line</h2>

      <div
        style={{
          marginTop: "40px",
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "40px"
        }}
      >
        {/* HRs Motor */}
        <div
          style={boxStyle("hrs", "#ffe0b2")}
          onMouseEnter={() => setHovered("hrs")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => navigate("/pickling/area/HRs Motor")}
        >
          <span style={{ color: "#d32f2f" }}>HRs</span>{" "}
          <span style={{ color: "#37474f" }}>Motor</span>
        </div>

        {/* Pickling Motor */}
        <div
          style={boxStyle("pickling", "#e1f5fe")}
          onMouseEnter={() => setHovered("pickling")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => navigate("/pickling/area/Pickling Motor")}
        >
          <span style={{ color: "#880e4f" }}>Pickling</span>{" "}
          <span style={{ color: "#0277bd" }}>Motor</span>
        </div>

        {/* AC Details */}
        <div
          style={boxStyle("acs", "#f8bbd0")}
          onMouseEnter={() => setHovered("acs")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => navigate("/pickling/acs")}
        >
          AC DETAILS
        </div>
      </div>
    </div>
  );
}

export default PicklingDashboard;