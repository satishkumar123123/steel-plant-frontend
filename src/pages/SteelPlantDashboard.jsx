import { useNavigate } from "react-router-dom";
import { useState } from "react";

function SteelPlantDashboard() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  const getHoverStyle = (name) =>
    hovered === name
      ? {
          transform: "scale(1.08) translateY(-5px)",
          transition: "all 0.4s ease",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
          backgroundImage:
            "linear-gradient(135deg, rgba(255,255,255,0.5), rgba(255,255,255,0.1))",
        }
      : {
          transition: "all 0.4s ease",
        };

  const items = [
    {
      name: "cgl",
      content: (
        <>
          <span style={{ color: "#880e4f" }}>Continuous </span>
          <span style={{ color: "#bf360c" }}>Galvanizing </span>
          <span style={{ color: "#37474f" }}>Line</span>
        </>
      ),
      color: "#ffcc80",
      path: "/cgl",
    },
    {
      name: "crm",
      content: (
        <>
          <span style={{ color: "#880e4f" }}>Cold </span>
          <span style={{ color: "#0277bd" }}>Rolling </span>
          <span style={{ color: "#37474f" }}>Mill</span>
        </>
      ),
      color: "#81d4fa",
      path: "/crm",
    },
    {
      name: "ccl",
      content: (
        <>
          <span style={{ color: "#880e4f" }}>Colour </span>
          <span style={{ color: "#28a745" }}>Coating </span>
          <span style={{ color: "#37474f" }}>Line</span>
        </>
      ),
      color: "#a5d6a7",
      path: "/ccl",
    },
    {
      name: "pickling",
      content: (
        <>
          <span style={{ color: "#880e4f" }}>Pickling </span>
          <span style={{ color: "#37474f" }}>Line</span>
        </>
      ),
      color: "#f8bbd0",
      path: "/pickling",
    },
    {
      name: "crane",
      content: (
        <>
          <span style={{ color: "#512da8" }}>Crane </span>
          <span style={{ color: "#37474f" }}>Details</span>
        </>
      ),
      color: "#b39ddb",
      path: "/crane",
      small: true,
    },
    {
      name: "safety",
      content: (
        <>
          <span style={{ color: "#00695c" }}>Safety </span>
          <span style={{ color: "#37474f" }}>Details</span>
        </>
      ),
      color: "#9fe95e",
      path: "/safety",
      small: true,
    },
  ];

  return (
    <div
      style={{
        padding: "30px",
        background: "linear-gradient(to right, #f5f7fa, #e4edf5)",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          marginBottom: "40px",
          borderBottom: "3px solid #1976d2",
          paddingBottom: "10px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "28px", margin: 0 }}>
          <span style={{ color: "#d32f2f" }}>APOLLO</span>{" "}
          <span style={{ color: "#1976d2" }}>BUILDINGS</span>{" "}
          <span style={{ color: "#388e3c" }}>PRODUCTS</span>{" "}
          <span style={{ color: "#000" }}>LIMITED</span>
        </h1>

        <div style={{ fontSize: "16px", color: "#880e4f", marginTop: "4px" }}>
          (Wider Electrical)
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "25px",
        }}
      >
        {items.map((item) => (
          <div
            key={item.name}
            style={{
              ...(item.small ? smallCardStyle : cardStyle),
              backgroundColor: item.color,
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.3)",
              ...getHoverStyle(item.name),
              fontSize: item.small ? "20px" : "22px",
            }}
            onMouseEnter={() => setHovered(item.name)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => navigate(item.path)}
          >
            {item.content}
          </div>
        ))}
      </div>
    </div>
  );
}

const cardStyle = {
  padding: "50px",
  borderRadius: "16px",
  textAlign: "center",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 6px 14px rgba(0,0,0,0.2)",
};

const smallCardStyle = {
  padding: "40px",
  borderRadius: "14px",
  textAlign: "center",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
};

export default SteelPlantDashboard;