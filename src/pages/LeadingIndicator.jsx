import { useNavigate } from "react-router-dom";

function LeadingIndicator() {
  const navigate = useNavigate();

  const items = [
    { name: "Training", color: "#ba68c8", route: "/safety/leading/training" },
    { name: "Near Miss Incident Report", color: "#ffb74d", route: "/safety/leading/nearmiss" },
    { name: "Safety Walk Report", color: "#4db6ac", route: "/safety/leading/safetywalk" },
    { name: "Unsafe Act / Condition (Closed)", color: "#81c784", route: "/safety/leading/unsafeclosed" }
  ];

  return (
    <div style={{ padding: "40px" }}>
      <button onClick={() => navigate("/safety")}>⬅ Back</button>

      <h2 style={{ marginTop: "20px" }}>Leading Indicator</h2>

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

export default LeadingIndicator;