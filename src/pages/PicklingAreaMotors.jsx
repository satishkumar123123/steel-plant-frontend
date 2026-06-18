import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MotorCard from "../components/MotorCard";

const API = process.env.REACT_APP_API_URL;

function PicklingAreaMotors() {
  const { area } = useParams();
  const navigate = useNavigate();
  const [motors, setMotors] = useState([]);

  useEffect(() => {
    fetch(`${API}/motors/PICKLING/${encodeURIComponent(area)}`)
      .then(res => res.json())
      .then(data => setMotors(data));
  }, [area]);

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <button
        onClick={() => navigate("/pickling")}
        style={{
          padding: "8px 18px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          backgroundColor: "#444",
          color: "white",
          fontWeight: "600"
        }}
      >
        ⬅ Back
      </button>

      <h2
        style={{
          marginTop: "30px",
          fontSize: "32px",
          fontWeight: "800",
          letterSpacing: "1px"
        }}
      >
        {area}
      </h2>

      {/* 2 Column Professional Grid */}
      <div
        style={{
          marginTop: "40px",
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "35px"
        }}
      >
        {motors.map((motor) => (
          <MotorCard key={motor._id} motor={motor} />
        ))}
      </div>
    </div>
  );
}

export default PicklingAreaMotors;