import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL;

function ACList({ plant }) {
  const navigate = useNavigate();

  const [acs, setAcs] = useState([]);

  useEffect(() => {
    fetch(`${API}/acs/${plant}`)
      .then((res) => res.json())
      .then((data) => setAcs(data))
      .catch((err) => console.error(err));
  }, [plant]);

  const cardColors = [
    "linear-gradient(135deg, #667eea, #764ba2)",
    "linear-gradient(135deg, #ff6a88, #ff99ac)",
    "linear-gradient(135deg, #43cea2, #185a9d)",
    "linear-gradient(135deg, #f7971e, #ffd200)",
    "linear-gradient(135deg, #00c6ff, #0072ff)",
    "linear-gradient(135deg, #fc466b, #3f5efb)"
  ];

  const getCardColor = (index) => {
    return cardColors[index % cardColors.length];
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "30px",
        background: "linear-gradient(135deg,#e3f2fd,#ffffff)"
      }}
    >
      <button
        onClick={() => navigate(-1)}
        style={{
          padding: "8px 16px",
          border: "none",
          borderRadius: "8px",
          background: "#1565c0",
          color: "white",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        ⬅ Back
      </button>

      <h2
        style={{
          marginTop: "20px",
          marginBottom: "20px",
          color: "#1565c0",
          textAlign: "center",
          fontSize: "28px"
        }}
      >
        ❄ {plant} AC Details
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "15px"
        }}
      >
        {acs.map((ac, index) => (
          <div
            key={ac._id}
            onClick={() => navigate(`/ac-detail/${ac._id}`)}
            style={{
              background: getCardColor(index),
              color: "#fff",
              padding: "12px 18px",
              borderRadius: "14px",
              cursor: "pointer",
              boxShadow: "0 8px 18px rgba(0,0,0,0.20)",
              transition: "all 0.3s ease",
              minHeight: "130px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow =
                "0 12px 24px rgba(0,0,0,0.30)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 8px 18px rgba(0,0,0,0.20)";
            }}
          >
            <h3
              style={{
                textAlign: "center",
                marginBottom: "10px",
                fontSize: "20px",
                marginTop: 0
              }}
            >
              ❄ {ac.acNo}
            </h3>

            <p style={{ margin: "3px 0" }}>
              <b>Brand:</b> {ac.brand}
            </p>

            <p style={{ margin: "3px 0" }}>
              <b>Serial:</b> {ac.serialNo}
            </p>

            <p style={{ margin: "3px 0" }}>
              <b>Capacity:</b> {ac.capacityTon} Ton
            </p>

            <p style={{ margin: "3px 0" }}>
              <b>Location:</b> {ac.location}
            </p>

            <p style={{ margin: "3px 0" }}>
              <b>Status:</b> {ac.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ACList;