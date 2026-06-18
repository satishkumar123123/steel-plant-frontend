import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MotorCard from "../components/MotorCard";

const API = process.env.REACT_APP_API_URL;

function CGLMotors() {
  const { bridleNo } = useParams();
  const navigate = useNavigate();
  const [motors, setMotors] = useState([]);

  useEffect(() => {
    fetch(`${API}/motors/CGL/Bridle/${bridleNo}`)
      .then((res) => res.json())
      .then((data) => setMotors(data));
  }, [bridleNo]);

  return (
    <div style={{ padding: "40px" }}>
      <button onClick={() => navigate("/cgl/bridles")}>
        ⬅ Back
      </button>

      <h2 style={{ marginTop: "20px" }}>
        Bridle {bridleNo} Motors
      </h2>

      <div
        style={{
          marginTop: "30px",
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "25px",
        }}
      >
        {motors.map((motor, index) => (
          <MotorCard
            key={motor._id}
            motor={motor}
            area="Bridle"
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

export default CGLMotors;