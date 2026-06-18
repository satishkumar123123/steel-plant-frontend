import { useNavigate } from "react-router-dom";
import { useState } from "react";

function CRMDashboard() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  const boxStyle = {
    padding: "40px",
    borderRadius: "16px",
    fontSize: "20px",
    fontWeight: "bold",
    textAlign: "center",
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(0,0,0,0.2)",
    transition: "0.3s"
  };

  return (
    <div style={{ padding: "40px" }}>
      <button onClick={() => navigate("/")}>⬅ Back</button>

      <h2
        style={{
          marginTop: "30px",
          fontSize: "36px",
          fontWeight: "800",
          letterSpacing: "2px"
        }}
      >
        <span style={{ color: "#ff5722" }}>CRM</span>{" "}
        <span style={{ color: "#1976d2" }}>MOTORS</span>
      </h2>

      <div
        style={{
          marginTop: "40px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "30px"
        }}
      >
        {/* CRM Motor */}
        <div
          style={{
            ...boxStyle,
            backgroundColor: "#ffe0b2",
            transform:
              hovered === "crm"
                ? "scale(1.05) translateY(-6px)"
                : "scale(1)",
            boxShadow:
              hovered === "crm"
                ? "0 15px 30px rgba(0,0,0,0.3)"
                : "0 8px 18px rgba(0,0,0,0.2)"
          }}
          onMouseEnter={() => setHovered("crm")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => navigate("/crm/motor")}
        >
          <span style={{ color: "#d84315" }}>CRM</span>{" "}
          <span style={{ color: "#1565c0" }}>Motor</span>
        </div>

        {/* Trimmer 1 */}
        <div
          style={{
            ...boxStyle,
            backgroundColor: "#e1f5fe",
            transform:
              hovered === "trim1"
                ? "scale(1.05) translateY(-6px)"
                : "scale(1)",
            boxShadow:
              hovered === "trim1"
                ? "0 15px 30px rgba(0,0,0,0.3)"
                : "0 8px 18px rgba(0,0,0,0.2)"
          }}
          onMouseEnter={() => setHovered("trim1")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => navigate("/crm/trimmer/Trimmer 1")}
        >
          <span style={{ color: "#6a1b9a" }}>Trimmer</span>{" "}
          <span style={{ color: "#2e7d32" }}>1</span>
        </div>

        {/* Trimmer 2 */}
        <div
          style={{
            ...boxStyle,
            backgroundColor: "#f3e5f5",
            transform:
              hovered === "trim2"
                ? "scale(1.05) translateY(-6px)"
                : "scale(1)",
            boxShadow:
              hovered === "trim2"
                ? "0 15px 30px rgba(0,0,0,0.3)"
                : "0 8px 18px rgba(0,0,0,0.2)"
          }}
          onMouseEnter={() => setHovered("trim2")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => navigate("/crm/trimmer/Trimmer 2")}
        >
          <span style={{ color: "#8e24aa" }}>Trimmer</span>{" "}
          <span style={{ color: "#c62828" }}>2</span>
        </div>

        {/* AC Details */}
        <div
          style={{
            ...boxStyle,
            backgroundColor: "#ffe0b2",
            transform:
              hovered === "acs"
                ? "scale(1.05) translateY(-6px)"
                : "scale(1)",
            boxShadow:
              hovered === "acs"
                ? "0 15px 30px rgba(0,0,0,0.3)"
                : "0 8px 18px rgba(0,0,0,0.2)"
          }}
          onMouseEnter={() => setHovered("acs")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => navigate("/crm/acs")}
        >
          <span style={{ color: "#00695c" }}>AC</span>{" "}
          <span style={{ color: "#37474f" }}>DETAILS</span>
        </div>
      </div>
    </div>
  );
}

export default CRMDashboard;