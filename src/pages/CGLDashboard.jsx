import { useNavigate } from "react-router-dom";
import { useState } from "react";

function CGLDashboard() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ padding: "40px" }}>
      <button onClick={() => navigate("/")}>⬅ Back</button>

      {/* ===== HEADING ===== */}
      <h1 style={{ marginTop: "30px", fontSize: "32px" }}>
        <span style={{ color: "#e65100" }}>CGL</span>{" "}
        <span style={{ color: "#37474f" }}>MOTORS</span>
      </h1>

      {/* ===== SUB SECTIONS ===== */}
      <div
        style={{
          marginTop: "40px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "30px",
        }}
      >
        {/* Furnace */}
        <div
          style={{
            ...boxStyle,
            backgroundColor: "#ffccbc",
            transform:
              hovered === "furnace"
                ? "scale(1.05) translateY(-5px)"
                : "scale(1)",
            boxShadow:
              hovered === "furnace"
                ? "0 15px 30px rgba(0,0,0,0.3)"
                : "0 8px 18px rgba(0,0,0,0.2)",
            transition: "0.3s",
          }}
          onMouseEnter={() => setHovered("furnace")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => navigate("/cgl/area/Furnace Motor")}
        >
          <span style={{ color: "#bf360c" }}>FURNACE</span>{" "}
          <span style={{ color: "#37474f" }}>MOTORS</span>
          <p style={smallText}>Heating Section</p>
        </div>

        {/* Accumulator */}
        <div
          style={{
            ...boxStyle,
            backgroundColor: "#d1c4e9",
            transform:
              hovered === "accumulator"
                ? "scale(1.05) translateY(-5px)"
                : "scale(1)",
            boxShadow:
              hovered === "accumulator"
                ? "0 15px 30px rgba(0,0,0,0.3)"
                : "0 8px 18px rgba(0,0,0,0.2)",
            transition: "0.3s",
          }}
          onMouseEnter={() => setHovered("accumulator")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => navigate("/cgl/area/Accumulator Motor")}
        >
          <span style={{ color: "#4527a0" }}>ACCUMULATOR</span>{" "}
          <span style={{ color: "#37474f" }}>MOTORS</span>
          <p style={smallText}>Strip Storage</p>
        </div>

        {/* Bridle */}
        <div
          style={{
            ...boxStyle,
            backgroundColor: "#bbdefb",
            transform:
              hovered === "bridle"
                ? "scale(1.05) translateY(-5px)"
                : "scale(1)",
            boxShadow:
              hovered === "bridle"
                ? "0 15px 30px rgba(0,0,0,0.3)"
                : "0 8px 18px rgba(0,0,0,0.2)",
            transition: "0.3s",
          }}
          onMouseEnter={() => setHovered("bridle")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => navigate("/cgl/bridles")}
        >
          <span style={{ color: "#0d47a1" }}>BRIDLE</span>{" "}
          <span style={{ color: "#37474f" }}>MOTORS</span>
          <p style={smallText}>Speed Control Section</p>
        </div>

        {/* AC Details */}
        <div
          style={{
            ...boxStyle,
            backgroundColor: "#b2dfdb",
            transform:
              hovered === "acs"
                ? "scale(1.05) translateY(-5px)"
                : "scale(1)",
            boxShadow:
              hovered === "acs"
                ? "0 15px 30px rgba(0,0,0,0.3)"
                : "0 8px 18px rgba(0,0,0,0.2)",
            transition: "0.3s",
          }}
          onMouseEnter={() => setHovered("acs")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => navigate("/cgl/acs")}
        >
          <span style={{ color: "#00695c" }}>AC</span>{" "}
          <span style={{ color: "#37474f" }}>DETAILS</span>
          <p style={smallText}>Air Conditioning System</p>
        </div>
      </div>
    </div>
  );
}

const boxStyle = {
  padding: "40px",
  borderRadius: "18px",
  fontSize: "22px",
  fontWeight: "bold",
  textAlign: "center",
  cursor: "pointer",
  boxShadow: "0 8px 18px rgba(0,0,0,0.2)",
};

const smallText = {
  fontSize: "14px",
  marginTop: "10px",
  fontWeight: "normal",
  color: "#333",
};

export default CGLDashboard;