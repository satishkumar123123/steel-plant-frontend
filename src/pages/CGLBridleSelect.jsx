import { useNavigate } from "react-router-dom";

function CGLBridleSelect() {
  const navigate = useNavigate();

  const bridles = [1,2,3,4,5,6,7,8,9,10];

  // 🎨 Different attractive gradients
  const colors = [
    "linear-gradient(135deg,#ff9a9e,#fad0c4)",
    "linear-gradient(135deg,#a18cd1,#fbc2eb)",
    "linear-gradient(135deg,#f6d365,#fda085)",
    "linear-gradient(135deg,#84fab0,#8fd3f4)",
    "linear-gradient(135deg,#fccb90,#d57eeb)",
    "linear-gradient(135deg,#30cfd0,#330867)",
    "linear-gradient(135deg,#5f2c82,#49a09d)",
    "linear-gradient(135deg,#ff758c,#ff7eb3)",
    "linear-gradient(135deg,#43e97b,#38f9d7)",
    "linear-gradient(135deg,#fa709a,#fee140)"
  ];

  return (
    <div style={{ padding: "40px" }}>
      <button onClick={() => navigate("/cgl")}>⬅ Back</button>

      <h2 style={{ marginTop: "20px", fontSize: "28px" }}>
        🎯 CGL - Select Bridle
      </h2>

      <div
        style={{
          marginTop: "40px",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
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
            onClick={() => navigate(`/cgl/bridle/${b}`)}
          >
            Bridle {b}
          </div>
        ))}

        {/* 🔥 HOT BRIDLE SPECIAL DESIGN */}
        <div
          style={{
            padding: "35px",
            borderRadius: "18px",
            background: "linear-gradient(135deg,#ff0000,#ff7300)",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "20px",
            cursor: "pointer",
            color: "#fff",
            boxShadow: "0 10px 30px rgba(255,0,0,0.6)",
            transition: "0.3s"
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.1)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "scale(1)")
          }
          onClick={() => navigate(`/cgl/bridle/HBr`)}
        >
          🔥 Hot Bridle (HBr)
        </div>

      </div>
    </div>
  );
}

export default CGLBridleSelect;