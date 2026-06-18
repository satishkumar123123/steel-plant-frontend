import { useNavigate } from "react-router-dom";

function CCLBridleSelect() {
  const navigate = useNavigate();

  const bridles = [1, 2, 3, 4, 5];

  // 🎨 Better gradients (same style as CGL)
  const colors = [
    "linear-gradient(135deg,#ff9a9e,#fad0c4)",
    "linear-gradient(135deg,#a18cd1,#fbc2eb)",
    "linear-gradient(135deg,#f6d365,#fda085)",
    "linear-gradient(135deg,#84fab0,#8fd3f4)",
    "linear-gradient(135deg,#fccb90,#d57eeb)"
  ];

  return (
    <div style={{ padding: "40px" }}>
      <button onClick={() => navigate("/ccl")}>⬅ Back</button>

      <h2 style={{ marginTop: "20px", fontSize: "28px" }}>
        🎯 CCL - Select Bridle
      </h2>

      <div
        style={{
          marginTop: "40px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "25px"
        }}
      >
        {bridles.map((b, index) => (
          <div
            key={b}
            style={{
              padding: "35px",
              borderRadius: "18px",
              background: colors[index],
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "20px",
              cursor: "pointer",
              color: "#fff",
              boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
              transition: "0.3s"
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.08)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
            onClick={() => navigate(`/ccl/bridle/${b}`)}
          >
            Bridle {b}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CCLBridleSelect;