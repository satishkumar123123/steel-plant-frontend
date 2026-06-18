import { useNavigate } from "react-router-dom";

function LaggingIndicator() {
  const navigate = useNavigate();

  const items = [
    { name: "FAC", color: "#64b5f6", route: "/safety/lagging/fac" },
    { name: "MTI", color: "#ff8a65", route: "/safety/lagging/mti" },
    { name: "LTI", color: "#e57373", route: "/safety/lagging/lti" },
    { name: "Unsafe Act / Condition (Raised)", color: "#ef5350", route: "/safety/lagging/unsaferaised" }
  ];

  return (
    <div style={{ padding: "40px" }}>
      <button onClick={() => navigate("/safety")}>⬅ Back</button>

      <h2 style={{ marginTop: "20px" }}>Lagging Indicator</h2>

      <div
        style={{
          marginTop: "30px",
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "25px",
        }}
      >
        {items.map((item) => (
          <div
            key={item.name}
            style={{
              padding: "30px",
              borderRadius: "14px",
              backgroundColor: item.color,
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
              cursor: "pointer",
              boxShadow: "0 6px 14px rgba(0,0,0,0.2)"
            }}
            onClick={() => navigate(item.route)}
          >
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default LaggingIndicator;