import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MotorCard from "../components/MotorCard";

const API = process.env.REACT_APP_API_URL;

function MotorsByBridle() {
  const { bridleNo } = useParams();
  const navigate = useNavigate();
  const [motors, setMotors] = useState([]);

  useEffect(() => {
    fetch(`${API}/motors/bridle/${bridleNo}`)
      .then((res) => res.json())
      .then((data) => setMotors(data))
      .catch(() => setMotors([]));
  }, [bridleNo]);

  return (
    <div style={{ padding: "30px" }}>
      <button onClick={() => navigate("/cgl/bridles")}>⬅ Back</button>

      <h2 style={{ marginTop: "20px" }}>
        Bridle {bridleNo} – Motors
      </h2>

      <div
        style={{
          marginTop: "30px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, 160px)",
          gap: "20px",
        }}
      >
        {motors.map((motor) => (
          <MotorCard key={motor._id} motor={motor} />
        ))}
      </div>
    </div>
  );
}

export default MotorsByBridle;
