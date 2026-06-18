import { useNavigate } from "react-router-dom";

function MotorCard({ motor, area, index }) {
  const navigate = useNavigate();

  let bgColor = "#e8f5e9";
  let textColor = "black";

  const areaName = area?.toLowerCase() || "";

  // ✅ UNIVERSAL LABEL
  const motorLabel = (
    motor.position ||
    motor.motorName ||
    motor.name ||
    ""
  )
    .toString()
    .toUpperCase()
    .trim();

  /* ===== 🔥 PROCESS MOTORS (NEW LOGIC) ===== */
  if (motorLabel.includes("UNCOILER")) {
    bgColor = "linear-gradient(135deg, #00c6ff, #0072ff)"; // blue
    textColor = "white";
  }
  else if (motorLabel.includes("RECOILER")) {
    bgColor = "linear-gradient(135deg, #f7971e, #ffd200)"; // yellow/orange
    textColor = "black";
  }
  else if (motorLabel.includes("LEVELER")) {
    bgColor = "linear-gradient(135deg, #56ab2f, #a8e063)"; // green
    textColor = "black";
  }

  /* ===== BRIDLE A/B ===== */
  else if (motorLabel.endsWith("A")) {
    bgColor = "linear-gradient(135deg, #2193b0, #6dd5ed)";
    textColor = "white";
  } 
  else if (motorLabel.endsWith("B")) {
    bgColor = "linear-gradient(135deg, #ff7e5f, #feb47b)";
    textColor = "white";
  }

  /* ===== FURNACE ===== */
  else if (areaName.includes("furnace")) {
    const furnaceColors = [
      "linear-gradient(135deg,#ff512f,#dd2476)",
      "linear-gradient(135deg,#ff9966,#ff5e62)",
      "linear-gradient(135deg,#f7971e,#ffd200)"
    ];
    bgColor = furnaceColors[index % 3];
    textColor = "white";
  }

  /* ===== ACCUMULATOR ===== */
  else if (areaName.includes("accumulator")) {
    const accColors = [
      "linear-gradient(135deg,#00c9a7,#92fe9d)",
      "linear-gradient(135deg,#36d1dc,#5b86e5)"
    ];
    bgColor = accColors[index % 2];
  }

  /* ===== STATUS OVERRIDE ===== */
  if (motor.status === "Breakdown") {
    bgColor = "#ffebee";
    textColor = "black";
  }
  if (motor.status === "Due") {
    bgColor = "#fff3e0";
    textColor = "black";
  }

  const displayName = motorLabel || "Motor";

  return (
    <div
      style={{
        padding: "25px",
        borderRadius: "16px",
        background: bgColor,
        color: textColor,
        cursor: "pointer",
        boxShadow: "0 8px 18px rgba(0,0,0,0.2)",
        transition: "0.3s"
      }}
      onClick={() => navigate(`/motor/${motor._id}`)}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <h3 style={{ marginBottom: "10px" }}>
        {displayName}
      </h3>

      <p><b>Serial:</b> {motor.serialNo}</p>
      <p><b>Power:</b> {motor.powerKW} kW</p>
      <p><b>RPM:</b> {motor.rpm}</p>
      <p><b>Status:</b> {motor.status}</p>
    </div>
  );
}

export default MotorCard;