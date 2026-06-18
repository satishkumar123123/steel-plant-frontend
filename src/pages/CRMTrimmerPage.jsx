import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // ✅ add
import MotorCard from "../components/MotorCard";

const API = process.env.REACT_APP_API_URL;

// 🔥 Tumhara exact function
const getColor = (name) => {
  if (name === "Recoiler")
    return "linear-gradient(135deg,#ff6a00,#ee0979)";

  if (name === "Uncoiler")
    return "linear-gradient(135deg,#2193b0,#6dd5ed)";

  return "#e3f2fd";
};

function CRMTrimmerPage() {
  const { area } = useParams();
  const navigate = useNavigate(); // ✅ add

  const [motors, setMotors] = useState([]);

  useEffect(() => {
    fetch(`${API}/motors/CRM/${encodeURIComponent(area)}`)
      .then((res) => res.json())
      .then((data) => setMotors(data))
      .catch((err) => console.error(err));
  }, [area]);

  return (
    <div style={{ padding: "40px" }}>
      
      {/* 🔥 COLORFUL BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        style={{
          padding: "10px 18px",
          borderRadius: "10px",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
          color: "#fff",
          background: "linear-gradient(135deg,#667eea,#764ba2)",
          boxShadow: "0 6px 14px rgba(0,0,0,0.3)",
          transition: "0.3s"
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.transform = "scale(1.08)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.transform = "scale(1)")
        }
      >
        ⬅ Back
      </button>

      <h2 style={{ marginTop: "20px" }}>{area}</h2>

      <div
        style={{
          marginTop: "30px",
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "25px",
        }}
      >
        {motors.map((motor) => (
          <div
            key={motor._id}
            style={{
              background: getColor(area),
              borderRadius: "12px",
              padding: "15px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            }}
          >
            <MotorCard motor={motor} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default CRMTrimmerPage;