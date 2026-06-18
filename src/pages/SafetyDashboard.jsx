import { useNavigate } from "react-router-dom";

function SafetyDashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "40px" }}>
      <button onClick={() => navigate("/")}>⬅ Back</button>

      <h1 style={{ marginTop: "30px", fontSize: "32px" }}>
        <span style={{ color: "#d32f2f" }}>SAFETY</span>{" "}
        <span style={{ color: "#37474f" }}>DETAILS</span>
      </h1>

      <div
        style={{
          marginTop: "40px",
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "30px",
        }}
      >
        <div
          style={{ ...boxStyle, background: "linear-gradient(135deg,#00c9a7,#92fe9d)" }}
          onClick={() => navigate("/safety/leading")}
        >
          🟢 Leading Indicator
        </div>

        <div
          style={{ ...boxStyle, background: "linear-gradient(135deg,#ff512f,#dd2476)" }}
          onClick={() => navigate("/safety/lagging")}
        >
          🔴 Lagging Indicator
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
  color: "white",
  boxShadow: "0 8px 18px rgba(0,0,0,0.2)",
  transition: "0.3s",
};

export default SafetyDashboard;