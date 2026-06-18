import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MotorCard from "../components/MotorCard";

const API = process.env.REACT_APP_API_URL;

function CCLMotors() {
  const { bridleNo } = useParams();
  const navigate = useNavigate();
  const [motors, setMotors] = useState([]);

  useEffect(() => {
    fetch(`${API}/motors/CCL/Bridle/${bridleNo}`)
      .then(res => res.json())
      .then(data => setMotors(data));
  }, [bridleNo]);

  return (
    <div style={{ padding: "40px" }}>
      <button onClick={() => navigate("/ccl/bridles")}>⬅ Back</button>

      <h2 style={{ marginTop: "20px" }}>
        Bridle {bridleNo}
      </h2>

      <div
        style={{
          marginTop: "30px",
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "25px",
        }}
      >
        {motors.map(motor => (
          <MotorCard key={motor._id} motor={motor} />
        ))}
      </div>
    </div>
  );
}

export default CCLMotors;