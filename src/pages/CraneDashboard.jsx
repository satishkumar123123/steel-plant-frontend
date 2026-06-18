import { useNavigate } from "react-router-dom";
import { useState } from "react";

function CraneDashboard() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  const plants = [
    { name: "Pickling", color: "#ffe0b2", textColor: "#b71c1c" },
    { name: "CRM", color: "#e1f5fe", textColor: "#004d40" },
    { name: "CGL", color: "#e8f5e9", textColor: "#311b92" },
    { name: "CCL", color: "#fce4ec", textColor: "#ff6f00" },
    { name: "Dispatch", color: "#ede7f6", textColor: "#1a237e" },
    { name: "CRS", color: "#e0f7fa", textColor: "#880e4f" },
  ];

  const getHoverStyle = (name) =>
    hovered === name
      ? {
          transform: "scale(1.08)",
          boxShadow: "0 18px 35px rgba(0,0,0,0.35)",
          transition: "0.3s ease",
        }
      : {
          transition: "0.3s ease",
        };

  return (
    <div style={{ padding: "40px" }}>
      <button onClick={() => navigate("/")}>⬅ Back</button>

      <h2 style={{ marginTop: "30px" }}>Crane Details</h2>

      <div
        style={{
          marginTop: "40px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "30px",
        }}
      >
        {plants.map((p) => (
          <div
            key={p.name}
            style={{
              padding: "35px",
              borderRadius: "16px",
              backgroundColor: p.color,
              color: p.textColor,
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "20px",
              cursor: "pointer",
              boxShadow: "0 8px 18px rgba(0,0,0,0.2)",
              ...getHoverStyle(p.name),
            }}
            onMouseEnter={() => setHovered(p.name)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => navigate(`/crane/plant/${p.name}`)}  // ✅ FIXED ROUTE
          >
            {p.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CraneDashboard;