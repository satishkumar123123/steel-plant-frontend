import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MotorCard from "../components/MotorCard";

const API = process.env.REACT_APP_API_URL;

// 🔥 Dynamic Color Function
const getColor = (name = "") => {
  const n = name.toLowerCase();

  if (n.includes("mill"))
    return "linear-gradient(135deg,#ff512f,#dd2476)";

  if (n.includes("dtr"))
    return "linear-gradient(135deg,#36d1dc,#5b86e5)";

  if (n.includes("etr"))
    return "linear-gradient(135deg,#00c9a7,#92fe9d)";

  if (n.includes("por"))
    return "linear-gradient(135deg,#f7971e,#ffd200)";

  return "#e3f2fd";
};

function CRMMotorPage() {
  const navigate = useNavigate();

  const [motors, setMotors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/motors/CRM/${encodeURIComponent("CRM Motor")}`)
      .then((res) => res.json())
      .then((data) => {
        setMotors(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching motors:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      
      {/* 🔥 COLORFUL BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        style={{
          padding: "10px 18px",
          borderRadius: "12px",
          border: "none",
          cursor: "pointer",
          marginBottom: "15px",
          fontWeight: "bold",
          fontSize: "14px",
          color: "#fff",
          background: "linear-gradient(135deg,#667eea,#764ba2)",
          boxShadow: "0 6px 15px rgba(0,0,0,0.3)",
          transition: "all 0.3s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.08)";
          e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 6px 15px rgba(0,0,0,0.3)";
        }}
      >
        ⬅ Back
      </button>

      <h2 style={{ marginTop: "10px" }}>CRM Motors</h2>

      {/* 🔄 Loading State */}
      {loading ? (
        <p>Loading motors...</p>
      ) : (
        <div
          style={{
            marginTop: "30px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "25px",
          }}
        >
          {motors.map((motor) => (
            <div
              key={motor._id}
              style={{
                background: getColor(motor.name),
                borderRadius: "12px",
                padding: "15px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                transition: "0.3s"
              }}
            >
              <MotorCard motor={motor} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CRMMotorPage;