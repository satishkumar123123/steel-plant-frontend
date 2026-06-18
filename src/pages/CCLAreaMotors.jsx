import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MotorCard from "../components/MotorCard";

const API = process.env.REACT_APP_API_URL;

function CCLAreaMotors() {
  const { area } = useParams();
  const navigate = useNavigate();
  const [motors, setMotors] = useState([]);

  useEffect(() => {
    fetch(`${API}/motors/CCL/${area}`)
      .then(res => res.json())
      .then(data => setMotors(data));
  }, [area]);

  // Colors for Motor A and B
  const motorColors = {
    "1A": "#e1f5fe", // Light Blue
    "1B": "#ffe0b2", // Soft Orange
    "2A": "#c8e6c9", // Light Green
    "2B": "#f8bbd0", // Soft Pink
    "3A": "#ede7f6", // Lavender
    "3B": "#d1c4e9", // Purple shade
    // aur motors ke liye yahan aur colors add kar sakte ho
  };

  return (
    <div style={{ padding: "40px" }}>
      <button onClick={() => navigate("/ccl")}>⬅ Back</button>

      <h2 style={{ marginTop: "20px" }}>{area}</h2>

      <div
        style={{
          marginTop: "30px",
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "25px"
        }}
      >
        {motors.map((motor, index) => (
          <div
            key={motor._id}
            style={{
              backgroundColor: motorColors[motor.motorName] || "#ffffff",
              borderRadius: "12px",
              padding: "15px",
              boxShadow: "0 6px 14px rgba(0,0,0,0.2)"
            }}
          >
            <MotorCard motor={motor} area={area} index={index} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default CCLAreaMotors; 