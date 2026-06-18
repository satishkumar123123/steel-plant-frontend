import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MotorCard from "../components/MotorCard";

const API = process.env.REACT_APP_API_URL;

function CGLAreaMotors() {
  const { area } = useParams();
  const navigate = useNavigate();
  const [motors, setMotors] = useState([]);

  useEffect(() => {
    fetch(`${API}/motors/CGL/${area}`)
      .then(res => res.json())
      .then(data => setMotors(data));
  }, [area]);

  return (
    <div style={{ padding: "40px" }}>
      <button onClick={() => navigate("/cgl")}>⬅ Back</button>

      <h2 style={{ marginTop: "20px" }}>
        {area}
      </h2>

      <div
        style={{
          marginTop: "30px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "25px"
        }}
      >
        {motors.map((motor, index) => (
          <MotorCard
            key={motor._id}
            motor={motor}
            area={area}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

export default CGLAreaMotors;